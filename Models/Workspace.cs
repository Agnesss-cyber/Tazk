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
        public User Owner { get; set; }

        [Required]
        public WorkspaceType Type { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public ICollection<WorkspaceMember> Members { get; set; }
        public ICollection<WorkspaceInvitation> Invitations { get; set; }
        public ICollection<Board> Boards { get; set; }
        public ICollection<ProjectTask> Tasks { get; set; }
        public ICollection<WorkspaceDocument> Documents { get; set; }
    }
}