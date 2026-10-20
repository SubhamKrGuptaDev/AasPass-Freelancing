import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { SocialMediaLinksComponent } from '../../components/social-media-links/social-media-links';
import { toUserSocialMediaLinks, formatSocialUrl, displaySocialUrl, getSocialIcon, getSocialBadgeClass, normalizeSocialLinks, ENGAGEMENT_TYPE_OPTIONS, getEngagementCount } from '../../models/store.model';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _c0 = a0 => ["/stores", a0];
const _c1 = () => ["/create-store"];
const _c2 = a0 => ({ editStoreId: a0 });
const _c3 = () => [1, 2, 3, 4, 5];
const _forTrack0 = ($index, $item) => $item.id || $item.name + $item.url;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.type;
function ProfileComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", ctx_r0.storeService.userStores().length, " ", ctx_r0.storeService.userStores().length === 1 ? "STORE" : "STORES", " ACTIVE ");
} }
function ProfileComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 9);
    i0.ɵɵtext(1, "NO STORES YET");
    i0.ɵɵelementEnd();
} }
function ProfileComponent_Conditional_30_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1, " \u2713 Verified ");
    i0.ɵɵelementEnd();
} }
function ProfileComponent_Conditional_30_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 39);
    i0.ɵɵtext(1, " \u2713 Linked ");
    i0.ɵɵelementEnd();
} }
function ProfileComponent_Conditional_30_Conditional_49_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48)(1, "div", 49)(2, "span", 50);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 51)(5, "span", 52);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 53);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "a", 54)(10, "span");
    i0.ɵɵtext(11, "Redirect");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(12, "svg", 55);
    i0.ɵɵelement(13, "path", 56);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const link_r3 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.getSocialIcon(link_r3.name));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", link_r3.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.displayUrl(link_r3.url), " ");
    i0.ɵɵadvance();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex-shrink-0 ", ctx_r0.getSocialBadgeClass(link_r3.name)));
    i0.ɵɵproperty("title", i0.ɵɵinterpolate1("Directly redirect to ", link_r3.name))("href", ctx_r0.formatUrl(link_r3.url), i0.ɵɵsanitizeUrl);
} }
function ProfileComponent_Conditional_30_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 46);
    i0.ɵɵrepeaterCreate(1, ProfileComponent_Conditional_30_Conditional_49_For_2_Template, 14, 9, "div", 48, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.getUserSocialLinks());
} }
function ProfileComponent_Conditional_30_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 47);
    i0.ɵɵtext(1, "No personal social links added yet. Click \"Edit Details\" or \"Manage Links\" above to add your LinkedIn, GitHub, Instagram, or Portfolio.");
    i0.ɵɵelementEnd();
} }
function ProfileComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 22)(1, "div", 31)(2, "span", 32);
    i0.ɵɵtext(3, "Full Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 33);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 31)(7, "span", 32);
    i0.ɵɵtext(8, "Email Address");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 34);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 31)(12, "span", 32);
    i0.ɵɵtext(13, "Phone Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "span", 34);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 31)(17, "span", 32);
    i0.ɵɵtext(18, "Location & Neighborhood");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span", 34);
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 35)(22, "div")(23, "span", 32);
    i0.ɵɵtext(24, "Aadhaar Card (Identity)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "span", 36);
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(27, ProfileComponent_Conditional_30_Conditional_27_Template, 2, 0, "span", 37);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "div", 35)(29, "div")(30, "span", 32);
    i0.ɵɵtext(31, "PAN Card (Tax & Payouts)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "span", 38);
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(34, ProfileComponent_Conditional_30_Conditional_34_Template, 2, 0, "span", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 40)(36, "span", 32);
    i0.ɵɵtext(37, "Bio / Description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "p", 41);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "div", 40)(41, "div", 42)(42, "div", 13)(43, "span", 43);
    i0.ɵɵtext(44, " Personal Social Media & Portfolios (Connect with Me) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "span", 44);
    i0.ɵɵtext(46);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(47, "button", 45);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_30_Template_button_click_47_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.startEditUser()); });
    i0.ɵɵtext(48, " + Manage Links ");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(49, ProfileComponent_Conditional_30_Conditional_49_Template, 3, 0, "div", 46)(50, ProfileComponent_Conditional_30_Conditional_50_Template, 2, 0, "p", 47);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.storeService.currentUser().name);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.storeService.currentUser().email);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.storeService.currentUser().phone);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2(" \uD83D\uDCCD ", ctx_r0.storeService.currentUser().area, ", ", ctx_r0.storeService.currentUser().city, " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.storeService.currentUser().aadharNumber || "Not linked", " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.storeService.currentUser().aadharNumber ? 27 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.storeService.currentUser().panNumber || "Not linked", " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.storeService.currentUser().panNumber ? 34 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.storeService.currentUser().bio);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getUserSocialLinks().length, " Added ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.getUserSocialLinks().length > 0 ? 49 : 50);
} }
function ProfileComponent_Conditional_31_option_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 69);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r5 = ctx.$implicit;
    i0.ɵɵproperty("value", c_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r5);
} }
function ProfileComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 23)(1, "div", 22)(2, "div")(3, "label", 57);
    i0.ɵɵtext(4, "Full Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 58);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editName, $event) || (ctx_r0.editName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div")(7, "label", 57);
    i0.ɵɵtext(8, "Phone Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "input", 58);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editPhone, $event) || (ctx_r0.editPhone = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "div")(11, "label", 57);
    i0.ɵɵtext(12, "Aadhaar Card Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "input", 59);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_13_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editAadhar, $event) || (ctx_r0.editAadhar = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div")(15, "label", 57);
    i0.ɵɵtext(16, "PAN Card Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "input", 60);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_17_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editPan, $event) || (ctx_r0.editPan = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div")(19, "label", 57);
    i0.ɵɵtext(20, "Area / Neighborhood");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "input", 58);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_31_Template_input_ngModelChange_21_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editArea, $event) || (ctx_r0.editArea = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div")(23, "label", 57);
    i0.ɵɵtext(24, "City");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "select", 61);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_31_Template_select_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editCity, $event) || (ctx_r0.editCity = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵtemplate(26, ProfileComponent_Conditional_31_option_26_Template, 2, 2, "option", 62);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "div")(28, "label", 57);
    i0.ɵɵtext(29, "Bio");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "textarea", 63);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_31_Template_textarea_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editBio, $event) || (ctx_r0.editBio = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(31, "div", 64)(32, "app-social-media-links", 65);
    i0.ɵɵtwoWayListener("linksChange", function ProfileComponent_Conditional_31_Template_app_social_media_links_linksChange_32_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.editUserSocialLinks, $event) || (ctx_r0.editUserSocialLinks = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "div", 66)(34, "button", 67);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_31_Template_button_click_34_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.isEditingUser = false); });
    i0.ɵɵtext(35, " Cancel ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 68);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_31_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.saveUserDetails()); });
    i0.ɵɵtext(37, " Save Changes ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.editName);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.editPhone);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.editAadhar);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.editPan);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.editArea);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.editCity);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngForOf", ctx_r0.storeService.availableCities);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.editBio);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("links", ctx_r0.editUserSocialLinks);
} }
function ProfileComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 29)(1, "div", 70);
    i0.ɵɵtext(2, " \uD83C\uDFEA ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h3", 71);
    i0.ɵɵtext(4, "You haven't opened a Skill Store yet");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 72);
    i0.ɵɵtext(6, " Are you looking for side-income or new to this city? Create one or multiple neighborhood stores to showcase your experience, hourly rates, social media links, and services. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 73)(8, "a", 74);
    i0.ɵɵtext(9, " \uD83D\uDE80 Open Store & List Skills (2 min) ");
    i0.ɵɵelementEnd()()();
} }
function ProfileComponent_Conditional_45_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 76);
    i0.ɵɵtext(1, " Viewing: ");
    i0.ɵɵelementStart(2, "strong", 152);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const store_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(store_r7.storeName);
} }
function ProfileComponent_Conditional_45_For_8_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 153);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_For_8_Template_button_click_0_listener() { const st_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.selectStore(st_r9.id)); });
    i0.ɵɵelement(1, "span", 154);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 155);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 156);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const st_r9 = ctx.$implicit;
    const store_r7 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-indigo-600", store_r7.id === st_r9.id)("text-white", store_r7.id === st_r9.id)("border-indigo-600", store_r7.id === st_r9.id)("shadow-xs", store_r7.id === st_r9.id)("bg-slate-50", store_r7.id !== st_r9.id)("text-slate-700", store_r7.id !== st_r9.id)("border-slate-200", store_r7.id !== st_r9.id)("hover:bg-slate-100", store_r7.id !== st_r9.id);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-emerald-400", st_r9.isAvailable)("bg-rose-400", !st_r9.isAvailable);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(st_r9.storeName);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-white/20", store_r7.id === st_r9.id)("text-white", store_r7.id === st_r9.id)("bg-slate-200", store_r7.id !== st_r9.id)("text-slate-700", store_r7.id !== st_r9.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", st_r9.category, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("\u2B50 ", st_r9.rating);
} }
function ProfileComponent_Conditional_45_For_83_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 157);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_For_83_Template_button_click_0_listener() { const opt_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.selectEngagementType(opt_r11.type)); });
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const opt_r11 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("bg-indigo-600", ctx_r0.selectedEngagementType() === opt_r11.type)("text-white", ctx_r0.selectedEngagementType() === opt_r11.type)("shadow-xs", ctx_r0.selectedEngagementType() === opt_r11.type)("text-slate-600", ctx_r0.selectedEngagementType() !== opt_r11.type)("hover:text-slate-900", ctx_r0.selectedEngagementType() !== opt_r11.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opt_r11.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opt_r11.label);
} }
function ProfileComponent_Conditional_45_For_115_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 158);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_For_115_Template_button_click_0_listener() { const opt_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.selectEngagementType(opt_r13.type)); });
    i0.ɵɵelementStart(1, "div", 159)(2, "span", 160);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 161);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div")(7, "span", 162);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span", 163);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const opt_r13 = ctx.$implicit;
    const store_r7 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-indigo-600", ctx_r0.selectedEngagementType() === opt_r13.type)("text-white", ctx_r0.selectedEngagementType() === opt_r13.type)("border-indigo-600", ctx_r0.selectedEngagementType() === opt_r13.type)("shadow-xs", ctx_r0.selectedEngagementType() === opt_r13.type)("bg-white", ctx_r0.selectedEngagementType() !== opt_r13.type)("text-slate-700", ctx_r0.selectedEngagementType() !== opt_r13.type)("border-slate-200/80", ctx_r0.selectedEngagementType() !== opt_r13.type)("hover:border-indigo-300", ctx_r0.selectedEngagementType() !== opt_r13.type);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("text-indigo-200", ctx_r0.selectedEngagementType() === opt_r13.type)("text-slate-400", ctx_r0.selectedEngagementType() !== opt_r13.type);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", opt_r13.label, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opt_r13.icon);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 28, ctx_r0.getStoreEngagement(store_r7, opt_r13.type)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("text-indigo-100", ctx_r0.selectedEngagementType() === opt_r13.type)("text-slate-400", ctx_r0.selectedEngagementType() !== opt_r13.type);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", opt_r13.shortLabel, " ");
} }
function ProfileComponent_Conditional_45_Conditional_116_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 127)(1, "div", 13)(2, "span");
    i0.ɵɵtext(3, "\u2713");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "span", 164);
    i0.ɵɵtext(7, "Live Counter Bumped");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.viewSimulationToast);
} }
function ProfileComponent_Conditional_45_Conditional_127_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 165)(1, "div", 166)(2, "div", 13)(3, "span", 167);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 168);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "a", 54)(8, "span");
    i0.ɵɵtext(9, "Redirect");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(10, "svg", 169);
    i0.ɵɵelement(11, "path", 56);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(12, "div", 170)(13, "a", 171);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(14, "svg", 172);
    i0.ɵɵelement(15, "path", 173);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(16, "span", 174);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const link_r14 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.getSocialIcon(link_r14.name));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(link_r14.name);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs ", ctx_r0.getSocialBadgeClass(link_r14.name)));
    i0.ɵɵproperty("title", i0.ɵɵinterpolate1("Directly redirect to ", link_r14.name))("href", ctx_r0.formatUrl(link_r14.url), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("title", i0.ɵɵinterpolate(link_r14.url))("href", ctx_r0.formatUrl(link_r14.url), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.displayUrl(link_r14.url));
} }
function ProfileComponent_Conditional_45_Conditional_127_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 131);
    i0.ɵɵrepeaterCreate(1, ProfileComponent_Conditional_45_Conditional_127_For_2_Template, 18, 12, "div", 165, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const store_r7 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.getStoreSocialLinks(store_r7));
} }
function ProfileComponent_Conditional_45_Conditional_128_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 132)(1, "span", 175);
    i0.ɵɵtext(2, "\uD83D\uDD17");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 176);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 177);
    i0.ɵɵtext(6, "Add links to your store's Instagram, LinkedIn, GitHub, or portfolio showcase so neighborhood clients can view your store credibility directly.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "a", 178);
    i0.ɵɵtext(8, " + Add Store Social Media Links ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const store_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("No store social media links linked for ", store_r7.storeName, " yet");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(3, _c1))("queryParams", i0.ɵɵpureFunction1(4, _c2, store_r7.id));
} }
function ProfileComponent_Conditional_45_For_134_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 135);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const skill_r15 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", skill_r15, " ");
} }
function ProfileComponent_Conditional_45_Conditional_150_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 142)(1, "span");
    i0.ɵɵtext(2, "\u2713");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.reviewSuccessMessage);
} }
function ProfileComponent_Conditional_45_Conditional_151_For_22_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 193);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_Conditional_151_For_22_Template_button_click_0_listener() { const star_r18 = i0.ɵɵrestoreView(_r17).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.setNewRating(star_r18)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const star_r18 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", star_r18 <= ctx_r0.newReviewRating ? "\u2B50" : "\u2606", " ");
} }
function ProfileComponent_Conditional_45_Conditional_151_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 189);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u26A0\uFE0F ", ctx_r0.reviewFormError, " ");
} }
function ProfileComponent_Conditional_45_Conditional_151_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 143)(1, "h5", 179)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 180);
    i0.ɵɵtext(5, "Min 1.0 \u2022 Max 5.0");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 23)(7, "div", 22)(8, "div")(9, "label", 57);
    i0.ɵɵtext(10, "Review User Name *");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "input", 181);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_45_Conditional_151_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r0 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r0.newReviewUserName, $event) || (ctx_r0.newReviewUserName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div")(13, "label", 57);
    i0.ɵɵtext(14, " Rating Score: ");
    i0.ɵɵelementStart(15, "span", 182);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span", 183);
    i0.ɵɵtext(19, "(Min 1.0, Max 5.0)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "div", 184);
    i0.ɵɵrepeaterCreate(21, ProfileComponent_Conditional_45_Conditional_151_For_22_Template, 2, 1, "button", 185, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(23, "input", 186);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_45_Conditional_151_Template_input_ngModelChange_23_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r0 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r0.newReviewRating, $event) || (ctx_r0.newReviewRating = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function ProfileComponent_Conditional_45_Conditional_151_Template_input_ngModelChange_23_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.setNewRating($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "span", 187);
    i0.ɵɵtext(25, "/ 5.0");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(26, "div")(27, "label", 57);
    i0.ɵɵtext(28, "Review Message *");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "textarea", 188);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function ProfileComponent_Conditional_45_Conditional_151_Template_textarea_ngModelChange_29_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r0 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r0.newReviewMessage, $event) || (ctx_r0.newReviewMessage = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(30, ProfileComponent_Conditional_45_Conditional_151_Conditional_30_Template, 2, 1, "p", 189);
    i0.ɵɵelementStart(31, "div", 190)(32, "button", 191);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_Conditional_151_Template_button_click_32_listener() { i0.ɵɵrestoreView(_r16); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.isAddingReview = false); });
    i0.ɵɵtext(33, " Cancel ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "button", 192);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_Conditional_151_Template_button_click_34_listener() { i0.ɵɵrestoreView(_r16); const store_r7 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.submitStoreReview(store_r7.id)); });
    i0.ɵɵtext(35, " Save Review ");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const store_r7 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Add Customer Feedback to ", store_r7.storeName);
    i0.ɵɵadvance(8);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.newReviewUserName);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(17, 6, ctx_r0.newReviewRating, "1.1-1"), " \u2B50");
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(i0.ɵɵpureFunction0(9, _c3));
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.newReviewRating);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.newReviewMessage);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.reviewFormError ? 30 : -1);
} }
function ProfileComponent_Conditional_45_Conditional_153_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 194)(1, "div", 195)(2, "div", 196)(3, "div", 197);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div")(6, "div", 13)(7, "h5", 198);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 199);
    i0.ɵɵtext(10, " \u2713 Verified Review ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "span", 200);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "div", 201)(14, "span");
    i0.ɵɵtext(15, "\u2B50");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span", 202);
    i0.ɵɵtext(20, "/ 5.0");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "div", 203);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const rev_r19 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", rev_r19.userName.slice(0, 2).toUpperCase(), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(rev_r19.userName);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(rev_r19.date);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(18, 5, rev_r19.rating, "1.1-1"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" \"", rev_r19.message, "\" ");
} }
function ProfileComponent_Conditional_45_Conditional_153_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, ProfileComponent_Conditional_45_Conditional_153_For_1_Template, 23, 8, "div", 194, _forTrack1);
} if (rf & 2) {
    const store_r7 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(store_r7.reviews);
} }
function ProfileComponent_Conditional_45_Conditional_154_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 145)(1, "span", 204);
    i0.ɵɵtext(2, "\u2B50");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h5", 205);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 206);
    i0.ɵɵtext(6, " When clients book your services and leave reviews (1.0 to 5.0 rating), they will appear here. ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const store_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("No customer reviews yet for ", store_r7.storeName);
} }
function ProfileComponent_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 30)(1, "div")(2, "div", 42)(3, "span", 75);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, ProfileComponent_Conditional_45_Conditional_5_Template, 4, 1, "span", 76);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 77);
    i0.ɵɵrepeaterCreate(7, ProfileComponent_Conditional_45_For_8_Template, 8, 31, "button", 78, _forTrack1);
    i0.ɵɵelementStart(9, "a", 79)(10, "span");
    i0.ɵɵtext(11, "+ Add Store");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(12, "div", 80)(13, "div")(14, "div", 81)(15, "h3", 82);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "span", 83);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "button", 84);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_Template_button_click_19_listener() { const store_r7 = i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.storeService.toggleStoreAvailability(store_r7.id)); });
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "p", 85);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "p", 86);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div", 81)(26, "a", 87);
    i0.ɵɵtext(27, " View Public Storefront \u2192 ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "a", 88);
    i0.ɵɵtext(29, " \u270F\uFE0F Edit ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "button", 89);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_Template_button_click_30_listener() { const store_r7 = i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.deleteStore(store_r7.id)); });
    i0.ɵɵtext(31, " \uD83D\uDDD1\uFE0F Delete ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(32, "div", 90)(33, "div", 91)(34, "span", 92);
    i0.ɵɵtext(35, "Experience");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "span", 93);
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(38, "div", 91)(39, "span", 92);
    i0.ɵɵtext(40, "Hourly Charges");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "span", 94);
    i0.ɵɵtext(42);
    i0.ɵɵelementStart(43, "span", 95);
    i0.ɵɵtext(44, "/hr");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(45, "div", 91)(46, "span", 92);
    i0.ɵɵtext(47, "Starting Price");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "span", 96);
    i0.ɵɵtext(49);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div", 91)(51, "span", 92);
    i0.ɵɵtext(52, "Store Rating");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "span", 97);
    i0.ɵɵtext(54);
    i0.ɵɵelementStart(55, "span", 98);
    i0.ɵɵtext(56);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(57, "div", 99)(58, "span", 100);
    i0.ɵɵtext(59);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(60, "span", 101)(61, "span");
    i0.ɵɵtext(62, "\uD83D\uDC41\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "span");
    i0.ɵɵtext(64);
    i0.ɵɵpipe(65, "number");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(66, "div", 102)(67, "div", 103)(68, "div")(69, "div", 81)(70, "span", 104);
    i0.ɵɵtext(71, "\uD83D\uDCC8");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(72, "h4", 105);
    i0.ɵɵtext(73, " Store Engagement & View Analytics ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(74, "span", 106);
    i0.ɵɵtext(75, " Store Owner Portal ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(76, "p", 107);
    i0.ɵɵtext(77, " Viewer analytics for ");
    i0.ɵɵelementStart(78, "strong");
    i0.ɵɵtext(79);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(80, " filtered by selected engagement timeframe ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(81, "div", 108);
    i0.ɵɵrepeaterCreate(82, ProfileComponent_Conditional_45_For_83_Template, 5, 12, "button", 109, _forTrack2);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(84, "div", 110)(85, "div", 111)(86, "div")(87, "div", 112)(88, "span", 113)(89, "span");
    i0.ɵɵtext(90);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(91, "span", 114);
    i0.ɵɵtext(92);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(93, "span", 115);
    i0.ɵɵelement(94, "span", 116);
    i0.ɵɵtext(95, " Live Store Level ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(96, "div", 117)(97, "div", 118)(98, "span", 119);
    i0.ɵɵtext(99);
    i0.ɵɵpipe(100, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(101, "span", 120);
    i0.ɵɵtext(102);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(103, "p", 121);
    i0.ɵɵtext(104);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(105, "div", 122)(106, "span", 123);
    i0.ɵɵtext(107, " Test view counter: ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(108, "button", 124);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_Template_button_click_108_listener() { const store_r7 = i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.simulateStoreView(store_r7.id)); });
    i0.ɵɵelementStart(109, "span");
    i0.ɵɵtext(110, "\uD83D\uDC41\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(111, "span");
    i0.ɵɵtext(112, "+ Simulate Store View (+1)");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(113, "div", 125);
    i0.ɵɵrepeaterCreate(114, ProfileComponent_Conditional_45_For_115_Template, 12, 30, "button", 126, _forTrack2);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(116, ProfileComponent_Conditional_45_Conditional_116_Template, 8, 1, "div", 127);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(117, "div")(118, "div", 128)(119, "div", 13)(120, "h4", 129);
    i0.ɵɵtext(121);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(122, "span", 44);
    i0.ɵɵtext(123);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(124, "a", 130)(125, "span");
    i0.ɵɵtext(126, "+ Add / Manage Store Links");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(127, ProfileComponent_Conditional_45_Conditional_127_Template, 3, 0, "div", 131)(128, ProfileComponent_Conditional_45_Conditional_128_Template, 9, 6, "div", 132);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(129, "div")(130, "h4", 133);
    i0.ɵɵtext(131);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(132, "div", 134);
    i0.ɵɵrepeaterCreate(133, ProfileComponent_Conditional_45_For_134_Template, 2, 1, "span", 135, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(135, "div", 136)(136, "div", 137)(137, "div")(138, "div", 13)(139, "h4", 138)(140, "span");
    i0.ɵɵtext(141);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(142, "span", 139);
    i0.ɵɵtext(143, " Store Owner Portal Only ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(144, "p", 140);
    i0.ɵɵtext(145, " Feedback and ratings from neighborhood clients for this store (Scale: 1.0 to 5.0) ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(146, "div", 13)(147, "button", 141);
    i0.ɵɵlistener("click", function ProfileComponent_Conditional_45_Template_button_click_147_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.isAddingReview = !ctx_r0.isAddingReview); });
    i0.ɵɵelementStart(148, "span");
    i0.ɵɵtext(149);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(150, ProfileComponent_Conditional_45_Conditional_150_Template, 5, 1, "div", 142);
    i0.ɵɵconditionalCreate(151, ProfileComponent_Conditional_45_Conditional_151_Template, 36, 10, "div", 143);
    i0.ɵɵelementStart(152, "div", 144);
    i0.ɵɵconditionalCreate(153, ProfileComponent_Conditional_45_Conditional_153_Template, 2, 0)(154, ProfileComponent_Conditional_45_Conditional_154_Template, 7, 1, "div", 145);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(155, "div", 146)(156, "div", 147)(157, "span", 148);
    i0.ɵɵtext(158, "\uD83C\uDFEA");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(159, "div")(160, "h5", 149);
    i0.ɵɵtext(161, "Multi-Store Feature Enabled");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(162, "p", 150);
    i0.ɵɵtext(163, " You can open and manage multiple specialized skill stores (e.g. Web Development, Video Editing, or Tutoring) under your single unified profile. ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(164, "a", 151);
    i0.ɵɵtext(165, " + Open Another Store ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const store_r7 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" Switch Active Store (", ctx_r0.storeService.userStores().length, " total): ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.storeService.userStores().length > 1 ? 5 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.storeService.userStores());
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(store_r7.storeName);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", store_r7.category, " ");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("bg-emerald-100", store_r7.isAvailable)("text-emerald-800", store_r7.isAvailable)("bg-rose-100", !store_r7.isAvailable)("text-rose-800", !store_r7.isAvailable);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", store_r7.isAvailable ? "\u2713 Active For Gigs" : "\u23F8 Paused", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("\"", store_r7.tagline, "\"");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3(" Operating in ", store_r7.area, ", ", store_r7.city, " \u2022 Serving within ", store_r7.serviceRadiusKm, " km ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(50, _c0, store_r7.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(52, _c1))("queryParams", i0.ɵɵpureFunction1(53, _c2, store_r7.id));
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate1("", store_r7.experienceYears, " Years");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("\u20B9", store_r7.hourlyRate, " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("\u20B9", store_r7.startingPrice);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("\u2B50 ", store_r7.rating, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", store_r7.reviewCount, ")");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" Views (", ctx_r0.getEngagementShortLabel(ctx_r0.selectedEngagementType()), ") ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(65, 46, ctx_r0.getStoreEngagement(store_r7, ctx_r0.selectedEngagementType())));
    i0.ɵɵadvance(15);
    i0.ɵɵtextInterpolate(store_r7.storeName);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.engagementOptions);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.selectedEngagementOption().icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r0.selectedEngagementOption().label, " VIEW ENGAGEMENT");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(100, 48, ctx_r0.getStoreEngagement(store_r7, ctx_r0.selectedEngagementType())), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.selectedEngagementOption().label, " Views ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", ctx_r0.selectedEngagementOption().description, ". Neighborhood clients browse local gigs and discover ", store_r7.storeName, " in this window. ");
    i0.ɵɵadvance(10);
    i0.ɵɵrepeater(ctx_r0.engagementOptions);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.viewSimulationToast ? 116 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" Linked Store Social Media & Portfolios (", store_r7.storeName, ") ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.getStoreSocialLinks(store_r7).length, " Store Links Added ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(55, _c1))("queryParams", i0.ɵɵpureFunction1(56, _c2, store_r7.id));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.getStoreSocialLinks(store_r7).length > 0 ? 127 : 128);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("Offered Skills (", store_r7.storeName, ")");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(store_r7.skills);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate1("\u2B50 Reviews & Ratings for ", store_r7.storeName);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.isAddingReview ? "\u2715 Close Form" : "+ Add Test Review");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.reviewSuccessMessage ? 150 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.isAddingReview ? 151 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(store_r7.reviews && store_r7.reviews.length > 0 ? 153 : 154);
} }
export class ProfileComponent {
    storeService = inject(StoreService);
    authService = inject(AuthService);
    isEditingUser = false;
    editName = this.storeService.currentUser().name;
    editPhone = this.storeService.currentUser().phone;
    editAadhar = this.storeService.currentUser().aadharNumber || '';
    editPan = this.storeService.currentUser().panNumber || '';
    editArea = this.storeService.currentUser().area;
    editCity = this.storeService.currentUser().city;
    editBio = this.storeService.currentUser().bio;
    editUserSocialLinks = [];
    formatUrl = formatSocialUrl;
    displayUrl = displaySocialUrl;
    getSocialIcon = getSocialIcon;
    getSocialBadgeClass = getSocialBadgeClass;
    startEditUser() {
        const user = this.storeService.currentUser();
        this.editName = user.name;
        this.editPhone = user.phone;
        this.editAadhar = user.aadharNumber || '';
        this.editPan = user.panNumber || '';
        this.editArea = user.area;
        this.editCity = user.city;
        this.editBio = user.bio;
        this.editUserSocialLinks = this.getUserSocialLinks().map(l => ({ ...l }));
        this.isEditingUser = true;
    }
    toggleEditUser() {
        if (this.isEditingUser) {
            this.isEditingUser = false;
        }
        else {
            this.startEditUser();
        }
    }
    getUserSocialLinks() {
        const u = this.storeService.currentUser();
        return normalizeSocialLinks(u.socialMediaLinks, u.userSocialMediaLinks || u.userSocialLinks);
    }
    getStoreSocialLinks(store) {
        return normalizeSocialLinks(store.socialMediaLinks, store.storeSocialMediaLinks || store.userSocialLinks);
    }
    // Selected store state for multi-store switcher
    selectedStoreId = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedStoreId" }] : /* istanbul ignore next */ []));
    selectedStore = computed(() => {
        const list = this.storeService.userStores();
        if (list.length === 0)
            return undefined;
        const currentId = this.selectedStoreId();
        const found = list.find(s => s.id === currentId);
        return found || list[0];
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedStore" }] : /* istanbul ignore next */ []));
    selectStore(id) {
        this.selectedStoreId.set(id);
        this.isAddingReview = false;
        this.reviewFormError = null;
        this.reviewSuccessMessage = null;
    }
    deleteStore(storeId) {
        const target = this.storeService.getStoreById(storeId);
        const storeName = target?.storeName || 'this store';
        if (confirm(`Are you sure you want to delete "${storeName}"? This action cannot be undone.`)) {
            this.storeService.deleteStore(storeId);
            const remaining = this.storeService.userStores();
            if (remaining.length > 0) {
                this.selectedStoreId.set(remaining[0].id);
            }
            else {
                this.selectedStoreId.set('');
            }
        }
    }
    // Review section for store owner
    isAddingReview = false;
    newReviewUserName = '';
    newReviewRating = 5.0;
    newReviewMessage = '';
    reviewFormError = null;
    reviewSuccessMessage = null;
    saveUserDetails() {
        const validSocial = this.editUserSocialLinks
            .map(l => ({
            id: l.id || ('usr-sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
            name: l.name.trim(),
            url: l.url.trim()
        }))
            .filter(l => l.name.length > 0 && l.url.length > 0);
        const userSocialMediaLinks = toUserSocialMediaLinks(validSocial);
        this.storeService.updateUserProfile({
            name: this.editName,
            phone: this.editPhone,
            aadharNumber: this.editAadhar,
            panNumber: this.editPan ? this.editPan.toUpperCase() : '',
            area: this.editArea,
            city: this.editCity,
            bio: this.editBio,
            socialMediaLinks: validSocial,
            userSocialMediaLinks: userSocialMediaLinks,
            userSocialLinks: userSocialMediaLinks
        });
        this.isEditingUser = false;
    }
    setNewRating(val) {
        const num = Number(val);
        if (isNaN(num)) {
            this.newReviewRating = 5.0;
            return;
        }
        // strictly enforce min 1.0 and max 5.0
        this.newReviewRating = Math.max(1.0, Math.min(5.0, Math.round(num * 10) / 10));
    }
    submitStoreReview(storeId) {
        if (!this.newReviewUserName || !this.newReviewUserName.trim()) {
            this.reviewFormError = 'Please provide the Review User Name.';
            return;
        }
        if (this.newReviewRating < 1.0 || this.newReviewRating > 5.0) {
            this.reviewFormError = 'Rating must be between 1.0 (min) and 5.0 (max).';
            return;
        }
        if (!this.newReviewMessage || !this.newReviewMessage.trim()) {
            this.reviewFormError = 'Please write a review message.';
            return;
        }
        this.reviewFormError = null;
        this.storeService.addReview(storeId, {
            userName: this.newReviewUserName.trim(),
            rating: this.newReviewRating,
            message: this.newReviewMessage.trim()
        });
        this.reviewSuccessMessage = `Added ${this.newReviewRating.toFixed(1)}★ review from "${this.newReviewUserName.trim()}".`;
        this.newReviewUserName = '';
        this.newReviewRating = 5.0;
        this.newReviewMessage = '';
        this.isAddingReview = false;
        setTimeout(() => {
            this.reviewSuccessMessage = null;
        }, 4000);
    }
    // Engagement tracking state for store owner (Daily, Weekly, Monthly, Lifetime)
    selectedEngagementType = signal('daily', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedEngagementType" }] : /* istanbul ignore next */ []));
    engagementOptions = ENGAGEMENT_TYPE_OPTIONS;
    viewSimulationToast = null;
    selectedEngagementOption = computed(() => {
        const t = this.selectedEngagementType();
        return this.engagementOptions.find(o => o.type === t) || this.engagementOptions[0];
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedEngagementOption" }] : /* istanbul ignore next */ []));
    selectEngagementType(type) {
        this.selectedEngagementType.set(type);
    }
    getStoreEngagement(store, type) {
        return getEngagementCount(store, type);
    }
    getEngagementShortLabel(type) {
        const opt = this.engagementOptions.find(o => o.type === type);
        return opt?.shortLabel || type;
    }
    simulateStoreView(storeId) {
        this.storeService.recordStoreView(storeId);
        const store = this.storeService.getStoreById(storeId);
        const storeName = store?.storeName || 'Store';
        this.viewSimulationToast = `Recorded 1 new view for "${storeName}". Daily, weekly, monthly & lifetime updated!`;
        setTimeout(() => {
            this.viewSimulationToast = null;
        }, 4000);
    }
    static ɵfac = function ProfileComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProfileComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ProfileComponent, selectors: [["app-profile"]], decls: 46, vars: 14, consts: [[1, "min-h-screen", "bg-slate-50/70", "py-12", "px-4", "sm:px-6", "lg:px-8"], [1, "max-w-4xl", "mx-auto", "space-y-8"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-4", "pb-6", "border-b", "border-slate-200"], [1, "text-2xl", "sm:text-3xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-xs", "sm:text-sm", "text-slate-500", "mt-1"], [1, "flex", "flex-wrap", "items-center", "gap-2"], [1, "flex", "items-center", "gap-2", "bg-white", "px-3", "py-1.5", "rounded-xl", "border", "border-slate-200", "shadow-2xs"], [1, "text-xs", "font-semibold", "text-slate-600"], [1, "px-2", "py-0.5", "rounded-md", "bg-emerald-100", "text-emerald-800", "text-[11px]", "font-bold"], [1, "px-2", "py-0.5", "rounded-md", "bg-slate-100", "text-slate-600", "text-[11px]", "font-bold"], ["type", "button", 1, "ml-1", "px-2.5", "py-1", "rounded-lg", "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "cursor-pointer", 3, "click"], [1, "bg-white", "rounded-3xl", "p-6", "sm:p-8", "border", "border-slate-200/80", "shadow-xs"], [1, "flex", "items-center", "justify-between", "mb-6", "pb-4", "border-b", "border-slate-100"], [1, "flex", "items-center", "gap-2"], [1, "w-2.5", "h-2.5", "rounded-full", "bg-indigo-600"], [1, "text-base", "font-bold", "text-slate-900"], ["type", "button", 1, "text-xs", "font-bold", "text-indigo-600", "hover:text-indigo-800", 3, "click"], [1, "flex", "flex-col", "sm:flex-row", "items-start", "gap-6"], [1, "flex", "flex-col", "items-center", "gap-2"], ["alt", "Avatar", 1, "w-24", "h-24", "rounded-2xl", "object-cover", "ring-4", "ring-slate-100", "shadow-md", 3, "src"], [1, "text-[11px]", "font-semibold", "text-slate-400"], [1, "flex-1", "w-full"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "gap-4"], [1, "space-y-4"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-3", "mb-6", "pb-4", "border-b", "border-slate-100"], [1, "flex", "items-center", "gap-2.5"], [1, "w-2.5", "h-2.5", "rounded-full"], [1, "px-2.5", "py-0.5", "rounded-full", "text-[11px]", "font-bold", "bg-indigo-50", "text-indigo-700", "border", "border-indigo-100"], ["routerLink", "/create-store", 1, "inline-flex", "items-center", "gap-1.5", "px-3.5", "py-1.5", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-xs", "transition", "transform", "active:scale-95"], [1, "text-center", "py-8", "px-4", "max-w-lg", "mx-auto"], [1, "space-y-6"], [1, "p-3.5", "rounded-xl", "bg-slate-50", "border", "border-slate-100"], [1, "text-[10px]", "uppercase", "font-bold", "text-slate-400", "block", "mb-0.5"], [1, "text-sm", "font-bold", "text-slate-800"], [1, "text-sm", "font-semibold", "text-slate-800"], [1, "p-3.5", "rounded-xl", "bg-slate-50", "border", "border-slate-100", "flex", "items-center", "justify-between"], [1, "text-sm", "font-mono", "font-bold", "text-slate-800"], [1, "px-2", "py-0.5", "rounded-md", "bg-emerald-100", "text-emerald-800", "text-[10px]", "font-bold"], [1, "text-sm", "font-mono", "font-bold", "text-slate-800", "uppercase"], [1, "px-2", "py-0.5", "rounded-md", "bg-indigo-100", "text-indigo-800", "text-[10px]", "font-bold"], [1, "sm:col-span-2", "p-3.5", "rounded-xl", "bg-slate-50", "border", "border-slate-100"], [1, "text-xs", "text-slate-700", "leading-relaxed"], [1, "flex", "items-center", "justify-between", "mb-2.5"], [1, "text-[10px]", "uppercase", "font-bold", "text-slate-400", "block"], [1, "text-[10px]", "font-bold", "px-2", "py-0.5", "rounded-full", "bg-indigo-50", "text-indigo-700", "border", "border-indigo-100"], ["type", "button", 1, "text-[11px]", "font-bold", "text-indigo-600", "hover:text-indigo-800", "hover:underline", 3, "click"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-2.5"], [1, "text-xs", "text-slate-400", "italic"], [1, "p-2.5", "rounded-xl", "bg-white", "border", "border-slate-200/80", "hover:border-indigo-300", "transition", "flex", "items-center", "justify-between", "gap-2", "shadow-2xs", "group"], [1, "flex", "items-center", "gap-2", "min-w-0", "pr-1"], [1, "text-base", "flex-shrink-0"], [1, "min-w-0"], [1, "text-xs", "font-bold", "text-slate-900", "block", "truncate", "group-hover:text-indigo-600", "transition-colors"], [1, "text-[11px]", "text-slate-400", "block", "truncate"], ["target", "_blank", "rel", "noopener noreferrer", 3, "href", "title"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-2.5", "h-2.5", "group-hover:translate-x-0.5", "group-hover:-translate-y-0.5", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"], [1, "block", "text-xs", "font-bold", "text-slate-700", "mb-1"], ["type", "text", 1, "w-full", "px-3.5", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "e.g. XXXX-XXXX-8921 or 12 digits", 1, "w-full", "px-3.5", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "e.g. ABCDE1234F (10 characters)", 1, "w-full", "px-3.5", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "uppercase", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "w-full", "px-3.5", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [3, "value", 4, "ngFor", "ngForOf"], ["rows", "2", 1, "w-full", "px-3.5", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "pt-4", "border-t", "border-slate-100"], ["title", "Personal Social Media Links", "subtitle", "Add your personal social media profiles so nearby customers, clients, and collaborators can connect with you directly.", "idPrefix", "user_link", 3, "linksChange", "links"], [1, "flex", "justify-end", "gap-2", "pt-2"], ["type", "button", 1, "px-4", "py-2", "bg-slate-100", "hover:bg-slate-200", "text-slate-700", "text-xs", "font-bold", "rounded-xl", "transition", 3, "click"], ["type", "button", 1, "px-4", "py-2", "bg-indigo-600", "hover:bg-indigo-700", "text-white", "text-xs", "font-bold", "rounded-xl", "transition", "shadow-xs", 3, "click"], [3, "value"], [1, "w-16", "h-16", "rounded-2xl", "bg-amber-50", "text-amber-600", "flex", "items-center", "justify-center", "mx-auto", "mb-4", "text-3xl"], [1, "text-lg", "font-black", "text-slate-900", "mb-2"], [1, "text-xs", "text-slate-500", "leading-relaxed", "mb-6"], [1, "flex", "flex-col", "sm:flex-row", "items-center", "justify-center", "gap-3"], ["routerLink", "/create-store", 1, "w-full", "sm:w-auto", "px-6", "py-3", "rounded-xl", "text-xs", "sm:text-sm", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-md", "shadow-indigo-600/20", "transition", "transform", "active:scale-95"], [1, "text-[11px]", "uppercase", "tracking-wider", "font-bold", "text-slate-400"], [1, "text-[11px]", "text-indigo-600", "font-semibold"], [1, "flex", "items-center", "gap-2", "overflow-x-auto", "pb-2", "scrollbar-thin"], ["type", "button", 1, "flex", "items-center", "gap-2", "px-3.5", "py-2", "rounded-xl", "text-xs", "font-bold", "transition", "border", "cursor-pointer", "whitespace-nowrap", 3, "bg-indigo-600", "text-white", "border-indigo-600", "shadow-xs", "bg-slate-50", "text-slate-700", "border-slate-200", "hover:bg-slate-100"], ["routerLink", "/create-store", "title", "Add another store to your profile", 1, "flex", "items-center", "gap-1.5", "px-3", "py-2", "rounded-xl", "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-dashed", "border-indigo-300", "transition", "cursor-pointer", "whitespace-nowrap"], [1, "p-5", "rounded-2xl", "bg-gradient-to-r", "from-indigo-50/80", "via-purple-50/60", "to-pink-50/80", "border", "border-indigo-100", "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-center", "justify-between", "gap-4"], [1, "flex", "items-center", "gap-2", "flex-wrap"], [1, "text-xl", "font-black", "text-slate-900"], [1, "px-2", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "bg-indigo-600", "text-white"], ["type", "button", 1, "px-2.5", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "transition", "cursor-pointer", 3, "click"], [1, "text-xs", "font-semibold", "text-slate-700", "mt-1"], [1, "text-[11px]", "text-slate-500", "mt-0.5"], [1, "px-4", "py-2", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-xs", "transition", 3, "routerLink"], [1, "px-3", "py-2", "rounded-xl", "text-xs", "font-bold", "text-slate-700", "bg-white", "hover:bg-slate-50", "border", "border-slate-200", "transition", 3, "routerLink", "queryParams"], ["type", "button", "title", "Delete this store", 1, "px-3", "py-2", "rounded-xl", "text-xs", "font-bold", "text-rose-600", "bg-rose-50", "hover:bg-rose-100", "border", "border-rose-200", "transition", "cursor-pointer", 3, "click"], [1, "grid", "grid-cols-2", "sm:grid-cols-3", "lg:grid-cols-5", "gap-3", "sm:gap-4"], [1, "p-4", "rounded-2xl", "bg-slate-50", "border", "border-slate-100", "text-center"], [1, "text-[10px]", "uppercase", "font-bold", "text-slate-400", "block", "mb-1"], [1, "text-lg", "font-black", "text-slate-900"], [1, "text-lg", "font-black", "text-indigo-700"], [1, "text-xs", "font-normal", "text-slate-500"], [1, "text-lg", "font-black", "text-emerald-700"], [1, "text-lg", "font-black", "text-amber-500"], [1, "text-xs", "font-normal", "text-slate-400"], [1, "p-4", "rounded-2xl", "bg-indigo-50/70", "border", "border-indigo-100", "text-center", "col-span-2", "sm:col-span-1"], [1, "text-[10px]", "uppercase", "font-bold", "text-indigo-400", "block", "mb-1"], [1, "text-lg", "font-black", "text-indigo-900", "flex", "items-center", "justify-center", "gap-1"], [1, "p-5", "sm:p-6", "rounded-3xl", "bg-gradient-to-br", "from-white", "via-indigo-50/40", "to-purple-50/30", "border", "border-indigo-100/90", "shadow-xs"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-4", "mb-6", "pb-4", "border-b", "border-indigo-100/70"], [1, "text-xl"], [1, "text-sm", "sm:text-base", "font-black", "text-slate-900"], [1, "px-2.5", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "bg-indigo-100", "text-indigo-800", "border", "border-indigo-200"], [1, "text-xs", "text-slate-500", "mt-1"], [1, "flex", "items-center", "gap-1", "p-1", "bg-slate-100/90", "rounded-2xl", "border", "border-slate-200/70", "self-start", "sm:self-auto", "overflow-x-auto", "scrollbar-none"], ["type", "button", 1, "flex", "items-center", "gap-1.5", "px-3", "py-1.5", "rounded-xl", "text-xs", "font-bold", "transition", "cursor-pointer", "whitespace-nowrap", 3, "bg-indigo-600", "text-white", "shadow-xs", "text-slate-600", "hover:text-slate-900"], [1, "grid", "grid-cols-1", "md:grid-cols-3", "gap-4", "mb-4"], [1, "md:col-span-2", "p-5", "rounded-2xl", "bg-white", "border", "border-indigo-200/80", "shadow-xs", "flex", "flex-col", "justify-between"], [1, "flex", "items-center", "justify-between", "mb-2"], [1, "px-2.5", "py-1", "rounded-xl", "bg-indigo-50", "text-indigo-700", "text-xs", "font-bold", "flex", "items-center", "gap-1.5"], [1, "uppercase", "tracking-wider", "text-[11px]"], [1, "text-[11px]", "font-semibold", "text-emerald-600", "bg-emerald-50", "px-2", "py-0.5", "rounded-full", "flex", "items-center", "gap-1"], [1, "w-1.5", "h-1.5", "rounded-full", "bg-emerald-500", "animate-pulse"], [1, "my-2"], [1, "flex", "items-baseline", "gap-2"], [1, "text-3xl", "sm:text-4xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-sm", "sm:text-base", "font-bold", "text-indigo-600"], [1, "text-xs", "text-slate-500", "mt-1.5", "leading-relaxed"], [1, "pt-3", "mt-3", "border-t", "border-slate-100", "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-2"], [1, "text-[11px]", "text-slate-400"], ["type", "button", "title", "Simulate a neighborhood client visiting your store page", 1, "inline-flex", "items-center", "justify-center", "gap-1.5", "px-3.5", "py-1.5", "rounded-xl", "bg-slate-900", "hover:bg-black", "text-white", "text-xs", "font-bold", "transition", "shadow-2xs", "cursor-pointer", "active:scale-95", 3, "click"], [1, "grid", "grid-cols-2", "gap-2.5"], ["type", "button", 1, "p-3", "rounded-2xl", "border", "text-left", "transition", "cursor-pointer", "flex", "flex-col", "justify-between", 3, "bg-indigo-600", "text-white", "border-indigo-600", "shadow-xs", "bg-white", "text-slate-700", "border-slate-200/80", "hover:border-indigo-300"], [1, "p-3", "rounded-xl", "bg-emerald-50", "border", "border-emerald-200", "text-emerald-800", "text-xs", "font-semibold", "flex", "items-center", "justify-between"], [1, "flex", "items-center", "justify-between", "mb-3"], [1, "text-xs", "uppercase", "tracking-wider", "font-bold", "text-slate-500"], ["title", "Add or update store social media links for this store", 1, "text-xs", "font-bold", "text-indigo-600", "hover:text-indigo-800", "flex", "items-center", "gap-1", "hover:underline", 3, "routerLink", "queryParams"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "gap-3"], [1, "p-6", "rounded-2xl", "bg-slate-50", "border", "border-dashed", "border-slate-200", "text-center"], [1, "text-xs", "uppercase", "tracking-wider", "font-bold", "text-slate-400", "mb-2"], [1, "flex", "flex-wrap", "gap-1.5"], [1, "px-2.5", "py-1", "rounded-lg", "bg-indigo-50", "text-indigo-700", "text-xs", "font-semibold"], [1, "pt-6", "border-t", "border-slate-100"], [1, "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-center", "justify-between", "gap-4", "mb-5"], [1, "text-sm", "font-bold", "text-slate-900", "flex", "items-center", "gap-2"], [1, "px-2", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "bg-amber-100", "text-amber-800", "border", "border-amber-200"], [1, "text-xs", "text-slate-500", "mt-0.5"], ["type", "button", 1, "px-3", "py-1.5", "rounded-xl", "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "cursor-pointer", "flex", "items-center", "gap-1.5", 3, "click"], [1, "p-3", "mb-4", "rounded-xl", "bg-emerald-50", "border", "border-emerald-200", "text-emerald-800", "text-xs", "font-semibold", "flex", "items-center", "gap-2"], [1, "p-5", "rounded-2xl", "bg-slate-50", "border", "border-slate-200", "mb-6"], [1, "space-y-3"], [1, "p-6", "text-center", "rounded-2xl", "bg-slate-50", "border", "border-slate-100"], [1, "p-4", "rounded-2xl", "bg-purple-50/70", "border", "border-purple-100", "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-center", "justify-between", "gap-3", "text-xs", "text-purple-900"], [1, "flex", "items-start", "gap-2.5"], [1, "text-lg"], [1, "font-bold", "text-purple-950"], [1, "text-purple-800", "leading-relaxed", "mt-0.5"], ["routerLink", "/create-store", 1, "px-4", "py-2", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-purple-600", "hover:bg-purple-700", "shadow-xs", "transition", "whitespace-nowrap", "self-end", "sm:self-auto"], [1, "text-slate-800"], ["type", "button", 1, "flex", "items-center", "gap-2", "px-3.5", "py-2", "rounded-xl", "text-xs", "font-bold", "transition", "border", "cursor-pointer", "whitespace-nowrap", 3, "click"], [1, "w-2", "h-2", "rounded-full"], [1, "text-[10px]", "px-1.5", "py-0.5", "rounded-md", "font-semibold"], [1, "text-[11px]"], ["type", "button", 1, "flex", "items-center", "gap-1.5", "px-3", "py-1.5", "rounded-xl", "text-xs", "font-bold", "transition", "cursor-pointer", "whitespace-nowrap", 3, "click"], ["type", "button", 1, "p-3", "rounded-2xl", "border", "text-left", "transition", "cursor-pointer", "flex", "flex-col", "justify-between", 3, "click"], [1, "flex", "items-center", "justify-between", "mb-1"], [1, "text-[10px]", "uppercase", "font-bold"], [1, "text-xs"], [1, "text-base", "sm:text-lg", "font-black", "block", "leading-none"], [1, "text-[10px]", "font-medium", "block", "mt-0.5"], [1, "text-[10px]", "text-emerald-600", "font-bold"], [1, "p-3.5", "rounded-2xl", "bg-slate-50", "border", "border-slate-200/80", "hover:border-indigo-300", "hover:bg-white", "hover:shadow-xs", "transition", "group", "flex", "flex-col", "justify-between", "gap-2.5"], [1, "flex", "items-center", "justify-between", "gap-2"], [1, "text-base"], [1, "text-xs", "font-bold", "text-slate-900"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "group-hover:translate-x-0.5", "group-hover:-translate-y-0.5", "transition-transform"], [1, "pt-1", "border-t", "border-slate-200/60"], ["target", "_blank", "rel", "noopener noreferrer", 1, "text-xs", "text-indigo-600", "hover:text-indigo-800", "font-medium", "truncate", "block", "flex", "items-center", "gap-1.5", "hover:underline", 3, "href", "title"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "text-slate-400", "flex-shrink-0"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"], [1, "truncate"], [1, "text-2xl", "block", "mb-1"], [1, "text-xs", "text-slate-600", "font-semibold", "mb-1"], [1, "text-[11px]", "text-slate-400", "mb-3"], [1, "inline-flex", "items-center", "gap-1.5", "px-3.5", "py-1.5", "rounded-xl", "bg-indigo-600", "text-white", "text-xs", "font-bold", "hover:bg-indigo-700", "transition", 3, "routerLink", "queryParams"], [1, "text-xs", "font-bold", "text-slate-800", "mb-3", "flex", "items-center", "justify-between"], [1, "text-[10px]", "text-slate-400"], ["type", "text", "placeholder", "e.g. Ramesh Krishnan, Priya Rao", 1, "w-full", "px-3.5", "py-2", "bg-white", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "text-amber-600", "font-extrabold"], [1, "text-[10px]", "font-normal", "text-slate-400", "ml-1"], [1, "flex", "items-center", "gap-1"], ["type", "button", 1, "p-1", "rounded-lg", "hover:scale-125", "transition", "text-base", "cursor-pointer"], ["type", "number", "min", "1.0", "max", "5.0", "step", "0.1", 1, "w-16", "ml-2", "px-2", "py-1", "bg-white", "border", "border-slate-200", "rounded-lg", "text-xs", "font-bold", "text-center", 3, "ngModelChange", "ngModel"], [1, "text-xs", "text-slate-400", "font-semibold"], ["rows", "2", "placeholder", "Client feedback on service quality, punctuality, or project outcome...", 1, "w-full", "px-3.5", "py-2", "bg-white", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "text-xs", "font-semibold", "text-rose-600", "bg-rose-50", "border", "border-rose-200", "p-2.5", "rounded-xl"], [1, "flex", "justify-end", "gap-2"], ["type", "button", 1, "px-3.5", "py-2", "rounded-xl", "text-xs", "font-semibold", "text-slate-600", "hover:bg-slate-200", "transition", 3, "click"], ["type", "button", 1, "px-4", "py-2", "bg-indigo-600", "hover:bg-indigo-700", "text-white", "text-xs", "font-bold", "rounded-xl", "shadow-xs", "transition", "cursor-pointer", 3, "click"], ["type", "button", 1, "p-1", "rounded-lg", "hover:scale-125", "transition", "text-base", "cursor-pointer", 3, "click"], [1, "p-4", "rounded-2xl", "border", "border-slate-200/90", "bg-slate-50/40", "hover:bg-white", "hover:border-indigo-200", "transition-all", "shadow-2xs"], [1, "flex", "items-start", "justify-between", "gap-3", "mb-2"], [1, "flex", "items-center", "gap-3"], [1, "w-9", "h-9", "rounded-full", "bg-gradient-to-tr", "from-indigo-500", "to-purple-600", "text-white", "font-bold", "text-xs", "flex", "items-center", "justify-center", "shadow-xs"], [1, "text-xs", "sm:text-sm", "font-bold", "text-slate-900"], [1, "px-2", "py-0.5", "rounded-full", "text-[9px]", "font-bold", "bg-emerald-50", "text-emerald-700", "border", "border-emerald-200"], [1, "text-[10px]", "text-slate-400", "font-medium"], [1, "flex", "items-center", "gap-1", "px-2.5", "py-1", "rounded-xl", "bg-amber-50", "border", "border-amber-200", "text-amber-900", "text-xs", "font-black"], [1, "text-[10px]", "text-amber-600", "font-normal"], [1, "pl-12", "text-xs", "text-slate-700", "leading-relaxed"], [1, "text-2xl", "mb-1", "block"], [1, "text-xs", "font-bold", "text-slate-800"], [1, "text-[11px]", "text-slate-500", "mt-1"]], template: function ProfileComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div")(4, "h1", 3);
            i0.ɵɵtext(5, "User Account & Profile");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 4);
            i0.ɵɵtext(7, " Unified Account \u2022 Search & hire services, or earn side-income with your own neighborhood store. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "div", 5)(9, "div", 6)(10, "span", 7);
            i0.ɵɵtext(11, "Store Status:");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(12, ProfileComponent_Conditional_12_Template, 2, 2, "span", 8)(13, ProfileComponent_Conditional_13_Template, 2, 0, "span", 9);
            i0.ɵɵelementStart(14, "button", 10);
            i0.ɵɵlistener("click", function ProfileComponent_Template_button_click_14_listener() { return ctx.storeService.toggleDemoStore(); });
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(16, "div", 11)(17, "div", 12)(18, "div", 13);
            i0.ɵɵelement(19, "span", 14);
            i0.ɵɵelementStart(20, "h2", 15);
            i0.ɵɵtext(21, "1. Basic Personal Details");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "button", 16);
            i0.ɵɵlistener("click", function ProfileComponent_Template_button_click_22_listener() { return ctx.toggleEditUser(); });
            i0.ɵɵtext(23);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(24, "div", 17)(25, "div", 18);
            i0.ɵɵelement(26, "img", 19);
            i0.ɵɵelementStart(27, "span", 20);
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(29, "div", 21);
            i0.ɵɵconditionalCreate(30, ProfileComponent_Conditional_30_Template, 51, 12, "div", 22)(31, ProfileComponent_Conditional_31_Template, 38, 9, "div", 23);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(32, "div", 11)(33, "div", 24)(34, "div", 25);
            i0.ɵɵelement(35, "span", 26);
            i0.ɵɵelementStart(36, "h2", 15);
            i0.ɵɵtext(37, "2. My Neighborhood Skill Stores");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(38, "span", 27);
            i0.ɵɵtext(39);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(40, "div", 13)(41, "a", 28)(42, "span");
            i0.ɵɵtext(43, "+ Open Another Store");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(44, ProfileComponent_Conditional_44_Template, 10, 0, "div", 29);
            i0.ɵɵconditionalCreate(45, ProfileComponent_Conditional_45_Template, 166, 58, "div", 30);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            let tmp_10_0;
            i0.ɵɵadvance(12);
            i0.ɵɵconditional(ctx.storeService.userStores().length > 0 ? 12 : 13);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", ctx.storeService.currentUser().hasStore ? "Switch to Regular User" : "\u26A1 Preview as Store Owner (2 Demo Stores)", " ");
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate1(" ", ctx.isEditingUser ? "Cancel Editing" : "\u270F\uFE0F Edit Details", " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("src", ctx.storeService.currentUser().avatarUrl);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("Member since ", ctx.storeService.currentUser().memberSince);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.isEditingUser ? 30 : 31);
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("bg-emerald-500", ctx.storeService.userStores().length > 0)("bg-amber-400", ctx.storeService.userStores().length === 0);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate2(" ", ctx.storeService.userStores().length, " ", ctx.storeService.userStores().length === 1 ? "Store" : "Stores", " Owned ");
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.storeService.userStores().length === 0 ? 44 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_10_0 = ctx.selectedStore()) ? 45 : -1, tmp_10_0);
        } }, dependencies: [CommonModule, i1.NgForOf, FormsModule, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.MinValidator, i2.MaxValidator, i2.NgModel, RouterLink, SocialMediaLinksComponent, i1.DecimalPipe], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ProfileComponent, [{
        type: Component,
        args: [{
                selector: 'app-profile',
                standalone: true,
                imports: [CommonModule, FormsModule, RouterLink, SocialMediaLinksComponent],
                template: `
    <div class="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Page Title & Unified Account Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">User Account & Profile</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Unified Account • Search & hire services, or earn side-income with your own neighborhood store.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Quick Test Toggle: switch store on/off for easy testing -->
            <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span class="text-xs font-semibold text-slate-600">Store Status:</span>
              @if (storeService.userStores().length > 0) {
                <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {{ storeService.userStores().length }} {{ storeService.userStores().length === 1 ? 'STORE' : 'STORES' }} ACTIVE
                </span>
              } @else {
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">NO STORES YET</span>
              }
              <button 
                type="button" 
                (click)="storeService.toggleDemoStore()"
                class="ml-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
              >
                {{ storeService.currentUser().hasStore ? 'Switch to Regular User' : '⚡ Preview as Store Owner (2 Demo Stores)' }}
              </button>
            </div>

          </div>
        </div>


        <!-- Section 1: Basic User Details (Always Present) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h2 class="text-base font-bold text-slate-900">1. Basic Personal Details</h2>
            </div>
            
            <button 
              type="button" 
              (click)="toggleEditUser()"
              class="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              {{ isEditingUser ? 'Cancel Editing' : '✏️ Edit Details' }}
            </button>
          </div>

          <div class="flex flex-col sm:flex-row items-start gap-6">
            <!-- Avatar -->
            <div class="flex flex-col items-center gap-2">
              <img 
                [src]="storeService.currentUser().avatarUrl" 
                alt="Avatar" 
                class="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
              />
              <span class="text-[11px] font-semibold text-slate-400">Member since {{ storeService.currentUser().memberSince }}</span>
            </div>

            <!-- Details or Edit Form -->
            <div class="flex-1 w-full">
              @if (!isEditingUser) {
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Full Name</span>
                    <span class="text-sm font-bold text-slate-800">{{ storeService.currentUser().name }}</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Email Address</span>
                    <span class="text-sm font-semibold text-slate-800">{{ storeService.currentUser().email }}</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Phone Number</span>
                    <span class="text-sm font-semibold text-slate-800">{{ storeService.currentUser().phone }}</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Location & Neighborhood</span>
                    <span class="text-sm font-semibold text-slate-800">
                      📍 {{ storeService.currentUser().area }}, {{ storeService.currentUser().city }}
                    </span>
                  </div>

                  <!-- Aadhaar Card Details -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Aadhaar Card (Identity)</span>
                      <span class="text-sm font-mono font-bold text-slate-800">
                        {{ storeService.currentUser().aadharNumber || 'Not linked' }}
                      </span>
                    </div>
                    @if (storeService.currentUser().aadharNumber) {
                      <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ Verified
                      </span>
                    }
                  </div>

                  <!-- PAN Card Details -->
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">PAN Card (Tax & Payouts)</span>
                      <span class="text-sm font-mono font-bold text-slate-800 uppercase">
                        {{ storeService.currentUser().panNumber || 'Not linked' }}
                      </span>
                    </div>
                    @if (storeService.currentUser().panNumber) {
                      <span class="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                        ✓ Linked
                      </span>
                    }
                  </div>

                  <div class="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Bio / Description</span>
                    <p class="text-xs text-slate-700 leading-relaxed">{{ storeService.currentUser().bio }}</p>
                  </div>

                  <!-- Personal Social Media Channels (UserSocialMediaLinks) -->
                  <div class="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div class="flex items-center justify-between mb-2.5">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">
                          Personal Social Media & Portfolios (Connect with Me)
                        </span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {{ getUserSocialLinks().length }} Added
                        </span>
                      </div>
                      <button
                        type="button"
                        (click)="startEditUser()"
                        class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        + Manage Links
                      </button>
                    </div>

                    @if (getUserSocialLinks().length > 0) {
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        @for (link of getUserSocialLinks(); track link.id || link.name + link.url) {
                          <div class="p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 transition flex items-center justify-between gap-2 shadow-2xs group">
                            <div class="flex items-center gap-2 min-w-0 pr-1">
                              <span class="text-base flex-shrink-0">{{ getSocialIcon(link.name) }}</span>
                              <div class="min-w-0">
                                <span class="text-xs font-bold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
                                  {{ link.name }}
                                </span>
                                <span class="text-[11px] text-slate-400 block truncate">
                                  {{ displayUrl(link.url) }}
                                </span>
                              </div>
                            </div>

                            <a 
                              [href]="formatUrl(link.url)" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex-shrink-0 {{ getSocialBadgeClass(link.name) }}"
                              title="Directly redirect to {{ link.name }}"
                            >
                              <span>Redirect</span>
                              <svg class="w-2.5 h-2.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                            </a>
                          </div>
                        }
                      </div>
                    } @else {
                      <p class="text-xs text-slate-400 italic">No personal social links added yet. Click "Edit Details" or "Manage Links" above to add your LinkedIn, GitHub, Instagram, or Portfolio.</p>
                    }
                  </div>
                </div>
              } @else {
                <!-- Edit Form -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        [(ngModel)]="editName" 
                        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        [(ngModel)]="editPhone" 
                        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Aadhaar Card Number</label>
                      <input 
                        type="text" 
                        [(ngModel)]="editAadhar" 
                        placeholder="e.g. XXXX-XXXX-8921 or 12 digits"
                        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">PAN Card Number</label>
                      <input 
                        type="text" 
                        [(ngModel)]="editPan" 
                        placeholder="e.g. ABCDE1234F (10 characters)"
                        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Area / Neighborhood</label>
                      <input 
                        type="text" 
                        [(ngModel)]="editArea" 
                        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">City</label>
                      <select 
                        [(ngModel)]="editCity" 
                        class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      >
                        <option *ngFor="let c of storeService.availableCities" [value]="c">{{ c }}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Bio</label>
                    <textarea 
                      [(ngModel)]="editBio" 
                      rows="2" 
                      class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    ></textarea>
                  </div>

                  <!-- Reusable Common Social Media Links Component for User -->
                  <div class="pt-4 border-t border-slate-100">
                    <app-social-media-links
                      title="Personal Social Media Links"
                      subtitle="Add your personal social media profiles so nearby customers, clients, and collaborators can connect with you directly."
                      idPrefix="user_link"
                      [(links)]="editUserSocialLinks"
                    />
                  </div>

                  <div class="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      (click)="isEditingUser = false"
                      class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      (click)="saveUserDetails()"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              }
            </div>

          </div>

        </div>

        <!-- Section 2: Neighborhood Skill Stores (1 User Can Have Multiple Stores) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full" [class.bg-emerald-500]="storeService.userStores().length > 0" [class.bg-amber-400]="storeService.userStores().length === 0"></span>
              <h2 class="text-base font-bold text-slate-900">2. My Neighborhood Skill Stores</h2>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {{ storeService.userStores().length }} {{ storeService.userStores().length === 1 ? 'Store' : 'Stores' }} Owned
              </span>
            </div>
            
            <div class="flex items-center gap-2">
              <a 
                routerLink="/create-store" 
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition transform active:scale-95"
              >
                <span>+ Open Another Store</span>
              </a>
            </div>
          </div>

          <!-- STATE A: User does NOT have any store yet -->
          @if (storeService.userStores().length === 0) {
            <div class="text-center py-8 px-4 max-w-lg mx-auto">
              <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                🏪
              </div>
              <h3 class="text-lg font-black text-slate-900 mb-2">You haven't opened a Skill Store yet</h3>
              <p class="text-xs text-slate-500 leading-relaxed mb-6">
                Are you looking for side-income or new to this city? Create one or multiple neighborhood stores to showcase your experience, hourly rates, social media links, and services.
              </p>
              
              <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a 
                  routerLink="/create-store" 
                  class="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition transform active:scale-95"
                >
                  🚀 Open Store & List Skills (2 min)
                </a>
              </div>
            </div>
          }

          <!-- STATE B: User HAS 1 or more stores -->
          @if (selectedStore(); as store) {
            <div class="space-y-6">
              
              <!-- Store Switcher Tabs (when user owns 1 or more stores) -->
              <div>
                <div class="flex items-center justify-between mb-2.5">
                  <span class="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Switch Active Store ({{ storeService.userStores().length }} total):
                  </span>
                  @if (storeService.userStores().length > 1) {
                    <span class="text-[11px] text-indigo-600 font-semibold">
                      Viewing: <strong class="text-slate-800">{{ store.storeName }}</strong>
                    </span>
                  }
                </div>

                <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  @for (st of storeService.userStores(); track st.id; let idx = $index) {
                    <button
                      type="button"
                      (click)="selectStore(st.id)"
                      class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer whitespace-nowrap"
                      [class.bg-indigo-600]="store.id === st.id"
                      [class.text-white]="store.id === st.id"
                      [class.border-indigo-600]="store.id === st.id"
                      [class.shadow-xs]="store.id === st.id"
                      [class.bg-slate-50]="store.id !== st.id"
                      [class.text-slate-700]="store.id !== st.id"
                      [class.border-slate-200]="store.id !== st.id"
                      [class.hover:bg-slate-100]="store.id !== st.id"
                    >
                      <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="st.isAvailable" [class.bg-rose-400]="!st.isAvailable"></span>
                      <span>{{ st.storeName }}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" [class.bg-white/20]="store.id === st.id" [class.text-white]="store.id === st.id" [class.bg-slate-200]="store.id !== st.id" [class.text-slate-700]="store.id !== st.id">
                        {{ st.category }}
                      </span>
                      <span class="text-[11px]">⭐ {{ st.rating }}</span>
                    </button>
                  }

                  <a 
                    routerLink="/create-store"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-dashed border-indigo-300 transition cursor-pointer whitespace-nowrap"
                    title="Add another store to your profile"
                  >
                    <span>+ Add Store</span>
                  </a>
                </div>
              </div>

              <!-- Selected Store Headline Header -->
              <div class="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/80 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-xl font-black text-slate-900">{{ store.storeName }}</h3>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      {{ store.category }}
                    </span>
                    <!-- Active / Paused Toggle Button for THIS store -->
                    <button 
                      type="button" 
                      (click)="storeService.toggleStoreAvailability(store.id)"
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer"
                      [class.bg-emerald-100]="store.isAvailable"
                      [class.text-emerald-800]="store.isAvailable"
                      [class.bg-rose-100]="!store.isAvailable"
                      [class.text-rose-800]="!store.isAvailable"
                    >
                      {{ store.isAvailable ? '✓ Active For Gigs' : '⏸ Paused' }}
                    </button>
                  </div>
                  <p class="text-xs font-semibold text-slate-700 mt-1">"{{ store.tagline }}"</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">
                    Operating in {{ store.area }}, {{ store.city }} • Serving within {{ store.serviceRadiusKm }} km
                  </p>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                  <a 
                    [routerLink]="['/stores', store.id]"
                    class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                  >
                    View Public Storefront →
                  </a>
                  <a 
                    [routerLink]="['/create-store']"
                    [queryParams]="{ editStoreId: store.id }"
                    class="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition"
                  >
                    ✏️ Edit
                  </a>
                  <button 
                    type="button" 
                    (click)="deleteStore(store.id)"
                    class="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                    title="Delete this store"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <!-- Key Store Metrics Grid: Experience, Hourly Rate, Starting Rate, Rating, Views -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Experience</span>
                  <span class="text-lg font-black text-slate-900">{{ store.experienceYears }} Years</span>
                </div>

                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hourly Charges</span>
                  <span class="text-lg font-black text-indigo-700">₹{{ store.hourlyRate }} <span class="text-xs font-normal text-slate-500">/hr</span></span>
                </div>

                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Starting Price</span>
                  <span class="text-lg font-black text-emerald-700">₹{{ store.startingPrice }}</span>
                </div>

                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Store Rating</span>
                  <span class="text-lg font-black text-amber-500">⭐ {{ store.rating }} <span class="text-xs font-normal text-slate-400">({{ store.reviewCount }})</span></span>
                </div>

                <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center col-span-2 sm:col-span-1">
                  <span class="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                    Views ({{ getEngagementShortLabel(selectedEngagementType()) }})
                  </span>
                  <span class="text-lg font-black text-indigo-900 flex items-center justify-center gap-1">
                    <span>👁️</span>
                    <span>{{ getStoreEngagement(store, selectedEngagementType()) | number }}</span>
                  </span>
                </div>
              </div>

              <!-- Store Level View Count & Engagement Section (Daily, Weekly, Monthly, Lifetime) -->
              <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 border border-indigo-100/90 shadow-xs">
                
                <!-- Panel Header with Interactive Type Filter Tabs -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-100/70">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xl">📈</span>
                      <h4 class="text-sm sm:text-base font-black text-slate-900">
                        Store Engagement & View Analytics
                      </h4>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Store Owner Portal
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">
                      Viewer analytics for <strong>{{ store.storeName }}</strong> filtered by selected engagement timeframe
                    </p>
                  </div>

                  <!-- Engagement Type Selector Buttons: Daily, Weekly, Monthly, Lifetime -->
                  <div class="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 self-start sm:self-auto overflow-x-auto scrollbar-none">
                    @for (opt of engagementOptions; track opt.type) {
                      <button
                        type="button"
                        (click)="selectEngagementType(opt.type)"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
                        [class.bg-indigo-600]="selectedEngagementType() === opt.type"
                        [class.text-white]="selectedEngagementType() === opt.type"
                        [class.shadow-xs]="selectedEngagementType() === opt.type"
                        [class.text-slate-600]="selectedEngagementType() !== opt.type"
                        [class.hover:text-slate-900]="selectedEngagementType() !== opt.type"
                      >
                        <span>{{ opt.icon }}</span>
                        <span>{{ opt.label }}</span>
                      </button>
                    }
                  </div>
                </div>

                <!-- Main View Metrics Display for Selected Type -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  
                  <!-- Highlight Card showing the active selected timeframe count -->
                  <div class="md:col-span-2 p-5 rounded-2xl bg-white border border-indigo-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <span class="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
                          <span>{{ selectedEngagementOption().icon }}</span>
                          <span class="uppercase tracking-wider text-[11px]">{{ selectedEngagementOption().label }} VIEW ENGAGEMENT</span>
                        </span>
                        <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Live Store Level
                        </span>
                      </div>

                      <div class="my-2">
                        <div class="flex items-baseline gap-2">
                          <span class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            {{ getStoreEngagement(store, selectedEngagementType()) | number }}
                          </span>
                          <span class="text-sm sm:text-base font-bold text-indigo-600">
                            {{ selectedEngagementOption().label }} Views
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {{ selectedEngagementOption().description }}. Neighborhood clients browse local gigs and discover {{ store.storeName }} in this window.
                        </p>
                      </div>
                    </div>

                    <!-- Quick simulation button for testing real-time increment -->
                    <div class="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span class="text-[11px] text-slate-400">
                        Test view counter:
                      </span>
                      <button
                        type="button"
                        (click)="simulateStoreView(store.id)"
                        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                        title="Simulate a neighborhood client visiting your store page"
                      >
                        <span>👁️</span>
                        <span>+ Simulate Store View (+1)</span>
                      </button>
                    </div>
                  </div>

                  <!-- 4-Type Mini Overview Cards / Fast Switchers -->
                  <div class="grid grid-cols-2 gap-2.5">
                    @for (opt of engagementOptions; track opt.type) {
                      <button
                        type="button"
                        (click)="selectEngagementType(opt.type)"
                        class="p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between"
                        [class.bg-indigo-600]="selectedEngagementType() === opt.type"
                        [class.text-white]="selectedEngagementType() === opt.type"
                        [class.border-indigo-600]="selectedEngagementType() === opt.type"
                        [class.shadow-xs]="selectedEngagementType() === opt.type"
                        [class.bg-white]="selectedEngagementType() !== opt.type"
                        [class.text-slate-700]="selectedEngagementType() !== opt.type"
                        [class.border-slate-200/80]="selectedEngagementType() !== opt.type"
                        [class.hover:border-indigo-300]="selectedEngagementType() !== opt.type"
                      >
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-[10px] uppercase font-bold" [class.text-indigo-200]="selectedEngagementType() === opt.type" [class.text-slate-400]="selectedEngagementType() !== opt.type">
                            {{ opt.label }}
                          </span>
                          <span class="text-xs">{{ opt.icon }}</span>
                        </div>
                        <div>
                          <span class="text-base sm:text-lg font-black block leading-none">
                            {{ getStoreEngagement(store, opt.type) | number }}
                          </span>
                          <span class="text-[10px] font-medium block mt-0.5" [class.text-indigo-100]="selectedEngagementType() === opt.type" [class.text-slate-400]="selectedEngagementType() !== opt.type">
                            {{ opt.shortLabel }}
                          </span>
                        </div>
                      </button>
                    }
                  </div>

                </div>

                <!-- Live simulation toast alert -->
                @if (viewSimulationToast) {
                  <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span>✓</span>
                      <span>{{ viewSimulationToast }}</span>
                    </div>
                    <span class="text-[10px] text-emerald-600 font-bold">Live Counter Bumped</span>
                  </div>
                }

              </div>

              <!-- Linked Store Social Media & Portfolios for this specific store -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs uppercase tracking-wider font-bold text-slate-500">
                      Linked Store Social Media & Portfolios ({{ store.storeName }})
                    </h4>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {{ getStoreSocialLinks(store).length }} Store Links Added
                    </span>
                  </div>

                  <a 
                    [routerLink]="['/create-store']"
                    [queryParams]="{ editStoreId: store.id }"
                    class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                    title="Add or update store social media links for this store"
                  >
                    <span>+ Add / Manage Store Links</span>
                  </a>
                </div>

                @if (getStoreSocialLinks(store).length > 0) {
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    @for (link of getStoreSocialLinks(store); track link.id || link.name + link.url) {
                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-white hover:shadow-xs transition group flex flex-col justify-between gap-2.5">
                        
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2">
                            <span class="text-base">{{ getSocialIcon(link.name) }}</span>
                            <span class="text-xs font-bold text-slate-900">{{ link.name }}</span>
                          </div>
                          
                          <!-- Direct redirect button / badge -->
                          <a 
                            [href]="formatUrl(link.url)" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs {{ getSocialBadgeClass(link.name) }}"
                            title="Directly redirect to {{ link.name }}"
                          >
                            <span>Redirect</span>
                            <svg class="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </a>
                        </div>

                        <!-- Direct clickable Link URL -->
                        <div class="pt-1 border-t border-slate-200/60">
                          <a 
                            [href]="formatUrl(link.url)" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="text-xs text-indigo-600 hover:text-indigo-800 font-medium truncate block flex items-center gap-1.5 hover:underline"
                            title="{{ link.url }}"
                          >
                            <svg class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                            </svg>
                            <span class="truncate">{{ displayUrl(link.url) }}</span>
                          </a>
                        </div>

                      </div>
                    }
                  </div>
                } @else {
                  <div class="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <span class="text-2xl block mb-1">🔗</span>
                    <p class="text-xs text-slate-600 font-semibold mb-1">No store social media links linked for {{ store.storeName }} yet</p>
                    <p class="text-[11px] text-slate-400 mb-3">Add links to your store's Instagram, LinkedIn, GitHub, or portfolio showcase so neighborhood clients can view your store credibility directly.</p>
                    <a 
                      [routerLink]="['/create-store']"
                      [queryParams]="{ editStoreId: store.id }"
                      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      + Add Store Social Media Links
                    </a>
                  </div>
                }
              </div>

              <!-- Skills listed for this store -->
              <div>
                <h4 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Offered Skills ({{ store.storeName }})</h4>
                <div class="flex flex-wrap gap-1.5">
                  @for (skill of store.skills; track skill) {
                    <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {{ skill }}
                    </span>
                  }
                </div>
              </div>

              <!-- Customer Reviews for this specific store -->
              <div class="pt-6 border-t border-slate-100">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>⭐ Reviews & Ratings for {{ store.storeName }}</span>
                      </h4>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Store Owner Portal Only
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Feedback and ratings from neighborhood clients for this store (Scale: 1.0 to 5.0)
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button 
                      type="button" 
                      (click)="isAddingReview = !isAddingReview"
                      class="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{{ isAddingReview ? '✕ Close Form' : '+ Add Test Review' }}</span>
                    </button>
                  </div>
                </div>

                <!-- Toast / Success alert -->
                @if (reviewSuccessMessage) {
                  <div class="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <span>✓</span>
                    <span>{{ reviewSuccessMessage }}</span>
                  </div>
                }

                <!-- Add Review Form (for Store Owner to simulate/record feedback) -->
                @if (isAddingReview) {
                  <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                    <h5 class="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
                      <span>Add Customer Feedback to {{ store.storeName }}</span>
                      <span class="text-[10px] text-slate-400">Min 1.0 • Max 5.0</span>
                    </h5>

                    <div class="space-y-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">Review User Name *</label>
                          <input 
                            type="text" 
                            [(ngModel)]="newReviewUserName" 
                            placeholder="e.g. Ramesh Krishnan, Priya Rao"
                            class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">
                            Rating Score: <span class="text-amber-600 font-extrabold">{{ newReviewRating | number:'1.1-1' }} ⭐</span>
                            <span class="text-[10px] font-normal text-slate-400 ml-1">(Min 1.0, Max 5.0)</span>
                          </label>
                          <div class="flex items-center gap-1">
                            @for (star of [1, 2, 3, 4, 5]; track star) {
                              <button 
                                type="button" 
                                (click)="setNewRating(star)"
                                class="p-1 rounded-lg hover:scale-125 transition text-base cursor-pointer"
                              >
                                {{ star <= newReviewRating ? '⭐' : '☆' }}
                              </button>
                            }
                            <input 
                              type="number" 
                              min="1.0" 
                              max="5.0" 
                              step="0.1" 
                              [(ngModel)]="newReviewRating" 
                              (ngModelChange)="setNewRating($event)"
                              class="w-16 ml-2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                            />
                            <span class="text-xs text-slate-400 font-semibold">/ 5.0</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">Review Message *</label>
                        <textarea 
                          [(ngModel)]="newReviewMessage" 
                          rows="2" 
                          placeholder="Client feedback on service quality, punctuality, or project outcome..."
                          class="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        ></textarea>
                      </div>

                      @if (reviewFormError) {
                        <p class="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                          ⚠️ {{ reviewFormError }}
                        </p>
                      }

                      <div class="flex justify-end gap-2">
                        <button 
                          type="button" 
                          (click)="isAddingReview = false"
                          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          (click)="submitStoreReview(store.id)"
                          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Save Review
                        </button>
                      </div>
                    </div>
                  </div>
                }

                <!-- Customer Reviews List for this store -->
                <div class="space-y-3">
                  @if (store.reviews && store.reviews.length > 0) {
                    @for (rev of store.reviews; track rev.id) {
                      <div class="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-200 transition-all shadow-2xs">
                        <div class="flex items-start justify-between gap-3 mb-2">
                          <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {{ rev.userName.slice(0, 2).toUpperCase() }}
                            </div>
                            <div>
                              <div class="flex items-center gap-2">
                                <h5 class="text-xs sm:text-sm font-bold text-slate-900">{{ rev.userName }}</h5>
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ Verified Review
                                </span>
                              </div>
                              <span class="text-[10px] text-slate-400 font-medium">{{ rev.date }}</span>
                            </div>
                          </div>

                          <!-- Rating Score Badge (1.0 to 5.0) -->
                          <div class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                            <span>⭐</span>
                            <span>{{ rev.rating | number:'1.1-1' }}</span>
                            <span class="text-[10px] text-amber-600 font-normal">/ 5.0</span>
                          </div>
                        </div>

                        <!-- Message -->
                        <div class="pl-12 text-xs text-slate-700 leading-relaxed">
                          "{{ rev.message }}"
                        </div>
                      </div>
                    }
                  } @else {
                    <div class="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100">
                      <span class="text-2xl mb-1 block">⭐</span>
                      <h5 class="text-xs font-bold text-slate-800">No customer reviews yet for {{ store.storeName }}</h5>
                      <p class="text-[11px] text-slate-500 mt-1">
                        When clients book your services and leave reviews (1.0 to 5.0 rating), they will appear here.
                      </p>
                    </div>
                  }
                </div>
              </div>

              <!-- Multi-Store Info & CTA Banner -->
              <div class="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-900">
                <div class="flex items-start gap-2.5">
                  <span class="text-lg">🏪</span>
                  <div>
                    <h5 class="font-bold text-purple-950">Multi-Store Feature Enabled</h5>
                    <p class="text-purple-800 leading-relaxed mt-0.5">
                      You can open and manage multiple specialized skill stores (e.g. Web Development, Video Editing, or Tutoring) under your single unified profile.
                    </p>
                  </div>
                </div>
                <a 
                  routerLink="/create-store"
                  class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition whitespace-nowrap self-end sm:self-auto"
                >
                  + Open Another Store
                </a>
              </div>

            </div>
          }

        </div>

      </div>
    </div>
  `
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ProfileComponent, { className: "ProfileComponent", filePath: "src/app/pages/profile/profile.ts", lineNumber: 920 }); })();
