using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfileBook.API.Data;
using ProfileBook.API.DTOs;
using ProfileBook.API.Models;
using System.Linq;
using System.Security.Claims;

namespace ProfileBook.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PostController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PostController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/post - Get all approved posts
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _context.Posts
                .Where(p => p.Status == "Approved")
                .Include(p => p.User)
                .Include(p => p.Comments).ThenInclude(c => c.User)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PostResponseDTO
                {
                    PostId = p.PostId,
                    Content = p.Content,
                    PostImage = p.PostImage,
                    Status = p.Status,
                    Username = p.User.Username,
                    CreatedAt = p.CreatedAt,
                    LikesCount = p.Likes.Count,
                    Comments = p.Comments.Select(c => new CommentResponseDTO
                    {
                        CommentId = c.CommentId,
                        Content = c.Content,
                        Username = c.User.Username,
                        CreatedAt = c.CreatedAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(posts);
        }

        // POST: api/post - Create a new post
        [HttpPost]
        public async Task<IActionResult> CreatePost(CreatePostDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var post = new Post
            {
                Content = dto.Content,
                PostImage = dto.PostImage,
                UserId = userId,
                Status = "Pending"
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok("Post submitted for approval.");
        }

        // POST: api/post/{id}/like - Like a post
        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikePost(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var existing = await _context.Likes
                .Where(l => l.PostId == id && l.UserId == userId)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                _context.Likes.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok("Post unliked.");
            }

            var like = new Like { PostId = id, UserId = userId };
            _context.Likes.Add(like);
            await _context.SaveChangesAsync();

            return Ok("Post liked.");
        }

        // POST: api/post/{id}/comment - Comment on a post
        [HttpPost("{id}/comment")]
        public async Task<IActionResult> CommentPost(int id, CreateCommentDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var comment = new Comment
            {
                Content = dto.Content,
                PostId = id,
                UserId = userId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok("Comment added.");
        }

        // PUT: api/post/{id}/approve - Admin approves post
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApprovePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound("Post not found.");

            post.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok("Post approved.");
        }

        // GET: api/post/pending - Admin gets pending posts
        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingPosts()
        {
            var posts = await _context.Posts
                .Where(p => p.Status == "Pending")
                .Include(p => p.User)
                .Select(p => new PostResponseDTO
                {
                    PostId = p.PostId,
                    Content = p.Content,
                    PostImage = p.PostImage,
                    Status = p.Status,
                    Username = p.User.Username,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(posts);
        }
        // POST: api/post/upload - Upload image/video
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Allowed file types
            var allowedTypes = new[] {
        "image/jpeg", "image/png", "image/gif",
        "video/mp4", "video/mpeg"
    };

            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("Only images and videos are allowed.");

            // Create uploads folder if it doesn't exist
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{fileName}";
            return Ok(new { url = fileUrl });
        }
    }
}
    
