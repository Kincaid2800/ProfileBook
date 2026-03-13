import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PostService } from '../../services/post';
import { UserService } from '../../services/user';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  pendingPosts: any[] = [];
  users: any[] = [];
  reports: any[] = [];
  groups: any[] = [];
  activeTab = 'posts';
  newGroupName = '';
  newGroupDescription = '';
  editingUserId: number | null = null;
  editUsername = '';
  editEmail = '';

  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  async ngOnInit() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/home']);
      return;
    }
    await this.loadAll();
  }

  async loadAll() {
    this.pendingPosts = await this.postService.getPendingPosts();
    this.users = await this.userService.getAllUsers();
    this.reports = await this.userService.getReports();
    this.groups = await this.groupService.getAllGroups();
  }

  async approvePost(postId: number) {
    await this.postService.approvePost(postId);
    await this.loadAll();
  }

  async deleteUser(userId: number) {
    await this.userService.deleteUser(userId);
    await this.loadAll();
  }

  startEdit(user: any) {
    this.editingUserId = user.userId;
    this.editUsername = user.username;
    this.editEmail = user.email;
  }

  cancelEdit() {
    this.editingUserId = null;
    this.editUsername = '';
    this.editEmail = '';
  }

  async saveEdit(userId: number) {
    try {
      await this.userService.updateUser(userId, this.editUsername, this.editEmail);
      this.cancelEdit();
      await this.loadAll();
    } catch (error) {
      alert('Failed to update user.');
    }
  }

  async createGroup() {
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

  async deleteGroup(groupId: number) {
    try {
      await this.groupService.deleteGroup(groupId);
      await this.loadAll();
    } catch (error) {
      alert('Failed to delete group.');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}