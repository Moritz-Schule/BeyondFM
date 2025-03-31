import { TestBed } from '@angular/core/testing';

import { RadioBrowserService } from './radio-browser.service';

describe('RadioBrowserService', () => {
  let service: RadioBrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RadioBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
