import { TestBed } from '@angular/core/testing';

import { ConectionBackService } from './conection-back.service';

describe('ConectionBackService', () => {
  let service: ConectionBackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConectionBackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
