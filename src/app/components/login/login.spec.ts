import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { provideRouter } from '@angular/router';


 //Unit tests for LoginComponent
 //Tests cover: component creation, initial state, and client-side form validation
 //Run with: ng test
 
describe('LoginComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],       // Standalone component — imported directly
      providers: [provideRouter([])]   // Empty routes — we only need router to exist
    }).compileComponents();
  });

   // Test 1 — Smoke test
   //Verifies the component initializes without errors
   //If this fails, it means there's a broken import or injection issue
   
  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  
   //Test 2 — Initial state check
   //Verifies email and password fields start empty when component loads
   //Important: pre-filled login forms would be a security risk
   
  it('should have empty email and password initially', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  
   // Test 3 — Email format validation
   // Simulates a user typing an invalid email (no @ symbol)
   //validate() uses regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   //Expects errorMessage to be set — preventing the API call from firing
   
  it('should show error for invalid email', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    // Set an email without @ — should fail regex check
    component.email = 'invalid-email';
    component.password = '123456';

    // Trigger client-side validation directly
    component.validate();

    // Confirm the correct error message is shown to the user
    expect(component.errorMessage).toBe('Please enter a valid email.');
  });

});
