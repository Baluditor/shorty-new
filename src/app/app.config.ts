import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  browserLocalPersistence,
  getAuth,
  provideAuth,
} from '@angular/fire/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  provideFirestore,
} from '@angular/fire/firestore';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'shorty-9ddc9',
        appId: '1:80746076516:web:eb5ed8299158d2271a0271',
        storageBucket: 'shorty-9ddc9.appspot.com',
        apiKey: 'AIzaSyCOutWp_zbHdqkdtN4s3Ye_kWP6NweMvSQ',
        authDomain: 'shorty-9ddc9.firebaseapp.com',
        messagingSenderId: '80746076516',
        measurementId: 'G-BFXRFJJ2F5',
      })
    ),
    provideAuth(() => {
      const auth = getAuth();
      auth.setPersistence(browserLocalPersistence);
      return auth;
    }),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    provideFirestore(() => {
      const firestore = initializeFirestore(getApp(), {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
      return firestore;
    }),
    providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
