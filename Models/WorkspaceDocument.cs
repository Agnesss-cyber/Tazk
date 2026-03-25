using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("WorkspaceDocuments")]
    public class WorkspaceDocument
    {
        [Key]
        public required int Id { get; set; }

        [Required]
        public int WorkspaceId { get; set; }
        [ForeignKey("WorkspaceId")]
        public Workspace? Workspace { get; set; }

        [Required]
        public int UploadedById { get; set; }
        [ForeignKey("UploadedById")]
        public User? UploadedBy { get; set; }

        [Required]
        public required string FileName { get; set; }

        [Required]
        public required string FileUrl { get; set; }

        [Required]
        public required FileType FileType { get; set; }

        public DateTime CreatedAt { get; set; }

    }
}