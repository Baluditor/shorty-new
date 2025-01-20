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
  AdditionalUserInfo,
  Auth,
  authState,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
} from '@angular/fire/auth';
import {
  doc,
  docData,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  readonly user$: Observable<UserModel | null> = authState(this.auth).pipe(
    switchMap(user => {
      if (!user) return of(null);
      const userDoc = doc(this.firestore, 'shorty_simple_users', user.uid);
      return docData(userDoc) as Observable<UserModel>;
    })
  );

  private _user: WritableSignal<UserModel | null | undefined> =
    signal(undefined);
  onboardingLoading: WritableSignal<boolean> = signal(true);

  user: Signal<UserModel | null | undefined> = computed(() => this._user());

  displayName: Signal<string | undefined> = computed(
    () => this.user()?.displayName
  );

  uid: Signal<string | undefined> = computed(() => this.user()?.uid);

  constructor() {
    this.user$.pipe(takeUntilDestroyed()).subscribe(user => {
      this._user.set(user);
      this.onboardingLoading.set(false);
    });
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result: UserCredential = await signInWithPopup(this.auth, provider);
      const additionalUserInfo: AdditionalUserInfo | null =
        getAdditionalUserInfo(result);

      if (additionalUserInfo?.isNewUser) {
        await this.createUser(result.user);
      } else {
        const user: UserModel | null = await this.getUser(result.user.uid);

        if (!user) {
          await this.createUser(result.user);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async createUser(user: User) {
    const userRef = doc(this.firestore, 'shorty_simple_users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.metadata.creationTime,
      lastLoginAt: user.metadata.lastSignInTime,
      uid: user.uid,
      onboardingStep: 1,
      onboardingCompleted: false,
    });
  }

  async getUser(uid: string) {
    const userRef = doc(this.firestore, 'shorty_simple_users', uid);
    const user = await getDoc(userRef);
    return user.data() as UserModel | null;
  }

  async updateUser(user: Partial<UserModel>) {
    if (this.user()?.uid) {
      const userRef = doc(
        this.firestore,
        'shorty_simple_users',
        // @ts-expect-error user is not null
        this.user().uid!
      );
      await updateDoc(userRef, user);
    }
  }
}
