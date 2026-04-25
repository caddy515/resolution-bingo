import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import SectionCard from '../components/SectionCard';

function getPasswordError(password) {
  if (password.length < 10) {
    return 'Use a password with at least 10 characters.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Add at least one lowercase letter to your password.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Add at least one uppercase letter to your password.';
  }

  if (!/[0-9]/.test(password)) {
    return 'Add at least one number to your password.';
  }

  return '';
}

export default function SignupScreen({ error, loading, onBack, onLogin, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  async function handleSubmit() {
    if (!email.trim() || !password || !confirmPassword) {
      setLocalError('Enter your email, password, and password confirmation.');
      return;
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      setLocalError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setLocalError('');
    await onSignup({ email, password });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SectionCard
          title="Create your account"
          description="Your bingo card will live in Firestore so the same data is available on iOS and web."
        >
          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!loading}
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              editable={!loading}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              style={styles.input}
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
            />
            <Text style={styles.helperText}>Use 10+ characters with uppercase, lowercase, and a number.</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect={false}
              editable={!loading}
              placeholder="Confirm password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              style={styles.input}
              textContentType="oneTimeCode"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {localError || error ? <Text style={styles.errorText}>{localError || error}</Text> : null}

            <Pressable onPress={handleSubmit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>{loading ? 'Creating account...' : 'Create account'}</Text>
            </Pressable>

            <Pressable onPress={onLogin} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Already have an account? Log in</Text>
            </Pressable>

            <Pressable onPress={onBack} style={styles.textButton}>
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
          </View>
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  form: {
    gap: 12,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 18,
  },
  helperText: {
    marginTop: -4,
    color: '#64748b',
    fontSize: 12,
    lineHeight: 16,
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
});
