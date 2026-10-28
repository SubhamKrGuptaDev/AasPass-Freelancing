import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideEye, lucideMapPin, lucideStar } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { StoreProfile } from '../../models/store.model';
import { StoreService } from '../../services/store/store.service';

@Component({
  selector: 'app-store-card',
  imports: [RouterLink, NgIcon, HlmCardImports, HlmBadgeImports, HlmButtonImports],
  providers: [provideIcons({ lucideEye, lucideMapPin, lucideStar })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './store-card.html'
})
export class StoreCardComponent {
  readonly store = input.required<StoreProfile>();
  private readonly storeService = inject(StoreService);

  storeKey(): string {
    return this.storeService.getStoreUrlKey(this.store());
  }
}
