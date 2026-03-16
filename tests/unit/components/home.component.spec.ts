import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { HomeComponent } from '../../../src/app/components/home/home';
import { AuthService } from '../../../src/app/services/auth';
import { PostService } from '../../../src/app/services/post';
import { UserService } from '../../../src/app/services/user';

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
  };
  let userServiceMock: {
    reportUser: ReturnType<typeof vi.fn>;
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
          comments: [],
        },
      ]),
      uploadFile: vi.fn(),
      createPost: vi.fn().mockResolvedValue({}),
      likePost: vi.fn().mockResolvedValue({}),
      addComment: vi.fn().mockResolvedValue({}),
    };
    userServiceMock = {
      reportUser: vi.fn().mockResolvedValue({}),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: UserService, useValue: userServiceMock },
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

  it('uploads the selected file before creating a post', async () => {
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
    expect(component.postMessage).toBe('Post submitted for approval!');
    expect(component.newPostContent).toBe('');
    expect(component.selectedFile).toBeNull();
    expect(component.filePreview).toBeNull();
    expect(component.fileType).toBe('');
  });

  it('clears comment drafts and refreshes the feed after posting a comment', async () => {
    const component = createComponent();
    component.commentTexts[42] = 'Nice post';

    await component.addComment(42, component.commentTexts[42]);

    expect(postServiceMock.addComment).toHaveBeenCalledWith(42, 'Nice post');
    expect(component.commentTexts[42]).toBe('');
    expect(postServiceMock.getAllPosts).toHaveBeenCalled();
  });

  it('logs out and returns the user to the login route', () => {
    const component = createComponent();

    component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
