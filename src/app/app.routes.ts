import { Routes } from '@angular/router';
import { homeGuard } from './guards/home.guard';
import { onboardingGuard } from './guards/onboarding.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(c => c.LoginComponent),
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./onboarding/onboarding.component').then(
        c => c.OnboardingComponent
      ),
    canActivate: [onboardingGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then(c => c.HomeComponent),
    canActivate: [homeGuard],
  },
  {
    path: 'qr-code',
    loadComponent: () =>
      import('./user/qr-code.component').then(c => c.QrCodeComponent),
  },
  {
    path: 'your-link',
    loadComponent: () =>
      import('./user/your-link.component').then(c => c.YourLinkComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./user/settings.component').then(c => c.SettingsComponent),
  },
  {
    path: 'settings/delete-account',
    loadComponent: () =>
      import('./user/delete-account.component').then(
        c => c.DeleteAccountComponent
      ),
  },
  {
    path: 'spots/add-spot',
    loadComponent: () =>
      import('./spots/add-spot.component').then(c => c.AddSpotComponent),
  },
  {
    path: 'countries',
    loadComponent: () =>
      import('./spots/spots.component').then(c => c.SpotsComponent),
  },

  {
    path: 'spots/:country',
    loadComponent: () =>
      import('./spots/cities.component').then(c => c.CitiesComponent),
  },
  {
    path: 'spots/:country/:city',
    loadComponent: () =>
      import('./spots/categories.component').then(c => c.CategoriesComponent),
  },
  {
    path: 'spots/:country/:city/:category',
    loadComponent: () =>
      import('./spots/spots.component').then(c => c.SpotsComponent),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
