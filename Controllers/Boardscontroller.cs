using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tazk.Data;
using Tazk.DTOs;
using Tazk.Models;

namespace Tazk.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController : ControllerBase
    {
        private readonly TazkDbContext _db;

        public BoardsController(TazkDbContext db)
        {
            _db = db;
        }

        // GET api/boards/workspace/{workspaceId}
        [HttpGet("workspace/{workspaceId}")]
        public async Task<IActionResult> GetByWorkspace(int workspaceId)
        {
            var boards = await _db.Boards
                .Where(b => b.WorkspaceId == workspaceId)
                .Include(b => b.Columns.OrderBy(c => c.Position))
                .ToListAsync();

            return Ok(boards);
        }

        // GET api/boards/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var board = await _db.Boards
                .Include(b => b.Workspace)
                .Include(b => b.Columns.OrderBy(c => c.Position))
                    .ThenInclude(c => c.Tasks)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (board == null) return NotFound();
            return Ok(board);
        }

        // POST api/boards
        [HttpPost]
        public async Task<IActionResult> Create(CreateBoardDto dto)
        {
            var workspaceExists = await _db.Workspaces.AnyAsync(w => w.Id == dto.WorkspaceId);
            if (!workspaceExists) return BadRequest("Workspace not found.");

            var board = new Board
            {
                Name = dto.Name,
                WorkspaceId = dto.WorkspaceId,
                IsDefault = dto.IsDefault,
                Workspace = (await _db.Workspaces.FindAsync(dto.WorkspaceId))!
            };

            _db.Boards.Add(board);
            await _db.SaveChangesAsync();

            // Seed default Kanban columns if this is a new default board
            if (dto.IsDefault)
            {
                var defaultColumns = new[]
                {
                    new BoardColumn { BoardId = board.Id, Name = "To Do",      Position = 1, Board = board },
                    new BoardColumn { BoardId = board.Id, Name = "In Progress", Position = 2, Board = board },
                    new BoardColumn { BoardId = board.Id, Name = "Done",        Position = 3, Board = board }
                };
                _db.Columns.AddRange(defaultColumns);
                await _db.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetById), new { id = board.Id }, board);
        }

        // PUT api/boards/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateBoardDto dto)
        {
            var board = await _db.Boards.FindAsync(id);
            if (board == null) return NotFound();

            if (dto.Name != null) board.Name = dto.Name;

            await _db.SaveChangesAsync();
            return Ok(board);
        }

        // DELETE api/boards/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var board = await _db.Boards.FindAsync(id);
            if (board == null) return NotFound();

            _db.Boards.Remove(board);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ── Columns ───────────────────────────────────────────────────────────

        // POST api/boards/{boardId}/columns
        [HttpPost("{boardId}/columns")]
        public async Task<IActionResult> CreateColumn(int boardId, CreateColumnDto dto)
        {
            var board = await _db.Boards.FindAsync(boardId);
            if (board == null) return NotFound("Board not found.");

            var column = new BoardColumn
            {
                BoardId = boardId,
                Name = dto.Name,
                Position = dto.Position,
                Board = board
            };

            _db.Columns.Add(column);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = boardId }, column);
        }

        // PUT api/boards/columns/{columnId}
        [HttpPut("columns/{columnId}")]
        public async Task<IActionResult> UpdateColumn(int columnId, UpdateColumnDto dto)
        {
            var column = await _db.Columns.FindAsync(columnId);
            if (column == null) return NotFound();

            if (dto.Name != null) column.Name = dto.Name;
            if (dto.Position.HasValue) column.Position = dto.Position.Value;

            await _db.SaveChangesAsync();
            return Ok(column);
        }

        // DELETE api/boards/columns/{columnId}
        [HttpDelete("columns/{columnId}")]
        public async Task<IActionResult> DeleteColumn(int columnId)
        {
            var column = await _db.Columns.FindAsync(columnId);
            if (column == null) return NotFound();

            var hasTasks = await _db.Tasks.AnyAsync(t => t.ColumnId == columnId);
            if (hasTasks) return BadRequest("Cannot delete a column that still has tasks. Move or delete the tasks first.");

            _db.Columns.Remove(column);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}