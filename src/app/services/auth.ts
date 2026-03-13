import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7193/api/Auth';

  async register(username: string, email: string, password: string) {
    const response = await axios.post(`${this.apiUrl}/register`, {
      username, email, password
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await axios.post(`${this.apiUrl}/login`, {
      email, password
    });
    const data = response.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUsername() {
    return localStorage.getItem('username');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  isAdmin() {
    return localStorage.getItem('role') === 'Admin';
  }
}