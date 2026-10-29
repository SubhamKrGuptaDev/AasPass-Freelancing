import { TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  const root = document.documentElement;
  let systemDark = false;
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];

  beforeEach(() => {
    localStorage.clear();
    root.classList.remove('dark');
    systemDark = false;
    listeners.length = 0;
    vi.stubGlobal(
      'matchMedia',
      vi.fn(
        () =>
          ({
          get matches() {
            return systemDark;
          },
          addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
          removeEventListener: () => undefined
        }) as unknown as MediaQueryList
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    root.classList.remove('dark');
  });

  const create = () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  };

  it('defaultsToSystemAndFollowsIt', () => {
    systemDark = true;
    const theme = create();
    expect(theme.mode()).toBe('system');
    expect(root.classList.contains('dark')).toBe(true);

    systemDark = false;
    listeners.forEach((fn) => fn({ matches: false } as MediaQueryListEvent));
    TestBed.tick();
    expect(root.classList.contains('dark')).toBe(false);
  });

  it('explicitChoiceWinsOverSystemAndIsRemembered', () => {
    systemDark = true;
    const theme = create();
    theme.setMode('light');
    TestBed.tick();
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.style.colorScheme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    theme.setMode('dark');
    TestBed.tick();
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.style.colorScheme).toBe('dark');
  });

  it('restoresTheSavedChoiceAndIgnoresJunk', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(create().mode()).toBe('dark');
    TestBed.resetTestingModule();
    localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(create().mode()).toBe('system');
  });

  it('toggleMarksTheActiveChoiceAndSwitchesTheme', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="theme-system"]')?.getAttribute('aria-pressed')).toBe('true');

    (el.querySelector('[data-testid="theme-dark"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    TestBed.tick();
    expect(el.querySelector('[data-testid="theme-dark"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('[data-testid="theme-system"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(root.classList.contains('dark')).toBe(true);
  });
});
