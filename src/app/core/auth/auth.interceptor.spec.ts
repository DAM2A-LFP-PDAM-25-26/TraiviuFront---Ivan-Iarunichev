import { TestBed } from '@angular/core/testing';

import { AuthInterceptorTs } from './auth.interceptor.ts';

describe('AuthInterceptorTs', () => {
  let service: AuthInterceptorTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthInterceptorTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
