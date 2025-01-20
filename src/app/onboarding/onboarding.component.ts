import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { OnboardingStepComponent } from './onboarding-step.component';

@Component({
  selector: 'app-onboarding',
  imports: [OnboardingStepComponent],
  template: `
    @if (!this.authService.onboardingLoading()) {
      @switch (this.authService.user()?.onboardingStep) {
        @case (2) {
          <app-onboarding-step [toStep]="3">
            <span title
              >Recommend places with up to 3 tags highlighting what stand out
              most.</span
            >
            <span description
              >Your recommendations are seen only by people who trust you, and
              you share your profile link with - no stars, no review from
              strangers.</span
            >
          </app-onboarding-step>
        }
        @case (3) {
          <app-onboarding-step [toStep]="4" [showUsernameInput]="true">
            <span title>What would you like your Shorty username to be?</span>
            <span description
              >You can change it anytime, and people you share your profile will
              see this information</span
            >
          </app-onboarding-step>
        }
        @default {
          <app-onboarding-step [toStep]="2">
            <span title>Hi there</span>
            <span description>
              We are Shorty, a recommendation app for places that stan out,
              shared only by people you trust.
            </span>
          </app-onboarding-step>
        }
      }
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {
  readonly authService = inject(AuthService);
}
