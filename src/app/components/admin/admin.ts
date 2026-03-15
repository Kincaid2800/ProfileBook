import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PostService } from '../../services/post';
import { UserService } from '../../services/user';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group';

/**
 * AdminComponent - Dashboard for admin users
 * Handles user management, post approval, reports, and group management
 * Access restricted to users with Admin role only
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  // Data arrays loaded from API
  pendingPosts: any[] = [];
  users: any[] = [];
  reports: any[] = [];
  groups: any[] = [];

  // Controls which tab is currently active in the dashboard
  activeTab = 'posts';

  // Fields for creating a new group
  newGroupName = '';
  newGroupDescription = '';

  // Tracks which user is currently being edited (null = no edit in progress)
  editingUserId: number | null = null;
  editUsername = '';
  editEmail = '';

  // Inject required services using Angular's inject() function
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  /**
   * Lifecycle hook - runs when component initializes
   * Checks if user has Admin role, redirects to home if not
   * Loads all dashboard data if authorized
   */
  async ngOnInit() {
    if (!this.authService.isAdmin()) {
      // Non-admin users are redirected to home page
      this.router.navigate(['/home']);
      return;
    }
    await this.loadAll();
  }

  /**
   * Loads all data needed for the admin dashboard
   * Called on init and after any data modification
   */
  async loadAll() {
    this.pendingPosts = await this.postService.getPendingPosts();
    this.users = await this.userService.getAllUsers();
    this.reports = await this.userService.getReports();
    this.groups = await this.groupService.getAllGroups();
  }

  /**
   * Approves a pending post and refreshes the dashboard
   * @param postId - ID of the post to approve
   */
  async approvePost(postId: number) {
    await this.postService.approvePost(postId);
    await this.loadAll();
  }

  /**
   * Deletes a user and all their related data
   * @param userId - ID of the user to delete
   */
  async deleteUser(userId: number) {
    await this.userService.deleteUser(userId);
    await this.loadAll();
  }

  /**
   * Puts a user row into edit mode
   * Pre-fills the edit fields with current user data
   * @param user - The user object to edit
   */
  startEdit(user: any) {
    this.editingUserId = user.userId;
    this.editUsername = user.username;
    this.editEmail = user.email;
  }

  /**
   * Cancels edit mode and clears edit fields
   */
  cancelEdit() {
    this.editingUserId = null;
    this.editUsername = '';
    this.editEmail = '';
  }

  /**
   * Saves the edited user data to the backend
   * @param userId - ID of the user being updated
   */
  async saveEdit(userId: number) {
    try {
      await this.userService.updateUser(userId, this.editUsername, this.editEmail);
      this.cancelEdit();
      await this.loadAll();
    } catch (error) {
      alert('Failed to update user.');
    }
  }

  /**
   * Creates a new group with the provided name and description
   * Clears the form fields after successful creation
   */
  async createGroup() {
    // Prevent creating a group without a name
    if (!this.newGroupName) return;
    try {
      await this.groupService.createGroup(this.newGroupName, this.newGroupDescription);
      this.newGroupName = '';
      this.newGroupDescription = '';
      await this.loadAll();
    } catch (error) {
      alert('Failed to create group.');
    }
  }

  /**
   * Deletes a group and removes all its members
   * @param groupId - ID of the group to delete
   */
  async deleteGroup(groupId: number) {
    try {
      await this.groupService.deleteGroup(groupId);
      await this.loadAll();
    } catch (error) {
      alert('Failed to delete group.');
    }
  }

  /**
   * Logs out the admin user
   * Clears JWT token from localStorage and redirects to login
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}