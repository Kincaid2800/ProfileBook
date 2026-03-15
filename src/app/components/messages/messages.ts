import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { MessageService } from '../../services/message';


 // MessagesComponent — User-to-user direct messaging page
 //Left panel: search for users to chat with
 //Right panel: chat window showing conversation history
 //Messages are stored in the Messages table via POST /api/Message
 //Route: /messages
 
@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,  // Needed for *ngIf and *ngFor in template
    FormsModule    // Needed for [(ngModel)] on search input and message input
  ],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class MessagesComponent implements OnInit {
  // Current value of the user search input box
  searchQuery = '';

  // List of users returned from GET /api/User/search?username=
  searchResults: any[] = [];

  // The user currently selected for chatting — null means no chat open
  selectedUser: any = null;

  // Full conversation history between logged-in user and selectedUser
  // Loaded from GET /api/Message/{userId}
  messages: any[] = [];

  // Bound to the message input box via [(ngModel)]
  newMessage = '';

  // Modern Angular inject() pattern for standalone components
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  
   // Lifecycle hook — runs once when component loads
   //Checks if user is logged in — redirects to login if not
   //Protects the messages page from unauthenticated access
   
  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      // No token in localStorage — send user back to login
      this.router.navigate(['/login']);
    }
  }

  
   // Searches for users by username
   //Calls GET /api/User/search?username={searchQuery}
   //Results populate the left panel for user selection
   //Contains() match on backend — partial username works too
   
  async searchUsers() {
    try {
      this.searchResults = await this.userService.searchUsers(this.searchQuery);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }


  async selectUser(user: any) {
    this.selectedUser = user;

    // Immediately load existing conversation with this user
    await this.loadMessages();
  }

  
   // Loads full conversation between logged-in user and selectedUser

  async loadMessages() {
    try {
      this.messages = await this.messageService.getConversation(this.selectedUser.userId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  
   // Sends a new message to the selected user
   //Calls POST /api/Message?receiverId={id}&content={text}
   //Trims whitespace — prevents sending empty or blank messages
   //Clears the input box after sending
   //Reloads conversation so new message appears immediately in chat window
   
  async sendMessage() {
    // Prevent sending empty or whitespace-only messages
    if (!this.newMessage.trim()) return;

    try {
      await this.messageService.sendMessage(this.selectedUser.userId, this.newMessage);

      // Clear input box after successful send
      this.newMessage = '';

      // Reload conversation to show the newly sent message
      await this.loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  
   // Navigates back to the home feed
   //Uses Angular Router for SPA navigation — no full page reload
   
  goHome() {
    this.router.navigate(['/home']);
  }
}