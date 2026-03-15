namespace ProfileBook.API.Models
{
    public class Message
    {
        public int MessageId { get; set; }
        public string MessageContent { get; set; } = string.Empty;
        public DateTime TimeStamp { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;

        public int ReceiverId { get; set; }
        public User Receiver { get; set; } = null!;
    }
}
