import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { StoresComponent } from './pages/stores/stores';
import { StoreDetailComponent } from './pages/store-detail/store-detail';
import { CreateStoreComponent } from './pages/create-store/create-store';
import { ProfileComponent } from './pages/profile/profile';
import { AuthPageComponent } from './pages/auth/auth-page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes (Authentication not required)
  { path: '', component: HomeComponent, title: 'AasPass - Hyperlocal Freelancing & Nearby Gigs' },
  { path: 'stores', component: StoresComponent, title: 'Browse Local Stores - AasPass' },
  { path: 'stores/:storeKey', component: StoreDetailComponent, title: 'Store Details - AasPass' },
  
  // Dedicated Auth Routes
  { path: 'login', component: AuthPageComponent, title: 'Sign In - AasPass' },
  { path: 'signup', component: AuthPageComponent, title: 'Sign Up - AasPass' },

  // Protected routes (Requires login - authGuard triggers popup login modal)
  { path: 'create-store', component: CreateStoreComponent, canActivate: [authGuard], title: 'Open Your Skill Store - AasPass' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard], title: 'My Profile & Store - AasPass' },

  { path: '**', redirectTo: '' }
];

