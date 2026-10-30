import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminContactRequestSummary, PageResponse } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { SupportPage } from './support';
import { pickSearchSelect } from '../../components/search-select/search-select.testing';

@Component({ template: '' })
class DetailStub {}

const request: AdminContactRequestSummary = {
  id: 5, type: 'FEEDBACK', status: 'NEW', name: 'Meera Nair', email: 'meera@example.com',
  subject: 'Love the app', creationDateTime: '2026-10-02T10:00:00'
};
const pageOf = (content: AdminContactRequestSummary[]): PageResponse<AdminContactRequestSummary> => ({
  content, page: 0, size: 20, totalElements: content.length, totalPages: content.length ? 1 : 0
});

describe('SupportPage', () => {
  let searchContactRequests: ReturnType<typeof vi.fn>;
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  const setup = async (url: string, rows: AdminContactRequestSummary[] = [request]) => {
    searchContactRequests = vi.fn().mockReturnValue(of(pageOf(rows)));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'support', component: SupportPage },
          { path: 'support/:id', component: DetailStub }
        ]),
        { provide: AdminApiService, useValue: { searchContactRequests } }
      ]
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, SupportPage);
    harness.detectChanges();
    el = harness.routeNativeElement as HTMLElement;
  };

  it('loadsWithFiltersFromTheUrl', async () => {
    await setup('/support?status=NEW&type=FEEDBACK');
    expect(searchContactRequests).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'NEW', type: 'FEEDBACK', page: 0 })
    );
  });

  it('rendersRowWithTypeLabelAndStatusChip', async () => {
    await setup('/support');
    const row = el.querySelector('tbody tr')!;
    expect(row.textContent).toContain('Feedback');
    expect(row.textContent).toContain('Meera Nair');
    expect(row.textContent).toContain('Love the app');
    expect(row.querySelector('app-status-chip')?.textContent?.trim()).toBe('New');
  });

  it('changingTheStatusFilterUpdatesTheUrlAndReloads', async () => {
    await setup('/support');
    pickSearchSelect(harness.fixture, 'filter-status', 'RESOLVED');
    await harness.fixture.whenStable();
    harness.detectChanges();
    const router = TestBed.inject(Router);
    expect(router.url).toContain('status=RESOLVED');
    expect(searchContactRequests).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'RESOLVED', page: 0 }));
  });

  it('rowClickNavigatesToDetail', async () => {
    await setup('/support');
    el.querySelector<HTMLElement>('tbody tr')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/support/5');
  });

  it('showsAnEmptyState', async () => {
    await setup('/support', []);
    expect(el.textContent).toContain('No requests match these filters.');
  });
});
