import { Component, computed, input, output } from '@angular/core';

/** Prev/Next pager. `page` is zero-based (matching the backend); the label shows it one-based. */
@Component({
  selector: 'app-pager',
  template: `
    <nav class="flex items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-300" aria-label="Pagination">
      <button
        type="button"
        class="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
        [disabled]="!hasPrev()"
        (click)="pageChange.emit(page() - 1)"
      >
        Prev
      </button>
      <span aria-live="polite">Page {{ page() + 1 }} of {{ displayTotal() }}</span>
      <button
        type="button"
        class="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
        [disabled]="!hasNext()"
        (click)="pageChange.emit(page() + 1)"
      >
        Next
      </button>
    </nav>
  `
})
export class PagerComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly displayTotal = computed(() => Math.max(1, this.totalPages()));
  protected readonly hasPrev = computed(() => this.page() > 0);
  protected readonly hasNext = computed(() => this.page() + 1 < this.totalPages());
}
