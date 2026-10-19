import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { 
  StoreProfile, 
  SocialMediaLink, 
  formatSocialUrl, 
  displaySocialUrl, 
  getSocialIcon, 
  getSocialBadgeClass, 
  normalizeSocialLinks,
  EngagementViewType,
  ENGAGEMENT_TYPE_OPTIONS,
  EngagementTypeOption,
  getEngagementCount
} from '../../models/store.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
              (click)="isEditingUser = !isEditingUser"
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
                  <div class="flex justify-end gap-2">
                    <button 
                      type="button" 
                      (click)="saveUserDetails()"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
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

              <!-- Linked Social Media & Portfolios for this specific store -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs uppercase tracking-wider font-bold text-slate-500">
                      Linked Social Media & Portfolios ({{ store.storeName }})
                    </h4>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {{ getStoreSocialLinks(store).length }} Links Added
                    </span>
                  </div>

                  <a 
                    [routerLink]="['/create-store']"
                    [queryParams]="{ editStoreId: store.id }"
                    class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                    title="Add or update social media links for this store"
                  >
                    <span>+ Add / Manage Links</span>
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
                    <p class="text-xs text-slate-600 font-semibold mb-1">No social media links linked for {{ store.storeName }} yet</p>
                    <p class="text-[11px] text-slate-400 mb-3">Add links to your Instagram, LinkedIn, GitHub, or portfolio so neighborhood clients can view your credibility directly.</p>
                    <a 
                      [routerLink]="['/create-store']"
                      [queryParams]="{ editStoreId: store.id }"
                      class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      + Add Social Media & Portfolio Links
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
})
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

  formatUrl = formatSocialUrl;
  displayUrl = displaySocialUrl;
  getSocialIcon = getSocialIcon;
  getSocialBadgeClass = getSocialBadgeClass;

  // Selected store state for multi-store switcher
  selectedStoreId = signal<string>('');

  selectedStore = computed(() => {
    const list = this.storeService.userStores();
    if (list.length === 0) return undefined;
    const currentId = this.selectedStoreId();
    const found = list.find(s => s.id === currentId);
    return found || list[0];
  });

  selectStore(id: string): void {
    this.selectedStoreId.set(id);
    this.isAddingReview = false;
    this.reviewFormError = null;
    this.reviewSuccessMessage = null;
  }

  deleteStore(storeId: string): void {
    const target = this.storeService.getStoreById(storeId);
    const storeName = target?.storeName || 'this store';
    if (confirm(`Are you sure you want to delete "${storeName}"? This action cannot be undone.`)) {
      this.storeService.deleteStore(storeId);
      const remaining = this.storeService.userStores();
      if (remaining.length > 0) {
        this.selectedStoreId.set(remaining[0].id);
      } else {
        this.selectedStoreId.set('');
      }
    }
  }

  getStoreSocialLinks(store: StoreProfile): SocialMediaLink[] {
    return normalizeSocialLinks(store.socialMediaLinks, store.userSocialLinks);
  }

  // Review section for store owner
  isAddingReview = false;
  newReviewUserName = '';
  newReviewRating = 5.0;
  newReviewMessage = '';
  reviewFormError: string | null = null;
  reviewSuccessMessage: string | null = null;

  saveUserDetails(): void {
    this.storeService.updateUserProfile({
      name: this.editName,
      phone: this.editPhone,
      aadharNumber: this.editAadhar,
      panNumber: this.editPan ? this.editPan.toUpperCase() : '',
      area: this.editArea,
      city: this.editCity,
      bio: this.editBio
    });
    this.isEditingUser = false;
  }

  setNewRating(val: number): void {
    const num = Number(val);
    if (isNaN(num)) {
      this.newReviewRating = 5.0;
      return;
    }
    // strictly enforce min 1.0 and max 5.0
    this.newReviewRating = Math.max(1.0, Math.min(5.0, Math.round(num * 10) / 10));
  }

  submitStoreReview(storeId: string): void {
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
  selectedEngagementType = signal<EngagementViewType>('daily');
  engagementOptions = ENGAGEMENT_TYPE_OPTIONS;
  viewSimulationToast: string | null = null;

  selectedEngagementOption = computed<EngagementTypeOption>(() => {
    const t = this.selectedEngagementType();
    return this.engagementOptions.find(o => o.type === t) || this.engagementOptions[0];
  });

  selectEngagementType(type: EngagementViewType): void {
    this.selectedEngagementType.set(type);
  }

  getStoreEngagement(store: StoreProfile, type: EngagementViewType): number {
    return getEngagementCount(store, type);
  }

  getEngagementShortLabel(type: EngagementViewType): string {
    const opt = this.engagementOptions.find(o => o.type === type);
    return opt?.shortLabel || type;
  }

  simulateStoreView(storeId: string): void {
    this.storeService.recordStoreView(storeId);
    const store = this.storeService.getStoreById(storeId);
    const storeName = store?.storeName || 'Store';
    this.viewSimulationToast = `Recorded 1 new view for "${storeName}". Daily, weekly, monthly & lifetime updated!`;
    setTimeout(() => {
      this.viewSimulationToast = null;
    }, 4000);
  }
}

