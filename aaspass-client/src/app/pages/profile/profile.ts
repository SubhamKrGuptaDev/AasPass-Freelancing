import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';

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

          <!-- Quick Test Toggle: switch store on/off for easy testing -->
          <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-xs font-semibold text-slate-600">Store Status:</span>
            @if (storeService.currentUser().hasStore) {
              <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">STORE ACTIVE</span>
            } @else {
              <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">NO STORE YET</span>
            }
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

        <!-- Section 2: Conditional Store Profile (Option A) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" [class.bg-emerald-500]="storeService.currentUser().hasStore" [class.bg-amber-400]="!storeService.currentUser().hasStore"></span>
              <h2 class="text-base font-bold text-slate-900">2. Neighborhood Skill Store</h2>
            </div>
            
            @if (storeService.currentUser().hasStore) {
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-500">Store Active:</span>
                <button 
                  type="button" 
                  (click)="storeService.toggleStoreAvailability()"
                  class="px-3 py-1 rounded-full text-xs font-bold transition"
                  [class.bg-emerald-100]="storeService.currentUser().store?.isAvailable"
                  [class.text-emerald-800]="storeService.currentUser().store?.isAvailable"
                  [class.bg-rose-100]="!storeService.currentUser().store?.isAvailable"
                  [class.text-rose-800]="!storeService.currentUser().store?.isAvailable"
                >
                  {{ storeService.currentUser().store?.isAvailable ? '✓ Open For Gigs' : '⏸ Paused' }}
                </button>
              </div>
            }
          </div>

          <!-- STATE A: User does NOT have a store yet -->
          @if (!storeService.currentUser().hasStore) {
            <div class="text-center py-8 px-4 max-w-lg mx-auto">
              <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                🏪
              </div>
              <h3 class="text-lg font-black text-slate-900 mb-2">You haven't opened a Skill Store yet</h3>
              <p class="text-xs text-slate-500 leading-relaxed mb-6">
                Are you looking for side-income or new to this city? Create a neighborhood store to showcase your experience, hourly rates, social media links, and services.
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

          <!-- STATE B: User HAS a store (Show full store details: experience, social accounts, hourly charges, etc.) -->
          @if (storeService.currentUser().hasStore && storeService.currentUser().store; as store) {
            <div class="space-y-6">
              
              <!-- Store Headline Header -->
              <div class="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/80 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-xl font-black text-slate-900">{{ store.storeName }}</h3>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      {{ store.category }}
                    </span>
                  </div>
                  <p class="text-xs font-semibold text-slate-700 mt-1">"{{ store.tagline }}"</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">
                    Operating in {{ store.area }}, {{ store.city }} • Serving within {{ store.serviceRadiusKm }} km
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <a 
                    [routerLink]="['/stores', store.id]"
                    class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                  >
                    View Public Storefront →
                  </a>
                  <a 
                    routerLink="/create-store"
                    class="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition"
                  >
                    Edit
                  </a>
                </div>
              </div>

              <!-- Key Store Metrics Grid: Experience, Hourly Rate, Starting Rate -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              </div>

              <!-- Social Media Accounts Linked -->
              <div>
                <h4 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Linked Social Media & Portfolios</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-700">📸 Instagram</span>
                    @if (store.socialLinks.instagram) {
                      <a [href]="store.socialLinks.instagram" target="_blank" class="text-xs font-bold text-pink-600 hover:underline">Connected →</a>
                    } @else {
                      <span class="text-[11px] text-slate-400 italic">Not set</span>
                    }
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-700">💼 LinkedIn</span>
                    @if (store.socialLinks.linkedin) {
                      <a [href]="store.socialLinks.linkedin" target="_blank" class="text-xs font-bold text-blue-600 hover:underline">Connected →</a>
                    } @else {
                      <span class="text-[11px] text-slate-400 italic">Not set</span>
                    }
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-700">🌐 Portfolio / GitHub</span>
                    @if (store.socialLinks.portfolio || store.socialLinks.github) {
                      <a [href]="store.socialLinks.portfolio || store.socialLinks.github" target="_blank" class="text-xs font-bold text-indigo-600 hover:underline">Connected →</a>
                    } @else {
                      <span class="text-[11px] text-slate-400 italic">Not set</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Skills listed -->
              <div>
                <h4 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Offered Skills</h4>
                <div class="flex flex-wrap gap-1.5">
                  @for (skill of store.skills; track skill) {
                    <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {{ skill }}
                    </span>
                  }
                </div>
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

  isEditingUser = false;
  editName = this.storeService.currentUser().name;
  editPhone = this.storeService.currentUser().phone;
  editAadhar = this.storeService.currentUser().aadharNumber || '';
  editPan = this.storeService.currentUser().panNumber || '';
  editArea = this.storeService.currentUser().area;
  editCity = this.storeService.currentUser().city;
  editBio = this.storeService.currentUser().bio;

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
}
