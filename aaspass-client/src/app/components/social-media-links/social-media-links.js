import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatSocialUrl, displaySocialUrl, getSocialIcon, getSocialBadgeClass } from '../../models/store.model';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id || $index;
const _forTrack1 = ($index, $item) => $item.name;
function SocialMediaLinksComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.badgeNumber, " ");
} }
function SocialMediaLinksComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.subtitle, " ");
} }
function SocialMediaLinksComponent_Conditional_9_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 27);
    i0.ɵɵlistener("click", function SocialMediaLinksComponent_Conditional_9_For_5_Template_button_click_0_listener() { const p_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.addLink(p_r3.name)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r3 = ctx.$implicit;
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ", p_r3.btnClass));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" + ", p_r3.icon, " ", p_r3.name, " ");
} }
function SocialMediaLinksComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "span", 24);
    i0.ɵɵtext(2, " Quick Add Platform: ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 25);
    i0.ɵɵrepeaterCreate(4, SocialMediaLinksComponent_Conditional_9_For_5_Template, 2, 5, "button", 26, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r0.platformPresets);
} }
function SocialMediaLinksComponent_For_26_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 31)(1, "span");
    i0.ɵɵtext(2, "Direct Redirect \u2197");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const link_r5 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("href", ctx_r0.formatUrl(link_r5.url), i0.ɵɵsanitizeUrl);
} }
function SocialMediaLinksComponent_For_26_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 21)(1, "div", 28)(2, "span", 29)(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 30);
    i0.ɵɵconditionalCreate(8, SocialMediaLinksComponent_For_26_Conditional_8_Template, 3, 1, "a", 31);
    i0.ɵɵelementStart(9, "button", 32);
    i0.ɵɵlistener("click", function SocialMediaLinksComponent_For_26_Template_button_click_9_listener() { const ɵ$index_63_r6 = i0.ɵɵrestoreView(_r4).$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.removeLink(ɵ$index_63_r6)); });
    i0.ɵɵtext(10, " \u2715 Remove ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(11, "div", 33)(12, "div", 34)(13, "label", 35);
    i0.ɵɵtext(14, " Platform Name * ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "input", 36);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function SocialMediaLinksComponent_For_26_Template_input_ngModelChange_15_listener($event) { const link_r5 = i0.ɵɵrestoreView(_r4).$implicit; i0.ɵɵtwoWayBindingSet(link_r5.name, $event) || (link_r5.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function SocialMediaLinksComponent_For_26_Template_input_ngModelChange_15_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.onLinkChange()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 37)(17, "label", 35);
    i0.ɵɵtext(18, " Profile / Channel URL * ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "input", 38);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function SocialMediaLinksComponent_For_26_Template_input_ngModelChange_19_listener($event) { const link_r5 = i0.ɵɵrestoreView(_r4).$implicit; i0.ɵɵtwoWayBindingSet(link_r5.url, $event) || (link_r5.url = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function SocialMediaLinksComponent_For_26_Template_input_ngModelChange_19_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.onLinkChange()); });
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const link_r5 = ctx.$implicit;
    const ɵ$index_63_r6 = ctx.$index;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.getSocialIcon(link_r5.name));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(link_r5.name || "Platform #" + (ɵ$index_63_r6 + 1));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(link_r5.url ? 8 : -1);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", link_r5.name);
    i0.ɵɵproperty("name", ctx_r0.idPrefix + "_linkName_" + ɵ$index_63_r6);
    i0.ɵɵattribute("list", ctx_r0.datalistId);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", link_r5.url);
    i0.ɵɵproperty("name", ctx_r0.idPrefix + "_linkUrl_" + ɵ$index_63_r6);
    i0.ɵɵcontrol();
} }
function SocialMediaLinksComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22)(1, "span", 39);
    i0.ɵɵtext(2, "\uD83D\uDD17");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 40);
    i0.ɵɵtext(4, "No social media links added yet");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 41);
    i0.ɵɵtext(6, "Click \"+ Add Another Social Link\" or choose a platform preset above.");
    i0.ɵɵelementEnd()();
} }
export class SocialMediaLinksComponent {
    title = 'Social Media & Portfolios';
    subtitle = 'Add multiple social media and portfolio links with their platform names.';
    badgeNumber = null;
    showPresets = true;
    idPrefix = 'sml';
    links = [];
    linksChange = new EventEmitter();
    datalistId = 'socialPlatformsList_' + Math.random().toString(36).substr(2, 6);
    formatUrl = formatSocialUrl;
    displayUrl = displaySocialUrl;
    getSocialIcon = getSocialIcon;
    getSocialBadgeClass = getSocialBadgeClass;
    platformPresets = [
        { name: 'Instagram', icon: '📸', btnClass: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200' },
        { name: 'LinkedIn', icon: '💼', btnClass: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200' },
        { name: 'GitHub', icon: '💻', btnClass: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300' },
        { name: 'YouTube', icon: '🎥', btnClass: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' },
        { name: 'Portfolio', icon: '🌐', btnClass: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
        { name: 'Twitter / X', icon: '𝕏', btnClass: 'bg-slate-800 text-white hover:bg-black border-slate-800' },
        { name: 'Behance', icon: '🎨', btnClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
        { name: 'Dribbble', icon: '🏀', btnClass: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' }
    ];
    addLink(presetName = '') {
        const newLink = {
            id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: presetName,
            url: ''
        };
        this.links = [...this.links, newLink];
        this.linksChange.emit(this.links);
    }
    removeLink(index) {
        const updated = [...this.links];
        updated.splice(index, 1);
        this.links = updated;
        this.linksChange.emit(this.links);
    }
    onLinkChange() {
        this.linksChange.emit(this.links);
    }
    static ɵfac = function SocialMediaLinksComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SocialMediaLinksComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SocialMediaLinksComponent, selectors: [["app-social-media-links"]], inputs: { title: "title", subtitle: "subtitle", badgeNumber: "badgeNumber", showPresets: "showPresets", idPrefix: "idPrefix", links: "links" }, outputs: { linksChange: "linksChange" }, decls: 31, vars: 8, consts: [[1, "space-y-4"], [1, "flex", "items-center", "justify-between", "pb-2", "border-b", "border-slate-100"], [1, "text-sm", "font-bold", "text-slate-900", "flex", "items-center", "gap-2"], [1, "w-6", "h-6", "rounded-full", "bg-indigo-600", "text-white", "text-xs", "flex", "items-center", "justify-center", "font-bold"], [1, "text-[11px]", "font-semibold", "text-indigo-600", "bg-indigo-50", "px-2", "py-0.5", "rounded-full", "border", "border-indigo-100"], [1, "text-xs", "text-slate-500", "leading-relaxed"], [3, "id"], ["value", "Instagram"], ["value", "LinkedIn"], ["value", "GitHub"], ["value", "YouTube"], ["value", "Portfolio Website"], ["value", "Twitter / X"], ["value", "Behance"], ["value", "Dribbble"], ["value", "Facebook"], ["value", "Discord"], ["value", "Medium / Blog"], ["value", "Spotify / Podcast"], ["value", "Telegram"], [1, "space-y-3"], [1, "p-3.5", "bg-slate-50", "border", "border-slate-200/80", "rounded-2xl", "space-y-2.5", "transition", "hover:border-indigo-200"], [1, "p-5", "rounded-2xl", "border", "border-dashed", "border-slate-300", "text-center", "text-xs", "text-slate-400", "bg-slate-50/50"], ["type", "button", 1, "w-full", "py-2.5", "px-4", "rounded-xl", "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "flex", "items-center", "justify-center", "gap-1.5", "cursor-pointer", 3, "click"], [1, "text-[10px]", "font-bold", "text-slate-400", "uppercase", "tracking-wider", "block", "mb-2"], [1, "flex", "flex-wrap", "gap-1.5"], ["type", "button", 3, "class"], ["type", "button", 3, "click"], [1, "flex", "items-center", "justify-between"], [1, "text-xs", "font-bold", "text-slate-800", "flex", "items-center", "gap-1.5"], [1, "flex", "items-center", "gap-2"], ["target", "_blank", "rel", "noopener noreferrer", "title", "Test direct redirect in new tab", 1, "text-[11px]", "font-bold", "text-indigo-600", "hover:text-indigo-800", "hover:underline", "flex", "items-center", "gap-1", 3, "href"], ["type", "button", "title", "Remove this link", 1, "text-xs", "font-semibold", "text-rose-500", "hover:text-rose-700", "p-1", "rounded-md", "hover:bg-rose-50", "transition", "cursor-pointer", 3, "click"], [1, "grid", "grid-cols-1", "sm:grid-cols-12", "gap-3"], [1, "sm:col-span-5"], [1, "block", "text-[10px]", "font-bold", "uppercase", "tracking-wider", "text-slate-500", "mb-1"], ["type", "text", "required", "", "placeholder", "e.g. Instagram, LinkedIn, Behance", 1, "w-full", "px-3.5", "py-2", "bg-white", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel", "name"], [1, "sm:col-span-7"], ["type", "text", "required", "", "placeholder", "https://instagram.com/yourhandle or profile url", 1, "w-full", "px-3.5", "py-2", "bg-white", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel", "name"], [1, "text-xl", "block", "mb-1"], [1, "font-semibold", "text-slate-600", "mb-0.5"], [1, "text-[11px]", "text-slate-400"]], template: function SocialMediaLinksComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "h3", 2);
            i0.ɵɵconditionalCreate(3, SocialMediaLinksComponent_Conditional_3_Template, 2, 1, "span", 3);
            i0.ɵɵelementStart(4, "span");
            i0.ɵɵtext(5);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(6, "span", 4);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(8, SocialMediaLinksComponent_Conditional_8_Template, 2, 1, "p", 5);
            i0.ɵɵconditionalCreate(9, SocialMediaLinksComponent_Conditional_9_Template, 6, 0, "div");
            i0.ɵɵelementStart(10, "datalist", 6);
            i0.ɵɵelement(11, "option", 7)(12, "option", 8)(13, "option", 9)(14, "option", 10)(15, "option", 11)(16, "option", 12)(17, "option", 13)(18, "option", 14)(19, "option", 15)(20, "option", 16)(21, "option", 17)(22, "option", 18)(23, "option", 19);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "div", 20);
            i0.ɵɵrepeaterCreate(25, SocialMediaLinksComponent_For_26_Template, 20, 8, "div", 21, _forTrack0);
            i0.ɵɵconditionalCreate(27, SocialMediaLinksComponent_Conditional_27_Template, 7, 0, "div", 22);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "button", 23);
            i0.ɵɵlistener("click", function SocialMediaLinksComponent_Template_button_click_28_listener() { return ctx.addLink(); });
            i0.ɵɵelementStart(29, "span");
            i0.ɵɵtext(30, "+ Add Another Social Link");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.badgeNumber !== null && ctx.badgeNumber !== undefined ? 3 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.title);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate2(" ", ctx.links.length, " ", ctx.links.length === 1 ? "link added" : "links added", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.subtitle ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showPresets ? 9 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.datalistId);
            i0.ɵɵadvance(15);
            i0.ɵɵrepeater(ctx.links);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.links.length === 0 ? 27 : -1);
        } }, dependencies: [CommonModule, FormsModule, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.NgModel], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SocialMediaLinksComponent, [{
        type: Component,
        args: [{
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
            }]
    }], null, { title: [{
            type: Input
        }], subtitle: [{
            type: Input
        }], badgeNumber: [{
            type: Input
        }], showPresets: [{
            type: Input
        }], idPrefix: [{
            type: Input
        }], links: [{
            type: Input
        }], linksChange: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SocialMediaLinksComponent, { className: "SocialMediaLinksComponent", filePath: "src/app/components/social-media-links/social-media-links.ts", lineNumber: 164 }); })();
