import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CelebrationOverlay from './src/components/CelebrationOverlay';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import BuilderScreen from './src/screens/BuilderScreen';
import CardScreen from './src/screens/CardScreen';
import { hasFirebaseConfig, firebaseSetupMessage } from './src/firebase/config';
import {
  deleteCurrentUserAccount,
  subscribeToAuthChanges,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  sendPasswordResetEmailToUser,
} from './src/firebase/auth';
import { deleteAllUserData, deleteUserCard, loadUserCards, saveUserCard } from './src/firebase/firestore';
import { builderStateToCard, cardToBuilderState } from './src/utils/cardTransforms';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState('welcome');
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [accountDeleteLoading, setAccountDeleteLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cards, setCards] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);
  const [builderDraft, setBuilderDraft] = useState(null);
  const [builderMode, setBuilderMode] = useState('create');
  const [overlay, setOverlay] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setAuthUser(user);
      setAuthLoading(false);
      setAuthError('');
      if (!user) {
        setCards([]);
        setActiveCardId(null);
        setBuilderDraft(null);
        setBuilderMode('create');
        setScreen('welcome');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    let active = true;

    async function fetchCard() {
      setCardLoading(true);
      setCardError('');

      try {
        const savedCards = await loadUserCards(authUser.uid);
        if (!active) {
          return;
        }

        setCards(savedCards);
        setActiveCardId(savedCards[0]?.id || null);
        setBuilderDraft(null);
        setBuilderMode('create');
        setScreen(savedCards.length ? 'card' : 'builder');
      } catch (error) {
        if (!active) {
          return;
        }

        setCardError(error.message || 'Unable to load your bingo card right now.');
        setScreen('builder');
      } finally {
        if (active) {
          setCardLoading(false);
        }
      }
    }

    fetchCard();

    return () => {
      active = false;
    };
  }, [authUser]);

  const firebaseNotice = useMemo(() => {
    if (hasFirebaseConfig) {
      return '';
    }

    return firebaseSetupMessage;
  }, []);

  async function handleLogin(values) {
    setAuthActionLoading(true);
    setAuthError('');

    try {
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      setAuthError(error.message || 'Unable to sign in.');
    } finally {
      setAuthActionLoading(false);
    }
  }

  async function handleSignup(values) {
    setAuthActionLoading(true);
    setAuthError('');

    try {
      await signUpWithEmail(values.email, values.password);
    } catch (error) {
      setAuthError(error.message || 'Unable to create your account.');
    } finally {
      setAuthActionLoading(false);
    }
  }

  async function handleForgotPassword(email) {
    setAuthActionLoading(true);
    setAuthError('');

    try {
      await sendPasswordResetEmailToUser(email);
      return { ok: true, message: 'Password reset email sent.' };
    } catch (error) {
      setAuthError(error.message || 'Unable to send password reset email.');
      return { ok: false, message: error.message || 'Unable to send password reset email.' };
    } finally {
      setAuthActionLoading(false);
    }
  }

  async function persistCard(nextCard) {
    if (!authUser) {
      throw new Error('You must be signed in to save your bingo card.');
    }

    await saveUserCard(authUser.uid, nextCard);
    setCards((currentCards) => {
      const withoutCurrent = currentCards.filter((item) => item.id !== nextCard.id);
      return [nextCard, ...withoutCurrent];
    });
    setActiveCardId(nextCard.id);
  }

  async function handleSaveBuilder(builderState) {
    setCardLoading(true);
    setCardError('');

    try {
      const nextCard = builderStateToCard(builderState);
      await persistCard(nextCard);
      setBuilderDraft(null);
      setBuilderMode('create');
      setScreen('card');
    } catch (error) {
      setCardError(error.message || 'Unable to save your bingo card.');
    } finally {
      setCardLoading(false);
    }
  }

  async function handleSaveCard(nextCard) {
    setCardError('');

    try {
      await persistCard(nextCard);
    } catch (error) {
      setCardError(error.message || 'Unable to save your latest progress.');
      throw error;
    }
  }

  async function handleLogout() {
    setCardError('');

    try {
      await signOutCurrentUser();
    } catch (error) {
      setCardError(error.message || 'Unable to sign out right now.');
    }
  }

  async function handleDeleteCard(cardId) {
    if (!authUser) {
      return;
    }

    try {
      await deleteUserCard(authUser.uid, cardId);
      setCards((currentCards) => {
        const nextCards = currentCards.filter((item) => item.id !== cardId);
        setActiveCardId(nextCards[0]?.id || null);
        if (!nextCards.length) {
          setBuilderDraft(null);
          setBuilderMode('create');
          setScreen('builder');
        }
        return nextCards;
      });
    } catch (error) {
      setCardError(error.message || 'Unable to delete this card.');
    }
  }

  async function handleDeleteAccount() {
    if (!authUser) {
      return;
    }

    setAccountDeleteLoading(true);
    setCardError('');

    try {
      await deleteAllUserData(authUser.uid);
      await deleteCurrentUserAccount();
    } catch (error) {
      setCardError(
        error.message ||
          'Unable to delete your account right now. If prompted by Firebase, sign in again and retry.'
      );
    } finally {
      setAccountDeleteLoading(false);
    }
  }

  function handleCreateCard() {
    setBuilderDraft(null);
    setBuilderMode('create');
    setScreen('builder');
  }

  if (authLoading || cardLoading || accountDeleteLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingScreen}>
          <StatusBar style="dark" />
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={styles.loadingText}>
            {authLoading
              ? 'Checking your session...'
              : accountDeleteLoading
                ? 'Deleting your account...'
                : 'Loading your bingo card...'}
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const activeCard = cards.find((item) => item.id === activeCardId) || null;
  const builderInitialState =
    builderMode === 'edit'
      ? builderDraft || (activeCard && screen === 'builder' ? cardToBuilderState(activeCard) : undefined)
      : undefined;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.appShell}>
        <StatusBar style="dark" />

        {firebaseNotice ? (
          <View style={styles.noticeBanner}>
            <Text style={styles.noticeTitle}>Firebase setup needed</Text>
            <Text style={styles.noticeText}>{firebaseNotice}</Text>
          </View>
        ) : null}

        {cardError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{cardError}</Text>
          </View>
        ) : null}

        {!authUser && screen === 'welcome' ? (
          <WelcomeScreen
            onLogin={() => setScreen('login')}
            onSignup={() => setScreen('signup')}
            onPreview={() => setScreen('login')}
          />
        ) : null}

        {!authUser && screen === 'login' ? (
          <LoginScreen
            loading={authActionLoading}
            error={authError}
            onBack={() => setScreen('welcome')}
            onForgotPassword={() => setScreen('forgot-password')}
            onLogin={handleLogin}
            onSignup={() => setScreen('signup')}
          />
        ) : null}

        {!authUser && screen === 'signup' ? (
          <SignupScreen
            loading={authActionLoading}
            error={authError}
            onBack={() => setScreen('welcome')}
            onLogin={() => setScreen('login')}
            onSignup={handleSignup}
          />
        ) : null}

        {!authUser && screen === 'forgot-password' ? (
          <ForgotPasswordScreen
            loading={authActionLoading}
            error={authError}
            onBack={() => setScreen('login')}
            onSubmit={handleForgotPassword}
          />
        ) : null}

        {authUser && screen === 'builder' ? (
          <BuilderScreen
            deletingAccount={accountDeleteLoading}
            initialState={builderInitialState}
            loading={cardLoading}
            userEmail={authUser.email}
            onBack={activeCard ? () => setScreen('card') : undefined}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleLogout}
            onSave={handleSaveBuilder}
          />
        ) : null}

        {authUser && screen === 'card' && activeCard ? (
          <CardScreen
            card={activeCard}
            cards={cards}
            deletingAccount={accountDeleteLoading}
            userEmail={authUser.email}
            onCreateCard={handleCreateCard}
            onDeleteAccount={handleDeleteAccount}
            onDeleteCard={handleDeleteCard}
            onEditCard={() => {
              setBuilderDraft(cardToBuilderState(activeCard));
              setBuilderMode('edit');
              setScreen('builder');
            }}
            onLogout={handleLogout}
            onSaveCard={handleSaveCard}
            onSelectCard={setActiveCardId}
            onShowCelebration={(title, message) =>
              setOverlay({ visible: true, title, message })
            }
          />
        ) : null}

        <CelebrationOverlay
          visible={overlay.visible}
          title={overlay.title}
          message={overlay.message}
          onDismiss={() => setOverlay({ visible: false, title: '', message: '' })}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#fffaf5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#475569',
  },
  noticeBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9a3412',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#9a3412',
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    fontSize: 13,
    color: '#991b1b',
  },
});
