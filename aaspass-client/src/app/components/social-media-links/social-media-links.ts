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
  templateUrl: './social-media-links.html',
  styleUrl: './social-media-links.css'
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
