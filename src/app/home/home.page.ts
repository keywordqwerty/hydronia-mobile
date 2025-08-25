import { Component } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { register } from 'swiper/element/bundle';
import { BackendService } from '../services/backend.service';
import { AlertController,ModalController } from '@ionic/angular';
import { AlertsModalComponent } from '../components/alerts-modal/alerts-modal.component';
import { Router } from '@angular/router';
import { SwiperOptions } from 'swiper/types';

Chart.register(...registerables);
register();
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  //for scrollhidden thingy------
  headerHidden = false;
  lastScrollTop = 0;

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    if (scrollTop > this.lastScrollTop && scrollTop > 50) {
      // Scrolling down
      this.headerHidden = true;
    } else if (scrollTop < this.lastScrollTop) {
      // Scrolling up
      this.headerHidden = false;
    }
    this.lastScrollTop = scrollTop;
  }
  //for scrollhidden thingy------

  
  //UPCOMING RISKS
  upcomingRisk: any = null;
  riskLoading = false;
  riskError = '';
  //UPCOMING RISKS


  // Current monitoring state
  currentRow: number = 1;
  currentCycle: number = 1;

  // Sensor data
  //OLD ONE--------
  sensorData: {
    ph: number;
    ec: number;
    temperature: number;
    humidity: number;
    tph: number;
    timestamp: string;
    in_range: boolean;
    warning: string;
  } = {
    ph: 0,
    ec: 0,
    temperature: 0,
    humidity: 0,
    tph: 0,
    timestamp: '',
    in_range: true,
    warning: ''
  };
  //OLD ONE--------
   //NEW----------
   liveMetrics = [
    { label: 'pH', value: 6.2, unit: '', statusColor: 'success' },
    { label: 'EC', value: 1.8, unit: 'mS/cm', statusColor: 'warning' },
    { label: 'Air Temp', value: 27, unit: '°C', statusColor: 'success' },
    { label: 'Humidity', value: 60, unit: '%', statusColor: 'success' },
    { label: 'TDS', value: 900, unit: 'ppm', statusColor: 'success' },
    { label: 'Water Temp', value: 22, unit: '°C', statusColor: 'success' },
    { label: 'Lux', value: 12000, unit: 'lx', statusColor: 'success' }
  ];
  //NEW----------/
  //sensor data-----------------------

  //MINI CHART STUFF------------------------------
  chartMetrics = [
    { key: 'ph', label: 'pH' },
    { key: 'ec', label: 'EC' },
    { key: 'temperature', label: 'Air Temp' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'tds', label: 'TDS' },
    { key: 'water_temp', label: 'Water Temp' },
    { key: 'lux', label: 'Lux' }
  ];
  selectedMetric = 'ph';

  miniChartData: any = {};
  miniChartOptions = {
    responsive: true,
    elements: { point: { radius: 0 } },
    plugins: { legend: { display: false } },
    scales: {
      x: { 
        display: true,
        title: { display: false},
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8, // up to 8 hour labels
          color: '#888',
          font: { size: 10 }
        }
       },
      y: { display: true, beginAtZero: true }
    }
  };

  //latest images----------
  imageCarouselOptions = {
    slidesPerView: 1.2,
    spaceBetween: 12,
    centeredSlides: true
  };

  latestImages: any[] = []; 
  showImageModal = false;
  selectedImage: any = null;
  //latest images----------

  //swiper for carousel----------
  slideOpts: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: { clickable: true }
  };
  //swiper for carousel----------
  //MINI CHART STUFF------------------------------

  //MOCK DATA STUFF 

 // Crop cycle data (mock for now)
  cropCycleData = {
    variety: 'Green lettuce 2024-01',
    startDate: new Date('2025-07-01'), // Mock start date
    expectedHarvestDate: new Date('2025-08-30'), // Mock harvest date (60 days later)
    totalDays: 60,
    currentDay: this.calculateCurrentDay()
  };

   // Calculate current day since start
  calculateCurrentDay(): number {
    const today = new Date();
    const startDate = new Date('2025-07-01'); // Mock start date
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 60); // Cap at 60 days
  }

   // Format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  //MOCK DATA STUFF 

  //alert count on alert button
  getActiveAlertCount(): number {
    // This should eventually come from a service or the alerts modal component
    // For now, return a dynamic count based on non-dismissed alerts
    return 2; // You can make this dynamic later
  }

  


  constructor(private backendService: BackendService,
     private platform: Platform,
     private alertController: AlertController, 
     private router: Router,
     private modalController: ModalController) {}

     
  
  async ngOnInit() {
    await this.platform.ready();
    await StatusBar.setOverlaysWebView({ overlay: false });
    // Load initial sensor data for row 1
    this.loadSensorData(this.currentRow, this.currentCycle);
    // Load mini chart
    this.preloadAllMiniCharts();
    //load upcoming risk
    this.loadUpcomingRisk();
    //load latest images
    this.loadLatestImages();
  }

  //UPCOMING RISKS--------------------------
  loadUpcomingRisk() {
    this.riskLoading = true;
    this.riskError = '';
    this.backendService.getSensorRiskPredictions(this.currentRow, this.currentCycle).subscribe({
      next: (result: any) => {
        console.log('Risk prediction response:', result);
        this.upcomingRisk = {
          label: result.lstm?.prediction || 'N/A',
          confidence: result.lstm?.confidence ? Math.round(result.lstm.confidence * 100) : null,
          fuzzy_risk: result.fuzzy?.risk_level || 'N/A'
        };
        this.riskLoading = false;
      },
      error: (err) => {
        this.riskError = 'Could not load risk prediction';
        this.riskLoading = false;
      }
    });
  }

  // for prediction button
  runPredictions() {
    this.loadUpcomingRisk();
  }
  //UPCOMING RISKS--------------------------
  
  
  // LOAD MINI CHART DATA FOR THE LAST 24HRS------------------------
 preloadAllMiniCharts() {
    for (const metric of this.chartMetrics) {
      this.backendService.getSensorHistory(this.currentRow, this.currentCycle, metric.key, 24).subscribe(
        (response) => {
          this.miniChartData[metric.key] = {
            labels: response.map((r: any) => this.formatHour(r.timestamp)),
            datasets: [{
              data: response.map((r: any) => r.value),
              label: metric.label,
              borderColor: this.getMetricColor(metric.key),
              backgroundColor: this.getMetricBgColor(metric.key),
              pointRadius: 3,
              fill: true
            }]
          };
        },
        (error) => {
          this.miniChartData[metric.key] = {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
              data: Array.from({length: 24}, () => Math.random() * 10 + 5),
              label: metric.label,
              borderColor: this.getMetricColor(metric.key),
              backgroundColor: this.getMetricBgColor(metric.key),
              pointRadius: 3,
              fill: true
            }]
          };
        }
      );
    }
  }

  // Helper to format hour from timestamp
  formatHour(timestamp: string): string {
    const date = new Date(timestamp);
    return `${date.getHours()}:00`;
  }

  getMetricColor(key: string) {
    switch (key) {
      case 'ph': return '#2dd36f';
      case 'ec': return '#3880ff';
      case 'temperature': return '#ffce00';
      case 'humidity': return '#00b8d4';
      case 'tds': return '#7044ff';
      case 'water_temp': return '#ff4961';
      case 'lux': return '#ffa801';
      default: return '#2dd36f';
    }
  }
  getMetricBgColor(key: string) {
    switch (key) {
      case 'ph': return 'rgba(45,211,111,0.1)';
      case 'ec': return 'rgba(56,128,255,0.1)';
      case 'temperature': return 'rgba(255,206,0,0.1)';
      case 'humidity': return 'rgba(0,184,212,0.1)';
      case 'tds': return 'rgba(112,68,255,0.1)';
      case 'water_temp': return 'rgba(255,73,97,0.1)';
      case 'lux': return 'rgba(255,168,1,0.1)';
      default: return 'rgba(45,211,111,0.1)';
    }
  }
  // LOAD MINI CHART DATA FOR THE LAST 24HRS------------------------

  // Row button click handlers
  selectRow(rowNumber: number) {
    this.currentRow = rowNumber;
    this.loadSensorData(this.currentRow, this.currentCycle);
  }

  //LIVE SENSOR DATA FROM BACKEND-------
  loadSensorData(row: number, cycle: number) {
    this.backendService.getSensorData(row, cycle).subscribe(
      (response) => {
        if (response && response.length > 0) {
          console.log('Backend response:', response);
          const latestReading = response[response.length - 1];
          this.liveMetrics = [
            { label: 'pH', value: latestReading.ph ?? 'N/A', unit: '', statusColor: this.getMetricStatusColor('ph', latestReading.ph) },
            { label: 'EC', value: latestReading.ec ?? 'N/A', unit: 'mS/cm', statusColor: this.getMetricStatusColor('ec', latestReading.ec) },
            { label: 'Air Temp', value: latestReading.air_temp ?? latestReading.temperature ?? 'N/A', unit: '°C', statusColor: this.getMetricStatusColor('air_temp', latestReading.air_temp ?? latestReading.temperature) },
            { label: 'Humidity', value: latestReading.humidity ?? 'N/A', unit: '%', statusColor: this.getMetricStatusColor('humidity', latestReading.humidity) },
            { label: 'TDS', value: latestReading.tds ?? 'N/A', unit: 'ppm', statusColor: this.getMetricStatusColor('tds', latestReading.tds) },
            { label: 'Water Temp', value: latestReading.water_temp ?? 'N/A', unit: '°C', statusColor: this.getMetricStatusColor('water_temp', latestReading.water_temp) },
            { label: 'Lux', value: latestReading.lux ?? 'N/A', unit: 'lx', statusColor: this.getMetricStatusColor('lux', latestReading.lux) }
          ];
        } else {
          console.log('No data response: ', response);
          // No data: show N/A for all metrics
          this.liveMetrics = [
            { label: 'pH', value: NaN, unit: '', statusColor: 'medium' },
            { label: 'EC', value: NaN, unit: 'mS/cm', statusColor: 'medium' },
            { label: 'Air Temp', value: NaN, unit: '°C', statusColor: 'medium' },
            { label: 'Humidity', value: NaN, unit: '%', statusColor: 'medium' },
            { label: 'TDS', value: NaN, unit: 'ppm', statusColor: 'medium' },
            { label: 'Water Temp', value: NaN, unit: '°C', statusColor: 'medium' },
            { label: 'Lux', value: NaN, unit: 'lx', statusColor: 'medium' }
          ];
        }
      },
      (error) => {
        console.error('Backend error:', error);
        // On error, also show N/A
        this.liveMetrics = [
          { label: 'pH', value: NaN, unit: '', statusColor: 'medium' },
          { label: 'EC', value: NaN, unit: 'mS/cm', statusColor: 'medium' },
          { label: 'Air Temp', value: NaN, unit: '°C', statusColor: 'medium' },
          { label: 'Humidity', value: NaN, unit: '%', statusColor: 'medium' },
          { label: 'TDS', value: NaN, unit: 'ppm', statusColor: 'medium' },
          { label: 'Water Temp', value: NaN, unit: '°C', statusColor: 'medium' },
          { label: 'Lux', value: NaN, unit: 'lx', statusColor: 'medium' }
        ];
      }
    );
  }
  //LIVE SENSOR DATA FROM BACKEND-------

  //GET METRICSTATUS COLOR
  getMetricStatusColor(metric: string, value: number): string {
    switch (metric) {
      case 'ph': return value >= 5.5 && value <= 6.5 ? 'success' : 'danger';
      case 'ec': return value >= 1.2 && value <= 2.4 ? 'success' : 'warning';
      case 'tds': return value >= 800 && value <= 1200 ? 'success' : 'warning';
      case 'water_temp': return value >= 18 && value <= 26 ? 'success' : 'warning';
      case 'lux': return value >= 10000 && value <= 30000 ? 'success' : 'warning';
      case 'air_temp': return value >= 18 && value <= 28 ? 'success' : 'warning';
      case 'humidity': return value >= 50 && value <= 80 ? 'success' : 'warning';
      default: return 'medium';
    }
  }

  //NAVIGATE TO CHARTING---------
  navigateToLiveMonitoring() {
  this.router.navigate(['/live-monitoring'], {
    queryParams: { 
      row: this.currentRow, 
      cycle: this.currentCycle 
    }
  });
}
  //NAVIGATE TO CHARTING-------------------

  //NAVIGATE TO PLANT IMAGE---------
  navigateToPlantImages() {
    this.router.navigate(['/plantimages'], {
      queryParams: { 
        row: this.currentRow, 
        cycle: this.currentCycle 
      }
    });
  }
  //NAVIGATE TO PLANT IMAGE---------



  //ALERTS----------
  async openAlertsModal() {
    const modal = await this.modalController.create({
      component: AlertsModalComponent,
      cssClass: 'alerts-modal'
    });
    
    await modal.present();
  }

  //PREDICTIONS----------
  navigateToPredictions() {
    this.router.navigate(['/predictions'], {
      queryParams: { 
        row: this.currentRow, 
        cycle: this.currentCycle 
      }
    });
  }

  //MANUAL LOGS--------------
  navigateToManualLogs() {
    this.router.navigate(['/manuallogs'], {
      queryParams: { 
        row: this.currentRow, 
        cycle: this.currentCycle 
      }
    });
  } 

  // Helper methods for display
  getStatusColor(inRange: boolean): string {
    return inRange ? '#2a922f' : '#eb445a';
  }

  getStatusText(inRange: boolean): string {
    return inRange ? 'Optimal' : 'Warning';
  }

  //LATEST IMAGES CAROUSEL ENLARGE
  openImageModal(img: any) {
    this.selectedImage = img;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = null;
  }

  //LOAD LATEST IMAGES
  
  loadLatestImages() {
    this.backendService.getLatestImages(this.currentRow, this.currentCycle, 10).subscribe(images => {
      console.log('Fetched images:', images);
      this.latestImages = images;
    });
  }

  //SELECT CYCLE
  selectCycle(cycle: number) {
    this.currentCycle = cycle;
    this.loadSensorData(this.currentRow, this.currentCycle);
    // Also reload any other data that depends on cycle
  }
}

