import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

const extra = Constants.expoConfig?.extra || {};

export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    extra.firebaseApiKey ||
    'PASTE_FIREBASE_API_KEY',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    extra.firebaseAuthDomain ||
    'PASTE_FIREBASE_AUTH_DOMAIN',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    extra.firebaseProjectId ||
    'PASTE_FIREBASE_PROJECT_ID',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    extra.firebaseStorageBucket ||
    'PASTE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    extra.firebaseMessagingSenderId ||
    'PASTE_FIREBASE_MESSAGING_SENDER_ID',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    extra.firebaseAppId ||
    'PASTE_FIREBASE_APP_ID',
};

export const firebaseAppCheckSiteKey =
  process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY || extra.firebaseAppCheckSiteKey || '';

const placeholderValues = Object.values(firebaseConfig).filter(
  (value) => typeof value === 'string' && value.startsWith('PASTE_')
);

export const hasFirebaseConfig = placeholderValues.length === 0;

export const firebaseSetupMessage =
  'Paste your Firebase web app values into src/firebase/config.js or set EXPO_PUBLIC_FIREBASE_* env vars before trying auth or Firestore.';

let app = null;
let auth = null;
let db = null;
let appCheck = null;

if (hasFirebaseConfig) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (_error) {
      auth = getAuth(app);
    }
  }

  db = getFirestore(app);

  if (Platform.OS === 'web' && firebaseAppCheckSiteKey) {
    import('firebase/app-check')
      .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(firebaseAppCheckSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
      })
      .catch(() => {});
  }
}

export { app, auth, db, appCheck };
