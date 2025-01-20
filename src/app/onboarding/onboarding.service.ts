import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { TakenUsernameModel } from '../models/taken-username.model';
import { AuthService } from '../services/auth.service';

const COLLECTION_NAME = 'shorty_simple_taken_usernames';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);

  async checkIfUserNameTaken(displayName: string): Promise<boolean> {
    const uid = this.authService.uid();
    if (!uid) {
      throw new Error('User not logged in');
    }
    const username = displayName.toLowerCase();
    const q = query(
      collection(this.firestore, COLLECTION_NAME),
      where('username', '==', username)
    );

    const querySnapshot = await getDocs(q);

    const data: TakenUsernameModel[] = querySnapshot.docs.map(
      doc => doc.data() as TakenUsernameModel
    );
    console.log(data);
    return data.length > 0;
  }

  async setTakenUsername(displayName: string) {
    const uid = this.authService.uid();
    if (!uid || !displayName) {
      throw new Error('User not logged in');
    }
    const data: TakenUsernameModel = {
      displayName,
      username: displayName.toLowerCase(),
    };
    const docRef = doc(this.firestore, COLLECTION_NAME, uid);
    await setDoc(docRef, data);
  }
}
