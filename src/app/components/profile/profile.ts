import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  username = '';
  email = '';
  role = '';
  profileImage: string | null = null;
  joinedAt = '';
  uploadMessage = '';

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      const profile = await this.userService.getMyProfile();
      this.username = profile.username;
      this.email = profile.email;
      this.role = profile.role;
      this.profileImage = profile.profileImage;
      this.joinedAt = profile.createdAt;
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Profile error:', error);
    }
  }

  async onProfilePicSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await this.userService.uploadProfilePicture(file);
      this.profileImage = result.url;
      this.uploadMessage = 'Profile picture updated!';
      this.cdr.detectChanges();
    } catch (error) {
      this.uploadMessage = 'Failed to upload picture.';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}