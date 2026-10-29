import { Component, computed, input } from '@angular/core';

export interface BarListItem {
  label: string;
  /** Secondary text under the label, e.g. the country. */
  detail?: string;
  value: number;
}

/**
 * Ranked horizontal bars with the value at each bar's tip. Built from plain HTML so the list is
 * its own accessible table of values; colour is never the only signal.
 */
@Component({
  selector: 'app-bar-list',
  host: { class: 'block' },
  template: `
    @if (items().length) {
      <ol class="space-y-2" [attr.aria-label]="label()">
        @for (item of rows(); track item.label + item.detail) {
          <li class="text-sm">
            <div class="flex items-baseline justify-between gap-2">
              <span class="truncate text-slate-900 dark:text-slate-100">
                {{ item.label }}@if (item.detail) {<span class="text-slate-700 dark:text-slate-300">, {{ item.detail }}</span>}
              </span>
            </div>
            <div class="mt-1 flex items-center gap-2">
              <div class="h-3 flex-1">
                <div class="h-3 rounded-r" [style.width.%]="item.percent" [style.background-color]="color()"></div>
              </div>
              <span class="w-10 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">{{ item.value }}</span>
            </div>
          </li>
        }
      </ol>
    } @else {
      <p class="text-sm text-slate-700 dark:text-slate-300">{{ emptyText() }}</p>
    }
  `
})
export class BarListComponent {
  readonly label = input.required<string>();
  readonly items = input.required<readonly BarListItem[]>();
  readonly color = input('var(--chart-series-1)');
  readonly emptyText = input('Nothing to show for this range.');

  protected readonly rows = computed(() => {
    const items = this.items();
    const max = Math.max(1, ...items.map((i) => i.value));
    return items.map((i) => ({ ...i, percent: Math.max(2, (i.value / max) * 100) }));
  });
}
