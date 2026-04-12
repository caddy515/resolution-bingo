import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, hasFirebaseConfig, firebaseSetupMessage } from './config';

function ensureAuth() {
  if (!hasFirebaseConfig || !auth) {
    throw new Error(firebaseSetupMessage);
  }

  return auth;
}

function normalizeAuthError(error) {
  const code = typeof error?.code === 'string' ? error.code.replace(/^auth\//, '') : '';
  const message = typeof error?.message === 'string' ? error.message : '';

  if (!message && !code) {
    return 'Something went wrong with Firebase Authentication.';
  }

  const cleanedMessage = message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/g, '').trim();

  if (cleanedMessage && code) {
    return `${cleanedMessage} [${code}]`;
  }

  return cleanedMessage || `Authentication error [${code}]`;
}

export function subscribeToAuthChanges(callback) {
  if (!hasFirebaseConfig || !auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInWithEmail(email, password) {
  try {
    return await signInWithEmailAndPassword(ensureAuth(), email.trim(), password);
  } catch (error) {
    throw new Error(normalizeAuthError(error));
  }
}

export async function signUpWithEmail(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(ensureAuth(), email.trim(), password);
    try {
      await sendEmailVerification(credential.user);
    } catch (_error) {}
    return credential;
  } catch (error) {
    throw new Error(normalizeAuthError(error));
  }
}

export async function sendPasswordResetEmailToUser(email) {
  try {
    return await sendPasswordResetEmail(ensureAuth(), email.trim());
  } catch (error) {
    throw new Error(normalizeAuthError(error));
  }
}

export async function signOutCurrentUser() {
  try {
    return await signOut(ensureAuth());
  } catch (error) {
    throw new Error(normalizeAuthError(error));
  }
}
