import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const COLORS = ['#f59e0b', '#22c55e', '#fb7185', '#38bdf8', '#a78bfa'];

function createPieces(width, count = 128) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: ((width + 120) / count) * index - 30 + (index % 7) * 2,
    size: 7 + (index % 4) * 3,
    duration: 3600 + (index % 9) * 220,
    startY: -260 - (index % 11) * 28,
    drift: (index % 2 === 0 ? 1 : -1) * (10 + (index % 6) * 9),
    color: COLORS[index % COLORS.length],
    rounded: index % 2 === 0,
  }));
}

export default function CelebrationOverlay({ visible, title, message, onDismiss }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => createPieces(width), [width]);
  const animations = useRef([]);

  if (animations.current.length !== pieces.length) {
    animations.current = pieces.map(() => new Animated.Value(-160));
  }

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const loops = animations.current.map((value, index) => {
      value.setValue(pieces[index].startY);

      return Animated.loop(
        Animated.timing(value, {
          toValue: height + 220,
          duration: pieces[index].duration,
          useNativeDriver: true,
          isInteraction: false,
        }),
        { iterations: -1 }
      );
    });

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [visible, height, pieces]);

  if (!visible) {
    return null;
  }

  const isBlackout = title === 'Blackout!';

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <View style={[styles.scrim, isBlackout && styles.blackoutScrim]} />

      {pieces.map((piece, index) => (
        <Animated.View
          key={piece.id}
          pointerEvents="none"
          style={[
            styles.confetti,
            {
              left: piece.left,
              width: piece.size,
              height: piece.rounded ? piece.size * 1.8 : piece.size * 1.2,
              borderRadius: piece.rounded ? 999 : 3,
              backgroundColor: piece.color,
              opacity: animations.current[index].interpolate({
                inputRange: [piece.startY, piece.startY + 50, height + 120, height + 220],
                outputRange: [0, 1, 1, 0],
                extrapolate: 'clamp',
              }),
              transform: [
                { translateY: animations.current[index] },
                {
                  translateX: animations.current[index].interpolate({
                    inputRange: [piece.startY, height + 220],
                    outputRange: [0, piece.drift * 3],
                  }),
                },
                {
                  rotate: animations.current[index].interpolate({
                    inputRange: [piece.startY, height + 220],
                    outputRange: ['0deg', '720deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <View pointerEvents="box-none" style={styles.contentWrap}>
        <View style={[styles.banner, isBlackout && styles.blackoutBanner]}>
          <Text style={[styles.kicker, isBlackout && styles.blackoutText]}>{title}</Text>
          <Text style={[styles.message, isBlackout && styles.blackoutText]}>{message}</Text>
          <Pressable onPress={onDismiss} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Keep going</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: 'hidden',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  blackoutScrim: {
    backgroundColor: 'rgba(2, 6, 23, 0.82)',
  },
  confetti: {
    position: 'absolute',
    top: -120,
    opacity: 0.95,
  },
  contentWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  banner: {
    width: '100%',
    maxWidth: 760,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.18,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  blackoutBanner: {
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    borderColor: 'rgba(251, 146, 60, 0.55)',
  },
  blackoutText: {
    color: '#fff7ed',
  },
  kicker: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  message: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0f172a',
    marginBottom: 14,
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: '#0f172a',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
