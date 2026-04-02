import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
  },
  {
    path: 'list-detail',
    loadComponent: () => import('./pages/list-detail/list-detail.page').then( m => m.ListDetailPage)
  },
];
