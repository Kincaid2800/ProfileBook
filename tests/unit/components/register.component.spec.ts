import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { RegisterComponent } from '../../../src/app/components/register/register';
import { AuthService } from '../../../src/app/services/auth';

describe('RegisterComponent', () => {
  let authServiceMock: { register: ReturnType<typeof vi.fn> };
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.useRealTimers();

    authServiceMock = {
      register: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(RegisterComponent);
    return fixture.componentInstance;
  }

  it('starts with empty registration fields', () => {
    const component = createComponent();

    expect(component.username).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('validates short usernames before submitting', async () => {
    const component = createComponent();
    component.username = 'ab';
    component.email = 'user@example.com';
    component.password = 'secret123';

    await component.register();

    expect(authServiceMock.register).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Username must be at least 3 characters.');
  });

  it('shows a success message and redirects to login after registration', async () => {
    vi.useFakeTimers();
    const component = createComponent();
    authServiceMock.register.mockResolvedValue({ message: 'Registered' });
    component.username = 'alice';
    component.email = 'alice@example.com';
    component.password = 'secret123';

    await component.register();

    expect(authServiceMock.register).toHaveBeenCalledWith('alice', 'alice@example.com', 'secret123');
    expect(component.successMessage).toBe('Registered successfully! Redirecting to login...');

    await vi.advanceTimersByTimeAsync(2000);

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('surfaces a helpful error when registration fails', async () => {
    const component = createComponent();
    authServiceMock.register.mockRejectedValue(new Error('Conflict'));
    component.username = 'alice';
    component.email = 'alice@example.com';
    component.password = 'secret123';

    await component.register();

    expect(component.errorMessage).toBe('Registration failed. Email may already exist.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
