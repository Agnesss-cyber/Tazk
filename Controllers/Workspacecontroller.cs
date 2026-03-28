using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tazk.Data;
using Tazk.DTOs;
using Tazk.Models;

namespace Tazk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkspacesController : ControllerBase
    {
        private readonly TazkDbContext _db;

        public WorkspacesController(TazkDbContext db)
        {
            _db = db;
        }

        // GET api/workspaces
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var workspaces = await _db.Workspaces
                .Include(w => w.Owner)
                .Include(w => w.Members)
                .ToListAsync();

            return Ok(workspaces);
        }

        // GET api/workspaces/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var workspace = await _db.Workspaces
                .Include(w => w.Owner)
                .Include(w => w.Members).ThenInclude(m => m.User)
                .Include(w => w.Boards).ThenInclude(b => b.Columns)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (workspace == null) return NotFound();

            return Ok(workspace);
        }

        // POST api/workspaces
        [HttpPost]
        public async Task<IActionResult> Create(CreateWorkspaceDto dto)
        {
            var ownerExists = await _db.Users.AnyAsync(u => u.Id == dto.OwnerId);
            if (!ownerExists) return BadRequest("Owner user not found.");

            var workspace = new Workspace
            {
                Name = dto.Name,
                OwnerId = dto.OwnerId,
                Type = dto.Type,
                CreatedAt = DateTime.UtcNow
            };

            _db.Workspaces.Add(workspace);
            await _db.SaveChangesAsync();

            // Automatically add owner as manager member
            var member = new WorkspaceMember
            {
                WorkspaceId = workspace.Id,
                UserId = dto.OwnerId,
                Role = MemberRole.Manager,
                JoinedAt = DateTime.UtcNow,
                Workspace = workspace,
                User = (await _db.Users.FindAsync(dto.OwnerId))!
            };
            _db.WorkspaceMembers.Add(member);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = workspace.Id }, workspace);
        }

        // PUT api/workspaces/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateWorkspaceDto dto)
        {
            var workspace = await _db.Workspaces.FindAsync(id);
            if (workspace == null) return NotFound();

            if (dto.Name != null) workspace.Name = dto.Name;
            if (dto.Type.HasValue) workspace.Type = dto.Type.Value;

            await _db.SaveChangesAsync();
            return Ok(workspace);
        }

        // DELETE api/workspaces/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var workspace = await _db.Workspaces.FindAsync(id);
            if (workspace == null) return NotFound();


            // 1. Performance scores (reference tasks)
            // taskIds = _db.Tasks.Where(t => t.WorkspaceId == id).Select(t => t.Id);
            var taskIds = await _db.Tasks.Where(t => t.WorkspaceId == id).Select(t => (int?)t.Id).ToListAsync();
            var scores = _db.PerformanceScores.Where(ps => taskIds.Contains(ps.TaskId));
            _db.PerformanceScores.RemoveRange(scores);

            // 2. Notifications (reference tasks)
            var notifications = _db.Notifications.Where(n => taskIds.Contains(n.TaskId));
            _db.Notifications.RemoveRange(notifications);

            // 3. Tasks
            var tasks = _db.Tasks.Where(t => t.WorkspaceId == id);
            _db.Tasks.RemoveRange(tasks);

            // 4. Columns (reference boards)
            var boardIds = _db.Boards.Where(b => b.WorkspaceId == id).Select(b => b.Id);
            var columns = _db.Columns.Where(c => boardIds.Contains(c.BoardId));
            _db.Columns.RemoveRange(columns);

            // 5. Boards
            var boards = _db.Boards.Where(b => b.WorkspaceId == id);
            _db.Boards.RemoveRange(boards);

            // 6. Members, Invitations, Documents
            var members = _db.WorkspaceMembers.Where(wm => wm.WorkspaceId == id);
            _db.WorkspaceMembers.RemoveRange(members);

            var invitations = _db.WorkspaceInvitations.Where(i => i.WorkspaceId == id);
            _db.WorkspaceInvitations.RemoveRange(invitations);

            var documents = _db.WorkspaceDocuments.Where(d => d.WorkspaceId == id);
            _db.WorkspaceDocuments.RemoveRange(documents);

            // 7. Finally delete the workspace
            _db.Workspaces.Remove(workspace);

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET api/workspaces/{id}/members
        [HttpGet("{id}/members")]
        public async Task<IActionResult> GetMembers(int id)
        {
            var members = await _db.WorkspaceMembers
                .Where(wm => wm.WorkspaceId == id)
                .Include(wm => wm.User)
                .ToListAsync();

            return Ok(members);
        }

        // DELETE api/workspaces/{id}/members/{userId}
        [HttpDelete("{id}/members/{userId}")]
        public async Task<IActionResult> RemoveMember(int id, int userId)
        {
            var member = await _db.WorkspaceMembers
                .FirstOrDefaultAsync(wm => wm.WorkspaceId == id && wm.UserId == userId);

            if (member == null) return NotFound();

            _db.WorkspaceMembers.Remove(member);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // PUT api/workspaces/{id}/members/{userId}/role
        [HttpPut("{id}/members/{userId}/role")]
        public async Task<IActionResult> UpdateMemberRole(int id, int userId, UpdateMemberRoleDto dto)
        {
            var member = await _db.WorkspaceMembers
                .FirstOrDefaultAsync(wm => wm.WorkspaceId == id && wm.UserId == userId);

            if (member == null) return NotFound();

            member.Role = dto.Role;
            await _db.SaveChangesAsync();
            return Ok(member);
        }
    }
}