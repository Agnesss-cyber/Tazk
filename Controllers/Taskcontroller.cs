using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tazk.Data;
using Tazk.DTOs;
using Tazk.Models;

namespace Tazk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TazkDbContext _db;

        public TasksController(TazkDbContext db)
        {
            _db = db;
        }

        // GET api/tasks/workspace/{workspaceId}
        [HttpGet("workspace/{workspaceId}")]
        public async Task<IActionResult> GetByWorkspace(int workspaceId)
        {
            var tasks = await _db.Tasks
                .Where(t => t.WorkspaceId == workspaceId)
                .Include(t => t.AssignedTo)
                .Include(t => t.CreatedBy)
                .Include(t => t.Column)
                .ToListAsync();

            return Ok(tasks);
        }

        // GET api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _db.Tasks
                .Include(t => t.AssignedTo)
                .Include(t => t.CreatedBy)
                .Include(t => t.Column)
                .Include(t => t.Workspace)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();
            return Ok(task);
        }

        // GET api/tasks/workspace/{workspaceId}/user/{userId}/top-priority
        // Returns top 3 smart priority tasks for a user
        [HttpGet("workspace/{workspaceId}/user/{userId}/top-priority")]
        public async Task<IActionResult> GetTopPriority(int workspaceId, int userId)
        {
            var tasks = await _db.Tasks
                .Where(t => t.WorkspaceId == workspaceId
                         && t.AssignedToId == userId
                         && t.CompletedAt == null)
                .Include(t => t.Column)
                .ToListAsync();

            var top3 = tasks
                .Select(t => new
                {
                    Task = t,
                    PriorityScore = GetPriorityScore(t)
                })
                .OrderByDescending(x => x.PriorityScore)
                .Take(3)
                .Select(x => new { x.Task, x.PriorityScore })
                .ToList();

            return Ok(top3);
        }

        // GET api/tasks/workspace/{workspaceId}/workload
        // Manager view: task count per user to see who is idle/overloaded
        [HttpGet("workspace/{workspaceId}/workload")]
        public async Task<IActionResult> GetWorkload(int workspaceId)
        {
            var workload = await _db.Tasks
                .Where(t => t.WorkspaceId == workspaceId && t.CompletedAt == null)
                .GroupBy(t => new { t.AssignedToId, t.AssignedTo!.FullName })
                .Select(g => new
                {
                    UserId = g.Key.AssignedToId,
                    FullName = g.Key.FullName,
                    ActiveTaskCount = g.Count(),
                    HighEffortCount = g.Count(t => t.Effort == EffortLevel.High)
                })
                .ToListAsync();

            return Ok(workload);
        }

        // POST api/tasks
        [HttpPost]
        public async Task<IActionResult> Create(CreateTaskDto dto)
        {
            var columnExists = await _db.Columns.AnyAsync(c => c.Id == dto.ColumnId);
            if (!columnExists) return BadRequest("Column not found.");

            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Id == dto.WorkspaceId);
            if (!workspaceExists) return BadRequest("Workspace not found.");

            var task = new ProjectTask
            {
                WorkspaceId = dto.WorkspaceId,
                ColumnId = dto.ColumnId,
                AssignedToId = dto.AssignedToId,
                CreatedById = dto.CreatedById,
                Title = dto.Title,
                Description = dto.Description,
                Effort = dto.Effort,
                Urgency = dto.Urgency,
                DueDate = dto.DueDate,
                CreatedAt = DateTime.UtcNow,
                Workspace = (await _db.Workspaces.FindAsync(dto.WorkspaceId))!,
                Column = (await _db.Columns.FindAsync(dto.ColumnId))!,
                CreatedBy = (await _db.Users.FindAsync(dto.CreatedById))!
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            // Fire notification if task is assigned
            if (dto.AssignedToId.HasValue)
            {
                var assignee = await _db.Users.FindAsync(dto.AssignedToId.Value);
                if (assignee != null)
                {
                    _db.Notifications.Add(new Notification
                    {
                        UserId = dto.AssignedToId.Value,
                        TaskId = task.Id,
                        Message = $"You have been assigned a new task: \"{task.Title}\"",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        User = assignee,
                        Task = task
                    });
                    await _db.SaveChangesAsync();
                }
            }

            return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
        }

        // PUT api/tasks/{id}
        // Handles both edits and drag-and-drop column changes
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTaskDto dto)
        {
            var task = await _db.Tasks
                .Include(t => t.AssignedTo)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();

            var previousAssignee = task.AssignedToId;

            if (dto.Title != null) task.Title = dto.Title;
            if (dto.Description != null) task.Description = dto.Description;
            if (dto.ColumnId.HasValue) task.ColumnId = dto.ColumnId.Value;
            if (dto.Effort.HasValue) task.Effort = dto.Effort.Value;
            if (dto.Urgency.HasValue) task.Urgency = dto.Urgency.Value;
            if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;
            if (dto.CompletedAt.HasValue) task.CompletedAt = dto.CompletedAt;

            // Handle reassignment notification
            if (dto.AssignedToId.HasValue && dto.AssignedToId != previousAssignee)
            {
                task.AssignedToId = dto.AssignedToId.Value;
                var newAssignee = await _db.Users.FindAsync(dto.AssignedToId.Value);
                if (newAssignee != null)
                {
                    _db.Notifications.Add(new Notification
                    {
                        UserId = dto.AssignedToId.Value,
                        TaskId = task.Id,
                        Message = $"You have been assigned to task: \"{task.Title}\"",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        User = newAssignee,
                        Task = task
                    });
                }
            }

            await _db.SaveChangesAsync();
            return Ok(task);
        }

        // DELETE api/tasks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Smart Priority Score (mirrors spec) 

        private static int GetPriorityScore(ProjectTask task)
        {
            int urgencyScore = task.Urgency switch
            {
                UrgencyLevel.High => 3,
                UrgencyLevel.Medium => 2,
                _ => 1
            };

            int effortScore = task.Effort switch
            {
                EffortLevel.High => 3,
                EffortLevel.Medium => 2,
                _ => 1
            };

            int dueDateScore = task.DueDate.HasValue
                ? (task.DueDate.Value < DateTime.UtcNow ? 3
                    : task.DueDate.Value <= DateTime.UtcNow.AddDays(3) ? 2
                    : 1)
                : 1;

            return urgencyScore + effortScore + dueDateScore;
        }
    }
}