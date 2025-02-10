import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  imports: [MatButtonModule],
  template: `
    <div class="mx-auto flex w-full flex-col items-center gap-4 md:w-1/3">
      <h1 class="text-2xl font-bold">
        <ng-content select="[header]"></ng-content>
      </h1>
      <p class="text-center text-lg">
        <ng-content select="[description]"></ng-content>
      </p>
      <ng-content select="[content]"></ng-content>
      @if (!hideBackButton()) {
        <button
          (click)="back()"
          mat-flat-button
          style="background-color: #F2D27D; color: black; width: fit-content; padding: 0 26px; border-radius: 0;">
          Back
        </button>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLayoutComponent {
  private readonly router = inject(Router);

  hideBackButton = input<boolean>(false);

  back() {
    this.router.navigate(['/']);
  }
}
