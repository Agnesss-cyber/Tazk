using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("Workspaces")]
    public class Workspace
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? Name { get; set; }

        [Required]
        public int OwnerId { get; set; }
        [ForeignKey("OwnerId")]
        public User Owner { get; set; } = null!;

        [Required]
        public WorkspaceType Type { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public ICollection<WorkspaceMember> Members { get; set; } = new List<WorkspaceMember>();
        public ICollection<WorkspaceInvitation> Invitations { get; set; } = new List<WorkspaceInvitation>();
        public ICollection<Board> Boards { get; set; } = new List<Board>();
        public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
        public ICollection<WorkspaceDocument> Documents { get; set; } = new List<WorkspaceDocument>();
    }
}