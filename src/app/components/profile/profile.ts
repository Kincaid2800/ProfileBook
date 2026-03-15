import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

/**
 * ProfileComponent — Displays and manages the logged-in user's profile
 * Shows: avatar letter, username, email, role badge, join date, profile picture
 * Allows: uploading/changing profile picture via POST /api/User/upload-profile-picture
 * Uses ChangeDetectorRef to force UI update after async API calls
 * Route: /profile
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],  // Needed for *ngIf in template (profile image vs avatar letter)
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  // Profile data populated from GET /api/User/profile
  username = '';
  email = '';
  role = '';

  // Null means no profile picture uploaded yet — template shows letter avatar instead
  profileImage: string | null = null;

  // ISO date string from backend — formatted in template with | date:'mediumDate'
  joinedAt = '';

  // Shown below Change Photo button after upload attempt (success or failure)
  uploadMessage = '';

  // Modern inject() pattern for standalone components
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  /**
   * ChangeDetectorRef is injected to manually trigger Angular's change detection
   * This is needed because the profile API call is async — Angular sometimes
   * doesn't detect the data change automatically after an await, leaving
   * the template stuck on empty values even though the data has arrived
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * Lifecycle hook — runs once when component initializes
   * Step 1: Checks authentication — redirects to login if no token
   * Step 2: Calls GET /api/User/profile with JWT token
   * Step 3: Populates all profile fields from API response
   * Step 4: Forces change detection so template renders the new data
   *
   * Note: profile endpoint must be declared BEFORE /{id} in UserController
   * otherwise ASP.NET routes "profile" as an ID parameter and returns 404
   */
  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      // No token found — user is not authenticated
      this.router.navigate(['/login']);
      return;
    }
    try {
      const profile = await this.userService.getMyProfile();

      // Map API response properties to component fields
      this.username = profile.username;
      this.email = profile.email;
      this.role = profile.role;
      this.profileImage = profile.profileImage;   // null if no picture uploaded
      this.joinedAt = profile.createdAt;

      // Manually trigger change detection — required because Angular doesn't
      // always detect changes from async/await outside the zone
      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Profile error:', error);
    }
  }

  /**
   * Handles profile picture file selection from the file input
   * Called via (change) event on the hidden <input type="file">
   * Step 1: Gets the selected File object from the input event
   * Step 2: Calls POST /api/User/upload-profile-picture with multipart/form-data
   * Step 3: Backend saves file to wwwroot/profiles/{guid}.jpg
   * Step 4: Updates profileImage with returned URL so new picture shows immediately
   * Step 5: Forces change detection to re-render the img tag
   * @param event - The file input change event containing the selected file
   */
  async onProfilePicSelected(event: any) {
    const file = event.target.files[0];

    // Guard: do nothing if user opened picker but cancelled
    if (!file) return;

    try {
      const result = await this.userService.uploadProfilePicture(file);

      // Update displayed image immediately — result.url is e.g. /profiles/guid.jpg
      this.profileImage = result.url;
      this.uploadMessage = 'Profile picture updated!';

      // Force re-render so the new image appears without requiring a page reload
      this.cdr.detectChanges();
    } catch (error) {
      this.uploadMessage = 'Failed to upload picture.';
    }
  }

  /**
   * Logs out the current user
   * Clears token, username, and role from localStorage via AuthService
   * Redirects to login page
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  
   // Navigates back to the home feed
   //Uses Angular Router for SPA navigation — no full page reload
   
  goHome() {
    this.router.navigate(['/home']);
  }
}