import { Component, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  SocialMediaLink,
  formatSocialUrl,
  displaySocialUrl,
  getSocialIcon,
  getSocialBadgeClass
} from '../../models/store.model';

/** One editable social link row. */
export type SocialLinkForm = FormGroup<{
  id: FormControl<string>;
  name: FormControl<string>;
  url: FormControl<string>;
}>;

export type SocialLinksFormArray = FormArray<SocialLinkForm>;

function newSocialLinkId(prefix: string): string {
  return prefix + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
}

export function createSocialLinkGroup(link: Partial<SocialMediaLink> = {}): SocialLinkForm {
  return new FormGroup({
    id: new FormControl(link.id || newSocialLinkId('sm-'), { nonNullable: true }),
    name: new FormControl(link.name ?? '', { nonNullable: true }),
    url: new FormControl(link.url ?? '', { nonNullable: true })
  });
}

export function createSocialLinksArray(links: SocialMediaLink[] = []): SocialLinksFormArray {
  return new FormArray(links.map(l => createSocialLinkGroup(l)));
}

/** Replaces every row of {@code array} with {@code links}. */
export function setSocialLinks(array: SocialLinksFormArray, links: SocialMediaLink[]): void {
  array.clear();
  links.forEach(l => array.push(createSocialLinkGroup(l)));
}

/** Trimmed links with both a name and a URL; blank rows are dropped. */
export function toValidSocialLinks(array: SocialLinksFormArray, idPrefix: string = 'sm-'): SocialMediaLink[] {
  return array.getRawValue()
    .map(l => ({
      id: l.id || newSocialLinkId(idPrefix),
      name: l.name.trim(),
      url: l.url.trim()
    }))
    .filter(l => l.name.length > 0 && l.url.length > 0);
}

@Component({
  selector: 'app-social-media-links',
  imports: [ReactiveFormsModule],
  templateUrl: './social-media-links.html',
  styleUrl: './social-media-links.css'
})
export class SocialMediaLinksComponent {
  readonly title = input<string>('Social Media & Portfolios');
  readonly subtitle = input<string>('Add multiple social media and portfolio links with their platform names.');
  readonly badgeNumber = input<number | string | null>(null);
  readonly showPresets = input<boolean>(true);
  readonly idPrefix = input<string>('sml');

  /** The parent form's links array; rows are added and removed in place. */
  readonly linksArray = input.required<SocialLinksFormArray>();

  datalistId = 'socialPlatformsList_' + Math.random().toString(36).substring(2, 8);

  formatUrl = formatSocialUrl;
  displayUrl = displaySocialUrl;
  getSocialIcon = getSocialIcon;
  getSocialBadgeClass = getSocialBadgeClass;

  readonly platformPresets = [
    { name: 'Instagram', icon: '📸', btnClass: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200' },
    { name: 'LinkedIn', icon: '💼', btnClass: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200' },
    { name: 'GitHub', icon: '💻', btnClass: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300' },
    { name: 'YouTube', icon: '🎥', btnClass: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' },
    { name: 'Portfolio', icon: '🌐', btnClass: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
    { name: 'Twitter / X', icon: '𝕏', btnClass: 'bg-slate-800 text-white hover:bg-black border-slate-800' },
    { name: 'Behance', icon: '🎨', btnClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
    { name: 'Dribbble', icon: '🏀', btnClass: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' }
  ];

  addLink(presetName: string = ''): void {
    this.linksArray().push(createSocialLinkGroup({ name: presetName }));
  }

  removeLink(index: number): void {
    this.linksArray().removeAt(index);
  }
}
