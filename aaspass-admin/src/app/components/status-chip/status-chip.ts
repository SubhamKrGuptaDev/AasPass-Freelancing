import { Component, computed, input } from '@angular/core';

export type ChipStatus =
  | 'active'
  | 'inactive'
  | 'blocked'
  | 'unreviewed'
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'unverified'
  | 'suspended';

/** Text-bearing status pill; the label is always rendered so colour is never the only signal. */
const TONES: Record<ChipStatus, string> = {
  active: 'bg-emerald-100 text-emerald-900',
  verified: 'bg-emerald-100 text-emerald-900',
  inactive: 'bg-slate-100 text-slate-800',
  unverified: 'bg-slate-100 text-slate-800',
  pending: 'bg-slate-100 text-slate-800',
  unreviewed: 'bg-amber-100 text-amber-900',
  blocked: 'bg-rose-100 text-rose-900',
  rejected: 'bg-rose-100 text-rose-900',
  suspended: 'bg-rose-100 text-rose-900'
};

@Component({
  selector: 'app-status-chip',
  template: `{{ label() }}`,
  host: {
    class: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
    '[class]': 'tone()'
  }
})
export class StatusChipComponent {
  readonly status = input.required<ChipStatus>();

  protected readonly label = computed(() => {
    const value = this.status();
    return value.charAt(0).toUpperCase() + value.slice(1);
  });
  protected readonly tone = computed(() => TONES[this.status()] ?? TONES.inactive);
}
