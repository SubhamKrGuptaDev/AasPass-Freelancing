import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StoreProfile } from '../../models/store.model';
import { StoreService } from '../../services/store/store.service';
import { StoreCardComponent } from './store-card';

function makeStore(overrides: Partial<StoreProfile> = {}): StoreProfile {
  return {
    id: '7', userId: '2', ownerName: 'Priya', storeName: 'PixelCraft', tagline: 'Design for local brands',
    category: 'Design', skills: ['A', 'B', 'C', 'D', 'E'], experienceYears: 3, hourlyRate: 450,
    startingPrice: 100, area: 'Indiranagar', city: 'Bengaluru', serviceRadiusKm: 5,
    socialMediaLinks: [], description: '', services: [], rating: 4.8, reviewCount: 12, reviews: [],
    avatarUrl: 'https://example.com/a.png', bannerGradient: 'from-indigo-500 to-purple-500',
    isAvailable: true, memberSince: '', creationDateTime: '', lastUpdateDateTime: '',
    ...overrides
  } as StoreProfile;
}

describe('StoreCardComponent', () => {
  let fixture: ComponentFixture<StoreCardComponent>;
  let service: StoreService;

  function render(store: StoreProfile): HTMLElement {
    fixture.componentRef.setInput('store', store);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StoreService);
    fixture = TestBed.createComponent(StoreCardComponent);
  });

  it('renders name, owner, rate and rating', () => {
    const text = render(makeStore()).textContent ?? '';
    expect(text).toContain('PixelCraft');
    expect(text).toContain('by Priya');
    expect(text).toContain('₹450');
    expect(text).toContain('4.8');
  });

  it('shows max 3 skills plus "+N"', () => {
    const el = render(makeStore());
    const chips = el.querySelectorAll('[data-testid="skill"]');
    expect(chips.length).toBe(3);
    expect(el.textContent).toContain('+2');
  });

  it('links to the store detail key', () => {
    const store = makeStore();
    const el = render(store);
    const href = el.querySelector('a')?.getAttribute('href') ?? '';
    expect(href.endsWith('/stores/' + service.getStoreUrlKey(store))).toBe(true);
  });

  it('shows the store location without any distance', () => {
    const text = render(makeStore()).textContent ?? '';
    expect(text).toContain('Indiranagar, Bengaluru');
    expect(text).not.toContain('km away');
  });

  it('skips an empty area in the location', () => {
    expect(render(makeStore({ area: '' })).textContent).toContain('Bengaluru');
    expect(fixture.nativeElement.textContent).not.toContain(', Bengaluru');
  });

  it('shows 0 views when views is undefined', () => {
    const el = render(makeStore({ views: undefined }));
    expect(el.querySelector('[data-testid="views"]')?.textContent?.trim()).toBe('0');
  });

  it('shows "Open for gigs" vs "Paused" from isAvailable', () => {
    expect(render(makeStore({ isAvailable: true })).textContent).toContain('Open for gigs');
    fixture = TestBed.createComponent(StoreCardComponent);
    const el = render(makeStore({ isAvailable: false }));
    expect(el.textContent).toContain('Paused');
    expect(el.textContent).not.toContain('Open for gigs');
  });
});
