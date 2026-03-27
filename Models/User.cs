using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Tazk.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public ICollection<Workspace> OwnedWorkspaces { get; set; } = new List<Workspace>();
        public ICollection<WorkspaceMember> Memberships { get; set; } = new List<WorkspaceMember>();
        public ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
        public ICollection<ProjectTask> CreatedTasks { get; set; } = new List<ProjectTask>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<PerformanceScore> PerformanceScores { get; set; } = new List<PerformanceScore>();
        public ICollection<WorkspaceDocument> UploadedDocuments { get; set; } = new List<WorkspaceDocument>();
    }
}