namespace ProfileBook.API.Models
{
    public class Report
    {
        public int ReportId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime TimeStamp { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public int ReportedUserId { get; set; }
        public User ReportedUser { get; set; } = null!;

        public int ReportingUserId { get; set; }
        public User ReportingUser { get; set; } = null!;
    }
}
