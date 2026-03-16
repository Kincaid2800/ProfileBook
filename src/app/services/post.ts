import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth';

export interface PostComment {
  commentId: number;
  content: string;
  username: string;
  createdAt: string;
  isOptimistic?: boolean;
}

export interface FeedPost {
  postId: number;
  userId: number;
  content: string;
  postImage: string | null;
  status: string;
  username: string;
  createdAt: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  comments: PostComment[];
  showComments?: boolean;
  isLikePending?: boolean;
  isCommentPending?: boolean;
}

export interface LikePostResponse {
  liked: boolean;
  likesCount: number;
}

function readNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'https://localhost:7193/api/Post';

  constructor(private authService: AuthService) {}

  private getHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    };
  }

  private normalizeComment(raw: any): PostComment {
    return {
      commentId: readNumber(raw?.commentId ?? raw?.CommentId),
      content: readString(raw?.content ?? raw?.Content),
      username: readString(raw?.username ?? raw?.Username),
      createdAt: readString(raw?.createdAt ?? raw?.CreatedAt)
    };
  }

  private normalizePost(raw: any): FeedPost {
    const rawComments = raw?.comments ?? raw?.Comments;
    const comments = Array.isArray(rawComments)
      ? rawComments.map((comment: any) => this.normalizeComment(comment))
      : [];

    return {
      postId: readNumber(raw?.postId ?? raw?.PostId),
      userId: readNumber(raw?.userId ?? raw?.UserId),
      content: readString(raw?.content ?? raw?.Content),
      postImage: readString(raw?.postImage ?? raw?.PostImage) || null,
      status: readString(raw?.status ?? raw?.Status),
      username: readString(raw?.username ?? raw?.Username),
      createdAt: readString(raw?.createdAt ?? raw?.CreatedAt),
      likesCount: readNumber(raw?.likesCount ?? raw?.LikesCount),
      isLikedByCurrentUser: readBoolean(raw?.isLikedByCurrentUser ?? raw?.IsLikedByCurrentUser),
      comments,
      showComments: false,
      isLikePending: false,
      isCommentPending: false
    };
  }

  async getAllPosts(): Promise<FeedPost[]> {
    const response = await axios.get(this.apiUrl, {
      params: { _: Date.now() },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    });

    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(post => this.normalizePost(post));
  }

  async createPost(content: string, postImage: string | null = null) {
    const response = await axios.post(
      this.apiUrl,
      { content, postImage },
      this.getHeaders()
    );
    return response.data;
  }

  async likePost(postId: number): Promise<LikePostResponse> {
    const response = await axios.post(
      `${this.apiUrl}/${postId}/like`,
      {},
      this.getHeaders()
    );

    if (typeof response.data === 'string') {
      const responseText = response.data.toLowerCase();
      return {
        liked: !responseText.includes('unliked'),
        likesCount: -1
      };
    }

    return {
      liked: readBoolean(response.data?.liked ?? response.data?.Liked),
      likesCount: readNumber(response.data?.likesCount ?? response.data?.LikesCount)
    };
  }

  async addComment(postId: number, content: string): Promise<PostComment | null> {
    const response = await axios.post(
      `${this.apiUrl}/${postId}/comment`,
      { content },
      this.getHeaders()
    );

    if (response.data && typeof response.data === 'object') {
      return this.normalizeComment(response.data);
    }

    return null;
  }

  async getPendingPosts() {
    const response = await axios.get(
      `${this.apiUrl}/pending`,
      this.getHeaders()
    );
    return response.data;
  }

  async approvePost(postId: number) {
    const response = await axios.put(
      `${this.apiUrl}/${postId}/approve`,
      {},
      this.getHeaders()
    );
    return response.data;
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(
      `${this.apiUrl}/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
}
