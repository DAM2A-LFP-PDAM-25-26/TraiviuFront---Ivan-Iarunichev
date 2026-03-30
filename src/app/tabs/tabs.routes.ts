import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'catalog',
        loadComponent: () => import('../tabs/catalog/catalog.page').then((m) => m.CatalogPage),
      },
      {
        path: 'lists',
        loadComponent: () => import('../tabs/lists/lists.page').then((m) => m.ListsPage),
      },
      {
        path: 'clans',
        loadComponent: () => import('../tabs/clans/clans.page').then((m) => m.ClansPage),
      },
      {
        path: '',
        redirectTo: '/tabs/catalog',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/catalog',
    pathMatch: 'full',
  },
];
