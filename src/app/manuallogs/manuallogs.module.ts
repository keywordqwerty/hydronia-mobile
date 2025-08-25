import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManuallogsPageRoutingModule } from './manuallogs-routing.module';

import { ManuallogsPage } from './manuallogs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManuallogsPageRoutingModule
  ],
  declarations: [ManuallogsPage]
})
export class ManuallogsPageModule {}
