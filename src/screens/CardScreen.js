import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import ProgressBar from '../components/ProgressBar';
import SectionCard from '../components/SectionCard';
import { BINGO_CELEBRATION_LINES, getCategoryColor } from '../data/defaults';
import { computeBingos, isBlackout } from '../utils/bingo';
import { CENTER_INDEX, updateSquareInCard } from '../utils/cardTransforms';

function getGoalTextSizing(text, isCompactPhone) {
  const clean = (text || '').trim();
  const length = clean.length;
  const longestWord = clean
    .split(/\s+/)
    .reduce((max, word) => Math.max(max, word.length), 0);

  if (isCompactPhone) {
    if (longestWord >= 12) {
      if (length <= 28) {
        return { fontSize: 9.1, lineHeight: 9.7 };
      }
      if (length <= 40) {
        return { fontSize: 8.2, lineHeight: 8.8 };
      }
      return { fontSize: 7.2, lineHeight: 7.8 };
    }

    if (length <= 18) {
      return { fontSize: 11.2, lineHeight: 11.8 };
    }
    if (length <= 28) {
      return { fontSize: 10.4, lineHeight: 11 };
    }
    if (length <= 40) {
      return { fontSize: 9.4, lineHeight: 10 };
    }
    if (length <= 58) {
      return { fontSize: 8.4, lineHeight: 9 };
    }
    return { fontSize: 7.4, lineHeight: 8 };
  }

  if (length <= 18) {
    return { fontSize: 14, lineHeight: 16 };
  }
  if (length <= 32) {
    return { fontSize: 13, lineHeight: 15 };
  }
  if (length <= 52) {
    return { fontSize: 12, lineHeight: 14 };
  }
  return { fontSize: 11, lineHeight: 13 };
}

export default function CardScreen({
  card,
  cards,
  userEmail,
  onCreateCard,
  onDeleteCard,
  onEditCard,
  onLogout,
  onSaveCard,
  onSelectCard,
  onShowCelebration,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1080;
  const isCompactPhone = width < 430;
  const boardGap = isCompactPhone ? 3 : 10;
  const [boardWidth, setBoardWidth] = useState(0);
  const gridCellWidth = isWide
    ? '18.7%'
    : boardWidth > 0
      ? Math.floor((boardWidth - boardGap * 4) / 5)
      : Math.max(44, Math.floor((width - 36) / 5));
  const [draftCard, setDraftCard] = useState(card);
  const [saveError, setSaveError] = useState('');
  const [snapshotLoading, setSnapshotLoading] = useState('');
  const recentLineIndexesRef = useRef([]);
  const previousBingoCountRef = useRef(computeBingos(card.squares).length);
  const previousBlackoutRef = useRef(isBlackout(card.squares));
  const snapshotRef = useRef(null);
  const snapshotWebRef = useRef(null);

  useEffect(() => {
    setDraftCard(card);
    previousBingoCountRef.current = computeBingos(card.squares).length;
    previousBlackoutRef.current = isBlackout(card.squares);
  }, [card]);

  const bingos = useMemo(() => computeBingos(draftCard.squares), [draftCard.squares]);
  const completedCount = draftCard.squares.filter((square) => square.completed).length;
  const progress = Math.round((completedCount / 25) * 100);
  const winningIndexes = useMemo(() => new Set(bingos.flat()), [bingos]);

  const categoryProgress = useMemo(() => {
    const counts = {};

    draftCard.squares.forEach((square) => {
      const category = square.isCenter ? 'Freebie' : square.category || 'Custom';
      counts[category] = counts[category] || { total: 0, complete: 0 };
      counts[category].total += 1;
      if (square.completed) {
        counts[category].complete += 1;
      }
    });

    return Object.entries(counts).sort((left, right) => right[1].complete - left[1].complete);
  }, [draftCard.squares]);

  function nextCelebrationLine() {
    const usedRecently = new Set(recentLineIndexesRef.current);
    const candidates = BINGO_CELEBRATION_LINES.map((line, index) => ({ line, index })).filter(
      ({ index }) => !usedRecently.has(index)
    );
    const pool = candidates.length
      ? candidates
      : BINGO_CELEBRATION_LINES.map((line, index) => ({ line, index }));
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    recentLineIndexesRef.current = [...recentLineIndexesRef.current, chosen.index].slice(-8);
    return chosen.line;
  }

  async function persistNextCard(nextCard, options = {}) {
    setDraftCard(nextCard);
    setSaveError('');

    const nextBingos = computeBingos(nextCard.squares);
    const nextBlackout = isBlackout(nextCard.squares);

    if (nextBlackout && !previousBlackoutRef.current) {
      onShowCelebration(
        'Blackout!',
        'Blackout achieved. At this point the board should probably send you a thank-you note.'
      );
    } else if (nextBingos.length > previousBingoCountRef.current && !options.skipCelebration) {
      onShowCelebration(
        nextBingos.length === 1 ? 'Bingo!' : `${nextBingos.length} Bingos!`,
        nextCelebrationLine()
      );
    }

    previousBingoCountRef.current = nextBingos.length;
    previousBlackoutRef.current = nextBlackout;

    try {
      await onSaveCard(nextCard);
    } catch (error) {
      setSaveError(error.message || 'Unable to save the latest change.');
    }
  }

  function toggleSquare(index) {
    if (index === CENTER_INDEX) {
      return;
    }

    const nextCard = updateSquareInCard(draftCard, index, {
      completed: !draftCard.entries[index].completed,
    });

    persistNextCard(nextCard);
  }

  function confirmDeleteCard(cardId) {
    Alert.alert(
      'Delete card?',
      'This card will be removed permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteCard(cardId) },
      ]
    );
  }

  async function captureSnapshot() {
    if (Platform.OS === 'web') {
      if (!snapshotWebRef.current) {
        throw new Error('Snapshot view is not ready yet.');
      }

      const { toPng } = await import('html-to-image');
      return toPng(snapshotWebRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
      });
    }

    if (!snapshotRef.current?.capture) {
      throw new Error('Snapshot view is not ready yet.');
    }

    return snapshotRef.current.capture?.();
  }

  async function handleShareSnapshot() {
    setSnapshotLoading('share');
    setSaveError('');

    try {
      const uri = await captureSnapshot();
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        throw new Error('Sharing is not available on this device.');
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Resolution Bingo snapshot',
      });
    } catch (error) {
      setSaveError(error.message || 'Unable to share your snapshot right now.');
    } finally {
      setSnapshotLoading('');
    }
  }

  async function handleSaveSnapshot() {
    setSnapshotLoading('save');
    setSaveError('');

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        throw new Error('Allow photo access to save your snapshot.');
      }

      const uri = await captureSnapshot();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'Your card snapshot is now in Photos.');
    } catch (error) {
      setSaveError(error.message || 'Unable to save your snapshot right now.');
    } finally {
      setSnapshotLoading('');
    }
  }

  async function handleDownloadSnapshot() {
    setSnapshotLoading('download');
    setSaveError('');

    try {
      const dataUrl = await captureSnapshot();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${draftCard.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'resolution-bingo-card'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setSaveError(error.message || 'Unable to download your snapshot right now.');
    } finally {
      setSnapshotLoading('');
    }
  }

  function renderSnapshotContent() {
    return (
      <>
        <View style={styles.snapshotHeader}>
          <Text style={styles.snapshotTitle}>{draftCard.title}</Text>
          <Text style={styles.snapshotSubtitle}>
            {completedCount} of 25 complete • {bingos.length} BINGOS!
          </Text>
        </View>

        <SectionCard title="My progress" description={`${completedCount} of 25 complete`} compact={isCompactPhone}>
          <ProgressBar progress={progress} />
          <View style={styles.progressMeta}>
            <View style={styles.miniCard}>
              <Text style={styles.miniCardLabel}>Remaning squares</Text>
              <Text style={styles.miniCardValue}>{25 - completedCount}</Text>
            </View>
            <View style={styles.miniCard}>
              <Text style={styles.miniCardLabel}>BINGOS!</Text>
              <Text style={styles.miniCardValue}>{bingos.length}</Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Your bingo card" compact={isCompactPhone} style={isCompactPhone && styles.boardCardCompact}>
          <View
            style={[styles.boardGrid, { gap: boardGap }]}
            onLayout={(event) => {
              const nextWidth = Math.floor(event.nativeEvent.layout.width);
              if (nextWidth !== boardWidth) {
                setBoardWidth(nextWidth);
              }
            }}
          >
            {draftCard.squares.map((square, index) => (
              <Pressable
                key={square.id}
                onPress={() => {
                  toggleSquare(index);
                }}
                style={[
                  styles.square,
                  { width: gridCellWidth },
                  isCompactPhone && styles.squareCompact,
                  square.completed && styles.completedSquare,
                  square.isCenter && styles.centerSquare,
                  winningIndexes.has(index) && styles.winningSquare,
                ]}
              >
                {!isCompactPhone ? (
                  <Text style={styles.squareIndex}>{square.id}</Text>
                ) : null}
                <Text
                  numberOfLines={6}
                  adjustsFontSizeToFit
                  minimumFontScale={0.44}
                  lineBreakStrategyIOS="none"
                  style={[
                    styles.squareText,
                    isCompactPhone && styles.squareTextCompact,
                    getGoalTextSizing(square.text, isCompactPhone),
                  ]}
                >
                  {square.text}
                </Text>
                <Text
                  style={[
                    styles.squareCategory,
                    isCompactPhone && styles.squareCategoryCompact,
                    { color: getCategoryColor(square.isCenter ? 'Freebie' : square.category, draftCard.categoryColors) },
                  ]}
                >
                  {square.isCenter ? 'Freebie' : square.category || 'Custom'}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionCard>
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.scroll, isCompactPhone && styles.scrollCompact]}>
      <View style={[styles.headerRow, isWide && styles.headerRowWide]}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>{userEmail}</Text>
        </View>
      </View>

      {saveError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{saveError}</Text>
        </View>
      ) : null}

      <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
        <View style={[styles.leftColumn, isWide && styles.leftColumnWide]}>
          {Platform.OS === 'web' ? (
            <View ref={snapshotWebRef} style={styles.snapshotWrap} collapsable={false}>
              {renderSnapshotContent()}
            </View>
          ) : (
            <ViewShot
              ref={snapshotRef}
              options={{ format: 'png', quality: 1, result: 'tmpfile' }}
              style={styles.snapshotWrap}
            >
              {renderSnapshotContent()}
            </ViewShot>
          )}

          <View style={styles.boardFooterActions}>
            {Platform.OS === 'web' ? (
              <Pressable
                onPress={handleDownloadSnapshot}
                style={({ pressed }) => [styles.secondaryButton, styles.snapshotButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryButtonText}>
                  {snapshotLoading === 'download' ? 'Preparing...' : 'Download PNG'}
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  onPress={handleShareSnapshot}
                  style={({ pressed }) => [styles.secondaryButton, styles.snapshotButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {snapshotLoading === 'share' ? 'Preparing...' : 'Share snapshot'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveSnapshot}
                  style={({ pressed }) => [styles.secondaryButton, styles.snapshotButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {snapshotLoading === 'save' ? 'Saving...' : 'Save snapshot'}
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable onPress={onEditCard} style={({ pressed }) => [styles.secondaryButton, styles.snapshotButton, pressed && styles.pressed]}>
              <Text style={styles.secondaryButtonText}>Edit in builder</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.rightColumn, isWide && styles.rightColumnWide]}>
          <SectionCard title="Category wins" description="Custom categories stay in the same progress view as base categories." compact={isCompactPhone}>
            <View style={styles.categoryWinWrap}>
              {categoryProgress.map(([category, totals]) => (
                <View key={category} style={styles.categoryWinPill}>
                  <Text style={[styles.metricLabel, { color: getCategoryColor(category, draftCard.categoryColors) }]}>
                    {category}{' '}
                  </Text>
                  <Text style={styles.categoryWinValue}>
                    {totals.complete}/{totals.total}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard title="Your cards" description="Manage multiple cards and keep history across years." compact={isCompactPhone}>
            <View style={styles.listGap}>
              {cards.map((item) => (
                <View key={item.id} style={styles.metricRow}>
                  <Pressable onPress={() => onSelectCard(item.id)} style={styles.cardSelectArea}>
                    <Text style={styles.metricLabel}>{item.title}</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDeleteCard(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              ))}
            </View>
            <View style={styles.createCardWrap}>
              <Pressable onPress={onCreateCard} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Create new card</Text>
              </Pressable>
            </View>
          </SectionCard>

          <View style={styles.bottomLogoutWrap}>
            <Pressable onPress={onLogout} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <Text style={styles.secondaryButtonText}>Log out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 14,
    paddingBottom: 36,
    gap: 16,
  },
  scrollCompact: {
    padding: 6,
    paddingBottom: 24,
  },
  headerRow: {
    gap: 12,
  },
  headerRowWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCopy: {
    gap: 6,
    maxWidth: 760,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ea580c',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  mainLayout: {
    gap: 12,
  },
  mainLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    gap: 12,
  },
  leftColumnWide: {
    flex: 1.2,
  },
  snapshotWrap: {
    gap: 12,
  },
  snapshotHeader: {
    paddingHorizontal: 4,
    gap: 2,
  },
  snapshotTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: '#0f172a',
  },
  snapshotSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748b',
    fontWeight: '700',
  },
  rightColumn: {
    gap: 12,
  },
  rightColumnWide: {
    flex: 0.9,
  },
  errorBanner: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    lineHeight: 18,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  boardCardCompact: {
    marginHorizontal: -2,
  },
  square: {
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 7,
    justifyContent: 'space-between',
  },
  squareCompact: {
    borderRadius: 8,
    padding: 3,
  },
  completedSquare: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  centerSquare: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  winningSquare: {
    shadowColor: '#f59e0b',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  squareIndex: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 4,
  },
  squareIndexCompact: {
    fontSize: 8,
    marginBottom: 2,
  },
  squareCategory: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800',
    color: '#475569',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  squareCategoryCompact: {
    fontSize: 8,
    lineHeight: 9,
    marginTop: 0,
  },
  squareText: {
    fontSize: 13,
    lineHeight: 15,
    color: '#0f172a',
    fontWeight: '500',
    alignSelf: 'flex-start',
    flex: 1,
  },
  squareTextCompact: {
    fontSize: 8.4,
    lineHeight: 9,
  },
  boardFooterActions: {
    marginTop: 14,
    gap: 10,
  },
  snapshotButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCardWrap: {
    marginTop: 10,
  },
  bottomLogoutWrap: {
    marginTop: 4,
    marginBottom: 8,
  },
  progressMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  miniCard: {
    flex: 1,
    minWidth: 90,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  miniCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  miniCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  listGap: {
    gap: 10,
  },
  metricRow: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryWinWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryWinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  cardSelectArea: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  categoryWinValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b91c1c',
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#0f172a',
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.86,
  },
});
