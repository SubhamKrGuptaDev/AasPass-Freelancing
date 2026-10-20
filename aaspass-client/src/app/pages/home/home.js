import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = () => [2, 5, 10, 50];
const _c1 = a0 => ["/stores", a0];
const _forTrack0 = ($index, $item) => $item.id;
function HomeComponent_button_29_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 49);
    i0.ɵɵlistener("click", function HomeComponent_button_29_Template_button_click_0_listener() { const dist_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.storeService.setSelectedDistance(dist_r2)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const dist_r2 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-indigo-600", ctx_r2.storeService.selectedMaxDistanceKm() === dist_r2)("text-white", ctx_r2.storeService.selectedMaxDistanceKm() === dist_r2)("text-slate-700", ctx_r2.storeService.selectedMaxDistanceKm() !== dist_r2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", dist_r2 === 50 ? "All" : dist_r2 + "km", " ");
} }
function HomeComponent_button_31_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 50);
    i0.ɵɵlistener("click", function HomeComponent_button_31_Template_button_click_0_listener() { const cat_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.storeService.setSelectedCategory(cat_r5)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cat_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-indigo-600", ctx_r2.storeService.selectedCategory() === cat_r5)("text-white", ctx_r2.storeService.selectedCategory() === cat_r5)("bg-slate-100", ctx_r2.storeService.selectedCategory() !== cat_r5)("text-slate-700", ctx_r2.storeService.selectedCategory() !== cat_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", cat_r5, " ");
} }
function HomeComponent_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.storeService.selectedCategory(), " ");
} }
function HomeComponent_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 51);
    i0.ɵɵlistener("click", function HomeComponent_Conditional_48_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.storeService.resetFilters()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 52);
    i0.ɵɵelement(2, "path", 53);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Reset Filters");
    i0.ɵɵelementEnd()();
} }
function HomeComponent_Conditional_49_For_2_For_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 69);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const skill_r7 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", skill_r7, " ");
} }
function HomeComponent_Conditional_49_For_2_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 70);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const store_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" +", store_r8.skills.length - 3, " ");
} }
function HomeComponent_Conditional_49_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 54);
    i0.ɵɵelement(1, "div");
    i0.ɵɵelementStart(2, "div", 55)(3, "div", 56)(4, "span", 57);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(5, "svg", 58);
    i0.ɵɵelement(6, "path", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "span");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 59)(10, "span", 60);
    i0.ɵɵtext(11);
    i0.ɵɵelementStart(12, "span", 61);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "span", 62)(15, "span");
    i0.ɵɵtext(16, "\uD83D\uDC41\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(19, "div", 63);
    i0.ɵɵelement(20, "img", 64);
    i0.ɵɵelementStart(21, "div")(22, "h3", 65);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "p", 66);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "p", 67);
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "div", 68);
    i0.ɵɵrepeaterCreate(29, HomeComponent_Conditional_49_For_2_For_30_Template, 2, 1, "span", 69, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵconditionalCreate(31, HomeComponent_Conditional_49_For_2_Conditional_31_Template, 2, 1, "span", 70);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "div", 71)(33, "div")(34, "span", 72);
    i0.ɵɵtext(35, "Rate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "span", 73);
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "span", 74);
    i0.ɵɵtext(39, "/hr");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "a", 75);
    i0.ɵɵtext(41, " View Store & Gigs \u2192 ");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const store_r8 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("h-3 bg-gradient-to-r ", store_r8.bannerGradient));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate2("", store_r8.distanceKm, " km away \u2022 ", store_r8.area);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" \u2B50 ", store_r8.rating, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", store_r8.reviewCount, ")");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(store_r8.views?.lifetime || 0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", store_r8.avatarUrl)("alt", store_r8.ownerName);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", store_r8.storeName, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" by ", store_r8.ownerName, " \u2022 ", store_r8.experienceYears, " yrs exp ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", store_r8.tagline, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(store_r8.skills.slice(0, 3));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(store_r8.skills.length > 3 ? 31 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("\u20B9", store_r8.hourlyRate);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(17, _c1, store_r8.id));
} }
function HomeComponent_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 37);
    i0.ɵɵrepeaterCreate(1, HomeComponent_Conditional_49_For_2_Template, 42, 19, "div", 54, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.storeService.filteredStores());
} }
function HomeComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 38)(1, "div", 76);
    i0.ɵɵtext(2, " \uD83D\uDD0D ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h3", 77);
    i0.ɵɵtext(4, "No Freelance Stores Found");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 78);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 79);
    i0.ɵɵlistener("click", function HomeComponent_Conditional_50_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.storeService.resetFilters()); });
    i0.ɵɵtext(8, " Reset Filters & Expand Distance ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" We couldn't find any stores matching your current search or distance filter in ", ctx_r2.storeService.selectedCity(), ". ");
} }
export class HomeComponent {
    storeService = inject(StoreService);
    static ɵfac = function HomeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HomeComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HomeComponent, selectors: [["app-home"]], decls: 70, vars: 11, consts: [[1, "min-h-screen", "bg-slate-50/70", "pb-20"], [1, "relative", "overflow-hidden", "bg-gradient-to-b", "from-indigo-900", "via-indigo-950", "to-slate-900", "text-white", "pt-12", "pb-12", "sm:pb-16", "px-4", "sm:px-6", "lg:px-8"], [1, "absolute", "inset-0", "overflow-hidden", "pointer-events-none", "opacity-30"], [1, "absolute", "-top-40", "-left-40", "w-96", "h-96", "rounded-full", "bg-indigo-500", "blur-3xl"], [1, "absolute", "top-10", "right-0", "w-80", "h-80", "rounded-full", "bg-pink-500", "blur-3xl"], [1, "relative", "max-w-4xl", "mx-auto", "text-center"], [1, "inline-flex", "items-center", "gap-2", "px-3", "py-1.5", "rounded-full", "bg-indigo-500/20", "border", "border-indigo-400/30", "text-indigo-300", "text-xs", "font-semibold", "mb-6"], [1, "w-2", "h-2", "rounded-full", "bg-emerald-400", "animate-ping"], [1, "text-3xl", "sm:text-5xl", "font-extrabold", "tracking-tight", "text-white", "mb-4", "leading-tight"], [1, "hidden", "sm:inline"], [1, "bg-gradient-to-r", "from-pink-400", "via-purple-300", "to-indigo-300", "bg-clip-text", "text-transparent"], [1, "text-sm", "sm:text-base", "text-indigo-200/90", "max-w-2xl", "mx-auto", "mb-8"], [1, "bg-white", "rounded-2xl", "p-3", "sm:p-4", "shadow-2xl", "text-slate-900", "max-w-3xl", "mx-auto"], [1, "flex", "flex-col", "sm:flex-row", "gap-3"], [1, "relative", "flex-1"], [1, "absolute", "inset-y-0", "left-0", "pl-3.5", "flex", "items-center", "pointer-events-none", "text-slate-400"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-5", "h-5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], ["type", "text", "placeholder", "Search skill, service, or store (e.g. Reels, Web, Python)...", 1, "w-full", "pl-11", "pr-4", "py-3", "bg-slate-100/80", "rounded-xl", "text-sm", "font-medium", "placeholder-slate-400", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "ngModel"], [1, "flex", "items-center", "gap-1.5", "bg-slate-100/80", "p-1", "rounded-xl", "text-xs", "font-semibold"], [1, "text-slate-500", "px-2", "flex", "items-center", "gap-1"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3.5", "h-3.5", "text-indigo-600"], ["fill-rule", "evenodd", "d", "M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z", "clip-rule", "evenodd"], ["type", "button", "class", "px-2.5 py-1.5 rounded-lg transition", 3, "bg-indigo-600", "text-white", "text-slate-700", "click", 4, "ngFor", "ngForOf"], [1, "flex", "items-center", "gap-2", "overflow-x-auto", "pt-3", "mt-2", "border-t", "border-slate-100", "scrollbar-none"], ["type", "button", "class", "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition hover:scale-102", 3, "bg-indigo-600", "text-white", "bg-slate-100", "text-slate-700", "click", 4, "ngFor", "ngForOf"], [1, "relative", "z-10", "max-w-7xl", "mx-auto", "px-4", "sm:px-6", "lg:px-8", "mt-6", "sm:mt-8"], [1, "bg-white", "rounded-2xl", "p-4", "sm:p-5", "shadow-sm", "border", "border-slate-200", "mb-6", "flex", "flex-col", "md:flex-row", "items-start", "md:items-center", "justify-between", "gap-4"], [1, "flex", "flex-wrap", "items-center", "gap-3"], [1, "w-10", "h-10", "rounded-xl", "bg-indigo-600", "text-white", "flex", "items-center", "justify-center", "font-black", "text-base", "shadow-sm"], [1, "flex", "items-center", "gap-2", "flex-wrap"], [1, "text-base", "sm:text-lg", "font-extrabold", "text-slate-900"], [1, "inline-flex", "items-center", "gap-1", "px-2.5", "py-0.5", "rounded-full", "text-xs", "font-semibold", "bg-indigo-50", "text-indigo-700", "border", "border-indigo-100"], [1, "inline-flex", "items-center", "gap-1", "px-2.5", "py-0.5", "rounded-full", "text-xs", "font-semibold", "bg-emerald-50", "text-emerald-700", "border", "border-emerald-100"], [1, "inline-flex", "items-center", "gap-1", "px-2.5", "py-0.5", "rounded-full", "text-xs", "font-semibold", "bg-purple-50", "text-purple-700", "border", "border-purple-100"], [1, "text-xs", "text-slate-500", "font-medium", "mt-0.5"], ["type", "button", 1, "inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "rounded-xl", "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "cursor-pointer"], [1, "grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-6"], [1, "bg-white", "rounded-3xl", "p-12", "text-center", "border", "border-slate-200/80", "shadow-xs", "max-w-lg", "mx-auto", "my-8"], [1, "mt-16", "bg-gradient-to-r", "from-indigo-900", "via-purple-900", "to-indigo-950", "rounded-3xl", "p-8", "sm:p-10", "text-white", "relative", "overflow-hidden", "shadow-xl"], [1, "relative", "z-10", "max-w-2xl"], [1, "inline-block", "px-3", "py-1", "rounded-full", "bg-pink-500/20", "border", "border-pink-400/30", "text-pink-300", "text-xs", "font-bold", "uppercase", "tracking-wider", "mb-3"], [1, "text-2xl", "sm:text-3xl", "font-black", "mb-3", "leading-snug"], [1, "text-sm", "text-indigo-200/90", "mb-6"], ["routerLink", "/create-store", 1, "inline-flex", "items-center", "gap-2", "px-6", "py-3", "rounded-xl", "text-sm", "font-bold", "bg-white", "text-indigo-900", "hover:bg-indigo-50", "shadow-lg", "shadow-white/10", "hover:shadow-white/20", "transition", "transform", "active:scale-95"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M14 5l7 7m0 0l-7 7m7-7H3"], [1, "absolute", "right-0", "bottom-0", "top-0", "w-1/3", "hidden", "lg:flex", "items-center", "justify-center", "opacity-20", "pointer-events-none"], [1, "text-9xl", "font-black", "text-indigo-400"], ["type", "button", 1, "px-2.5", "py-1.5", "rounded-lg", "transition", 3, "click"], ["type", "button", 1, "px-3", "py-1.5", "rounded-full", "text-xs", "font-semibold", "whitespace-nowrap", "transition", "hover:scale-102", 3, "click"], ["type", "button", 1, "inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "rounded-xl", "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "cursor-pointer", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M6 18L18 6M6 6l12 12"], [1, "bg-white", "rounded-2xl", "border", "border-slate-200/80", "overflow-hidden", "shadow-xs", "hover:shadow-xl", "hover:border-indigo-300", "transition-all", "flex", "flex-col", "group"], [1, "p-5", "flex-1", "flex", "flex-col"], [1, "flex", "items-center", "justify-between", "gap-2", "mb-3"], [1, "inline-flex", "items-center", "gap-1", "px-2.5", "py-1", "rounded-full", "text-[11px]", "font-semibold", "bg-emerald-50", "text-emerald-700", "border", "border-emerald-200"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3", "h-3", "text-emerald-600"], [1, "flex", "items-center", "gap-2"], [1, "text-xs", "font-bold", "text-amber-500", "flex", "items-center", "gap-1"], [1, "text-slate-400", "font-normal"], ["title", "Store view count", 1, "text-[11px]", "font-semibold", "text-slate-600", "flex", "items-center", "gap-0.5", "bg-slate-50", "px-1.5", "py-0.5", "rounded-md", "border", "border-slate-100"], [1, "flex", "items-start", "gap-3", "mb-3"], [1, "w-12", "h-12", "rounded-xl", "object-cover", "ring-2", "ring-slate-100", "flex-shrink-0", 3, "src", "alt"], [1, "font-bold", "text-slate-900", "group-hover:text-indigo-600", "transition-colors", "line-clamp-1"], [1, "text-xs", "text-slate-500", "font-medium"], [1, "text-xs", "text-slate-700", "font-medium", "line-clamp-2", "mb-4", "flex-1"], [1, "flex", "flex-wrap", "gap-1.5", "mb-4"], [1, "px-2", "py-0.5", "rounded-md", "bg-slate-100", "text-slate-600", "text-[11px]", "font-medium"], [1, "px-1.5", "py-0.5", "rounded-md", "bg-slate-50", "text-slate-400", "text-[10px]", "font-medium"], [1, "pt-4", "border-t", "border-slate-100", "flex", "items-center", "justify-between", "mt-auto"], [1, "text-[10px]", "uppercase", "font-semibold", "text-slate-400", "block"], [1, "text-base", "font-extrabold", "text-indigo-700"], [1, "text-xs", "text-slate-500"], [1, "px-4", "py-2", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-slate-900", "hover:bg-indigo-600", "shadow-xs", "transition", "group-hover:bg-indigo-600", 3, "routerLink"], [1, "w-16", "h-16", "rounded-2xl", "bg-indigo-50", "text-indigo-600", "flex", "items-center", "justify-center", "mx-auto", "mb-4", "text-2xl", "font-bold"], [1, "text-lg", "font-bold", "text-slate-900", "mb-2"], [1, "text-xs", "text-slate-500", "mb-6"], ["type", "button", 1, "px-4", "py-2", "rounded-xl", "text-xs", "font-bold", "text-indigo-600", "bg-indigo-50", "hover:bg-indigo-100", "transition", 3, "click"]], template: function HomeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "section", 1)(2, "div", 2);
            i0.ɵɵelement(3, "div", 3)(4, "div", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "div", 5)(6, "div", 6);
            i0.ɵɵelement(7, "span", 7);
            i0.ɵɵelementStart(8, "span");
            i0.ɵɵtext(9, "Hyperlocal Gig Economy \u2022 Within 2 to 10 km");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "h1", 8);
            i0.ɵɵtext(11, " Find & Hire Skilled Freelancers ");
            i0.ɵɵelement(12, "br", 9);
            i0.ɵɵelementStart(13, "span", 10);
            i0.ɵɵtext(14, " Right In Your Neighborhood ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(15, "p", 11);
            i0.ɵɵtext(16, " Connect with local reel editors, developers, tutors, photographers, and tech experts. Meet at a nearby cafe, collaborate in person, or get urgent local work done fast. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "div", 12)(18, "div", 13)(19, "div", 14)(20, "div", 15);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(21, "svg", 16);
            i0.ɵɵelement(22, "path", 17);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(23, "input", 18);
            i0.ɵɵcontrolCreate();
            i0.ɵɵlistener("ngModelChange", function HomeComponent_Template_input_ngModelChange_23_listener($event) { return ctx.storeService.setSearchQuery($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(24, "div", 19)(25, "span", 20);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(26, "svg", 21);
            i0.ɵɵelement(27, "path", 22);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(28, " Radius: ");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(29, HomeComponent_button_29_Template, 2, 7, "button", 23);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(30, "div", 24);
            i0.ɵɵtemplate(31, HomeComponent_button_31_Template, 2, 9, "button", 25);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(32, "section", 26)(33, "div", 27)(34, "div", 28)(35, "div", 29);
            i0.ɵɵtext(36);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "div")(38, "div", 30)(39, "h2", 31);
            i0.ɵɵtext(40, " Local Stores & Freelancers ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "span", 32);
            i0.ɵɵtext(42);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "span", 33);
            i0.ɵɵtext(44);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(45, HomeComponent_Conditional_45_Template, 2, 1, "span", 34);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(46, "p", 35);
            i0.ɵɵtext(47);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(48, HomeComponent_Conditional_48_Template, 5, 0, "button", 36);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(49, HomeComponent_Conditional_49_Template, 3, 0, "div", 37)(50, HomeComponent_Conditional_50_Template, 9, 1, "div", 38);
            i0.ɵɵelementStart(51, "div", 39)(52, "div", 40)(53, "span", 41);
            i0.ɵɵtext(54, " Passive & Side Income For Newcomers ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(55, "h2", 42);
            i0.ɵɵtext(56, " New in town or want extra income from your skills? ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(57, "p", 43);
            i0.ɵɵtext(58, " You don\u2019t need an expensive office or years of reviews on global sites. List your skills (video editing, tutoring, web development, photography) on ");
            i0.ɵɵelementStart(59, "strong");
            i0.ɵɵtext(60, "AasPass");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(61, " and get clients within walking distance. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(62, "a", 44)(63, "span");
            i0.ɵɵtext(64, "Open Your Neighborhood Store");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(65, "svg", 45);
            i0.ɵɵelement(66, "path", 46);
            i0.ɵɵelementEnd()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(67, "div", 47)(68, "div", 48);
            i0.ɵɵtext(69, "AP");
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(23);
            i0.ɵɵproperty("ngModel", ctx.storeService.searchQuery());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("ngForOf", i0.ɵɵpureFunction0(10, _c0));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngForOf", ctx.storeService.categories);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", ctx.storeService.filteredStores().length, " ");
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" \uD83D\uDCCD ", ctx.storeService.selectedCity(), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" Within ", ctx.storeService.selectedMaxDistanceKm() === 50 ? "all city" : ctx.storeService.selectedMaxDistanceKm() + " km", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.storeService.selectedCategory() !== "All" ? 45 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" Found ", ctx.storeService.filteredStores().length, " verified nearby professionals ready for neighborhood gigs ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.storeService.searchQuery() || ctx.storeService.selectedCategory() !== "All" || ctx.storeService.selectedMaxDistanceKm() !== 10 ? 48 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.storeService.filteredStores().length > 0 ? 49 : 50);
        } }, dependencies: [CommonModule, i1.NgForOf, FormsModule, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgModel, RouterLink], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HomeComponent, [{
        type: Component,
        args: [{
                selector: 'app-home',
                standalone: true,
                imports: [CommonModule, FormsModule, RouterLink],
                template: `
    <div class="min-h-screen bg-slate-50/70 pb-20">
      
      <!-- Hero Section -->
      <section class="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <!-- Background Ambient Glow -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500 blur-3xl"></div>
          <div class="absolute top-10 right-0 w-80 h-80 rounded-full bg-pink-500 blur-3xl"></div>
        </div>

        <div class="relative max-w-4xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-6">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Hyperlocal Gig Economy • Within 2 to 10 km</span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Find & Hire Skilled Freelancers <br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Right In Your Neighborhood
            </span>
          </h1>

          <p class="text-sm sm:text-base text-indigo-200/90 max-w-2xl mx-auto mb-8">
            Connect with local reel editors, developers, tutors, photographers, and tech experts. 
            Meet at a nearby cafe, collaborate in person, or get urgent local work done fast.
          </p>

          <!-- Search Box & Proximity Controls -->
          <div class="bg-white rounded-2xl p-3 sm:p-4 shadow-2xl text-slate-900 max-w-3xl mx-auto">
            <div class="flex flex-col sm:flex-row gap-3">
              
              <!-- Search Input -->
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  [ngModel]="storeService.searchQuery()"
                  (ngModelChange)="storeService.setSearchQuery($event)"
                  placeholder="Search skill, service, or store (e.g. Reels, Web, Python)..." 
                  class="w-full pl-11 pr-4 py-3 bg-slate-100/80 rounded-xl text-sm font-medium placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <!-- Distance Radius Dropdown / Buttons -->
              <div class="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
                <span class="text-slate-500 px-2 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  Radius:
                </span>
                <button 
                  *ngFor="let dist of [2, 5, 10, 50]"
                  type="button"
                  (click)="storeService.setSelectedDistance(dist)"
                  [class.bg-indigo-600]="storeService.selectedMaxDistanceKm() === dist"
                  [class.text-white]="storeService.selectedMaxDistanceKm() === dist"
                  [class.text-slate-700]="storeService.selectedMaxDistanceKm() !== dist"
                  class="px-2.5 py-1.5 rounded-lg transition"
                >
                  {{ dist === 50 ? 'All' : dist + 'km' }}
                </button>
              </div>

            </div>

            <!-- Category Pills -->
            <div class="flex items-center gap-2 overflow-x-auto pt-3 mt-2 border-t border-slate-100 scrollbar-none">
              <button 
                *ngFor="let cat of storeService.categories"
                type="button"
                (click)="storeService.setSelectedCategory(cat)"
                [class.bg-indigo-600]="storeService.selectedCategory() === cat"
                [class.text-white]="storeService.selectedCategory() === cat"
                [class.bg-slate-100]="storeService.selectedCategory() !== cat"
                [class.text-slate-700]="storeService.selectedCategory() !== cat"
                class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition hover:scale-102"
              >
                {{ cat }}
              </button>
            </div>

          </div>

        </div>
      </section>

      <!-- Main Results & Directory Section -->
      <section class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        
        <!-- Results Header Bar -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              {{ storeService.filteredStores().length }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base sm:text-lg font-extrabold text-slate-900">
                  Local Stores & Freelancers
                </h2>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  📍 {{ storeService.selectedCity() }}
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Within {{ storeService.selectedMaxDistanceKm() === 50 ? 'all city' : storeService.selectedMaxDistanceKm() + ' km' }}
                </span>
                @if (storeService.selectedCategory() !== 'All') {
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                    {{ storeService.selectedCategory() }}
                  </span>
                }
              </div>
              <p class="text-xs text-slate-500 font-medium mt-0.5">
                Found {{ storeService.filteredStores().length }} verified nearby professionals ready for neighborhood gigs
              </p>
            </div>
          </div>

          <!-- Active filters pill / Reset -->
          @if (storeService.searchQuery() || storeService.selectedCategory() !== 'All' || storeService.selectedMaxDistanceKm() !== 10) {
            <button 
              type="button"
              (click)="storeService.resetFilters()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>Reset Filters</span>
            </button>
          }
        </div>

        <!-- Stores Card Grid -->
        @if (storeService.filteredStores().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (store of storeService.filteredStores(); track store.id) {
              <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col group">
                
                <!-- Card Header with Gradient Accent -->
                <div class="h-3 bg-gradient-to-r {{ store.bannerGradient }}"></div>
                
                <div class="p-5 flex-1 flex flex-col">
                  
                  <!-- Top Row: Distance & Availability Badge -->
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                      </svg>
                      <span>{{ store.distanceKm }} km away • {{ store.area }}</span>
                    </span>

                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-amber-500 flex items-center gap-1">
                        ⭐ {{ store.rating }} <span class="text-slate-400 font-normal">({{ store.reviewCount }})</span>
                      </span>
                      <span class="text-[11px] font-semibold text-slate-600 flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100" title="Store view count">
                        <span>👁️</span>
                        <span>{{ store.views?.lifetime || 0 }}</span>
                      </span>
                    </div>
                  </div>

                  <!-- Store & Owner Details -->
                  <div class="flex items-start gap-3 mb-3">
                    <img 
                      [src]="store.avatarUrl" 
                      [alt]="store.ownerName" 
                      class="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 flex-shrink-0"
                    />
                    <div>
                      <h3 class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {{ store.storeName }}
                      </h3>
                      <p class="text-xs text-slate-500 font-medium">
                        by {{ store.ownerName }} • {{ store.experienceYears }} yrs exp
                      </p>
                    </div>
                  </div>

                  <!-- Tagline / Headline -->
                  <p class="text-xs text-slate-700 font-medium line-clamp-2 mb-4 flex-1">
                    {{ store.tagline }}
                  </p>

                  <!-- Skills Chips -->
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    @for (skill of store.skills.slice(0, 3); track skill) {
                      <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {{ skill }}
                      </span>
                    }
                    @if (store.skills.length > 3) {
                      <span class="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[10px] font-medium">
                        +{{ store.skills.length - 3 }}
                      </span>
                    }
                  </div>

                  <!-- Pricing & CTA Row -->
                  <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span class="text-[10px] uppercase font-semibold text-slate-400 block">Rate</span>
                      <span class="text-base font-extrabold text-indigo-700">₹{{ store.hourlyRate }}</span>
                      <span class="text-xs text-slate-500">/hr</span>
                    </div>

                    <a 
                      [routerLink]="['/stores', store.id]"
                      class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 shadow-xs transition group-hover:bg-indigo-600"
                    >
                      View Store & Gigs →
                    </a>
                  </div>

                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8">
            <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🔍
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">No Freelance Stores Found</h3>
            <p class="text-xs text-slate-500 mb-6">
              We couldn't find any stores matching your current search or distance filter in {{ storeService.selectedCity() }}.
            </p>
            <button 
              type="button" 
              (click)="storeService.resetFilters()"
              class="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
            >
              Reset Filters & Expand Distance
            </button>
          </div>
        }

        <!-- Passive Income / New in City Call to Action Banner -->
        <div class="mt-16 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div class="relative z-10 max-w-2xl">
            <span class="inline-block px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-3">
              Passive & Side Income For Newcomers
            </span>
            <h2 class="text-2xl sm:text-3xl font-black mb-3 leading-snug">
              New in town or want extra income from your skills?
            </h2>
            <p class="text-sm text-indigo-200/90 mb-6">
              You don’t need an expensive office or years of reviews on global sites. 
              List your skills (video editing, tutoring, web development, photography) on <strong>AasPass</strong> and get clients within walking distance.
            </p>
            <a 
              routerLink="/create-store" 
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg shadow-white/10 hover:shadow-white/20 transition transform active:scale-95"
            >
              <span>Open Your Neighborhood Store</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>

          <!-- Decorative Graphic -->
          <div class="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center opacity-20 pointer-events-none">
            <div class="text-9xl font-black text-indigo-400">AP</div>
          </div>
        </div>

      </section>

    </div>
  `
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HomeComponent, { className: "HomeComponent", filePath: "src/app/pages/home/home.ts", lineNumber: 294 }); })();
