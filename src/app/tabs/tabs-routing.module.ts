import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'start',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../start/start.module').then(m => m.StartPageModule)
          }
        ]
      },
      {
        path: 'micros',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../micros/micros.module').then(m => m.MicrosPageModule)
          },
          {
            path: ':stopCode',
            loadChildren: () =>
              import('../micros/micros.module').then(m => m.MicrosPageModule)
          }
        ]
      },
      {
        path: 'stops',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../stops/stops.module').then(m => m.StopsPageModule)
          }
        ]
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../map/map.module').then(m => m.MapPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/start',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/start',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
