using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("Columns")]
    public class BoardColumn
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BoardId { get; set; }
        [ForeignKey("BoardId")]
        public Board? Board { get; set; }

        [Required]
        public string? Name { get; set; }

        [Required]
        public int Position { get; set; }

        // Navigation Properties
        public ICollection<ProjectTask>? Tasks { get; set; }
    }
}