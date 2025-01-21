import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SpotService } from '../services/spot.service';

@Component({
  selector: 'app-home',
  imports: [MatIconModule, NgOptimizedImage, MatButtonModule, MatMenuModule],
  template: `
    <main class="mx-auto flex h-screen w-1/3 flex-col p-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Shorty</h1>
        <button [matMenuTriggerFor]="profileMenu">
          <span class="rounded-full bg-black">
            @if (authService.user()?.photoURL) {
              <img
                [ngSrc]="authService.user()?.photoURL!"
                alt="Profile Photo"
                width="32"
                height="32"
                class="rounded-full" />
            }
          </span>
        </button>
        <mat-menu xPosition="before" yPosition="below" #profileMenu="matMenu">
          <button
            (click)="navigateTo('/qr-code')"
            style="background-color: white; color: black;"
            mat-menu-item>
            My Shorty QR code
          </button>
          <button
            (click)="navigateTo('/your-link')"
            style="background-color: white; color: black;"
            mat-menu-item>
            My Shorty link
          </button>
          <button
            (click)="navigateTo('/settings')"
            style="background-color: white; color: black;"
            mat-menu-item>
            Settings
          </button>
        </mat-menu>
      </header>
      @if (this.spotService.spots.length === 0) {
        <div class="ga flex flex-col items-center pt-20 text-center">
          <h2 class="text-2xl font-bold">Add your first spot</h2>
          <p class="text-lg">
            Recommend a place that truly stands out and tag why it's special
          </p>
          <button
            mat-flat-button
            style="background-color: #F2D27D; color: black; width: fit-content; padding: 0 26px; border-radius: 0;">
            Add spot
          </button>
        </div>
      }
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly authService = inject(AuthService);
  readonly spotService = inject(SpotService);
  readonly router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
