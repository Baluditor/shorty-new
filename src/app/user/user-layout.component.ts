import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  imports: [MatButtonModule],
  template: `
    <div class="mx-auto flex w-1/3 flex-col items-center gap-4 p-4">
      <h1 class="text-2xl font-bold">
        <ng-content select="[header]"></ng-content>
      </h1>
      <p class="text-center text-lg">
        <ng-content select="[description]"></ng-content>
      </p>
      <ng-content select="[content]"></ng-content>
      <button
        (click)="back()"
        mat-flat-button
        style="background-color: #F2D27D; color: black; width: fit-content; padding: 0 26px; border-radius: 0;">
        Back
      </button>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLayoutComponent {
  private readonly router = inject(Router);

  back() {
    this.router.navigate(['/']);
  }
}
