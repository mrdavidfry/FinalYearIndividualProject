import { TestBed } from '@angular/core/testing';

import { WebSocketInteractService } from './web-socket-interact.service';

describe('WebSocketInteractService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebSocketInteractService = TestBed.get(WebSocketInteractService);
    expect(service).toBeTruthy();
  });
});
