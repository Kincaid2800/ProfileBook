import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { ToastService } from '../../services/toast';

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
  private toastService = inject(ToastService);

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
      this.toastService.show('User reported successfully!', 'success');
    } catch (error) {
      this.toastService.show('Failed to report user.', 'error');
    }
  }

  messageUser(userId: number) {
    this.router.navigate(['/messages']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}