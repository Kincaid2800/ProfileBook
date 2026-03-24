import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
// ToastService so we can tell the user when a report succeeds or fails —
// previously this was a silent try/catch that gave no feedback
import { ToastService } from '../../services/toast';
// AutofocusDirective puts the cursor in the search box immediately on page load —
// the user opened search to find someone, so they should be able to type right away
import { AutofocusDirective } from '../../directives/autofocus.directive';
// TrimInputDirective cleans up search queries like " john " to "john" automatically,
// preventing "no results" errors caused by accidental leading/trailing spaces
import { TrimInputDirective } from '../../directives/trim-input.directive';

@Component({
  selector: 'app-search',
  standalone: true,
  // Both directives are listed here so Angular knows to apply them when it sees
  // appAutofocus and appTrimInput attributes in the search template
  imports: [CommonModule, FormsModule, AutofocusDirective, TrimInputDirective],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent {
  searchQuery = '';
  searchResults: any[] = [];
  searched = false;

  private userService = inject(UserService);
  private router = inject(Router);
  // ToastService injected so report success/failure feedback reaches the user visually
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
      // Green toast confirms the report landed — gives the user closure after filling in the prompt
      this.toastService.show('User reported successfully!', 'success');
    } catch (error) {
      // Red toast so the user knows to try again — no silent failures
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