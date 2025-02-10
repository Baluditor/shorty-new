export type Category = {
  [key: string]: string;
};

export const categories: Category = {
  restaurant: 'Restaurant',
  bakery: 'Bakery',
  cafe: 'Cafe',
  aquarium: 'Aquarium',
  spa: 'Spa',
  amusement_park: 'Amusement park',
  art_gallery: 'Art gallery',
  bar: 'Bar',
  night_club: 'Night club',
};

export type CategoryKey =
  | 'restaurant'
  | 'bakery'
  | 'cafe'
  | 'aquarium'
  | 'spa'
  | 'amusement_park'
  | 'art_gallery'
  | 'bar'
  | 'night_club';
