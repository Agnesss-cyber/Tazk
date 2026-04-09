using BCrypt.Net;
using HotChocolate;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Tazk.Data;
using Tazk.Models;
using Microsoft.Extensions.Configuration;

namespace Tazk.GraphQL.Mutations
{
    public class Mutation
    {
        // Workspace Mutations 

        public async Task<Workspace> CreateWorkspace(
            CreateWorkspaceInput input,
            TazkDbContext db)
        {
            var owner = await db.Users.FindAsync(input.OwnerId)
                ?? throw new GraphQLException("Owner user not found.");

            var workspace = new Workspace
            {
                Name = input.Name,
                OwnerId = input.OwnerId,
                Type = input.Type,
                CreatedAt = DateTime.UtcNow,
                Owner = owner
            };

            db.Workspaces.Add(workspace);
            await db.SaveChangesAsync();

            db.WorkspaceMembers.Add(new WorkspaceMember
            {
                WorkspaceId = workspace.Id,
                UserId = input.OwnerId,
                Role = MemberRole.Manager,
                JoinedAt = DateTime.UtcNow,
                Workspace = workspace,
                User = owner
            });
            await db.SaveChangesAsync();

            return workspace;
        }

        public async Task<Workspace> UpdateWorkspace(
            UpdateWorkspaceInput input,
            TazkDbContext db)
        {
            var workspace = await db.Workspaces.FindAsync(input.Id)
                ?? throw new GraphQLException("Workspace not found.");

            if (input.Name != null) workspace.Name = input.Name;
            if (input.Type.HasValue) workspace.Type = input.Type.Value;

            await db.SaveChangesAsync();
            return workspace;
        }

        public async Task<bool> DeleteWorkspace(int id, TazkDbContext db)
        {
            var workspace = await db.Workspaces.FindAsync(id)
                ?? throw new GraphQLException("Workspace not found.");

            db.Workspaces.Remove(workspace);
            await db.SaveChangesAsync();
            return true;
        }

        // Board Mutations 

        public async Task<Board> CreateBoard(
            CreateBoardInput input,
            TazkDbContext db)
        {
            var workspace = await db.Workspaces.FindAsync(input.WorkspaceId)
                ?? throw new GraphQLException("Workspace not found.");

            var board = new Board
            {
                Name = input.Name,
                WorkspaceId = input.WorkspaceId,
                IsDefault = input.IsDefault,
                Workspace = workspace
            };

            db.Boards.Add(board);
            await db.SaveChangesAsync();

            if (input.IsDefault)
            {
                db.Columns.AddRange(
                    new BoardColumn { BoardId = board.Id, Name = "To Do", Position = 1, Board = board },
                    new BoardColumn { BoardId = board.Id, Name = "In Progress", Position = 2, Board = board },
                    new BoardColumn { BoardId = board.Id, Name = "Done", Position = 3, Board = board }
                );
                await db.SaveChangesAsync();
            }

            return board;
        }

        public async Task<bool> DeleteBoard(int id, TazkDbContext db)
        {
            var board = await db.Boards.FindAsync(id)
                ?? throw new GraphQLException("Board not found.");

            db.Boards.Remove(board);
            await db.SaveChangesAsync();
            return true;
        }
        public async Task<bool> DeleteColumn(int id, TazkDbContext db)
        {
            var column = await db.Columns.FindAsync(id)
                ?? throw new GraphQLException("Column not found.");

            // 1. Get task IDs in this column
            var taskIds = await db.Tasks
                .Where(t => t.ColumnId == id)
                .Select(t => (int?)t.Id)
                .ToListAsync();

            // 2. Delete notifications and performance scores
            var notifications = db.Notifications.Where(n => taskIds.Contains(n.TaskId));
            db.Notifications.RemoveRange(notifications);

            var scores = db.PerformanceScores.Where(ps => taskIds.Contains(ps.TaskId));
            db.PerformanceScores.RemoveRange(scores);

            // 3. Delete tasks
            var tasks = db.Tasks.Where(t => t.ColumnId == id);
            db.Tasks.RemoveRange(tasks);

            // 4. Delete column
            db.Columns.Remove(column);
            await db.SaveChangesAsync();
            return true;
        }
        public async Task<Board> UpdateBoard(
    UpdateBoardInput input,
    TazkDbContext db)
        {
            var board = await db.Boards.FindAsync(input.Id)
                ?? throw new GraphQLException("Board not found.");

            if (input.Name != null) board.Name = input.Name;

            await db.SaveChangesAsync();
            return board;
        }

        // Task Mutations

        public async Task<ProjectTask> CreateTask(
            CreateTaskInput input,
            TazkDbContext db)
        {
            var column = await db.Columns.FindAsync(input.ColumnId)
                ?? throw new GraphQLException("Column not found.");

            var workspace = await db.Workspaces.FindAsync(input.WorkspaceId)
                ?? throw new GraphQLException("Workspace not found.");

            var createdBy = await db.Users.FindAsync(input.CreatedById)
                ?? throw new GraphQLException("User not found.");

            var task = new ProjectTask
            {
                WorkspaceId = input.WorkspaceId,
                ColumnId = input.ColumnId,
                AssignedToId = input.AssignedToId,
                CreatedById = input.CreatedById,
                Title = input.Title,
                Description = input.Description,
                Effort = input.Effort,
                Urgency = input.Urgency,
                DueDate = input.DueDate,
                CreatedAt = DateTime.UtcNow,
                Workspace = workspace,
                Column = column,
                CreatedBy = createdBy
            };

            db.Tasks.Add(task);
            await db.SaveChangesAsync();

            if (input.AssignedToId.HasValue)
            {
                var assignee = await db.Users.FindAsync(input.AssignedToId.Value);
                if (assignee != null)
                {
                    db.Notifications.Add(new Notification
                    {
                        UserId = input.AssignedToId.Value,
                        TaskId = task.Id,
                        Message = $"You have been assigned a new task: \"{task.Title}\"",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        User = assignee,
                        Task = task
                    });
                    await db.SaveChangesAsync();
                }
            }

            return task;
        }

        public async Task<ProjectTask> UpdateTask(
            UpdateTaskInput input,
            TazkDbContext db)
        {
            var task = await db.Tasks.FindAsync(input.Id)
                ?? throw new GraphQLException("Task not found.");

            var previousAssignee = task.AssignedToId;

            if (input.Title != null) task.Title = input.Title;
            if (input.Description != null) task.Description = input.Description;
            if (input.ColumnId.HasValue) task.ColumnId = input.ColumnId.Value;
            if (input.Effort.HasValue) task.Effort = input.Effort.Value;
            if (input.Urgency.HasValue) task.Urgency = input.Urgency.Value;
            if (input.DueDate.HasValue) task.DueDate = input.DueDate;
            if (input.CompletedAt.HasValue) task.CompletedAt = input.CompletedAt;

            if (input.AssignedToId.HasValue && input.AssignedToId != previousAssignee)
            {
                task.AssignedToId = input.AssignedToId.Value;
                var newAssignee = await db.Users.FindAsync(input.AssignedToId.Value);
                if (newAssignee != null)
                {
                    db.Notifications.Add(new Notification
                    {
                        UserId = input.AssignedToId.Value,
                        TaskId = task.Id,
                        Message = $"You have been assigned to task: \"{task.Title}\"",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        User = newAssignee,
                        Task = task
                    });
                }
            }

            await db.SaveChangesAsync();
            return task;
        }

        public async Task<bool> DeleteTask(int id, TazkDbContext db)
        {
            var task = await db.Tasks.FindAsync(id)
                ?? throw new GraphQLException("Task not found.");

            db.Tasks.Remove(task);
            await db.SaveChangesAsync();
            return true;
        }

        // Invitation Mutations 

        public async Task<WorkspaceInvitation> SendInvitation(
            SendInvitationInput input,
            TazkDbContext db)
        {
            var workspace = await db.Workspaces.FindAsync(input.WorkspaceId)
                ?? throw new GraphQLException("Workspace not found.");

            var existing = await db.WorkspaceInvitations
                .FirstOrDefaultAsync(i => i.WorkspaceId == input.WorkspaceId
                                       && i.Email == input.Email
                                       && i.Status == InvitationStatus.Pending);

            if (existing != null)
                throw new GraphQLException("A pending invitation for this email already exists.");

            var invitation = new WorkspaceInvitation
            {
                WorkspaceId = input.WorkspaceId,
                Email = input.Email,
                Status = InvitationStatus.Pending,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                Workspace = workspace
            };

            db.WorkspaceInvitations.Add(invitation);
            await db.SaveChangesAsync();
            return invitation;
        }

        public async Task<WorkspaceInvitation> RespondToInvitation(
            RespondToInvitationInput input,
            TazkDbContext db)
        {
            var invitation = await db.WorkspaceInvitations
                .Include(i => i.Workspace)
                .FirstOrDefaultAsync(i => i.Id == input.Id)
                ?? throw new GraphQLException("Invitation not found.");

            if (invitation.ExpiresAt < DateTime.UtcNow)
                throw new GraphQLException("Invitation has expired.");

            invitation.Status = input.Status;

            if (input.Status == InvitationStatus.Accepted)
            {
                var user = await db.Users.FirstOrDefaultAsync(u => u.Email == invitation.Email)
                    ?? throw new GraphQLException("No account found for this email.");

                var alreadyMember = await db.WorkspaceMembers
                    .AnyAsync(wm => wm.WorkspaceId == invitation.WorkspaceId && wm.UserId == user.Id);

                if (!alreadyMember)
                {
                    db.WorkspaceMembers.Add(new WorkspaceMember
                    {
                        WorkspaceId = invitation.WorkspaceId,
                        UserId = user.Id,
                        Role = MemberRole.Member,
                        JoinedAt = DateTime.UtcNow,
                        Workspace = invitation.Workspace,
                        User = user
                    });
                }
            }

            await db.SaveChangesAsync();
            return invitation;
        }

        // Notification Mutations 

        public async Task<Notification> MarkNotificationRead(
            int id,
            bool isRead,
            TazkDbContext db)
        {
            var notification = await db.Notifications.FindAsync(id)
                ?? throw new GraphQLException("Notification not found.");

            notification.IsRead = isRead;
            await db.SaveChangesAsync();
            return notification;
        }

        public async Task<int> MarkAllNotificationsRead(int userId, TazkDbContext db)
        {
            var notifications = await db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            notifications.ForEach(n => n.IsRead = true);
            await db.SaveChangesAsync();
            return notifications.Count;
        }

        // User Mutations 

        public async Task<User> RegisterUser(
            RegisterUserInput input,
            TazkDbContext db)
        {
            var emailExists = await db.Users.AnyAsync(u => u.Email == input.Email);
            if (emailExists)
                throw new GraphQLException("An account with this email already exists.");

            var user = new User
            {
                FullName = input.FullName,
                Email = input.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.Password),
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteUser(int id, TazkDbContext db)
        {
            var user = await db.Users.FindAsync(id)
                ?? throw new GraphQLException("User not found.");

            // Clear assigned tasks before deleting
            var assignedTasks = await db.Tasks.Where(t => t.AssignedToId == id).ToListAsync();
            assignedTasks.ForEach(t => t.AssignedToId = null);

            db.Users.Remove(user);
            await db.SaveChangesAsync();
            return true;
        }
        public async Task<AuthPayload> LoginUser(
    LoginUserInput input,
    TazkDbContext db,
    IConfiguration config)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == input.Email)
                ?? throw new GraphQLException("Invalid email or password.");

            var validPassword = BCrypt.Net.BCrypt.Verify(input.Password, user.PasswordHash);
            if (!validPassword)
                throw new GraphQLException("Invalid email or password.");

            var token = GenerateJwtToken(user, config);

            return new AuthPayload(token, user);
        }

        private string GenerateJwtToken(User user, IConfiguration config)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.FullName),
    };

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        //  Input Types 

        public record CreateWorkspaceInput(string Name, int OwnerId, WorkspaceType Type);
        public record UpdateWorkspaceInput(int Id, string? Name, WorkspaceType? Type);
        public record CreateBoardInput(string Name, int WorkspaceId, bool IsDefault);
        public record LoginUserInput(string Email, string Password);
        public record AuthPayload(string Token, User User);
        public record CreateTaskInput(
            int WorkspaceId,
            int ColumnId,
            int? AssignedToId,
            int CreatedById,
            string Title,
            string? Description,
            EffortLevel Effort,
            UrgencyLevel Urgency,
            DateTime? DueDate);
        public record UpdateTaskInput(
            int Id,
            string? Title,
            string? Description,
            int? ColumnId,
            int? AssignedToId,
            EffortLevel? Effort,
            UrgencyLevel? Urgency,
            DateTime? DueDate,
            DateTime? CompletedAt);
        public record SendInvitationInput(int WorkspaceId, string Email);
        public record UpdateBoardInput(int Id, string? Name);
        public record RespondToInvitationInput(int Id, InvitationStatus Status);
        public record RegisterUserInput(string FullName, string Email, string Password);
    }
}