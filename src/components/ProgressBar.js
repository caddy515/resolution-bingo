import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ProgressBar({ progress = 0 }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, progress))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#ea580c',
  },
});
