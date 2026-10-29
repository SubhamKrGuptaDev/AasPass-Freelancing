import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AdminStoreDetail } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { StoreDetailPage } from './store-detail';

const detail = (over: Partial<AdminStoreDetail> = {}, summary: Partial<AdminStoreDetail['summary']> = {}): AdminStoreDetail => ({
  summary: {
    id: 5, storeName: 'Chai Corner', category: 'Food', ownerId: 7, ownerName: 'Asha Rao', ownerUsername: 'asha',
    city: 'Pune', country: 'India', area: 'Kothrud', isActive: true, adminBlocked: false, reviewed: false,
    creationDateTime: '2026-10-02T10:00:00', ...summary
  },
  tagline: 'Best chai', description: 'Hot', googleMapLink: null, adminBlockReason: null, adminBlockedAt: null,
  adminReviewedAt: null,
  owner: { id: 7, name: 'Asha Rao', username: 'asha', email: 'asha@x.in', verified: true, suspendedUntil: null },
  ...over
});

describe('StoreDetailPage', () => {
  let api: {
    getStore: ReturnType<typeof vi.fn>;
    blockStore: ReturnType<typeof vi.fn>;
    unblockStore: ReturnType<typeof vi.fn>;
    reviewStore: ReturnType<typeof vi.fn>;
  };
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  const setup = async (initial: AdminStoreDetail) => {
    api = {
      getStore: vi.fn().mockReturnValue(of(initial)),
      blockStore: vi.fn().mockReturnValue(
        of(detail({ adminBlockReason: 'Fake', adminBlockedAt: '2026-10-03T10:00:00' }, { adminBlocked: true }))
      ),
      unblockStore: vi.fn().mockReturnValue(of(detail())),
      reviewStore: vi.fn().mockReturnValue(of(detail({ adminReviewedAt: '2026-10-03T10:00:00' }, { reviewed: true })))
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'stores/:id', component: StoreDetailPage }]), { provide: AdminApiService, useValue: api }]
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/stores/5', StoreDetailPage);
    harness.detectChanges();
    el = harness.routeNativeElement as HTMLElement;
  };

  const button = (label: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === label);

  it('blocksStoreAfterDialogConfirmsAndShowsBlockedChip', async () => {
    await setup(detail());
    expect(api.getStore).toHaveBeenCalledWith(5);
    button('Block store')!.click();
    harness.detectChanges();
    const area = el.querySelector<HTMLTextAreaElement>('dialog textarea')!;
    area.value = 'Fake';
    area.dispatchEvent(new Event('input'));
    harness.detectChanges();
    el.querySelector<HTMLButtonElement>('button[data-testid="confirm"]')!.click();
    harness.detectChanges();
    expect(api.blockStore).toHaveBeenCalledWith(5, 'Fake');
    expect(el.querySelector('app-status-chip')?.textContent).toContain('Blocked');
    expect(button('Unblock store')).toBeDefined();
    expect(el.textContent).toContain('Fake');
  });

  it('hidesMarkReviewedOnceReviewed', async () => {
    await setup(detail());
    expect(button('Mark reviewed')).toBeDefined();
    button('Mark reviewed')!.click();
    harness.detectChanges();
    expect(api.reviewStore).toHaveBeenCalledWith(5);
    expect(button('Mark reviewed')).toBeUndefined();
  });

  it('linksOwnerAndPublicPage', async () => {
    await setup(detail());
    expect(el.querySelector('a[href="/users/7"]')).not.toBeNull();
    expect(el.querySelector('a[href="http://localhost:4200/stores/5"]')).not.toBeNull();
  });

  it('showsNoOwnerNoticeWhenOwnerIsNull', async () => {
    await setup(detail({ owner: null }, { ownerId: null, ownerName: null, ownerUsername: null }));
    expect(el.querySelector('a[href^="/users/"]')).toBeNull();
    expect(el.textContent).toContain('This store has no owner account.');
    expect(el.textContent).not.toContain('@null');
  });

  it('unblocksStore', async () => {
    await setup(detail({ adminBlockReason: 'x' }, { adminBlocked: true, reviewed: true }));
    button('Unblock store')!.click();
    harness.detectChanges();
    expect(api.unblockStore).toHaveBeenCalledWith(5);
    expect(button('Block store')).toBeDefined();
  });
});
