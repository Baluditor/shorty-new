import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { map, startWith } from 'rxjs/operators';
import { Category, categories } from '../constants/categories';
import { Tag, tags } from '../constants/tags';
import { LocationInfo, Place } from '../types/google.types';
import { SpotService } from './spot.service';

const dummyLocationInfo: LocationInfo = {
  country: 'United States',
  city: 'New York',
  state: 'New York',
  postalCode: '10036',
};

const dummyPlaceDetail: Place | object = {
  addressComponents: [
    {
      longText: '132',
      shortText: '132',
      types: ['street_number'],
    },
    {
      longText: 'West 43rd Street',
      shortText: 'W 43rd St',
      types: ['route'],
    },
    {
      longText: 'Manhattan',
      shortText: 'Manhattan',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      longText: 'New York',
      shortText: 'New York',
      types: ['locality', 'political'],
    },
    {
      longText: 'New York County',
      shortText: 'New York County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      longText: 'New York',
      shortText: 'NY',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      longText: 'United States',
      shortText: 'US',
      types: ['country', 'political'],
    },
    {
      longText: '10036',
      shortText: '10036',
      types: ['postal_code'],
    },
  ],
  id: 'ChIJd44fMFVYwokRqpXE6s9gnV4',
  displayName: 'Burger & Lobster Bryant Park',
  formattedAddress: '132 W 43rd St, New York, NY 10036, USA',
  location: {
    lat: () => 40.7559517,
    lng: () => -73.9851995,
    toJSON: () => ({ lat: 40.7559517, lng: -73.9851995 }),
    toUrlValue: () => 'https://maps.google.com/?q=40.7559517,-73.9851995',
    equals: () => false,
  },
  plusCode: {
    compoundCode: 'Q247+9W New York, NY, USA',
    globalCode: '87G8Q247+9W',
  },
  types: [
    'hamburger_restaurant',
    'seafood_restaurant',
    'american_restaurant',
    'bar',
    'restaurant',
    'food',
    'point_of_interest',
    'establishment',
  ],
};

@Component({
  selector: 'app-add-spot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
  ],
  template: `
    <div class="flex h-full w-full flex-col gap-4">
      <h1 class="text-center text-2xl font-bold">Add a spot</h1>
      <div class="flex w-full flex-1 flex-col gap-4 md:flex-row">
        <div class="flex w-full flex-1 flex-col gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <input
              #searchInput
              matInput
              type="text"
              placeholder="Start typing to search..." />
          </mat-form-field>
          <div
            #map
            class="min-h-[300px] w-full flex-1 overflow-hidden rounded-lg"></div>
        </div>
        @if (selectedPlace()) {
          <div
            class="flex w-full flex-col gap-4 rounded-md bg-pink-700 p-4 md:w-1/2">
            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold">Name of spot</span>
              <p class="">
                {{ selectedPlace()?.displayName }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold">Category</span>
              <mat-form-field appearance="outline">
                <mat-select>
                  @for (category of categories | keyvalue; track category.key) {
                    <mat-option [value]="category.key">{{
                      category.value
                    }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold">Tags</span>
              <mat-form-field
                appearance="outline"
                class="no-field-border not-that-high-padding">
                <mat-chip-grid #chipGrid>
                  @for (tag of selectedTags(); track tag) {
                    <mat-chip-row (removed)="removeTag(tag)">
                      {{ tags[tag] }}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                  }
                </mat-chip-grid>
                <input
                  #tagInput
                  [formControl]="tagCtrl"
                  [matAutocomplete]="auto"
                  [matChipInputFor]="chipGrid"
                  [placeholder]="
                    selectedTags().length >= 3
                      ? 'Max tags selected'
                      : 'Type to search tags'
                  "
                  [disabled]="selectedTags().length >= 3" />
                <mat-autocomplete
                  #auto="matAutocomplete"
                  (optionSelected)="addTag($event)">
                  @for (tag of filteredTags$ | async; track tag.key) {
                    <mat-option [value]="tag.key">{{ tag.value }}</mat-option>
                  }
                </mat-autocomplete>
                <mat-hint
                  >Use up to 3 tags to highlight what makes this spot unique.
                  Your recommendations are personal and visible only to those
                  you share your profile link with.</mat-hint
                >
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <input matInput [value]="locationInfo()?.country" disabled />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <input matInput [value]="locationInfo()?.city" disabled />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-select>
                <mat-option value="">Select a category</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="flex justify-between pt-4">
              <button mat-stroked-button>Cancel</button>
              <button mat-flat-button color="primary">Add place</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSpotComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) mapElement!: ElementRef<HTMLElement>;
  @ViewChild('searchInput', { static: true })
  searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  tags: Tag = tags;
  categories: Category = categories;

  private spotService = inject(SpotService);
  private map?: google.maps.Map;
  private autocomplete?: google.maps.places.Autocomplete;
  private currentMarker?: google.maps.marker.AdvancedMarkerElement;

  selectedPlace = signal<google.maps.places.Place | null>(
    dummyPlaceDetail as Place
  );
  locationInfo = signal<LocationInfo | null>(dummyLocationInfo);

  tagCtrl = new FormControl('');
  selectedTags = signal<string[]>([]);

  filteredTags$ = this.tagCtrl.valueChanges.pipe(
    startWith(''),
    map(value => this.filterTags(value))
  );

  constructor() {
    effect(() => {
      if (this.selectedPlace()) {
        const place = this.selectedPlace();
        if (place?.location) {
          this.map?.setCenter(place.location);
          this.map?.setZoom(17);
          this.updateMarker(place);
        }
      }
    });
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private async initializeMap() {
    try {
      const { map, marker } = await this.spotService.initMap(
        this.mapElement.nativeElement
      );
      this.map = map;
      this.currentMarker = marker;
      this.autocomplete = await this.spotService.initAutocomplete(
        this.searchInput.nativeElement,
        this.map
      );

      this.autocomplete.addListener('place_changed', async () => {
        const place = this.autocomplete?.getPlace();
        if (place?.place_id) {
          const placeDetails = await this.spotService.getPlaceDetails(
            place.place_id
          );

          this.selectedPlace.set(placeDetails.place);
          this.locationInfo.set(placeDetails.locationInfo);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private async updateMarker(place: google.maps.places.Place) {
    if (this.map) {
      // Remove existing marker if any
      if (this.currentMarker) {
        this.currentMarker.map = null;
      }
      // Create new marker
      this.currentMarker = await this.spotService.createMarker(this.map, place);
    }
  }

  private filterTags(value: string | null): { key: string; value: string }[] {
    const filterValue = (value || '').toLowerCase();
    return Object.entries(tags)
      .filter(([key]) => !this.selectedTags().includes(key)) // Filter out selected tags
      .filter(([, tagValue]) => tagValue.toLowerCase().includes(filterValue))
      .map(([key, value]) => ({ key, value }));
  }

  addTag(event: { option: { value: string } }) {
    if (this.selectedTags().length < 3) {
      const newTags = [...this.selectedTags(), event.option.value];
      this.selectedTags.set(newTags);

      // Clear the input value
      this.tagCtrl.setValue('');
      if (this.tagInput?.nativeElement) {
        this.tagInput.nativeElement.value = '';
      }
    }
  }

  removeTag(tagToRemove: string) {
    const newTags = this.selectedTags().filter(tag => tag !== tagToRemove);
    this.selectedTags.set(newTags);
  }
}
