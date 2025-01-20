import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from './onboarding.service';

@Component({
  selector: 'app-onboarding-step',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="mx-auto w-1/3 p-4">
      <div class="flex flex-col gap-8">
        <h2 class="text-3xl font-bold">SHORTY</h2>
        <div>
          <form
            [formGroup]="form"
            (ngSubmit)="updateOnboardingStep(toStep())"
            class="flex flex-col gap-6">
            <div class="flex flex-col gap-6">
              <h1 class="text-4xl font-bold">
                <ng-content select="[title]"></ng-content>
              </h1>
              <p class="text-lg">
                <ng-content select="[description]"></ng-content>
              </p>
              @if (showUsernameInput()) {
                <mat-form-field class="w-full">
                  <input
                    matInput
                    formControlName="username"
                    placeholder="joinshorty.com/Username" />
                  @if (this.hasError('username', 'required')) {
                    <mat-error>Username is required</mat-error>
                  }
                  @if (this.hasError('username', 'minlength')) {
                    <mat-error
                      >Username must be at least 3 characters</mat-error
                    >
                  }
                  @if (this.hasError('username', 'usernameTaken')) {
                    <mat-error>This username is already taken</mat-error>
                  }
                </mat-form-field>
              }
            </div>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="text-right disabled:opacity-50">
              Continue
            </button>
          </form>
        </div>
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

  form = new FormGroup({
    username: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
      asyncValidators: [
        async control => {
          if (!control.value) {
            return null;
          }
          const takenUsername: boolean =
            await this.onboardingService.checkIfUserNameTaken(control.value);
          if (takenUsername) {
            this.form.markAllAsTouched();
            return { usernameTaken: true };
          }
          return null;
        },
      ],
    }),
  });

  updateOnboardingStep(step: number) {
    if (this.showUsernameInput()) {
      if (this.form.valid) {
        try {
          const username = this.form.get('username')!.value!;
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
      this.form.markAllAsTouched();
      return;
    }
    this.authService.updateUser({
      onboardingStep: step,
    });
  }

  hasError(controlName: string, errorName: string) {
    return this.form.get(controlName)?.hasError(errorName);
  }
}
