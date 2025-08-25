import { Component, OnInit,} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../services/backend.service';
import { QueueService } from '../services/offlinequeue.service';

@Component({
  selector: 'app-plantimages',
  templateUrl: './plantimages.page.html',
  styleUrls: ['./plantimages.page.scss'],
  standalone: false
})
export class PlantimagesPage implements OnInit {
  r: any;


  showImageModal = false;
  selectedImage: any = null;
  anomalyResult: any = null;
  anomalyLoading = false;


  currentRow: number = 1;
  currentCycle: number = 1;

  //FOR DATE RANGE
  months = [
    { value: 1, label: '01' }, { value: 2, label: '02' }, { value: 3, label: '03' },
    { value: 4, label: '04' }, { value: 5, label: '05' }, { value: 6, label: '06' },
    { value: 7, label: '07' }, { value: 8, label: '08' }, { value: 9, label: '09' },
    { value: 10, label: '10' }, { value: 11, label: '11' }, { value: 12, label: '12' }
  ];
  days = Array.from({ length: 31 }, (_, i) => i + 1);
  years = [2023, 2024, 2025]; // Add more years as needed
  dateRange = {
    month: null,
    day: null,
    year: null
  };

  //plant image Data
  latestPlantImage: string = '';
  lastCaptureDate: string = '';

   // Health analysis data
  healthData: {
    overallScore: number;
    detectedConditions: { name: string; severity: string; confidence: number }[];
  } = {
    overallScore: 0,
    detectedConditions: []
  };

  // Image history
  showImageHistory = false;
  imageHistory: any[] = [];

  //anomaly image filtering
  imageFilter: string = 'all';

  //OFFLINE QUEUEING
  queuedImages: any[] = [];

  constructor(
    private backendService: BackendService,
    private queueService: QueueService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get row and cycle from route parameters
    this.route.queryParams.subscribe(params => {
      this.currentRow = params['row'] || 1;
      this.currentCycle = params['cycle'] || 1;
    });

    // Load queued images from localStorage or your offline queue service
    this.queuedImages = JSON.parse(localStorage.getItem('imageQueue') || '[]');

    // Load plant images and health analysis
    this.loadPlantImages();
    this.loadHealthAnalysis();
  }

  loadPlantImages() {
    this.backendService.getPlantImages(this.currentRow, this.currentCycle).subscribe(
      (response) => {
        console.log('Plant images:', response);
        if (response && response.length > 0) {
          this.latestPlantImage = response[0].image_url;
          this.lastCaptureDate = response[0].date;
        }
      },
      (error) => {
        console.error('Error loading plant images:', error);
        this.latestPlantImage = 'assets/pictures/lettuceO.jpg';
      }
    );
  }

  loadHealthAnalysis() {
    console.log('AI Health Analysis is working');

    // Mock data for testing - replace with actual backend call
    this.healthData = {
      overallScore: 85,
      detectedConditions: [
        {
          name: 'Leaf Yellowing',
          severity: 'Minor',
          confidence: 78
        },
        {
          name: 'Nutrient Deficiency',
          severity: 'Moderate',
          confidence: 65
        }
      ]
    };

    // Uncomment this when you have backend ready
    /*
    this.backendService.getPlantHealthAnalysis(this.currentRow, this.currentCycle).subscribe(
      (response) => {
        console.log('Health analysis response:', response);
        this.healthData = {
          overallScore: response.overall_score || 0,
          detectedConditions: response.detected_conditions || []
        };
      },
      (error) => {
        console.error('Error loading health analysis:', error);
        this.healthData = {
          overallScore: 0,
          detectedConditions: []
        };
      }
    );
    */
  }

  getHealthColor(score: number): string {
    if (score >= 80) return '#2dd36f'; // Green
    if (score >= 60) return '#ffc409'; // Yellow
    if (score >= 40) return '#ff8800'; // Orange
    return '#eb445a'; // Red
  }

  getHealthStatus(score: number): string {
    if (score >= 80) return 'Excellent Health';
    if (score >= 60) return 'Good Health';
    if (score >= 40) return 'Fair Health';
    return 'Poor Health';
  }

  getConditionIcon(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'minor': return 'warning-outline';
      case 'moderate': return 'alert-outline';
      case 'severe': return 'close-circle-outline';
      default: return 'information-outline';
    }
  }

  getConditionColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'minor': return 'warning';
      case 'moderate': return 'medium';
      case 'severe': return 'danger';
      default: return 'primary';
    }
  }

  refreshHealthAnalysis() {
    console.log('Refreshing health analysis...');
    this.loadHealthAnalysis();
  }

  captureNewImage() {
    console.log('Capture new image clicked');
    // camera functionality wa pa na implement
    
    // this.loadPlantImages();
  }

  viewImageHistory() {
    console.log('View image history clicked');
    this.showImageHistory = !this.showImageHistory;
    
    if (this.showImageHistory) {
      this.backendService.getPlantImages(this.currentRow, this.currentCycle).subscribe(
        (response) => {
          console.log('Image history:', response);
          this.imageHistory = response || [];
        },
        (error) => {
          console.error('Error loading plant images:', error);
          this.imageHistory = [];
        }
      );
    }
  }

  //IMAGE MODALS-----------
  openImageModal(image: any) {
    this.selectedImage = image;
    this.anomalyResult = null;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = null;
    this.anomalyResult = null;
  }

  async checkAnomaly(image: any) {
    this.anomalyLoading = true;
    this.anomalyResult = null;
    try {
      // Fetch the image as a Blob
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'plant.jpg');
      // Call backend
      this.backendService.predictImageAnomaly(formData).subscribe({
        next: (result) => {
          this.anomalyResult = result;
          this.anomalyLoading = false;
        },
        error: (err) => {
          this.anomalyResult = { error: 'Failed to check anomaly.' };
          this.anomalyLoading = false;
        }
      });
    } catch (e) {
      this.anomalyResult = { error: 'Failed to load image.' };
      this.anomalyLoading = false;
    }
  }
  //IMAGE MODALS-----------


  //upload image from gallery
  uploadFromGallery() {
    // wa pa na implement
    console.log('Upload from Gallery clicked');
  }

  //filter images for anomaly
  filterImages() {
    // wa pa na implement filtering
    console.log('Filtering images:', this.imageFilter);
  }

  //select row button
  selectRow(row: number) {
    console.log(`Switching to row ${row}`);
    this.currentRow = row;
    this.refreshImages();
    // Reload data for the new row
    this.loadPlantImages();
    this.loadHealthAnalysis();
    
    // Reset image history view
    this.showImageHistory = false;
    this.imageHistory = [];
  }

  //select cycle button
  selectCycle(cycle: number) {
    this.currentCycle = cycle;
    this.refreshImages();
  }

    // Call this method whenever row or cycle changes
  refreshImages() {
    // Fetch latestPlantImage and imageHistory based on currentRow and currentCycle
    // Example:
    // this.backendService.getPlantImages(this.currentRow, this.currentCycle).subscribe(...)
  }

}


