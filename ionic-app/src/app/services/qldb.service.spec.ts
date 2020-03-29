import { TestBed } from '@angular/core/testing';

import { QldbService } from './qldb.service';

describe('QldbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QldbService = TestBed.get(QldbService);
    expect(service).toBeTruthy();
  });
});
