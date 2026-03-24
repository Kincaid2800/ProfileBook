import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

// ToastService handles API-level errors (wrong credentials) — validation errors stay inline
// in the form because they're directly tied to a specific field, which is better UX than a toast

import { ToastService } from '../../services/toast';

// AutofocusDirective puts the cursor in the email field as soon as the login page loads —
// saves one click, which matters on a page the user visits every session

import { AutofocusDirective } from '../../directives/autofocus.directive';

// TrimInputDirective cleans email on blur — "  user@test.com  " becomes "user@test.com"
// before it even reaches the validate() check, preventing false "invalid email" errors

import { TrimInputDirective } from '../../directives/trim-input.directive';

// LoginComponent — Handles user authentication
// Renders the split-panel login page with email/password form
// On success: redirects Admin → /admin, regular User → /home
// Route: /login

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    // Both directives registered here so Angular resolves them when scanning the login template
    AutofocusDirective,
    TrimInputDirective
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Bound to email input via [(ngModel)]
  email = '';

  // Bound to password input via [(ngModel)]
  password = '';

  // Displayed in template when validation fails or login API returns error
  errorMessage = '';

  // inject() is the modern Angular standalone alternative to constructor injection
  private authService = inject(AuthService);
  private router = inject(Router);
  // ToastService used only for the API error path — validation errors still go to errorMessage
  // because they need to sit right next to the form fields, not float in the corner
  private toastService = inject(ToastService);

  
   // Client-side validation — runs BEFORE the API call
   //Prevents unnecessary network requests for obviously invalid input
   //Returns true if all fields are valid, false otherwise
   //Sets errorMessage directly so the template displays it via *ngIf
   
  validate() {
    // Check email is not empty
    if (!this.email) {
      this.errorMessage = 'Email is required.';
      return false;
    }

    // Regex checks for basic email format: something@something.something
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email.';
      return false;
    }

    // Check password is not empty
    if (!this.password) {
      this.errorMessage = 'Password is required.';
      return false;
    }

    // Minimum 6 characters — matches backend BCrypt minimum requirement
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return false;
    }

    return true;
  }

  /**
   * Main login handler — called when user clicks Sign In button
   * Step 1: Clears any previous error message
   * Step 2: Runs client-side validation — stops here if invalid
   * Step 3: Calls AuthService.login() → POST /api/Auth/login
   * Step 4: On success, JWT token saved to localStorage by AuthService
   * Step 5: Role-based redirect — Admin goes to /admin, User goes to /home
   * Step 6: On failure (wrong credentials), shows error message
   */
  async login() {
    // Clear previous errors before each attempt
    this.errorMessage = '';

    // Stop if client-side validation fails — no API call needed
    if (!this.validate()) return;

    try {
      const data = await this.authService.login(this.email, this.password);

      // Role-based routing — Admin gets full dashboard, User gets home feed
      if (data.role === 'Admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      // API returned 401 Unauthorized — wrong credentials.
      // Toast is used here (not errorMessage) because this is a backend response,
      // not a field-level validation issue — it doesn't belong anchored to any single input
      this.toastService.show('Invalid email or password.', 'error');
    }
  }
}