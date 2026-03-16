import { TestBed } from '@angular/core/testing';
import axios from 'axios';

import { AuthService } from '../../../src/app/services/auth';
import { UserService } from '../../../src/app/services/user';

describe('UserService', () => {
  let service: UserService;
  let authServiceMock: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.restoreAllMocks();
    authServiceMock = {
      getToken: vi.fn().mockReturnValue('token-123'),
    };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(UserService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('searches users with the active auth header', async () => {
    const getSpy = vi.spyOn(axios, 'get').mockResolvedValue({
      data: [{ userId: 1, username: 'alice' }],
    } as never);

    const result = await service.searchUsers('alice');

    expect(getSpy).toHaveBeenCalledWith(
      'https://localhost:7193/api/User/search?username=alice',
      { headers: { Authorization: 'Bearer token-123' } },
    );
    expect(result).toEqual([{ userId: 1, username: 'alice' }]);
  });

  it('encodes report reasons before sending them to the API', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { success: true },
    } as never);

    await service.reportUser(7, 'Spam & abuse');

    expect(postSpy).toHaveBeenCalledWith(
      'https://localhost:7193/api/User/report?reportedUserId=7&reason=Spam%20%26%20abuse',
      {},
      { headers: { Authorization: 'Bearer token-123' } },
    );
  });

  it('loads the current profile with the bearer token', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const getSpy = vi.spyOn(axios, 'get').mockResolvedValue({
      data: { username: 'alice' },
    } as never);

    const result = await service.getMyProfile();

    expect(getSpy).toHaveBeenCalledWith(
      'https://localhost:7193/api/User/profile',
      { headers: { Authorization: 'Bearer token-123' } },
    );
    expect(result).toEqual({ username: 'alice' });
    consoleSpy.mockRestore();
  });
});
