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
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs/operators';
import { Category, categories } from '../constants/categories';
import {
  DestinationCategory,
  destinationCategories,
} from '../constants/destination-categories';
import { Tag, tags } from '../constants/tags';
import { AuthService } from '../services/auth.service';
import {
  AdvancedMarkerElement,
  Autocomplete,
  LocationInfo,
  Map,
  Place,
} from '../types/google.types';
import { Spot } from '../types/spot.type';
import { SpotService } from './spot.service';

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
        <div class="flex w-full flex-col gap-4 rounded-md md:w-1/2">
          <div class="flex flex-col gap-2">
            <span class="text-sm font-bold">Name of spot</span>
            <p class="">
              {{ selectedPlace()?.displayName || 'No place selected' }}
            </p>
          </div>

          <form
            (ngSubmit)="onSubmit()"
            class="flex flex-col gap-4"
            [formGroup]="spotForm">
            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold">Category</span>
              <mat-form-field appearance="outline">
                <mat-select formControlName="category">
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
                      {{ '#' + tags[tag] }}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                  }
                </mat-chip-grid>
                <input
                  #tagInput
                  class="disabled:text-gray-400"
                  [formControl]="tagCtrl"
                  [matAutocomplete]="auto"
                  [matChipInputFor]="chipGrid"
                  [placeholder]="
                    selectedTags().length >= 3
                      ? 'Max tags selected'
                      : 'Type to search tags'
                  "
                  [disabled]="selectedTags().length >= 3 || !selectedPlace()" />
                <mat-autocomplete
                  #auto="matAutocomplete"
                  (optionSelected)="addTag($event)">
                  @for (tag of filteredTags$ | async; track tag.key) {
                    <mat-option [value]="tag.key">{{ tag.value }}</mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>
              <span class="mt-[-14px] text-sm text-gray-500">
                Use up to 3 tags to highlight what makes this spot unique. Your
                recommendations are personal and visible only to those you share
                your profile link with.
              </span>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold">Country</span>
              <mat-form-field appearance="outline">
                <input matInput formControlName="country" />
              </mat-form-field>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold">City</span>
              <mat-form-field appearance="outline">
                <input matInput formControlName="city" />
              </mat-form-field>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-bold">Destination Category</span>
              <mat-form-field appearance="outline">
                <mat-select formControlName="destinationCategory">
                  @for (
                    destinationCategory of destinationCategories | keyvalue;
                    track destinationCategory.key
                  ) {
                    <mat-option [value]="destinationCategory.key">{{
                      destinationCategory.value
                    }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </form>

          <div class="flex justify-between pt-4">
            <button (click)="onCancel()">Cancel</button>
            <button
              [disabled]="!spotForm.valid || !selectedPlace()"
              class="disabled:text-gray-400"
              (click)="onSubmit()">
              Add place
            </button>
          </div>
        </div>
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

  private fb: FormBuilder = inject(FormBuilder);
  private spotService = inject(SpotService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);

  tags: Tag = tags;
  categories: Category = categories;
  destinationCategories: DestinationCategory = destinationCategories;

  spotForm = this.fb.group({
    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    destinationCategory: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    country: new FormControl(
      { value: '', disabled: true },
      { nonNullable: true, validators: [Validators.required] }
    ),
    city: new FormControl(
      { value: '', disabled: true },
      { nonNullable: true, validators: [Validators.required] }
    ),
    tags: new FormControl<string[]>([], { nonNullable: true }),
  });

  tagCtrl = new FormControl('');
  selectedTags = signal<string[]>([]);

  selectedPlace = signal<Place | null>(null);
  locationInfo = signal<LocationInfo | null>(null);
  private map?: Map;
  private autocomplete?: Autocomplete;
  private currentMarker?: AdvancedMarkerElement;

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
        this.spotForm.controls.destinationCategory.enable();
        this.spotForm.controls.category.enable();
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
          const { place: placeDetails, locationInfo } =
            await this.spotService.getPlaceDetails(place.place_id);

          console.log(placeDetails);

          this.selectedPlace.set(placeDetails);

          // Update form with location info
          this.spotForm.patchValue({
            country: locationInfo.country,
            city: locationInfo.city,
          });
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private async updateMarker(place: Place) {
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
      .filter(([key]) => !this.selectedTags().includes(key))
      .filter(([, tagValue]) => tagValue.toLowerCase().includes(filterValue))
      .map(([key, value]) => ({ key, value }));
  }

  async onSubmit() {
    if (this.spotForm.valid && this.selectedPlace()) {
      const formValue = this.spotForm.getRawValue();

      const spot: Spot = {
        ...formValue,
        name: this.selectedPlace()!.displayName!,
        id: this.selectedPlace()!.id!,
        formattedAddress: this.selectedPlace()!.formattedAddress!,
        latitude: this.selectedPlace()!.location!.lat(),
        longitude: this.selectedPlace()!.location!.lng(),
        addedBy: [this.authService.uid()!],
      };
      try {
        await this.spotService.addSpot(spot);
        this.onCancel();
        this.snackBar.open('Spot added successfully', 'Close', {
          duration: 3000,
        });
      } catch (error) {
        console.error('Error adding spot:', error);
        this.snackBar.open('Error adding spot', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  private resetTags() {
    this.selectedTags.set([]);
    this.tagCtrl.setValue('');
    this.tagInput.nativeElement.value = '';
  }

  private resetForm() {
    this.selectedPlace.set(null);
    this.spotForm.reset();
    this.resetTags();
  }

  onCancel() {
    this.resetForm();
  }

  addTag(event: { option: { value: string } }) {
    const currentTags = this.selectedTags();
    if (currentTags.length < 3) {
      const newTags = [...currentTags, event.option.value];
      this.selectedTags.set(newTags);
      this.spotForm.get('tags')?.setValue(newTags);
      this.tagCtrl.setValue('');
    }
    this.tagCtrl.setValue('');
    if (this.tagInput?.nativeElement) {
      this.tagInput.nativeElement.value = '';
    }
  }

  removeTag(tagToRemove: string) {
    const newTags = this.selectedTags().filter(tag => tag !== tagToRemove);
    this.selectedTags.set(newTags);
    this.spotForm.get('tags')?.setValue(newTags);
  }
}
