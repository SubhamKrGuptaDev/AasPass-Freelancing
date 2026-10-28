import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store/store.service';
import { StoreProfile } from '../../models/store.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  storeService = inject(StoreService);

  /** Mirrors StoreService.searchQuery, which stays the source of truth (resetFilters clears it). */
  readonly searchControl = new FormControl(this.storeService.searchQuery(), { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(q => this.storeService.setSearchQuery(q));

    effect(() => {
      const q = this.storeService.searchQuery();
      if (this.searchControl.value !== q) {
        this.searchControl.setValue(q, { emitEvent: false });
      }
    });
  }
}
