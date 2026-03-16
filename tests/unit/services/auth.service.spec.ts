import { TestBed } from '@angular/core/testing';
import axios from 'axios';

import { AuthService } from '../../../src/app/services/auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('registers a new user through the API', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { message: 'Registered' },
    } as never);

    const result = await service.register('alice', 'alice@example.com', 'secret123');

    expect(postSpy).toHaveBeenCalledWith('https://localhost:7193/api/Auth/register', {
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret123',
    });
    expect(result).toEqual({ message: 'Registered' });
  });

  it('stores login details after a successful login', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        token: 'token-123',
        username: 'alice',
        role: 'User',
      },
    } as never);

    const result = await service.login('alice@example.com', 'secret123');

    expect(result).toEqual({
      token: 'token-123',
      username: 'alice',
      role: 'User',
    });
    expect(service.getToken()).toBe('token-123');
    expect(service.getUsername()).toBe('alice');
    expect(service.getRole()).toBe('User');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('identifies admin sessions from stored role data', () => {
    localStorage.setItem('role', 'Admin');

    expect(service.isAdmin()).toBe(true);
  });

  it('clears persisted session data on logout', () => {
    localStorage.setItem('token', 'token-123');
    localStorage.setItem('username', 'alice');
    localStorage.setItem('role', 'User');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getUsername()).toBeNull();
    expect(service.getRole()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
