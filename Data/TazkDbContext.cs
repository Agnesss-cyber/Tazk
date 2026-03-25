using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using Tazk.Models;

namespace Tazk.Data
{
    public class TazkDbContext : DbContext
    {
        public TazkDbContext(DbContextOptions<TazkDbContext> options)
            : base(options)
        {
        }

       
        public DbSet<User> Users { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }
        public DbSet<WorkspaceMember> WorkspaceMembers { get; set; }
        public DbSet<WorkspaceInvitation> WorkspaceInvitations { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<BoardColumn> Columns { get; set; } 
        public DbSet<ProjectTask> Tasks { get; set; }   
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<PerformanceScore> PerformanceScores { get; set; }
        public DbSet<WorkspaceDocument> WorkspaceDocuments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Enum storage configuration: Store enums as integers in the database
            modelBuilder.Entity<Workspace>().Property(e => e.Type).HasConversion<int>();
            modelBuilder.Entity<WorkspaceMember>().Property(e => e.Role).HasConversion<int>();
            modelBuilder.Entity<WorkspaceInvitation>().Property(e => e.Status).HasConversion<int>();
            modelBuilder.Entity<ProjectTask>().Property(e => e.Effort).HasConversion<int>();
            modelBuilder.Entity<ProjectTask>().Property(e => e.Urgency).HasConversion<int>();
            modelBuilder.Entity<PerformanceScore>().Property(e => e.CompletionStatus).HasConversion<int>();
            modelBuilder.Entity<WorkspaceDocument>().Property(e => e.FileType).HasConversion<int>();

            // 2. Configure Relationships explicitly 

            // Workspace -> Owner (User)
            modelBuilder.Entity<Workspace>()
                .HasOne(w => w.Owner)
                .WithMany(u => u.OwnedWorkspaces)
                .HasForeignKey(w => w.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            // WorkspaceMember -> Workspace & User
            modelBuilder.Entity<WorkspaceMember>()
                .HasOne(wm => wm.Workspace)
                .WithMany(w => w.Members)
                .HasForeignKey(wm => wm.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WorkspaceMember>()
                .HasOne(wm => wm.User)
                .WithMany(u => u.Memberships)
                .HasForeignKey(wm => wm.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Board -> Workspace
            modelBuilder.Entity<Board>()
                .HasOne(b => b.Workspace)
                .WithMany(w => w.Boards)
                .HasForeignKey(b => b.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            // BoardColumn -> Board
            modelBuilder.Entity<BoardColumn>()
                .HasOne(c => c.Board)
                .WithMany(b => b.Columns)
                .HasForeignKey(c => c.BoardId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProjectTask -> Column, Workspace, AssignedUser, CreatedUser
            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.Column)
                .WithMany(c => c.Tasks)
                .HasForeignKey(t => t.ColumnId)
                .OnDelete(DeleteBehavior.NoAction); // Prevent accidental column deletion if tasks exist

            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.Workspace)
                .WithMany(w => w.Tasks)
                .HasForeignKey(t => t.WorkspaceId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.AssignedTo)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.NoAction); // If user deleted, task remains unassigned

            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.CreatedBy)
                .WithMany(u => u.CreatedTasks)
                .HasForeignKey(t => t.CreatedById)
                .OnDelete(DeleteBehavior.NoAction);

            // Notification -> User & Task
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Task)
                .WithMany(t => t.Notifications)
                .HasForeignKey(n => n.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            // PerformanceScore -> Task & User
            modelBuilder.Entity<PerformanceScore>()
                .HasOne(ps => ps.Task)
                .WithMany(t => t.PerformanceScores)
                .HasForeignKey(ps => ps.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PerformanceScore>()
                .HasOne(ps => ps.User)
                .WithMany(u => u.PerformanceScores)
                .HasForeignKey(ps => ps.UserId)
                .OnDelete(DeleteBehavior.Cascade);

           // WorkspaceDocument->Workspace & User
            modelBuilder.Entity<WorkspaceDocument>()
                .HasOne(wd => wd.Workspace)
                .WithMany(w => w.Documents)
                .HasForeignKey(wd => wd.WorkspaceId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<WorkspaceDocument>()
                   .HasOne(wd => wd.UploadedBy)
                   .WithMany(u => u.UploadedDocuments)
                   .HasForeignKey(wd => wd.UploadedById)
                   .OnDelete(DeleteBehavior.NoAction);
        }

        // Optional: For quick testing without Dependency Injection
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Replace with your actual SQL Server connection string
                optionsBuilder.UseSqlServer("Server=localhost;Database=TazkDb;Trusted_Connection=True;TrustServerCertificate=True;");
            }
        }
    }
}