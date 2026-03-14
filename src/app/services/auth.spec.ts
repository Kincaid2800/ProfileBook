import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when not logged in', () => {
    localStorage.removeItem('token');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should return true when token exists', () => {
    localStorage.setItem('token', 'test-token');
    expect(service.isLoggedIn()).toBe(true);
    localStorage.removeItem('token');
  });

  it('should return null token when not logged in', () => {
    localStorage.removeItem('token');
    expect(service.getToken()).toBeNull();
  });

  it('should return false for isAdmin when role is User', () => {
    localStorage.setItem('role', 'User');
    expect(service.isAdmin()).toBe(false);
    localStorage.removeItem('role');
  });

  it('should return true for isAdmin when role is Admin', () => {
    localStorage.setItem('role', 'Admin');
    expect(service.isAdmin()).toBe(true);
    localStorage.removeItem('role');
  });

  it('should clear storage on logout', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('username', 'testuser');
    localStorage.setItem('role', 'User');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});