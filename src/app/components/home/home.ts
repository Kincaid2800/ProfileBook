import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FeedPost, PostComment, PostService } from '../../services/post';
import { UserService } from '../../services/user';

// ToastService replaces the old inline error string approach —
// one call here and the notification appears globally without touching the template

import { ToastService } from '../../services/toast';

// TimeAgoPipe converts raw ISO timestamps (e.g. "2026-03-24T10:00:00") to "2 hours ago"
// so post dates feel natural rather than like log entries

import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

// AvatarComponent uses ViewEncapsulation.ShadowDom — imported here to demonstrate
// all three encapsulation modes in one feature: ShadowDom (Avatar), Emulated (Home), None (Toast)
import { AvatarComponent } from '../avatar/avatar';

// ViewEncapsulation.Emulated is Angular's default, but we set it explicitly here
// to document the decision — HomeComponent has a large stylesheet (post cards, avatars,
// action buttons, character counter, feed layout) and class names like .avatar, .card,
// .action-btn that also exist in other components (MessagesComponent, GroupsComponent).
//

// Without Emulated, those styles would collide. Angular solves this by rewriting every
// CSS rule to include a unique attribute selector it stamps onto the component's DOM:
//   .avatar { ... }  →  .avatar[_ngcontent-xyz-c0] { ... }

// That suffix makes it impossible for HomeComponent's .avatar to affect any other component,
// even if they use the exact same class name. This is the style scoping problem SPAs face
// that plain HTML/CSS never had to deal with — global CSS in a multi-component app is chaos.
@Component({
  selector: 'app-home',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,

  // TimeAgoPipe declared here in imports so we can use it directly in the template
  // without a separate shared module — standalone components handle their own dependencies
  imports: [CommonModule, FormsModule, TimeAgoPipe, AvatarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  posts: FeedPost[] = [];
  newPostContent = '';
  commentTexts: { [key: number]: string } = {};
  // 500 characters felt like the right ceiling — long enough for a real thought,
  // short enough to keep the feed scannable. readonly prevents accidental mutation.
  readonly maxPostLength = 500;
  username = '';
  selectedFile: File | null = null;
  filePreview: string | null = null;
  fileType = '';

  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private router = inject(Router);
  // ToastService injected so we can replace raw try/catch silent failures with visible user feedback
  private toastService = inject(ToastService);

  async ngOnInit() {
    this.username = this.authService.getUsername() || '';
    await this.loadPosts();
  }

  async loadPosts() {
    const previousUiState = new Map(this.posts.map(post => [post.postId, {
      showComments: post.showComments ?? false,
      isLikePending: post.isLikePending ?? false,
      isCommentPending: post.isCommentPending ?? false
    }]));

    try {
      const posts = await this.postService.getAllPosts();
      this.posts = posts.map(post => {
        const uiState = previousUiState.get(post.postId);
        return {
          ...post,
          showComments: uiState?.showComments ?? false,
          isLikePending: false,
          isCommentPending: false
        };
      });
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
      // "submitted for approval" rather than "posted" — honest with the user that an admin
      // still needs to approve it before it appears in the public feed
      this.toastService.show('Post submitted for approval!', 'success');
      this.newPostContent = '';
      this.selectedFile = null;
      this.filePreview = null;
      this.fileType = '';
    } catch (error) {
      // Show a toast on failure — previously this was a silent console.error that the user never saw
      this.toastService.show('Failed to create post.', 'error');
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
    const post = this.posts.find(currentPost => currentPost.postId === postId);
    if (!post || post.isLikePending) {
      return;
    }

    const previousLikedState = post.isLikedByCurrentUser;
    const previousLikesCount = post.likesCount;

    post.isLikePending = true;
    post.isLikedByCurrentUser = !previousLikedState;
    post.likesCount = Math.max(0, previousLikesCount + (previousLikedState ? -1 : 1));

    try {
      const likeResult = await this.postService.likePost(postId);
      post.isLikedByCurrentUser = likeResult.liked;
      if (likeResult.likesCount >= 0) {
        post.likesCount = likeResult.likesCount;
      }
    } catch (error) {
      post.isLikedByCurrentUser = previousLikedState;
      post.likesCount = previousLikesCount;
      console.error('Error liking post:', error);
    } finally {
      post.isLikePending = false;
    }
  }

  async addComment(postId: number, content: string) {
    const post = this.posts.find(currentPost => currentPost.postId === postId);
    const trimmedContent = content?.trim();

    if (!post || post.isCommentPending || !trimmedContent) {
      return;
    }

    const tempCommentId = -Date.now();
    const optimisticComment: PostComment = {
      commentId: tempCommentId,
      content: trimmedContent,
      username: this.username || 'You',
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    post.showComments = true;
    post.isCommentPending = true;
    post.comments = [...post.comments, optimisticComment];
    this.commentTexts[postId] = '';

    try {
      const createdComment = await this.postService.addComment(postId, trimmedContent);
      post.comments = post.comments.map(comment =>
        comment.commentId === tempCommentId
          ? { ...(createdComment ?? optimisticComment), isOptimistic: false }
          : comment
      );
    } catch (error) {
      post.comments = post.comments.filter(comment => comment.commentId !== tempCommentId);
      this.commentTexts[postId] = trimmedContent;
      console.error('Error adding comment:', error);
    } finally {
      post.isCommentPending = false;
    }
  }

  toggleComments(post: FeedPost) {
    post.showComments = !post.showComments;
  }

  async deletePost(postId: number) {
    // Optimistic removal — pull the post out of the array immediately so the UI
    // feels instant. If the API call fails, we put it back where it was.
    const index = this.posts.findIndex(p => p.postId === postId);
    if (index === -1) return;
    const [removed] = this.posts.splice(index, 1);

    try {
      await this.postService.deletePost(postId);
      this.toastService.show('Post deleted.', 'info');
    } catch {
      // Restore the post at its original position so the user doesn't lose it
      this.posts.splice(index, 0, removed);
      this.toastService.show('Failed to delete post.', 'error');
    }
  }

  async reportUser(username: string, userId: number) {
    const reason = prompt(`Why are you reporting ${username}?`);
    if (!reason || !userId) return;

    try {
      await this.userService.reportUser(userId, reason);
      // Toast replaces the old alert() call — same user feedback, but non-blocking
      // and consistent with every other notification in the app
      this.toastService.show('User reported successfully!', 'success');
    } catch (error) {
      this.toastService.show('Failed to report user.', 'error');
    }
  }

  trackByPostId(_: number, post: FeedPost) {
    return post.postId;
  }

  trackByCommentId(_: number, comment: PostComment) {
    return comment.commentId;
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

  goToGroups() {
    this.router.navigate(['/groups']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
