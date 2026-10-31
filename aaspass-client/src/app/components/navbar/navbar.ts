import { Component, Injector, ElementRef, computed, afterNextRender, effect, inject, linkedSignal, signal, untracked, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, forkJoin, map, merge, of, startWith, switchMap } from 'rxjs';
import { OwnerBookingHttpService } from '../../services/booking';
import { StoreService } from '../../services/store/store.service';
import { AuthService } from '../../services/auth/auth.service';
import { displayImageUrl, fallbackToAvatar } from '../../models/user.model';
import { CityPickerComponent } from '../location-picker/city-picker';
import { CountryPickerComponent } from '../location-picker/country-picker';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CountryPickerComponent, CityPickerComponent],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()'
  },
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  protected readonly displayImageUrl = displayImageUrl;
  protected readonly fallbackToAvatar = fallbackToAvatar;
  storeService = inject(StoreService);
  authService = inject(AuthService);

  private readonly router = inject(Router);
  private readonly ownerBookings = inject(OwnerBookingHttpService);

  /** Owned stores as a stable id list, so the badge only re-queries when the set of stores changes. */
  private readonly ownedStoreIds = computed(() => (this.storeService.userStores() ?? []).map(s => s?.id).filter((id): id is string => !!id).join(','));

  /**
   * Pending booking requests across all owned stores, refreshed after every navigation and every owner
   * decision (confirm/reject happen in place, without navigating). Silent on errors (the badge simply
   * stays hidden); zero for non-owners.
   */
  readonly pendingBookings = toSignal(
    toObservable(this.ownedStoreIds).pipe(
      switchMap(ids =>
        merge(this.router.events.pipe(filter(e => e instanceof NavigationEnd)), this.ownerBookings.decisions$).pipe(
          startWith(null),
          switchMap(() => {
            const list = ids ? ids.split(',') : [];
            if (list.length === 0 || !this.authService.isLoggedIn()) {
              return of(0);
            }
            return forkJoin(list.map(id => this.ownerBookings.list(id, 'PENDING', 0, 1, true).pipe(
              map(p => p?.totalElements ?? 0),
              catchError(() => of(0))
            ))).pipe(map(counts => counts.reduce((a, b) => a + b, 0)));
          })
        )
      )
    ),
    { initialValue: 0 }
  );

  isDropdownOpen = signal<boolean>(false);
  isProfileMenuOpen = signal<boolean>(false);
  isLocationDropdownOpen = signal<boolean>(false);

  private readonly locationTrigger = viewChild<ElementRef<HTMLButtonElement>>('locationTrigger');
  private readonly locationPopover = viewChild<ElementRef<HTMLElement>>('locationPopover');

  /** "{city}, {country}", or just "{country}" when browsing all cities. */
  locationLabel = computed(() => {
    const city = this.storeService.selectedCity().trim();
    const country = this.storeService.selectedCountry();
    return city ? `${city}, ${country}` : country;
  });

  userFirstName = computed(() => {
    const name = this.storeService.currentUser()?.name;
    return name?.trim() ? name.trim().split(' ')[0] : 'User';
  });

  activeStoreId = computed(() => {
    const user = this.storeService.currentUser();
    const stores = this.storeService.userStores() || [];
    return user?.store?.id || (stores.length > 0 ? (stores[0]?.id || '') : '');
  });

  activeStoreUrlKey = computed(() => {
    const activeId = this.activeStoreId();
    const user = this.storeService.currentUser();
    const stores = this.storeService.userStores() || [];
    const store = stores.find(s => s?.id === activeId) ?? (user?.store?.id === activeId ? user.store : undefined);
    return this.storeService.getStoreUrlKey(store) || activeId;
  });

  activeStoreName = computed(() => {
    const activeId = this.activeStoreId();
    const stores = this.storeService.userStores() || [];
    const store = stores.find(s => s?.id === activeId);
    return store?.storeName || 'My Store';
  });

  /** Drives the My Store status dot: green while at least one of the user's stores is live in search, red when none is. */
  hasActiveStore = computed(() => (this.storeService.userStores() || []).some(s => s?.isActive === true));

  toggleLocationDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isDropdownOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.isLocationDropdownOpen.update(v => !v);
  }

  /** Two-way bound to the country picker; mirrors the store and is reset when the picker emits a blank/unknown value. */
  private readonly injector = inject(Injector);

  countryModel = linkedSignal(() => this.storeService.selectedCountry());

  constructor() {
    effect(() => {
      const picked = this.countryModel();
      if (picked === untracked(() => this.storeService.selectedCountry())) {
        return;
      }
      untracked(() => {
        this.storeService.setSelectedCountry(picked);
        // Blank/unknown picks are ignored by the store. Reset after the binding has rendered the pick, so the
        // picker is pushed back to the real country (a same-pass reset would look like "no change").
        afterNextRender(() => this.countryModel.set(this.storeService.selectedCountry()), { injector: this.injector });
      });
    });
  }

  // Pickers emit '' when cleared: a blank city means "all cities".
  onCityChange(city: string): void {
    this.storeService.setSelectedCity(city);
  }

  closeLocationPopover(restoreFocus = false): void {
    if (!this.isLocationDropdownOpen()) {
      return;
    }
    this.isLocationDropdownOpen.set(false);
    if (restoreFocus) {
      this.locationTrigger()?.nativeElement.focus();
    }
  }

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isLocationDropdownOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.isDropdownOpen.update(v => !v);
  }

  toggleProfileMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isLocationDropdownOpen.set(false);
    this.isDropdownOpen.set(false);
    this.isProfileMenuOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  closeDropdowns(): void {
    this.isLocationDropdownOpen.set(false);
    this.isDropdownOpen.set(false);
    this.isProfileMenuOpen.set(false);
  }

  logout(): void {
    this.closeDropdowns();
    this.authService.logout();
  }

  onDocumentClick(event: Event): void {
    // The pickers' option lists render in the CDK overlay, outside this component: not an "outside" click.
    const target = event.target;
    const inOverlay = target instanceof Element && target.closest('.cdk-overlay-container') !== null;
    if (inOverlay && this.isLocationDropdownOpen()) {
      this.isDropdownOpen.set(false);
      this.isProfileMenuOpen.set(false);
      return;
    }
    this.closeDropdowns();
  }

  onEscape(): void {
    // While a picker's list is open, Escape only closes that list.
    const listOpen = this.locationPopover()?.nativeElement.querySelector('[aria-expanded="true"]') != null;
    if (!listOpen) {
      this.closeLocationPopover(true);
    }
  }
}
