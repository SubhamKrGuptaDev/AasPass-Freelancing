import { Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBadgeCheck, lucideCalendarClock, lucideCamera, lucideCar, lucideClapperboard,
  lucideClock, lucideCode, lucideDumbbell, lucideGraduationCap, lucideHouse, lucideLock, lucideMapPin,
  lucideMessageSquare, lucideMusic, lucidePalette, lucidePercent, lucideSearch, lucideShieldCheck,
  lucideSmartphone, lucideSparkles, lucideStore, lucideUsers, lucideWrench
} from '@ng-icons/lucide';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { StoreCardComponent } from '../../components/store-card/store-card';
import { StoreService } from '../../services/store/store.service';
import { topStoresForCity } from '../../services/store/store-query';
import {
  COMPARISONS, EARN_STEPS, EXAMPLE_SELLERS, FAQS, HIRE_STEPS, HOME_CATEGORIES,
  SELLER_BENEFITS, SELLER_COPY, TRUST_POINTS, VALUE_PROPS
} from './home.content';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule, RouterLink, NgIcon, StoreCardComponent,
    HlmAccordionImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmInputImports,
    HlmSelectImports, HlmSkeletonImports, HlmTabsImports
  ],
  providers: [provideIcons({
    lucideBadgeCheck, lucideCalendarClock, lucideCamera, lucideCar, lucideClapperboard,
    lucideClock, lucideCode, lucideDumbbell, lucideGraduationCap, lucideHouse, lucideLock, lucideMapPin,
    lucideMessageSquare, lucideMusic, lucidePalette, lucidePercent, lucideSearch, lucideShieldCheck,
    lucideSmartphone, lucideSparkles, lucideStore, lucideUsers, lucideWrench
  })],
  templateUrl: './home.html'
})
export class HomeComponent {
  readonly storeService = inject(StoreService);
  private readonly router = inject(Router);

  readonly categories = HOME_CATEGORIES;
  readonly sellerCopy = SELLER_COPY;
  readonly sellerBenefits = SELLER_BENEFITS;
  readonly exampleSellers = EXAMPLE_SELLERS;
  readonly hireSteps = HIRE_STEPS;
  readonly earnSteps = EARN_STEPS;
  readonly comparisons = COMPARISONS;
  readonly valueProps = VALUE_PROPS;
  readonly trustPoints = TRUST_POINTS;
  readonly faqs = FAQS;
  readonly skeletons = [1, 2, 3, 4, 5, 6];

  /** City-only preview: category/search filters are deliberately ignored on Home. */
  readonly topStores = computed(() =>
    topStoresForCity(this.storeService.stores(), this.storeService.selectedCity())
  );

  /** Local to Home; only applied on submit (navigates to /stores). */
  readonly heroSearch = new FormControl('', { nonNullable: true });

  onCityChange(city: string | null | undefined): void {
    if (city) {
      this.storeService.setSelectedCity(city);
    }
  }

  findTalent(): void {
    const q = this.heroSearch.value.trim();
    void this.router.navigate(['/stores'], {
      queryParams: { city: this.storeService.selectedCity(), q: q || null }
    });
  }
}
