import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuspendDialogComponent } from './suspend-dialog';

@Component({
  imports: [SuspendDialogComponent],
  template: `<app-suspend-dialog (confirmed)="confirmed.push($event)" />`
})
class HostComponent {
  dialog = viewChild.required(SuspendDialogComponent);
  confirmed: { until: string; reason: string }[] = [];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Formats a date the way `<input type="datetime-local">` expects (local time, minute precision). */
const localInput = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

describe('SuspendDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    fixture.componentInstance.dialog().open();
    fixture.detectChanges();
  });

  const radio = (label: string) =>
    Array.from(el.querySelectorAll<HTMLLabelElement>('label'))
      .find((l) => l.textContent?.trim() === label)
      ?.querySelector<HTMLInputElement>('input[type="radio"]');
  const typeReason = (value: string) => {
    const area = el.querySelector<HTMLTextAreaElement>('textarea')!;
    area.value = value;
    area.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const setCustom = (value: string) => {
    const input = el.querySelector<HTMLInputElement>('input[type="datetime-local"]')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const confirm = () => {
    el.querySelector<HTMLButtonElement>('button[data-testid="confirm"]')!.click();
    fixture.detectChanges();
  };

  it('emitsUntilAboutSevenDaysAheadForSevenDayPreset', () => {
    radio('7 days')!.click();
    fixture.detectChanges();
    typeReason('  Abuse  ');
    const before = Date.now();
    confirm();
    const [out] = fixture.componentInstance.confirmed;
    expect(out.reason).toBe('Abuse');
    const delta = new Date(out.until).getTime() - before;
    expect(Math.abs(delta - 7 * DAY_MS)).toBeLessThan(5000);
  });

  it('blocksPastCustomDate', () => {
    radio('Custom')!.click();
    fixture.detectChanges();
    typeReason('Abuse');
    setCustom(localInput(new Date(Date.now() - DAY_MS)));
    confirm();
    expect(fixture.componentInstance.confirmed).toEqual([]);
    expect(el.textContent).toContain('Pick a time in the future');
    const input = el.querySelector<HTMLInputElement>('input[type="datetime-local"]')!;
    expect(el.querySelector(`#${input.getAttribute('aria-describedby')}`)?.textContent).toContain('Pick a time in the future');
  });

  it('blocksCustomDateBeyondOneYear', () => {
    radio('Custom')!.click();
    fixture.detectChanges();
    typeReason('Abuse');
    setCustom(localInput(new Date(Date.now() + 400 * DAY_MS)));
    confirm();
    expect(fixture.componentInstance.confirmed).toEqual([]);
    expect(el.textContent).toContain('Suspensions are limited to one year');
  });

  it('acceptsValidCustomDate', () => {
    radio('Custom')!.click();
    fixture.detectChanges();
    typeReason('Abuse');
    setCustom(localInput(new Date(Date.now() + 10 * DAY_MS)));
    confirm();
    expect(fixture.componentInstance.confirmed.length).toBe(1);
  });

  it('requiresReason', () => {
    const btn = el.querySelector<HTMLButtonElement>('button[data-testid="confirm"]')!;
    expect(btn.disabled).toBe(true);
    typeReason('x');
    expect(btn.disabled).toBe(false);
  });

  it('groupsPresetsInFieldsetWithLegend', () => {
    expect(el.querySelector('fieldset legend')).not.toBeNull();
    expect(el.querySelectorAll('fieldset input[type="radio"]').length).toBe(4);
  });
});
