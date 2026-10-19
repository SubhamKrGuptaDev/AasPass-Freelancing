import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  SocialMediaLink, 
  formatSocialUrl, 
  displaySocialUrl, 
  getSocialIcon, 
  getSocialBadgeClass 
} from '../../models/store.model';

@Component({
  selector: 'app-social-media-links',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Section Header -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          @if (badgeNumber !== null && badgeNumber !== undefined) {
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
              {{ badgeNumber }}
            </span>
          }
          <span>{{ title }}</span>
        </h3>
        <span class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          {{ links.length }} {{ links.length === 1 ? 'link added' : 'links added' }}
        </span>
      </div>

      @if (subtitle) {
        <p class="text-xs text-slate-500 leading-relaxed">
          {{ subtitle }}
        </p>
      }

      <!-- Quick Preset Chips -->
      @if (showPresets) {
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Add Platform:
          </span>
          <div class="flex flex-wrap gap-1.5">
            @for (p of platformPresets; track p.name) {
              <button 
                type="button" 
                (click)="addLink(p.name)"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer {{ p.btnClass }}"
              >
                + {{ p.icon }} {{ p.name }}
              </button>
            }
          </div>
        </div>
      }

      <!-- Suggested platforms datalist -->
      <datalist [id]="datalistId">
        <option value="Instagram"></option>
        <option value="LinkedIn"></option>
        <option value="GitHub"></option>
        <option value="YouTube"></option>
        <option value="Portfolio Website"></option>
        <option value="Twitter / X"></option>
        <option value="Behance"></option>
        <option value="Dribbble"></option>
        <option value="Facebook"></option>
        <option value="Discord"></option>
        <option value="Medium / Blog"></option>
        <option value="Spotify / Podcast"></option>
        <option value="Telegram"></option>
      </datalist>

      <!-- List of Dynamic Social Media Links -->
      <div class="space-y-3">
        @for (link of links; track link.id || $index; let i = $index) {
          <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 transition hover:border-indigo-200">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>{{ getSocialIcon(link.name) }}</span>
                <span>{{ link.name || 'Platform #' + (i + 1) }}</span>
              </span>
              
              <div class="flex items-center gap-2">
                @if (link.url) {
                  <a 
                    [href]="formatUrl(link.url)" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                    title="Test direct redirect in new tab"
                  >
                    <span>Direct Redirect ↗</span>
                  </a>
                }
                <button 
                  type="button" 
                  (click)="removeLink(i)"
                  class="text-xs font-semibold text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                  title="Remove this link"
                >
                  ✕ Remove
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div class="sm:col-span-5">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Platform Name *
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="link.name" 
                  [name]="idPrefix + '_linkName_' + i"
                  [attr.list]="datalistId"
                  (ngModelChange)="onLinkChange()"
                  required
                  placeholder="e.g. Instagram, LinkedIn, Behance"
                  class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div class="sm:col-span-7">
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Profile / Channel URL *
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="link.url" 
                  [name]="idPrefix + '_linkUrl_' + i"
                  (ngModelChange)="onLinkChange()"
                  required
                  placeholder="https://instagram.com/yourhandle or profile url"
                  class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        }

        @if (links.length === 0) {
          <div class="p-5 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400 bg-slate-50/50">
            <span class="text-xl block mb-1">🔗</span>
            <p class="font-semibold text-slate-600 mb-0.5">No social media links added yet</p>
            <p class="text-[11px] text-slate-400">Click "+ Add Another Social Link" or choose a platform preset above.</p>
          </div>
        }
      </div>

      <!-- Add Button -->
      <button 
        type="button" 
        (click)="addLink()"
        class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>+ Add Another Social Link</span>
      </button>
    </div>
  `
})
export class SocialMediaLinksComponent {
  @Input() title: string = 'Social Media & Portfolios';
  @Input() subtitle: string = 'Add multiple social media and portfolio links with their platform names.';
  @Input() badgeNumber: number | string | null = null;
  @Input() showPresets: boolean = true;
  @Input() idPrefix: string = 'sml';

  @Input() links: SocialMediaLink[] = [];
  @Output() linksChange = new EventEmitter<SocialMediaLink[]>();

  datalistId = 'socialPlatformsList_' + Math.random().toString(36).substr(2, 6);

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
    const newLink: SocialMediaLink = {
      id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: presetName,
      url: ''
    };
    this.links = [...this.links, newLink];
    this.linksChange.emit(this.links);
  }

  removeLink(index: number): void {
    const updated = [...this.links];
    updated.splice(index, 1);
    this.links = updated;
    this.linksChange.emit(this.links);
  }

  onLinkChange(): void {
    this.linksChange.emit(this.links);
  }
}
