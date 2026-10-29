import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../../services/store/store.service';
import { AuthService } from '../../services/auth/auth.service';
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
  storeService = inject(StoreService);
  authService = inject(AuthService);

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

  toggleLocationDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isDropdownOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.isLocationDropdownOpen.update(v => !v);
  }

  // Pickers emit '' when cleared: a blank country is ignored by the store; a blank city means "all cities".
  onCountryChange(country: string): void {
    this.storeService.setSelectedCountry(country);
  }

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
