import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { MatListItem, MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { Country } from '../types/country.type';
import { TransformNamePipe } from './pipes/transform-name.pipe';
import { SpotCountByCountry, SpotService } from './spot.service';

@Component({
  selector: 'app-countries',
  imports: [MatListModule, TransformNamePipe, MatListItem],
  template: `
    <mat-nav-list
      style="max-height: calc(100dvh - 96px); overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; margin: 16px 0;">
      @for (country of countries(); track country) {
        <mat-list-item
          style="cursor: pointer; background-color: #F3EAE3; margin-bottom: 10px;"
          (click)="navigateTo(country.country)">
          <span class="flex w-full justify-between">
            {{ country.country | transformName }}
            <span>{{ spotsCountByCountry()[country.country] }}</span>
          </span>
        </mat-list-item>
      }
    </mat-nav-list>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountriesComponent {
  private readonly spotService = inject(SpotService);
  private readonly router = inject(Router);

  countries: Signal<Country[]> = this.spotService.countries;
  spotsCountByCountry: Signal<SpotCountByCountry> =
    this.spotService.spotsCountByCountry;

  navigateTo(country: string) {
    this.router.navigate(['/spots', country.toLowerCase()]);
  }
}
