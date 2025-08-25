import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlantimagesPage } from './plantimages.page';

describe('PlantimagesPage', () => {
  let component: PlantimagesPage;
  let fixture: ComponentFixture<PlantimagesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantimagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
