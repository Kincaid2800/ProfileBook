import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { LoginComponent } from '../../../src/app/components/login/login';
import { AuthService } from '../../../src/app/services/auth';

describe('LoginComponent', () => {
  let authServiceMock: { login: ReturnType<typeof vi.fn> };
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.restoreAllMocks();
    authServiceMock = {
      login: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(LoginComponent);
    return fixture.componentInstance;
  }

  it('starts with empty credentials', () => {
    const component = createComponent();

    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('blocks invalid form submissions before calling the auth service', async () => {
    const component = createComponent();
    component.email = 'invalid-email';
    component.password = '123456';

    await component.login();

    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please enter a valid email.');
  });

  it('navigates admins to the admin dashboard after login', async () => {
    const component = createComponent();
    authServiceMock.login.mockResolvedValue({ role: 'Admin' });
    component.email = 'admin@example.com';
    component.password = 'secret123';

    await component.login();

    expect(authServiceMock.login).toHaveBeenCalledWith('admin@example.com', 'secret123');
    expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
  });

  it('navigates members to the home feed after login', async () => {
    const component = createComponent();
    authServiceMock.login.mockResolvedValue({ role: 'User' });
    component.email = 'member@example.com';
    component.password = 'secret123';

    await component.login();

    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('shows a friendly error when login fails', async () => {
    const component = createComponent();
    authServiceMock.login.mockRejectedValue(new Error('Unauthorized'));
    component.email = 'member@example.com';
    component.password = 'secret123';

    await component.login();

    expect(component.errorMessage).toBe('Invalid email or password.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
