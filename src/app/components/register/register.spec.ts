import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have empty fields initially', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    expect(component.username).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should show error for short username', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    component.username = 'ab';
    component.validate();
    expect(component.errorMessage).toBe('Username must be at least 3 characters.');
  });
});