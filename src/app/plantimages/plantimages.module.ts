import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlantimagesPageRoutingModule } from './plantimages-routing.module';

import { PlantimagesPage } from './plantimages.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlantimagesPageRoutingModule
  ],
  declarations: [PlantimagesPage]
})
export class PlantimagesPageModule {}
