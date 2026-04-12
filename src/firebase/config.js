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
    'AIzaSyCn6JVwtQf_I4OggTXpHeuTjWCALMUi_rY',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    extra.firebaseAuthDomain ||
    'resolution-bingo-be98b.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    extra.firebaseProjectId ||
    'resolution-bingo-be98b',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    extra.firebaseStorageBucket ||
    'resolution-bingo-be98b.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    extra.firebaseMessagingSenderId ||
    '553285296918',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    extra.firebaseAppId ||
    '1:553285296918:web:b0a1833be1bbd49704e637',
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
