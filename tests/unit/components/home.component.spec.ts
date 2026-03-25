import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { HomeComponent } from '../../../src/app/components/home/home';
import { AuthService } from '../../../src/app/services/auth';
import { PostService } from '../../../src/app/services/post';
import { UserService } from '../../../src/app/services/user';
import { ToastService } from '../../../src/app/services/toast';

describe('HomeComponent', () => {
  let authServiceMock: {
    getUsername: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let postServiceMock: {
    getAllPosts: ReturnType<typeof vi.fn>;
    uploadFile: ReturnType<typeof vi.fn>;
    createPost: ReturnType<typeof vi.fn>;
    likePost: ReturnType<typeof vi.fn>;
    addComment: ReturnType<typeof vi.fn>;
    // deletePost added — HomeComponent now supports deleting your own posts
    deletePost: ReturnType<typeof vi.fn>;
  };
  let userServiceMock: {
    reportUser: ReturnType<typeof vi.fn>;
  };
  // ToastService mock — createPost/deletePost show toasts instead of setting a property
  let toastServiceMock: {
    show: ReturnType<typeof vi.fn>;
  };
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.restoreAllMocks();

    authServiceMock = {
      getUsername: vi.fn().mockReturnValue('Alice'),
      logout: vi.fn(),
    };
    postServiceMock = {
      getAllPosts: vi.fn().mockResolvedValue([
        {
          postId: 1,
          username: 'Bob',
          createdAt: '2026-03-16T00:00:00Z',
          content: 'Hello world',
          likesCount: 0,
          isLikedByCurrentUser: false,
          comments: [],
          showComments: false,
          isLikePending: false,
          isCommentPending: false,
        },
      ]),
      uploadFile: vi.fn(),
      createPost: vi.fn().mockResolvedValue({}),
      likePost: vi.fn().mockResolvedValue({ liked: true, likesCount: 1 }),
      addComment: vi.fn().mockResolvedValue({ commentId: 99, content: 'Nice post', username: 'Alice', createdAt: new Date().toISOString() }),
      deletePost: vi.fn().mockResolvedValue(undefined),
    };
    userServiceMock = {
      reportUser: vi.fn().mockResolvedValue({}),
    };
    toastServiceMock = {
      show: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(HomeComponent);
    return fixture.componentInstance;
  }

  it('loads the current username and feed posts on init', async () => {
    const component = createComponent();

    await component.ngOnInit();

    expect(authServiceMock.getUsername).toHaveBeenCalled();
    expect(postServiceMock.getAllPosts).toHaveBeenCalled();
    expect(component.username).toBe('Alice');
    expect(component.posts).toHaveLength(1);
  });

  it('uploads the selected file before creating a post and shows a success toast', async () => {
    const component = createComponent();
    const file = new File(['image'], 'post.png', { type: 'image/png' });
    postServiceMock.uploadFile.mockResolvedValue({ url: '/uploads/post.png' });
    component.newPostContent = 'A new post';
    component.selectedFile = file;
    component.filePreview = 'preview-data';
    component.fileType = 'image';

    await component.createPost();

    expect(postServiceMock.uploadFile).toHaveBeenCalledWith(file);
    expect(postServiceMock.createPost).toHaveBeenCalledWith('A new post', '/uploads/post.png');
    // postMessage was replaced with toastService.show() — the property no longer exists
    expect(toastServiceMock.show).toHaveBeenCalledWith('Post submitted for approval!', 'success');
    expect(component.newPostContent).toBe('');
    expect(component.selectedFile).toBeNull();
    expect(component.filePreview).toBeNull();
    expect(component.fileType).toBe('');
  });

  it('adds a comment optimistically without reloading the full feed', async () => {
    const component = createComponent();
    await component.ngOnInit();

    const callsBefore = postServiceMock.getAllPosts.mock.calls.length;
    component.commentTexts[1] = 'Nice post';

    await component.addComment(1, component.commentTexts[1]);

    expect(postServiceMock.addComment).toHaveBeenCalledWith(1, 'Nice post');
    expect(component.commentTexts[1]).toBe('');
    // addComment is now optimistic — it does NOT reload getAllPosts after each comment
    expect(postServiceMock.getAllPosts.mock.calls.length).toBe(callsBefore);
  });

  it('removes the post immediately on delete and shows an info toast', async () => {
    const component = createComponent();
    await component.ngOnInit();
    expect(component.posts).toHaveLength(1);

    await component.deletePost(1);

    expect(postServiceMock.deletePost).toHaveBeenCalledWith(1);
    expect(component.posts).toHaveLength(0);
    expect(toastServiceMock.show).toHaveBeenCalledWith('Post deleted.', 'info');
  });

  it('restores the post if the delete API call fails', async () => {
    const component = createComponent();
    await component.ngOnInit();
    postServiceMock.deletePost.mockRejectedValue(new Error('Server error'));

    await component.deletePost(1);

    // Post should be restored to the array on failure — optimistic rollback
    expect(component.posts).toHaveLength(1);
    expect(toastServiceMock.show).toHaveBeenCalledWith('Failed to delete post.', 'error');
  });

  it('logs out and returns the user to the login route', () => {
    const component = createComponent();

    component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
