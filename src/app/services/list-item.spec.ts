import { TestBed } from '@angular/core/testing';

import { ListItem } from './list-item';

describe('ListItem', () => {
  let service: ListItem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListItem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
