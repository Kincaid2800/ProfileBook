import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HomeComponent } from './components/home/home';
import { AdminComponent } from './components/admin/admin';
import { MessagesComponent } from './components/messages/messages';
import { ProfileComponent } from './components/profile/profile';
import { SearchComponent } from './components/search/search';
import { GroupsComponent } from './components/groups/groups';
// authGuard protects all post-login routes — unauthenticated users are redirected to /login.
// adminGuard adds a role check on top — non-admin users who somehow reach /admin go to /home.
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Public routes — no guard needed, these are the entry points for unauthenticated users
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Protected routes — authGuard checks for a valid JWT token in localStorage before allowing access
  { path: 'home',     component: HomeComponent,     canActivate: [authGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: 'profile',  component: ProfileComponent,  canActivate: [authGuard] },
  { path: 'search',   component: SearchComponent,   canActivate: [authGuard] },
  { path: 'groups',   component: GroupsComponent,   canActivate: [authGuard] },
  // Admin-only route — adminGuard checks both isLoggedIn() AND isAdmin() before allowing access
  { path: 'admin',    component: AdminComponent,    canActivate: [adminGuard] },
];
