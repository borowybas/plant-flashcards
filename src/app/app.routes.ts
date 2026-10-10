import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'cards', loadComponent: () => import('./cards/cards.page').then((m) => m.CardsPage) },
      { path: 'learn', loadComponent: () => import('./learn/learn.page').then((m) => m.LearnPage) },
      { path: 'settings', loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage) },
      { path: '', redirectTo: 'cards', pathMatch: 'full' },
    ],
  },
  { path: 'cards/new', loadComponent: () => import('./card-edit/card-edit.page').then((m) => m.CardEditPage) },
  { path: 'cards/bulk', loadComponent: () => import('./bulk-add/bulk-add.page').then((m) => m.BulkAddPage) },
  { path: 'cards/:id', loadComponent: () => import('./card-edit/card-edit.page').then((m) => m.CardEditPage) },
  { path: 'study', loadComponent: () => import('./study/study.page').then((m) => m.StudyPage) },
  { path: '', redirectTo: 'tabs/cards', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/cards' },
];
