import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import PillButton from '../components/PillButton';
import SectionCard from '../components/SectionCard';
import {
  BASE_CATEGORIES,
  CENTER_SQUARE_OPTIONS,
  DEFAULT_CUSTOM_CATEGORIES,
  DEFAULT_CATEGORY_COLORS,
  buildIdeaBank,
  getCategoryColor,
} from '../data/defaults';
import { CENTER_INDEX, createInitialEntries } from '../utils/cardTransforms';

function getPreviewGoalTextSizing(text) {
  const clean = (text || '').trim();
  const length = clean.length;
  const longestWord = clean
    .split(/\s+/)
    .reduce((max, word) => Math.max(max, word.length), 0);

  if (longestWord >= 12) {
    if (length <= 28) {
      return { fontSize: 10.2, lineHeight: 10.8 };
    }
    if (length <= 42) {
      return { fontSize: 9.2, lineHeight: 9.8 };
    }
    return { fontSize: 8.2, lineHeight: 8.8 };
  }

  if (length <= 18) {
    return { fontSize: 12, lineHeight: 13 };
  }
  if (length <= 30) {
    return { fontSize: 11, lineHeight: 12 };
  }
  if (length <= 46) {
    return { fontSize: 10, lineHeight: 11 };
  }
  return { fontSize: 9, lineHeight: 10 };
}

export default function BuilderScreen({
  deletingAccount,
  initialState,
  loading,
  userEmail,
  onBack,
  onDeleteAccount,
  onLogout,
  onSave,
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 1100;
  const isCompactPhone = width < 430;
  const entryColumns = width >= 900 ? 2 : 1;
  const previewGap = isCompactPhone ? 4 : 10;
  const [previewBoardWidth, setPreviewBoardWidth] = useState(0);
  const previewCellWidth =
    width >= 900
      ? '18.2%'
      : previewBoardWidth > 0
        ? Math.floor((previewBoardWidth - previewGap * 4) / 5)
        : Math.max(44, Math.floor((width - 36) / 5));
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [centerOption, setCenterOption] = useState(CENTER_SQUARE_OPTIONS[0]);
  const [availableCategories, setAvailableCategories] = useState(Object.keys(BASE_CATEGORIES));
  const [categoryColors, setCategoryColors] = useState(DEFAULT_CATEGORY_COLORS);
  const [customCategories, setCustomCategories] = useState(DEFAULT_CUSTOM_CATEGORIES);
  const [entries, setEntries] = useState(createInitialEntries(CENTER_SQUARE_OPTIONS[0]));
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIdeaCategory, setSelectedIdeaCategory] = useState('Fitness');
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialState) {
      setYear(initialState.year);
      setTitle(initialState.title);
      setCenterOption(initialState.centerOption);
      setAvailableCategories(
        initialState.availableCategories?.length ? initialState.availableCategories : Object.keys(BASE_CATEGORIES)
      );
      setCategoryColors(initialState.categoryColors || DEFAULT_CATEGORY_COLORS);
      setCustomCategories(initialState.customCategories.length ? initialState.customCategories : DEFAULT_CUSTOM_CATEGORIES);
      setEntries(initialState.entries);
      return;
    }

    const defaultTitle = `My ${new Date().getFullYear()} Card`;
    setYear(String(new Date().getFullYear()));
    setTitle(defaultTitle);
    setCenterOption(CENTER_SQUARE_OPTIONS[0]);
    setAvailableCategories(Object.keys(BASE_CATEGORIES));
    setCategoryColors(DEFAULT_CATEGORY_COLORS);
    setCustomCategories(DEFAULT_CUSTOM_CATEGORIES);
    setEntries(createInitialEntries(CENTER_SQUARE_OPTIONS[0]));
  }, [initialState]);

  const allCategories = useMemo(
    () =>
      availableCategories.reduce((accumulator, categoryName) => {
        accumulator[categoryName] = BASE_CATEGORIES[categoryName] || [];
        return accumulator;
      }, buildIdeaBank(customCategories)),
    [availableCategories, customCategories]
  );

  const categoryNames = useMemo(() => [...availableCategories], [availableCategories]);

  useEffect(() => {
    if (!categoryNames.includes(selectedIdeaCategory)) {
      setSelectedIdeaCategory(categoryNames[0] || 'Fitness');
    }
  }, [categoryNames, selectedIdeaCategory]);

  function updateEntry(index, updates) {
    setEntries((currentEntries) =>
      currentEntries.map((entry, entryIndex) => {
        if (entryIndex !== index) {
          return entry;
        }

        if (entryIndex === CENTER_INDEX) {
          return {
            text: centerOption,
            category: 'Freebie',
            completed: true,
          };
        }

        return {
          ...entry,
          ...updates,
        };
      })
    );
  }

  function clearEntries() {
    setEntries(
      Array.from({ length: 25 }, (_, index) => ({
        text: index === CENTER_INDEX ? centerOption : '',
        category: index === CENTER_INDEX ? 'Freebie' : categoryNames[0] || 'Fitness',
        completed: index === CENTER_INDEX,
      }))
    );
    setActiveEntryIndex(0);
  }

  function autofillIdeas() {
    const pool = Object.entries(allCategories).flatMap(([category, ideas]) =>
      ideas.map((idea) => ({ text: idea, category }))
    );

    const shuffledPool = [...pool];
    for (let index = shuffledPool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledPool[index], shuffledPool[swapIndex]] = [shuffledPool[swapIndex], shuffledPool[index]];
    }

    const uniqueIdeas = [];
    const seen = new Set();

    shuffledPool.forEach((item) => {
      if (seen.has(item.text)) {
        return;
      }

      seen.add(item.text);
      uniqueIdeas.push(item);
    });

    setEntries(
      Array.from({ length: 25 }, (_, index) => {
        if (index === CENTER_INDEX) {
          return {
            text: centerOption,
            category: 'Freebie',
            completed: true,
          };
        }

        const item = uniqueIdeas[index] || { text: '', category: categoryNames[0] || 'Fitness' };
        return {
          text: item.text,
          category: item.category,
          completed: false,
        };
      })
    );
  }

  function addCategory() {
    const clean = newCategoryName.trim();

    if (!clean) {
      return;
    }

    if (categoryNames.includes(clean)) {
      setError('That category already exists.');
      return;
    }

    setCustomCategories((current) => [...current, clean]);
    setAvailableCategories((current) => [...current, clean]);
    setCategoryColors((current) => ({
      ...current,
      [clean]: DEFAULT_CATEGORY_COLORS.Custom,
    }));
    setNewCategoryName('');
    setSelectedIdeaCategory(clean);
    setError('');
  }

  function removeCategory(categoryName) {
    setAvailableCategories((current) => current.filter((item) => item !== categoryName));
    setCustomCategories((current) => current.filter((item) => item !== categoryName));
    setCategoryColors((current) => {
      const next = { ...current };
      delete next[categoryName];
      return next;
    });
    setEntries((currentEntries) =>
      currentEntries.map((entry, index) => {
        if (index === CENTER_INDEX || entry.category !== categoryName) {
          return entry;
        }
        return {
          ...entry,
          category: availableCategories.find((item) => item !== categoryName) || 'Custom',
        };
      })
    );
    setSelectedIdeaCategory((current) =>
      current === categoryName ? availableCategories.find((item) => item !== categoryName) || 'Fitness' : current
    );
  }

  function addIdeaToBoard(idea, category) {
    const preferredIndex = activeEntryIndex !== CENTER_INDEX ? activeEntryIndex : -1;
    const firstEmptyIndex = entries.findIndex((entry, index) => index !== CENTER_INDEX && !entry.text.trim());
    const targetIndex =
      preferredIndex >= 0 && !entries[preferredIndex].text.trim() ? preferredIndex : firstEmptyIndex;

    if (targetIndex < 0) {
      setError('Your card is full. Edit or clear a square before adding another idea.');
      return;
    }

    updateEntry(targetIndex, { text: idea, category });
    setActiveEntryIndex(targetIndex);
    setError('');
  }

  function validateAndSave() {
    if (!title.trim()) {
      setError('Give your card a title.');
      return;
    }

    setError('');
    onSave({
      id: initialState?.id || null,
      year,
      title,
      centerOption,
      availableCategories,
      categoryColors,
      customCategories,
      entries: entries.map((entry, index) => ({
        ...entry,
        text: index === CENTER_INDEX ? centerOption : entry.text,
        category: index === CENTER_INDEX ? 'Freebie' : entry.category,
        completed: index === CENTER_INDEX ? true : Boolean(entry.completed),
      })),
    });
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your Resolution Bingo account and all saved bingo cards. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: deletingAccount ? 'Deleting...' : 'Delete account', style: 'destructive', onPress: onDeleteAccount },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={[styles.headerRow, isWide && styles.headerRowWide]}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>{userEmail}</Text>
          <Text style={styles.title}>Build your resolution bingo card</Text>
          <Text style={styles.subtitle}>
            Follow the steps below to shape the board, add categories, fill each square, and check the live preview as
            you go.
          </Text>
        </View>

        <View style={styles.headerActions}>
          {onBack ? (
            <Pressable onPress={onBack} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onLogout} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Log out</Text>
          </Pressable>
          <Pressable onPress={validateAndSave} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Save card'}</Text>
          </Pressable>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
        <View style={[styles.leftColumn, isWide && styles.leftColumnWide]}>
          <SectionCard
            title="Step 1 - Card setup"
          >
            <View style={styles.stack}>
              <Text style={styles.label}>Card title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="My 2026 Card"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
              />
            </View>
          </SectionCard>

          <SectionCard
            title="Step 2 - Review categories and pre-made ideas"
          >
            <Text style={styles.label}>Create a new category</Text>
            <View style={styles.inlineRow}>
              <TextInput
                style={[styles.input, styles.grow]}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Examples: Faith, Kids, Creativity"
                placeholderTextColor="#94a3b8"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
              />
              <Pressable onPress={addCategory} style={({ pressed }) => [styles.primaryButton, styles.inlineButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Add</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Browse category</Text>
            <View style={styles.pillWrap}>
              {categoryNames.map((category) => (
                <View key={category} style={styles.categoryManageChip}>
                  <PillButton
                    label={category}
                    selected={selectedIdeaCategory === category}
                    onPress={() => setSelectedIdeaCategory(category)}
                  />
                  <Pressable onPress={() => removeCategory(category)} style={styles.deleteCategoryButton}>
                    <Text style={styles.deleteCategoryText}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.targetNotice}>
              <Text style={styles.targetNoticeText}>
                Ideas add into the selected square: {activeEntryIndex + 1}
                {activeEntryIndex === CENTER_INDEX ? ' (Center Square freebie)' : ''}
              </Text>
            </View>

            <View style={styles.ideaList}>
              {(allCategories[selectedIdeaCategory] || []).map((idea) => (
                <View key={`${selectedIdeaCategory}-${idea}`} style={styles.ideaCard}>
                  <Text style={styles.ideaText}>{idea}</Text>
                  <Pressable
                    onPress={() => addIdeaToBoard(idea, selectedIdeaCategory)}
                    style={({ pressed }) => [styles.secondaryButton, styles.addIdeaButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.secondaryButtonText}>Add to selected square</Text>
                  </Pressable>
                </View>
              ))}

              {!(allCategories[selectedIdeaCategory] || []).length ? (
                <View style={styles.ideaCard}>
                  <Text style={styles.ideaText}>
                    No built-in ideas for {selectedIdeaCategory} yet. The category still stays available everywhere else.
                  </Text>
                </View>
              ) : null}
            </View>
          </SectionCard>

          <SectionCard
            title="Step 3 - Fill out each square"
            description="Fill out all 25 editable squares. Square 13 is the center square freebie."
          >
            <View style={styles.entryActions}>
              <Pressable onPress={autofillIdeas} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryButtonText}>Autofill from premade ideas</Text>
              </Pressable>
              <Pressable onPress={clearEntries} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryButtonText}>Clear entries</Text>
              </Pressable>
            </View>

            <View style={[styles.entryGrid, entryColumns === 2 && styles.entryGridWide]}>
              {entries.map((entry, index) => {
                const isCenter = index === CENTER_INDEX;

                return (
                  <Pressable
                    key={`entry-${index}`}
                    onPress={() => {
                      if (!isCenter) {
                        setActiveEntryIndex(index);
                      }
                    }}
                    style={[
                      styles.entryCard,
                      entryColumns === 2 && styles.entryCardWide,
                      activeEntryIndex === index && !isCenter && styles.activeEntryCard,
                      isCenter && styles.centerEntryCard,
                    ]}
                  >
                    <Text style={styles.entryTitle}>
                      {isCenter ? 'Square 13 (Center Square freebie)' : `Square ${index + 1}`}
                    </Text>
                    <TextInput
                      editable
                      multiline
                      placeholder={isCenter ? 'Center Square freebie' : `Goal ${index + 1}`}
                      placeholderTextColor="#94a3b8"
                      style={[styles.input, styles.textArea, isCenter && styles.centerFreebieInput]}
                      value={isCenter ? centerOption : entry.text}
                      autoCorrect={false}
                      autoComplete="off"
                      textContentType="none"
                      importantForAutofill="no"
                      onChangeText={(value) => {
                        if (isCenter) {
                          setCenterOption(value);
                          updateEntry(index, { text: value, category: 'Freebie', completed: true });
                          return;
                        }

                        updateEntry(index, { text: value });
                      }}
                    />
                    {isCenter ? (
                      <>
                        <Text style={styles.smallLabel}>Center Square freebie ideas</Text>
                        <View style={styles.pillWrap}>
                          {CENTER_SQUARE_OPTIONS.map((option) => (
                            <PillButton
                              key={option}
                              compact
                              label={option}
                              selected={centerOption === option}
                              onPress={() => {
                                setCenterOption(option);
                                updateEntry(index, { text: option, category: 'Freebie', completed: true });
                              }}
                            />
                          ))}
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.smallLabel}>Category</Text>
                        <View style={styles.pillWrap}>
                          {categoryNames.map((category) => (
                            <PillButton
                              key={`${index}-${category}`}
                              compact
                              label={category}
                              selected={entry.category === category}
                              onPress={() => updateEntry(index, { category })}
                              textStyle={!entry.category || entry.category !== category ? { color: getCategoryColor(category, categoryColors) } : undefined}
                            />
                          ))}
                        </View>
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>
        </View>

        <View style={[styles.rightColumn, isWide && styles.rightColumnWide]}>
          <SectionCard
            title="Step 4 - Live preview"
            description="The preview keeps the goal text on top and the category label on the bottom of each square."
            compact={isCompactPhone}
            style={isCompactPhone && styles.previewSectionCompact}
          >
            <View
              style={[styles.previewGrid, { gap: previewGap }]}
              onLayout={(event) => {
                const nextWidth = Math.floor(event.nativeEvent.layout.width);
                if (nextWidth !== previewBoardWidth) {
                  setPreviewBoardWidth(nextWidth);
                }
              }}
            >
              {entries.map((entry, index) => (
                <View
                  key={`preview-${index}`}
                  style={[
                    styles.previewSquare,
                    { width: previewCellWidth },
                    isCompactPhone && styles.previewSquareCompact,
                    index === CENTER_INDEX && styles.centerPreviewSquare,
                    activeEntryIndex === index && index !== CENTER_INDEX && styles.activePreviewSquare,
                  ]}
                >
                  {!isCompactPhone ? <Text style={styles.previewIndex}>{index + 1}</Text> : null}
                  <Text
                    numberOfLines={4}
                    ellipsizeMode="tail"
                    style={[
                      styles.previewText,
                      isCompactPhone && styles.previewTextCompact,
                      getPreviewGoalTextSizing(index === CENTER_INDEX ? centerOption : entry.text || `Goal ${index + 1}`),
                    ]}
                  >
                    {index === CENTER_INDEX ? centerOption : entry.text || `Goal ${index + 1}`}
                  </Text>
                  <Text
                    style={[
                      styles.previewCategory,
                      isCompactPhone && styles.previewCategoryCompact,
                      { color: getCategoryColor(index === CENTER_INDEX ? 'Freebie' : entry.category, categoryColors) },
                    ]}
                  >
                    {index === CENTER_INDEX ? 'Freebie' : entry.category}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>
        </View>
      </View>

      <View style={styles.bottomActions}>
        <Pressable
          onPress={validateAndSave}
          style={({ pressed }) => [styles.primaryButton, styles.bottomSaveButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Saving...' : 'Save card'}</Text>
        </Pressable>
      </View>

      <View style={styles.bottomAccountActionsWrap}>
        <Pressable onPress={confirmDeleteAccount} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
          <Text style={styles.dangerButtonText}>{deletingAccount ? 'Deleting account...' : 'Delete account'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 18,
    paddingBottom: 36,
    gap: 16,
  },
  headerRow: {
    gap: 14,
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
  headerActions: {
    gap: 10,
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
  mainLayout: {
    gap: 16,
  },
  mainLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    gap: 16,
  },
  leftColumnWide: {
    flex: 1.25,
  },
  rightColumn: {
    gap: 16,
  },
  rightColumnWide: {
    flex: 0.95,
  },
  bottomActions: {
    paddingTop: 8,
    alignItems: 'stretch',
  },
  bottomAccountActionsWrap: {
    paddingTop: 10,
    alignItems: 'center',
  },
  bottomSaveButton: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  stack: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#0f172a',
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  entryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  entryGrid: {
    gap: 12,
  },
  entryGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entryCard: {
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
  },
  entryCardWide: {
    width: '48.5%',
  },
  activeEntryCard: {
    borderColor: '#fb923c',
    backgroundColor: '#fff7ed',
  },
  centerEntryCard: {
    borderColor: '#fdba74',
    backgroundColor: '#fff7ed',
  },
  entryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  grow: {
    flex: 1,
  },
  inlineButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  ideaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ideaCard: {
    width: '48.5%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 12,
    gap: 10,
  },
  categoryManageChip: {
    gap: 6,
  },
  deleteCategoryButton: {
    alignItems: 'center',
  },
  deleteCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b91c1c',
  },
  targetNotice: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  targetNoticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#9a3412',
    fontWeight: '700',
  },
  ideaText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0f172a',
    fontWeight: '700',
  },
  addIdeaButton: {
    alignSelf: 'flex-start',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewSectionCompact: {
    marginHorizontal: -2,
  },
  previewSquare: {
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 7,
    justifyContent: 'space-between',
  },
  previewSquareCompact: {
    borderRadius: 8,
    padding: 2,
  },
  centerPreviewSquare: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  activePreviewSquare: {
    borderColor: '#fb923c',
    backgroundColor: '#fff7ed',
  },
  previewIndex: {
    fontSize: 9,
    lineHeight: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 6,
  },
  previewCategory: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: '#475569',
    marginTop: 3,
  },
  previewCategoryCompact: {
    fontSize: 8,
    lineHeight: 9,
    marginTop: 0,
  },
  previewText: {
    fontSize: 10,
    lineHeight: 11,
    color: '#0f172a',
    fontWeight: '500',
    alignSelf: 'flex-start',
    flex: 1,
  },
  previewTextCompact: {
    fontSize: 8.8,
    lineHeight: 9.2,
  },
  centerFreebieInput: {
    backgroundColor: '#fffaf0',
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
  dangerButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
