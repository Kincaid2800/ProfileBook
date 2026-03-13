import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent {
  searchQuery = '';
  searchResults: any[] = [];
  searched = false;

  private userService = inject(UserService);
  private router = inject(Router);

  async searchUsers() {
    if (!this.searchQuery.trim()) return;
    try {
      this.searchResults = await this.userService.searchUsers(this.searchQuery);
      this.searched = true;
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }

  async reportUser(username: string, userId: number) {
    const reason = prompt(`Why are you reporting ${username}?`);
    if (!reason) return;
    try {
      await this.userService.reportUser(userId, reason);
      alert('User reported successfully!');
    } catch (error) {
      alert('Failed to report user.');
    }
  }

  messageUser(userId: number) {
    this.router.navigate(['/messages']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}