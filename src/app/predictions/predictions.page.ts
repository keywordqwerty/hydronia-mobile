import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../services/backend.service';
import { HeaderScrollService } from '../services/hide-scroll.service';
@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.page.html',
  styleUrls: ['./predictions.page.scss'],
  standalone: false
})
export class PredictionsPage implements OnInit {
  currentRow: number = 1;
  currentCycle: number = 1;
  isLoading: boolean = false;
  hasData: boolean = false;
  lastUpdated: string | null = null;
  errorMessage: string | null = null;
  activeTab = 'lstm';

  // Prediction data from backend
  predictionData = {
    message: '',
    confidence: 0 as number | null
  };

  // Additional prediction data
  harvestPredictions = {
    estimatedDays: 0,
    confidenceLevel: 0,
    growthStage: '',
    qualityScore: 0
  };

  // Growth timeline data
  growthTimeline: any[] = [];

  //FOR THE PREDICTION TABS--------

  // Sensor LSTM Quick Test
  lstmInput = {
    ph: null,
    ec: null,
    tds: null,
    water_temp: null,
    lux: null,
    air_temp: null,
    humidity: null
  };
  lstmResult: any = null;
  lstmLoading = false;

  // Fuzzy Risk
  fuzzyInput = {
    ph: null,
    temperature: null,
    humidity: null,
    profile: 'online'
  };
  fuzzyResult: any = null;
  fuzzyLoading = false;

  // Image Anomaly
  selectedImageFile: File | null = null;
  selectedImagePreview: string | null = null;
  imageResult: any = null;
  imageLoading = false;
 //FOR THE PREDICTION TABS--------
  constructor(
    private route: ActivatedRoute,
    private backendService: BackendService,
    public headerScrollService: HeaderScrollService,
  ) {}

  ngOnInit() {
    // Get row and cycle from route parameters
    this.route.queryParams.subscribe(params => {
      this.currentRow = params['row'] || 1;
      this.currentCycle = params['cycle'] || 1;
    });

    // Load prediction data
    this.fetchPredictionData();
  }

  //row selection button
  selectRow(row: number) {
    console.log(`Switching to row ${row}`);
    this.currentRow = row;
    
    // Reset states
    this.hasData = false;
    this.errorMessage = null;
    
    // Reload predictions for the new row
    this.fetchPredictionData();
  }

  selectCycle(cycle: number) {
    this.currentCycle = cycle;
    this.refreshPredictions();
  }

  fetchPredictionData() {
    this.isLoading = true;
    this.errorMessage = null;
    console.log(`Fetching prediction data for row ${this.currentRow}, cycle ${this.currentCycle}`);

    this.backendService.getSensorRiskPredictions(this.currentRow, this.currentCycle).subscribe(
      (response) => {
        console.log('Sensor risk prediction response:', response);
        this.isLoading = false;

        // Defensive: handle both response shapes
        let fuzzy: any = {};
        let lstm: any = {};
        if ('fuzzy' in response && 'lstm' in response) {
          fuzzy = response.fuzzy || {};
          lstm = response.lstm || {};
        } else {
          // fallback for old shape
          fuzzy = { risk_level: response.fuzzy_risk || 'N/A' };
          lstm = { prediction: response.prediction || 'N/A', confidence: response.confidence ?? 0 };
        }

        // Compose message: LSTM label + confidence | Fuzzy risk
        const lstmLabel = lstm.prediction || 'N/A';
        const lstmConfidence = typeof lstm.confidence === 'number' ? Math.round(lstm.confidence * 100) : 0;
        const fuzzyRisk = fuzzy.risk_level || 'N/A';

        this.predictionData = {
          message: `${lstmLabel}${lstmConfidence ? ' (' + lstmConfidence + '%)' : ''} | ${fuzzyRisk}`,
          confidence: lstmConfidence
        };

        // Additional prediction data (if present in LSTM)
        const predictions = lstm.predictions || {};
        this.harvestPredictions = {
          estimatedDays: predictions.estimated_days || predictions.days_to_harvest || 0,
          confidenceLevel: predictions.confidence_level || predictions.confidence || 0,
          growthStage: predictions.growth_stage || predictions.stage || 'Unknown',
          qualityScore: predictions.quality_score || predictions.quality || 0
        };

        // Growth timeline (if present in LSTM)
        if (lstm.growth_timeline && Array.isArray(lstm.growth_timeline)) {
          this.growthTimeline = lstm.growth_timeline;
        } else {
          this.growthTimeline = [];
        }

        this.hasData = true;
        this.lastUpdated = new Date().toLocaleString();
      },
      (error) => {
        console.error('Backend error:', error);
        this.isLoading = false;
        this.hasData = false;

        if (error.status === 404) {
          this.errorMessage = 'No prediction data found for this row and cycle.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your connection.';
        } else {
          this.errorMessage = `Error loading predictions: ${error.message || 'Unknown error'}`;
        }
      }
    );
  }

  //PREDICTIONS TABS-------------
    // Sensor LSTM Quick Test
  predictLSTM() {
    this.lstmLoading = true;
    this.lstmResult = null;
    this.backendService.predictSensorLSTM(this.lstmInput).subscribe({
      next: (res) => {
        this.lstmResult = res;
        this.lstmLoading = false;
      },
      error: () => {
        this.lstmResult = { prediction: 'Error', confidence: 0 };
        this.lstmLoading = false;
      }
    });
  }

  // Fuzzy Risk
  predictFuzzy() {
    this.fuzzyLoading = true;
    this.fuzzyResult = null;
    this.backendService.predictFuzzyRisk(this.fuzzyInput).subscribe({
      next: (res) => {
        this.fuzzyResult = res;
        this.fuzzyLoading = false;
      },
      error: () => {
        this.fuzzyResult = { risk_level: 'error' };
        this.fuzzyLoading = false;
      }
    });
  }

  // Helper for badge color
  getRiskColor(risk: string) {
    if (!risk) return 'medium';
    if (risk.toLowerCase().includes('low')) return 'success';
    if (risk.toLowerCase().includes('med')) return 'warning';
    if (risk.toLowerCase().includes('high')) return 'danger';
    return 'medium';
  }

  // Image Anomaly
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  predictImageAnomaly() {
    if (!this.selectedImageFile) return;
    this.imageLoading = true;
    this.imageResult = null;
    const formData = new FormData();
    formData.append('image', this.selectedImageFile);
    this.backendService.predictImageAnomaly(formData).subscribe({
      next: (res) => {
        this.imageResult = res;
        this.imageLoading = false;
      },
      error: () => {
        this.imageResult = { is_anomaly: false, reconstruction_error: 'Error' };
        this.imageLoading = false;
      }
    });
  }

  captureImage() {
    const captureInput = document.querySelector<HTMLInputElement>('#captureInput');
    if (captureInput) {
      captureInput.click();
    }
  }
   //PREDICTIONS TABS-------------

  refreshPredictions() {
    console.log('Refreshing predictions...');
    this.fetchPredictionData();
  }

  getStageColor(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'current': return 'primary';
      case 'upcoming': return 'medium';
      default: return 'medium';
    }
  }

  getStageIcon(status: string): string {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'current': return 'radio-button-on';
      case 'upcoming': return 'radio-button-off';
      default: return 'radio-button-off';
    }
  }
}