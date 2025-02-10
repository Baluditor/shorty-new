import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { MatListItem, MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { TransformNamePipe } from './pipes/transform-name.pipe';
import { SpotService } from './spot.service';

@Component({
  selector: 'app-cities',
  imports: [MatListModule, MatListItem, TransformNamePipe],
  template: `
    <main class="mx-auto flex w-full flex-col md:w-1/3">
      <header class="flex items-center justify-between px-4">
        <h1 class="text-2xl font-bold">{{ country() | transformName }}</h1>
      </header>
      <mat-nav-list
        style="max-height: calc(100dvh - 96px); overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; margin: 16px 0;">
        @for (city of citiesInSelectedCountry(); track city) {
          <mat-list-item
            style="cursor: pointer; background-color: #F3EAE3; margin-top: 10px; margin-bottom: 10px;"
            (click)="navigateTo(city)">
            <span class="flex w-full justify-between">
              {{ city | transformName }}
              <span>{{ spotsCount() }}</span>
            </span>
          </mat-list-item>
        }
      </mat-nav-list>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesComponent {
  private readonly spotService = inject(SpotService);
  private readonly router = inject(Router);

  country: Signal<string | undefined> = this.spotService.selectedCountry;
  citiesInSelectedCountry: Signal<string[]> =
    this.spotService.citiesInSelectedCountry;

  spotsCount: Signal<number> = this.spotService.filteredSpotsCount;

  navigateTo(city: string) {
    this.router.navigate(['/spots', this.country(), city]);
  }
}
