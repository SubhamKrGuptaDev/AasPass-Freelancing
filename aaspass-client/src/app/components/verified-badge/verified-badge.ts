import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBadgeCheck } from '@ng-icons/lucide';

/** Small green check-badge shown next to the name of a verified user. */
@Component({
  selector: 'app-verified-badge',
  imports: [NgIcon],
  providers: [provideIcons({ lucideBadgeCheck })],
  templateUrl: './verified-badge.html',
  host: {
    role: 'img',
    'aria-label': 'Verified',
    title: 'Verified',
    '[attr.data-size]': 'size()',
    class: 'inline-flex align-middle text-emerald-600'
  }
})
export class VerifiedBadgeComponent {
  readonly size = input<'sm' | 'md'>('sm');
}
