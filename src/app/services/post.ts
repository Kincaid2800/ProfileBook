import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

// PostService handles all post related API calls
// including creating, liking, commenting and uploading files

@Injectable({
  providedIn: 'root'
})
export class PostService {
   // Base URL for post endpoints
  private apiUrl = 'https://localhost:7193/api/Post';

  constructor(private authService: AuthService) {}

  // Helper method to build authorization headers
  // Attaches JWT token to every request

  private getHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    };
  }

  async getAllPosts() {
    const response = await axios.get(this.apiUrl);
    return response.data;
  }
   
  // Create a new post with optional image/video
  // Post starts as Pending until admin approves it
  async createPost(content: string, postImage: string | null = null) {
    const response = await axios.post(this.apiUrl,
      { content, postImage },
      this.getHeaders()
    );
    return response.data;
  }

  async likePost(postId: number) {
    const response = await axios.post(
      `${this.apiUrl}/${postId}/like`,
      {},
      this.getHeaders()
    );
    return response.data;
  }

  async addComment(postId: number, content: string) {
    const response = await axios.post(
      `${this.apiUrl}/${postId}/comment`,
      { content },
      this.getHeaders()
    );
    return response.data;
  }
  
  // Admin only - get all pending posts
  async getPendingPosts() {
    const response = await axios.get(
      `${this.apiUrl}/pending`,
      this.getHeaders()
    );
    return response.data;
  }
  // Admin only - approve a pending post
  async approvePost(postId: number) {
    const response = await axios.put(
      `${this.apiUrl}/${postId}/approve`,
      {},
      this.getHeaders()
    );
    return response.data;
  }
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
      `${this.apiUrl}/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
}