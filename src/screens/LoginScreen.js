import React, { useState } from 'react';
import {
  Keyboard,
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

export default function LoginScreen({ error, loading, onBack, onForgotPassword, onLogin, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setLocalError('Enter your email and password.');
      return;
    }

    setLocalError('');
    Keyboard.dismiss();
    await onLogin({ email, password });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SectionCard title="Welcome back" description="Log in to keep your bingo card synced across iOS and web.">
          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              editable={!loading}
              importantForAutofill="no"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              spellCheck={false}
              style={styles.input}
              textContentType="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              editable={!loading}
              importantForAutofill="no"
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              spellCheck={false}
              style={styles.input}
              textContentType="oneTimeCode"
              value={password}
              onChangeText={setPassword}
            />

            {localError || error ? <Text style={styles.errorText}>{localError || error}</Text> : null}

            <Pressable onPress={handleSubmit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Log in'}</Text>
            </Pressable>

            <Pressable onPress={() => {
              Keyboard.dismiss();
              onForgotPassword();
            }} style={styles.textButton}>
              <Text style={styles.textButtonLabel}>Forgot your password?</Text>
            </Pressable>

            <Pressable onPress={() => {
              Keyboard.dismiss();
              onSignup();
            }} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </Pressable>

            <Pressable onPress={() => {
              Keyboard.dismiss();
              onBack();
            }} style={styles.textButton}>
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
  textButtonLabel: {
    color: '#ea580c',
    fontSize: 14,
    fontWeight: '700',
  },
  backLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
});
