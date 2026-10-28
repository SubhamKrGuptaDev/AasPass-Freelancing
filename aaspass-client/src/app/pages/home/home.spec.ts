import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { StoreProfile } from '../../models/store.model';
import { StoreService } from '../../services/store/store.service';
import { HomeComponent } from './home';
import { EXAMPLE_SELLERS, FAQS, HIRE_STEPS, HOME_CATEGORIES, SELLER_BENEFITS, SELLER_COPY } from './home.content';

function makeStore(id: number, city: string, rating: number, category = 'Photography'): StoreProfile {
  return {
    id: String(id), userId: '1', ownerName: `Owner ${id}`, storeName: `Store ${id}`, tagline: 'tag',
    category, skills: [], experienceYears: 1, hourlyRate: 100, startingPrice: 100, area: 'Area', city, country: 'India',
    serviceRadiusKm: 5, socialMediaLinks: [], description: '', services: [], rating,
    reviewCount: 1, reviews: [], avatarUrl: '', bannerGradient: 'from-indigo-500 to-purple-500',
    isAvailable: true, memberSince: '', creationDateTime: '', lastUpdateDateTime: ''
  } as StoreProfile;
}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let service: StoreService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StoreService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('topStores is city-only, rating-ranked, max 6', () => {
    const stores = [
      ...Array.from({ length: 8 }, (_, i) => makeStore(i + 1, 'Bengaluru', 3 + i * 0.1)),
      makeStore(100, 'Pune', 5)
    ];
    service.stores.set(stores);
    service.setSelectedCategory('Photography');
    service.setSearchQuery('zzz');
    const top = component.topStores();
    expect(top.length).toBe(6);
    expect(top.every(s => s.city === 'Bengaluru')).toBe(true);
    expect(top[0].rating).toBeGreaterThanOrEqual(top[5].rating);
    expect(top[0].id).toBe('8');
  });

  it('findTalent navigates to /stores with city and q', () => {
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.heroSearch.setValue('  reels ');
    component.findTalent();
    expect(nav).toHaveBeenCalledWith(['/stores'], { queryParams: { city: 'Bengaluru', q: 'reels' } });
  });

  it('findTalent omits empty q', () => {
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.heroSearch.setValue('   ');
    component.findTalent();
    expect(nav).toHaveBeenCalledWith(['/stores'], { queryParams: { city: 'Bengaluru', q: null } });
  });

  it('category cards match StoreService categories', () => {
    expect(HOME_CATEGORIES.map(c => c.name)).toEqual(service.categories.filter(c => c !== 'All'));
  });

  it('every example seller maps to a real category', () => {
    expect(EXAMPLE_SELLERS.length).toBe(14);
    expect(EXAMPLE_SELLERS.every(s => service.categories.includes(s.category))).toBe(true);
  });

  it('does not promise radius filters', () => {
    const answer = FAQS.find(f => f.question === 'How close are providers?')?.answer ?? '';
    expect(answer).toBe('Providers are in your immediate vicinity, typically 2 to 10 km away.');
    const step = HIRE_STEPS.find(h => h.title === 'Search nearby')?.description ?? '';
    expect(step).toBe('Find talent in your city, filtered by category.');
  });

  it('has 6 FAQs and 4 seller benefits', () => {
    expect(FAQS.length).toBe(6);
    expect(SELLER_BENEFITS.length).toBe(4);
  });

  it('renders the zero-commission benefit and seller section', () => {
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('AasPass takes no commission on your earnings');
    expect(text).toContain(SELLER_COPY.heading);
  });

  it('renders 11 category cards linking to /stores', () => {
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a[data-testid="category-card"]');
    expect(links.length).toBe(11);
    expect(links[0].getAttribute('href')).toContain('category=Video');
  });
});
