import { TestBed } from '@angular/core/testing';

import { HideScrollService } from './hide-scroll.service';

describe('HideScrollService', () => {
  let service: HideScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HideScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
