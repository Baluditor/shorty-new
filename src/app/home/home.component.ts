import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AddYourFirstSpotComponent } from '../spots/add-your-first-spot.component';
import { CountriesComponent } from '../spots/countries.component';
import { SpotService } from '../spots/spot.service';

@Component({
  selector: 'app-home',
  imports: [
    MatIconModule,
    NgOptimizedImage,
    MatButtonModule,
    MatMenuModule,
    AddYourFirstSpotComponent,
    CountriesComponent,
  ],
  template: `
    <main class="mx-auto flex w-full flex-col md:w-1/3">
      <header class="flex items-center justify-between px-4">
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
      @if (!loading()) {
        @if (this.spotService.spots().length === 0) {
          <app-add-your-first-spot />
        } @else {
          <app-countries />
        }
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

  loading: Signal<boolean> = this.spotService.loading;

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
