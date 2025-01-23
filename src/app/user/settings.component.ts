import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { UserNameInputComponent } from '../shared/components/user-name-input.component';
import { UserLayoutComponent } from './user-layout.component';

@Component({
  selector: 'app-settings',
  imports: [
    UserLayoutComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    UserNameInputComponent,
  ],
  template: `
    <app-user-layout>
      <h1 header>Settings</h1>
      <ng-container content>
        <app-user-name-input
          [isOnboarding]="false"
          (userName)="userName.set($event)"
          (formSubmitted)="updateUserName()" />
      </ng-container>
    </app-user-layout>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);

  displayName: Signal<string | undefined> = this.authService.displayName;
  userName: WritableSignal<string> = signal('');

  updateUserName() {
    this.authService.updateUser({
      displayName: this.userName(),
    });
    this.authService.setTakenUsername(this.userName());
  }
}
