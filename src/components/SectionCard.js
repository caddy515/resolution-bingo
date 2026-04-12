import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SectionCard({ title, description, children, style, compact = false }) {
  return (
    <View style={[styles.card, compact && styles.compactCard, style]}>
      {title ? <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text> : null}
      {description ? <Text style={[styles.description, compact && styles.compactDescription]}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  compactCard: {
    padding: 8,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 14,
  },
  compactTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  compactDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
});
