import { Component, ElementRef, computed, output, signal, viewChild } from '@angular/core';

const MAX_REASON_LENGTH = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SUSPENSION_DAYS = 365;
const DEFAULT_PRESET = '7';
const PAST_MESSAGE = 'Pick a time in the future';
const TOO_LONG_MESSAGE = 'Suspensions are limited to one year';

type Preset = '1' | '7' | '30' | 'custom';

interface PresetOption {
  value: Preset;
  label: string;
}

const PRESETS: readonly PresetOption[] = [
  { value: '1', label: '1 day' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: 'custom', label: 'Custom' }
];

export interface SuspensionRequest {
  /** ISO-8601 instant. */
  until: string;
  reason: string;
}

let nextId = 0;

/** Modal choosing how long to suspend a user and why, built on the native `<dialog>`. */
@Component({
  selector: 'app-suspend-dialog',
  template: `
    <dialog
      #dialog
      class="m-auto w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-xl backdrop:bg-slate-900/50"
      [attr.aria-labelledby]="titleId"
      (cancel)="onNativeCancel($event)"
    >
      <form class="space-y-4 p-6" (submit)="onSubmit($event)">
        <h2 [id]="titleId" class="text-lg font-semibold text-slate-900 dark:text-slate-100">Suspend user</h2>

        <fieldset class="space-y-2">
          <legend class="text-sm font-medium text-slate-800 dark:text-slate-200">Suspend for</legend>
          @for (p of presets; track p.value) {
            <label class="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
              <input type="radio" [name]="groupName" [value]="p.value" [checked]="preset() === p.value" (change)="selectPreset(p.value)" />{{ p.label }}
            </label>
          }
        </fieldset>

        @if (preset() === 'custom') {
          <div>
            <label [for]="customId" class="block text-sm font-medium text-slate-800 dark:text-slate-200">Suspend until</label>
            <input
              [id]="customId"
              type="datetime-local"
              class="mt-1 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-sm text-slate-900 dark:text-slate-100"
              [attr.aria-invalid]="error() ? 'true' : null"
              [attr.aria-describedby]="error() ? errorId : null"
              [value]="customValue()"
              (input)="onCustom($event)"
            />
            @if (error(); as message) {
              <p [id]="errorId" role="alert" class="mt-1 text-sm text-rose-800 dark:text-rose-200">{{ message }}</p>
            }
          </div>
        }

        <div>
          <label [for]="reasonId" class="block text-sm font-medium text-slate-800 dark:text-slate-200">Reason</label>
          <textarea
            [id]="reasonId"
            rows="4"
            required
            class="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:outline-none"
            [attr.maxlength]="maxLength"
            [value]="reason()"
            (input)="reason.set(asValue($event))"
          ></textarea>
          <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ reason().length }}/{{ maxLength }}</p>
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            data-testid="cancel"
            class="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            (click)="cancel()"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="confirm"
            class="rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="!canConfirm()"
          >
            Suspend
          </button>
        </div>
      </form>
    </dialog>
  `
})
export class SuspendDialogComponent {
  readonly confirmed = output<SuspensionRequest>();
  readonly cancelled = output<void>();

  protected readonly presets = PRESETS;
  protected readonly maxLength = MAX_REASON_LENGTH;
  protected readonly preset = signal<Preset>(DEFAULT_PRESET);
  protected readonly customValue = signal('');
  protected readonly reason = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly canConfirm = computed(() => this.reason().trim().length > 0);

  private readonly uid = nextId++;
  protected readonly titleId = `suspend-dialog-title-${this.uid}`;
  protected readonly groupName = `suspend-dialog-preset-${this.uid}`;
  protected readonly customId = `suspend-dialog-custom-${this.uid}`;
  protected readonly reasonId = `suspend-dialog-reason-${this.uid}`;
  protected readonly errorId = `suspend-dialog-error-${this.uid}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Opens the dialog modally with default choices. */
  open(): void {
    this.preset.set(DEFAULT_PRESET);
    this.customValue.set('');
    this.reason.set('');
    this.error.set(null);
    const el = this.dialog().nativeElement;
    if (typeof el.showModal === 'function') {
      if (!el.open) {
        el.showModal();
      }
    } else {
      el.setAttribute('open', '');
    }
  }

  protected selectPreset(value: Preset): void {
    this.preset.set(value);
    this.error.set(null);
  }

  protected onCustom(event: Event): void {
    this.customValue.set(this.asValue(event));
    this.error.set(this.validateCustom(this.customValue()));
  }

  protected asValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canConfirm()) {
      return;
    }
    const until = this.resolveUntil();
    if (until === null) {
      return;
    }
    const reason = this.reason().trim();
    this.close();
    this.confirmed.emit({ until: until.toISOString(), reason });
  }

  protected cancel(): void {
    this.close();
    this.cancelled.emit();
  }

  /** Esc: report the cancellation and close through our own path. */
  protected onNativeCancel(event: Event): void {
    event.preventDefault();
    this.cancel();
  }

  /** Resolves the chosen end instant, or records the validation error and returns null. */
  private resolveUntil(): Date | null {
    const choice = this.preset();
    if (choice !== 'custom') {
      return new Date(Date.now() + Number(choice) * DAY_MS);
    }
    const message = this.validateCustom(this.customValue());
    this.error.set(message);
    return message === null ? new Date(this.customValue()) : null;
  }

  private validateCustom(value: string): string | null {
    const time = value ? new Date(value).getTime() : Number.NaN;
    if (!Number.isFinite(time) || time <= Date.now()) {
      return PAST_MESSAGE;
    }
    return time > Date.now() + MAX_SUSPENSION_DAYS * DAY_MS ? TOO_LONG_MESSAGE : null;
  }

  private close(): void {
    const el = this.dialog().nativeElement;
    if (typeof el.close === 'function') {
      el.close();
    } else {
      el.removeAttribute('open');
    }
  }
}
