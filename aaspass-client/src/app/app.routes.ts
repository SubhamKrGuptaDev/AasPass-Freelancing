import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { StoreDetailComponent } from './pages/store-detail/store-detail';
import { CreateStoreComponent } from './pages/create-store/create-store';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'AasPass - Hyperlocal Freelancing & Nearby Gigs' },
  { path: 'stores/:id', component: StoreDetailComponent, title: 'Store Details - AasPass' },
  { path: 'create-store', component: CreateStoreComponent, title: 'Open Your Skill Store - AasPass' },
  { path: 'profile', component: ProfileComponent, title: 'My Profile & Store - AasPass' },
  { path: '**', redirectTo: '' }
];
