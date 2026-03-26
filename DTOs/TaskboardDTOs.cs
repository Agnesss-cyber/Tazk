namespace Tazk.DTOs
{
    // Board

    public class CreateBoardDto
    {
        public required string Name { get; set; }
        public int WorkspaceId { get; set; }
        public bool IsDefault { get; set; }
    }

    public class UpdateBoardDto
    {
        public string? Name { get; set; }
    }

    // BoardColumn 

    public class CreateColumnDto
    {
        public required string Name { get; set; }
        public int BoardId { get; set; }
        public int Position { get; set; }
    }

    public class UpdateColumnDto
    {
        public string? Name { get; set; }
        public int? Position { get; set; }
    }

    // Task 

    public class CreateTaskDto
    {
        public int WorkspaceId { get; set; }
        public int ColumnId { get; set; }
        public int? AssignedToId { get; set; }
        public int CreatedById { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public Tazk.Models.EffortLevel Effort { get; set; }
        public Tazk.Models.UrgencyLevel Urgency { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? ColumnId { get; set; }        // Used for drag-and-drop between columns
        public int? AssignedToId { get; set; }
        public Tazk.Models.EffortLevel? Effort { get; set; }
        public Tazk.Models.UrgencyLevel? Urgency { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    //Notification 

    public class MarkNotificationReadDto
    {
        public bool IsRead { get; set; }
    }

    // Performance 

    public class CreatePerformanceScoreDto
    {
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public int EffortScore { get; set; }
        public Tazk.Models.CompletionStatus CompletionStatus { get; set; }
        public int DaysDelta { get; set; }
    }
}