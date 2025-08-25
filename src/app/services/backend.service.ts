import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'http://localhost:8000'; // Replace with your actual API URL
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Predictions API
  getPredictions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/predictions`);
  }


  // Upload plant images
  uploadPlantImage(imageData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/images/`, imageData);
  }

  // Plant Images API
  getPlantImages(row: number, cycle: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/images/${row}/${cycle}/`);
  }

  // AI Health Analysis API
  getPlantHealthAnalysis(row: number, cycle: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health-analysis/${row}/${cycle}/`);
  }

  captureNewImage(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/capture-image`, {});
  }

  getImageHistory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/image-history`);
  }
  
   //LATEST IMAGES 
  getLatestImages(row: number, cycle: number, limit: number = 10) {
    return this.http.get<any[]>(`${this.apiUrl}/images/${row}/${cycle}/?limit=${limit}`);
  }

  // Alerts API
  getAlerts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/alerts`);
  }

  // Monitoring Data API
  getMonitoringData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/monitoring-data`);
  }

  getHistoricalData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historical-data`);
  }

  // Use the actual endpoints from your backend
  createSensorReading(sensorData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sensors/`, sensorData, this.httpOptions);
  }

  // Sensor Data API
  getSensorReadings(row: number, cycle: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sensors/${row}/${cycle}/`);
  }

  //Sensort Data for minichart
  getSensorHistory(row: number, cycle: number, metric: string, hours: number) {
    // Adjust the endpoint as needed for your backend
    return this.http.get<any[]>(`/api/sensor/history?row=${row}&cycle=${cycle}&metric=${metric}&hours=${hours}`);
  }

  

  // pH Level API
  getPhLevel(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ph-level`);
  }

  // TPH (ppm) API
  getTphLevel(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tph-level`);
  }

  // Crop Cycle API
  getActiveCropCycle(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active-crop-cycle`);
  }

  // Reports API
  generateReport(reportType: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/${reportType}`);
  }

  // User/Role Management
  switchRole(newRole: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/switch-role`, { role: newRole });
  }

  // Row Monitoring API
  getRowData(rowNumber: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/row-data/${rowNumber}`);
  }

  //row monitoring to get sensor data based on row
  getSensorData(row: number, cycle: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sensors/${row}/${cycle}`);
  }

 //select cycle button LIVE Monitoring
  getAvailableRows() {
    return this.http.get<number[]>(`${this.apiUrl}/rows/`);
  }

  getAvailableCycles(row: number) {
    return this.http.get<number[]>(`${this.apiUrl}/cycles/?row=${row}`);
  }

  getLiveData(row: number, cycle: number) {
    return this.http.get<any[]>(`${this.apiUrl}/live-data/?row=${row}&cycle=${cycle}`);
  }


    //UPCOMING RISK Sensor
    getSensorRiskPredictions(row: number, cycle: number) {
      // get latest sensor reading for row and cycle
      return this.getSensorData(row, cycle).pipe(
        // import switchmap rjxs
        switchMap((readings: any[]) => {
          if (!readings || readings.length === 0) {
            return of({ prediction: null, confidence: null, fuzzy_risk: null });
          }
          const latest = readings[readings.length - 1];
          // payload for each endpoint
          const fuzzyPayload = {
            ph: latest.ph,
            temperature: latest.air_temp ?? latest.temperature,
            humidity: latest.humidity,
            profile: 'online'
          };
          const lstmPayload = {
            pH: latest.ph,
            EC: latest.ec,
            TDS: latest.tds,
            "Water Temp": latest.water_temp,
            Lux: latest.lux,
            "Air Temp": latest.air_temp ?? latest.temperature,
            Humidity: latest.humidity
          };
          // call two endpoints
          return forkJoin({
            fuzzy: this.http.post<any>(`${this.apiUrl}/predict/sensor/`, fuzzyPayload),
            lstm: this.http.post<any>(`${this.apiUrl}/predict/sensor-lstm/`, lstmPayload)
          });
        })
      );
    }

  // Live Monitoring
  getLiveMonitoringData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/live-monitoring`);
  }

  // Manual Logs API
  getManualLogs(row: number, cycle: number): Observable<any> {
   return this.http.get<any>(`${this.apiUrl}/logs/${row}/${cycle}/`);
  }

  getAllManualLogs(): Observable<any> {
    return this.getManualLogs(0, 0);
  }

  //WALAY DELETE MANUAL LOG FOR NOW
  /* deleteManualLog(logId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/logs/${logId}/`);
  } */

createManualLog(logData: any): Observable<any> {
  const formData = new FormData();
  formData.append('note', 'Test message');
  formData.append('tag', 'Manual');
  
  console.log('Testing with minimal data');
  return this.http.post<any>(`${this.apiUrl}/logs/`, formData);
}

  //PREDICT IMAGE ANOMALY
  predictImageAnomaly(formData: FormData) {
    return this.http.post<any>(`${this.apiUrl}/predict/image/`, formData);
  }


  //PREDICTIONS FOR PREDICTION PAGE---------------
  predictSensorLSTM(data: any) {
  return this.http.post<any>(`${this.apiUrl}/predict/sensor-lstm/`, {
    pH: data.ph,
    EC: data.ec,
    TDS: data.tds,
    "Water Temp": data.water_temp,
    Lux: data.lux,
    "Air Temp": data.air_temp,
    Humidity: data.humidity
  });
}

  predictFuzzyRisk(data: any) {
    return this.http.post<any>(`${this.apiUrl}/predict/sensor/`, {
      ph: data.ph,
      temperature: data.temperature,
      humidity: data.humidity,
      profile: data.profile
    });
  }
  //PREDICTIONS FOR PREDICTION PAGE---------------


  //UPLOADIMAGE
  uploadImage(image: any) {
    // If image is a File, use FormData
    const formData = new FormData();
    formData.append('row', image.row);
    formData.append('cycle', image.cycle);
    formData.append('image', image.file || image.image || image); // adapt as needed
    return this.http.post<any>(`${this.apiUrl}/images/`, formData);
  }

  submitSensorReading(reading: any) {
    return this.http.post<any>(`${this.apiUrl}/sensors/`, reading);
  }

}



