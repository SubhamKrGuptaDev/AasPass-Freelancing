import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminUserDetail } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { UserDetailPage } from './user-detail';

const detail = (summary: Partial<AdminUserDetail['summary']> = {}, over: Partial<AdminUserDetail> = {}): AdminUserDetail => ({
  summary: {
    id: 9, name: 'Asha Rao', username: 'asha', email: 'a@x.in', city: 'Pune', country: 'India',
    phoneStatus: 'VERIFIED', panStatus: 'UNVERIFIED', aadharStatus: 'UNVERIFIED', suspendedUntil: null,
    storeCount: 1, creationDateTime: '2026-10-01T10:00:00', ...summary
  },
  phone: '9999999999', panNumber: null, aadharNumber: null,
  verification: {
    phone: { status: 'VERIFIED', reason: null },
    pan: { status: 'UNVERIFIED', reason: null },
    aadhar: { status: 'UNVERIFIED', reason: null }
  },
  suspensionReason: null, bio: null, area: null,
  stores: [{
    id: 4, storeName: 'Chai Corner', category: 'Food', ownerId: 9, ownerName: 'Asha Rao', ownerUsername: 'asha',
    city: 'Pune', country: 'India', area: 'Kothrud', isActive: true, adminBlocked: false, reviewed: true,
    creationDateTime: '2026-10-02T10:00:00'
  }],
  ...over
});

describe('UserDetailPage', () => {
  let api: { getUser: ReturnType<typeof vi.fn>; suspendUser: ReturnType<typeof vi.fn>; liftSuspension: ReturnType<typeof vi.fn> };
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  const setup = async (initial: AdminUserDetail, url = '/users/9') => {
    api = {
      getUser: vi.fn().mockReturnValue(of(initial)),
      suspendUser: vi.fn().mockReturnValue(of(detail({ suspendedUntil: '2030-01-01T10:00:00' }, { suspensionReason: 'Abuse' }))),
      liftSuspension: vi.fn().mockReturnValue(of(detail()))
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'users/:id', component: UserDetailPage }]), { provide: AdminApiService, useValue: api }]
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, UserDetailPage);
    harness.detectChanges();
    el = harness.routeNativeElement as HTMLElement;
  };
  const button = (label: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === label);

  it('loadsUserAndLinksStores', async () => {
    await setup(detail());
    expect(api.getUser).toHaveBeenCalledWith(9);
    expect(el.textContent).toContain('Asha Rao');
    expect(el.querySelector('a[href="/stores/4"]')?.textContent).toContain('Chai Corner');
    expect(el.textContent).toContain('Active');
  });

  it('showsErrorForInvalidId', async () => {
    await setup(detail(), '/users/abc');
    expect(api.getUser).not.toHaveBeenCalled();
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('showsSuspensionAndLiftsIt', async () => {
    await setup(detail({ suspendedUntil: '2030-01-01T10:00:00' }, { suspensionReason: 'Abuse' }));
    expect(el.textContent).toContain('Suspended until');
    expect(el.textContent).toContain('Abuse');
    expect(button('Suspend user')).toBeUndefined();
    button('Lift suspension')!.click();
    harness.detectChanges();
    expect(api.liftSuspension).toHaveBeenCalledWith(9);
    expect(button('Suspend user')).toBeDefined();
  });

  it('suspendsUserViaDialog', async () => {
    await setup(detail());
    button('Suspend user')!.click();
    harness.detectChanges();
    const area = el.querySelector<HTMLTextAreaElement>('app-suspend-dialog textarea')!;
    area.value = 'Abuse';
    area.dispatchEvent(new Event('input'));
    harness.detectChanges();
    el.querySelector<HTMLButtonElement>('app-suspend-dialog button[data-testid="confirm"]')!.click();
    harness.detectChanges();
    expect(api.suspendUser).toHaveBeenCalledWith(9, expect.any(String), 'Abuse');
    expect(button('Lift suspension')).toBeDefined();
  });
});
