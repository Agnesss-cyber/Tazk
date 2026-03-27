using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tazk.Data;
using Tazk.DTOs;
using Tazk.Models;


namespace Tazk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvitationsController : ControllerBase
    {
        private readonly TazkDbContext _db;

        public InvitationsController(TazkDbContext db)
        {
            _db = db;
        }

        // GET api/invitations/workspace/{workspaceId}
        [HttpGet("workspace/{workspaceId}")]
        public async Task<IActionResult> GetByWorkspace(int workspaceId)
        {
            var invitations = await _db.WorkspaceInvitations
                .Where(i => i.WorkspaceId == workspaceId)
                .Include(i => i.Workspace)
                .ToListAsync();

            return Ok(invitations);
        }

        // POST api/invitations
        [HttpPost]
        public async Task<IActionResult> Create(CreateInvitationDto dto)
        {
            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Id == dto.WorkspaceId);
            if (!workspaceExists) return BadRequest("Workspace not found.");

            // Prevent duplicate pending invites
            var existing = await _db.WorkspaceInvitations
                .FirstOrDefaultAsync(i => i.WorkspaceId == dto.WorkspaceId
                                       && i.Email == dto.Email
                                       && i.Status == InvitationStatus.Pending);

            if (existing != null) return Conflict("A pending invitation for this email already exists.");

            var workspace = await _db.Workspaces.FindAsync(dto.WorkspaceId);
            if (workspace == null) return BadRequest("Workspace not found while creating invitation.");

            var invitation = new WorkspaceInvitation
            {
                WorkspaceId = dto.WorkspaceId,
                Email = dto.Email,
                Status = InvitationStatus.Pending,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                Workspace = (await _db.Workspaces.FindAsync(dto.WorkspaceId))!
            };

            _db.WorkspaceInvitations.Add(invitation);
            var invitedUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (invitedUser != null)
            {
                _ = _db.Notifications.Add(new Notification
                {
                    UserId = invitedUser.Id,
             
                    Message = $"You have been invited to join \"{workspace.Name}\" workspace.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    User = invitedUser,

                });
            }
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByWorkspace), new { workspaceId = dto.WorkspaceId }, invitation);
        }

        // PUT api/invitations/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateInvitationStatusDto dto)
        {
            var invitation = await _db.WorkspaceInvitations
                .Include(i => i.Workspace)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invitation == null) return NotFound();
            if (invitation.ExpiresAt < DateTime.UtcNow) return BadRequest("Invitation has expired.");

            invitation.Status = dto.Status;

            // If accepted, add user as workspace member
            if (dto.Status == InvitationStatus.Accepted)
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == invitation.Email);
                if (user == null) return BadRequest("No account found for this email.");

                var alreadyMember = await _db.WorkspaceMembers
                    .AnyAsync(wm => wm.WorkspaceId == invitation.WorkspaceId && wm.UserId == user.Id);

                if (!alreadyMember)
                {
                    _db.WorkspaceMembers.Add(new WorkspaceMember
                    {
                        WorkspaceId = invitation.WorkspaceId,
                        UserId = user.Id,
                        Role = MemberRole.Member,
                        JoinedAt = DateTime.UtcNow,
                        Workspace = invitation.Workspace!,
                        User = user
                    });
                }
            }

            await _db.SaveChangesAsync();
            return Ok(invitation);
        }

        // DELETE api/invitations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var invitation = await _db.WorkspaceInvitations.FindAsync(id);
            if (invitation == null) return NotFound();

            _db.WorkspaceInvitations.Remove(invitation);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}