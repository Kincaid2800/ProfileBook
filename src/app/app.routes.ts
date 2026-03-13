import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HomeComponent } from './components/home/home';
import { AdminComponent } from './components/admin/admin';
import { MessagesComponent } from './components/messages/messages';
import { ProfileComponent } from './components/profile/profile';
import { SearchComponent } from './components/search/search';
import { GroupsComponent } from './components/groups/groups';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'search', component: SearchComponent },
  { path: 'groups', component: GroupsComponent },
  
];