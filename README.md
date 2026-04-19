# Resolution Bingo

Universal Expo app for iOS and web. Users sign in with Firebase email/password auth, build a 5x5 New Year's resolution bingo card, save it to Firestore, track progress through the year, and get full-screen bingo and blackout celebrations.

## Quick start

Install dependencies:

```bash
npm install
```

Add Firebase config:

1. Create a Firebase project and a web app.
2. Enable `Authentication > Sign-in method > Email/Password`.
3. Create Firestore in production or test mode.
4. Paste the Firebase web config values into [src/firebase/config.js](/Users/evanluscher/resolution-bingo/src/firebase/config.js) or provide these env vars:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY=
```

Run on iOS:

```bash
npm run ios
```

Run on web:

```bash
npm run web
```

Run the generic Expo dev server:

```bash
npm start
```

## Notes

- Firestore path: `users/{uid}/cards/{year}`
- The app stays runnable without Firebase credentials, but auth and persistence will show a setup notice until config is filled in.
- Main Expo entry: [App.js](/Users/evanluscher/resolution-bingo/App.js)
- Firestore rules file: [firestore.rules](/Users/evanluscher/resolution-bingo/firestore.rules)

## Security setup

Before release, complete these Firebase console steps:

1. In `Authentication` -> `Sign-in method` -> `Email/Password`, enable email/password sign-in.
2. In `Authentication` -> `Settings` -> `Password policy`, enable a policy that requires:
   - at least 10 characters
   - uppercase
   - lowercase
   - number
3. In `Firestore Database` -> `Rules`, replace the rules with the contents of [firestore.rules](/Users/evanluscher/resolution-bingo/firestore.rules).
4. In `Build` -> `App Check`, register your web app and create a reCAPTCHA site key.
5. Paste that site key into `EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY`.
6. In `App Check`, first turn on monitoring for Firestore, then enforce App Check for Firestore after you confirm the app is sending valid tokens.

Notes:
- The current app wires App Check for web when `EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` is set.
- Native Expo + Firebase JS SDK App Check is not fully wired here. The most important hardening for this app is still strong Firestore rules plus Firebase Auth settings.

## Exactly what you need to do

1. Open Firebase Console and create a project.
2. In that project, click `Add app` and choose the `Web` app option.
3. Firebase will show a config object with:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
4. Copy those six values into [src/firebase/config.js](/Users/evanluscher/resolution-bingo/src/firebase/config.js), replacing the `PASTE_...` placeholders.
5. In Firebase Console, open `Authentication`, then `Sign-in method`, then enable `Email/Password`.
6. In Firebase Console, open `Firestore Database` and create the database.
7. Run the app and create a test account.

The app code is already written. What you need to provide is only the Firebase project configuration and the Firebase console setup.

## Resume work next time

When coming back to this project later, start here:

```bash
cd /Users/evanluscher/resolution-bingo
git pull
git status
```

If you want to run the app locally:

```bash
npm install
npx expo start
```

If you want to continue iOS release work:

```bash
npx eas build -p ios --profile production
npx eas submit -p ios --profile production
```

Important reminders:

- Firebase values are no longer hardcoded in the repo.
- Production/TestFlight builds depend on EAS environment variables being set.
- The required production EAS env vars are:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY
```

- App Check should stay in `Monitoring` for native iOS until native App Check is implemented properly.
- Public docs are hosted from the repo `/docs` folder through GitHub Pages.
- Public URLs currently expected:
  - `https://caddy515.github.io/resolution-bingo/`
  - `https://caddy515.github.io/resolution-bingo/privacy-policy.html`
  - `https://caddy515.github.io/resolution-bingo/terms-of-use.html`
  - `https://caddy515.github.io/resolution-bingo/support.html`
