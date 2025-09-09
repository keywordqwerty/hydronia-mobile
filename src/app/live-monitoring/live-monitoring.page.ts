import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { BackendService } from '../services/backend.service';
import { ActivatedRoute } from '@angular/router';
import { HeaderScrollService } from '../services/hide-scroll.service';
Chart.register(...registerables);

@Component({
  selector: 'app-live-monitoring',
  templateUrl: './live-monitoring.page.html',
  styleUrls: ['./live-monitoring.page.scss'],
  standalone: false
})
export class LiveMonitoringPage implements OnInit {
  @ViewChild('lineChart', { static: false }) lineChart!: ElementRef;
  
  rows: number[] = [];
  cycles: number[] = [];
  selectedRow: number | null = null;
  selectedCycle: number | null = null;
  liveData: any[] = [];

  chart: any;
  currentRow: number = 1;
  currentCycle: number = 1;
  isLoading: boolean = false;

  // Sensor data
  sensorData: {
    ph: number;
    ec: number;
    temperature: number;
    humidity: number;
    tph: number;
    timestamp: string;
  } = {
    ph: 0,
    ec: 0,
    temperature: 0,
    humidity: 0,
    tph: 0,
    timestamp: ''
  };

  // Historical data for chart
  historicalData: any[] = [];
  chartData: any;
 

  constructor(
    private backendService: BackendService,
    private route: ActivatedRoute,
    public headerScrollService: HeaderScrollService,
  ) {}

  ngOnInit() {
    this.fetchRowsAndCycles();

    // Get row and cycle from route parameters (query params)
    this.route.queryParams.subscribe(params => {
      this.currentRow = params['row'] || 1;
      this.currentCycle = params['cycle'] || 1;
      
      // Load data when parameters change
      this.loadSensorData();
      this.loadHistoricalData();
    });
  }

  //select row button

  //select cycle button
  selectCycle(cycle: number) {
    this.currentCycle = cycle;
    this.loadSensorData();
    this.loadHistoricalData();
  }

  //row and cycle stuff
  fetchRowsAndCycles() {
    this.backendService.getAvailableRows().subscribe(rows => {
      this.rows = rows;
      this.selectedRow = rows.length ? rows[0] : null;
      this.fetchCycles();
    });
  }

  fetchCycles() {
    if (this.selectedRow !== null) {
      this.backendService.getAvailableCycles(this.selectedRow).subscribe(cycles => {
        this.cycles = cycles;
        this.selectedCycle = cycles.length ? cycles[0] : null;
        this.loadLiveData();
      });
    }
  }

  onRowChange(row: number) {
    this.selectedRow = row;
    this.fetchCycles();
  }

  onCycleChange(cycle: number) {
    this.selectedCycle = cycle;
    this.loadLiveData();
  }

  loadLiveData() {
    if (this.selectedRow !== null && this.selectedCycle !== null) {
      this.backendService.getLiveData(this.selectedRow, this.selectedCycle).subscribe(data => {
        this.liveData = data;
      });
    }
  }
    
  ionViewDidEnter() {
    // Create chart when view enters
    setTimeout(() => {
      this.createChart();
    }, 100);
    
    //auto refresh 
    this.startAutoRefresh();
  }

  ionViewWillLeave() {
    // Destroy chart when leaving
    if (this.chart) {
      this.chart.destroy();
    }
    this.stopAutoRefresh();
  }

  

  loadSensorData() {
    this.isLoading = true;
    console.log(`Loading sensor data of row ${this.currentRow}, cycle ${this.currentCycle}`);

    this.backendService.getSensorData(this.currentRow, this.currentCycle).subscribe(
      (response) => {
        console.log('Sensor data response:', response);
        this.isLoading = false;

        if (response && response.length > 0) {

          //get latest reading
          const latestReading = response[0];
          this.sensorData = {
            ph: latestReading.ph || 0,
            ec: latestReading.ec || 0,
            temperature: latestReading.temperature || 0,
            humidity: latestReading.humidity || 0,
            tph: latestReading.tph || 0,
            timestamp: latestReading.timestamp || ''
          };
        }
      },
      (error) => {
        console.error('Error loading sensor data:', error);
        this.isLoading = false;
      }
    );
  }

  //HISTORICAL DATA MOCK
  generateMockHistoricalData(): any[] {
    const mockData = [];
    const baseDate = new Date();
    
    // Generate 30 days of mock data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // Create realistic sensor values with some variation
      const dayFactor = Math.sin((i / 30) * Math.PI) * 0.3; // Seasonal variation
      const randomFactor = (Math.random() - 0.5) * 0.2; // Random variation
      
      mockData.push({
        timestamp: date.toISOString(),
        ph: 6.0 + dayFactor + randomFactor,
        temperature: 24 + (dayFactor * 3) + (randomFactor * 2),
        humidity: 60 + (dayFactor * 10) + (randomFactor * 5),
        ec: 1.8 + (dayFactor * 0.2) + (randomFactor * 0.1),
        tph: 0.01 + (Math.random() * 0.01)
      });
    }
    
    return mockData;
  }
  //HISTORICAL DATA MOCK

  // Load historical data for chart NAA NI MOCK DATA
  loadHistoricalData() {
    console.log(`Loading historical data for Row ${this.currentRow}, Cycle ${this.currentCycle}`);
    
    this.backendService.getSensorReadings(this.currentRow, this.currentCycle).subscribe(
      (response) => {
        console.log('Historical data response:', response);
        
        if (response && response.length > 3) {
          // Use real data if we have enough
          this.historicalData = response.sort((a: any, b: any) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        } else {
          // Use mock data if we don't have enough real data
          console.log('Not enough real data, using mock data for charts');
          this.historicalData = this.generateMockHistoricalData();
          
          // Add some variation based on current row
          this.historicalData = this.historicalData.map(reading => ({
            ...reading,
            ph: reading.ph + (this.currentRow * 0.1),
            temperature: reading.temperature + (this.currentRow * 0.5),
            humidity: reading.humidity + (this.currentRow * 2),
            ec: reading.ec + (this.currentRow * 0.05)
          }));
        }
        
        console.log(`Using ${this.historicalData.length} data points for charts`);
        this.processHistoricalData();
        
        // Update chart if it exists
        if (this.chart) {
          this.updateChart();
        }
      },
      (error) => {
        console.error('Error loading historical data, using mock data:', error);
        // Fallback to mock data on error
        this.historicalData = this.generateMockHistoricalData();
        this.processHistoricalData();
        
        if (this.chart) {
          this.updateChart();
        }
      }
    );
  }

  // Process historical data for chart
  processHistoricalData() {
    if (this.historicalData.length === 0) return;

    const labels = this.historicalData.map(reading => 
      new Date(reading.timestamp).toLocaleDateString()
    );

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'pH Level',
          data: this.historicalData.map(reading => reading.ph),
          borderColor: '#2a922f',
          backgroundColor: 'rgba(42, 146, 47, 0.1)',
          tension: 0.4
        },
        {
          label: 'Temperature (°C)',
          data: this.historicalData.map(reading => reading.temperature),
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4
        },
        {
          label: 'Humidity (%)',
          data: this.historicalData.map(reading => reading.humidity),
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4
        },
        {
          label: 'EC (mS/cm)',
          data: this.historicalData.map(reading => reading.ec),
          borderColor: '#45b7d1',
          backgroundColor: 'rgba(69, 183, 209, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  createChart() {
    if (!this.lineChart) return;
    
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.lineChart.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: this.chartData || {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Sensor Data - Row ${this.currentRow}, Cycle ${this.currentCycle}`
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          }
        }
      }
    });
  }

 updateChart() {
    if (this.chart && this.chartData) {
      this.chart.data = this.chartData;
      // Update the chart title dynamically
      this.chart.options.plugins.title.text = `Sensor Data - Row ${this.currentRow}, Cycle ${this.currentCycle}`;
      this.chart.update();
    }
  }

  // Auto-refresh functionality
  private refreshInterval: any;

  startAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadSensorData();
    }, 30000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // Manual refresh
  refreshData() {
    this.loadSensorData();
    this.loadHistoricalData();
  }

  //select row button
  selectRow(row: number) {
    
    this.currentRow = row;
    this.loadSensorData();
    this.loadHistoricalData();
  }

}