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
  | 'suspended'
  | 'new'
  | 'in progress'
  | 'resolved';

/** Text-bearing status pill; the label is always rendered so colour is never the only signal. */
const TONES: Record<ChipStatus, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200',
  verified: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200',
  inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
  unverified: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
  pending: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
  unreviewed: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200',
  blocked: 'bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200',
  rejected: 'bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200',
  suspended: 'bg-rose-100 dark:bg-rose-900/50 text-rose-900 dark:text-rose-200',
  new: 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200',
  'in progress': 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200',
  resolved: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200'
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
