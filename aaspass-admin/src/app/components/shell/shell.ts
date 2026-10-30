import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, filter, of, startWith, switchMap } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';

interface NavItem {
  label: string;
  path: string;
}

/** Layout for signed-in pages: side navigation (collapsible below md), top bar and the routed page. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HlmButtonImports, ThemeToggleComponent],
  templateUrl: './shell.html'
})
export class ShellComponent {
  protected readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly api = inject(AdminApiService);

  /** Dashboard counts, reloaded after every navigation so the Support badge stays current. */
  private readonly dashboard = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      switchMap(() => this.api.dashboard().pipe(catchError(() => of(null))))
    ),
    { initialValue: null }
  );
  protected readonly newContactRequests = computed(() => this.dashboard()?.newContactRequests ?? 0);

  protected readonly menuOpen = signal(false);

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Charts', path: '/charts' },
    { label: 'Stores', path: '/stores' },
    { label: 'Users', path: '/users' },
    { label: 'Support', path: '/support' }
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    const leave = () => void this.router.navigate(['/login']);
    this.auth.logout().subscribe({ next: leave, error: leave });
  }
}
