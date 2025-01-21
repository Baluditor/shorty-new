import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserLayoutComponent } from './user-layout.component';

@Component({
  selector: 'app-your-link',
  imports: [UserLayoutComponent, MatSnackBarModule],
  template: `
    <app-user-layout>
      <h1 header>QR Shorty Link</h1>
      <p description>
        Here is your unique Shorty link that will direct people to your
        shortlist
      </p>
      <ng-container content>
        <button
          (click)="copyLink()"
          class="cursor-pointer text-center text-lg font-bold">
          https://shorty-minimal.web.app/shortlist/{{ displayName() }}
        </button>
      </ng-container>
    </app-user-layout>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YourLinkComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  displayName: Signal<string | undefined> = this.authService.displayName;

  copyLink() {
    navigator.clipboard.writeText(
      `https://shorty-minimal.web.app/shortlist/${this.displayName()}`
    );
    this.snackBar.open('Link copied to clipboard', undefined, {
      duration: 2000,
      panelClass: 'toast-success',
    });
    this.router.navigate(['/']);
  }
}
