import { Component, computed, effect, inject, model, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { StoreService } from '../../services/store/store.service';

/**
 * Picks which owned store an owner page works on. Keeps `?store=` in sync, honours it on load when
 * it names an owned store, and otherwise defaults to the first owned store.
 */
@Component({
  selector: 'app-owner-store-switcher',
  imports: [HlmInputImports],
  host: { class: 'block' },
  template: `
    @if (stores().length > 1) {
      <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span>Store</span>
        <select hlmInput class="min-w-48" aria-label="Store" [value]="selectedStoreId() ?? ''" (change)="onSelect($event)">
          @for (s of stores(); track s.id) {
            <option [value]="s.id" [selected]="s.id === selectedStoreId()">{{ s.storeName }}</option>
          }
        </select>
      </label>
    } @else if (stores()[0]; as only) {
      <p class="text-sm font-semibold text-slate-700">{{ only.storeName }}</p>
    }
  `
})
export class OwnerStoreSwitcherComponent {
  private readonly storeService = inject(StoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedStoreId = model<string>();

  protected readonly stores = computed(() => this.storeService.userStores() ?? []);
  private readonly queryStore = toSignal(this.route.queryParamMap.pipe(map(p => p.get('store'))), { initialValue: null });

  constructor() {
    effect(() => {
      const stores = this.stores();
      const fromQuery = this.queryStore();
      const current = untracked(() => this.selectedStoreId());
      const queried = fromQuery ? stores.find(s => String(s.id) === fromQuery) : undefined;
      const next = queried?.id ?? (stores.some(s => s.id === current) ? current : stores[0]?.id);
      if (next !== current) {
        this.selectedStoreId.set(next);
      }
    });
  }

  protected onSelect(event: Event): void {
    this.onChange((event.target as HTMLSelectElement).value);
  }

  private onChange(id: string): void {
    if (!id || id === this.selectedStoreId()) {
      return;
    }
    this.selectedStoreId.set(id);
    void this.router.navigate([], { relativeTo: this.route, queryParams: { store: id }, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
