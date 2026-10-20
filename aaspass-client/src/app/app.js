import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { AuthModalComponent } from './components/auth-modal/auth-modal';
import * as i0 from "@angular/core";
export class App {
    static ɵfac = function App_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || App)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: App, selectors: [["app-root"]], decls: 16, vars: 0, consts: [[1, "min-h-screen", "flex", "flex-col", "bg-slate-50", "text-slate-800", "antialiased", "font-sans"], [1, "flex-1"], [1, "bg-white", "border-t", "border-slate-200/80", "py-8", "px-4", "sm:px-6", "lg:px-8", "text-xs", "text-slate-500"], [1, "max-w-7xl", "mx-auto", "flex", "flex-col", "sm:flex-row", "items-center", "justify-between", "gap-4"], [1, "flex", "items-center", "gap-2"], [1, "w-6", "h-6", "rounded-lg", "bg-indigo-600", "text-white", "font-bold", "flex", "items-center", "justify-center", "text-xs"], [1, "font-bold", "text-slate-800", "text-sm"], [1, "text-center", "sm:text-right"]], template: function App_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "app-navbar")(2, "app-auth-modal");
            i0.ɵɵelementStart(3, "main", 1);
            i0.ɵɵelement(4, "router-outlet");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "footer", 2)(6, "div", 3)(7, "div", 4)(8, "span", 5);
            i0.ɵɵtext(9, "AP");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "span", 6);
            i0.ɵɵtext(11, "AasPass");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "span");
            i0.ɵɵtext(13, "\u2022 Hyperlocal Freelancing & Nearby Gigs");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "p", 7);
            i0.ɵɵtext(15, " Empowering students, newcomers, and local freelancers with neighborhood trust. ");
            i0.ɵɵelementEnd()()()();
        } }, dependencies: [RouterOutlet, NavbarComponent, AuthModalComponent], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(App, [{
        type: Component,
        args: [{ selector: 'app-root', standalone: true, imports: [RouterOutlet, NavbarComponent, AuthModalComponent], template: "<div class=\"min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans\">\n  <!-- Persistent Navbar -->\n  <app-navbar />\n\n  <!-- Global Auth Popup Modal (Login / Sign Up) -->\n  <app-auth-modal />\n\n  <!-- Main View Area -->\n  <main class=\"flex-1\">\n    <router-outlet />\n  </main>\n\n  <!-- Modern Neighborhood Footer -->\n  <footer class=\"bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500\">\n    <div class=\"max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4\">\n      <div class=\"flex items-center gap-2\">\n        <span class=\"w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs\">AP</span>\n        <span class=\"font-bold text-slate-800 text-sm\">AasPass</span>\n        <span>\u2022 Hyperlocal Freelancing & Nearby Gigs</span>\n      </div>\n      <p class=\"text-center sm:text-right\">\n        Empowering students, newcomers, and local freelancers with neighborhood trust.\n      </p>\n    </div>\n  </footer>\n</div>\n" }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 13 }); })();
