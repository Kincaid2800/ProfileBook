import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

// MessageService handles all messaging related API calls
// Users can send messages and view conversations
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // Base URL for message endpoints
  private apiUrl = 'https://localhost:7193/api/Message';

  constructor(private authService: AuthService) {}
 // Helper method to build authorization headers
  private getHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    };
  }

  // Send a message to another user
  async sendMessage(receiverId: number, content: string) {
    const response = await axios.post(
      `${this.apiUrl}?receiverId=${receiverId}&content=${encodeURIComponent(content)}`,
      {},
      this.getHeaders()
    );
    return response.data;
  }
  // Get full conversation with a specific user
  async getConversation(userId: number) {
    const response = await axios.get(
      `${this.apiUrl}/${userId}`,
      this.getHeaders()
    );
    return response.data;
  }
}