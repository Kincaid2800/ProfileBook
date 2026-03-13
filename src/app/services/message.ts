import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'https://localhost:7193/api/Message';

  constructor(private authService: AuthService) {}

  private getHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    };
  }

  async sendMessage(receiverId: number, content: string) {
    const response = await axios.post(
      `${this.apiUrl}?receiverId=${receiverId}&content=${encodeURIComponent(content)}`,
      {},
      this.getHeaders()
    );
    return response.data;
  }

  async getConversation(userId: number) {
    const response = await axios.get(
      `${this.apiUrl}/${userId}`,
      this.getHeaders()
    );
    return response.data;
  }
}