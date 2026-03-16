import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { ChatMessage, MessageService } from '../../services/message';

interface ConversationSummary {
  key: string;
  userId?: number;
  username: string;
  lastMessage: string;
  timeStamp: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class MessagesComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: any[] = [];
  recentConversations: ConversationSummary[] = [];
  selectedUser: { userId?: number; username: string } | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  currentUsername = '';
  loadingRecent = true;
  errorMessage = '';

  private cacheKeyPrefix = 'profilebook_recent_chats_';
  private refreshTimerId: number | null = null;
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUsername = this.authService.getUsername() || '';
    this.recentConversations = this.readCachedConversations();
    this.loadingRecent = this.recentConversations.length === 0;
    await this.refreshMessageState();

    this.refreshTimerId = window.setInterval(() => {
      void this.refreshMessageState(false);
    }, 8000);
  }

  ngOnDestroy() {
    if (this.refreshTimerId !== null) {
      window.clearInterval(this.refreshTimerId);
    }
  }

  @HostListener('window:focus')
  async onWindowFocus() {
    await this.refreshMessageState(false);
  }

  private get cacheKey() {
    return `${this.cacheKeyPrefix}${this.currentUsername.toLowerCase()}`;
  }

  private readCachedConversations(): ConversationSummary[] {
    const cachedValue = localStorage.getItem(this.cacheKey);
    if (!cachedValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(cachedValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeCachedConversations(conversations: ConversationSummary[]) {
    localStorage.setItem(this.cacheKey, JSON.stringify(conversations));
  }

  private buildConversationSummary(message: ChatMessage): ConversationSummary | null {
    const currentUsername = this.currentUsername.trim().toLowerCase();
    const senderUsername = message.sender.trim();
    const receiverUsername = message.receiver.trim();
    const otherUsername = message.otherUsername || (senderUsername.toLowerCase() === currentUsername ? receiverUsername : senderUsername);

    if (!otherUsername) {
      return null;
    }

    const inferredIsMine = message.isMine || senderUsername.toLowerCase() === currentUsername;
    const inferredUserId = message.otherUserId || (inferredIsMine ? message.receiverId : message.senderId) || undefined;
    const key = inferredUserId ? `id:${inferredUserId}` : `name:${otherUsername.toLowerCase()}`;

    return {
      key,
      userId: inferredUserId,
      username: otherUsername,
      lastMessage: message.messageContent,
      timeStamp: message.timeStamp
    };
  }

  private async ensureUserId(user: { userId?: number; username: string }): Promise<number | undefined> {
    if (user.userId) {
      return user.userId;
    }

    try {
      const users = await this.userService.searchUsers(user.username);
      const exactUser = users.find((candidate: any) =>
        typeof candidate.username === 'string' && candidate.username.toLowerCase() === user.username.toLowerCase()
      );

      return exactUser?.userId;
    } catch (error) {
      console.error('Error resolving chat user:', error);
      return undefined;
    }
  }

  async searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    try {
      const users = await this.userService.searchUsers(this.searchQuery);
      this.searchResults = users.filter((user: any) => user.username !== this.currentUsername);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }

  async loadRecentConversations() {
    try {
      const allMessages = await this.messageService.getMyMessages();
      const conversations = new Map<string, ConversationSummary>();

      for (const message of allMessages) {
        const summary = this.buildConversationSummary(message);
        if (!summary || conversations.has(summary.key)) {
          continue;
        }

        conversations.set(summary.key, summary);
      }

      const builtConversations = Array.from(conversations.values());
      if (builtConversations.length > 0) {
        this.recentConversations = builtConversations;
        this.writeCachedConversations(builtConversations);
      } else {
        this.recentConversations = this.readCachedConversations();
      }

      if (!this.selectedUser && this.recentConversations.length > 0) {
        await this.selectUser(this.recentConversations[0]);
      }

      this.errorMessage = '';
    } catch (error) {
      this.recentConversations = this.readCachedConversations();
      this.errorMessage = 'Unable to refresh previous chats right now. Showing the latest available list.';
      console.error('Error loading recent conversations:', error);
    } finally {
      this.loadingRecent = false;
    }
  }

  async selectUser(user: { userId?: number; username: string }) {
    const resolvedUserId = await this.ensureUserId(user);
    this.selectedUser = {
      userId: resolvedUserId,
      username: user.username
    };
    await this.loadMessages();
  }

  async loadMessages() {
    if (!this.selectedUser) {
      this.messages = [];
      return;
    }

    if (!this.selectedUser.userId) {
      this.selectedUser.userId = await this.ensureUserId(this.selectedUser);
    }

    if (!this.selectedUser.userId) {
      this.errorMessage = 'Open this chat by searching the user once so the conversation can be linked.';
      this.messages = [];
      return;
    }

    try {
      const loadedMessages = await this.messageService.getConversation(this.selectedUser.userId);
      this.messages = loadedMessages.map(message => ({
        ...message,
        isMine: message.isMine || message.sender.toLowerCase() === this.currentUsername.toLowerCase()
      }));
      this.errorMessage = '';
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async refreshMessageState(showLoadingState = true) {
    if (showLoadingState) {
      this.loadingRecent = true;
    }

    await this.loadRecentConversations();

    if (this.selectedUser?.userId) {
      await this.loadMessages();
    }
  }

  async sendMessage() {
    if (!this.selectedUser || !this.newMessage.trim()) return;

    if (!this.selectedUser.userId) {
      this.selectedUser.userId = await this.ensureUserId(this.selectedUser);
    }

    if (!this.selectedUser.userId) {
      this.errorMessage = 'Search and select the user once before sending a message.';
      return;
    }

    try {
      await this.messageService.sendMessage(this.selectedUser.userId, this.newMessage);
      this.newMessage = '';
      await this.loadMessages();
      await this.loadRecentConversations();
      this.errorMessage = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async refreshInbox() {
    await this.refreshMessageState();
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
