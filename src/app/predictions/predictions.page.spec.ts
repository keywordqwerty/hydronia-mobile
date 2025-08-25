import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PredictionsPage } from './predictions.page';

describe('PredictionsPage', () => {
  let component: PredictionsPage;
  let fixture: ComponentFixture<PredictionsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
