import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'list-detail',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/list-detail/list-detail.page').then(
        (m) => m.ListDetailPage
      ),
  },
  {
    path: 'search-movies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/search-movies/search-movies.page').then(
        (m) => m.SearchMoviesPage
      ),
  },
  {
    path: 'media-detail',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/media-detail/media-detail.page').then(
        (m) => m.MediaDetailPage
      ),
  },
  {
    path: 'select-list',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/select-list/select-list.page').then(
        (m) => m.SelectListPage
      ),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'edit-profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/edit-profile/edit-profile.page').then(
        (m) => m.EditProfilePage
      ),
  },
  {
    path: 'clan-detail',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/clan-detail/clan-detail.page').then(
        (m) => m.ClanDetailPage
      ),
  },
  {
    path: 'select-clan',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/select-clan/select-clan.page').then(
        (m) => m.SelectClanPage
      ),
  },
];
