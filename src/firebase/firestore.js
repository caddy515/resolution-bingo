import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, hasFirebaseConfig, firebaseSetupMessage } from './config';
import { sanitizeLoadedCard } from '../utils/cardTransforms';

function ensureFirestore() {
  if (!hasFirebaseConfig || !db) {
    throw new Error(firebaseSetupMessage);
  }

  return db;
}

function getCardRef(uid, year) {
  return doc(ensureFirestore(), 'users', uid, 'cards', year);
}

export async function loadUserCard(uid, year) {
  const snapshot = await getDoc(getCardRef(uid, year));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return sanitizeLoadedCard({
    id: snapshot.id,
    year: data.year || year,
    title: data.title || `My ${year} Card`,
    centerOption: data.centerOption || 'Practice gratitude',
    availableCategories: Array.isArray(data.availableCategories) ? data.availableCategories : [],
    categoryColors: data.categoryColors || {},
    customCategories: Array.isArray(data.customCategories) ? data.customCategories : [],
    entries: Array.isArray(data.entries) ? data.entries : [],
    squares: Array.isArray(data.squares) ? data.squares : [],
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
  });
}

export async function loadUserCards(uid) {
  const cardsQuery = query(collection(ensureFirestore(), 'users', uid, 'cards'), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(cardsQuery);

  return snapshot.docs.map((documentSnapshot) => {
    const data = documentSnapshot.data();
    return sanitizeLoadedCard({
      id: documentSnapshot.id,
      year: data.year || String(new Date().getFullYear()),
      title: data.title || `My ${data.year || new Date().getFullYear()} Card`,
      centerOption: data.centerOption || 'Practice gratitude',
      availableCategories: Array.isArray(data.availableCategories) ? data.availableCategories : [],
      categoryColors: data.categoryColors || {},
      customCategories: Array.isArray(data.customCategories) ? data.customCategories : [],
      entries: Array.isArray(data.entries) ? data.entries : [],
      squares: Array.isArray(data.squares) ? data.squares : [],
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
    });
  });
}

export async function saveUserCard(uid, card) {
  const cardRef = doc(ensureFirestore(), 'users', uid, 'cards', card.id);
  await setDoc(
    cardRef,
    {
      id: card.id,
      year: card.year,
      title: card.title,
      centerOption: card.centerOption,
      availableCategories: card.availableCategories,
      categoryColors: card.categoryColors,
      customCategories: card.customCategories,
      entries: card.entries,
      squares: card.squares,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteUserCard(uid, cardId) {
  await deleteDoc(doc(ensureFirestore(), 'users', uid, 'cards', cardId));
}
