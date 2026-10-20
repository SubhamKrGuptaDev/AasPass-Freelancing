import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = () => ({ exact: true });
const _c1 = a0 => ["/stores", a0];
const _forTrack0 = ($index, $item) => $item.id;
function NavbarComponent_option_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const city_r1 = ctx.$implicit;
    i0.ɵɵproperty("value", city_r1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(city_r1);
} }
function NavbarComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 17);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_21_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.authService.openLoginModal("/create-store")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 18);
    i0.ɵɵelement(2, "path", 19);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "List Services");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 20);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_21_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.authService.openLoginModal()); });
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7, "Log In");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "button", 21);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_21_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.authService.openSignupModal()); });
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10, "Sign Up");
    i0.ɵɵelementEnd()();
} }
function NavbarComponent_Conditional_22_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 22);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 18);
    i0.ɵɵelement(2, "path", 19);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "List Services / Open Store");
    i0.ɵɵelementEnd()();
} }
function NavbarComponent_Conditional_22_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 23);
    i0.ɵɵelement(1, "span", 32);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "My Store");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(1, _c1, ctx_r2.activeStoreId()));
} }
function NavbarComponent_Conditional_22_Conditional_2_Conditional_10_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 47);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_2_Conditional_10_For_8_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r2 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r2.closeDropdown()); });
    i0.ɵɵelementStart(1, "div", 48)(2, "div", 49);
    i0.ɵɵelement(3, "span", 50);
    i0.ɵɵelementStart(4, "span", 51);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "span", 52);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "span", 53);
    i0.ɵɵtext(9, "\u2192");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const st_r8 = ctx.$implicit;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(8, _c1, st_r8.id));
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("bg-emerald-500", st_r8.isAvailable)("bg-rose-400", !st_r8.isAvailable);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", st_r8.storeName, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", st_r8.category, " \u2022 \u20B9", st_r8.hourlyRate, "/hr ");
} }
function NavbarComponent_Conditional_22_Conditional_2_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 38);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_2_Conditional_10_Template_div_click_0_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(1, "div", 39)(2, "span", 40);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 41);
    i0.ɵɵtext(5, "Click to view storefront:");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 42);
    i0.ɵɵrepeaterCreate(7, NavbarComponent_Conditional_22_Conditional_2_Conditional_10_For_8_Template, 10, 10, "a", 43, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 44)(10, "a", 45);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_2_Conditional_10_Template_a_click_10_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.closeDropdown()); });
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12, "\u2699\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span");
    i0.ɵɵtext(14, "Manage Stores in Profile");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "a", 46);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_2_Conditional_10_Template_a_click_15_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.closeDropdown()); });
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17, "\u2795");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span");
    i0.ɵɵtext(19, "Open Another Store");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" Your Skill Stores (", ctx_r2.storeService.userStores().length, ") ");
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r2.storeService.userStores());
} }
function NavbarComponent_Conditional_22_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "a", 33);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_2_Template_a_click_1_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeDropdown()); });
    i0.ɵɵelement(2, "span", 32);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "My Store");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 34);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_2_Template_button_click_5_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.toggleDropdown($event)); });
    i0.ɵɵelementStart(6, "span", 35);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(8, "svg", 36);
    i0.ɵɵelement(9, "path", 30);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, NavbarComponent_Conditional_22_Conditional_2_Conditional_10_Template, 20, 1, "div", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", i0.ɵɵinterpolate1("View your store (", ctx_r2.activeStoreName(), ")"))("routerLink", i0.ɵɵpureFunction1(10, _c1, ctx_r2.activeStoreId()));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵinterpolate1("Switch between your ", ctx_r2.storeService.userStores().length, " stores"));
    i0.ɵɵattribute("aria-expanded", ctx_r2.isDropdownOpen());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.storeService.userStores().length, " ");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("rotate-180", ctx_r2.isDropdownOpen());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.isDropdownOpen() ? 10 : -1);
} }
function NavbarComponent_Conditional_22_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 28);
    i0.ɵɵtext(1, "PRO");
    i0.ɵɵelementEnd();
} }
function NavbarComponent_Conditional_22_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 54);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_11_Template_div_click_0_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(1, "div", 55)(2, "span", 56);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 57);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 58);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 59)(9, "a", 60);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_11_Template_a_click_9_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeDropdowns()); });
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11, "\uD83D\uDC64");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "span");
    i0.ɵɵtext(13, "My Profile & KYC");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "a", 61);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_11_Template_a_click_14_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.closeDropdowns()); });
    i0.ɵɵelementStart(15, "span");
    i0.ɵɵtext(16, "\u2795");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18, "Open Skill Store");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(19, "div", 62)(20, "button", 63);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Conditional_11_Template_button_click_20_listener() { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.logout()); });
    i0.ɵɵelementStart(21, "span");
    i0.ɵɵtext(22, "\uD83D\uDEAA");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "span");
    i0.ɵɵtext(24, "Sign Out");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.storeService.currentUser().name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.storeService.currentUser().email, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" \uD83D\uDCCD ", ctx_r2.storeService.currentUser().area, ", ", ctx_r2.storeService.currentUser().city, " ");
} }
function NavbarComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, NavbarComponent_Conditional_22_Conditional_0_Template, 5, 0, "a", 22)(1, NavbarComponent_Conditional_22_Conditional_1_Template, 4, 3, "a", 23)(2, NavbarComponent_Conditional_22_Conditional_2_Template, 11, 12, "div", 24);
    i0.ɵɵelementStart(3, "div", 24)(4, "button", 25);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_22_Template_button_click_4_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleProfileMenu($event)); });
    i0.ɵɵelement(5, "img", 26);
    i0.ɵɵelementStart(6, "span", 27);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, NavbarComponent_Conditional_22_Conditional_8_Template, 2, 0, "span", 28);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(9, "svg", 29);
    i0.ɵɵelement(10, "path", 30);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, NavbarComponent_Conditional_22_Conditional_11_Template, 25, 4, "div", 31);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵconditional(!ctx_r2.storeService.currentUser().hasStore || ctx_r2.storeService.userStores().length === 0 ? 0 : ctx_r2.storeService.userStores().length === 1 ? 1 : 2);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("src", ctx_r2.storeService.currentUser().avatarUrl);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.storeService.currentUser().name.split(" ")[0], " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.storeService.currentUser().hasStore ? 8 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.isProfileMenuOpen() ? 11 : -1);
} }
export class NavbarComponent {
    storeService = inject(StoreService);
    authService = inject(AuthService);
    isDropdownOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isDropdownOpen" }] : /* istanbul ignore next */ []));
    isProfileMenuOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isProfileMenuOpen" }] : /* istanbul ignore next */ []));
    activeStoreId = computed(() => {
        const user = this.storeService.currentUser();
        const stores = this.storeService.userStores();
        return user.store?.id || (stores.length > 0 ? stores[0].id : 'store-user-001');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeStoreId" }] : /* istanbul ignore next */ []));
    activeStoreName = computed(() => {
        const activeId = this.activeStoreId();
        const store = this.storeService.userStores().find(s => s.id === activeId);
        return store ? store.storeName : 'My Store';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeStoreName" }] : /* istanbul ignore next */ []));
    toggleDropdown(event) {
        if (event) {
            event.stopPropagation();
        }
        this.isProfileMenuOpen.set(false);
        this.isDropdownOpen.update(v => !v);
    }
    toggleProfileMenu(event) {
        if (event) {
            event.stopPropagation();
        }
        this.isDropdownOpen.set(false);
        this.isProfileMenuOpen.update(v => !v);
    }
    closeDropdown() {
        this.isDropdownOpen.set(false);
    }
    closeDropdowns() {
        this.isDropdownOpen.set(false);
        this.isProfileMenuOpen.set(false);
    }
    logout() {
        this.closeDropdowns();
        this.authService.logout();
    }
    onDocumentClick() {
        this.closeDropdowns();
    }
    static ɵfac = function NavbarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NavbarComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NavbarComponent, selectors: [["app-navbar"]], hostBindings: function NavbarComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function NavbarComponent_click_HostBindingHandler() { return ctx.onDocumentClick(); }, i0.ɵɵresolveDocument);
        } }, decls: 23, vars: 5, consts: [[1, "sticky", "top-0", "z-50", "bg-white/95", "backdrop-blur-md", "border-b", "border-slate-200/80", "transition-all", "shadow-xs"], [1, "max-w-7xl", "mx-auto", "px-4", "sm:px-6", "lg:px-8"], [1, "flex", "items-center", "justify-between", "h-16", "gap-4"], [1, "flex", "items-center", "gap-6"], ["routerLink", "/", 1, "flex", "items-center", "gap-2", "group"], [1, "w-10", "h-10", "rounded-xl", "bg-gradient-to-tr", "from-indigo-600", "via-violet-600", "to-pink-500", "flex", "items-center", "justify-center", "text-white", "font-black", "text-xl", "shadow-md", "group-hover:scale-105", "transition-transform"], [1, "flex", "flex-col"], [1, "text-xl", "font-bold", "tracking-tight", "text-slate-900", "group-hover:text-indigo-600", "transition-colors"], [1, "text-[10px]", "uppercase", "tracking-wider", "font-semibold", "text-indigo-600", "-mt-1"], [1, "hidden", "md:flex", "items-center", "gap-1.5", "px-3", "py-1.5", "rounded-full", "bg-slate-100", "hover:bg-slate-200/80", "text-slate-700", "text-xs", "font-medium", "cursor-pointer", "transition"], ["fill", "currentColor", "viewBox", "0 0 20 20", 1, "w-3.5", "h-3.5", "text-rose-500"], ["fill-rule", "evenodd", "d", "M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z", "clip-rule", "evenodd"], [1, "bg-transparent", "border-none", "text-xs", "font-semibold", "text-slate-800", "focus:outline-hidden", "cursor-pointer", 3, "ngModelChange", "ngModel"], [3, "value", 4, "ngFor", "ngForOf"], [1, "flex", "items-center", "gap-3"], ["routerLink", "/", "routerLinkActive", "text-indigo-600 font-semibold", 1, "hidden", "sm:inline-flex", "items-center", "gap-1.5", "text-sm", "font-medium", "text-slate-600", "hover:text-slate-900", "px-3", "py-1.5", "rounded-lg", "transition", 3, "routerLinkActiveOptions"], [3, "value"], ["type", "button", 1, "hidden", "sm:inline-flex", "items-center", "gap-2", "px-3.5", "py-2", "rounded-xl", "text-xs", "sm:text-sm", "font-semibold", "text-white", "bg-gradient-to-r", "from-indigo-600", "via-indigo-700", "to-purple-600", "hover:from-indigo-700", "hover:to-purple-700", "shadow-md", "shadow-indigo-500/20", "hover:shadow-lg", "transition-all", "transform", "active:scale-95", "cursor-pointer", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 6v6m0 0v6m0-6h6m-6 0H6"], ["type", "button", 1, "inline-flex", "items-center", "gap-1.5", "px-3.5", "py-1.5", "rounded-xl", "text-xs", "sm:text-sm", "font-semibold", "text-slate-700", "hover:text-indigo-600", "hover:bg-slate-100", "border", "border-slate-200", "transition", "cursor-pointer", 3, "click"], ["type", "button", 1, "inline-flex", "items-center", "gap-1.5", "px-3.5", "py-1.5", "rounded-xl", "text-xs", "sm:text-sm", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-sm", "transition", "transform", "active:scale-95", "cursor-pointer", 3, "click"], ["routerLink", "/create-store", 1, "inline-flex", "items-center", "gap-2", "px-4", "py-2", "rounded-xl", "text-xs", "sm:text-sm", "font-semibold", "text-white", "bg-gradient-to-r", "from-indigo-600", "via-indigo-700", "to-purple-600", "hover:from-indigo-700", "hover:to-purple-700", "shadow-md", "shadow-indigo-500/20", "hover:shadow-lg", "hover:shadow-indigo-500/30", "transition-all", "transform", "active:scale-95"], ["title", "View your store", 1, "inline-flex", "items-center", "gap-2", "px-3.5", "py-1.5", "rounded-xl", "text-xs", "sm:text-sm", "font-semibold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "shadow-2xs", 3, "routerLink"], [1, "relative", "inline-flex", "items-center"], ["type", "button", "title", "Account Menu", 1, "flex", "items-center", "gap-2", "p-1", "pl-2", "pr-3", "rounded-full", "border", "border-slate-200", "hover:border-indigo-300", "hover:shadow-xs", "transition", "bg-slate-50/50", "cursor-pointer", 3, "click"], ["alt", "Avatar", 1, "w-7", "h-7", "rounded-full", "object-cover", "ring-2", "ring-indigo-500/30", 3, "src"], [1, "text-xs", "font-semibold", "text-slate-700", "hidden", "md:inline"], [1, "hidden", "md:inline", "px-1.5", "py-0.5", "text-[10px]", "font-bold", "bg-amber-100", "text-amber-800", "rounded-md"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "text-slate-400", "ml-0.5"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M19 9l-7 7-7-7"], [1, "absolute", "right-0", "top-full", "mt-2", "w-56", "bg-white", "rounded-2xl", "shadow-xl", "border", "border-slate-200/80", "py-2", "z-50", "animate-in", "fade-in", "zoom-in-95"], [1, "w-2", "h-2", "rounded-full", "bg-emerald-500", "animate-pulse"], [1, "inline-flex", "items-center", "gap-2", "px-3.5", "py-1.5", "rounded-l-xl", "text-xs", "sm:text-sm", "font-semibold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-r-0", "border-indigo-200", "transition", "shadow-2xs", 3, "click", "routerLink", "title"], ["type", "button", 1, "inline-flex", "items-center", "justify-center", "px-2", "py-1.5", "rounded-r-xl", "text-xs", "sm:text-sm", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "cursor-pointer", "shadow-2xs", 3, "click", "title"], [1, "text-[10px]", "bg-indigo-200/80", "text-indigo-900", "font-bold", "px-1.5", "py-0.5", "rounded-full", "mr-1"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "transform", "transition-transform"], [1, "absolute", "right-0", "top-full", "mt-2", "w-64", "bg-white", "rounded-2xl", "shadow-xl", "border", "border-slate-200/80", "py-2", "z-50", "animate-in", "fade-in", "zoom-in-95"], [1, "absolute", "right-0", "top-full", "mt-2", "w-64", "bg-white", "rounded-2xl", "shadow-xl", "border", "border-slate-200/80", "py-2", "z-50", "animate-in", "fade-in", "zoom-in-95", 3, "click"], [1, "px-3.5", "py-2", "border-b", "border-slate-100"], [1, "text-[10px]", "uppercase", "tracking-wider", "font-bold", "text-slate-400", "block"], [1, "text-xs", "font-semibold", "text-slate-600"], [1, "max-h-56", "overflow-y-auto", "py-1"], [1, "flex", "items-center", "justify-between", "px-3.5", "py-2.5", "hover:bg-indigo-50/70", "transition", "group", "text-left", 3, "routerLink"], [1, "border-t", "border-slate-100", "pt-1.5", "mt-1", "px-2", "space-y-1"], ["routerLink", "/profile", 1, "flex", "items-center", "gap-2", "px-2.5", "py-1.5", "rounded-lg", "text-xs", "font-semibold", "text-slate-700", "hover:bg-slate-100", "transition", 3, "click"], ["routerLink", "/create-store", 1, "flex", "items-center", "gap-2", "px-2.5", "py-1.5", "rounded-lg", "text-xs", "font-semibold", "text-indigo-600", "hover:bg-indigo-50", "transition", 3, "click"], [1, "flex", "items-center", "justify-between", "px-3.5", "py-2.5", "hover:bg-indigo-50/70", "transition", "group", "text-left", 3, "click", "routerLink"], [1, "min-w-0", "pr-2"], [1, "flex", "items-center", "gap-1.5"], [1, "w-2", "h-2", "rounded-full", "flex-shrink-0"], [1, "text-xs", "font-bold", "text-slate-800", "group-hover:text-indigo-600", "truncate", "block"], [1, "text-[11px]", "text-slate-400", "block", "truncate", "pl-3.5"], [1, "text-xs", "text-slate-400", "group-hover:text-indigo-600"], [1, "absolute", "right-0", "top-full", "mt-2", "w-56", "bg-white", "rounded-2xl", "shadow-xl", "border", "border-slate-200/80", "py-2", "z-50", "animate-in", "fade-in", "zoom-in-95", 3, "click"], [1, "px-4", "py-2", "border-b", "border-slate-100"], [1, "text-xs", "font-bold", "text-slate-900", "block", "truncate"], [1, "text-[11px]", "text-slate-500", "block", "truncate"], [1, "text-[10px]", "text-indigo-600", "font-semibold", "block", "mt-0.5"], [1, "py-1", "px-1.5", "space-y-0.5"], ["routerLink", "/profile", 1, "flex", "items-center", "gap-2.5", "px-3", "py-2", "rounded-xl", "text-xs", "font-semibold", "text-slate-700", "hover:bg-indigo-50", "hover:text-indigo-600", "transition", 3, "click"], ["routerLink", "/create-store", 1, "flex", "items-center", "gap-2.5", "px-3", "py-2", "rounded-xl", "text-xs", "font-semibold", "text-slate-700", "hover:bg-indigo-50", "hover:text-indigo-600", "transition", 3, "click"], [1, "border-t", "border-slate-100", "pt-1", "mt-1", "px-1.5"], ["type", "button", 1, "w-full", "flex", "items-center", "gap-2.5", "px-3", "py-2", "rounded-xl", "text-xs", "font-semibold", "text-rose-600", "hover:bg-rose-50", "transition", "text-left", "cursor-pointer", 3, "click"]], template: function NavbarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "header", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "a", 4)(5, "div", 5);
            i0.ɵɵtext(6, " AP ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 6)(8, "span", 7);
            i0.ɵɵtext(9, " AasPass ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "span", 8);
            i0.ɵɵtext(11, " Hyperlocal Freelancing ");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(12, "div", 9);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(13, "svg", 10);
            i0.ɵɵelement(14, "path", 11);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(15, "select", 12);
            i0.ɵɵcontrolCreate();
            i0.ɵɵlistener("ngModelChange", function NavbarComponent_Template_select_ngModelChange_15_listener($event) { return ctx.storeService.setSelectedCity($event); });
            i0.ɵɵtemplate(16, NavbarComponent_option_16_Template, 2, 2, "option", 13);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(17, "div", 14)(18, "a", 15)(19, "span");
            i0.ɵɵtext(20, "Explore Gigs");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(21, NavbarComponent_Conditional_21_Template, 11, 0)(22, NavbarComponent_Conditional_22_Template, 12, 5);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(15);
            i0.ɵɵproperty("ngModel", ctx.storeService.selectedCity());
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngForOf", ctx.storeService.availableCities);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("routerLinkActiveOptions", i0.ɵɵpureFunction0(4, _c0));
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(!ctx.authService.isLoggedIn() ? 21 : 22);
        } }, dependencies: [CommonModule, i1.NgForOf, RouterLink, RouterLinkActive, FormsModule, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.NgModel], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NavbarComponent, [{
        type: Component,
        args: [{
                selector: 'app-navbar',
                standalone: true,
                imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
                template: `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-6">
            <a routerLink="/" class="flex items-center gap-2 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                AP
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  AasPass
                </span>
                <span class="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 -mt-1">
                  Hyperlocal Freelancing
                </span>
              </div>
            </a>

            <!-- City / Location Selector -->
            <div class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium cursor-pointer transition">
              <svg class="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <select 
                [ngModel]="storeService.selectedCity()" 
                (ngModelChange)="storeService.setSelectedCity($event)"
                class="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option *ngFor="let city of storeService.availableCities" [value]="city">{{ city }}</option>
              </select>
            </div>
          </div>

            <!-- Nav Actions -->
          <div class="flex items-center gap-3">
            <!-- Explore Gigs link -->
            <a 
              routerLink="/" 
              routerLinkActive="text-indigo-600 font-semibold" 
              [routerLinkActiveOptions]="{exact: true}"
              class="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition"
            >
              <span>Explore Gigs</span>
            </a>

            <!-- GUEST / UNAUTHENTICATED ACTIONS -->
            @if (!authService.isLoggedIn()) {
              <!-- Open Store CTA (Prompts Login Modal with returnUrl to /create-store) -->
              <button 
                type="button"
                (click)="authService.openLoginModal('/create-store')"
                class="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>List Services</span>
              </button>

              <!-- Log In Button (Opens Modal) -->
              <button 
                type="button"
                (click)="authService.openLoginModal()"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              >
                <span>Log In</span>
              </button>

              <!-- Sign Up Button (Opens Modal in Signup mode) -->
              <button 
                type="button"
                (click)="authService.openSignupModal()"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition transform active:scale-95 cursor-pointer"
              >
                <span>Sign Up</span>
              </button>
            } @else {
              <!-- AUTHENTICATED ACTIONS -->

              <!-- Open Store / Store Dashboard CTA (Option A: Unified Account) -->
              @if (!storeService.currentUser().hasStore || storeService.userStores().length === 0) {
                <a 
                  routerLink="/create-store" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-95"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>List Services / Open Store</span>
                </a>
              } @else if (storeService.userStores().length === 1) {
                <!-- Single Store: Direct My Store Link -->
                <a 
                  [routerLink]="['/stores', activeStoreId()]" 
                  class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition shadow-2xs"
                  title="View your store"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>My Store</span>
                </a>
              } @else {
                <!-- Multiple Stores: My Store Button with Fast Switcher Dropdown -->
                <div class="relative inline-flex items-center">
                  <!-- Primary My Store Button -->
                  <a 
                    [routerLink]="['/stores', activeStoreId()]" 
                    (click)="closeDropdown()"
                    class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-l-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-r-0 border-indigo-200 transition shadow-2xs"
                    title="View your store ({{ activeStoreName() }})"
                  >
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>My Store</span>
                  </a>

                  <!-- Dropdown Trigger Button -->
                  <button 
                    type="button"
                    (click)="toggleDropdown($event)"
                    class="inline-flex items-center justify-center px-2 py-1.5 rounded-r-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer shadow-2xs"
                    [attr.aria-expanded]="isDropdownOpen()"
                    title="Switch between your {{ storeService.userStores().length }} stores"
                  >
                    <span class="text-[10px] bg-indigo-200/80 text-indigo-900 font-bold px-1.5 py-0.5 rounded-full mr-1">
                      {{ storeService.userStores().length }}
                    </span>
                    <svg class="w-3.5 h-3.5 transform transition-transform" [class.rotate-180]="isDropdownOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  <!-- Multi-Store Dropdown Menu -->
                  @if (isDropdownOpen()) {
                    <div 
                      class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95"
                      (click)="$event.stopPropagation()"
                    >
                      <div class="px-3.5 py-2 border-b border-slate-100">
                        <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                          Your Skill Stores ({{ storeService.userStores().length }})
                        </span>
                        <span class="text-xs font-semibold text-slate-600">Click to view storefront:</span>
                      </div>

                      <div class="max-h-56 overflow-y-auto py-1">
                        @for (st of storeService.userStores(); track st.id) {
                          <a 
                            [routerLink]="['/stores', st.id]"
                            (click)="closeDropdown()"
                            class="flex items-center justify-between px-3.5 py-2.5 hover:bg-indigo-50/70 transition group text-left"
                          >
                            <div class="min-w-0 pr-2">
                              <div class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full flex-shrink-0" [class.bg-emerald-500]="st.isAvailable" [class.bg-rose-400]="!st.isAvailable"></span>
                                <span class="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate block">
                                  {{ st.storeName }}
                                </span>
                              </div>
                              <span class="text-[11px] text-slate-400 block truncate pl-3.5">
                                {{ st.category }} • ₹{{ st.hourlyRate }}/hr
                              </span>
                            </div>
                            <span class="text-xs text-slate-400 group-hover:text-indigo-600">→</span>
                          </a>
                        }
                      </div>

                      <div class="border-t border-slate-100 pt-1.5 mt-1 px-2 space-y-1">
                        <a 
                          routerLink="/profile" 
                          (click)="closeDropdown()"
                          class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <span>⚙️</span>
                          <span>Manage Stores in Profile</span>
                        </a>
                        <a 
                          routerLink="/create-store" 
                          (click)="closeDropdown()"
                          class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <span>➕</span>
                          <span>Open Another Store</span>
                        </a>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- User Profile Menu Dropdown Container -->
              <div class="relative inline-flex items-center">
                <!-- User Profile Avatar Pill -->
                <button 
                  type="button"
                  (click)="toggleProfileMenu($event)"
                  class="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition bg-slate-50/50 cursor-pointer"
                  title="Account Menu"
                >
                  <img 
                    [src]="storeService.currentUser().avatarUrl" 
                    alt="Avatar" 
                    class="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <span class="text-xs font-semibold text-slate-700 hidden md:inline">
                    {{ storeService.currentUser().name.split(' ')[0] }}
                  </span>
                  @if (storeService.currentUser().hasStore) {
                    <span class="hidden md:inline px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">PRO</span>
                  }
                  <svg class="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- Profile Dropdown Menu -->
                @if (isProfileMenuOpen()) {
                  <div 
                    class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95"
                    (click)="$event.stopPropagation()"
                  >
                    <!-- User Header -->
                    <div class="px-4 py-2 border-b border-slate-100">
                      <span class="text-xs font-bold text-slate-900 block truncate">
                        {{ storeService.currentUser().name }}
                      </span>
                      <span class="text-[11px] text-slate-500 block truncate">
                        {{ storeService.currentUser().email }}
                      </span>
                      <span class="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                        📍 {{ storeService.currentUser().area }}, {{ storeService.currentUser().city }}
                      </span>
                    </div>

                    <div class="py-1 px-1.5 space-y-0.5">
                      <a 
                        routerLink="/profile" 
                        (click)="closeDropdowns()"
                        class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <span>👤</span>
                        <span>My Profile & KYC</span>
                      </a>
                      <a 
                        routerLink="/create-store" 
                        (click)="closeDropdowns()"
                        class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <span>➕</span>
                        <span>Open Skill Store</span>
                      </a>
                    </div>

                    <div class="border-t border-slate-100 pt-1 mt-1 px-1.5">
                      <button 
                        type="button"
                        (click)="logout()"
                        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }

          </div>

        </div>
      </div>
    </header>
  `
            }]
    }], null, { onDocumentClick: [{
            type: HostListener,
            args: ['document:click']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NavbarComponent, { className: "NavbarComponent", filePath: "src/app/components/navbar/navbar.ts", lineNumber: 289 }); })();
