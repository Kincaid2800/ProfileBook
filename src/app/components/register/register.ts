import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  private toastService = inject(ToastService);

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
    this.errorMessage = '';
    if (!this.validate()) return;
    try {
      await this.authService.register(this.username, this.email, this.password);
      this.toastService.show('Registered successfully! Redirecting to login...', 'success');
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (error) {
      this.toastService.show('Registration failed. Email may already exist.', 'error');
    }
  }
}