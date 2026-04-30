import { TestBed } from '@angular/core/testing';

import { Clan } from './clan';

describe('Clan', () => {
  let service: Clan;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clan);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
