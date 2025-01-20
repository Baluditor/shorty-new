import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class SpotService {
  private readonly firestore = inject(Firestore);

  constructor() {}

  spots = [];
}
