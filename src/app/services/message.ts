import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

export interface ChatMessage {
  messageId: number;
  messageContent: string;
  timeStamp: string;
  senderId: number;
  receiverId: number;
  sender: string;
  receiver: string;
  isMine: boolean;
  otherUserId?: number;
  otherUsername?: string;
}

function readNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

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

  private normalizeMessage(raw: any): ChatMessage {
    const otherUserId = readNumber(raw?.otherUserId ?? raw?.OtherUserId);
    const otherUsername = readString(raw?.otherUsername ?? raw?.OtherUsername);

    return {
      messageId: readNumber(raw?.messageId ?? raw?.MessageId),
      messageContent: readString(raw?.messageContent ?? raw?.MessageContent),
      timeStamp: readString(raw?.timeStamp ?? raw?.TimeStamp),
      senderId: readNumber(raw?.senderId ?? raw?.SenderId),
      receiverId: readNumber(raw?.receiverId ?? raw?.ReceiverId),
      sender: readString(raw?.sender ?? raw?.Sender),
      receiver: readString(raw?.receiver ?? raw?.Receiver),
      isMine: readBoolean(raw?.isMine ?? raw?.IsMine),
      otherUserId: otherUserId > 0 ? otherUserId : undefined,
      otherUsername: otherUsername || undefined
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

  async getConversation(userId: number): Promise<ChatMessage[]> {
    const response = await axios.get(
      `${this.apiUrl}/${userId}`,
      this.getHeaders()
    );

    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(message => this.normalizeMessage(message));
  }

  async getMyMessages(): Promise<ChatMessage[]> {
    const response = await axios.get(
      this.apiUrl,
      this.getHeaders()
    );

    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(message => this.normalizeMessage(message));
  }
}
