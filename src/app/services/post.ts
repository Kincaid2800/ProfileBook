import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'https://localhost:7193/api/Post';

  constructor(private authService: AuthService) {}

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

  async getPendingPosts() {
    const response = await axios.get(
      `${this.apiUrl}/pending`,
      this.getHeaders()
    );
    return response.data;
  }

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