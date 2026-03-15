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
    // This controller handles all user-related operations
    // like searching, deleting, reporting and profile management
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]// All endpoints require login except where specified
    public class UserController : ControllerBase
    {
        // AppDbContext gives us access to the database
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/user/profile - MUST be before {id} route
        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.Role,
                user.ProfileImage,
                user.CreatedAt
            });
        }

        // GET: api/user/search username=john
        // Allows users to search for other users by username
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

        // GET: api/user/reports - Admin views all reports
        // Get a specific user's public profile by their ID
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

        // GET: api/user 
        // Admin only - get all users in the system
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

        // DELETE: api/user/{id} 
        // Admin only - delete a user and all their related data
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found.");

            var posts = _context.Posts.Where(p => p.UserId == id);
            _context.Posts.RemoveRange(posts);

            var likes = _context.Likes.Where(l => l.UserId == id);
            _context.Likes.RemoveRange(likes);

            var comments = _context.Comments.Where(c => c.UserId == id);
            _context.Comments.RemoveRange(comments);

            var messages = _context.Messages.Where(m => m.SenderId == id || m.ReceiverId == id);
            _context.Messages.RemoveRange(messages);

            var reports = _context.Reports.Where(r => r.ReportedUserId == id || r.ReportingUserId == id);
            _context.Reports.RemoveRange(reports);

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

        // POST: api/user/upload-profile-picture
        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("Only images are allowed.");

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profiles");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.ProfileImage = $"/profiles/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { url = user.ProfileImage });
        }
    }
}