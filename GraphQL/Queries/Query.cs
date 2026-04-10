using HotChocolate;
using HotChocolate.Data;
using Tazk.Data;
using Tazk.Models;

namespace Tazk.GraphQL.Queries
{
    public class Query
    {
        // Workspaces

        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public IQueryable<Workspace> GetWorkspaces(TazkDbContext db)
            => db.Workspaces;

        [UseFirstOrDefault]
        [UseProjection]
        public IQueryable<Workspace> GetWorkspaceById(TazkDbContext db, int id)
            => db.Workspaces.Where(w => w.Id == id);

        // Boards 

        [UseProjection]
        [UseFiltering]
        public IQueryable<Board> GetBoards(TazkDbContext db, int workspaceId)
            => db.Boards.Where(b => b.WorkspaceId == workspaceId);

        // Columns 

        [UseProjection]
        [UseSorting]
        public IQueryable<BoardColumn> GetColumns(TazkDbContext db, int boardId)
            => db.Columns.Where(c => c.BoardId == boardId).OrderBy(c => c.Position);

        // Tasks

        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public IQueryable<ProjectTask> GetTasks(TazkDbContext db, int workspaceId)
            => db.Tasks.Where(t => t.WorkspaceId == workspaceId);

        [UseFirstOrDefault]
        [UseProjection]
        public IQueryable<ProjectTask> GetTaskById(TazkDbContext db, int id)
            => db.Tasks.Where(t => t.Id == id);

        // Top 3 smart priority tasks for a user
        public async Task<List<ProjectTask>> GetTopPriorityTasks(
            TazkDbContext db,
            int workspaceId,
            int userId)
        {
            var tasks = await System.Threading.Tasks.Task.Run(() =>
                db.Tasks
                    .Where(t => t.WorkspaceId == workspaceId
                             && t.AssignedToId == userId
                             && t.CompletedAt == null)
                    .ToList());

            return tasks
                .OrderByDescending(t => GetPriorityScore(t))
                .Take(3)
                .ToList();
        }

        // Workload view for managers
        public IQueryable<WorkloadEntry> GetWorkload(TazkDbContext db, int workspaceId)
        {
            return db.Tasks
                .Where(t => t.WorkspaceId == workspaceId && t.CompletedAt == null && t.AssignedToId != null)
                .GroupBy(t => new { t.AssignedToId, t.AssignedTo!.FullName })
                .Select(g => new WorkloadEntry
                {
                    UserId = g.Key.AssignedToId!.Value,
                    FullName = g.Key.FullName,
                    ActiveTaskCount = g.Count(),
                    HighEffortCount = g.Count(t => t.Effort == EffortLevel.High)
                });
        }

        // Users 

        [UseProjection]
        [UseFiltering]
        public IQueryable<User> GetUsers(TazkDbContext db)
            => db.Users;

        [UseFirstOrDefault]
        [UseProjection]
        public IQueryable<User> GetUserById(TazkDbContext db, int id)
            => db.Users.Where(u => u.Id == id);

        //Invitations
        [UseProjection]
        [UseFiltering] // Allows filtering by status 
        public IQueryable<WorkspaceInvitation> GetWorkspaceInvitationsByEmail(
            TazkDbContext db, string email)
        {
            // Query the WorkspaceInvitations table where the email matches
            return db.WorkspaceInvitations.Where(wi => wi.Email == email);
        }
        // Notifications 

        [UseProjection]
        [UseFiltering]
        public IQueryable<Notification> GetNotifications(TazkDbContext db, int userId)
            => db.Notifications
                 .Where(n => n.UserId == userId)
                 .OrderByDescending(n => n.CreatedAt);

        // Performance

        public IQueryable<LeaderboardEntry> GetLeaderboard(TazkDbContext db, int workspaceId)
        {
            return db.PerformanceScores
                .Where(ps => ps.Task.WorkspaceId == workspaceId)
                .GroupBy(ps => new { ps.UserId, ps.User.FullName })
                .Select(g => new LeaderboardEntry
                {
                    UserId = g.Key.UserId,
                    FullName = g.Key.FullName,
                    TotalScore = g.Sum(ps => ps.EffortScore),
                    TasksCompleted = g.Count(),
                    EarlyCompletions = g.Count(ps => ps.CompletionStatus == CompletionStatus.Early),
                    LateCompletions = g.Count(ps => ps.CompletionStatus == CompletionStatus.Late)
                })
                .OrderByDescending(e => e.TotalScore);
        }

        [UseProjection]
        public IQueryable<PerformanceScore> GetUserPerformance(TazkDbContext db, int userId)
            => db.PerformanceScores.Where(ps => ps.UserId == userId);

        // Smart Priority Helper 

        private static int GetPriorityScore(ProjectTask task)
        {
            int urgencyScore = task.Urgency switch
            {
                UrgencyLevel.High => 3,
                UrgencyLevel.Medium => 2,
                _ => 1
            };
            int effortScore = task.Effort switch
            {
                EffortLevel.High => 3,
                EffortLevel.Medium => 2,
                _ => 1
            };
            int dueDateScore = task.DueDate.HasValue
                ? (task.DueDate.Value < DateTime.UtcNow ? 3
                    : task.DueDate.Value <= DateTime.UtcNow.AddDays(3) ? 2
                    : 1)
                : 1;

            return urgencyScore + effortScore + dueDateScore;
        }
    }

    // Supporting return types 

    public class WorkloadEntry
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int ActiveTaskCount { get; set; }
        public int HighEffortCount { get; set; }
    }

    public class LeaderboardEntry
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public int TasksCompleted { get; set; }
        public int EarlyCompletions { get; set; }
        public int LateCompletions { get; set; }
    }
}