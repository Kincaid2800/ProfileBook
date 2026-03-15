import { Injectable } from '@angular/core';
import axios from 'axios';

// AuthService handles all authentication related operations
// including login, register, logout and token management
@Injectable({
  providedIn: 'root'
})
export class AuthService {
   // Base URL of our backend API
  private apiUrl = 'https://localhost:7193/api/Auth';
  
  // Register a new user account
  async register(username: string, email: string, password: string) {
    const response = await axios.post(`${this.apiUrl}/register`, {
      username, email, password
    });
    return response.data;
  }
  
   // Login with email and password
  // Stores token, username and role in localStorage on success
  async login(email: string, password: string) {
    const response = await axios.post(`${this.apiUrl}/login`, {
      email, password
    });
    const data = response.data;
     // Save auth data to localStorage for session persistence
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    return data;
  }

   // Logout by clearing all stored auth data
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }
  
  // Get the stored JWT token
  getToken() {
    return localStorage.getItem('token');
  }
  
  // Get the stored username
  getUsername() {
    return localStorage.getItem('username');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
 
  // Check if the logged in user is an Admin
  isAdmin() {
    return localStorage.getItem('role') === 'Admin';
  }
}