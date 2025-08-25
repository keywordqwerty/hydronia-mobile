import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlantimagesPage } from './plantimages.page';

const routes: Routes = [
  {
    path: '',
    component: PlantimagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlantimagesPageRoutingModule {}
