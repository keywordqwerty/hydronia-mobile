import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiveMonitoringPage } from './live-monitoring.page';

const routes: Routes = [
  {
    path: '',
    component: LiveMonitoringPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiveMonitoringPageRoutingModule {}
