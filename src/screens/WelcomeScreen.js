import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import SectionCard from '../components/SectionCard';
import { BASE_CATEGORIES, CENTER_SQUARE_OPTIONS, DEFAULT_CARD } from '../data/defaults';
import { buildSquares } from '../utils/cardTransforms';

function ActionButton({ label, onPress, secondary = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        secondary ? styles.secondaryButton : styles.primaryButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.actionButtonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

export default function WelcomeScreen({ onLogin, onSignup, onPreview }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 980;
  const isCompact = width < 430;
  const previewGap = isCompact ? 4 : 8;
  const previewCellWidth = isWide ? '18%' : Math.max(44, Math.floor((width - 92 - previewGap * 4) / 5));
  const previewSquares = buildSquares(
    DEFAULT_CARD.map((entry, index) => ({
      ...entry,
      completed: index === 12,
    })),
    CENTER_SQUARE_OPTIONS[0]
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.layout, isWide && styles.layoutWide]}>
        <SectionCard style={[styles.heroCard, isWide && styles.heroWide]}>
          <Text style={styles.badge}>New Year goal tracking, but fun</Text>
          <Text style={styles.title}>Resolution Bingo</Text>
          <Text style={styles.subtitle}>
            Build a 5x5 bingo card with your goals for the year. Check them off, earn bingos, go for blackout, and
            celebrate progress with a little joy instead of guilt.
          </Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>Build your card</Text>
              <Text style={styles.featureText}>Add 25 goals from tiny wins to stretch goals, each with a category.</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>Track progress</Text>
              <Text style={styles.featureText}>Keep the freebie in the center and work the board throughout the year.</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>Celebrate hard</Text>
              <Text style={styles.featureText}>Bingo and blackout celebrations sweep across the whole screen.</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <ActionButton label="Log in" onPress={onLogin} />
            <ActionButton label="Create account" onPress={onSignup} secondary />
          </View>
        </SectionCard>

        <SectionCard
          title="Example Card"
          description="The center freebie starts complete so the board feels alive immediately."
          style={[styles.previewCard, isWide && styles.previewWide]}
        >
          <View style={[styles.previewGrid, { gap: previewGap }]}>
            {previewSquares.map((square) => (
              <View
                key={square.id}
                style={[
                  styles.previewSquare,
                  { width: previewCellWidth },
                  isCompact && styles.previewSquareCompact,
                  square.isCenter && styles.centerPreviewSquare,
                  square.completed && styles.completedPreviewSquare,
                ]}
              >
                <Text
                  style={[
                    styles.previewCategory,
                    isCompact && styles.previewCategoryCompact,
                  ]}
                >
                  {square.category}
                </Text>
                <Text
                  numberOfLines={4}
                  ellipsizeMode="tail"
                  style={[
                    styles.previewText,
                    isCompact && styles.previewTextCompact,
                  ]}
                >
                  {square.text}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.previewMeta}>
            <Text style={styles.previewMetaTitle}>{Object.keys(BASE_CATEGORIES).length} base categories</Text>
            <Text style={styles.previewMetaText}>Fitness, Financial, Family, Friends, Fun, Travel, Work, Reflection, Health, Learning, Home, Adventure.</Text>
          </View>
        </SectionCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },
  layout: {
    gap: 18,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroCard: {
    gap: 18,
  },
  heroWide: {
    flex: 1.15,
  },
  previewCard: {
    gap: 18,
  },
  previewWide: {
    flex: 0.95,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
    color: '#475569',
  },
  featureGrid: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  buttonRow: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0f172a',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  buttonPressed: {
    opacity: 0.86,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#0f172a',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  previewSquare: {
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 8,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  previewSquareCompact: {
    borderRadius: 10,
    padding: 4,
  },
  centerPreviewSquare: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  completedPreviewSquare: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  previewCategory: {
    fontSize: 9,
    lineHeight: 10,
    fontWeight: '800',
    color: '#475569',
  },
  previewCategoryCompact: {
    fontSize: 7,
    lineHeight: 8,
  },
  previewText: {
    fontSize: 10,
    lineHeight: 12,
    color: '#0f172a',
    fontWeight: '700',
  },
  previewTextCompact: {
    fontSize: 8,
    lineHeight: 9,
    fontWeight: '600',
  },
  previewMeta: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginTop: 10,
  },
  previewMetaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9a3412',
    marginBottom: 6,
  },
  previewMetaText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9a3412',
  },
});
