import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReasonDialogComponent } from './reason-dialog';

@Component({
  imports: [ReasonDialogComponent],
  template: `<app-reason-dialog
    title="Block store"
    confirmLabel="Block"
    [required]="required()"
    (confirmed)="confirmed.push($event)"
    (cancelled)="cancelledCount = cancelledCount + 1"
  />`
})
class HostComponent {
  dialog = viewChild.required(ReasonDialogComponent);
  required = signal(true);
  confirmed: string[] = [];
  cancelledCount = 0;
}

describe('ReasonDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  const confirmButton = () => el.querySelector<HTMLButtonElement>('button[data-testid="confirm"]')!;
  const type = (value: string) => {
    const area = el.querySelector<HTMLTextAreaElement>('textarea')!;
    area.value = value;
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  it('keepsConfirmDisabledForBlankInput', () => {
    fixture.componentInstance.dialog().open();
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(true);
    type('   ');
    expect(confirmButton().disabled).toBe(true);
    type('Spam');
    expect(confirmButton().disabled).toBe(false);
  });

  it('labelsTextareaAndLimitsLength', () => {
    const area = el.querySelector<HTMLTextAreaElement>('textarea')!;
    expect(el.querySelector(`label[for="${area.id}"]`)?.textContent).toContain('Reason');
    expect(area.maxLength).toBe(500);
  });

  it('emitsTrimmedReasonOnConfirm', () => {
    fixture.componentInstance.dialog().open();
    type('  Spam  ');
    confirmButton().click();
    expect(fixture.componentInstance.confirmed).toEqual(['Spam']);
  });

  it('emitsCancelledOnCancelButton', () => {
    fixture.componentInstance.dialog().open();
    el.querySelector<HTMLButtonElement>('button[data-testid="cancel"]')!.click();
    expect(fixture.componentInstance.cancelledCount).toBe(1);
  });

  it('allowsBlankWhenNotRequired', () => {
    fixture.componentInstance.required.set(false);
    fixture.detectChanges();
    fixture.componentInstance.dialog().open();
    fixture.detectChanges();
    expect(confirmButton().disabled).toBe(false);
  });
});
