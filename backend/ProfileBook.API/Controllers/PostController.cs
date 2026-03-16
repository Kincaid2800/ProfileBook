using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfileBook.API.Data;
using ProfileBook.API.DTOs;
using ProfileBook.API.Models;
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

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPosts()
        {
            int? currentUserId = null;
            var currentUserClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(currentUserClaim, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            var posts = await _context.Posts
                .AsNoTracking()
                .Where(p => p.Status == "Approved")
                .Include(p => p.User)
                .Include(p => p.Comments).ThenInclude(c => c.User)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PostResponseDTO
                {
                    PostId = p.PostId,
                    UserId = p.UserId,
                    Content = p.Content,
                    PostImage = p.PostImage,
                    Status = p.Status,
                    Username = p.User.Username,
                    CreatedAt = p.CreatedAt,
                    LikesCount = p.Likes.Count,
                    IsLikedByCurrentUser = currentUserId.HasValue && p.Likes.Any(l => l.UserId == currentUserId.Value),
                    Comments = p.Comments
                        .OrderBy(c => c.CreatedAt)
                        .Select(c => new CommentResponseDTO
                        {
                            CommentId = c.CommentId,
                            Content = c.Content,
                            Username = c.User.Username,
                            CreatedAt = c.CreatedAt
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(posts);
        }

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

        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikePost(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var postExists = await _context.Posts.AnyAsync(p => p.PostId == id && p.Status == "Approved");
            if (!postExists)
            {
                return NotFound("Post not found.");
            }

            var existing = await _context.Likes
                .FirstOrDefaultAsync(l => l.PostId == id && l.UserId == userId);

            var liked = existing == null;

            if (existing != null)
            {
                _context.Likes.Remove(existing);
            }
            else
            {
                _context.Likes.Add(new Like
                {
                    PostId = id,
                    UserId = userId
                });
            }

            await _context.SaveChangesAsync();

            var likesCount = await _context.Likes.CountAsync(l => l.PostId == id);

            return Ok(new
            {
                liked,
                likesCount
            });
        }

        [HttpPost("{id}/comment")]
        public async Task<IActionResult> CommentPost(int id, CreateCommentDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var trimmedContent = dto.Content?.Trim();

            if (string.IsNullOrWhiteSpace(trimmedContent))
            {
                return BadRequest("Comment cannot be empty.");
            }

            var postExists = await _context.Posts.AnyAsync(p => p.PostId == id && p.Status == "Approved");
            if (!postExists)
            {
                return NotFound("Post not found.");
            }

            var comment = new Comment
            {
                Content = trimmedContent,
                PostId = id,
                UserId = userId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            var username = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync() ?? User.FindFirstValue(ClaimTypes.Name) ?? "You";

            return Ok(new CommentResponseDTO
            {
                CommentId = comment.CommentId,
                Content = comment.Content,
                Username = username,
                CreatedAt = comment.CreatedAt
            });
        }

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
                    UserId = p.UserId,
                    Content = p.Content,
                    PostImage = p.PostImage,
                    Status = p.Status,
                    Username = p.User.Username,
                    CreatedAt = p.CreatedAt,
                    LikesCount = 0,
                    IsLikedByCurrentUser = false,
                    Comments = new List<CommentResponseDTO>()
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var allowedTypes = new[]
            {
                "image/jpeg", "image/png", "image/gif",
                "video/mp4", "video/mpeg"
            };

            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("Only images and videos are allowed.");

            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/{fileName}";
            return Ok(new { url = fileUrl });
        }
    }
}
