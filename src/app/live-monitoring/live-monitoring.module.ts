import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LiveMonitoringPageRoutingModule } from './live-monitoring-routing.module';

import { LiveMonitoringPage } from './live-monitoring.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LiveMonitoringPageRoutingModule
  ],
  declarations: [LiveMonitoringPage]
})
export class LiveMonitoringPageModule {}
