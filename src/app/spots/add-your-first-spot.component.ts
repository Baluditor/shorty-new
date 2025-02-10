import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-your-first-spot',
  imports: [MatButtonModule],
  template: `
    <div class="flex flex-col items-center gap-4 pt-20 text-center">
      <h2 class="text-2xl font-bold">Add your first spot</h2>
      <p class="text-lg">
        Recommend a place that truly stands out and tag why it's special
      </p>
      <button
        (click)="navigateTo('/spots/add-spot')"
        mat-flat-button
        style="background-color: #F2D27D; color: black; width: fit-content; padding: 0 26px; border-radius: 0;">
        Add spot
      </button>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddYourFirstSpotComponent {
  readonly router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
