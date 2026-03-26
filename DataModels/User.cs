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
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public ICollection<Workspace> OwnedWorkspaces { get; set; }
        public ICollection<WorkspaceMember> Memberships { get; set; }
        public ICollection<ProjectTask> AssignedTasks { get; set; }
        public ICollection<ProjectTask> CreatedTasks { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<PerformanceScore> PerformanceScores { get; set; }
        public ICollection<WorkspaceDocument> UploadedDocuments { get; set; }
    }
}