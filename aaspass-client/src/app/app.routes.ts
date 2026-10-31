import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { StoreDetailComponent } from './pages/store-detail/store-detail';
import { CreateStoreComponent } from './pages/create-store/create-store';
import { ProfileComponent } from './pages/profile/profile';
import { AuthPageComponent } from './pages/auth/auth-page';
import { authGuard } from './guards/auth.guard';
import { ownerGuard } from './pages/owner/owner.guard';

export const routes: Routes = [
  // Public routes (Authentication not required)
  { path: '', component: HomeComponent, title: 'AasPass - Hyperlocal Freelancing & Nearby Gigs' },
  { path: 'stores', loadComponent: () => import('./pages/stores/stores').then(m => m.StoresComponent), title: 'Browse Local Stores - AasPass' },
  { path: 'stores/:storeKey', component: StoreDetailComponent, title: 'Store Details - AasPass' },
  { path: 'stores/:storeKey/book/:serviceId', loadComponent: () => import('./pages/book-service/book-service').then(m => m.BookServiceComponent), title: 'Book a Service - AasPass' },
  
  // Dedicated Auth Routes
  { path: 'login', component: AuthPageComponent, title: 'Sign In - AasPass' },
  { path: 'signup', component: AuthPageComponent, title: 'Sign Up - AasPass' },

  // Protected routes (Requires login - authGuard triggers popup login modal)
  { path: 'create-store', component: CreateStoreComponent, canActivate: [authGuard], title: 'Open Your Skill Store - AasPass' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard], title: 'My Profile & Store - AasPass' },

  { path: 'my-bookings', loadComponent: () => import('./pages/my-bookings/my-bookings').then(m => m.MyBookingsComponent), canActivate: [authGuard], title: 'My Bookings - AasPass' },

  { path: 'owner-dashboard/availability', loadComponent: () => import('./pages/owner/owner-availability/owner-availability').then(m => m.OwnerAvailabilityComponent), canActivate: [ownerGuard], title: 'Availability - AasPass' },

  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent), title: 'Contact Us - AasPass' },

  { path: '**', redirectTo: '' }
];

