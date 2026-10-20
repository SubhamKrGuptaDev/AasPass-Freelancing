import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { SocialMediaLinksComponent } from '../../components/social-media-links/social-media-links';
import { toStoreSocialMediaLinks, formatSocialUrl, displaySocialUrl, getSocialIcon, getSocialBadgeClass, normalizeSocialLinks } from '../../models/store.model';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id || $index;
function CreateStoreComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("\uD83C\uDFEA You currently manage ", ctx_r0.storeService.userStores().length, " store(s). This will add Store #", ctx_r0.storeService.userStores().length + 1, ".");
} }
function CreateStoreComponent_option_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cat_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", cat_r2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(cat_r2);
} }
function CreateStoreComponent_option_72_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const c_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", c_r3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(c_r3);
} }
function CreateStoreComponent_Conditional_115_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 59)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const link_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassMap(i0.ɵɵinterpolate1("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition shadow-2xs ", ctx_r0.getSocialBadgeClass(link_r4.name)));
    i0.ɵɵproperty("title", i0.ɵɵinterpolate1("Directly redirect to ", link_r4.name))("href", ctx_r0.formatUrl(link_r4.url), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.getSocialIcon(link_r4.name));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", link_r4.name, " \u2197");
} }
function CreateStoreComponent_Conditional_115_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CreateStoreComponent_Conditional_115_For_5_Conditional_0_Template, 5, 8, "a", 58);
} if (rf & 2) {
    const link_r4 = ctx.$implicit;
    i0.ɵɵconditional(link_r4.name && link_r4.url ? 0 : -1);
} }
function CreateStoreComponent_Conditional_115_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 48)(1, "span", 56);
    i0.ɵɵtext(2, "Social Profiles (Direct Redirect)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 57);
    i0.ɵɵrepeaterCreate(4, CreateStoreComponent_Conditional_115_For_5_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r0.socialMediaLinks);
} }
export class CreateStoreComponent {
    storeService = inject(StoreService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    availableCategories = [
        'Video & Editing',
        'Web & Tech',
        'Photography',
        'Tutoring & Education',
        'Graphics & Design',
        'Tech Support & Hardware'
    ];
    skillsInput = 'Short Reels, Adobe Premiere, Color Grading';
    isEditing = false;
    editingStoreId = '';
    formData = {
        storeName: 'QuickEdits Bangalore',
        tagline: 'Fast 24-hour turnaround Instagram reels and shorts for local creators',
        category: 'Video & Editing',
        experienceYears: 2,
        hourlyRate: 500,
        startingPrice: 350,
        area: 'Indiranagar',
        city: 'Bengaluru',
        serviceRadiusKm: 5,
        description: 'Specializing in fast video editing for neighborhood businesses, gyms, restaurants, and personal brands. Available for direct meetups and quick shoots.'
    };
    socialMediaLinks = [
        { id: 'sm-init-1', name: 'Instagram', url: 'https://instagram.com/myreels' },
        { id: 'sm-init-2', name: 'LinkedIn', url: 'https://linkedin.com/in/myprofile' },
        { id: 'sm-init-3', name: 'Portfolio', url: 'https://myportfolio.site' }
    ];
    formatUrl = formatSocialUrl;
    displayUrl = displaySocialUrl;
    getSocialIcon = getSocialIcon;
    getSocialBadgeClass = getSocialBadgeClass;
    ngOnInit() {
        this.route.queryParamMap.subscribe(params => {
            const editId = params.get('editStoreId');
            this.initForm(editId);
        });
    }
    initForm(editId) {
        const user = this.storeService.currentUser();
        if (editId) {
            const storeToEdit = this.storeService.getStoreById(editId);
            if (storeToEdit && (storeToEdit.userId === user.id || (user.stores || []).some(s => s.id === storeToEdit.id))) {
                this.isEditing = true;
                this.editingStoreId = storeToEdit.id;
                this.formData.storeName = storeToEdit.storeName;
                this.formData.tagline = storeToEdit.tagline;
                this.formData.category = storeToEdit.category;
                this.formData.experienceYears = storeToEdit.experienceYears;
                this.formData.hourlyRate = storeToEdit.hourlyRate;
                this.formData.startingPrice = storeToEdit.startingPrice;
                this.formData.area = storeToEdit.area;
                this.formData.city = storeToEdit.city;
                this.formData.serviceRadiusKm = storeToEdit.serviceRadiusKm;
                this.formData.description = storeToEdit.description;
                this.skillsInput = storeToEdit.skills.join(', ');
                const normalized = normalizeSocialLinks(storeToEdit.socialMediaLinks, storeToEdit.storeSocialMediaLinks || storeToEdit.userSocialLinks);
                if (normalized && normalized.length > 0) {
                    this.socialMediaLinks = normalized.map(l => ({ ...l }));
                }
                else {
                    this.socialMediaLinks = [];
                }
                return;
            }
        }
        // Creating a new store (either first store or an additional store!)
        this.isEditing = false;
        this.editingStoreId = '';
        this.formData.area = user.area || 'Indiranagar';
        this.formData.city = user.city || 'Bengaluru';
        const currentOwnedCount = this.storeService.userStores().length;
        if (currentOwnedCount > 0) {
            // Customize starter text for additional store
            this.formData.storeName = `${user.name.split(' ')[0]}'s Studio #${currentOwnedCount + 1}`;
            this.formData.tagline = 'Professional freelance services tailored for local clients';
            this.formData.category = 'Graphics & Design';
            this.skillsInput = 'Branding, Figma, Visual Design, Poster Design';
            this.formData.hourlyRate = 600;
            this.formData.startingPrice = 450;
            this.socialMediaLinks = [
                { id: 'sm-init-1', name: 'Instagram', url: '' },
                { id: 'sm-init-2', name: 'LinkedIn', url: '' }
            ];
        }
        else {
            this.formData.storeName = 'QuickEdits Bangalore';
            this.formData.tagline = 'Fast 24-hour turnaround Instagram reels and shorts for local creators';
            this.formData.category = 'Video & Editing';
            this.formData.experienceYears = 2;
            this.formData.hourlyRate = 500;
            this.formData.startingPrice = 350;
            this.skillsInput = 'Short Reels, Adobe Premiere, Color Grading';
            this.socialMediaLinks = [
                { id: 'sm-init-1', name: 'Instagram', url: 'https://instagram.com/myreels' },
                { id: 'sm-init-2', name: 'LinkedIn', url: 'https://linkedin.com/in/myprofile' },
                { id: 'sm-init-3', name: 'Portfolio', url: 'https://myportfolio.site' }
            ];
        }
    }
    addLink(presetName = '') {
        this.socialMediaLinks.push({
            id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: presetName,
            url: ''
        });
    }
    removeLink(index) {
        this.socialMediaLinks.splice(index, 1);
    }
    onSubmit() {
        const skills = this.skillsInput
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        const validSocialLinks = this.socialMediaLinks
            .map(l => ({
            id: l.id || ('sm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
            name: l.name.trim(),
            url: l.url.trim()
        }))
            .filter(l => l.name.length > 0 && l.url.length > 0);
        const storeSocialMediaLinks = toStoreSocialMediaLinks(validSocialLinks);
        if (this.isEditing && this.editingStoreId) {
            this.storeService.updateStore({
                storeName: this.formData.storeName,
                tagline: this.formData.tagline,
                category: this.formData.category,
                skills: skills.length ? skills : ['General Freelancer'],
                experienceYears: Number(this.formData.experienceYears) || 1,
                hourlyRate: Number(this.formData.hourlyRate) || 500,
                startingPrice: Number(this.formData.startingPrice) || 300,
                area: this.formData.area,
                city: this.formData.city,
                serviceRadiusKm: Number(this.formData.serviceRadiusKm) || 5,
                socialMediaLinks: validSocialLinks,
                storeSocialMediaLinks: storeSocialMediaLinks,
                userSocialLinks: storeSocialMediaLinks,
                description: this.formData.description
            }, this.editingStoreId);
            this.router.navigate(['/stores', this.editingStoreId]);
            return;
        }
        const initialServices = [
            {
                id: 's-initial-1',
                name: 'Single Package / Gig Delivery',
                price: this.formData.startingPrice,
                duration: '24 hours',
                description: 'Complete milestone delivery with revision and satisfaction guarantee.'
            },
            {
                id: 's-initial-2',
                name: 'Hourly Custom Work / Consultation',
                price: this.formData.hourlyRate,
                duration: 'Hourly',
                description: 'Dedicated one-on-one session or customized project milestone.'
            }
        ];
        const newStore = this.storeService.createStore({
            ownerName: this.storeService.currentUser().name,
            storeName: this.formData.storeName,
            tagline: this.formData.tagline,
            category: this.formData.category,
            skills: skills.length ? skills : ['General Freelancer'],
            experienceYears: Number(this.formData.experienceYears) || 1,
            hourlyRate: Number(this.formData.hourlyRate) || 500,
            startingPrice: Number(this.formData.startingPrice) || 300,
            area: this.formData.area,
            city: this.formData.city,
            distanceKm: 0.5,
            serviceRadiusKm: Number(this.formData.serviceRadiusKm) || 5,
            socialMediaLinks: validSocialLinks,
            storeSocialMediaLinks: storeSocialMediaLinks,
            userSocialLinks: storeSocialMediaLinks,
            description: this.formData.description,
            services: initialServices,
            avatarUrl: this.storeService.currentUser().avatarUrl,
            bannerGradient: 'from-indigo-600 via-purple-600 to-pink-500',
            isAvailable: true
        });
        // Navigate directly to the newly created store detail page!
        this.router.navigate(['/stores', newStore.id]);
    }
    static ɵfac = function CreateStoreComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CreateStoreComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CreateStoreComponent, selectors: [["app-create-store"]], decls: 131, vars: 31, consts: [[1, "min-h-screen", "bg-slate-50/70", "py-12", "px-4", "sm:px-6", "lg:px-8"], [1, "max-w-4xl", "mx-auto"], [1, "text-center", "mb-10"], [1, "inline-flex", "items-center", "gap-2", "px-3", "py-1", "rounded-full", "bg-indigo-50", "border", "border-indigo-200", "text-indigo-700", "text-xs", "font-bold", "uppercase", "tracking-wider", "mb-3"], [1, "text-3xl", "font-black", "text-slate-900", "tracking-tight"], [1, "text-sm", "text-slate-500", "max-w-xl", "mx-auto", "mt-2"], [1, "inline-flex", "items-center", "gap-2", "mt-3", "px-3.5", "py-1.5", "rounded-xl", "bg-purple-50", "text-purple-700", "border", "border-purple-200", "text-xs", "font-semibold"], [1, "grid", "grid-cols-1", "lg:grid-cols-3", "gap-8"], [1, "lg:col-span-2", "bg-white", "rounded-3xl", "p-6", "sm:p-8", "border", "border-slate-200/80", "shadow-xs", "space-y-6"], [1, "space-y-6", 3, "ngSubmit"], [1, "text-sm", "font-bold", "text-slate-900", "mb-4", "pb-2", "border-b", "border-slate-100", "flex", "items-center", "gap-2"], [1, "w-6", "h-6", "rounded-full", "bg-indigo-600", "text-white", "text-xs", "flex", "items-center", "justify-center", "font-bold"], [1, "space-y-4"], [1, "block", "text-xs", "font-bold", "text-slate-700", "mb-1"], ["type", "text", "name", "storeName", "required", "", "placeholder", "e.g. SnapEdit Studio, CodeCraft Mentorship", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "gap-4"], ["name", "category", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", "cursor-pointer", 3, "ngModelChange", "ngModel"], [3, "value", 4, "ngFor", "ngForOf"], ["type", "number", "name", "experienceYears", "min", "0", "max", "30", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], ["type", "text", "name", "tagline", "required", "", "placeholder", "e.g. High-converting Instagram reels & YouTube shorts for local brands", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], ["type", "text", "name", "skills", "placeholder", "e.g. Premiere Pro, CapCut, Color Grading, Sound Design", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "grid", "grid-cols-1", "sm:grid-cols-2", "gap-4", "mb-4"], [1, "relative"], [1, "absolute", "inset-y-0", "left-0", "pl-3.5", "flex", "items-center", "text-slate-400", "text-sm", "font-bold"], ["type", "number", "name", "hourlyRate", "required", "", "min", "100", "step", "50", 1, "w-full", "pl-8", "pr-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], ["type", "number", "name", "startingPrice", "required", "", "min", "100", "step", "50", 1, "w-full", "pl-8", "pr-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "grid", "grid-cols-1", "sm:grid-cols-3", "gap-4"], ["type", "text", "name", "area", "required", "", "placeholder", "e.g. Indiranagar", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], ["name", "city", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", "cursor-pointer", 3, "ngModelChange", "ngModel"], ["name", "serviceRadiusKm", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", "cursor-pointer", 3, "ngModelChange", "ngModel"], [3, "value"], ["title", "Store Social Media & Online Portfolios", "subtitle", "Add multiple social media and portfolio links specifically for this store. When clients view your store or profile, they can click directly to redirect to your store showcase.", "idPrefix", "store_link", 3, "linksChange", "badgeNumber", "links"], [1, "text-sm", "font-bold", "text-slate-900", "mb-2"], ["name", "description", "rows", "4", "placeholder", "Tell nearby clients about your background, what makes your work fast/reliable, and how you prefer meeting or coordinating...", 1, "w-full", "px-4", "py-2.5", "bg-slate-50", "border", "border-slate-200", "rounded-xl", "text-sm", "focus:bg-white", "focus:ring-2", "focus:ring-indigo-500", "focus:outline-hidden", 3, "ngModelChange", "ngModel"], [1, "pt-4", "border-t", "border-slate-100", "flex", "items-center", "justify-between", "gap-3"], ["routerLink", "/profile", 1, "px-4", "py-2.5", "rounded-xl", "text-xs", "font-bold", "text-slate-600", "hover:text-slate-800", "hover:bg-slate-100", "border", "border-slate-200", "transition", "cursor-pointer"], ["type", "submit", 1, "w-full", "sm:w-auto", "px-8", "py-3.5", "rounded-xl", "text-sm", "font-bold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "shadow-md", "shadow-indigo-600/20", "hover:shadow-indigo-600/30", "transition", "transform", "active:scale-98", "cursor-pointer"], [1, "sticky", "top-24"], [1, "text-xs", "font-bold", "uppercase", "tracking-wider", "text-slate-400", "block", "mb-2"], [1, "bg-white", "rounded-2xl", "border", "border-indigo-200", "overflow-hidden", "shadow-lg", "p-5"], [1, "flex", "items-center", "justify-between", "gap-2", "mb-3"], [1, "inline-flex", "items-center", "gap-1", "px-2.5", "py-1", "rounded-full", "text-[11px]", "font-semibold", "bg-emerald-50", "text-emerald-700", "border", "border-emerald-200"], [1, "text-xs", "font-bold", "text-amber-500"], [1, "flex", "items-start", "gap-3", "mb-3"], ["alt", "Avatar", 1, "w-12", "h-12", "rounded-xl", "object-cover", "ring-2", "ring-slate-100", 3, "src"], [1, "font-bold", "text-slate-900", "text-sm"], [1, "text-xs", "text-slate-500"], [1, "text-xs", "text-slate-700", "font-medium", "mb-3", "line-clamp-2"], [1, "mb-3", "pt-2.5", "border-t", "border-slate-100"], [1, "pt-3", "border-t", "border-slate-100", "flex", "items-center", "justify-between"], [1, "text-[10px]", "uppercase", "font-semibold", "text-slate-400", "block"], [1, "text-base", "font-extrabold", "text-indigo-700"], [1, "px-3", "py-1.5", "rounded-lg", "text-xs", "font-bold", "bg-indigo-50", "text-indigo-700"], [1, "mt-4", "p-4", "rounded-2xl", "bg-indigo-50/70", "border", "border-indigo-100", "text-xs", "text-indigo-900"], [1, "font-bold", "mb-1"], [1, "text-indigo-800", "leading-relaxed"], [1, "text-[10px]", "uppercase", "font-bold", "text-slate-400", "block", "mb-1.5"], [1, "flex", "flex-wrap", "gap-1"], ["target", "_blank", "rel", "noopener noreferrer", 3, "href", "class", "title"], ["target", "_blank", "rel", "noopener noreferrer", 3, "href", "title"]], template: function CreateStoreComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵtext(4, " Option A \u2022 Unified Account ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h1", 4);
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p", 5);
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(9, CreateStoreComponent_Conditional_9_Template, 3, 2, "div", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "div", 7)(11, "div", 8)(12, "form", 9);
            i0.ɵɵlistener("ngSubmit", function CreateStoreComponent_Template_form_ngSubmit_12_listener() { return ctx.onSubmit(); });
            i0.ɵɵelementStart(13, "div")(14, "h3", 10)(15, "span", 11);
            i0.ɵɵtext(16, "1");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "span");
            i0.ɵɵtext(18, "Store Name & Category");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(19, "div", 12)(20, "div")(21, "label", 13);
            i0.ɵɵtext(22, "Store / Brand Name *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "input", 14);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_input_ngModelChange_23_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.storeName, $event) || (ctx.formData.storeName = $event); return $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(24, "div", 15)(25, "div")(26, "label", 13);
            i0.ɵɵtext(27, "Freelance Category *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "select", 16);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_select_ngModelChange_28_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.category, $event) || (ctx.formData.category = $event); return $event; });
            i0.ɵɵtemplate(29, CreateStoreComponent_option_29_Template, 2, 2, "option", 17);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(30, "div")(31, "label", 13);
            i0.ɵɵtext(32, "Years of Experience");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "input", 18);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_input_ngModelChange_33_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.experienceYears, $event) || (ctx.formData.experienceYears = $event); return $event; });
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(34, "div")(35, "label", 13);
            i0.ɵɵtext(36, "Punchy Headline / Tagline *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(37, "input", 19);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_input_ngModelChange_37_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.tagline, $event) || (ctx.formData.tagline = $event); return $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(38, "div")(39, "label", 13);
            i0.ɵɵtext(40, "Key Skills (comma separated) *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "input", 20);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_input_ngModelChange_41_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.skillsInput, $event) || (ctx.skillsInput = $event); return $event; });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(42, "div")(43, "h3", 10)(44, "span", 11);
            i0.ɵɵtext(45, "2");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(46, "span");
            i0.ɵɵtext(47, "Pricing & Neighborhood Radius");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(48, "div", 21)(49, "div")(50, "label", 13);
            i0.ɵɵtext(51, "Hourly Charges (\u20B9) *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "div", 22)(53, "span", 23);
            i0.ɵɵtext(54, "\u20B9");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(55, "input", 24);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_input_ngModelChange_55_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.hourlyRate, $event) || (ctx.formData.hourlyRate = $event); return $event; });
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(56, "div")(57, "label", 13);
            i0.ɵɵtext(58, "Starting Price for Gigs (\u20B9) *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "div", 22)(60, "span", 23);
            i0.ɵɵtext(61, "\u20B9");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(62, "input", 25);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_input_ngModelChange_62_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.startingPrice, $event) || (ctx.formData.startingPrice = $event); return $event; });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(63, "div", 26)(64, "div")(65, "label", 13);
            i0.ɵɵtext(66, "Neighborhood / Area *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(67, "input", 27);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_input_ngModelChange_67_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.area, $event) || (ctx.formData.area = $event); return $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(68, "div")(69, "label", 13);
            i0.ɵɵtext(70, "City *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(71, "select", 28);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_select_ngModelChange_71_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.city, $event) || (ctx.formData.city = $event); return $event; });
            i0.ɵɵtemplate(72, CreateStoreComponent_option_72_Template, 2, 2, "option", 17);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(73, "div")(74, "label", 13);
            i0.ɵɵtext(75, "Operating Radius");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(76, "select", 29);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_select_ngModelChange_76_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.serviceRadiusKm, $event) || (ctx.formData.serviceRadiusKm = $event); return $event; });
            i0.ɵɵelementStart(77, "option", 30);
            i0.ɵɵtext(78, "5 km radius");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(79, "option", 30);
            i0.ɵɵtext(80, "10 km radius");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(81, "option", 30);
            i0.ɵɵtext(82, "20 km radius");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(83, "option", 30);
            i0.ɵɵtext(84, "Entire City");
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(85, "div")(86, "app-social-media-links", 31);
            i0.ɵɵtwoWayListener("linksChange", function CreateStoreComponent_Template_app_social_media_links_linksChange_86_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.socialMediaLinks, $event) || (ctx.socialMediaLinks = $event); return $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(87, "div")(88, "h3", 32);
            i0.ɵɵtext(89, "About Your Services & Workflow");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(90, "textarea", 33);
            i0.ɵɵcontrolCreate();
            i0.ɵɵtwoWayListener("ngModelChange", function CreateStoreComponent_Template_textarea_ngModelChange_90_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.formData.description, $event) || (ctx.formData.description = $event); return $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(91, "div", 34)(92, "a", 35);
            i0.ɵɵtext(93, " \u2190 Back to Profile ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(94, "button", 36);
            i0.ɵɵtext(95);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(96, "div", 12)(97, "div", 37)(98, "span", 38);
            i0.ɵɵtext(99, "Live Preview in Neighborhood");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(100, "div", 39)(101, "div", 40)(102, "span", 41);
            i0.ɵɵtext(103);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(104, "span", 42);
            i0.ɵɵtext(105, "\u2B50 5.0 (New)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(106, "div", 43);
            i0.ɵɵelement(107, "img", 44);
            i0.ɵɵelementStart(108, "div")(109, "h4", 45);
            i0.ɵɵtext(110);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(111, "p", 46);
            i0.ɵɵtext(112);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(113, "p", 47);
            i0.ɵɵtext(114);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(115, CreateStoreComponent_Conditional_115_Template, 6, 0, "div", 48);
            i0.ɵɵelementStart(116, "div", 49)(117, "div")(118, "span", 50);
            i0.ɵɵtext(119, "Rate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(120, "span", 51);
            i0.ɵɵtext(121);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(122, "span", 46);
            i0.ɵɵtext(123, "/hr");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(124, "span", 52);
            i0.ɵɵtext(125, " Active ");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(126, "div", 53)(127, "p", 54);
            i0.ɵɵtext(128, "\uD83D\uDCA1 Neighborhood Tip:");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(129, "p", 55);
            i0.ɵɵtext(130, " Adding your Instagram, LinkedIn, and portfolio links allows clients to view your previous work directly and builds 3x higher trust! ");
            i0.ɵɵelementEnd()()()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", ctx.isEditing ? "Edit Store: " + (ctx.formData.storeName || "My Skill Store") : ctx.storeService.userStores().length > 0 ? "Open Another Neighborhood Skill Store" : "Open Your Neighborhood Skill Store", " ");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", ctx.isEditing ? "Update your service packages, neighborhood operating radius, and social media links." : "Turn your skills into passive or side income. You can open and manage multiple stores under one unified account.", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.isEditing && ctx.storeService.userStores().length > 0 ? 9 : -1);
            i0.ɵɵadvance(14);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.storeName);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(5);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.category);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngForOf", ctx.availableCategories);
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.experienceYears);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.tagline);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.skillsInput);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(14);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.hourlyRate);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(7);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.startingPrice);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(5);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.area);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.city);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngForOf", ctx.storeService.availableCities);
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.serviceRadiusKm);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("value", 5);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", 10);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", 20);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", 50);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("badgeNumber", 3);
            i0.ɵɵtwoWayProperty("links", ctx.socialMediaLinks);
            i0.ɵɵadvance(4);
            i0.ɵɵtwoWayProperty("ngModel", ctx.formData.description);
            i0.ɵɵcontrol();
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", ctx.isEditing ? "\uD83D\uDCBE Update Store & Social Links" : "\uD83D\uDE80 Publish Store & Start Receiving Gigs", " ");
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate1(" \uD83D\uDCCD 0.5 km away \u2022 ", ctx.formData.area || "Your Area", " ");
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("src", ctx.storeService.currentUser().avatarUrl);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate1(" ", ctx.formData.storeName || "Your Store Name", " ");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate2(" by ", ctx.storeService.currentUser().name, " \u2022 ", ctx.formData.experienceYears, " yrs exp ");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", ctx.formData.tagline || "Your catchy tagline will appear here for nearby searchers.", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.socialMediaLinks.length > 0 ? 115 : -1);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1("\u20B9", ctx.formData.hourlyRate || 500);
        } }, dependencies: [CommonModule, i1.NgForOf, FormsModule, i2.ɵNgNoValidate, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.DefaultValueAccessor, i2.NumberValueAccessor, i2.SelectControlValueAccessor, i2.NgControlStatus, i2.NgControlStatusGroup, i2.RequiredValidator, i2.MinValidator, i2.MaxValidator, i2.NgModel, i2.NgForm, RouterLink, SocialMediaLinksComponent], encapsulation: 2 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CreateStoreComponent, [{
        type: Component,
        args: [{
                selector: 'app-create-store',
                standalone: true,
                imports: [CommonModule, FormsModule, RouterLink, SocialMediaLinksComponent],
                template: `
    <div class="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            Option A • Unified Account
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">
            {{ isEditing ? 'Edit Store: ' + (formData.storeName || 'My Skill Store') : (storeService.userStores().length > 0 ? 'Open Another Neighborhood Skill Store' : 'Open Your Neighborhood Skill Store') }}
          </h1>
          <p class="text-sm text-slate-500 max-w-xl mx-auto mt-2">
            {{ isEditing ? 'Update your service packages, neighborhood operating radius, and social media links.' : 'Turn your skills into passive or side income. You can open and manage multiple stores under one unified account.' }}
          </p>
          @if (!isEditing && storeService.userStores().length > 0) {
            <div class="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
              <span>🏪 You currently manage {{ storeService.userStores().length }} store(s). This will add Store #{{ storeService.userStores().length + 1 }}.</span>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Form (2 Columns) -->
          <div class="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            
            <form (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- Section 1: Basic Store Identity -->
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  <span>Store Name & Category</span>
                </h3>

                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Store / Brand Name *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.storeName" 
                      name="storeName" 
                      required 
                      placeholder="e.g. SnapEdit Studio, CodeCraft Mentorship"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Freelance Category *</label>
                      <select 
                        [(ngModel)]="formData.category" 
                        name="category" 
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                      >
                        <option *ngFor="let cat of availableCategories" [value]="cat">{{ cat }}</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                      <input 
                        type="number" 
                        [(ngModel)]="formData.experienceYears" 
                        name="experienceYears" 
                        min="0" 
                        max="30"
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Punchy Headline / Tagline *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.tagline" 
                      name="tagline" 
                      required 
                      placeholder="e.g. High-converting Instagram reels & YouTube shorts for local brands"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Key Skills (comma separated) *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="skillsInput" 
                      name="skills" 
                      placeholder="e.g. Premiere Pro, CapCut, Color Grading, Sound Design"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <!-- Section 2: Pricing & Location -->
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Pricing & Neighborhood Radius</span>
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Hourly Charges (₹) *</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">₹</span>
                      <input 
                        type="number" 
                        [(ngModel)]="formData.hourlyRate" 
                        name="hourlyRate" 
                        required 
                        min="100" 
                        step="50"
                        class="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Starting Price for Gigs (₹) *</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">₹</span>
                      <input 
                        type="number" 
                        [(ngModel)]="formData.startingPrice" 
                        name="startingPrice" 
                        required 
                        min="100" 
                        step="50"
                        class="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Neighborhood / Area *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.area" 
                      name="area" 
                      required 
                      placeholder="e.g. Indiranagar"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <select 
                      [(ngModel)]="formData.city" 
                      name="city" 
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      <option *ngFor="let c of storeService.availableCities" [value]="c">{{ c }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Operating Radius</label>
                    <select 
                      [(ngModel)]="formData.serviceRadiusKm" 
                      name="serviceRadiusKm" 
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      <option [value]="5">5 km radius</option>
                      <option [value]="10">10 km radius</option>
                      <option [value]="20">20 km radius</option>
                      <option [value]="50">Entire City</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 3: Store Social Media Links & Online Portfolios (Common Component) -->
              <div>
                <app-social-media-links
                  [badgeNumber]="3"
                  title="Store Social Media & Online Portfolios"
                  subtitle="Add multiple social media and portfolio links specifically for this store. When clients view your store or profile, they can click directly to redirect to your store showcase."
                  idPrefix="store_link"
                  [(links)]="socialMediaLinks"
                />
              </div>

              <!-- Section 4: Detailed Description -->
              <div>
                <h3 class="text-sm font-bold text-slate-900 mb-2">About Your Services & Workflow</h3>
                <textarea 
                  [(ngModel)]="formData.description" 
                  name="description" 
                  rows="4" 
                  placeholder="Tell nearby clients about your background, what makes your work fast/reliable, and how you prefer meeting or coordinating..."
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                ></textarea>
              </div>

              <!-- Submit Button & Navigation -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <a 
                  routerLink="/profile" 
                  class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  ← Back to Profile
                </a>
                <button 
                  type="submit" 
                  class="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition transform active:scale-98 cursor-pointer"
                >
                  {{ isEditing ? '💾 Update Store & Social Links' : '🚀 Publish Store & Start Receiving Gigs' }}
                </button>
              </div>

            </form>

          </div>

          <!-- Live Card Preview (1 Column) -->
          <div class="space-y-4">
            <div class="sticky top-24">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Live Preview in Neighborhood</span>
              
              <div class="bg-white rounded-2xl border border-indigo-200 overflow-hidden shadow-lg p-5">
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    📍 0.5 km away • {{ formData.area || 'Your Area' }}
                  </span>
                  <span class="text-xs font-bold text-amber-500">⭐ 5.0 (New)</span>
                </div>

                <div class="flex items-start gap-3 mb-3">
                  <img 
                    [src]="storeService.currentUser().avatarUrl" 
                    alt="Avatar" 
                    class="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <h4 class="font-bold text-slate-900 text-sm">
                      {{ formData.storeName || 'Your Store Name' }}
                    </h4>
                    <p class="text-xs text-slate-500">
                      by {{ storeService.currentUser().name }} • {{ formData.experienceYears }} yrs exp
                    </p>
                  </div>
                </div>

                <p class="text-xs text-slate-700 font-medium mb-3 line-clamp-2">
                  {{ formData.tagline || 'Your catchy tagline will appear here for nearby searchers.' }}
                </p>

                <!-- Live Preview of Social Media Links -->
                @if (socialMediaLinks.length > 0) {
                  <div class="mb-3 pt-2.5 border-t border-slate-100">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Social Profiles (Direct Redirect)</span>
                    <div class="flex flex-wrap gap-1">
                      @for (link of socialMediaLinks; track link.id || $index) {
                        @if (link.name && link.url) {
                          <a 
                            [href]="formatUrl(link.url)" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition shadow-2xs {{ getSocialBadgeClass(link.name) }}"
                            title="Directly redirect to {{ link.name }}"
                          >
                            <span>{{ getSocialIcon(link.name) }}</span>
                            <span>{{ link.name }} ↗</span>
                          </a>
                        }
                      }
                    </div>
                  </div>
                }

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] uppercase font-semibold text-slate-400 block">Rate</span>
                    <span class="text-base font-extrabold text-indigo-700">₹{{ formData.hourlyRate || 500 }}</span>
                    <span class="text-xs text-slate-500">/hr</span>
                  </div>
                  <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">
                    Active
                  </span>
                </div>
              </div>

              <!-- Tip card -->
              <div class="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                <p class="font-bold mb-1">💡 Neighborhood Tip:</p>
                <p class="text-indigo-800 leading-relaxed">
                  Adding your Instagram, LinkedIn, and portfolio links allows clients to view your previous work directly and builds 3x higher trust!
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  `
            }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CreateStoreComponent, { className: "CreateStoreComponent", filePath: "src/app/pages/create-store/create-store.ts", lineNumber: 333 }); })();
