namespace ProfileBook.API.DTOs
{
    public class CreatePostDTO
    {
        public string Content { get; set; } = string.Empty;
        public string? PostImage { get; set; }
    }

    public class PostResponseDTO
    {
        public int PostId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? PostImage { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int LikesCount { get; set; }
        public List<CommentResponseDTO> Comments { get; set; } = new();
    }

    public class CommentResponseDTO
    {
        public int CommentId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCommentDTO
    {
        public string Content { get; set; } = string.Empty;
    }
}
