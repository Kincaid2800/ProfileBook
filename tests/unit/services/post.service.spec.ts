import { TestBed } from '@angular/core/testing';
import axios from 'axios';

import { AuthService } from '../../../src/app/services/auth';
import { PostService } from '../../../src/app/services/post';

describe('PostService', () => {
  let service: PostService;
  let authServiceMock: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.restoreAllMocks();
    authServiceMock = {
      getToken: vi.fn().mockReturnValue('token-123'),
    };

    TestBed.configureTestingModule({
      providers: [
        PostService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(PostService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates posts with the active bearer token', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { postId: 1 },
    } as never);

    await service.createPost('Hello ProfileBook', '/uploads/post.png');

    expect(postSpy).toHaveBeenCalledWith(
      'https://localhost:7193/api/Post',
      { content: 'Hello ProfileBook', postImage: '/uploads/post.png' },
      { headers: { Authorization: 'Bearer token-123' } },
    );
  });

  it('likes posts through the protected endpoint', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { success: true },
    } as never);

    await service.likePost(42);

    expect(postSpy).toHaveBeenCalledWith(
      'https://localhost:7193/api/Post/42/like',
      {},
      { headers: { Authorization: 'Bearer token-123' } },
    );
  });

  it('uploads media using multipart form data and auth headers', async () => {
    const file = new File(['binary'], 'photo.png', { type: 'image/png' });
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { url: '/uploads/photo.png' },
    } as never);

    await service.uploadFile(file);

    const [url, body, config] = postSpy.mock.calls[0];

    expect(url).toBe('https://localhost:7193/api/Post/upload');
    expect(body).toBeInstanceOf(FormData);
    expect(config).toEqual({
      headers: {
        Authorization: 'Bearer token-123',
        'Content-Type': 'multipart/form-data',
      },
    });
  });
});
