import { Component, inject, computed, signal, effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { formatSocialUrl, displaySocialUrl, getSocialIcon, getSocialBadgeClass, normalizeSocialLinks, ENGAGEMENT_TYPE_OPTIONS, getEngagementCount } from '../../models/store.model';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/common";
const _c0 = () => ["/create-store"];
const _c1 = a0 => ({ editStoreId: a0 });
const _c2 = () => [1, 2, 3, 4, 5];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.type;
const _forTrack2 = ($index, $item) => $item.id || $item.name + $item.url;
function StoreDetailComponent_Conditional_1_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26)(1, "a", 76)(2, "span", 77);
    i0.ɵɵtext(3, "\u270F\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 78);
    i0.ɵɵtext(5, "Edit My Store");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const s_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(2, _c0))("queryParams", i0.ɵɵpureFunction1(3, _c1, s_r2.id));
} }
function StoreDetailComponent_Conditional_1_For_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 33);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const skill_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", skill_r3, " ");
} }
function StoreDetailComponent_Conditional_1_For_67_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 82);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const srv_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u23F1\uFE0F ", srv_r5.duration, " ");
} }
function StoreDetailComponent_Conditional_1_For_67_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 40)(1, "div", 79)(2, "div", 80)(3, "h4", 81);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, StoreDetailComponent_Conditional_1_For_67_Conditional_5_Template, 2, 1, "span", 82);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 83);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 84)(9, "div", 85)(10, "span", 86);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 87);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_For_67_Template_button_click_12_listener() { const srv_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r5 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r5.selectService(srv_r5)); });
    i0.ɵɵtext(13, " Book Service ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const srv_r5 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", srv_r5.name, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(srv_r5.duration ? 5 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(srv_r5.description);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("\u20B9", srv_r5.price);
} }
function StoreDetailComponent_Conditional_1_Conditional_90_For_27_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 103);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_Conditional_90_For_27_Template_button_click_0_listener() { const opt_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r5 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r5.selectEngagementType(opt_r8.type)); });
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const opt_r8 = ctx.$implicit;
    const ctx_r5 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("bg-indigo-600", ctx_r5.selectedEngagementType() === opt_r8.type)("text-white", ctx_r5.selectedEngagementType() === opt_r8.type)("shadow-2xs", ctx_r5.selectedEngagementType() === opt_r8.type)("text-slate-600", ctx_r5.selectedEngagementType() !== opt_r8.type)("hover:text-slate-900", ctx_r5.selectedEngagementType() !== opt_r8.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opt_r8.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opt_r8.label);
} }
function StoreDetailComponent_Conditional_1_Conditional_90_For_30_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 104);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_Conditional_90_For_30_Template_div_click_0_listener() { const opt_r10 = i0.ɵɵrestoreView(_r9).$implicit; const ctx_r5 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r5.selectEngagementType(opt_r10.type)); });
    i0.ɵɵelementStart(1, "span", 105);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 106);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 107);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const opt_r10 = ctx.$implicit;
    const s_r2 = i0.ɵɵnextContext(2);
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bg-indigo-50", ctx_r5.selectedEngagementType() === opt_r10.type)("border-indigo-300", ctx_r5.selectedEngagementType() === opt_r10.type)("ring-2", ctx_r5.selectedEngagementType() === opt_r10.type)("ring-indigo-500/20", ctx_r5.selectedEngagementType() === opt_r10.type)("bg-slate-50", ctx_r5.selectedEngagementType() !== opt_r10.type)("border-slate-100", ctx_r5.selectedEngagementType() !== opt_r10.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", opt_r10.label, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 15, ctx_r5.getStoreEngagement(s_r2, opt_r10.type)), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", opt_r10.shortLabel, " ");
} }
function StoreDetailComponent_Conditional_1_Conditional_90_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 51)(1, "div", 88)(2, "div", 89)(3, "span", 90);
    i0.ɵɵtext(4, "\uD83D\uDC51");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div")(6, "div", 42)(7, "h4", 67);
    i0.ɵɵtext(8, "Store Owner Dashboard View");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 91);
    i0.ɵɵtext(10, "Owner Portal");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "p", 92);
    i0.ɵɵtext(12, " You are viewing your own storefront. Track your neighborhood engagement views across timeframes below. ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "a", 93)(14, "span");
    i0.ɵɵtext(15, "\u2699\uFE0F Manage in Profile \u2192");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "div", 94)(17, "div", 95)(18, "div")(19, "span", 96);
    i0.ɵɵtext(20, " Store Views by Type ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "span", 97);
    i0.ɵɵtext(22, " Active Timeframe: ");
    i0.ɵɵelementStart(23, "span", 98);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(25, "div", 99);
    i0.ɵɵrepeaterCreate(26, StoreDetailComponent_Conditional_1_Conditional_90_For_27_Template, 5, 12, "button", 100, _forTrack1);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 101);
    i0.ɵɵrepeaterCreate(29, StoreDetailComponent_Conditional_1_Conditional_90_For_30_Template, 8, 17, "div", 102, _forTrack1);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(24);
    i0.ɵɵtextInterpolate(ctx_r5.selectedEngagementType());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r5.engagementOptions);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r5.engagementOptions);
} }
function StoreDetailComponent_Conditional_1_Conditional_91_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 52)(1, "div", 108);
    i0.ɵɵtext(2, " \uD83D\uDD12 ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h4", 109);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 110);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 111);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_Conditional_91_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r11); const ctx_r5 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r5.authService.openLoginModal(ctx_r5.getCurrentUrl())); });
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9, "Log In to Leave a Review");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11, "\u2192");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const s_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" Log In to Review ", s_r2.ownerName, "'s Store ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" Have you worked with ", s_r2.ownerName, "? Sign in to share your neighborhood gig experience and rating. ");
} }
function StoreDetailComponent_Conditional_1_Conditional_92_For_23_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 129);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_Conditional_92_For_23_Template_button_click_0_listener() { const star_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r5 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r5.setRating(star_r14)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const star_r14 = ctx.$implicit;
    const ctx_r5 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("title", "Set " + star_r14 + ".0 rating");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", star_r14 <= ctx_r5.reviewRating ? "\u2B50" : "\u2606", " ");
} }
function StoreDetailComponent_Conditional_1_Conditional_92_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 126)(1, "span");
    i0.ɵɵtext(2, "\u26A0\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r5.reviewError);
} }
function StoreDetailComponent_Conditional_1_Conditional_92_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 53)(1, "div", 112)(2, "h3", 113)(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 114);
    i0.ɵɵtext(6, "Scale: 1.0 (min) to 5.0 (max)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 39)(8, "div", 115)(9, "div")(10, "label", 116);
    i0.ɵɵtext(11, " Review User Name * ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "input", 117);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function StoreDetailComponent_Conditional_1_Conditional_92_Template_input_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r5 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r5.reviewUserName, $event) || (ctx_r5.reviewUserName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div")(14, "label", 116);
    i0.ɵɵtext(15, " Rating: ");
    i0.ɵɵelementStart(16, "span", 118);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span", 119);
    i0.ɵɵtext(20, "(Min 1.0, Max 5.0)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 120);
    i0.ɵɵrepeaterCreate(22, StoreDetailComponent_Conditional_1_Conditional_92_For_23_Template, 2, 2, "button", 121, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(24, "div", 122)(25, "input", 123);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function StoreDetailComponent_Conditional_1_Conditional_92_Template_input_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r5 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r5.reviewRating, $event) || (ctx_r5.reviewRating = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function StoreDetailComponent_Conditional_1_Conditional_92_Template_input_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r5 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r5.setRating($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "span", 124);
    i0.ɵɵtext(27, "/ 5.0");
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(28, "div")(29, "label", 116);
    i0.ɵɵtext(30, " Review Message * ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "textarea", 125);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function StoreDetailComponent_Conditional_1_Conditional_92_Template_textarea_ngModelChange_31_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r5 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r5.reviewMessage, $event) || (ctx_r5.reviewMessage = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(32, StoreDetailComponent_Conditional_1_Conditional_92_Conditional_32_Template, 5, 1, "div", 126);
    i0.ɵɵelementStart(33, "div", 127)(34, "span", 63);
    i0.ɵɵtext(35);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 128);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_Conditional_92_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r12); const ctx_r5 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r5.submitReview()); });
    i0.ɵɵtext(37, " Submit Review ");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const s_r2 = i0.ɵɵnextContext();
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("\u270D\uFE0F Leave a Review for ", s_r2.ownerName);
    i0.ɵɵadvance(8);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r5.reviewUserName);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind2(18, 7, ctx_r5.reviewRating, "1.1-1"), " \u2B50");
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(i0.ɵɵpureFunction0(10, _c2));
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r5.reviewRating);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r5.reviewMessage);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r5.reviewError ? 32 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" Ratings directly update ", s_r2.ownerName, "'s neighborhood profile. ");
} }
function StoreDetailComponent_Conditional_1_Conditional_96_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 130)(1, "div", 131)(2, "div", 132)(3, "div", 133);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div")(6, "div", 42)(7, "h4", 134);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 135);
    i0.ɵɵtext(10, " \u2713 Verified Client ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "span", 136);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(13, "div", 137)(14, "span");
    i0.ɵɵtext(15, "\u2B50");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "span", 138);
    i0.ɵɵtext(20, "/ 5.0");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "div", 139);
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const rev_r15 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", rev_r15.userName.slice(0, 2).toUpperCase(), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(rev_r15.userName);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(rev_r15.date);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(18, 5, rev_r15.rating, "1.1-1"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" \"", rev_r15.message, "\" ");
} }
function StoreDetailComponent_Conditional_1_Conditional_96_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, StoreDetailComponent_Conditional_1_Conditional_96_For_1_Template, 23, 8, "div", 130, _forTrack0);
} if (rf & 2) {
    const s_r2 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(s_r2.reviews);
} }
function StoreDetailComponent_Conditional_1_Conditional_97_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 56)(1, "span", 140);
    i0.ɵɵtext(2, "\uD83D\uDCAC");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h4", 97);
    i0.ɵɵtext(4, "No customer reviews yet");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 141);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const s_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("Be the first client to book and review ", s_r2.ownerName, "'s store!");
} }
function StoreDetailComponent_Conditional_1_Conditional_134_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 146)(1, "div", 147)(2, "span", 148);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 149)(5, "span", 150);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 151);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "span")(10, "span");
    i0.ɵɵtext(11, "Redirect");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(12, "svg", 152);
    i0.ɵɵelement(13, "path", 153);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const link_r16 = ctx.$implicit;
    const ctx_r5 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("title", i0.ɵɵinterpolate1("Directly redirect to ", link_r16.name))("href", ctx_r5.formatUrl(link_r16.url), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r5.getSocialIcon(link_r16.name));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", link_r16.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r5.displayUrl(link_r16.url), " ");
    i0.ɵɵadvance();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 transition shadow-2xs ", ctx_r5.getSocialBadgeClass(link_r16.name)));
} }
function StoreDetailComponent_Conditional_1_Conditional_134_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 75)(1, "div", 142)(2, "h4", 143);
    i0.ɵɵtext(3, "Verified Store Channels");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 144);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 145);
    i0.ɵɵrepeaterCreate(7, StoreDetailComponent_Conditional_1_Conditional_134_For_8_Template, 14, 9, "a", 146, _forTrack2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const s_r2 = i0.ɵɵnextContext();
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", ctx_r5.getStoreSocialLinks(s_r2).length, " Channels ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r5.getStoreSocialLinks(s_r2));
} }
function StoreDetailComponent_Conditional_1_Conditional_135_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 157)(1, "div", 147)(2, "span", 148);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 149)(5, "span", 150);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 151);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "span")(10, "span");
    i0.ɵɵtext(11, "Connect \u2197");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const link_r17 = ctx.$implicit;
    const s_r2 = i0.ɵɵnextContext(2);
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵproperty("title", i0.ɵɵinterpolate2("Connect personally with ", s_r2.ownerName, " on ", link_r17.name))("href", ctx_r5.formatUrl(link_r17.url), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r5.getSocialIcon(link_r17.name));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", link_r17.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r5.displayUrl(link_r17.url), " ");
    i0.ɵɵadvance();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 transition shadow-2xs ", ctx_r5.getSocialBadgeClass(link_r17.name)));
} }
function StoreDetailComponent_Conditional_1_Conditional_135_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 75)(1, "div", 142)(2, "div", 154)(3, "span", 155);
    i0.ɵɵtext(4, "\uD83D\uDC64");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h4", 143);
    i0.ɵɵtext(6, "Connect with Owner");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "span", 156);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 145);
    i0.ɵɵrepeaterCreate(10, StoreDetailComponent_Conditional_1_Conditional_135_For_11_Template, 12, 10, "a", 157, _forTrack2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const s_r2 = i0.ɵɵnextContext();
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate1(" ", s_r2.ownerName, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r5.getOwnerUserSocialLinks(s_r2));
} }
function StoreDetailComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "div", 3)(2, "a", 4);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(3, "svg", 5);
    i0.ɵɵelement(4, "path", 6);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6, "Back to Directory");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(7, "div", 7)(8, "div", 8)(9, "div", 9)(10, "div", 10)(11, "div", 11)(12, "div", 12);
    i0.ɵɵelement(13, "img", 13);
    i0.ɵɵelementStart(14, "div", 14)(15, "div", 15)(16, "h1", 16);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span", 17);
    i0.ɵɵtext(19, " VERIFIED ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "p", 18);
    i0.ɵɵtext(21, " Managed by ");
    i0.ɵɵelementStart(22, "span", 19);
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 20)(26, "span", 21);
    i0.ɵɵelement(27, "span", 22);
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "span", 23);
    i0.ɵɵtext(30, "\u2022");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "span", 24);
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "span", 23);
    i0.ɵɵtext(34, "\u2022");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "span", 25)(36, "span");
    i0.ɵɵtext(37, "\uD83D\uDC41\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "span");
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "number");
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵconditionalCreate(41, StoreDetailComponent_Conditional_1_Conditional_41_Template, 6, 5, "div", 26);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "div", 27)(43, "p", 28);
    i0.ɵɵtext(44);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "div", 29)(46, "h3", 30);
    i0.ɵɵtext(47, "About the Store & Freelancer");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "p", 31);
    i0.ɵɵtext(49);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(50, "div")(51, "h3", 30);
    i0.ɵɵtext(52, "Core Skills & Tools");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "div", 32);
    i0.ɵɵrepeaterCreate(54, StoreDetailComponent_Conditional_1_For_55_Template, 2, 1, "span", 33, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(56, "div", 34)(57, "div", 35)(58, "div")(59, "h2", 36);
    i0.ɵɵtext(60, "Services & Gig Packages");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(61, "p", 37);
    i0.ɵɵtext(62, "Standard rates for direct neighborhood bookings");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(63, "span", 38);
    i0.ɵɵtext(64);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(65, "div", 39);
    i0.ɵɵrepeaterCreate(66, StoreDetailComponent_Conditional_1_For_67_Template, 14, 4, "div", 40, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(68, "div", 34)(69, "div", 41)(70, "div")(71, "div", 42)(72, "h2", 36);
    i0.ɵɵtext(73, "Store Owner Reviews & Ratings");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(74, "span", 43);
    i0.ɵɵtext(75, " 1.0 - 5.0 RATING ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(76, "p", 44);
    i0.ɵɵtext(77, "Verified feedback from neighborhood clients");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(78, "div", 45)(79, "span", 46);
    i0.ɵɵtext(80, "\u2B50");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(81, "div")(82, "div", 47)(83, "span", 48);
    i0.ɵɵtext(84);
    i0.ɵɵpipe(85, "number");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(86, "span", 49);
    i0.ɵɵtext(87, "/ 5.0");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(88, "span", 50);
    i0.ɵɵtext(89);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(90, StoreDetailComponent_Conditional_1_Conditional_90_Template, 31, 1, "div", 51)(91, StoreDetailComponent_Conditional_1_Conditional_91_Template, 12, 2, "div", 52)(92, StoreDetailComponent_Conditional_1_Conditional_92_Template, 38, 11, "div", 53);
    i0.ɵɵelementStart(93, "div", 54)(94, "h3", 55);
    i0.ɵɵtext(95, " Recent Customer Ratings & Feedback ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(96, StoreDetailComponent_Conditional_1_Conditional_96_Template, 2, 0)(97, StoreDetailComponent_Conditional_1_Conditional_97_Template, 7, 1, "div", 56);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(98, "div", 57)(99, "div", 58)(100, "div", 59)(101, "div", 60)(102, "span", 61);
    i0.ɵɵtext(103, "Standard Hourly Rate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(104, "div")(105, "span", 62);
    i0.ɵɵtext(106);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(107, "span", 37);
    i0.ɵɵtext(108, "/hr");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(109, "p", 63);
    i0.ɵɵtext(110);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(111, "div", 64)(112, "div", 65)(113, "span", 66);
    i0.ɵɵtext(114, "\uD83D\uDCCD");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(115, "div")(116, "h4", 67);
    i0.ɵɵtext(117, "Hyperlocal Advantage");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(118, "p", 68);
    i0.ɵɵtext(119);
    i0.ɵɵelementStart(120, "strong");
    i0.ɵɵtext(121);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(122);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(123, "div", 69)(124, "button", 70);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_Template_button_click_124_listener() { i0.ɵɵrestoreView(_r1); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.triggerInquiry()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(125, "svg", 5);
    i0.ɵɵelement(126, "path", 71);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(127, "span");
    i0.ɵɵtext(128, "Message / Send Request");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(129, "button", 72);
    i0.ɵɵlistener("click", function StoreDetailComponent_Conditional_1_Template_button_click_129_listener() { i0.ɵɵrestoreView(_r1); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.triggerCall()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(130, "svg", 73);
    i0.ɵɵelement(131, "path", 74);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(132, "span");
    i0.ɵɵtext(133, "Request Phone Callback");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(134, StoreDetailComponent_Conditional_1_Conditional_134_Template, 9, 1, "div", 75);
    i0.ɵɵconditionalCreate(135, StoreDetailComponent_Conditional_1_Conditional_135_Template, 12, 1, "div", 75);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const s_r2 = ctx;
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("h-44 sm:h-56 bg-gradient-to-r ", s_r2.bannerGradient, " relative"));
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("src", s_r2.avatarUrl)("alt", s_r2.ownerName);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(s_r2.storeName);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(s_r2.ownerName);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u2022 ", s_r2.experienceYears, " years experience ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" Available in ", s_r2.area, ", ", s_r2.city, " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" \uD83D\uDCCD ", s_r2.distanceKm, " km away (Serves up to ", s_r2.serviceRadiusKm, " km) ");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("", i0.ɵɵpipeBind1(40, 28, s_r2.views?.lifetime || 0), " views");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r5.isOwner() ? 41 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" \"", s_r2.tagline, "\" ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", s_r2.description, " ");
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(s_r2.skills);
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate1(" ", s_r2.services.length, " Available Packages ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(s_r2.services);
    i0.ɵɵadvance(18);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(85, 30, s_r2.rating, "1.1-1"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", s_r2.reviews?.length || s_r2.reviewCount, " Client Reviews ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r5.isOwner() ? 90 : !ctx_r5.authService.isLoggedIn() ? 91 : 92);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(s_r2.reviews && s_r2.reviews.length > 0 ? 96 : 97);
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate1("\u20B9", s_r2.hourlyRate);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("Services start from \u20B9", s_r2.startingPrice);
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate1(" ", s_r2.ownerName, " is located just ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", s_r2.distanceKm, " km away");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" in ", s_r2.area, ". Ideal for fast turnaround or in-person work meetings. ");
    i0.ɵɵadvance(12);
    i0.ɵɵconditional(ctx_r5.getStoreSocialLinks(s_r2).length > 0 ? 134 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r5.getOwnerUserSocialLinks(s_r2).length > 0 ? 135 : -1);
} }
function StoreDetailComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "h2", 158);
    i0.ɵɵtext(2, "Store Not Found");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 159);
    i0.ɵɵtext(4, "Return to home");
    i0.ɵɵelementEnd()();
} }
function StoreDetailComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2)(1, "span", 160);
    i0.ɵɵtext(2, "\u2713");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 161);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r5.notificationMessage);
} }
export class StoreDetailComponent {
    route = inject(ActivatedRoute);
    routeParamMap = toSignal(this.route.paramMap);
    storeService = inject(StoreService);
    notificationMessage = null;
    formatUrl = formatSocialUrl;
    authService = inject(AuthService);
    router = inject(Router);
    displayUrl = displaySocialUrl;
    getSocialIcon = getSocialIcon;
    getSocialBadgeClass = getSocialBadgeClass;
    getStoreSocialLinks(store) {
        return normalizeSocialLinks(store.socialMediaLinks, store.storeSocialMediaLinks || store.userSocialLinks);
    }
    getOwnerUserSocialLinks(store) {
        const currentUser = this.storeService.currentUser();
        if (store.userId === currentUser.id) {
            return normalizeSocialLinks(currentUser.socialMediaLinks, currentUser.userSocialMediaLinks || currentUser.userSocialLinks);
        }
        return [];
    }
    getCurrentUrl() {
        return this.router.url;
    }
    // Review Form state
    reviewUserName = this.storeService.currentUser().name;
    reviewRating = 5.0;
    reviewMessage = '';
    reviewError = null;
    store = computed(() => {
        const params = this.routeParamMap();
        const id = params?.get('id') || this.route.snapshot.paramMap.get('id');
        return id ? this.storeService.getStoreById(id) : undefined;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "store" }] : /* istanbul ignore next */ []));
    isOwner = computed(() => {
        if (!this.authService.isLoggedIn())
            return false;
        const s = this.store();
        if (!s)
            return false;
        const currentUserId = this.storeService.currentUser().id;
        const userStores = this.storeService.userStores();
        return s.userId === currentUserId || userStores.some(us => us.id === s.id) || this.storeService.currentUser().store?.id === s.id;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isOwner" }] : /* istanbul ignore next */ []));
    // Engagement tracking state for store owner
    selectedEngagementType = signal('lifetime', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedEngagementType" }] : /* istanbul ignore next */ []));
    engagementOptions = ENGAGEMENT_TYPE_OPTIONS;
    selectEngagementType(type) {
        this.selectedEngagementType.set(type);
    }
    getStoreEngagement(store, type) {
        return getEngagementCount(store, type);
    }
    lastRecordedStoreId = null;
    constructor() {
        effect(() => {
            const s = this.store();
            const currentId = s?.id;
            if (currentId && this.lastRecordedStoreId !== currentId) {
                this.lastRecordedStoreId = currentId;
                untracked(() => {
                    this.storeService.recordStoreView(currentId);
                });
            }
        });
    }
    setRating(val) {
        const num = Number(val);
        if (isNaN(num)) {
            this.reviewRating = 5.0;
            return;
        }
        // Strictly enforce min 1.0 and max 5.0
        this.reviewRating = Math.max(1.0, Math.min(5.0, Math.round(num * 10) / 10));
    }
    submitReview() {
        const s = this.store();
        if (!s)
            return;
        if (!this.reviewUserName || !this.reviewUserName.trim()) {
            this.reviewError = 'Please provide the Review User Name.';
            return;
        }
        if (this.reviewRating < 1.0 || this.reviewRating > 5.0) {
            this.reviewError = 'Rating must be between 1.0 (minimum) and 5.0 (maximum).';
            return;
        }
        if (!this.reviewMessage || !this.reviewMessage.trim()) {
            this.reviewError = 'Please enter a review message.';
            return;
        }
        this.reviewError = null;
        this.storeService.addReview(s.id, {
            userName: this.reviewUserName.trim(),
            rating: this.reviewRating,
            message: this.reviewMessage.trim()
        });
        this.showToast(`Thank you! Your ${this.reviewRating.toFixed(1)}★ review for ${s.ownerName} was posted.`);
        this.reviewMessage = '';
    }
    selectService(srv) {
        this.showToast(`Request sent for "${srv.name}" (₹${srv.price}). The freelancer will contact you shortly!`);
    }
    triggerInquiry() {
        const s = this.store();
        if (s) {
            this.showToast(`Direct message sent to ${s.ownerName}! You can now coordinate nearby.`);
        }
    }
    triggerCall() {
        const s = this.store();
        if (s) {
            this.showToast(`Phone callback request shared with ${s.ownerName}.`);
        }
    }
    showToast(msg) {
        this.notificationMessage = msg;
        setTimeout(() => {
            this.notificationMessage = null;
        }, 4000);
    }
    static ɵfac = function StoreDetailComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || StoreDetailComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: StoreDetailComponent, selectors: [["app-store-detail"]], decls: 4, vars: 2, consts: [[1, "min-h-screen", "bg-slate-50/70", "pb-24"], [1, "max-w-md", "mx-auto", "text-center", "py-20"], [1, "fixed", "bottom-6", "right-6", "z-50", "bg-slate-900", "text-white", "px-5", "py-3.5", "rounded-2xl", "shadow-2xl", "flex", "items-center", "gap-3", "border", "border-slate-700", "animate-bounce"], [1, "max-w-6xl", "mx-auto", "px-4", "sm:px-6", "lg:px-8", "h-full", "flex", "items-end"], ["routerLink", "/", 1, "absolute", "top-6", "left-6", "inline-flex", "items-center", "gap-1.5", "px-3", "py-1.5", "rounded-full", "bg-black/30", "hover:bg-black/50", "text-white", "text-xs", "font-semibold", "backdrop-blur-md", "transition"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 19l-7-7m0 0l7-7m-7 7h18"], [1, "max-w-6xl", "mx-auto", "px-4", "sm:px-6", "lg:px-8", "-mt-16"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-8"], [1, "lg:col-span-2", "space-y-6"], [1, "bg-white", "rounded-3xl", "p-6", "sm:p-8", "border", "border-slate-200/80", "shadow-xs", "relative"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-4", "mb-6"], [1, "flex", "items-center", "gap-4", "min-w-0", "flex-1"], [1, "w-20", "h-20", "rounded-2xl", "object-cover", "ring-4", "ring-white", "shadow-md", "flex-shrink-0", 3, "src", "alt"], [1, "min-w-0", "flex-1"], [1, "flex", "flex-wrap", "items-center", "gap-2"], [1, "text-xl", "sm:text-2xl", "font-black", "text-slate-900", "leading-tight", "truncate"], [1, "inline-flex", "items-center", "px-2", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "bg-indigo-100", "text-indigo-700", "whitespace-nowrap", "flex-shrink-0"], [1, "text-sm", "font-medium", "text-slate-500", "mt-0.5", "truncate"], [1, "text-slate-800", "font-semibold"], [1, "flex", "flex-wrap", "items-center", "gap-2", "mt-1"], [1, "text-xs", "font-semibold", "text-emerald-600", "flex", "items-center", "gap-1", "whitespace-nowrap"], [1, "w-2", "h-2", "rounded-full", "bg-emerald-500"], [1, "text-xs", "text-slate-400", "hidden", "sm:inline"], [1, "text-xs", "font-medium", "text-slate-600", "whitespace-nowrap"], [1, "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "border", "border-indigo-100", "px-2", "py-0.5", "rounded-md", "whitespace-nowrap", "flex", "items-center", "gap-1"], [1, "flex-shrink-0", "self-start", "sm:self-center"], [1, "p-4", "rounded-2xl", "bg-slate-50", "border", "border-slate-100", "mb-6"], [1, "text-sm", "font-semibold", "text-slate-800"], [1, "mb-6"], [1, "text-xs", "uppercase", "tracking-wider", "font-bold", "text-slate-400", "mb-2"], [1, "text-sm", "text-slate-700", "leading-relaxed", "whitespace-pre-line"], [1, "flex", "flex-wrap", "gap-2"], [1, "px-3", "py-1", "rounded-xl", "bg-indigo-50", "text-indigo-700", "text-xs", "font-semibold"], [1, "bg-white", "rounded-3xl", "p-6", "sm:p-8", "border", "border-slate-200/80", "shadow-xs"], [1, "flex", "items-center", "justify-between", "mb-6"], [1, "text-lg", "font-bold", "text-slate-900"], [1, "text-xs", "text-slate-500"], [1, "text-xs", "font-semibold", "text-slate-600", "bg-slate-100", "px-3", "py-1", "rounded-full"], [1, "space-y-4"], [1, "p-5", "rounded-2xl", "border", "border-slate-200/90", "hover:border-indigo-400", "transition-all", "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-center", "justify-between", "gap-4", "group"], [1, "flex", "flex-col", "sm:flex-row", "items-start", "sm:items-center", "justify-between", "gap-4", "mb-6", "pb-5", "border-b", "border-slate-100"], [1, "flex", "items-center", "gap-2"], [1, "px-2.5", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "bg-amber-100", "text-amber-800", "border", "border-amber-200"], [1, "text-xs", "text-slate-500", "mt-0.5"], [1, "flex", "items-center", "gap-3", "bg-amber-50/80", "px-4", "py-2", "rounded-2xl", "border", "border-amber-200"], [1, "text-amber-500", "text-xl"], [1, "flex", "items-baseline", "gap-1"], [1, "text-xl", "font-black", "text-amber-950"], [1, "text-xs", "font-semibold", "text-slate-400"], [1, "text-[10px]", "font-semibold", "text-slate-500", "block"], [1, "p-5", "rounded-3xl", "bg-gradient-to-br", "from-indigo-50/90", "via-purple-50/50", "to-pink-50/40", "border", "border-indigo-100", "mb-6", "space-y-4", "shadow-xs"], [1, "p-6", "rounded-3xl", "bg-indigo-50/70", "border", "border-indigo-100", "text-center", "mb-6", "shadow-2xs"], [1, "p-5", "rounded-2xl", "bg-slate-50/80", "border", "border-slate-200/80", "mb-6"], [1, "space-y-3"], [1, "text-xs", "uppercase", "tracking-wider", "font-bold", "text-slate-400", "mb-3"], [1, "p-8", "text-center", "rounded-2xl", "bg-slate-50", "border", "border-slate-200/80"], [1, "space-y-6"], [1, "bg-white", "rounded-3xl", "p-6", "border", "border-slate-200/80", "shadow-xs", "sticky", "top-24"], [1, "pb-5", "border-b", "border-slate-100", "mb-5"], [1, "flex", "items-baseline", "justify-between", "mb-1"], [1, "text-xs", "text-slate-500", "font-semibold"], [1, "text-2xl", "font-black", "text-slate-900"], [1, "text-[11px]", "text-slate-400"], [1, "p-3.5", "rounded-2xl", "bg-indigo-50/80", "border", "border-indigo-100", "mb-5"], [1, "flex", "items-start", "gap-2.5"], [1, "text-lg"], [1, "text-xs", "font-bold", "text-indigo-950"], [1, "text-[11px]", "text-indigo-800", "leading-relaxed", "mt-0.5"], [1, "space-y-3", "mb-6"], ["type", "button", 1, "w-full", "py-3.5", "px-4", "rounded-xl", "text-sm", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-md", "shadow-indigo-600/20", "hover:shadow-indigo-600/30", "transition", "transform", "active:scale-98", "flex", "items-center", "justify-center", "gap-2", 3, "click"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"], ["type", "button", 1, "w-full", "py-3", "px-4", "rounded-xl", "text-xs", "font-bold", "text-slate-700", "bg-slate-100", "hover:bg-slate-200", "transition", "flex", "items-center", "justify-center", "gap-2", 3, "click"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3.5", "h-3.5", "text-slate-600"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"], [1, "pt-5", "border-t", "border-slate-100"], ["title", "Edit store details and social media links", 1, "inline-flex", "items-center", "justify-center", "gap-1.5", "px-4", "py-2.5", "rounded-xl", "text-xs", "font-bold", "text-indigo-700", "bg-indigo-50", "hover:bg-indigo-100", "border", "border-indigo-200", "transition", "shadow-2xs", "whitespace-nowrap", "cursor-pointer", 3, "routerLink", "queryParams"], [1, "text-sm"], [1, "whitespace-nowrap"], [1, "flex-1"], [1, "flex", "items-center", "gap-2", "mb-1"], [1, "font-bold", "text-slate-900", "text-sm", "sm:text-base", "group-hover:text-indigo-600", "transition-colors"], [1, "text-[10px]", "font-semibold", "text-slate-500", "bg-slate-100", "px-2", "py-0.5", "rounded-md"], [1, "text-xs", "text-slate-600"], [1, "flex", "items-center", "gap-4", "sm:flex-col", "sm:items-end", "w-full", "sm:w-auto", "justify-between", "border-t", "sm:border-t-0", "pt-3", "sm:pt-0", "border-slate-100"], [1, "text-right"], [1, "text-base", "sm:text-lg", "font-black", "text-indigo-700"], ["type", "button", 1, "px-4", "py-2", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-xs", "transition", 3, "click"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-3", "pb-3", "border-b", "border-indigo-100/70"], [1, "flex", "items-start", "gap-3"], [1, "text-xl"], [1, "px-2", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "bg-indigo-600", "text-white"], [1, "text-xs", "text-indigo-800", "leading-relaxed", "mt-0.5"], ["routerLink", "/profile", 1, "text-xs", "font-bold", "text-indigo-700", "hover:text-indigo-900", "bg-white", "px-3", "py-1.5", "rounded-xl", "border", "border-indigo-200", "transition", "shadow-2xs", "self-start", "sm:self-auto", "flex", "items-center", "gap-1"], [1, "bg-white/95", "backdrop-blur-xs", "rounded-2xl", "p-4", "border", "border-indigo-100/80", "shadow-2xs"], [1, "flex", "flex-col", "sm:flex-row", "sm:items-center", "justify-between", "gap-3", "mb-3"], [1, "text-[10px]", "uppercase", "tracking-wider", "font-bold", "text-slate-400", "block"], [1, "text-xs", "font-bold", "text-slate-800"], [1, "text-indigo-600", "capitalize", "font-extrabold"], [1, "flex", "items-center", "gap-1", "p-1", "bg-slate-100", "rounded-xl", "border", "border-slate-200/60", "overflow-x-auto", "scrollbar-none"], ["type", "button", 1, "px-2.5", "py-1", "rounded-lg", "text-xs", "font-bold", "transition", "cursor-pointer", "flex", "items-center", "gap-1", "whitespace-nowrap", 3, "bg-indigo-600", "text-white", "shadow-2xs", "text-slate-600", "hover:text-slate-900"], [1, "grid", "grid-cols-2", "sm:grid-cols-4", "gap-2.5"], [1, "p-2.5", "rounded-xl", "border", "transition", "cursor-pointer", 3, "bg-indigo-50", "border-indigo-300", "ring-2", "ring-indigo-500/20", "bg-slate-50", "border-slate-100"], ["type", "button", 1, "px-2.5", "py-1", "rounded-lg", "text-xs", "font-bold", "transition", "cursor-pointer", "flex", "items-center", "gap-1", "whitespace-nowrap", 3, "click"], [1, "p-2.5", "rounded-xl", "border", "transition", "cursor-pointer", 3, "click"], [1, "text-[10px]", "uppercase", "font-bold", "text-slate-400", "block", "mb-0.5"], [1, "text-base", "font-black", "text-slate-900"], [1, "text-[9px]", "text-slate-400", "block"], [1, "w-10", "h-10", "rounded-2xl", "bg-indigo-600", "text-white", "flex", "items-center", "justify-center", "mx-auto", "mb-2", "text-base", "font-bold", "shadow-xs"], [1, "text-sm", "font-bold", "text-slate-900", "mb-1"], [1, "text-xs", "text-slate-600", "mb-4", "max-w-sm", "mx-auto"], ["type", "button", 1, "inline-flex", "items-center", "gap-1.5", "px-4", "py-2", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "transition", "cursor-pointer", "shadow-xs", 3, "click"], [1, "flex", "items-center", "justify-between", "mb-4"], [1, "text-xs", "uppercase", "tracking-wider", "font-bold", "text-slate-800", "flex", "items-center", "gap-1.5"], [1, "text-[10px]", "font-semibold", "text-slate-400"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "gap-4"], [1, "block", "text-xs", "font-bold", "text-slate-700", "mb-1"], ["type", "text", "placeholder", "Your Name (e.g. Rahul Verma)", 1, "w-full", "px-3.5", "py-2.5", "bg-white", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "text-amber-600", "font-extrabold", "text-sm"], [1, "text-[10px]", "font-normal", "text-slate-400", "ml-1"], [1, "flex", "items-center", "gap-1"], ["type", "button", 1, "p-1", "rounded-lg", "hover:scale-125", "transition", "text-base", "cursor-pointer", 3, "title"], [1, "flex", "items-center", "gap-1", "ml-auto"], ["type", "number", "min", "1.0", "max", "5.0", "step", "0.1", 1, "w-16", "px-2", "py-1", "bg-white", "border", "border-slate-200", "rounded-lg", "text-xs", "font-bold", "text-center", 3, "ngModelChange", "ngModel"], [1, "text-xs", "text-slate-400", "font-semibold"], ["rows", "3", "placeholder", "Share details about the work done, punctuality, communication, or service quality...", 1, "w-full", "px-3.5", "py-2.5", "bg-white", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "p-3", "rounded-xl", "bg-rose-50", "border", "border-rose-200", "text-rose-700", "text-xs", "font-semibold", "flex", "items-center", "gap-2"], [1, "flex", "items-center", "justify-between", "pt-1"], ["type", "button", 1, "px-5", "py-2.5", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-xs", "hover:shadow-md", "transition", "active:scale-98", "cursor-pointer", 3, "click"], ["type", "button", 1, "p-1", "rounded-lg", "hover:scale-125", "transition", "text-base", "cursor-pointer", 3, "click", "title"], [1, "p-4", "rounded-2xl", "border", "border-slate-200/80", "bg-white", "hover:border-indigo-200", "transition-all", "shadow-2xs"], [1, "flex", "items-start", "justify-between", "gap-3", "mb-2"], [1, "flex", "items-center", "gap-3"], [1, "w-10", "h-10", "rounded-full", "bg-gradient-to-tr", "from-indigo-500", "to-purple-600", "text-white", "font-bold", "text-xs", "flex", "items-center", "justify-center", "shadow-xs"], [1, "text-sm", "font-bold", "text-slate-900"], [1, "px-2", "py-0.5", "rounded-full", "text-[10px]", "font-bold", "bg-emerald-50", "text-emerald-700", "border", "border-emerald-200"], [1, "text-[11px]", "text-slate-400", "font-medium"], [1, "flex", "items-center", "gap-1", "px-3", "py-1", "rounded-xl", "bg-amber-50", "border", "border-amber-200", "text-amber-900", "text-xs", "font-black"], [1, "text-[10px]", "text-amber-600", "font-normal"], [1, "pl-13", "text-xs", "text-slate-700", "leading-relaxed", "bg-slate-50/50", "p-3", "rounded-xl", "border", "border-slate-100"], [1, "text-2xl", "mb-1", "block"], [1, "text-[11px]", "text-slate-500", "mt-1"], [1, "flex", "items-center", "justify-between", "mb-3"], [1, "text-xs", "uppercase", "tracking-wider", "font-bold", "text-slate-400"], [1, "text-[10px]", "font-semibold", "text-slate-500", "bg-slate-100", "px-2", "py-0.5", "rounded-full"], [1, "flex", "flex-col", "gap-2"], ["target", "_blank", "rel", "noopener noreferrer", 1, "flex", "items-center", "justify-between", "p-2.5", "rounded-xl", "border", "border-slate-200/80", "bg-slate-50/70", "hover:bg-white", "hover:border-indigo-300", "hover:shadow-2xs", "transition", "group", 3, "href", "title"], [1, "flex", "items-center", "gap-2.5", "min-w-0", "pr-2"], [1, "text-base", "flex-shrink-0"], [1, "min-w-0"], [1, "text-xs", "font-bold", "text-slate-900", "block", "group-hover:text-indigo-600", "transition-colors"], [1, "text-[11px]", "text-slate-400", "truncate", "block"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-3", "h-3", "group-hover:translate-x-0.5", "group-hover:-translate-y-0.5", "transition-transform"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"], [1, "flex", "items-center", "gap-1.5"], [1, "text-xs"], [1, "text-[10px]", "font-bold", "text-indigo-700", "bg-indigo-50", "border", "border-indigo-100", "px-2", "py-0.5", "rounded-full"], ["target", "_blank", "rel", "noopener noreferrer", 1, "flex", "items-center", "justify-between", "p-2.5", "rounded-xl", "border", "border-indigo-100", "bg-indigo-50/40", "hover:bg-white", "hover:border-indigo-300", "hover:shadow-2xs", "transition", "group", 3, "href", "title"], [1, "text-lg", "font-bold", "text-slate-800"], ["routerLink", "/", 1, "text-xs", "text-indigo-600", "font-semibold", "mt-2", "inline-block"], [1, "text-emerald-400", "text-lg"], [1, "text-xs", "font-semibold"]], template: function StoreDetailComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵconditionalCreate(1, StoreDetailComponent_Conditional_1_Template, 136, 33)(2, StoreDetailComponent_Conditional_2_Template, 5, 0, "div", 1);
            i0.ɵɵconditionalCreate(3, StoreDetailComponent_Conditional_3_Template, 5, 1, "div", 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_0_0 = ctx.store()) ? 1 : 2, tmp_0_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.notificationMessage ? 3 : -1);
        } }, dependencies: [CommonModule, FormsModule, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.NgControlStatus, i1.MinValidator, i1.MaxValidator, i1.NgModel, RouterLink, i2.DecimalPipe], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(StoreDetailComponent, [{
        type: Component,
        args: [{
                selector: 'app-store-detail',
                standalone: true,
                imports: [CommonModule, FormsModule, RouterLink],
                template: `
    <div class="min-h-screen bg-slate-50/70 pb-24">
      
      @if (store(); as s) {
        
        <!-- Header Banner -->
        <div class="h-44 sm:h-56 bg-gradient-to-r {{ s.bannerGradient }} relative">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end">
            <!-- Back Button -->
            <a 
              routerLink="/" 
              class="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white text-xs font-semibold backdrop-blur-md transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Back to Directory</span>
            </a>
          </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left 2 Cols: Main Store Info & Services -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Store Profile Card -->
              <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div class="flex items-center gap-4 min-w-0 flex-1">
                    <img 
                      [src]="s.avatarUrl" 
                      [alt]="s.ownerName" 
                      class="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md flex-shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <h1 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight truncate">{{ s.storeName }}</h1>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 whitespace-nowrap flex-shrink-0">
                          VERIFIED
                        </span>
                      </div>
                      <p class="text-sm font-medium text-slate-500 mt-0.5 truncate">
                        Managed by <span class="text-slate-800 font-semibold">{{ s.ownerName }}</span> • {{ s.experienceYears }} years experience
                      </p>
                      <div class="flex flex-wrap items-center gap-2 mt-1">
                        <span class="text-xs font-semibold text-emerald-600 flex items-center gap-1 whitespace-nowrap">
                          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Available in {{ s.area }}, {{ s.city }}
                        </span>
                        <span class="text-xs text-slate-400 hidden sm:inline">•</span>
                        <span class="text-xs font-medium text-slate-600 whitespace-nowrap">
                          📍 {{ s.distanceKm }} km away (Serves up to {{ s.serviceRadiusKm }} km)
                        </span>
                        <span class="text-xs text-slate-400 hidden sm:inline">•</span>
                        <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md whitespace-nowrap flex items-center gap-1">
                          <span>👁️</span>
                          <span>{{ (s.views?.lifetime || 0) | number }} views</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Edit store shortcut if this is user's store (guaranteed single line and aligned) -->
                  @if (isOwner()) {
                    <div class="flex-shrink-0 self-start sm:self-center">
                      <a 
                        [routerLink]="['/create-store']"
                        [queryParams]="{ editStoreId: s.id }"
                        class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition shadow-2xs whitespace-nowrap cursor-pointer"
                        title="Edit store details and social media links"
                      >
                        <span class="text-sm">✏️</span>
                        <span class="whitespace-nowrap">Edit My Store</span>
                      </a>
                    </div>
                  }
                </div>

                <!-- Tagline -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                  <p class="text-sm font-semibold text-slate-800">
                    "{{ s.tagline }}"
                  </p>
                </div>

                <!-- Description / Bio -->
                <div class="mb-6">
                  <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">About the Store & Freelancer</h3>
                  <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {{ s.description }}
                  </p>
                </div>

                <!-- Skills -->
                <div>
                  <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Core Skills & Tools</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (skill of s.skills; track skill) {
                      <span class="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold">
                        {{ skill }}
                      </span>
                    }
                  </div>
                </div>

              </div>

              <!-- Available Gigs & Services List -->
              <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <h2 class="text-lg font-bold text-slate-900">Services & Gig Packages</h2>
                    <p class="text-xs text-slate-500">Standard rates for direct neighborhood bookings</p>
                  </div>
                  <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    {{ s.services.length }} Available Packages
                  </span>
                </div>

                <div class="space-y-4">
                  @for (srv of s.services; track srv.id) {
                    <div class="p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="font-bold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                            {{ srv.name }}
                          </h4>
                          @if (srv.duration) {
                            <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              ⏱️ {{ srv.duration }}
                            </span>
                          }
                        </div>
                        <p class="text-xs text-slate-600">{{ srv.description }}</p>
                      </div>

                      <div class="flex items-center gap-4 sm:flex-col sm:items-end w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div class="text-right">
                          <span class="text-base sm:text-lg font-black text-indigo-700">₹{{ srv.price }}</span>
                        </div>
                        <button 
                          type="button" 
                          (click)="selectService(srv)"
                          class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                        >
                          Book Service
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Store Owner Ratings & Customer Reviews Section -->
              <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-lg font-bold text-slate-900">Store Owner Reviews & Ratings</h2>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        1.0 - 5.0 RATING
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5">Verified feedback from neighborhood clients</p>
                  </div>

                  <!-- Average Rating Display -->
                  <div class="flex items-center gap-3 bg-amber-50/80 px-4 py-2 rounded-2xl border border-amber-200">
                    <span class="text-amber-500 text-xl">⭐</span>
                    <div>
                      <div class="flex items-baseline gap-1">
                        <span class="text-xl font-black text-amber-950">{{ s.rating | number:'1.1-1' }}</span>
                        <span class="text-xs font-semibold text-slate-400">/ 5.0</span>
                      </div>
                      <span class="text-[10px] font-semibold text-slate-500 block">
                        {{ (s.reviews?.length || s.reviewCount) }} Client Reviews
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Review Form or Store Owner Notice & Engagement Analytics -->
                @if (isOwner()) {
                  <div class="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-pink-50/40 border border-indigo-100 mb-6 space-y-4 shadow-xs">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/70">
                      <div class="flex items-start gap-3">
                        <span class="text-xl">👑</span>
                        <div>
                          <div class="flex items-center gap-2">
                            <h4 class="text-xs font-bold text-indigo-950">Store Owner Dashboard View</h4>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">Owner Portal</span>
                          </div>
                          <p class="text-xs text-indigo-800 leading-relaxed mt-0.5">
                            You are viewing your own storefront. Track your neighborhood engagement views across timeframes below.
                          </p>
                        </div>
                      </div>

                      <a 
                        routerLink="/profile" 
                        class="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 transition shadow-2xs self-start sm:self-auto flex items-center gap-1"
                      >
                        <span>⚙️ Manage in Profile →</span>
                      </a>
                    </div>

                    <!-- Store Engagement View Analytics for Owner -->
                    <div class="bg-white/95 backdrop-blur-xs rounded-2xl p-4 border border-indigo-100/80 shadow-2xs">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                            Store Views by Type
                          </span>
                          <span class="text-xs font-bold text-slate-800">
                            Active Timeframe: <span class="text-indigo-600 capitalize font-extrabold">{{ selectedEngagementType() }}</span>
                          </span>
                        </div>

                        <!-- Type Selector: Daily, Weekly, Monthly, Lifetime -->
                        <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto scrollbar-none">
                          @for (opt of engagementOptions; track opt.type) {
                            <button
                              type="button"
                              (click)="selectEngagementType(opt.type)"
                              class="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap"
                              [class.bg-indigo-600]="selectedEngagementType() === opt.type"
                              [class.text-white]="selectedEngagementType() === opt.type"
                              [class.shadow-2xs]="selectedEngagementType() === opt.type"
                              [class.text-slate-600]="selectedEngagementType() !== opt.type"
                              [class.hover:text-slate-900]="selectedEngagementType() !== opt.type"
                            >
                              <span>{{ opt.icon }}</span>
                              <span>{{ opt.label }}</span>
                            </button>
                          }
                        </div>
                      </div>

                      <!-- 4-Metrics Quick Grid -->
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        @for (opt of engagementOptions; track opt.type) {
                          <div 
                            (click)="selectEngagementType(opt.type)"
                            class="p-2.5 rounded-xl border transition cursor-pointer"
                            [class.bg-indigo-50]="selectedEngagementType() === opt.type"
                            [class.border-indigo-300]="selectedEngagementType() === opt.type"
                            [class.ring-2]="selectedEngagementType() === opt.type"
                            [class.ring-indigo-500/20]="selectedEngagementType() === opt.type"
                            [class.bg-slate-50]="selectedEngagementType() !== opt.type"
                            [class.border-slate-100]="selectedEngagementType() !== opt.type"
                          >
                            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              {{ opt.label }}
                            </span>
                            <span class="text-base font-black text-slate-900">
                              {{ getStoreEngagement(s, opt.type) | number }}
                            </span>
                            <span class="text-[9px] text-slate-400 block">
                              {{ opt.shortLabel }}
                            </span>
                          </div>
                        }
                      </div>

                    </div>
                  </div>
                } @else if (!authService.isLoggedIn()) {
                  <!-- Guest: Prompt to Log In to Submit Review -->
                  <div class="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-100 text-center mb-6 shadow-2xs">
                    <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 text-base font-bold shadow-xs">
                      🔒
                    </div>
                    <h4 class="text-sm font-bold text-slate-900 mb-1">
                      Log In to Review {{ s.ownerName }}'s Store
                    </h4>
                    <p class="text-xs text-slate-600 mb-4 max-w-sm mx-auto">
                      Have you worked with {{ s.ownerName }}? Sign in to share your neighborhood gig experience and rating.
                    </p>
                    <button 
                      type="button"
                      (click)="authService.openLoginModal(getCurrentUrl())"
                      class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-xs"
                    >
                      <span>Log In to Leave a Review</span>
                      <span>→</span>
                    </button>
                  </div>
                } @else {
                  <!-- Client Review Submission Form -->
                  <div class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 mb-6">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                        <span>✍️ Leave a Review for {{ s.ownerName }}</span>
                      </h3>
                      <span class="text-[10px] font-semibold text-slate-400">Scale: 1.0 (min) to 5.0 (max)</span>
                    </div>

                    <div class="space-y-4">
                      <!-- Row 1: Review User Name & Rating Selector -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">
                            Review User Name *
                          </label>
                          <input 
                            type="text" 
                            [(ngModel)]="reviewUserName" 
                            placeholder="Your Name (e.g. Rahul Verma)"
                            class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label class="block text-xs font-bold text-slate-700 mb-1">
                            Rating: <span class="text-amber-600 font-extrabold text-sm">{{ reviewRating | number:'1.1-1' }} ⭐</span>
                            <span class="text-[10px] font-normal text-slate-400 ml-1">(Min 1.0, Max 5.0)</span>
                          </label>
                          <div class="flex items-center gap-1">
                            @for (star of [1, 2, 3, 4, 5]; track star) {
                              <button 
                                type="button" 
                                (click)="setRating(star)"
                                class="p-1 rounded-lg hover:scale-125 transition text-base cursor-pointer"
                                [title]="'Set ' + star + '.0 rating'"
                              >
                                {{ star <= reviewRating ? '⭐' : '☆' }}
                              </button>
                            }
                            <!-- Number stepper input with strict min 1.0 and max 5.0 -->
                            <div class="flex items-center gap-1 ml-auto">
                              <input 
                                type="number" 
                                min="1.0" 
                                max="5.0" 
                                step="0.1" 
                                [(ngModel)]="reviewRating" 
                                (ngModelChange)="setRating($event)"
                                class="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                              />
                              <span class="text-xs text-slate-400 font-semibold">/ 5.0</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Row 2: Message -->
                      <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1">
                          Review Message *
                        </label>
                        <textarea 
                          [(ngModel)]="reviewMessage" 
                          rows="3" 
                          placeholder="Share details about the work done, punctuality, communication, or service quality..."
                          class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        ></textarea>
                      </div>

                      <!-- Validation error alert -->
                      @if (reviewError) {
                        <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                          <span>⚠️</span>
                          <span>{{ reviewError }}</span>
                        </div>
                      }

                      <div class="flex items-center justify-between pt-1">
                        <span class="text-[11px] text-slate-400">
                          Ratings directly update {{ s.ownerName }}'s neighborhood profile.
                        </span>
                        <button 
                          type="button" 
                          (click)="submitReview()"
                          class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs hover:shadow-md transition active:scale-98 cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  </div>
                }

                <!-- Customer Reviews List -->
                <div class="space-y-3">
                  <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
                    Recent Customer Ratings & Feedback
                  </h3>

                  @if (s.reviews && s.reviews.length > 0) {
                    @for (rev of s.reviews; track rev.id) {
                      <div class="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 transition-all shadow-2xs">
                        <div class="flex items-start justify-between gap-3 mb-2">
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {{ rev.userName.slice(0, 2).toUpperCase() }}
                            </div>
                            <div>
                              <div class="flex items-center gap-2">
                                <h4 class="text-sm font-bold text-slate-900">{{ rev.userName }}</h4>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ Verified Client
                                </span>
                              </div>
                              <span class="text-[11px] text-slate-400 font-medium">{{ rev.date }}</span>
                            </div>
                          </div>

                          <!-- Rating Score Badge (1.0 to 5.0) -->
                          <div class="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                            <span>⭐</span>
                            <span>{{ rev.rating | number:'1.1-1' }}</span>
                            <span class="text-[10px] text-amber-600 font-normal">/ 5.0</span>
                          </div>
                        </div>

                        <!-- Message -->
                        <div class="pl-13 text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          "{{ rev.message }}"
                        </div>
                      </div>
                    }
                  } @else {
                    <div class="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80">
                      <span class="text-2xl mb-1 block">💬</span>
                      <h4 class="text-xs font-bold text-slate-800">No customer reviews yet</h4>
                      <p class="text-[11px] text-slate-500 mt-1">Be the first client to book and review {{ s.ownerName }}'s store!</p>
                    </div>
                  }
                </div>

              </div>

            </div>

            <!-- Right 1 Col: Rates & Direct Contact Card -->
            <div class="space-y-6">
              
              <!-- Quick Booking / Rate Card -->
              <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs sticky top-24">
                
                <div class="pb-5 border-b border-slate-100 mb-5">
                  <div class="flex items-baseline justify-between mb-1">
                    <span class="text-xs text-slate-500 font-semibold">Standard Hourly Rate</span>
                    <div>
                      <span class="text-2xl font-black text-slate-900">₹{{ s.hourlyRate }}</span>
                      <span class="text-xs text-slate-500">/hr</span>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-400">Services start from ₹{{ s.startingPrice }}</p>
                </div>

                <!-- Neighborhood Advantage Pill -->
                <div class="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 mb-5">
                  <div class="flex items-start gap-2.5">
                    <span class="text-lg">📍</span>
                    <div>
                      <h4 class="text-xs font-bold text-indigo-950">Hyperlocal Advantage</h4>
                      <p class="text-[11px] text-indigo-800 leading-relaxed mt-0.5">
                        {{ s.ownerName }} is located just <strong>{{ s.distanceKm }} km away</strong> in {{ s.area }}. Ideal for fast turnaround or in-person work meetings.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Connect / Inquire Actions -->
                <div class="space-y-3 mb-6">
                  <button 
                    type="button" 
                    (click)="triggerInquiry()"
                    class="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>Message / Send Request</span>
                  </button>

                  <button 
                    type="button" 
                    (click)="triggerCall()"
                    class="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span>Request Phone Callback</span>
                  </button>
                </div>

                <!-- Verified Social Media & Portfolios (List of clickable links with direct redirect) -->
                <!-- Verified Store Social Media Links -->
                @if (getStoreSocialLinks(s).length > 0) {
                  <div class="pt-5 border-t border-slate-100">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="text-xs uppercase tracking-wider font-bold text-slate-400">Verified Store Channels</h4>
                      <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {{ getStoreSocialLinks(s).length }} Channels
                      </span>
                    </div>

                    <div class="flex flex-col gap-2">
                      @for (link of getStoreSocialLinks(s); track link.id || link.name + link.url) {
                        <a 
                          [href]="formatUrl(link.url)" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-indigo-300 hover:shadow-2xs transition group"
                          title="Directly redirect to {{ link.name }}"
                        >
                          <div class="flex items-center gap-2.5 min-w-0 pr-2">
                            <span class="text-base flex-shrink-0">{{ getSocialIcon(link.name) }}</span>
                            <div class="min-w-0">
                              <span class="text-xs font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                                {{ link.name }}
                              </span>
                              <span class="text-[11px] text-slate-400 truncate block">
                                {{ displayUrl(link.url) }}
                              </span>
                            </div>
                          </div>

                          <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 transition shadow-2xs {{ getSocialBadgeClass(link.name) }}">
                            <span>Redirect</span>
                            <svg class="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </span>
                        </a>
                      }
                    </div>
                  </div>
                }

                <!-- Connect with Store Owner Personal Social Links -->
                @if (getOwnerUserSocialLinks(s).length > 0) {
                  <div class="pt-5 border-t border-slate-100">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs">👤</span>
                        <h4 class="text-xs uppercase tracking-wider font-bold text-slate-400">Connect with Owner</h4>
                      </div>
                      <span class="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                        {{ s.ownerName }}
                      </span>
                    </div>

                    <div class="flex flex-col gap-2">
                      @for (link of getOwnerUserSocialLinks(s); track link.id || link.name + link.url) {
                        <a 
                          [href]="formatUrl(link.url)" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="flex items-center justify-between p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-white hover:border-indigo-300 hover:shadow-2xs transition group"
                          title="Connect personally with {{ s.ownerName }} on {{ link.name }}"
                        >
                          <div class="flex items-center gap-2.5 min-w-0 pr-2">
                            <span class="text-base flex-shrink-0">{{ getSocialIcon(link.name) }}</span>
                            <div class="min-w-0">
                              <span class="text-xs font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                                {{ link.name }}
                              </span>
                              <span class="text-[11px] text-slate-400 truncate block">
                                {{ displayUrl(link.url) }}
                              </span>
                            </div>
                          </div>

                          <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 transition shadow-2xs {{ getSocialBadgeClass(link.name) }}">
                            <span>Connect ↗</span>
                          </span>
                        </a>
                      }
                    </div>
                  </div>
                }

              </div>

            </div>

          </div>
        </div>

      } @else {
        <div class="max-w-md mx-auto text-center py-20">
          <h2 class="text-lg font-bold text-slate-800">Store Not Found</h2>
          <a routerLink="/" class="text-xs text-indigo-600 font-semibold mt-2 inline-block">Return to home</a>
        </div>
      }

      <!-- Interactive Inquiry Toast Notification -->
      @if (notificationMessage) {
        <div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <span class="text-emerald-400 text-lg">✓</span>
          <span class="text-xs font-semibold">{{ notificationMessage }}</span>
        </div>
      }

    </div>
  `
            }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(StoreDetailComponent, { className: "StoreDetailComponent", filePath: "src/app/pages/store-detail/store-detail.ts", lineNumber: 631 }); })();
