using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfileBook.API.Data;
using ProfileBook.API.Models;
using System.Linq;
using System.Security.Claims;

namespace ProfileBook.API.Controllers
{
    // This controller handles all messaging between users
    // Users can send messages and view their conversations
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]// All message endpoints require login
    public class MessageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessageController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/message
        // Send a message to another user
        [HttpPost]
        public async Task<IActionResult> SendMessage(int receiverId, string content)
        {
            var senderId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                MessageContent = content
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok("Message sent.");
        }

        // GET: api/message/{userId} 
        // Get full conversation between logged in user and another user
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetConversation(int userId)
        {
            var myId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Get all messages between both users in both directions
            var messages = await _context.Messages
                .Where(m => (m.SenderId == myId && m.ReceiverId == userId) ||
                            (m.SenderId == userId && m.ReceiverId == myId))
                .OrderBy(m => m.TimeStamp)// Show oldest messages first
                .Select(m => new
                {
                    m.MessageId,
                    m.MessageContent,
                    m.TimeStamp,
                    Sender = m.Sender.Username,
                    Receiver = m.Receiver.Username
                })
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/message 
        // Get all messages for the logged in user
        [HttpGet]
        public async Task<IActionResult> GetMyMessages()
        {
            var myId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var messages = await _context.Messages
                .Where(m => m.SenderId == myId || m.ReceiverId == myId)
                .OrderByDescending(m => m.TimeStamp)
                .Select(m => new
                {
                    m.MessageId,
                    m.MessageContent,
                    m.TimeStamp,
                    Sender = m.Sender.Username,
                    Receiver = m.Receiver.Username
                })
                .ToListAsync();

            return Ok(messages);
        }
    }
}
