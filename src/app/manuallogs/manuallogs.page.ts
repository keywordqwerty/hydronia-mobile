import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { BackendService } from '../services/backend.service';
import { HeaderScrollService } from '../services/hide-scroll.service';

@Component({
  selector: 'app-manuallogs',
  templateUrl: './manuallogs.page.html',
  styleUrls: ['./manuallogs.page.scss'],
  standalone: false
})
export class ManuallogsPage implements OnInit {
  currentRow: number = 1;
  currentCycle: number = 1;
  manualLogs: any[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  queuedSensorReadings: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private backendService: BackendService,
    public headerService: HeaderScrollService,
  ) {}

  ngOnInit() {
    // Load manual logs on page load
    this.loadManualLogs();
    this.queuedSensorReadings = JSON.parse(localStorage.getItem('sensorQueue') || '[]');
  }

  

  // Load all manual logs
  loadManualLogs() {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.backendService.getAllManualLogs().subscribe(
      (response: any) => {
        this.manualLogs = response || [];
        this.isLoading = false;
      },
      (error: any) => {
        this.errorMessage = 'Failed to load manual logs. Please try again.';
        this.manualLogs = [];
        this.isLoading = false;
      }
    );
  }

  // Create new log
  async addNewLog() {
    const alert = await this.alertController.create({
    header: 'Add New Log',
    inputs: [
      {
        name: 'note',
        type: 'textarea',
        placeholder: 'Enter your log message...'
      },
      {
        name: 'tag',
        type: 'text',
        placeholder: 'Log type',
        value: 'Manual'
      }
      // Remove row and cycle inputs completely
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Add Log',
        handler: (data) => {
          if (data.note.trim()) {
            // Don't pass row and cycle parameters
            this.createLog(data.note, data.tag || 'Manual');
          }
        }
      }
    ]
  });
  await alert.present();
}

    // Create log API call
  createLog(note: string, tag: string) {
  const newLogData: any = {
    note: note,
    tag: tag,
    timestamp: new Date().toISOString()
  };

  // Row and cycle are completely removed
  
  this.backendService.createManualLog(newLogData).subscribe(
    (response: any) => {
      console.log('Log created successfully:', response);
      this.loadManualLogs();
    },
    (error: any) => {
      console.error('Error creating log:', error);
      this.showErrorAlert('Failed to create log. Please try again.');
    }
  );
}

  // Edit existing log NON EXISTENT FORNOW -----------
  
 /* async deleteLog(logId: number) {
    const alert = await this.alertController.create({
      header: 'Delete Log',
      message: 'Are you sure you want to delete this log entry?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.backendService.deleteManualLog(logId).subscribe(
              (response: any) => {
                this.loadManualLogs();
              },
              (error: any) => {
                this.showErrorAlert('Failed to delete log. Please try again.');
              }
            );
          }
        }
      ]
    });
    await alert.present();
  } */

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getLogTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'water change': return 'primary';
      case 'maintenance': return 'warning';
      case 'observation': return 'success';
      case 'issue': return 'danger';
      case 'manual': return 'medium';
      default: return 'medium';
    }
  }

  getLogTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'water change': return 'water-outline';
      case 'maintenance': return 'build-outline';
      case 'observation': return 'eye-outline';
      case 'issue': return 'alert-circle-outline';
      case 'manual': return 'create-outline';
      default: return 'document-text-outline';
    }
  }

  refreshLogs() {
    this.loadManualLogs();
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}