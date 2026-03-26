using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public required User User { get; set; }

        [Required]
        public  int? TaskId { get; set; }
        [ForeignKey("TaskId")]
        public ProjectTask? Task { get; set; }

        [Required]
        public required string  Message { get; set; }

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}