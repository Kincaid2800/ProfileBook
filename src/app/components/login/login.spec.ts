import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have empty email and password initially', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should show error for invalid email', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.email = 'invalid-email';
    component.password = '123456';
    component.validate();
    expect(component.errorMessage).toBe('Please enter a valid email.');
  });
});
