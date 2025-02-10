import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserNameInputComponent } from '../shared/components/user-name-input.component';
import { OnboardingService } from './onboarding.service';

@Component({
  selector: 'app-onboarding-step',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    UserNameInputComponent,
  ],
  template: `
    <div class="mx-auto w-full md:w-1/3">
      <div class="flex flex-col gap-8">
        <h2 class="text-3xl font-bold">SHORTY</h2>
        <div class="flex flex-col gap-6">
          <h1 class="text-4xl font-bold">
            <ng-content select="[title]"></ng-content>
          </h1>
          <p class="text-lg">
            <ng-content select="[description]"></ng-content>
          </p>
          @if (showUsernameInput()) {
            <app-user-name-input
              [isOnboarding]="true"
              (isFormValid)="updateIsFormValid($event)"
              (userName)="updateUserName($event)"
              (formSubmitted)="updateOnboardingStep(toStep())" />
          }
        </div>
        @if (!showUsernameInput()) {
          <button
            (click)="updateOnboardingStep(toStep())"
            type="submit"
            class="text-right">
            Continue
          </button>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingStepComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingService);

  toStep: InputSignal<number> = input.required<number>();
  showUsernameInput: InputSignal<boolean> = input<boolean>(false);

  isFormValid: WritableSignal<boolean> = signal(false);
  userName: WritableSignal<string> = signal('');

  updateIsFormValid(isValid: boolean) {
    console.log('updateIsFormValid', isValid);

    this.isFormValid.set(isValid);
  }

  updateUserName(userName: string) {
    console.log('updateUserName', userName);

    this.userName.set(userName);
  }

  updateOnboardingStep(step: number) {
    console.log('updateOnboardingStep', step);

    if (this.showUsernameInput()) {
      if (this.isFormValid()) {
        try {
          const username = this.userName();
          this.onboardingService.setTakenUsername(username);
          this.authService.updateUser({
            displayName: username,
            username: username.toLowerCase(),
            onboardingCompleted: true,
          });
          this.router.navigate(['/']);
          return;
        } catch (error) {
          console.error(error);
        }
      }
      return;
    }
    this.authService.updateUser({
      onboardingStep: step,
    });
  }

  handleFormAction = () => {
    this.updateOnboardingStep(this.toStep());
  };
}
