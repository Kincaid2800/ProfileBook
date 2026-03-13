import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7193/api/User';

  constructor(private authService: AuthService) {}

  private getHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    };
  }

  async getAllUsers() {
    const response = await axios.get(this.apiUrl, this.getHeaders());
    return response.data;
  }

  async searchUsers(username: string) {
    const response = await axios.get(
      `${this.apiUrl}/search?username=${username}`,
      this.getHeaders()
    );
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await axios.delete(
      `${this.apiUrl}/${userId}`,
      this.getHeaders()
    );
    return response.data;
  }

  async getReports() {
    const response = await axios.get(
      `${this.apiUrl}/reports`,
      this.getHeaders()
    );
    return response.data;
  }
  async updateUser(userId: number, username: string, email: string) {
  const response = await axios.put(
    `${this.apiUrl}/${userId}`,
    { username, email },
    this.getHeaders()
  );
  return response.data;
}
  async reportUser(reportedUserId: number, reason: string) {
  const response = await axios.post(
    `${this.apiUrl}/report?reportedUserId=${reportedUserId}&reason=${encodeURIComponent(reason)}`,
    {},
    this.getHeaders()
  );
  return response.data;
}
}