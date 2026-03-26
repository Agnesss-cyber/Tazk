using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tazk.Data;
using Tazk.DTOs;
using Tazk.Models;

namespace Tazk.Controllers
{
    // Notifications 

    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly TazkDbContext _db;

        public NotificationsController(TazkDbContext db)
        {
            _db = db;
        }

        // GET api/notifications/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var notifications = await _db.Notifications
                .Where(n => n.UserId == userId)
                .Include(n => n.Task)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // PUT api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkRead(int id, MarkNotificationReadDto dto)
        {
            var notification = await _db.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = dto.IsRead;
            await _db.SaveChangesAsync();
            return Ok(notification);
        }

        // PUT api/notifications/user/{userId}/read-all
        [HttpPut("user/{userId}/read-all")]
        public async Task<IActionResult> MarkAllRead(int userId)
        {
            var notifications = await _db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            notifications.ForEach(n => n.IsRead = true);
            await _db.SaveChangesAsync();
            return Ok(new { updated = notifications.Count });
        }
    }

    // Performance

    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceController : ControllerBase
    {
        private readonly TazkDbContext _db;

        public PerformanceController(TazkDbContext db)
        {
            _db = db;
        }

        // GET api/performance/workspace/{workspaceId}/leaderboard
        // Manager only — full leaderboard
        [HttpGet("workspace/{workspaceId}/leaderboard")]
        public async Task<IActionResult> GetLeaderboard(int workspaceId)
        {
            var leaderboard = await _db.PerformanceScores
                .Where(ps => ps.Task.WorkspaceId == workspaceId)
                .Include(ps => ps.User)
                .GroupBy(ps => new { ps.UserId, ps.User.FullName })
                .Select(g => new
                {
                    UserId = g.Key.UserId,
                    FullName = g.Key.FullName,
                    TotalScore = g.Sum(ps => ps.EffortScore),
                    TasksCompleted = g.Count(),
                    EarlyCompletions = g.Count(ps => ps.CompletionStatus == CompletionStatus.Early),
                    LateCompletions = g.Count(ps => ps.CompletionStatus == CompletionStatus.Late)
                })
                .OrderByDescending(x => x.TotalScore)
                .ToListAsync();

            return Ok(leaderboard);
        }

        // GET api/performance/user/{userId}
        // Team member — their own stats only
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserStats(int userId)
        {
            var scores = await _db.PerformanceScores
                .Where(ps => ps.UserId == userId)
                .Include(ps => ps.Task)
                .ToListAsync();

            var stats = new
            {
                UserId = userId,
                TotalScore = scores.Sum(ps => ps.EffortScore),
                TasksCompleted = scores.Count,
                OnTime = scores.Count(ps => ps.CompletionStatus == CompletionStatus.OnTime),
                Early = scores.Count(ps => ps.CompletionStatus == CompletionStatus.Early),
                Late = scores.Count(ps => ps.CompletionStatus == CompletionStatus.Late)
            };

            return Ok(stats);
        }

        // POST api/performance
        // Called internally when a task is marked complete
        [HttpPost]
        public async Task<IActionResult> RecordScore(CreatePerformanceScoreDto dto)
        {
            var taskExists = await _db.Tasks.AnyAsync(t => t.Id == dto.TaskId);
            if (!taskExists) return BadRequest("Task not found.");

            var userExists = await _db.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists) return BadRequest("User not found.");

            var score = new PerformanceScore
            {
                TaskId = dto.TaskId,
                UserId = dto.UserId,
                EffortScore = dto.EffortScore,
                CompletionStatus = dto.CompletionStatus,
                DaysDelta = dto.DaysDelta,
                CalculatedAt = DateTime.UtcNow,
                Task = (await _db.Tasks.FindAsync(dto.TaskId))!,
                User = (await _db.Users.FindAsync(dto.UserId))!
            };

            _db.PerformanceScores.Add(score);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserStats), new { userId = dto.UserId }, score);
        }
    }
}