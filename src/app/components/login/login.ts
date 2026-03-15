import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';


 // LoginComponent — Handles user authentication
 //Renders the split-panel login page with email/password form
 //On success: redirects Admin → /admin, regular User → /home
 //Route: /login
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,   // Needed for *ngIf in template
    FormsModule,    // Needed for [(ngModel)] two-way binding
    RouterLink      // Needed for routerLink="/register" in template
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
      // API returned 401 Unauthorized — wrong email or password
      this.errorMessage = 'Invalid email or password.';
    }
  }
}