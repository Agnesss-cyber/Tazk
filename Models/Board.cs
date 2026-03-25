using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tazk.Models
{
    [Table("Boards")]
    public class Board
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WorkspaceId { get; set; }
        [ForeignKey("WorkspaceId")]
        public required Workspace Workspace { get; set; }

        [Required]
        public required string Name { get; set; }

        public bool IsDefault { get; set; }

        // Navigation Properties
        public ICollection<BoardColumn>? Columns { get; set; }
    }
}