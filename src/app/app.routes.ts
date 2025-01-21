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
    path: '**',
    redirectTo: '/login',
  },
];
