import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'list-detail',
    loadComponent: () =>
      import('./pages/list-detail/list-detail.page').then(
        (m) => m.ListDetailPage
      ),
  },
  {
    path: 'search-movies',
    loadComponent: () =>
      import('./pages/search-movies/search-movies.page').then(
        (m) => m.SearchMoviesPage
      ),
  },
  {
    path: 'media-detail',
    loadComponent: () =>
      import('./pages/media-detail/media-detail.page').then(
        (m) => m.MediaDetailPage
      ),
  },
  {
    path: 'select-list',
    loadComponent: () =>
      import('./pages/select-list/select-list.page').then(
        (m) => m.SelectListPage
      ),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./pages/edit-profile/edit-profile.page').then( m => m.EditProfilePage)
  },
  {
    path: 'clan-detail',
    loadComponent: () => import('./pages/clan-detail/clan-detail.page').then( m => m.ClanDetailPage)
  },
  {
    path: 'select-clan',
    loadComponent: () => import('./pages/select-clan/select-clan.page').then( m => m.SelectClanPage)
  },
];
