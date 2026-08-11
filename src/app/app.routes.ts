import { Routes } from '@angular/router';
import { WorkerBoardComponent } from './features/worker/worker-board.component';
import { AdminPortalComponent } from './features/admin/admin-portal.component';

export const routes: Routes = [
  { path: '', component: WorkerBoardComponent, title: 'EventHub | Find event work' },
  { path: 'admin', component: AdminPortalComponent, title: 'EventHub Admin' },
  { path: '**', redirectTo: '' }
];
