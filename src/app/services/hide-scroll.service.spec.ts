import { TestBed } from '@angular/core/testing';

import { HeaderScrollService } from './hide-scroll.service';

describe('HideScrollService', () => {
  let service: HeaderScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
