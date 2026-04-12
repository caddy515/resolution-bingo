export const BASE_CATEGORIES = {
  Fitness: [
    'Take 20 long walks',
    'Run a 5K',
    'Stretch every morning for a week',
    'Work out 3x a week for a month',
    'Try one new workout class',
  ],
  Financial: [
    'Save $1,000',
    'Cancel 2 subscriptions',
    'Review monthly spending',
    'Sell 5 things you do not use',
    'Build a simple budget',
  ],
  Family: [
    'Plan a family weekend trip',
    'Have a no-phone dinner each week for a month',
    'Start one new family tradition',
    'Do a special day with family',
    'Make a family photo book',
  ],
  Friends: [
    'Text 5 old friends',
    'Host one dinner party',
    'Call a friend to catch up',
    'Reconnect with someone you miss',
    'Plan a friend outing',
  ],
  Fun: [
    'Try 10 new restaurants',
    'Read one book for fun',
    'Watch 5 classic movies',
    'Say yes to one spontaneous plan',
    'Take a full no-work Saturday',
  ],
  Travel: [
    'Visit a new town nearby',
    'Book one weekend away',
    'Take a dream trip',
    'Plan a day trip',
    'Explore a new neighborhood',
  ],
  Work: [
    'Lead a big presentation',
    'Update your resume',
    'Mentor someone at work',
    'Improve one major process',
    'Complete a certification',
  ],
  Reflection: [
    'Practice gratitude',
    'Write down 3 things you are grateful for',
    'Volunteer once',
    'Reflect for 5 minutes daily for a week',
    'Do one act of kindness',
  ],
  Health: [
    'Drink more water for 30 days',
    'Schedule your annual physical',
    'Go to bed earlier for a week',
    'Cook dinner at home 3 nights this week',
    'Improve sleep consistency for 30 days',
  ],
  Learning: [
    'Read 12 books',
    'Learn 25 words in a new language',
    'Finish one online course',
    'Listen to 5 educational podcasts',
    'Practice a skill for 30 days',
  ],
  Home: [
    'Declutter the closet',
    'Finish one house project',
    'Organize one drawer',
    'Donate unused clothes',
    'Upgrade one room',
  ],
  Adventure: [
    'Do one thing that scares you a little',
    'Take a solo day adventure',
    'Try a food you have never had',
    'Learn an outdoor skill',
    'Do a big hike',
  ],
};

export const BINGO_CELEBRATION_LINES = [
  'Bingo, baby. Your future self is impressed.',
  'Look at you, casually winning the year.',
  'That square did not stand a chance.',
  'Main-character energy. Bingo achieved.',
  'You are officially cooking now.',
  'One line down. Momentum looks good on you.',
  'New year, who dis? A person who gets bingo.',
  'That was not luck. That was follow-through.',
  'You just turned intentions into receipts.',
  'A little progress, a lot of swagger.',
  'This card is starting to fear you.',
  'Respectfully, you are on a heater.',
  'Bingo unlocked. Doubters remain unconsulted.',
  'Proof that tiny wins stack beautifully.',
  'You did the thing. Then made it look easy.',
  'That goal crossed the line and so did you.',
  'This is your reminder that you are absolutely rolling.',
  'The board says yes. The vibes say absolutely.',
  'Somebody cue the parade. You got bingo.',
  'Achievement level: annoyingly impressive.',
];

export const CENTER_SQUARE_OPTIONS = [
  'Practice gratitude',
  'Spend meaningful time with family',
  'Tell someone you love them',
  'Do one act of kindness',
  'Call a friend you miss',
  'Be kind to yourself',
  'Make someone smile',
];

export const DEFAULT_CARD = [
  { text: 'Run a 5K', category: 'Fitness' },
  { text: 'Save $1,000', category: 'Financial' },
  { text: 'Plan a family weekend trip', category: 'Family' },
  { text: 'Host a dinner party', category: 'Friends' },
  { text: 'Read 12 books', category: 'Learning' },
  { text: 'Drink more water for 30 days', category: 'Health' },
  { text: 'Visit a new town nearby', category: 'Travel' },
  { text: 'Declutter the closet', category: 'Home' },
  { text: 'Lead a big presentation', category: 'Work' },
  { text: 'Learn 25 words in a new language', category: 'Learning' },
  { text: 'Take 20 long walks', category: 'Fitness' },
  { text: 'Practice gratitude', category: 'Reflection' },
  { text: 'Cancel 2 subscriptions', category: 'Financial' },
  { text: 'Try 10 new restaurants', category: 'Fun' },
  { text: 'Go on one date night per month', category: 'Family' },
  { text: 'Finish one house project', category: 'Home' },
  { text: 'Reconnect with an old friend', category: 'Friends' },
  { text: 'Have a no-phone family dinner weekly for a month', category: 'Family' },
  { text: 'Volunteer once', category: 'Reflection' },
  { text: 'Work out 3x a week for a month', category: 'Fitness' },
  { text: 'Build a budget', category: 'Financial' },
  { text: 'Go to 3 live events', category: 'Fun' },
  { text: 'Do one thing that scares you a little', category: 'Adventure' },
  { text: 'Take a dream trip', category: 'Travel' },
  { text: 'Mentor someone at work', category: 'Work' },
];

export const DEFAULT_CUSTOM_CATEGORIES = [];
export const LEGACY_CUSTOM_CATEGORIES = ['Mindset', 'Creativity'];

export const DEFAULT_CATEGORY_COLORS = {
  Fitness: '#16a34a',
  Financial: '#0284c7',
  Family: '#ea580c',
  Friends: '#db2777',
  Fun: '#7c3aed',
  Travel: '#0f766e',
  Work: '#475569',
  Reflection: '#ca8a04',
  Health: '#059669',
  Learning: '#4f46e5',
  Home: '#65a30d',
  Adventure: '#dc2626',
  Freebie: '#c2410c',
  Custom: '#64748b',
};

export const CATEGORY_COLOR_OPTIONS = [
  '#22c55e',
  '#0ea5e9',
  '#f97316',
  '#ec4899',
  '#a855f7',
  '#14b8a6',
  '#334155',
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#84cc16',
  '#ef4444',
  '#64748b',
  '#f43f5e',
  '#8b5cf6',
  '#06b6d4',
];

export function buildIdeaBank(categoryNames = []) {
  const customMap = categoryNames.reduce((accumulator, categoryName) => {
    accumulator[categoryName] = [];
    return accumulator;
  }, {});

  return {
    ...BASE_CATEGORIES,
    ...customMap,
  };
}

export function getCategoryColor(categoryName, categoryColors = {}) {
  return categoryColors[categoryName] || DEFAULT_CATEGORY_COLORS[categoryName] || DEFAULT_CATEGORY_COLORS.Custom;
}
