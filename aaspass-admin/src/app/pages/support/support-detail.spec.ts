import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AdminContactRequestDetail } from '../../models/admin.models';
import { AdminApiService } from '../../services/admin-api.service';
import { ToastService } from '../../services/toast.service';
import { SupportDetailPage } from './support-detail';

const detail = (over: Partial<AdminContactRequestDetail> = {}): AdminContactRequestDetail => ({
  id: 5, type: 'COMPLAINT', status: 'NEW', name: 'Asha Rao', email: 'asha@x.com', phone: '999',
  subject: 'Broken page', message: 'line one\nline two', adminNote: null, userId: 7, username: 'asha',
  handledByAdminId: null, resolvedAt: null, creationDateTime: '2026-10-02T10:00:00',
  lastUpdatedDateTime: '2026-10-02T10:00:00', ...over
});

describe('SupportDetailPage', () => {
  let api: { getContactRequest: ReturnType<typeof vi.fn>; updateContactRequest: ReturnType<typeof vi.fn> };
  let toast: { success: ReturnType<typeof vi.fn> };
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  const setup = async (initial: AdminContactRequestDetail | HttpErrorResponse) => {
    api = {
      getContactRequest: vi.fn().mockReturnValue(initial instanceof HttpErrorResponse ? throwError(() => initial) : of(initial)),
      updateContactRequest: vi.fn().mockReturnValue(
        of(detail({ status: 'RESOLVED', adminNote: 'Called', handledByAdminId: 3, resolvedAt: '2026-10-03T10:00:00' }))
      )
    };
    toast = { success: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'support/:id', component: SupportDetailPage }]),
        { provide: AdminApiService, useValue: api },
        { provide: ToastService, useValue: toast }
      ]
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/support/5', SupportDetailPage);
    harness.detectChanges();
    el = harness.routeNativeElement as HTMLElement;
  };

  const select = () => el.querySelector<HTMLSelectElement>('select#handling-status')!;
  const note = () => el.querySelector<HTMLTextAreaElement>('textarea#handling-note')!;
  const save = () => Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === 'Save')!;
  const choose = (value: string) => {
    select().value = value;
    select().dispatchEvent(new Event('change'));
    harness.detectChanges();
  };
  const type = (value: string) => {
    note().value = value;
    note().dispatchEvent(new Event('input'));
    harness.detectChanges();
  };

  it('showsMessageWithPreservedLineBreaks', async () => {
    await setup(detail());
    expect(api.getContactRequest).toHaveBeenCalledWith(5);
    const msg = el.querySelector('.whitespace-pre-wrap')!;
    expect(msg.textContent).toContain('line one\nline two');
  });

  it('rendersMailtoAndTelLinks', async () => {
    await setup(detail());
    expect(el.querySelector('a[href="mailto:asha@x.com"]')).not.toBeNull();
    expect(el.querySelector('a[href="tel:999"]')).not.toBeNull();
  });

  it('hasNoTelLinkWithoutPhone', async () => {
    await setup(detail({ phone: null }));
    expect(el.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('linksToTheUserWhenLinked', async () => {
    await setup(detail());
    const link = el.querySelector<HTMLAnchorElement>('a[href="/users/7"]');
    expect(link?.textContent).toContain('@asha');
  });

  it('hasNoUserLinkWhenNotLinked', async () => {
    await setup(detail({ userId: null, username: null }));
    expect(el.querySelector('a[href^="/users/"]')).toBeNull();
  });

  it('saveSendsOnlyChangedFields', async () => {
    await setup(detail());
    choose('RESOLVED');
    save().click();
    harness.detectChanges();
    expect(api.updateContactRequest).toHaveBeenCalledWith(5, { status: 'RESOLVED' });
    expect(toast.success).toHaveBeenCalled();
    expect(el.textContent).toContain('Last handled by admin #3');
    expect(note().value).toBe('Called');
  });

  it('saveSendsOnlyTheNoteWhenOnlyTheNoteChanged', async () => {
    await setup(detail());
    type('Called');
    save().click();
    expect(api.updateContactRequest).toHaveBeenCalledWith(5, { adminNote: 'Called' });
  });

  it('saveIsDisabledWhenNothingChanged', async () => {
    await setup(detail());
    expect(save().disabled).toBe(true);
    choose('IN_PROGRESS');
    expect(save().disabled).toBe(false);
    choose('NEW');
    expect(save().disabled).toBe(true);
  });

  it('unknownIdShowsNotFound', async () => {
    await setup(new HttpErrorResponse({ status: 404 }));
    expect(el.textContent).toContain('Request not found.');
  });
});
