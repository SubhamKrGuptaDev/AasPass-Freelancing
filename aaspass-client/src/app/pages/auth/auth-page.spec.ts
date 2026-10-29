import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthPageComponent } from './auth-page';

// jsdom lacks ResizeObserver and scrollIntoView, which the location pickers' overlay uses.
beforeAll(() => {
  if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = () => undefined;
  }
  if (typeof globalThis.ResizeObserver !== 'function') {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
});

describe('AuthPageComponent signup location', () => {
  it('renders country and city pickers bound to the signup form', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AuthPageComponent);
    fixture.detectChanges();
    fixture.componentInstance.mode.set('signup');
    fixture.detectChanges();
    http.match(r => r.url.includes('geo/cities')).forEach(r => r.flush([]));

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-country-picker')).not.toBeNull();
    expect(el.querySelector('app-city-picker')).not.toBeNull();
    expect(fixture.componentInstance.signupForm.controls.country.value).toBe('India');
    expect(el.querySelector('#signupCountry')?.getAttribute('autocomplete')).toBe('country-name');
    expect(el.querySelector('#signupCity')?.getAttribute('autocomplete')).toBe('address-level2');
  });
});
