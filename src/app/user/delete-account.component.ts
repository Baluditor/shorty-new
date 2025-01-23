import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserLayoutComponent } from './user-layout.component';

@Component({
  selector: 'app-delete-account',
  imports: [UserLayoutComponent],
  template: `
    <app-user-layout [hideBackButton]="true">
      <h1 header>Are you sure you want to delete your account?</h1>
      <p description>
        Your recommendations to others won't be lost, they will still see the
        spots you added but you won't be able to access your information
        anymore.
      </p>
      <div content class="flex gap-4 place-self-end pt-6">
        <button (click)="cancel()">No. Don't delete</button>
        <button (click)="deleteAccount()">Yes. Delete account</button>
      </div>
    </app-user-layout>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  deleteAccount() {
    return;
  }

  cancel() {
    this.router.navigate(['/settings']);
  }
}
