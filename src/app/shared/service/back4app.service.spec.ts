import { TestBed } from '@angular/core/testing';
import { Back4appService } from './back4app.service';

describe('Back4appService', () => {
  let service: Back4appService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Back4appService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
