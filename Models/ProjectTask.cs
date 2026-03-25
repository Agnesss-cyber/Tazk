using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("Tasks")]
    public class ProjectTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkspaceId { get; set; }
        [ForeignKey("WorkspaceId")]
        public Workspace Workspace { get; set; }

        [Required]
        public int ColumnId { get; set; }
        [ForeignKey("ColumnId")]
        public BoardColumn Column { get; set; }

        public int? AssignedToId { get; set; }
        [ForeignKey("AssignedToId")]
        public User AssignedTo { get; set; }

        [Required]
        public int CreatedById { get; set; }
        [ForeignKey("CreatedById")]
        public User CreatedBy { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public EffortLevel Effort { get; set; }

        [Required]
        public UrgencyLevel Urgency { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime? CompletedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<PerformanceScore> PerformanceScores { get; set; }
    }
}