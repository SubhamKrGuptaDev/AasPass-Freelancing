import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id;
function AuthPageComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "span");
    i0.ɵɵtext(2, "\u26A0\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.authService.authError());
} }
function AuthPageComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17)(1, "span");
    i0.ɵɵtext(2, "\u2713");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.authService.authSuccessMessage());
} }
function AuthPageComponent_Conditional_26_For_27_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵlistener("click", function AuthPageComponent_Conditional_26_For_27_Template_button_click_0_listener() { const demo_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.quickLogin(demo_r4.id)); });
    i0.ɵɵelementStart(1, "div", 37);
    i0.ɵɵelement(2, "img", 38);
    i0.ɵɵelementStart(3, "div")(4, "span", 39);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 40);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "span", 41);
    i0.ɵɵtext(9, " Log In \u2192 ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const demo_r4 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", demo_r4.avatarUrl);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", demo_r4.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", demo_r4.role, " ");
} }
function AuthPageComponent_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 21);
    i0.ɵɵlistener("submit", function AuthPageComponent_Conditional_26_Template_form_submit_0_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.onLoginSubmit($event)); });
    i0.ɵɵelementStart(1, "div")(2, "label", 22);
    i0.ɵɵtext(3, " Username or Email ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 23)(5, "div", 24);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(6, "svg", 25);
    i0.ɵɵelement(7, "path", 26);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(8, "input", 27);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_26_Template_input_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.loginInput, $event) || (ctx_r0.loginInput = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div")(10, "label", 22);
    i0.ɵɵtext(11, " Password ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 23)(13, "div", 24);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(14, "svg", 25);
    i0.ɵɵelement(15, "path", 28);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(16, "input", 29);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_26_Template_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.loginPassword, $event) || (ctx_r0.loginPassword = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "button", 30);
    i0.ɵɵlistener("click", function AuthPageComponent_Conditional_26_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.togglePasswordVisibility()); });
    i0.ɵɵelementStart(18, "span");
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(20, "button", 31);
    i0.ɵɵtext(21, " Sign In ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 32)(23, "span", 33);
    i0.ɵɵtext(24, " \u26A1 Quick 1-Click Demo Logins: ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 34);
    i0.ɵɵrepeaterCreate(26, AuthPageComponent_Conditional_26_For_27_Template, 10, 3, "button", 35, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(8);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.loginInput);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("type", ctx_r0.showPassword() ? "text" : "password");
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.loginPassword);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.showPassword() ? "\uD83D\uDE48" : "\uD83D\uDC41\uFE0F");
    i0.ɵɵadvance(7);
    i0.ɵɵrepeater(ctx_r0.authService.demoAccounts);
} }
function AuthPageComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 42);
    i0.ɵɵlistener("submit", function AuthPageComponent_Conditional_27_Template_form_submit_0_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.onSignupSubmit($event)); });
    i0.ɵɵelementStart(1, "div")(2, "label", 22);
    i0.ɵɵtext(3, " Full Name * ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 43);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_27_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.signupName, $event) || (ctx_r0.signupName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div")(6, "label", 22);
    i0.ɵɵtext(7, " Username or Email * ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "input", 44);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_27_Template_input_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.signupUsername, $event) || (ctx_r0.signupUsername = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 45)(10, "div")(11, "label", 22);
    i0.ɵɵtext(12, " City ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "select", 46);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_27_Template_select_ngModelChange_13_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.signupCity, $event) || (ctx_r0.signupCity = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementStart(14, "option", 47);
    i0.ɵɵtext(15, "Bengaluru");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "option", 48);
    i0.ɵɵtext(17, "Delhi NCR");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "option", 49);
    i0.ɵɵtext(19, "Mumbai");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "option", 50);
    i0.ɵɵtext(21, "Pune");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "option", 51);
    i0.ɵɵtext(23, "Hyderabad");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(24, "div")(25, "label", 22);
    i0.ɵɵtext(26, " Neighborhood Area ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "input", 52);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_27_Template_input_ngModelChange_27_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.signupArea, $event) || (ctx_r0.signupArea = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(28, "div")(29, "label", 22);
    i0.ɵɵtext(30, " Password * (Min 6 chars) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div", 23)(32, "input", 53);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_27_Template_input_ngModelChange_32_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.signupPassword, $event) || (ctx_r0.signupPassword = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "button", 30);
    i0.ɵɵlistener("click", function AuthPageComponent_Conditional_27_Template_button_click_33_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.togglePasswordVisibility()); });
    i0.ɵɵelementStart(34, "span");
    i0.ɵɵtext(35);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(36, "div")(37, "label", 22);
    i0.ɵɵtext(38, " Confirm Password * ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "input", 54);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener("ngModelChange", function AuthPageComponent_Conditional_27_Template_input_ngModelChange_39_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.signupConfirmPassword, $event) || (ctx_r0.signupConfirmPassword = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(40, "button", 55);
    i0.ɵɵtext(41, " Create Account & Sign In ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.signupName);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.signupUsername);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.signupCity);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(14);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.signupArea);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("type", ctx_r0.showPassword() ? "text" : "password");
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.signupPassword);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.showPassword() ? "\uD83D\uDE48" : "\uD83D\uDC41\uFE0F");
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.signupConfirmPassword);
    i0.ɵɵcontrol();
} }
export class AuthPageComponent {
    authService = inject(AuthService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    mode = signal('login', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mode" }] : /* istanbul ignore next */ []));
    isLoginMode = computed(() => this.mode() === 'login', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isLoginMode" }] : /* istanbul ignore next */ []));
    loginInput = 'aman';
    loginPassword = 'password123';
    showPassword = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "showPassword" }] : /* istanbul ignore next */ []));
    signupName = '';
    signupUsername = '';
    signupCity = 'Bengaluru';
    signupArea = 'Indiranagar';
    signupPassword = '';
    signupConfirmPassword = '';
    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/profile']);
            return;
        }
        const path = this.route.snapshot.routeConfig?.path;
        if (path === 'signup') {
            this.mode.set('signup');
        }
        else {
            this.mode.set('login');
        }
    }
    setMode(mode) {
        this.mode.set(mode);
        this.authService.authError.set(null);
        this.authService.authSuccessMessage.set(null);
    }
    togglePasswordVisibility() {
        this.showPassword.update(v => !v);
    }
    quickLogin(userId) {
        const success = this.authService.quickLogin(userId);
        if (success) {
            this.router.navigate(['/profile']);
        }
    }
    onLoginSubmit(event) {
        event.preventDefault();
        const res = this.authService.login(this.loginInput, this.loginPassword);
        if (res.success) {
            this.router.navigate(['/profile']);
        }
    }
    onSignupSubmit(event) {
        event.preventDefault();
        if (this.signupPassword !== this.signupConfirmPassword) {
            this.authService.authError.set('Passwords do not match. Please re-enter your password.');
            return;
        }
        const res = this.authService.signup({
            name: this.signupName,
            usernameOrEmail: this.signupUsername,
            password: this.signupPassword,
            city: this.signupCity,
            area: this.signupArea
        });
        if (res.success) {
            this.router.navigate(['/profile']);
        }
    }
    static ɵfac = function AuthPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AuthPageComponent, selectors: [["app-auth-page"]], decls: 32, vars: 22, consts: [[1, "min-h-screen", "bg-slate-50/70", "flex", "flex-col", "justify-center", "py-12", "sm:px-6", "lg:px-8", "relative", "overflow-hidden"], [1, "absolute", "inset-0", "overflow-hidden", "pointer-events-none", "opacity-30"], [1, "absolute", "-top-40", "-left-40", "w-96", "h-96", "rounded-full", "bg-indigo-500", "blur-3xl"], [1, "absolute", "bottom-10", "right-0", "w-80", "h-80", "rounded-full", "bg-pink-500", "blur-3xl"], [1, "sm:mx-auto", "sm:w-full", "sm:max-w-md", "relative", "z-10", "text-center", "px-4"], ["routerLink", "/", 1, "inline-flex", "items-center", "gap-2", "mb-6", "group"], [1, "w-12", "h-12", "rounded-2xl", "bg-gradient-to-tr", "from-indigo-600", "via-violet-600", "to-pink-500", "flex", "items-center", "justify-center", "text-white", "font-black", "text-2xl", "shadow-lg", "group-hover:scale-105", "transition-transform"], [1, "text-left"], [1, "text-2xl", "font-black", "tracking-tight", "text-slate-900", "group-hover:text-indigo-600", "transition-colors", "block"], [1, "text-[10px]", "uppercase", "tracking-wider", "font-bold", "text-indigo-600", "block", "-mt-1"], [1, "text-2xl", "sm:text-3xl", "font-extrabold", "text-slate-900", "tracking-tight"], [1, "mt-2", "text-xs", "sm:text-sm", "text-slate-500"], [1, "mt-8", "sm:mx-auto", "sm:w-full", "sm:max-w-md", "relative", "z-10", "px-4"], [1, "bg-white", "py-8", "px-6", "shadow-xl", "border", "border-slate-200/80", "rounded-3xl", "sm:px-10"], [1, "grid", "grid-cols-2", "p-1", "bg-slate-100", "rounded-2xl", "mb-6"], ["type", "button", 1, "py-2.5", "text-xs", "font-bold", "rounded-xl", "transition", "cursor-pointer", 3, "click"], [1, "p-3", "rounded-xl", "bg-rose-50", "border", "border-rose-200", "text-rose-700", "text-xs", "font-semibold", "mb-5", "flex", "items-center", "gap-2"], [1, "p-3", "rounded-xl", "bg-emerald-50", "border", "border-emerald-200", "text-emerald-800", "text-xs", "font-semibold", "mb-5", "flex", "items-center", "gap-2"], [1, "space-y-3.5"], [1, "text-center", "mt-6"], ["routerLink", "/", 1, "text-xs", "font-semibold", "text-slate-500", "hover:text-indigo-600", "transition", "inline-flex", "items-center", "gap-1"], [1, "space-y-4", 3, "submit"], [1, "block", "text-xs", "font-bold", "text-slate-700", "mb-1"], [1, "relative"], [1, "absolute", "inset-y-0", "left-0", "pl-3.5", "flex", "items-center", "pointer-events-none", "text-slate-400"], ["fill", "none", "stroke", "currentColor", "viewBox", "0 0 24 24", 1, "w-4", "h-4"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"], ["type", "text", "name", "loginInput", "required", "", "placeholder", "e.g. aman or aman.sharma@example.com", 1, "w-full", "pl-10", "pr-3", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "ngModel"], ["stroke-linecap", "round", "stroke-linejoin", "round", "stroke-width", "2", "d", "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"], ["name", "loginPassword", "required", "", "placeholder", "Enter your password", 1, "w-full", "pl-10", "pr-10", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "type", "ngModel"], ["type", "button", "title", "Toggle password view", 1, "absolute", "inset-y-0", "right-0", "pr-3", "flex", "items-center", "text-slate-400", "hover:text-slate-600", "cursor-pointer", 3, "click"], ["type", "submit", 1, "w-full", "py-3", "px-4", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-gradient-to-r", "from-indigo-600", "via-indigo-700", "to-purple-600", "hover:from-indigo-700", "hover:to-purple-700", "shadow-md", "shadow-indigo-500/20", "hover:shadow-lg", "transition", "transform", "active:scale-98", "cursor-pointer", "mt-2"], [1, "mt-6", "pt-5", "border-t", "border-slate-100"], [1, "text-[10px]", "uppercase", "font-bold", "text-slate-400", "block", "mb-2.5"], [1, "space-y-2"], ["type", "button", 1, "w-full", "flex", "items-center", "justify-between", "px-3", "py-2", "rounded-xl", "bg-slate-50", "hover:bg-indigo-50", "border", "border-slate-100", "hover:border-indigo-200", "transition", "text-left", "cursor-pointer", "group"], ["type", "button", 1, "w-full", "flex", "items-center", "justify-between", "px-3", "py-2", "rounded-xl", "bg-slate-50", "hover:bg-indigo-50", "border", "border-slate-100", "hover:border-indigo-200", "transition", "text-left", "cursor-pointer", "group", 3, "click"], [1, "flex", "items-center", "gap-2.5"], ["alt", "", 1, "w-7", "h-7", "rounded-full", "object-cover", 3, "src"], [1, "text-xs", "font-bold", "text-slate-800", "group-hover:text-indigo-600", "block"], [1, "text-[10px]", "text-slate-400", "block", "-mt-0.5"], [1, "text-xs", "font-bold", "text-indigo-600", "group-hover:translate-x-0.5", "transition-transform"], [1, "space-y-3.5", 3, "submit"], ["type", "text", "name", "signupName", "required", "", "placeholder", "e.g. Ananya Roy", 1, "w-full", "px-3", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "ngModel"], ["type", "text", "name", "signupUsername", "required", "", "placeholder", "e.g. ananya or ananya@example.com", 1, "w-full", "px-3", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "ngModel"], [1, "grid", "grid-cols-2", "gap-2"], ["name", "signupCity", 1, "w-full", "px-2.5", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-semibold", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", "cursor-pointer", 3, "ngModelChange", "ngModel"], ["value", "Bengaluru"], ["value", "Delhi NCR"], ["value", "Mumbai"], ["value", "Pune"], ["value", "Hyderabad"], ["type", "text", "name", "signupArea", "placeholder", "e.g. Koramangala", 1, "w-full", "px-3", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "ngModel"], ["name", "signupPassword", "required", "", "placeholder", "Create a strong password", 1, "w-full", "pl-3", "pr-10", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "type", "ngModel"], ["type", "password", "name", "signupConfirmPassword", "required", "", "placeholder", "Re-enter your password", 1, "w-full", "px-3", "py-2", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-xs", "font-medium", "text-slate-800", "focus:bg-white", "focus:outline-hidden", "focus:ring-2", "focus:ring-indigo-500", "transition", 3, "ngModelChange", "ngModel"], ["type", "submit", 1, "w-full", "py-3", "px-4", "rounded-xl", "text-xs", "font-bold", "text-white", "bg-gradient-to-r", "from-indigo-600", "via-indigo-700", "to-purple-600", "hover:from-indigo-700", "hover:to-purple-700", "shadow-md", "shadow-indigo-500/20", "hover:shadow-lg", "transition", "transform", "active:scale-98", "cursor-pointer", "mt-3"]], template: function AuthPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵelement(2, "div", 2)(3, "div", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "div", 4)(5, "a", 5)(6, "div", 6);
            i0.ɵɵtext(7, " AP ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "div", 7)(9, "span", 8);
            i0.ɵɵtext(10, " AasPass ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "span", 9);
            i0.ɵɵtext(12, " Hyperlocal Freelancing ");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(13, "h2", 10);
            i0.ɵɵtext(14);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "p", 11);
            i0.ɵɵtext(16);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div", 12)(18, "div", 13)(19, "div", 14)(20, "button", 15);
            i0.ɵɵlistener("click", function AuthPageComponent_Template_button_click_20_listener() { return ctx.setMode("login"); });
            i0.ɵɵtext(21, " Log In ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "button", 15);
            i0.ɵɵlistener("click", function AuthPageComponent_Template_button_click_22_listener() { return ctx.setMode("signup"); });
            i0.ɵɵtext(23, " Sign Up ");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(24, AuthPageComponent_Conditional_24_Template, 5, 1, "div", 16);
            i0.ɵɵconditionalCreate(25, AuthPageComponent_Conditional_25_Template, 5, 1, "div", 17);
            i0.ɵɵconditionalCreate(26, AuthPageComponent_Conditional_26_Template, 28, 4);
            i0.ɵɵconditionalCreate(27, AuthPageComponent_Conditional_27_Template, 42, 8, "form", 18);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "div", 19)(29, "a", 20)(30, "span");
            i0.ɵɵtext(31, "\u2190 Back to Explore Gigs");
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(14);
            i0.ɵɵtextInterpolate1(" ", ctx.isLoginMode() ? "Sign in to your account" : "Join your local community", " ");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", ctx.isLoginMode() ? "Connect with local clients and nearby neighborhood talent" : "Start hiring or list your skill storefront in minutes", " ");
            i0.ɵɵadvance(4);
            i0.ɵɵclassProp("bg-white", ctx.isLoginMode())("text-indigo-600", ctx.isLoginMode())("shadow-2xs", ctx.isLoginMode())("text-slate-600", !ctx.isLoginMode());
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("bg-white", !ctx.isLoginMode())("text-indigo-600", !ctx.isLoginMode())("shadow-2xs", !ctx.isLoginMode())("text-slate-600", ctx.isLoginMode());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.authService.authError() ? 24 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.authService.authSuccessMessage() ? 25 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.isLoginMode() ? 26 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.isLoginMode() ? 27 : -1);
        } }, dependencies: [CommonModule, FormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.NgModel, i1.NgForm, RouterLink], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthPageComponent, [{
        type: Component,
        args: [{
                selector: 'app-auth-page',
                standalone: true,
                imports: [CommonModule, FormsModule, RouterLink],
                template: `
    <div class="min-h-screen bg-slate-50/70 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500 blur-3xl"></div>
        <div class="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-pink-500 blur-3xl"></div>
      </div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <!-- Brand Link -->
        <a routerLink="/" class="inline-flex items-center gap-2 mb-6 group">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-105 transition-transform">
            AP
          </div>
          <div class="text-left">
            <span class="text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors block">
              AasPass
            </span>
            <span class="text-[10px] uppercase tracking-wider font-bold text-indigo-600 block -mt-1">
              Hyperlocal Freelancing
            </span>
          </div>
        </a>

        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ isLoginMode() ? 'Sign in to your account' : 'Join your local community' }}
        </h2>
        <p class="mt-2 text-xs sm:text-sm text-slate-500">
          {{ isLoginMode() 
            ? 'Connect with local clients and nearby neighborhood talent' 
            : 'Start hiring or list your skill storefront in minutes' }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div class="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl sm:px-10">
          
          <!-- Mode Tabs: Log In vs Sign Up -->
          <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
            <button 
              type="button"
              (click)="setMode('login')"
              class="py-2.5 text-xs font-bold rounded-xl transition cursor-pointer"
              [class.bg-white]="isLoginMode()"
              [class.text-indigo-600]="isLoginMode()"
              [class.shadow-2xs]="isLoginMode()"
              [class.text-slate-600]="!isLoginMode()"
            >
              Log In
            </button>
            <button 
              type="button"
              (click)="setMode('signup')"
              class="py-2.5 text-xs font-bold rounded-xl transition cursor-pointer"
              [class.bg-white]="!isLoginMode()"
              [class.text-indigo-600]="!isLoginMode()"
              [class.shadow-2xs]="!isLoginMode()"
              [class.text-slate-600]="isLoginMode()"
            >
              Sign Up
            </button>
          </div>

          <!-- Error Alert -->
          @if (authService.authError()) {
            <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-5 flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ authService.authError() }}</span>
            </div>
          }

          <!-- Success Alert -->
          @if (authService.authSuccessMessage()) {
            <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-5 flex items-center gap-2">
              <span>✓</span>
              <span>{{ authService.authSuccessMessage() }}</span>
            </div>
          }

          <!-- LOGIN FORM -->
          @if (isLoginMode()) {
            <form (submit)="onLoginSubmit($event)" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input 
                    type="text"
                    [(ngModel)]="loginInput"
                    name="loginInput"
                    required
                    placeholder="e.g. aman or aman.sharma@example.com"
                    class="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input 
                    [type]="showPassword() ? 'text' : 'password'"
                    [(ngModel)]="loginPassword"
                    name="loginPassword"
                    required
                    placeholder="Enter your password"
                    class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button 
                    type="button" 
                    (click)="togglePasswordVisibility()"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Toggle password view"
                  >
                    <span>{{ showPassword() ? '🙈' : '👁️' }}</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg transition transform active:scale-98 cursor-pointer mt-2"
              >
                Sign In
              </button>
            </form>

            <!-- Quick Demo Accounts -->
            <div class="mt-6 pt-5 border-t border-slate-100">
              <span class="text-[10px] uppercase font-bold text-slate-400 block mb-2.5">
                ⚡ Quick 1-Click Demo Logins:
              </span>
              <div class="space-y-2">
                @for (demo of authService.demoAccounts; track demo.id) {
                  <button 
                    type="button"
                    (click)="quickLogin(demo.id)"
                    class="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition text-left cursor-pointer group"
                  >
                    <div class="flex items-center gap-2.5">
                      <img [src]="demo.avatarUrl" alt="" class="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <span class="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block">
                          {{ demo.name }}
                        </span>
                        <span class="text-[10px] text-slate-400 block -mt-0.5">
                          {{ demo.role }}
                        </span>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      Log In →
                    </span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- SIGNUP FORM -->
          @if (!isLoginMode()) {
            <form (submit)="onSignupSubmit($event)" class="space-y-3.5">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input 
                  type="text"
                  [(ngModel)]="signupName"
                  name="signupName"
                  required
                  placeholder="e.g. Ananya Roy"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email *
                </label>
                <input 
                  type="text"
                  [(ngModel)]="signupUsername"
                  name="signupUsername"
                  required
                  placeholder="e.g. ananya or ananya@example.com"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <select 
                    [(ngModel)]="signupCity" 
                    name="signupCity"
                    class="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">
                    Neighborhood Area
                  </label>
                  <input 
                    type="text"
                    [(ngModel)]="signupArea"
                    name="signupArea"
                    placeholder="e.g. Koramangala"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Password * (Min 6 chars)
                </label>
                <div class="relative">
                  <input 
                    [type]="showPassword() ? 'text' : 'password'"
                    [(ngModel)]="signupPassword"
                    name="signupPassword"
                    required
                    placeholder="Create a strong password"
                    class="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button 
                    type="button" 
                    (click)="togglePasswordVisibility()"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Toggle password view"
                  >
                    <span>{{ showPassword() ? '🙈' : '👁️' }}</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <input 
                  type="password"
                  [(ngModel)]="signupConfirmPassword"
                  name="signupConfirmPassword"
                  required
                  placeholder="Re-enter your password"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <button 
                type="submit"
                class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-lg transition transform active:scale-98 cursor-pointer mt-3"
              >
                Create Account & Sign In
              </button>
            </form>
          }

        </div>

        <!-- Back to Home Link -->
        <div class="text-center mt-6">
          <a routerLink="/" class="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition inline-flex items-center gap-1">
            <span>← Back to Explore Gigs</span>
          </a>
        </div>
      </div>
    </div>
  `
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AuthPageComponent, { className: "AuthPageComponent", filePath: "src/app/pages/auth/auth-page.ts", lineNumber: 304 }); })();
