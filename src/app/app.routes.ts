import { Routes } from '@angular/router';
import { WorkerBoardComponent } from './features/worker/worker-board.component';
import { AdminPortalComponent } from './features/admin/admin-portal.component';
import { AuthComponent } from './features/auth/auth.component';
import { ProfileComponent } from './features/profile/profile.component';
import { SupportComponent } from './features/support/support.component';

export const routes: Routes = [
  { path: '', component: WorkerBoardComponent, title: 'EventHub | Find event work' },
  { path: 'admin', component: AdminPortalComponent, title: 'EventHub Admin' },
  { path: 'auth', component: AuthComponent, title: 'EventHub | Sign in' },
  { path: 'profile', component: ProfileComponent, title: 'EventHub | Profile' },
  { path: 'support', component: SupportComponent, title: 'EventHub | Support' },
  { path: '**', redirectTo: '' }
];
