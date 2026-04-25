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

export default function ForgotPasswordScreen({ error, loading, onBack, onSubmit }) {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  async function handleSubmit() {
    if (!email.trim()) {
      setLocalError('Enter your email address.');
      return;
    }

    setLocalError('');
    Keyboard.dismiss();
    const result = await onSubmit(email);

    if (result?.ok) {
      setStatusMessage(result.message);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SectionCard title="Reset your password" description="Enter the email tied to your account and Firebase will send the reset link.">
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
              onChangeText={(value) => {
                setEmail(value);
                setStatusMessage('');
              }}
            />

            {localError || error ? <Text style={styles.errorText}>{localError || error}</Text> : null}
            {statusMessage ? <Text style={styles.successText}>{statusMessage}</Text> : null}

            <Pressable onPress={handleSubmit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Send reset email'}</Text>
            </Pressable>

            <Pressable onPress={() => {
              Keyboard.dismiss();
              onBack();
            }} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to log in</Text>
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
  successText: {
    color: '#166534',
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
});
