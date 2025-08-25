import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveMonitoringPage } from './live-monitoring.page';

describe('LiveMonitoringPage', () => {
  let component: LiveMonitoringPage;
  let fixture: ComponentFixture<LiveMonitoringPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveMonitoringPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
