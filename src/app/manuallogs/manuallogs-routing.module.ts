import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManuallogsPage } from './manuallogs.page';

const routes: Routes = [
  {
    path: '',
    component: ManuallogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManuallogsPageRoutingModule {}
