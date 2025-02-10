import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { MatListItem, MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { CategoryKey } from '../constants/categories';
import { TransformNamePipe } from './pipes/transform-name.pipe';
import { SpotCountByCategory, SpotService } from './spot.service';

@Component({
  selector: 'app-categories',
  imports: [MatListModule, MatListItem, TransformNamePipe],
  template: `
    <main class="mx-auto flex w-full flex-col md:w-1/3">
      <header class="flex items-center justify-between px-4">
        <h1 class="text-2xl font-bold">{{ city() | transformName }}</h1>
      </header>
      <mat-nav-list
        style="max-height: calc(100dvh - 96px); overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; margin: 16px 0;">
        @for (category of categoriesFromCity(); track category) {
          <mat-list-item
            style="cursor: pointer; background-color: #F3EAE3; margin-top: 10px; margin-bottom: 10px;"
            (click)="navigateTo(category)">
            <span class="flex w-full justify-between">
              {{ category | transformName }}
              <span>{{ spotsCountByCategory()[category] }}</span>
            </span>
          </mat-list-item>
        }
      </mat-nav-list>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  private readonly spotService = inject(SpotService);
  private readonly router = inject(Router);

  city: Signal<string | undefined> = this.spotService.selectedCity;
  country: Signal<string | undefined> = this.spotService.selectedCountry;

  categoriesFromCity: Signal<CategoryKey[]> =
    this.spotService.categoriesInSelectedCity;
  spotsCountByCategory: Signal<SpotCountByCategory> =
    this.spotService.spotsCountByCategory;

  navigateTo(category: CategoryKey) {
    this.router.navigate(['/spots', this.country(), this.city(), category]);
  }
}
