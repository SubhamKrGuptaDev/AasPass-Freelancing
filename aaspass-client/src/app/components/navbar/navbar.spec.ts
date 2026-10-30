import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { CountryPickerComponent } from '../location-picker/country-picker';
import { StoreService } from '../../services/store/store.service';
import { NavbarComponent } from './navbar';

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

describe('NavbarComponent location popover', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let service: StoreService;
  let root: HTMLElement;

  const trigger = (): HTMLButtonElement => root.querySelector<HTMLButtonElement>('[data-testid="location-trigger"]') as HTMLButtonElement;
  const popover = (): HTMLElement | null => root.querySelector<HTMLElement>('[data-testid="location-popover"]');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StoreService);
    fixture = TestBed.createComponent(NavbarComponent);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('shows "{city}, {country}" and just the country when no city is selected', () => {
    expect(trigger().textContent).toContain('Bengaluru, India');
    service.setSelectedCity('');
    fixture.detectChanges();
    expect(trigger().textContent?.trim()).not.toContain(',');
    expect(trigger().textContent).toContain('India');
  });

  it('shows a Contact link', () => {
    const link = Array.from(root.querySelectorAll('a')).find(a => a.textContent?.trim() === 'Contact');
    expect(link?.getAttribute('href')).toBe('/contact');
  });

  it('stays hidden below md', () => {
    expect(trigger().parentElement?.className).toContain('hidden md:inline-flex');
  });

  it('opens a popover with both pickers and no old city list', () => {
    expect(popover()).toBeNull();
    trigger().click();
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(popover()?.querySelector('app-country-picker')).not.toBeNull();
    expect(popover()?.querySelector('app-city-picker')).not.toBeNull();
    expect(root.textContent).not.toContain('Select Location');
  });

  it('restores the country when the country picker is cleared', async () => {
    trigger().click();
    fixture.detectChanges();
    const picker = fixture.debugElement.query(By.directive(CountryPickerComponent)).componentInstance as CountryPickerComponent;
    picker.value.set('');
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(picker.value()).toBe('India');
    });
    expect(service.selectedCountry()).toBe('India');
  });

  it('closes on Escape and returns focus to the trigger', () => {
    document.body.appendChild(root);
    try {
      trigger().click();
      fixture.detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      expect(popover()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    } finally {
      root.remove();
    }
  });

  it('closes on an outside click but not on a click inside', () => {
    document.body.appendChild(root);
    try {
      trigger().click();
      fixture.detectChanges();
      popover()?.click();
      fixture.detectChanges();
      expect(popover()).not.toBeNull();
      document.body.click();
      fixture.detectChanges();
      expect(popover()).toBeNull();
    } finally {
      root.remove();
    }
  });
});
