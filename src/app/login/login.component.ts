import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, MatButtonModule],
  template: `
    @if (authService.user() === null) {
      <div
        class="ga mx-auto flex h-full max-w-[260px] flex-col items-center justify-center p-4">
        <h1 class="text-4xl font-bold">Shorty</h1>
        <button (click)="signInWithGoogle()" mat-raised-button color="primary">
          <mat-icon
            svgIcon="google"
            style="width: 26px; height: 26px"></mat-icon>
          <p class="text-lg text-black">Continue with Google</p>
        </button>
        <p class="text-center text-sm text-gray-500">
          By clicking Continue with Google, you agree to our
          <a href="#" class="underline"> general terms and conditions</a> and
          <a href="#" class="underline">privacy policy</a>
        </p>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  signInWithGoogle() {
    this.authService.signInWithGoogle();
  }

  constructor() {
    effect(() => {
      if (
        this.authService.user() &&
        this.authService.user()?.onboardingCompleted
      ) {
        this.router.navigate(['/']);
      } else if (this.authService.user()) {
        this.router.navigate(['onboarding']);
      }
    });
  }
}
