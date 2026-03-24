import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

// ToastService handles the two API outcomes — success (redirect incoming) and failure
// (duplicate email). Both are global feedback, not tied to a specific field.

import { ToastService } from '../../services/toast';

// AutofocusDirective targets the username field — it's the first thing the user needs to fill,
// so dropping the cursor there saves them having to click in

import { AutofocusDirective } from '../../directives/autofocus.directive';

// TrimInputDirective applied to username and email — prevents "  john  " from being registered
// as a different user than "john", and avoids whitespace-caused login failures later

import { TrimInputDirective } from '../../directives/trim-input.directive';
// PasswordToggleDirective injects the show/hide eye button at runtime via Renderer2 —
// the template just gets [appPasswordToggle] on the password input, no extra HTML needed
import { PasswordToggleDirective } from '../../directives/password-toggle.directive';

// RegisterComponent — new user sign-up
// Validates all three fields client-side before hitting the API.
// On success: shows a toast and redirects to /login after 2 seconds.
// Route: /register

@Component({
  selector: 'app-register',
  standalone: true,
  // AutofocusDirective and TrimInputDirective both declared here — standalone components
  // can't rely on a shared module, so each one lists its own directive dependencies
  imports: [CommonModule, FormsModule, RouterLink, AutofocusDirective, TrimInputDirective, PasswordToggleDirective],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  // ToastService replaces both the old successMessage and the old API errorMessage —
  // two fewer properties to maintain and one fewer conditional block in the template

  private toastService = inject(ToastService);

  // Client-side validate() runs before the API call so we don't waste a network request
  // on obviously invalid data — each check sets errorMessage and returns false immediately

  validate() {
    if (!this.username) {
      this.errorMessage = 'Username is required.';
      return false;
    }
    if (this.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters.';
      return false;
    }
    if (!this.email) {
      this.errorMessage = 'Email is required.';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email.';
      return false;
    }
    if (!this.password) {
      this.errorMessage = 'Password is required.';
      return false;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return false;
    }
    return true;
  }

  async register() {
    // Reset validation error before each attempt so stale messages don't linger
    this.errorMessage = '';
    if (!this.validate()) return;
    try {
      await this.authService.register(this.username, this.email, this.password);

      // Success toast gives immediate feedback while the 2-second delay plays out —
      // without it the screen would just sit there looking frozen before the redirect

      this.toastService.show('Registered successfully! Redirecting to login...', 'success');

      // 2-second delay gives the user time to read the success toast before the page changes
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (error) {

      // Most common cause: email already registered. The toast is vague by design —
      // we don't want to confirm that a specific email exists in the system (security)
      
      this.toastService.show('Registration failed. Email may already exist.', 'error');
    }
  }
}