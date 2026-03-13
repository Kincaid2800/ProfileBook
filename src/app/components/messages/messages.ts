import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { MessageService } from '../../services/message';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class MessagesComponent implements OnInit {
  searchQuery = '';
  searchResults: any[] = [];
  selectedUser: any = null;
  messages: any[] = [];
  newMessage = '';

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  async searchUsers() {
    try {
      this.searchResults = await this.userService.searchUsers(this.searchQuery);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }

  async selectUser(user: any) {
    this.selectedUser = user;
    await this.loadMessages();
  }

  async loadMessages() {
    try {
      this.messages = await this.messageService.getConversation(this.selectedUser.userId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    try {
      await this.messageService.sendMessage(this.selectedUser.userId, this.newMessage);
      this.newMessage = '';
      await this.loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}