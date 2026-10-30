import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { ChartsParams, ChartsResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { GeoService } from '../../services/geo/geo.service';
import { ChartsPage } from './charts';
import { signal } from '@angular/core';
import { pickSearchSelect, searchSelect } from '../../components/search-select/search-select.testing';

const response: ChartsResponse = {
  period: 'DAILY',
  buckets: ['2026-10-28', '2026-10-29'],
  newUsers: [2, 3],
  newStores: [0, 1],
  userItemsVerified: [1, 4],
  userItemsRejected: [0, 2],
  storesReviewed: [1, 0],
  topUserCities: [{ city: 'Pune', country: 'India', count: 4 }],
  topStoreCities: []
};

describe('ChartsPage', () => {
  let fixture: ComponentFixture<ChartsPage>;
  let el: HTMLElement;
  let charts: ReturnType<typeof vi.fn<(params: ChartsParams) => Observable<ChartsResponse>>>;

  const setup = async (result: () => Observable<ChartsResponse> = () => of(response)) => {
    charts = vi.fn((_params: ChartsParams) => result());
    TestBed.configureTestingModule({
      imports: [ChartsPage],
      providers: [
        provideRouter([{ path: 'charts', component: ChartsPage }]),
        { provide: AdminApiService, useValue: { charts } },
        {
          provide: GeoService,
          useValue: { countries: [{ code: 'IN', name: 'India' }], citiesFor: () => signal(['Pune', 'Mumbai']) }
        }
      ]
    });
    await TestBed.inject(Router).navigateByUrl('/charts');
    fixture = TestBed.createComponent(ChartsPage);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('loadsDailyByDefaultAndShowsTotals', async () => {
    await setup();
    expect(charts).toHaveBeenCalledWith({ period: 'DAILY', country: undefined, city: undefined });
    expect(el.querySelector<HTMLInputElement>('input#charts-period')?.value).toBe('Daily (last 30 days)');
    expect(el.querySelector('[data-testid="total-users"]')?.textContent).toContain('5 joined in the last 30 days');
    expect(el.querySelector('[data-testid="total-stores"]')?.textContent).toContain('1 created');
    expect(el.querySelector('[data-testid="total-verifications"]')?.textContent).toContain('5 verified');
    expect(el.querySelector('[data-testid="total-verifications"]')?.textContent).toContain('2 rejected');
    expect(el.querySelector('[data-testid="total-reviewed"]')?.textContent).toContain('1 stores reviewed');
    expect(el.querySelectorAll('app-column-chart').length).toBe(4);
    expect(el.textContent).toContain('Pune');
    expect(el.textContent).toContain('No new stores in this range.');
  });

  it('reloadsWhenPeriodAndLocationChange', async () => {
    await setup();
    pickSearchSelect(fixture, 'charts-period', 'monthly');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(charts).toHaveBeenLastCalledWith({ period: 'MONTHLY', country: undefined, city: undefined });
    expect(el.textContent).toContain('last 12 months');

    expect(el.querySelector<HTMLInputElement>('input#charts-city')?.disabled).toBe(true);
    pickSearchSelect(fixture, 'charts-country', 'India');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector<HTMLInputElement>('input#charts-city')?.disabled).toBe(false);
    expect(searchSelect(fixture, 'charts-country').selected()).toBe('India');
    pickSearchSelect(fixture, 'charts-city', 'Pune');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(charts).toHaveBeenLastCalledWith({ period: 'MONTHLY', country: 'India', city: 'Pune' });
    expect(el.textContent).toContain('last 12 months in Pune, India');
  });

  it('showsSkeletonsWhileFirstLoad', async () => {
    await setup(() => new Subject<ChartsResponse>());
    expect(el.querySelectorAll('[data-testid="skeleton"]').length).toBeGreaterThan(0);
    expect(el.querySelector('app-column-chart')).toBeNull();
  });
});
