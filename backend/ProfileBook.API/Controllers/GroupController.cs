using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfileBook.API.Data;
using ProfileBook.API.Models;
using System.Security.Claims;

namespace ProfileBook.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllGroups()
        {
            int? currentUserId = null;
            var currentUserClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(currentUserClaim, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            var groups = await _context.Groups
                .AsNoTracking()
                .Include(g => g.Members)
                .OrderByDescending(g => g.CreatedAt)
                .Select(g => new
                {
                    g.GroupId,
                    g.Name,
                    g.Description,
                    g.CreatedAt,
                    MemberCount = g.Members.Count,
                    IsMember = currentUserId.HasValue && g.Members.Any(member => member.UserId == currentUserId.Value)
                })
                .ToListAsync();

            return Ok(groups);
        }

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

            return Ok(new
            {
                group.GroupId,
                group.Name,
                group.Description,
                group.CreatedAt,
                MemberCount = 0,
                IsMember = false
            });
        }

        [HttpPost("{id}/join")]
        public async Task<IActionResult> JoinGroup(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var groupExists = await _context.Groups.AnyAsync(g => g.GroupId == id);
            if (!groupExists)
            {
                return NotFound("Group not found.");
            }

            var existing = await _context.GroupMembers
                .FirstOrDefaultAsync(gm => gm.GroupId == id && gm.UserId == userId);

            var isMember = existing == null;

            if (existing != null)
            {
                _context.GroupMembers.Remove(existing);
            }
            else
            {
                _context.GroupMembers.Add(new GroupMember
                {
                    GroupId = id,
                    UserId = userId
                });
            }

            await _context.SaveChangesAsync();

            var memberCount = await _context.GroupMembers.CountAsync(gm => gm.GroupId == id);

            return Ok(new
            {
                isMember,
                memberCount
            });
        }

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
