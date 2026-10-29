import { Component, inject } from '@angular/core';
import { ThemeMode, ThemeService } from '../../services/theme/theme.service';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
}

const OPTIONS: readonly ThemeOption[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' }
];

/** Segmented Light / Dark / System switch; the pressed button is the active choice. */
@Component({
  selector: 'app-theme-toggle',
  host: { class: 'inline-flex' },
  template: `
    <div
      role="group"
      aria-label="Colour theme"
      class="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-900"
    >
      @for (option of options; track option.mode) {
        <button
          type="button"
          class="rounded-md px-2.5 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
          [class]="
            theme.mode() === option.mode
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          "
          [attr.aria-pressed]="theme.mode() === option.mode"
          [attr.data-testid]="'theme-' + option.mode"
          (click)="theme.setMode(option.mode)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly options = OPTIONS;
}
