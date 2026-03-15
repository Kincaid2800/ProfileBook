import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PostService } from '../../services/post';
import { UserService } from '../../services/user';

// HomeComponent is the main feed page
// Users can create posts, like, comment and report users
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  // List of all approved posts shown in the feed
  posts: any[] = [];
  // Text content for new post being created
  newPostContent = '';
  // Success/error message shown after creating a post
  postMessage = '';
  // Stores comment text for each post separately using postId as key
  commentTexts: { [key: number]: string } = {};
  // Currently logged in username
  username = '';
  // Currently logged in username
  selectedFile: File | null = null;
  // Preview URL for selected file shown before posting
  filePreview: string | null = null;
  // Type of selected file - 'image' or 'video'
  fileType: string = '';

  // Injecting required services
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private router = inject(Router);

  async ngOnInit() {
    this.username = this.authService.getUsername() || '';
    await this.loadPosts();
  }

 // Fetch all approved posts from the API
  async loadPosts() {
    try {
      this.posts = await this.postService.getAllPosts();
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }
  
  // Create a new post with optional image/video
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

   // Handle file selection for photo/video upload
  // Creates a preview URL to show before posting
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
  // Remove selected file and clear preview
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
  // Report a user for inappropriate behavior
  // Shows a prompt to get the reason for reporting
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
  // Navigation methods
  goToSearch() {
  this.router.navigate(['/search']);
}

  goToMessages() {
    this.router.navigate(['/messages']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  goToGroups() {
  this.router.navigate(['/groups']);
}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}