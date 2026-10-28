import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../config/api.config';
import { REFRESH_LOCK_MANAGER, REFRESH_LOCK_NAME, SessionRefreshService } from './session-refresh.service';

const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;
const OK = { success: true, message: 'ok', data: { id: 1, username: 'aman' } };

describe('SessionRefreshService', () => {
  let httpTesting: HttpTestingController;

  function setup(locks: LockManager | null): SessionRefreshService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: REFRESH_LOCK_MANAGER, useValue: locks }
      ]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    return TestBed.inject(SessionRefreshService);
  }

  afterEach(() => httpTesting.verify());

  it('fallbackSharesOneInFlightRefresh', () => {
    const service = setup(null);
    const results: string[] = [];
    service.refresh().subscribe(r => results.push(`a:${r.data?.username}`));
    service.refresh().subscribe(r => results.push(`b:${r.data?.username}`));

    const reqs = httpTesting.match(REFRESH_URL);
    expect(reqs.length).toBe(1);
    reqs[0].flush(OK);

    expect(results).toEqual(['a:aman', 'b:aman']);

    // Once settled, the next call refreshes again.
    service.refresh().subscribe();
    httpTesting.expectOne(REFRESH_URL).flush(OK);
  });

  it('fallbackPropagatesErrorsAndResets', () => {
    const service = setup(null);
    let status = -1;
    service.refresh().subscribe({ error: (e: { status: number }) => (status = e.status) });
    httpTesting.expectOne(REFRESH_URL).flush({ success: false, message: 'no' }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);

    service.refresh().subscribe();
    httpTesting.expectOne(REFRESH_URL).flush(OK);
  });

  it('runsRefreshUnderTheCrossTabWebLock', async () => {
    const request = vi.fn((name: string, callback: () => Promise<unknown>) => callback());
    const service = setup({ request } as unknown as LockManager);

    const first = new Promise<string | undefined>(resolve =>
      service.refresh().subscribe(r => resolve(r.data?.username)));
    const second = new Promise<string | undefined>(resolve =>
      service.refresh().subscribe(r => resolve(r.data?.username)));

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toBe(REFRESH_LOCK_NAME);
    httpTesting.expectOne(REFRESH_URL).flush(OK);

    await expect(first).resolves.toBe('aman');
    await expect(second).resolves.toBe('aman');
  });
});
