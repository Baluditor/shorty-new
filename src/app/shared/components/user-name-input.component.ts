import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { OnboardingService } from '../../onboarding/onboarding.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-name-input',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onFormSubmitted()"
      class="flex w-full flex-col gap-6">
      <mat-form-field class="w-full">
        <input
          matInput
          formControlName="username"
          [placeholder]="
            isOnboarding()
              ? 'joinshorty.com/Username'
              : 'joinshorty.com/' + displayName()
          "
          #usernameInput
          (blur)="trimUsername(usernameInput)" />
        @if (form.get('username')?.hasError('required')) {
          <mat-error>Username is required</mat-error>
        }
        @if (form.get('username')?.hasError('minlength')) {
          <mat-error>Username must be at least 3 characters</mat-error>
        }
        @if (form.get('username')?.hasError('usernameTaken')) {
          <mat-error>This username is already taken</mat-error>
        }
        @if (form.get('username')?.hasError('containsSpace')) {
          <mat-error>Username cannot contain spaces</mat-error>
        }
      </mat-form-field>
      <div class="flex justify-between">
        <div class="flex gap-8">
          <button (click)="logOut()" class="text-right">Log Out</button>
          <button
            type="submit"
            (click)="navigateToDeleteAccount()"
            class="text-right">
            Delete Account
          </button>
        </div>
        <button
          type="submit"
          [disabled]="form.invalid || form.pending"
          class="text-right disabled:opacity-50">
          {{ isOnboarding() ? 'Continue' : 'Save' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    :host {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserNameInputComponent {
  private readonly authService = inject(AuthService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);

  isOnboarding: InputSignal<boolean> = input<boolean>(false);

  userName: OutputEmitterRef<string> = output<string>();
  isFormValid: OutputEmitterRef<boolean> = output<boolean>();
  formSubmitted: OutputEmitterRef<void> = output<void>();

  displayName: Signal<string | undefined> = this.authService.displayName;

  form = new FormGroup({
    username: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        control => {
          const value = control.value?.trim() || '';
          if (value.includes(' ')) {
            return { containsSpace: true };
          }
          return null;
        },
      ],
      asyncValidators: [
        async control => {
          const trimmedValue = control.value?.trim();
          if (!trimmedValue) {
            return null;
          }
          const takenUsername =
            await this.onboardingService.checkIfUserNameTaken(trimmedValue);
          if (takenUsername) {
            this.form.markAllAsTouched();
            return { usernameTaken: true };
          }
          return null;
        },
      ],
    }),
  });

  constructor() {
    this.userName.emit(this.form.get('username')?.value || '');

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.userName.emit(this.form.get('username')?.value || '');
    });

    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.isFormValid.emit(this.form.valid);
    });
  }

  trimUsername(input: HTMLInputElement): void {
    const trimmedValue = input.value.trim();
    this.form.get('username')?.setValue(trimmedValue);
  }

  onFormSubmitted(): void {
    if (this.form.valid) {
      this.formSubmitted.emit();
    }
  }

  logOut(): void {
    this.authService.logOut();
  }

  navigateToDeleteAccount(): void {
    this.router.navigate(['/settings/delete-account']);
  }
}
