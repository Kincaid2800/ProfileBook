namespace ProfileBook.API.Models
{
    public class Post
    {
        public int PostId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? PostImage { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Navigation properties
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
}
