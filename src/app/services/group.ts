import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = 'https://localhost:7193/api/Group';
  private authService = inject(AuthService);

  private getHeaders() {
    return {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    };
  }

  async getAllGroups() {
    const response = await axios.get(this.apiUrl, this.getHeaders());
    return response.data;
  }

  async createGroup(name: string, description: string) {
    const response = await axios.post(this.apiUrl, { name, description }, this.getHeaders());
    return response.data;
  }

  async joinGroup(groupId: number) {
    const response = await axios.post(`${this.apiUrl}/${groupId}/join`, {}, this.getHeaders());
    return response.data;
  }

  async deleteGroup(groupId: number) {
    const response = await axios.delete(`${this.apiUrl}/${groupId}`, this.getHeaders());
    return response.data;
  }
}
