import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';

export interface ChartSeries {
  name: string;
  /** Mark colour only (a hex or `var(--chart-series-n)`); all text stays in slate text tokens. */
  color: string;
  /** One value per bucket, aligned with `ticks` / `labels`. */
  values: readonly number[];
}

interface Bar {
  path: string;
  color: string;
}

interface Bucket {
  index: number;
  hitX: number;
  centerX: number;
  bars: Bar[];
}

/** Fallback width until the host is measured (and in environments without ResizeObserver). */
const DEFAULT_WIDTH = 640;
const MIN_WIDTH = 240;
const HEIGHT = 220;
const MARGIN = { top: 12, right: 8, bottom: 28, left: 40 };
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const MAX_BAR = 24;
const GAP = 2;
const RADIUS = 4;
/** Roughly one x-axis label per this many pixels, so labels never collide. */
const PX_PER_X_LABEL = 64;
/** Approximate half-width of an 11px date label such as "30 Oct". */
const X_LABEL_HALF = 20;

/** Smallest "nice" step (1, 2, 5 × 10^n) that splits `max` into about four intervals. */
export function niceStep(max: number): number {
  if (max <= 4) {
    return 1;
  }
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw);
  return step ?? 10 * magnitude;
}

/** Compact tick text: 950, 1.2K, 3M. */
export function compact(value: number): string {
  if (value >= 1_000_000) {
    return `${+(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${+(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

/** Column with a 4px rounded data end and a square baseline. */
function columnPath(x: number, w: number, top: number, bottom: number): string {
  const h = bottom - top;
  const r = Math.min(RADIUS, w / 2, h);
  return `M${x},${bottom}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${bottom}Z`;
}

/**
 * Responsive SVG column chart for one or two series (grouped). Hovering or arrowing through a
 * bucket shows a tooltip; every value is also available in the data table, so nothing is gated
 * behind hover. Two or more series get a legend.
 */
@Component({
  selector: 'app-column-chart',
  host: { class: 'block' },
  template: `
    @if (series().length > 1) {
      <ul class="mb-2 flex flex-wrap gap-4 text-xs text-slate-700 dark:text-slate-300" [attr.aria-label]="label() + ' legend'">
        @for (s of series(); track s.name) {
          <li class="flex items-center gap-1.5">
            <span class="inline-block h-2.5 w-2.5 rounded-sm" [style.background-color]="s.color" aria-hidden="true"></span>
            {{ s.name }}
          </li>
        }
      </ul>
    }
    <div class="relative">
      <svg
        [attr.viewBox]="'0 0 ' + width() + ' ' + height"
        [attr.width]="width()"
        [attr.height]="height"
        class="block max-w-full touch-pan-y select-none rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
        role="img"
        tabindex="0"
        [attr.aria-label]="label() + '. Use the left and right arrow keys to read each value, or open the data table.'"
        (pointerleave)="active.set(null)"
        (blur)="active.set(null)"
        (focus)="onFocus()"
        (keydown)="onKey($event)"
      >
        @for (tick of yTicks(); track tick.value) {
          <line [attr.x1]="left" [attr.x2]="width() - right" [attr.y1]="tick.y" [attr.y2]="tick.y" stroke-width="1" class="stroke-slate-200 dark:stroke-slate-700" />
          <text [attr.x]="left - 6" [attr.y]="tick.y" text-anchor="end" dominant-baseline="middle" font-size="11" class="fill-slate-600 dark:fill-slate-400">
            {{ tick.text }}
          </text>
        }
        @if (active() !== null) {
          <rect [attr.x]="buckets()[active()!].hitX" [attr.y]="top" [attr.width]="band()" [attr.height]="plotH" class="fill-slate-100 dark:fill-slate-800" />
        }
        @for (bucket of buckets(); track bucket.index) {
          @for (bar of bucket.bars; track $index) {
            <path [attr.d]="bar.path" [style.fill]="bar.color" />
          }
        }
        @for (tick of xTicks(); track tick.index) {
          <text [attr.x]="tick.x" [attr.y]="height - 8" [attr.text-anchor]="tick.anchor" font-size="11" class="fill-slate-600 dark:fill-slate-400">{{ tick.text }}</text>
        }
        @for (bucket of buckets(); track bucket.index) {
          <rect
            [attr.x]="bucket.hitX"
            [attr.y]="top"
            [attr.width]="band()"
            [attr.height]="plotH"
            fill="transparent"
            (pointerenter)="active.set(bucket.index)"
          />
        }
      </svg>
      @if (tooltip(); as tip) {
        <div
          class="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs shadow-md"
          [style.left.%]="tip.leftPercent"
          aria-live="polite"
          data-testid="chart-tooltip"
        >
          <p class="text-slate-700 dark:text-slate-300">{{ tip.label }}</p>
          @for (row of tip.rows; track row.name) {
            <p class="mt-1 flex items-center gap-2">
              <span class="inline-block h-0.5 w-3 rounded" [style.background-color]="row.color" aria-hidden="true"></span>
              <strong class="text-sm text-slate-900 dark:text-slate-100">{{ row.value }}</strong>
              <span class="text-slate-700 dark:text-slate-300">{{ row.name }}</span>
            </p>
          }
        </div>
      }
    </div>
    <details class="mt-2 text-sm">
      <summary class="cursor-pointer text-indigo-700 dark:text-indigo-300 underline underline-offset-2">Show data table</summary>
      <div class="mt-2 max-h-64 overflow-auto">
        <table class="w-full text-left text-xs">
          <caption class="sr-only">{{ label() }}</caption>
          <thead class="text-slate-700 dark:text-slate-300">
            <tr>
              <th scope="col" class="py-1 pr-2 font-medium">Period</th>
              @for (s of series(); track s.name) {
                <th scope="col" class="py-1 pr-2 text-right font-medium">{{ s.name }}</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
            @for (l of labels(); track $index; let i = $index) {
              <tr>
                <th scope="row" class="py-1 pr-2 font-normal">{{ l }}</th>
                @for (s of series(); track s.name) {
                  <td class="py-1 pr-2 text-right tabular-nums">{{ s.values[i] ?? 0 }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </details>
  `
})
export class ColumnChartComponent {
  /** Accessible name of the chart and caption of its data table. */
  readonly label = input.required<string>();
  /** Short axis text per bucket (some are skipped to avoid collisions). */
  readonly ticks = input.required<readonly string[]>();
  /** Full bucket names for the tooltip and data table. */
  readonly labels = input.required<readonly string[]>();
  readonly series = input.required<readonly ChartSeries[]>();

  /** Measured host width in CSS pixels; the viewBox matches it so 11px text renders at 11px. */
  protected readonly width = signal(DEFAULT_WIDTH);
  protected readonly height = HEIGHT;
  protected readonly left = MARGIN.left;
  protected readonly right = MARGIN.right;
  protected readonly top = MARGIN.top;
  protected readonly plotH = PLOT_H;
  protected readonly active = signal<number | null>(null);

  private readonly plotW = computed(() => this.width() - MARGIN.left - MARGIN.right);
  private readonly count = computed(() => this.labels().length);
  protected readonly band = computed(() => (this.count() ? this.plotW() / this.count() : this.plotW()));

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const observer = new ResizeObserver((entries) => {
        const measured = Math.floor(entries[0]?.contentRect.width ?? 0);
        if (measured > 0) {
          this.width.set(Math.max(MIN_WIDTH, measured));
        }
      });
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private readonly yMax = computed(() => {
    const max = Math.max(0, ...this.series().flatMap((s) => s.values));
    const step = niceStep(max);
    return { step, max: Math.max(step * 4, Math.ceil(max / step) * step) };
  });

  private y(value: number): number {
    return MARGIN.top + PLOT_H - (value / this.yMax().max) * PLOT_H;
  }

  protected readonly yTicks = computed(() => {
    const { step, max } = this.yMax();
    const ticks: { value: number; y: number; text: string }[] = [];
    for (let v = 0; v <= max; v += step) {
      ticks.push({ value: v, y: this.y(v), text: compact(v) });
    }
    return ticks;
  });

  protected readonly buckets = computed<Bucket[]>(() => {
    const series = this.series();
    const band = this.band();
    const k = Math.max(1, series.length);
    const barW = Math.max(2, Math.min(MAX_BAR, (band * 0.7 - GAP * (k - 1)) / k));
    const groupW = barW * k + GAP * (k - 1);
    const baseline = MARGIN.top + PLOT_H;
    return Array.from({ length: this.count() }, (_, i) => {
      const hitX = MARGIN.left + i * band;
      const start = hitX + (band - groupW) / 2;
      const bars: Bar[] = [];
      series.forEach((s, j) => {
        const value = s.values[i] ?? 0;
        if (value > 0) {
          bars.push({ path: columnPath(start + j * (barW + GAP), barW, this.y(value), baseline), color: s.color });
        }
      });
      return { index: i, hitX, centerX: hitX + band / 2, bars };
    });
  });

  protected readonly xTicks = computed(() => {
    const ticks = this.ticks();
    const n = ticks.length;
    const maxLabels = Math.max(2, Math.floor(this.plotW() / PX_PER_X_LABEL));
    const every = Math.max(1, Math.ceil(n / maxLabels));
    return this.buckets()
      .filter((b) => (n - 1 - b.index) % every === 0)
      .map((b) => {
        // A centred label near the right edge would be clipped, so right-align it to the plot edge instead.
        const nearEdge = b.centerX + X_LABEL_HALF > this.width();
        return {
          index: b.index,
          x: nearEdge ? this.width() - 1 : b.centerX,
          anchor: nearEdge ? 'end' : 'middle',
          text: ticks[b.index] ?? ''
        };
      });
  });

  protected readonly tooltip = computed(() => {
    const i = this.active();
    const bucket = i === null ? undefined : this.buckets()[i];
    if (i === null || !bucket) {
      return null;
    }
    return {
      leftPercent: Math.min(85, Math.max(15, (bucket.centerX / this.width()) * 100)),
      label: this.labels()[i] ?? '',
      rows: this.series().map((s) => ({ name: s.name, color: s.color, value: s.values[i] ?? 0 }))
    };
  });

  protected onFocus(): void {
    if (this.active() === null && this.count()) {
      this.active.set(this.count() - 1);
    }
  }

  protected onKey(event: KeyboardEvent): void {
    const n = this.count();
    if (!n) {
      return;
    }
    const current = this.active() ?? n - 1;
    const next =
      event.key === 'ArrowLeft' ? Math.max(0, current - 1)
      : event.key === 'ArrowRight' ? Math.min(n - 1, current + 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? n - 1
      : null;
    if (event.key === 'Escape') {
      this.active.set(null);
      return;
    }
    if (next !== null) {
      event.preventDefault();
      this.active.set(next);
    }
  }
}
