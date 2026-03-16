import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AppComponent } from '../../src/app/app';
import { routes } from '../../src/app/app.routes';
import { AuthService } from '../../src/app/services/auth';
import { MessageService } from '../../src/app/services/message';
import { PostService } from '../../src/app/services/post';
import { UserService } from '../../src/app/services/user';
import { clickButtonByText } from '../support/dom-helpers';

describe('Home Navigation E2E', () => {
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        {
          provide: AuthService,
          useValue: {
            login: vi.fn(),
            register: vi.fn(),
            getUsername: vi.fn().mockReturnValue('Alice'),
            getToken: vi.fn().mockReturnValue('token-123'),
            isLoggedIn: vi.fn().mockReturnValue(true),
            logout: vi.fn(),
          },
        },
        {
          provide: PostService,
          useValue: {
            getAllPosts: vi.fn().mockResolvedValue([]),
            uploadFile: vi.fn(),
            createPost: vi.fn(),
            likePost: vi.fn(),
            addComment: vi.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            searchUsers: vi.fn().mockResolvedValue([]),
            reportUser: vi.fn(),
            getMyProfile: vi.fn().mockResolvedValue({
              username: 'Alice',
              email: 'alice@example.com',
              role: 'User',
              profileImage: null,
              createdAt: '2026-03-16T00:00:00Z',
            }),
            uploadProfilePicture: vi.fn(),
          },
        },
        {
          provide: MessageService,
          useValue: {
            getConversation: vi.fn().mockResolvedValue([]),
            sendMessage: vi.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
  });

  async function renderRoute(url: string) {
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('moves from the home feed to search and back again through visible buttons', async () => {
    await renderRoute('/home');

    expect(router.url).toBe('/home');
    expect(fixture.nativeElement.textContent).toContain('Hello, Alice');

    clickButtonByText(fixture.nativeElement, 'Search');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/search');
    expect(fixture.nativeElement.textContent).toContain('Search Users');

    clickButtonByText(fixture.nativeElement, 'Back to Home');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/home');
    expect(fixture.nativeElement.textContent).toContain('No posts yet');
  });
});
