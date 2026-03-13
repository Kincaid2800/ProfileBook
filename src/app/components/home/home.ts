import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PostService } from '../../services/post';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  posts: any[] = [];
  newPostContent = '';
  postMessage = '';
  commentTexts: { [key: number]: string } = {};
  username = '';
  selectedFile: File | null = null;
  filePreview: string | null = null;
  fileType: string = '';

  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private router = inject(Router);

  async ngOnInit() {
    this.username = this.authService.getUsername() || '';
    await this.loadPosts();
  }

  async loadPosts() {
    try {
      this.posts = await this.postService.getAllPosts();
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  async createPost() {
    try {
      let fileUrl = null;
      if (this.selectedFile) {
        const uploadResult = await this.postService.uploadFile(this.selectedFile);
        fileUrl = uploadResult.url;
      }
      await this.postService.createPost(this.newPostContent, fileUrl);
      this.postMessage = 'Post submitted for approval!';
      this.newPostContent = '';
      this.selectedFile = null;
      this.filePreview = null;
      this.fileType = '';
    } catch (error) {
      this.postMessage = 'Failed to create post.';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileType = file.type.startsWith('video') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileType = '';
  }

  async likePost(postId: number) {
    try {
      await this.postService.likePost(postId);
      await this.loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }

  async addComment(postId: number, content: string) {
    try {
      await this.postService.addComment(postId, this.commentTexts[postId]);
      this.commentTexts[postId] = '';
      await this.loadPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }
  async reportUser(username: string, userId: number) {
  const reason = prompt(`Why are you reporting ${username}?`);
  if (!reason) return;
  try {
    await this.userService.reportUser(userId, reason);
    alert('User reported successfully!');
  } catch (error) {
    alert('Failed to report user.');
  }
}
  goToSearch() {
  this.router.navigate(['/search']);
}

  goToMessages() {
    this.router.navigate(['/messages']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}