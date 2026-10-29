import { DOCUMENT } from '@angular/common';
import { DestroyRef, Service, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

/** localStorage key; also read by the inline script in index.html so the first paint is already themed. */
export const THEME_STORAGE_KEY = 'aaspass-admin-theme';

const MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

function isMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

/**
 * Light / dark / follow-the-system theme for the admin app. Applies the `dark` class (Tailwind's
 * dark variant) and `color-scheme` to <html>, and remembers the choice per browser. Storage is a
 * convenience: when it is unavailable the app still themes correctly, it just forgets the choice.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  readonly mode = signal<ThemeMode>(this.readStored());
  private readonly systemDark = signal(this.media?.matches ?? false);

  /** The theme actually shown once "system" is resolved. */
  readonly resolved = computed<'light' | 'dark'>(() => {
    const mode = this.mode();
    return mode === 'system' ? (this.systemDark() ? 'dark' : 'light') : mode;
  });

  constructor() {
    if (this.media) {
      const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      this.media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));
    }
    effect(() => {
      const root = this.document.documentElement;
      const dark = this.resolved() === 'dark';
      root.classList.toggle('dark', dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    try {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Private mode or blocked storage: keep the choice for this visit only.
    }
  }

  private readStored(): ThemeMode {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY);
      return isMode(stored) ? stored : 'system';
    } catch {
      return 'system';
    }
  }
}
