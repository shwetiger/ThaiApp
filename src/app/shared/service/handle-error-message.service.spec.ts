import { TestBed } from '@angular/core/testing';

import { HandleErrorMessageService } from './handle-error-message.service';

describe('HandleErrorMessageService', () => {
  let service: HandleErrorMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleErrorMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
