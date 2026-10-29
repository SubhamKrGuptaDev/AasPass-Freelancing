import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';

const MAX_REASON_LENGTH = 500;
let nextId = 0;

/** Modal asking for a free-text reason, built on the native `<dialog>` (focus trap and Esc come for free). */
@Component({
  selector: 'app-reason-dialog',
  template: `
    <dialog
      #dialog
      class="m-auto w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0 shadow-xl backdrop:bg-slate-900/50"
      [attr.aria-labelledby]="titleId"
      (cancel)="onNativeCancel($event)"
    >
      <form class="space-y-4 p-6" (submit)="onSubmit($event)">
        <h2 [id]="titleId" class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title() }}</h2>
        <div>
          <label [for]="areaId" class="block text-sm font-medium text-slate-800 dark:text-slate-200">Reason</label>
          <textarea
            [id]="areaId"
            rows="4"
            class="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:outline-none"
            [attr.maxlength]="maxLength"
            [attr.aria-required]="required()"
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
            class="rounded-md bg-slate-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="!canConfirm()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </form>
    </dialog>
  `
})
export class ReasonDialogComponent {
  readonly title = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly required = input(true);

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  protected readonly maxLength = MAX_REASON_LENGTH;
  protected readonly reason = signal('');
  protected readonly canConfirm = computed(() => !this.required() || this.reason().trim().length > 0);

  private readonly uid = nextId++;
  protected readonly titleId = `reason-dialog-title-${this.uid}`;
  protected readonly areaId = `reason-dialog-reason-${this.uid}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Opens the dialog modally with an empty reason. */
  open(): void {
    this.reason.set('');
    const el = this.dialog().nativeElement;
    if (typeof el.showModal === 'function') {
      if (!el.open) {
        el.showModal();
      }
    } else {
      el.setAttribute('open', '');
    }
  }

  protected asValue(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canConfirm()) {
      return;
    }
    const value = this.reason().trim();
    this.close();
    this.confirmed.emit(value);
  }

  protected cancel(): void {
    this.close();
    this.cancelled.emit();
  }

  /** Esc: let the browser close the dialog, but report the cancellation. */
  protected onNativeCancel(event: Event): void {
    event.preventDefault();
    this.cancel();
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
