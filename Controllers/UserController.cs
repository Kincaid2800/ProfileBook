using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfileBook.API.Data;
using ProfileBook.API.Models;
using System.Linq;
using System.Security.Claims;
using ProfileBook.API.DTOs;

namespace ProfileBook.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/user/search?username=john
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string username)
        {
            var users = await _context.Users
                .Where(u => u.Username.Contains(username))
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.ProfileImage,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.ProfileImage,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound("User not found.");

            return Ok(user);
        }

        // GET: api/user - Admin gets all users
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.ProfileImage,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // DELETE: api/user/{id} - Admin deletes user
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted.");
        }

        // POST: api/user/report
        [HttpPost("report")]
        public async Task<IActionResult> ReportUser(int reportedUserId, string reason)
        {
            var reportingUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var report = new Report
            {
                ReportedUserId = reportedUserId,
                ReportingUserId = reportingUserId,
                Reason = reason
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok("User reported.");
        }

        // GET: api/user/reports - Admin views all reports
        [HttpGet("reports")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetReports()
        {
            var reports = await _context.Reports
                .Include(r => r.ReportedUser)
                .Include(r => r.ReportingUser)
                .Select(r => new
                {
                    r.ReportId,
                    r.Reason,
                    r.TimeStamp,
                    ReportedUser = r.ReportedUser.Username,
                    ReportingUser = r.ReportingUser.Username
                })
                .ToListAsync();

            return Ok(reports);
        }
        // PUT: api/user/{id} - Admin updates user
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDTO dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            user.Username = dto.Username;
            user.Email = dto.Email;
            await _context.SaveChangesAsync();

            return Ok("User updated.");
        }
    }
}
