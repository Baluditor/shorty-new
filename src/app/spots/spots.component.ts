import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { MatListItem, MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { CategoryKey } from '../constants/categories';
import { Spot } from '../types/spot.type';
import { TransformNamePipe } from './pipes/transform-name.pipe';
import { SpotService } from './spot.service';

@Component({
  selector: 'app-spots',
  imports: [MatListModule, MatListItem, TransformNamePipe],
  template: `
    <main class="mx-auto flex w-full flex-col md:w-1/3">
      <header class="flex items-center justify-between px-4">
        <h1 class="text-2xl font-bold">{{ category() | transformName }}</h1>
      </header>
      <mat-nav-list
        style="max-height: calc(100dvh - 96px); overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; margin: 16px 0;">
        @for (spot of filteredSpots(); track spot.id) {
          <mat-list-item
            style="cursor: pointer; background-color: #F3EAE3; margin-top: 10px; margin-bottom: 10px;"
            (click)="navigateTo(spot)">
            <span class="flex w-full justify-between">
              {{ spot.name }}
            </span>
          </mat-list-item>
        }
      </mat-nav-list>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpotsComponent {
  private readonly spotService = inject(SpotService);
  private readonly router = inject(Router);

  country: Signal<string | undefined> = this.spotService.selectedCountry;
  city: Signal<string | undefined> = this.spotService.selectedCity;

  category: Signal<CategoryKey | undefined> = this.spotService.selectedCategory;
  filteredSpots: Signal<Spot[]> = this.spotService.filteredSpots;

  navigateTo(spot: Spot) {
    this.router.navigate([
      '/spots',
      this.country(),
      this.city(),
      spot.category,
    ]);
  }
}
