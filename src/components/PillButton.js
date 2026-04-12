import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function PillButton({
  label,
  onPress,
  selected = false,
  disabled = false,
  compact = false,
  style,
  textStyle,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        selected && styles.selected,
        disabled && styles.disabled,
        style,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.text, selected && styles.selectedText, disabled && styles.disabledText, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  selected: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  selectedText: {
    color: '#ffffff',
  },
  disabledText: {
    color: '#94a3b8',
  },
});
