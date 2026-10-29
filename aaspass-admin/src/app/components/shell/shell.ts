import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
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

  protected readonly menuOpen = signal(false);

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Charts', path: '/charts' },
    { label: 'Stores', path: '/stores' },
    { label: 'Users', path: '/users' }
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
