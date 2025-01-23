import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';
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

@Injectable({
  providedIn: 'root',
})
export class SpotService {
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
        'plusCode',
        'types',
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

    console.log('Location Info:', locationInfo);
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
}
