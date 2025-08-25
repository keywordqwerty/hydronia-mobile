import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManuallogsPage } from './manuallogs.page';

describe('ManuallogsPage', () => {
  let component: ManuallogsPage;
  let fixture: ComponentFixture<ManuallogsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuallogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
