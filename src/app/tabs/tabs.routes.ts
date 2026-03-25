import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'catalog',
        loadComponent: () =>
          import('./catalog/catalog.page').then(m => m.CatalogPage),
      },
      {
        path: 'lists',
        loadComponent: () =>
          import('./lists/lists.page').then(m => m.ListsPage),
      },
      {
        path: 'clans',
        loadComponent: () =>
          import('./clans/clans.page').then(m => m.ClansPage),
      },
      {
        path: '',
        redirectTo: 'catalog',
        pathMatch: 'full',
      },
    ],
  }
];
