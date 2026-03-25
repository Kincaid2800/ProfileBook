import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// AuthGuard — protects all authenticated routes from unauthenticated access.
//
// Implemented as a functional guard (CanActivateFn) rather than a class-based guard
// because Angular 15+ recommends the functional style — it's simpler, requires no
// class boilerplate, and inject() works directly inside the function.
//
// Without this guard, any user who knows the URL can navigate directly to /home or /admin
// without logging in. JWT tokens on API calls protect the data, but the page itself would
// still render — showing the shell of the app to an unauthenticated user.
//
// Flow:
//   1. Check localStorage for a valid JWT token (AuthService.isLoggedIn)
//   2. If present  → allow navigation (return true)
//   3. If absent   → redirect to /login and block navigation (return false)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // User is not authenticated — send them to login.
  // UrlTree return (not navigate + false) is preferred because Angular can cancel
  // the original navigation atomically, avoiding a brief flash of the protected route.
  return router.createUrlTree(['/login']);
};

// adminGuard — extends authGuard with an extra role check.
// Only users whose JWT payload contains Role = "Admin" are allowed through.
// A regular logged-in user who tries to visit /admin gets redirected to /home.
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Logged-in but not admin → send to home feed, not login
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/home']);
  }

  return router.createUrlTree(['/login']);
};
