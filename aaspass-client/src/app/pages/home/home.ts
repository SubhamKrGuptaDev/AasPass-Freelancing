import { Component, Injector, computed, afterNextRender, effect, inject, linkedSignal, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBaby, lucideBadgeCheck, lucideCalendarClock, lucideCamera, lucideCar, lucideChefHat, lucideClapperboard,
  lucideClock, lucideCode, lucideDumbbell, lucideFlame, lucideFlower2, lucideGraduationCap, lucideHammer, lucideHand,
  lucideHeartPulse, lucideHouse, lucideLock, lucideMapPin, lucideMegaphone, lucideMessageSquare, lucideMusic,
  lucidePalette, lucidePartyPopper, lucidePawPrint, lucidePenLine, lucidePercent, lucideRefrigerator, lucideScale,
  lucideScissors, lucideSearch, lucideShieldCheck, lucideShirt, lucideSmartphone, lucideSofa, lucideSparkles,
  lucideSpeaker, lucideSprayCan, lucideStore, lucideTruck, lucideUsers, lucideWrench, lucideZap
} from '@ng-icons/lucide';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { CityPickerComponent } from '../../components/location-picker/city-picker';
import { CountryPickerComponent } from '../../components/location-picker/country-picker';
import { StoreCardComponent } from '../../components/store-card/store-card';
import { StoreProfile } from '../../models/store.model';
import { StoreService } from '../../services/store/store.service';
import { sortStores, topStoresForCity } from '../../services/store/store-query';
import { normalizeCountry } from '../../geo/country';
import {
  COMPARISONS, EARN_STEPS, EXAMPLE_SELLERS, FAQS, HIRE_STEPS, HOME_CATEGORIES,
  SELLER_BENEFITS, SELLER_COPY, TRUST_POINTS, VALUE_PROPS
} from './home.content';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule, RouterLink, NgIcon, StoreCardComponent, CountryPickerComponent, CityPickerComponent,
    HlmAccordionImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmInputImports,
    HlmSkeletonImports, HlmTabsImports
  ],
  providers: [provideIcons({
    lucideBaby, lucideBadgeCheck, lucideCalendarClock, lucideCamera, lucideCar, lucideChefHat, lucideClapperboard,
    lucideClock, lucideCode, lucideDumbbell, lucideFlame, lucideFlower2, lucideGraduationCap, lucideHammer, lucideHand,
    lucideHeartPulse, lucideHouse, lucideLock, lucideMapPin, lucideMegaphone, lucideMessageSquare, lucideMusic,
    lucidePalette, lucidePartyPopper, lucidePawPrint, lucidePenLine, lucidePercent, lucideRefrigerator, lucideScale,
    lucideScissors, lucideSearch, lucideShieldCheck, lucideShirt, lucideSmartphone, lucideSofa, lucideSparkles,
    lucideSpeaker, lucideSprayCan, lucideStore, lucideTruck, lucideUsers, lucideWrench, lucideZap
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

  /** Collapsed category grid shows 4 cards on mobile/tablet and 8 from the lg breakpoint up. */
  readonly showAllCategories = signal(false);

  toggleCategories(): void {
    this.showAllCategories.update(shown => !shown);
  }

  /** Display classes for the card at `index`: CSS breakpoints decide visibility, so no resize listener is needed. */
  categoryCardVisibility(index: number): string {
    if (this.showAllCategories() || index < 4) {
      return 'flex';
    }
    return index < 8 ? 'hidden lg:flex' : 'hidden';
  }

  /** Two-way bound to the country picker; mirrors the store and is reset when the picker emits a blank/unknown value. */
  private readonly injector = inject(Injector);

  readonly countryModel = linkedSignal(() => this.storeService.selectedCountry());

  /** Country/city preview: category/search filters are deliberately ignored on Home. An empty city means the whole country. */
  readonly topStores = computed(() => {
    const city = this.storeService.selectedCity();
    const inCountry = this.storeService.stores().filter(store => this.inSelectedCountry(store));
    return city ? topStoresForCity(inCountry, city) : sortStores(inCountry, 'rating').slice(0, 6);
  });

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

  /** Local to Home; only applied on submit (navigates to /stores). */
  readonly heroSearch = new FormControl('', { nonNullable: true });

  // Pickers emit '' when cleared: a blank city means "all cities".
  onCityChange(city: string): void {
    this.storeService.setSelectedCity(city);
  }

  findTalent(): void {
    const q = this.heroSearch.value.trim();
    void this.router.navigate(['/stores'], {
      queryParams: {
        country: this.storeService.selectedCountry(),
        city: this.storeService.selectedCity() || null,
        q: q || null
      }
    });
  }

  private inSelectedCountry(store: StoreProfile): boolean {
    return normalizeCountry(store.country) === normalizeCountry(this.storeService.selectedCountry());
  }
}
