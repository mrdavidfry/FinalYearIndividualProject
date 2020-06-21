import { TestBed } from '@angular/core/testing';

import { SwipingResolverService } from './swiping-resolver.service';

describe('SwipingResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SwipingResolverService = TestBed.get(SwipingResolverService);
    expect(service).toBeTruthy();
  });
});
