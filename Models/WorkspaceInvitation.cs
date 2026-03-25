using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("WorkspaceInvitations")]
    public class WorkspaceInvitation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkspaceId { get; set; }
        [ForeignKey("WorkspaceId")]
        public Workspace? Workspace { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public InvitationStatus Status { get; set; }

        public DateTime ExpiresAt { get; set; }
    }
}