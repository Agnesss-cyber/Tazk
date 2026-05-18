using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("WorkspaceMembers")]
    public class WorkspaceMember
    {
        [Key]
        public int Id { get; set; }

       

        [Required]
        public int WorkspaceId { get; set; }
        [ForeignKey("WorkspaceId")]
        public required Workspace Workspace { get; set; }

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public required User User { get; set; }

        [Required]
        public MemberRole Role { get; set; }

        public DateTime JoinedAt { get; set; }
        
    }
}