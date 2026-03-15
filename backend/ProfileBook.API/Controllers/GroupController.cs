using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfileBook.API.Data;
using ProfileBook.API.Models;
using System.Security.Claims;

namespace ProfileBook.API.Controllers
{
    // This controller handles all group-related operations
    // Admins can create and delete groups
    // Users can join and leave groups
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]// All endpoints require login
    public class GroupController : ControllerBase
    {
        // AppDbContext gives us access to the database
        private readonly AppDbContext _context;

        public GroupController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/group
        // Get all groups with their member count
        [HttpGet]
        public async Task<IActionResult> GetAllGroups()
        {
            var groups = await _context.Groups
                .Include(g => g.Members)
                .Select(g => new {
                    g.GroupId,
                    g.Name,
                    g.Description,
                    g.CreatedAt,
                    MemberCount = g.Members.Count
                })
                .ToListAsync();

            return Ok(groups);
        }

        // POST: api/group
        // Admin only - create a new group
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateGroup([FromBody] Group dto)
        {
            var group = new Group
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            return Ok("Group created.");
        }

        // POST: api/group/{id}/join
        // Toggle join/leave a group
        // If user is already a member, they leave. Otherwise they join.
        [HttpPost("{id}/join")]
        public async Task<IActionResult> JoinGroup(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var existing = await _context.GroupMembers
                .Where(gm => gm.GroupId == id && gm.UserId == userId)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                _context.GroupMembers.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok("Left group.");
            }

            var member = new GroupMember { GroupId = id, UserId = userId };
            _context.GroupMembers.Add(member);
            await _context.SaveChangesAsync();

            return Ok("Joined group.");
        }

        // DELETE: api/group/{id}
        // Admin only - delete a group and all its members
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return NotFound("Group not found.");

            var members = _context.GroupMembers.Where(gm => gm.GroupId == id);
            _context.GroupMembers.RemoveRange(members);

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();

            return Ok("Group deleted.");
        }
    }
}