import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'live-monitoring',
    loadChildren: () => import('./live-monitoring/live-monitoring.module').then( m => m.LiveMonitoringPageModule)
  },
  {
    path: 'plantimages',
    loadChildren: () => import('./plantimages/plantimages.module').then( m => m.PlantimagesPageModule)
  },
  {
    path: 'predictions',
    loadChildren: () => import('./predictions/predictions.module').then( m => m.PredictionsPageModule)
  },
  {
    path: 'manuallogs',
    loadChildren: () => import('./manuallogs/manuallogs.module').then( m => m.ManuallogsPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
