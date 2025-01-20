import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const homeGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.user$.pipe(
    map(user => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      if (!user.onboardingCompleted) {
        return router.createUrlTree(['/onboarding']);
      }

      return true;
    })
  );
};
