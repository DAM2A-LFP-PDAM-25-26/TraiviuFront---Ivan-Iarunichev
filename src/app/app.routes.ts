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
  {
    path: 'search-movies',
    loadComponent: () => import('./pages/search-movies/search-movies.page').then( m => m.SearchMoviesPage)
  },
  {
    path: 'media-detail',
    loadComponent: () => import('./pages/media-detail/media-detail.page').then( m => m.MediaDetailPage)
  },
  {
    path: 'select-list',
    loadComponent: () => import('./pages/select-list/select-list.page').then( m => m.SelectListPage)
  },
];
