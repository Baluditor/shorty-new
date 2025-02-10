import {
  computed,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  arrayUnion,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { ActivationEnd, Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  retry,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryKey } from '../constants/categories';
import { AuthService } from '../services/auth.service';
import { Country } from '../types/country.type';
import {
  AdvancedMarkerElement,
  Autocomplete,
  LocationInfo,
  Map,
  MapLibrary,
  MarkerLibrary,
  Place,
  PlacesLibrary,
} from '../types/google.types';
import { Spot } from '../types/spot.type';
import { sanitizeName } from '../utils/utils';

const SPOT_COLLECTION_NAME = 'shorty_simple_spots';
const COUNTRIES_COLLECTION_NAME = 'shorty_simple_countries';
const USERS_SPOTS_COLLECTION_NAME = 'shorty_simple_users_spots';

export type SpotCountByCountry = {
  [key: string]: number;
};

export type SpotCountByCity = {
  [key: string]: number;
};

export type SpotCountByCategory = {
  [key in CategoryKey]: number;
};

export type SpotState = {
  spots: Spot[];
  filteredSpots: Spot[];
  countries: Country[];
  categories: CategoryKey[];
  selectedCountry: string | undefined;
  citiesInSelectedCountry: string[];
  selectedCity: string | undefined;
  categoriesInSelectedCity: CategoryKey[];
  selectedCategory: CategoryKey | undefined;
  spotsCountByCategory: SpotCountByCategory;
  loading: boolean;
  error: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class SpotService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private loader = new Loader({
    apiKey: environment.googleMapsApiKey,
    version: 'weekly',
    libraries: ['places', 'marker'],
  });

  private mapsPromise: Promise<MapLibrary> = this.loader.importLibrary('maps');
  private placesPromise: Promise<PlacesLibrary> =
    this.loader.importLibrary('places');
  private markerPromise: Promise<MarkerLibrary> =
    this.loader.importLibrary('marker');

  private state: WritableSignal<SpotState> = signal<SpotState>({
    spots: [],
    filteredSpots: [],
    countries: [],
    categories: [],
    selectedCountry: undefined,
    citiesInSelectedCountry: [],
    selectedCity: undefined,
    categoriesInSelectedCity: [],
    spotsCountByCategory: {} as SpotCountByCategory,
    selectedCategory: undefined,
    loading: true,
    error: null,
  });

  private $selectedCountry: BehaviorSubject<string | undefined> =
    new BehaviorSubject<string | undefined>(undefined);

  private $cities: BehaviorSubject<string[] | undefined> = new BehaviorSubject<
    string[] | undefined
  >(undefined);

  private $selectedCity: BehaviorSubject<string | undefined> =
    new BehaviorSubject<string | undefined>(undefined);

  private $categories: BehaviorSubject<CategoryKey[] | undefined> =
    new BehaviorSubject<CategoryKey[] | undefined>(undefined);

  private $selectedCategory: BehaviorSubject<CategoryKey | undefined> =
    new BehaviorSubject<CategoryKey | undefined>(undefined);

  private $filteredSpots: BehaviorSubject<Spot[] | undefined> =
    new BehaviorSubject<Spot[] | undefined>(undefined);

  $spots = this.getSpots().pipe(
    retry({ delay: () => this.authService.user$.pipe(filter(user => !!user)) })
  );

  $countries = this.getCountries().pipe(
    retry({ delay: () => this.authService.user$.pipe(filter(user => !!user)) })
  );

  spots: Signal<Spot[]> = computed(() => this.state().spots);
  spotsCount: Signal<number> = computed(() => this.state().spots.length);
  filteredSpots: Signal<Spot[]> = computed(() => this.state().filteredSpots);
  filteredSpotsCount: Signal<number> = computed(
    () => this.state().filteredSpots.length
  );
  selectedCountry: Signal<string | undefined> = computed(
    () => this.state().selectedCountry
  );
  citiesInSelectedCountry: Signal<string[]> = computed(
    () => this.state().citiesInSelectedCountry
  );
  selectedCity: Signal<string | undefined> = computed(
    () => this.state().selectedCity
  );
  categoriesInSelectedCity: Signal<CategoryKey[]> = computed(
    () => this.state().categoriesInSelectedCity
  );
  selectedCategory: Signal<CategoryKey | undefined> = computed(
    () => this.state().selectedCategory
  );
  loading: Signal<boolean> = computed(() => this.state().loading);
  error: Signal<string | null> = computed(() => this.state().error);

  countries: Signal<Country[]> = computed(() => this.state().countries);
  spotsCountInCountry: Signal<number> = computed(
    () => this.state().spots.length
  );

  spotsCountByCountry: Signal<SpotCountByCountry> = computed(() => {
    const spotsCountInCountry: SpotCountByCountry = {} as SpotCountByCountry;
    this.state().spots.forEach(spot => {
      if (spotsCountInCountry[spot.country]) {
        spotsCountInCountry[spot.country]++;
      } else {
        spotsCountInCountry[spot.country] = 1;
      }
    });

    return spotsCountInCountry;
  });

  cities: Signal<string[]> = computed(() =>
    this.state().spots.map(spot => spot.city)
  );

  categories: Signal<CategoryKey[]> = computed(() =>
    Array.from(
      new Set(this.state().spots.map(spot => spot.category as CategoryKey))
    )
  );

  spotsCountByCategory: Signal<SpotCountByCategory> = computed(
    () => this.state().spotsCountByCategory
  );

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof ActivationEnd) {
        console.log(event.snapshot.params);
        const params = event.snapshot.params;
        this.setSelectedCountry(params['country']);
        this.setSelectedCity(params['city']);
        this.setSelectedCategory(params['category'] as CategoryKey);
      }
    });

    combineLatest([
      this.$spots,
      this.$countries,
      this.$selectedCountry,
      this.$selectedCity,
      this.$selectedCategory,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(
        ([spots, countries, selectedCountry, selectedCity, selectedCategory]: [
          Spot[],
          Country[],
          string | undefined,
          string | undefined,
          CategoryKey | undefined,
        ]) => {
          const citiesInSelectedCountry =
            countries.find(
              (country: Country) => country.country === selectedCountry
            )?.cities ?? [];

          const categoriesInSelectedCity: CategoryKey[] = spots
            .filter(spot => spot.city === selectedCity)
            .map(spot => spot.category as CategoryKey);

          const filteredSpots: Spot[] = spots.filter(
            (spot: Spot) =>
              (!selectedCountry || spot.country === selectedCountry) &&
              (!selectedCity || spot.city === selectedCity) &&
              (!selectedCategory || spot.category === selectedCategory)
          );

          const spotsCountByCategory: SpotCountByCategory =
            {} as SpotCountByCategory;
          filteredSpots.forEach(spot => {
            if (spotsCountByCategory[spot.category as CategoryKey]) {
              spotsCountByCategory[spot.category as CategoryKey]++;
            } else {
              spotsCountByCategory[spot.category as CategoryKey] = 1;
            }
          });

          const categories: CategoryKey[] = Array.from(
            new Set(filteredSpots.map(spot => spot.category as CategoryKey))
          );

          console.log(filteredSpots);

          this.state.set({
            ...this.state(),
            loading: false,
            spots: spots,
            countries: countries,
            categories: categories,
            filteredSpots: filteredSpots,
            citiesInSelectedCountry: citiesInSelectedCountry,
            selectedCountry: selectedCountry,
            selectedCity: selectedCity,
            categoriesInSelectedCity: categoriesInSelectedCity,
            spotsCountByCategory: spotsCountByCategory,
            selectedCategory: selectedCategory,
          });
          this.$filteredSpots.next(filteredSpots);
        }
      );
  }

  private getSpots(): Observable<Spot[]> {
    return collectionData(collection(this.firestore, SPOT_COLLECTION_NAME), {
      idField: 'id',
    }) as Observable<Spot[]>;
  }

  private getCountries(): Observable<Country[]> {
    return collectionData(
      collection(this.firestore, COUNTRIES_COLLECTION_NAME),
      {
        idField: 'country',
      }
    ) as Observable<Country[]>;
  }

  async initMap(
    mapElement: HTMLElement
  ): Promise<{ map: Map; marker: AdvancedMarkerElement }> {
    // Request needed libraries.
    const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
      this.mapsPromise,
      this.markerPromise,
    ]);

    // Initialize the map.
    const map = new Map(mapElement, {
      center: { lat: 40.749933, lng: -73.98633 },
      zoom: 13,
      mapTypeControl: false,
      mapId: 'DEMO_MAP_ID',
    });

    const marker = new AdvancedMarkerElement({
      map,
    });

    return { map, marker };
  }

  async initAutocomplete(
    inputElement: HTMLInputElement,
    map: Map
  ): Promise<Autocomplete> {
    const { Autocomplete } = (await this.placesPromise) as PlacesLibrary;

    const autocomplete = new Autocomplete(inputElement, {
      fields: ['place_id', 'name', 'types'],
      strictBounds: false,
    });

    autocomplete.bindTo('bounds', map);
    return autocomplete;
  }

  async getPlaceDetails(
    placeId: string
  ): Promise<{ place: Place; locationInfo: LocationInfo }> {
    const { Place } = (await this.placesPromise) as PlacesLibrary;

    const place = new Place({
      id: placeId,
      requestedLanguage: 'en',
    });

    await place.fetchFields({
      fields: [
        'displayName',
        'formattedAddress',
        'location',
        'addressComponents',
      ],
    });

    // Extract city and country from address components
    const addressComponents = place.addressComponents;
    const locationInfo = {
      country:
        addressComponents?.find(component =>
          component.types.includes('country')
        )?.longText || '',
      city:
        addressComponents?.find(component =>
          component.types.includes('locality')
        )?.longText ||
        addressComponents?.find(component =>
          component.types.includes('administrative_area_level_1')
        )?.longText ||
        '',
      state:
        addressComponents?.find(component =>
          component.types.includes('administrative_area_level_1')
        )?.longText || '',
      postalCode:
        addressComponents?.find(component =>
          component.types.includes('postal_code')
        )?.longText || '',
    };

    return { place, locationInfo };
  }

  async createMarker(map: Map, place: Place): Promise<AdvancedMarkerElement> {
    const { AdvancedMarkerElement } = (await this
      .markerPromise) as MarkerLibrary;

    return new AdvancedMarkerElement({
      map,
      position: place.location,
      title: place.displayName,
    });
  }

  async addSpot(spot: Spot): Promise<void> {
    spot.country = sanitizeName(spot.country);
    spot.city = sanitizeName(spot.city);
    const spotFromDB = await getDoc(
      doc(this.firestore, SPOT_COLLECTION_NAME, spot.id)
    );
    if (spotFromDB.exists()) {
      updateDoc(spotFromDB.ref, {
        addedBy: arrayUnion(this.authService.uid()!),
      });
    } else {
      setDoc(spotFromDB.ref, {
        ...spot,
        addedBy: [this.authService.uid()!],
      });
    }

    const countriesDoc = doc(
      this.firestore,
      COUNTRIES_COLLECTION_NAME,
      spot.country
    );
    const countryDoc = await getDoc(countriesDoc);
    if (!countryDoc.exists()) {
      setDoc(countriesDoc, {
        cities: [spot.city],
      });
    } else {
      updateDoc(countriesDoc, {
        cities: arrayUnion(spot.city),
      });
    }

    const usersSpotsDocRef = doc(
      this.firestore,
      USERS_SPOTS_COLLECTION_NAME,
      this.authService.uid()!
    );

    const usersSpotsDoc = await getDoc(usersSpotsDocRef);
    if (!usersSpotsDoc.exists()) {
      setDoc(usersSpotsDocRef, {
        spots: [spot.id],
      });
    } else {
      updateDoc(usersSpotsDocRef, {
        spots: arrayUnion(spot.id),
      });
    }
  }

  setSelectedCountry(country: string) {
    this.$selectedCountry.next(country);
  }

  setSelectedCity(city: string) {
    this.$selectedCity.next(city);
  }

  setSelectedCategory(category: CategoryKey) {
    this.$selectedCategory.next(category);
  }
}
