import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AppComponent } from '../../src/app/app';
import { routes } from '../../src/app/app.routes';
import { AuthService } from '../../src/app/services/auth';
import { MessageService } from '../../src/app/services/message';
import { PostService } from '../../src/app/services/post';
import { UserService } from '../../src/app/services/user';
import { clickSelector, typeText } from '../support/dom-helpers';

describe('Authentication Flow E2E', () => {
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    getUsername: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let postServiceMock: {
    getAllPosts: ReturnType<typeof vi.fn>;
  };
  let userServiceMock: {
    searchUsers: ReturnType<typeof vi.fn>;
    reportUser: ReturnType<typeof vi.fn>;
    getMyProfile: ReturnType<typeof vi.fn>;
    uploadProfilePicture: ReturnType<typeof vi.fn>;
  };
  let messageServiceMock: {
    getConversation: ReturnType<typeof vi.fn>;
    sendMessage: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.useRealTimers();

    authServiceMock = {
      login: vi.fn(),
      register: vi.fn(),
      getUsername: vi.fn().mockReturnValue('Alice'),
      getToken: vi.fn().mockReturnValue('token-123'),
      isLoggedIn: vi.fn().mockReturnValue(true),
      logout: vi.fn(),
    };
    postServiceMock = {
      getAllPosts: vi.fn().mockResolvedValue([]),
    };
    userServiceMock = {
      searchUsers: vi.fn().mockResolvedValue([]),
      reportUser: vi.fn().mockResolvedValue({}),
      getMyProfile: vi.fn().mockResolvedValue({
        username: 'Alice',
        email: 'alice@example.com',
        role: 'User',
        profileImage: null,
        createdAt: '2026-03-16T00:00:00Z',
      }),
      uploadProfilePicture: vi.fn().mockResolvedValue({ url: '/profiles/alice.png' }),
    };
    messageServiceMock = {
      getConversation: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn().mockResolvedValue({}),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function renderRoute(url: string) {
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('redirects the root route to login and opens the registration page from the login screen', async () => {
    await renderRoute('/');

    expect(router.url).toBe('/login');
    expect(fixture.nativeElement.textContent).toContain('Welcome back');

    clickSelector(fixture.nativeElement, 'a[routerLink="/register"]');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/register');
    expect(fixture.nativeElement.textContent).toContain('Create account');
  });

  it('submits valid login credentials and lands on the home feed', async () => {
    authServiceMock.login.mockResolvedValue({ role: 'User' });

    await renderRoute('/login');

    typeText(fixture.nativeElement, 'input[type="email"]', 'alice@example.com');
    typeText(fixture.nativeElement, 'input[type="password"]', 'secret123');
    clickSelector(fixture.nativeElement, 'button.auth-btn');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(authServiceMock.login).toHaveBeenCalledWith('alice@example.com', 'secret123');
    expect(router.url).toBe('/home');
    expect(postServiceMock.getAllPosts).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Hello, Alice');
  });

  it('completes the registration flow and redirects back to login', async () => {
    authServiceMock.register.mockResolvedValue({ message: 'Registered' });

    await renderRoute('/register');

    typeText(fixture.nativeElement, 'input[type="text"]', 'alice');
    typeText(fixture.nativeElement, 'input[type="email"]', 'alice@example.com');
    typeText(fixture.nativeElement, 'input[type="password"]', 'secret123');
    clickSelector(fixture.nativeElement, 'button.auth-btn');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(authServiceMock.register).toHaveBeenCalledWith('alice', 'alice@example.com', 'secret123');
    expect(fixture.nativeElement.textContent).toContain('Registered successfully! Redirecting to login...');

    await new Promise((resolve) => setTimeout(resolve, 2100));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/login');
  }, 8000);
});


