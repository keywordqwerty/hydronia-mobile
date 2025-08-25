import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PredictionsPage } from './predictions.page';

const routes: Routes = [
  {
    path: '',
    component: PredictionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PredictionsPageRoutingModule {}
