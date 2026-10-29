import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideEye, lucideMapPin, lucideStar } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { StoreProfile } from '../../models/store.model';
import { displayImageUrl, fallbackToAvatar } from '../../models/user.model';
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

  /** "Area, City" with empty parts skipped (no distance: viewer location is not known). */
  readonly location = computed(() => [this.store().area, this.store().city].filter(Boolean).join(', '));

  /** Owner's uploaded picture when set, otherwise the store avatar. */
  readonly imageUrl = computed(() => displayImageUrl(this.store().ownerProfilePictureUrl, this.store().avatarUrl));
  protected readonly fallbackToAvatar = fallbackToAvatar;

  storeKey(): string {
    return this.storeService.getStoreUrlKey(this.store());
  }
}
