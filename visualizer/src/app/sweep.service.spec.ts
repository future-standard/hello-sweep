import { TestBed, inject } from '@angular/core/testing';

import { SweepService } from './sweep.service';

describe('SweepService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SweepService]
    });
  });

  it('should be created', inject([SweepService], (service: SweepService) => {
    expect(service).toBeTruthy();
  }));
});
