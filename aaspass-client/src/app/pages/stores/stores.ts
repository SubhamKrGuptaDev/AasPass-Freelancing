import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { StoreCardComponent } from '../../components/store-card/store-card';
import { StoreProfile } from '../../models/store.model';
import {
  DEFAULT_STORE_SORT,
  MAX_SEARCH_LENGTH,
  STORE_SORT_OPTIONS,
  StoreSortKey,
  parseStoresQuery,
  sortStores,
  toStoresQueryParams
} from '../../services/store/store-query';
import { StoreService } from '../../services/store/store.service';

@Component({
  selector: 'app-stores',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIcon,
    StoreCardComponent,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    HlmSkeletonImports,
    HlmSwitchImports,
    HlmToggleGroupImports
  ],
  providers: [provideIcons({ lucideSearch })],
  templateUrl: './stores.html'
})
export class StoresComponent {
  readonly storeService = inject(StoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly sortOptions = STORE_SORT_OPTIONS;
  readonly maxSearchLength = MAX_SEARCH_LENGTH;
  readonly skeletonSlots = [1, 2, 3, 4, 5, 6];

  readonly sort = signal<StoreSortKey>(DEFAULT_STORE_SORT);
  readonly openOnly = signal(false);
  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  readonly results = computed<StoreProfile[]>(() => {
    const stores = this.storeService.filteredStores();
    const visible = this.openOnly() ? stores.filter(store => store.isAvailable) : stores;
    return sortStores(visible, this.sort());
  });

  readonly otherCities = computed(() =>
    this.storeService.availableCities.filter(city => city !== this.storeService.selectedCity())
  );

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const query = parseStoresQuery(params, this.storeService.availableCities, this.storeService.categories);
      if (query.city) {
        this.storeService.setSelectedCity(query.city);
      }
      this.storeService.setSelectedCategory(query.category);
      this.storeService.setSearchQuery(query.q);
      this.sort.set(query.sort);
      this.openOnly.set(query.openOnly);
      this.searchControl.setValue(query.q, { emitEvent: false });
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => {
        this.storeService.setSearchQuery((value ?? '').trim().slice(0, MAX_SEARCH_LENGTH));
        this.syncUrl();
      });

    // Follow city changes made elsewhere (e.g. the navbar). Only navigates when the URL is out of date,
    // which also writes the city into the URL on first load and prevents URL <-> state loops.
    effect(() => {
      const city = this.storeService.selectedCity();
      const urlCity = untracked(() => this.route.snapshot.queryParamMap.get('city'));
      if (city !== urlCity) {
        untracked(() => this.syncUrl());
      }
    });
  }

  setCity(city: string): void {
    this.storeService.setSelectedCity(city);
    this.syncUrl();
  }

  setCategory(category: string): void {
    this.storeService.setSelectedCategory(category);
    this.syncUrl();
  }

  setSort(key: StoreSortKey): void {
    this.sort.set(key);
    this.syncUrl();
  }

  setOpenOnly(value: boolean): void {
    this.openOnly.set(value);
    this.syncUrl();
  }

  resetFilters(): void {
    this.storeService.resetFilters();
    this.sort.set(DEFAULT_STORE_SORT);
    this.openOnly.set(false);
    this.searchControl.setValue('', { emitEvent: false });
    this.syncUrl();
  }

  // Template handlers: helm components emit loosely typed values, so narrow before use.
  onCityChange(value: unknown): void {
    if (typeof value === 'string' && value) {
      this.setCity(value);
    }
  }

  onCategoryChange(value: unknown): void {
    if (typeof value === 'string' && value) {
      this.setCategory(value);
    }
  }

  onSortChange(value: unknown): void {
    const match = STORE_SORT_OPTIONS.find(option => option.key === value);
    if (match) {
      this.setSort(match.key);
    }
  }

  private syncUrl(): void {
    const queryParams = toStoresQueryParams({
      city: this.storeService.selectedCity(),
      category: this.storeService.selectedCategory(),
      q: this.searchControl.value.trim().slice(0, MAX_SEARCH_LENGTH),
      sort: this.sort(),
      openOnly: this.openOnly()
    });
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
