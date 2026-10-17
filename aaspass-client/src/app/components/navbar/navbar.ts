import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-6">
            <a routerLink="/" class="flex items-center gap-2 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                AP
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  AasPass
                </span>
                <span class="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 -mt-1">
                  Hyperlocal Freelancing
                </span>
              </div>
            </a>

            <!-- City / Location Selector -->
            <div class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium cursor-pointer transition">
              <svg class="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <select 
                [ngModel]="storeService.selectedCity()" 
                (ngModelChange)="storeService.setSelectedCity($event)"
                class="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option *ngFor="let city of storeService.availableCities" [value]="city">{{ city }}</option>
              </select>
            </div>
          </div>

          <!-- Nav Actions -->
          <div class="flex items-center gap-3">
            <!-- Explore Gigs link -->
            <a 
              routerLink="/" 
              routerLinkActive="text-indigo-600 font-semibold" 
              [routerLinkActiveOptions]="{exact: true}"
              class="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition"
            >
              <span>Explore Gigs</span>
            </a>

            <!-- Open Store / Store Dashboard CTA (Option A: Unified Account) -->
            @if (!storeService.currentUser().hasStore || storeService.userStores().length === 0) {
              <a 
                routerLink="/create-store" 
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-95"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>List Services / Open Store</span>
              </a>
            } @else if (storeService.userStores().length === 1) {
              <!-- Single Store: Direct My Store Link -->
              <a 
                [routerLink]="['/stores', activeStoreId()]" 
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition shadow-2xs"
                title="View your store"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>My Store</span>
              </a>
            } @else {
              <!-- Multiple Stores: My Store Button with Fast Switcher Dropdown -->
              <div class="relative inline-flex items-center">
                <!-- Primary My Store Button -->
                <a 
                  [routerLink]="['/stores', activeStoreId()]" 
                  (click)="closeDropdown()"
                  class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-l-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-r-0 border-indigo-200 transition shadow-2xs"
                  title="View your store ({{ activeStoreName() }})"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>My Store</span>
                </a>

                <!-- Dropdown Trigger Button -->
                <button 
                  type="button"
                  (click)="toggleDropdown($event)"
                  class="inline-flex items-center justify-center px-2 py-1.5 rounded-r-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer shadow-2xs"
                  [attr.aria-expanded]="isDropdownOpen()"
                  title="Switch between your {{ storeService.userStores().length }} stores"
                >
                  <span class="text-[10px] bg-indigo-200/80 text-indigo-900 font-bold px-1.5 py-0.5 rounded-full mr-1">
                    {{ storeService.userStores().length }}
                  </span>
                  <svg class="w-3.5 h-3.5 transform transition-transform" [class.rotate-180]="isDropdownOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- Multi-Store Dropdown Menu -->
                @if (isDropdownOpen()) {
                  <div 
                    class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95"
                    (click)="$event.stopPropagation()"
                  >
                    <div class="px-3.5 py-2 border-b border-slate-100">
                      <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                        Your Skill Stores ({{ storeService.userStores().length }})
                      </span>
                      <span class="text-xs font-semibold text-slate-600">Click to view storefront:</span>
                    </div>

                    <div class="max-h-56 overflow-y-auto py-1">
                      @for (st of storeService.userStores(); track st.id) {
                        <a 
                          [routerLink]="['/stores', st.id]"
                          (click)="closeDropdown()"
                          class="flex items-center justify-between px-3.5 py-2.5 hover:bg-indigo-50/70 transition group text-left"
                        >
                          <div class="min-w-0 pr-2">
                            <div class="flex items-center gap-1.5">
                              <span class="w-2 h-2 rounded-full flex-shrink-0" [class.bg-emerald-500]="st.isAvailable" [class.bg-rose-400]="!st.isAvailable"></span>
                              <span class="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate block">
                                {{ st.storeName }}
                              </span>
                            </div>
                            <span class="text-[11px] text-slate-400 block truncate pl-3.5">
                              {{ st.category }} • ₹{{ st.hourlyRate }}/hr
                            </span>
                          </div>
                          <span class="text-xs text-slate-400 group-hover:text-indigo-600">→</span>
                        </a>
                      }
                    </div>

                    <div class="border-t border-slate-100 pt-1.5 mt-1 px-2 space-y-1">
                      <a 
                        routerLink="/profile" 
                        (click)="closeDropdown()"
                        class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <span>⚙️</span>
                        <span>Manage Stores in Profile</span>
                      </a>
                      <a 
                        routerLink="/create-store" 
                        (click)="closeDropdown()"
                        class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <span>➕</span>
                        <span>Open Another Store</span>
                      </a>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- User Profile Avatar Pill -->
            <a 
              routerLink="/profile" 
              class="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition bg-slate-50/50"
              title="View Profile"
            >
              <img 
                [src]="storeService.currentUser().avatarUrl" 
                alt="Avatar" 
                class="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <span class="text-xs font-semibold text-slate-700 hidden md:inline">
                {{ storeService.currentUser().name.split(' ')[0] }}
              </span>
              @if (storeService.currentUser().hasStore) {
                <span class="hidden md:inline px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">PRO</span>
              }
            </a>

          </div>

        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  storeService = inject(StoreService);
  isDropdownOpen = signal<boolean>(false);

  activeStoreId = computed(() => {
    const user = this.storeService.currentUser();
    const stores = this.storeService.userStores();
    return user.store?.id || (stores.length > 0 ? stores[0].id : 'store-user-001');
  });

  activeStoreName = computed(() => {
    const activeId = this.activeStoreId();
    const store = this.storeService.userStores().find(s => s.id === activeId);
    return store ? store.storeName : 'My Store';
  });

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isDropdownOpen.set(false);
  }
}
