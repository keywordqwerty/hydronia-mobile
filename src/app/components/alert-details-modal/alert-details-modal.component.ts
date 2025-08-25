import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TitleCasePipe } from '@angular/common';
@Component({
    selector: 'app-alert-details-modal',
    templateUrl: './alert-details-modal.component.html',
    styleUrls: ['./alert-details-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, TitleCasePipe]
})
export class AlertDetailsModalComponent{

  @Input() alert: any;
  @Input() getAlertColor!: (type: string) => string;
  @Input() getTimeAgo!: (timestamp: Date) => string;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }

  acknowledge() {
    this.modalCtrl.dismiss({ acknowledge: true, alertId: this.alert.id });
  }

  

}
