import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';

@Injectable({ providedIn: 'root' })
export class QueueService {
  constructor(private backendService: BackendService) {
    window.addEventListener('online', () => {
      this.syncQueues();
    });
  }

  syncQueues() {
    // Sync images
    const images: any[] = JSON.parse(localStorage.getItem('imageQueue') || '[]');
    images.forEach((img: any) => {
      this.backendService.uploadImage(img).subscribe();
    });
    localStorage.removeItem('imageQueue');

    // Sync sensor readings
    const readings: any[] = JSON.parse(localStorage.getItem('sensorQueue') || '[]');
    readings.forEach((r: any) => {
      this.backendService.submitSensorReading(r).subscribe();
    });
    localStorage.removeItem('sensorQueue');
  }

  getQueuedImages(): any[] {
    return JSON.parse(localStorage.getItem('imageQueue') || '[]');
  }
  queueImage(image: any) {
    const queue = this.getQueuedImages();
    queue.push(image);
    localStorage.setItem('imageQueue', JSON.stringify(queue));
  }
  clearImageQueue() {
    localStorage.removeItem('imageQueue');
  }

  getQueuedSensorReadings(): any[] {
    return JSON.parse(localStorage.getItem('sensorQueue') || '[]');
  }
  queueSensorReading(reading: any) {
    const queue = this.getQueuedSensorReadings();
    queue.push(reading);
    localStorage.setItem('sensorQueue', JSON.stringify(queue));
  }
  clearSensorQueue() {
    localStorage.removeItem('sensorQueue');
  }
}