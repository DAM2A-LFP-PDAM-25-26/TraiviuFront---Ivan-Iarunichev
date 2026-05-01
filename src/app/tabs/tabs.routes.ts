import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'catalog',
        loadComponent: () =>
          import('../tabs/catalog/catalog.page').then((m) => m.CatalogPage),
      },
      {
        path: 'lists',
        loadComponent: () =>
          import('../tabs/lists/lists.page').then((m) => m.ListsPage),
      },
      {
        path: 'clans',
        loadComponent: () =>
          import('../tabs/clans/clans.page').then((m) => m.ClansPage),
      },
      {
        path: 'lists/:id',
        loadComponent: () =>
          import('../pages/list-detail/list-detail.page').then(
            (m) => m.ListDetailPage
          ),
      },
      {
        path: 'clans/:clanId',
        loadComponent: () =>
          import('../pages/clan-detail/clan-detail.page').then(
            (m) => m.ClanDetailPage
          ),
      },
      {
        path: 'search-movies/:id',
        loadComponent: () =>
          import('../pages/search-movies/search-movies.page').then(
            (m) => m.SearchMoviesPage
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'edit-profile',
        loadComponent: () =>
          import('../pages/edit-profile/edit-profile.page').then(
            (m) => m.EditProfilePage
          ),
      },
      {
        path: '',
        redirectTo: 'catalog',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
