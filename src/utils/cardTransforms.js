import {
  CENTER_SQUARE_OPTIONS,
  DEFAULT_CARD,
  DEFAULT_CATEGORY_COLORS,
  DEFAULT_CUSTOM_CATEGORIES,
  LEGACY_CUSTOM_CATEGORIES,
} from '../data/defaults';

export const BOARD_SIZE = 5;
export const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;
export const CENTER_INDEX = 12;

function buildDefaultEntry(index, centerOption) {
  if (index === CENTER_INDEX) {
    return {
      text: centerOption,
      category: 'Freebie',
    };
  }

  const defaultSquare = DEFAULT_CARD[index];

  return {
    text: defaultSquare?.text || '',
    category: defaultSquare?.category || 'Fitness',
  };
}

export function createInitialEntries(centerOption = CENTER_SQUARE_OPTIONS[0]) {
  return Array.from({ length: TOTAL_SQUARES }, (_, index) => buildDefaultEntry(index, centerOption));
}

export function buildSquares(entries, centerOption) {
  return entries.map((entry, index) => ({
    id: index + 1,
    text: index === CENTER_INDEX ? centerOption : entry.text?.trim() || `Goal ${index + 1}`,
    category: index === CENTER_INDEX ? 'Freebie' : entry.category?.trim() || 'Custom',
    completed: index === CENTER_INDEX ? true : Boolean(entry.completed),
    isCenter: index === CENTER_INDEX,
  }));
}

function sanitizeStoredCategories(card = {}) {
  const entryCategories = new Set(
    (card.entries || [])
      .map((entry, index) => (index === CENTER_INDEX ? null : entry?.category))
      .filter(Boolean)
  );

  const availableCategories = (Array.isArray(card.availableCategories) ? card.availableCategories : [])
    .filter(Boolean)
    .filter((category) => !LEGACY_CUSTOM_CATEGORIES.includes(category) || entryCategories.has(category));

  const customCategories = (Array.isArray(card.customCategories) ? card.customCategories : [])
    .filter(Boolean)
    .filter((category) => !LEGACY_CUSTOM_CATEGORIES.includes(category) || entryCategories.has(category));

  return { availableCategories, customCategories };
}

export function cardToBuilderState(card) {
  const fallbackCenter = card?.centerOption || CENTER_SQUARE_OPTIONS[0];
  const sourceEntries =
    Array.isArray(card?.entries) && card.entries.length === TOTAL_SQUARES
      ? card.entries
      : createInitialEntries(fallbackCenter);

  const sanitized = sanitizeStoredCategories(card);

  return {
    id: card?.id || null,
    year: card?.year || String(new Date().getFullYear()),
    title: card?.title || `My ${new Date().getFullYear()} Card`,
    centerOption: fallbackCenter,
    availableCategories: sanitized.availableCategories.length
      ? sanitized.availableCategories
      : Object.keys(DEFAULT_CARD.reduce((acc, item) => ({ ...acc, [item.category]: true }), {})),
    categoryColors: card?.categoryColors || DEFAULT_CATEGORY_COLORS,
    customCategories: sanitized.customCategories.length
      ? sanitized.customCategories
      : [...DEFAULT_CUSTOM_CATEGORIES],
    entries: sourceEntries.map((entry, index) => ({
      text: index === CENTER_INDEX ? fallbackCenter : entry.text || '',
      category: index === CENTER_INDEX ? 'Freebie' : entry.category || 'Fitness',
      completed: index === CENTER_INDEX ? true : Boolean(entry.completed),
    })),
  };
}

export function builderStateToCard(builderState) {
  const year = String(builderState.year || new Date().getFullYear());
  const title = builderState.title?.trim() || `My ${new Date().getFullYear()} Card`;
  const centerOption = builderState.centerOption || CENTER_SQUARE_OPTIONS[0];
  const availableCategories = Array.isArray(builderState.availableCategories)
    ? [...new Set(builderState.availableCategories.map((item) => item.trim()).filter(Boolean))]
    : [];
  const categoryColors = builderState.categoryColors || DEFAULT_CATEGORY_COLORS;
  const customCategories = Array.isArray(builderState.customCategories)
    ? [...new Set(builderState.customCategories.map((item) => item.trim()).filter(Boolean))]
    : [];

  const entries = builderState.entries.map((entry, index) => ({
    text: index === CENTER_INDEX ? centerOption : entry.text.trim(),
    category: index === CENTER_INDEX ? 'Freebie' : (entry.category || 'Custom').trim(),
    completed: index === CENTER_INDEX ? true : Boolean(entry.completed),
  }));

  return {
    id: builderState.id || `${year}-${Date.now()}`,
    year,
    title,
    centerOption,
    availableCategories,
    categoryColors,
    customCategories,
    entries,
    squares: buildSquares(entries, centerOption),
    updatedAt: new Date().toISOString(),
  };
}

export function updateSquareInCard(card, squareIndex, updates) {
  const nextEntries = card.entries.map((entry, index) => {
    if (index !== squareIndex) {
      return entry;
    }

    if (index === CENTER_INDEX) {
      return {
        ...entry,
        text: card.centerOption,
        category: 'Freebie',
        completed: true,
      };
    }

    return {
      ...entry,
      ...updates,
    };
  });

  return builderStateToCard({
    id: card.id,
    year: card.year,
    title: card.title,
    centerOption: card.centerOption,
    availableCategories: card.availableCategories,
    categoryColors: card.categoryColors,
    customCategories: card.customCategories,
    entries: nextEntries,
  });
}

export function sanitizeLoadedCard(card) {
  const sanitized = sanitizeStoredCategories(card);

  return {
    ...card,
    availableCategories: sanitized.availableCategories.length
      ? sanitized.availableCategories
      : Object.keys(DEFAULT_CARD.reduce((acc, item) => ({ ...acc, [item.category]: true }), {})),
    customCategories: sanitized.customCategories,
  };
}
