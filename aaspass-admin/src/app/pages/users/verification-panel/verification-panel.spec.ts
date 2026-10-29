import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminUserDetail } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';
import { VerificationPanelComponent } from './verification-panel';

const detail = (over: Partial<AdminUserDetail> = {}): AdminUserDetail => ({
  summary: {
    id: 9, name: 'Asha Rao', username: 'asha', email: 'a@x.in', city: 'Pune', country: 'India',
    phoneStatus: 'UNVERIFIED', panStatus: 'UNVERIFIED', aadharStatus: 'VERIFIED', suspendedUntil: null,
    storeCount: 0, creationDateTime: '2026-10-01T10:00:00'
  },
  phone: null, panNumber: 'ABCDE1234F', aadharNumber: '123412341234',
  verification: {
    phone: { status: 'UNVERIFIED', reason: null },
    pan: { status: 'UNVERIFIED', reason: null },
    aadhar: { status: 'VERIFIED', reason: null }
  },
  suspensionReason: null, bio: null, area: null, stores: [],
  ...over
});

@Component({
  imports: [VerificationPanelComponent],
  template: `<app-verification-panel [detail]="detail()" (changed)="changes.push($event)" />`
})
class HostComponent {
  detail = signal(detail());
  changes: AdminUserDetail[] = [];
}

describe('VerificationPanelComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;
  let api: { decideVerification: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { decideVerification: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: AdminApiService, useValue: api }] });
    fixture = TestBed.createComponent(HostComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  const row = (label: string) =>
    Array.from(el.querySelectorAll<HTMLElement>('[data-testid="row"]')).find((r) => r.textContent?.includes(label))!;
  const btn = (r: HTMLElement, label: string) =>
    Array.from(r.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === label);

  it('disablesButtonsAndShowsNotProvidedForMissingPhone', () => {
    const r = row('Mobile number');
    expect(r.textContent).toContain('Not provided');
    expect(btn(r, 'Verify')!.disabled).toBe(true);
    expect(btn(r, 'Reject')!.disabled).toBe(true);
  });

  it('showsFullValuesAndStatusText', () => {
    expect(row('PAN card').textContent).toContain('ABCDE1234F');
    expect(row('Aadhaar card').textContent).toContain('123412341234');
    expect(row('Aadhaar card').textContent).toContain('Verified');
  });

  it('hidesVerifyWhenAlreadyVerified', () => {
    const r = row('Aadhaar card');
    expect(btn(r, 'Verify')).toBeUndefined();
    expect(btn(r, 'Reject')).toBeDefined();
  });

  it('verifiesWithoutReason', () => {
    const updated = detail();
    api.decideVerification.mockReturnValue(of(updated));
    btn(row('PAN card'), 'Verify')!.click();
    fixture.detectChanges();
    expect(api.decideVerification).toHaveBeenCalledWith(9, 'pan', 'VERIFIED');
    expect(fixture.componentInstance.changes).toEqual([updated]);
  });

  it('rejectsWithReasonAfterDialogConfirmAndEmitsDetail', () => {
    const updated = detail({ verification: { ...detail().verification, pan: { status: 'REJECTED', reason: 'Blurry' } } });
    api.decideVerification.mockReturnValue(of(updated));
    btn(row('PAN card'), 'Reject')!.click();
    fixture.detectChanges();
    const area = el.querySelector<HTMLTextAreaElement>('dialog textarea')!;
    area.value = 'Blurry';
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('button[data-testid="confirm"]')!.click();
    fixture.detectChanges();
    expect(api.decideVerification).toHaveBeenCalledWith(9, 'pan', 'REJECTED', 'Blurry');
    expect(fixture.componentInstance.changes).toEqual([updated]);
  });

  it('showsRejectionReason', () => {
    fixture.componentInstance.detail.set(
      detail({ verification: { ...detail().verification, pan: { status: 'REJECTED', reason: 'Blurry' } } })
    );
    fixture.detectChanges();
    expect(row('PAN card').textContent).toContain('Blurry');
    expect(row('PAN card').textContent).toContain('Rejected');
  });
});
