import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BackendService } from '../../services/backend.service';
import { AlertDetailsModalComponent } from '../alert-details-modal/alert-details-modal.component';

@Component({
  selector: 'app-alerts-modal',
  templateUrl: './alerts-modal.component.html',
  styleUrls: ['./alerts-modal.component.scss'],
  standalone: false
})
export class AlertsModalComponent implements OnInit {
  alerts: any[] = [];
  selectedTab: string = 'active';
  
  // Prediction data (moved from home page)
  predictionData = {
    message: 'Expected 3-4 days until harvest',
    confidence: 85
  };

  constructor(
    private modalController: ModalController,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    this.loadAlertsState();
    this.loadAlerts();
    this.loadPredictions();
  }

  loadAlerts() {
    // Mock data for alerts with dismissed property
    if (this.alerts.length === 0) {
      this.alerts = [
        {
          id: 1,
          type: 'warning',
          title: 'pH Level Warning',
          message: 'Row 2 pH level is below optimal range (5.2)',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          row: 2,
          cycle: 1,
          dismissed: false
        },
        {
          id: 2,
          type: 'info',
          title: 'Water Change Due',
          message: 'Row 1 water change recommended within 2 hours',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          row: 1,
          cycle: 1,
          dismissed: false
        },
        {
          id: 3,
          type: 'danger',
          title: 'Temperature Alert',
          message: 'Temperature in Row 3 is above optimal range (29.5°C)',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          row: 3,
          cycle: 1,
          dismissed: false
        },
        {
          id: 4,
          type: 'warning',
          title: 'Humidity Warning',
          message: 'Humidity in Row 4 is below optimal range (35%)',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          row: 4,
          cycle: 1,
          dismissed: false
        }
      ];
    }

    // Uncomment when backend is ready
    /*
    this.backendService.getAlerts().subscribe(
      (response) => {
        this.alerts = response.alerts || [];
        this.saveAlertsState();
      },
      (error) => {
        console.error('Error loading alerts:', error);
      }
    );
    */
  }

  loadPredictions() {
    // Load prediction data (you can call your existing backend service)
    this.backendService.getPredictions().subscribe(
      (response) => {
        this.predictionData = {
          message: response.prediction_message || 'Expected 3-4 days until harvest',
          confidence: response.confidence_percentage || 85
        };
      },
      (error) => {
        console.error('Error loading predictions:', error);
      }
    );
  }

  // Get only non-dismissed alerts
  get activeAlerts() {
    return this.alerts.filter(alert => !alert.dismissed);
  }

  // Get dismissed alerts
  get dismissedAlerts() {
    return this.alerts.filter(alert => alert.dismissed);
  }

  // Dismiss/acknowledge an alert
  dismissAlert(alertId: number) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = true;
      
      // Save to localStorage
      this.saveAlertsState();
      
      console.log(`Alert ${alertId} dismissed`);
      
      // Optional: Send to backend
      /*
      this.backendService.dismissAlert(alertId).subscribe(
        (response) => {
          console.log('Alert dismissed on backend');
        },
        (error) => {
          console.error('Error dismissing alert on backend:', error);
          // Revert if backend fails
          alert.dismissed = false;
          this.saveAlertsState();
        }
      );
      */
    }
  }

  // Restore a dismissed alert
  restoreAlert(alertId: number) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.dismissed = false;
      this.saveAlertsState();
      console.log(`Alert ${alertId} restored`);
      
      // Optional: Send to backend
      /*
      this.backendService.restoreAlert(alertId).subscribe(
        (response) => {
          console.log('Alert restored on backend');
        },
        (error) => {
          console.error('Error restoring alert on backend:', error);
        }
      );
      */
    }
  }

  // Save alerts state to localStorage
  saveAlertsState() {
    localStorage.setItem('hydroniaAlerts', JSON.stringify(this.alerts));
  }

  // Load alerts state from localStorage
  loadAlertsState() {
    const saved = localStorage.getItem('hydroniaAlerts');
    if (saved) {
      try {
        this.alerts = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading alerts from localStorage:', error);
        this.alerts = [];
      }
    }
  }

  // Clear all dismissed alerts
  clearDismissedAlerts() {
    this.alerts = this.alerts.filter(alert => !alert.dismissed);
    this.saveAlertsState();
  }

  // Dismiss all active alerts
  dismissAllAlerts() {
    this.alerts.forEach(alert => {
      if (!alert.dismissed) {
        alert.dismissed = true;
      }
    });
    this.saveAlertsState();
  }

  // Change tab
  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  // Get alert icon
  getAlertIcon(type: string): string {
    switch (type) {
      case 'danger': return 'alert-circle-outline';
      case 'warning': return 'warning-outline';
      case 'info': return 'information-circle-outline';
      case 'success': return 'checkmark-circle-outline';
      default: return 'notifications-outline';
    }
  }

  // Get alert color
  getAlertColor(type: string): string {
    switch (type) {
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'primary';
      case 'success': return 'success';
      default: return 'medium';
    }
  }

  //Open alert details
  async openAlertDetails(alert: any) {
    const modal = await this.modalController.create({
      component: AlertDetailsModalComponent,
      componentProps: {
        alert,
        getAlertColor: this.getAlertColor.bind(this),
        getTimeAgo: this.getTimeAgo.bind(this)
      },
    });

    modal.onDidDismiss().then(result => {
      if (result.data && result.data.acknowledge) {
        this.dismissAlert(result.data.alertId);
      }
    });

    await modal.present();
  }
  // Format timestamp
  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = Math.abs(now.getTime() - new Date(timestamp).getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Get time ago string
  getTimeAgo(timestamp: Date): string {
    return this.formatTime(timestamp);
  }

  // Close modal
  dismiss() {
    this.modalController.dismiss({
      activeAlertCount: this.activeAlerts.length
    });
  }

  // Close modal (alternative method name for consistency)
  closeModal() {
    this.dismiss();
  }
}