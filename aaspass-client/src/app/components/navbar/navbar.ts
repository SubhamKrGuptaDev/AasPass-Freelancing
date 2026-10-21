import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  storeService = inject(StoreService);
  authService = inject(AuthService);

  isDropdownOpen = signal<boolean>(false);
  isProfileMenuOpen = signal<boolean>(false);
  isLocationDropdownOpen = signal<boolean>(false);

  userFirstName = computed(() => {
    const name = this.storeService.currentUser()?.name;
    return name?.trim() ? name.trim().split(' ')[0] : 'User';
  });

  activeStoreId = computed(() => {
    const user = this.storeService.currentUser();
    const stores = this.storeService.userStores() || [];
    return user?.store?.id || (stores.length > 0 ? (stores[0]?.id || '') : '');
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

  selectCity(city: string): void {
    this.storeService.setSelectedCity(city);
    this.isLocationDropdownOpen.set(false);
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

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeDropdowns();
  }
}
