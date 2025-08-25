import { Component } from '@angular/core';
import { QueueService } from './services/offlinequeue.service';
import { BackendService } from './services/backend.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})

export class AppComponent {
  constructor(private queueService: QueueService, private backendService: BackendService ) {
     window.addEventListener('online', ()=> {
       this.syncQueues();
     });
  }

  syncQueues(){
      // Sync images
      const images = this.queueService.getQueuedImages();
      images.forEach(img => {
        this.backendService.uploadImage(img).subscribe();
      });
      this.queueService.clearImageQueue();

    // Sync sensor readings
    const readings = this.queueService.getQueuedSensorReadings();
    readings.forEach(r => {
      this.backendService.submitSensorReading(r).subscribe();
    });
    this.queueService.clearSensorQueue();
  }
}

  