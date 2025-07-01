import { TestBed } from '@angular/core/testing';

import { FunctService } from './funct.service';

describe('FunctService', () => {
  let service: FunctService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FunctService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
