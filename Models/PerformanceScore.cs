using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("PerformanceScores")]
    public class PerformanceScore
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TaskId { get; set; }
        [ForeignKey("TaskId")]
        public  required ProjectTask Task { get; set; }

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public required User User { get; set; }

        [Required]
        public int EffortScore { get; set; }

        [Required]
        public CompletionStatus CompletionStatus { get; set; }

        public int DaysDelta { get; set; }

        public DateTime CalculatedAt { get; set; }
    }
}