import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

// UserService handles all user related API calls
// including search, report, update and profile management
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Base URL for user endpoints
  private apiUrl = 'https://localhost:7193/api/User';
  private authService = inject(AuthService);

  // Helper method to build authorization headers
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
  // Search for users by username
  async searchUsers(username: string) {
    const response = await axios.get(
      `${this.apiUrl}/search?username=${username}`,
      this.getHeaders()
    );
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await axios.delete(`${this.apiUrl}/${userId}`, this.getHeaders());
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
  // Admin only - get all reports
  async getReports() {
    const response = await axios.get(`${this.apiUrl}/reports`, this.getHeaders());
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
  // Get the currently logged in user's profile
  async getMyProfile() {
    console.log('getMyProfile called, token:', this.authService.getToken());
    const response = await axios.get(`${this.apiUrl}/profile`, this.getHeaders());
    return response.data;
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
      `${this.apiUrl}/upload-profile-picture`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`
        }
      }
    );
    return response.data;
  }
}