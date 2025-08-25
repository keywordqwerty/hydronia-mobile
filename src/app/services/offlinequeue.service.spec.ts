import { TestBed } from '@angular/core/testing';

import { OfflinequeueService } from './offlinequeue.service';

describe('OfflinequeueService', () => {
  let service: OfflinequeueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflinequeueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
