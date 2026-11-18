export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'sentence';

export type GermanArticle = 'der' | 'die' | 'das';

export type VocabularyCategory =
  | 'greetings'
  | 'people'
  | 'home'
  | 'food'
  | 'shopping'
  | 'travel'
  | 'work'
  | 'education'
  | 'health'
  | 'nature'
  | 'time'
  | 'places'
  | 'emotions'
  | 'clothing'
  | 'leisure'
  | 'other';

export interface VerbConjugations {
  ich?: string;
  du?: string;
  erSieEs?: string;
  wir?: string;
  ihr?: string;
  sieSie?: string;
  pastSimple?: string; // Präteritum
  pastParticiple?: string; // Partizip II
}

export interface AdjectiveForms {
  comparative?: string;
  superlative?: string;
}

export interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  myanmar: string;
  type: WordType;
  article?: GermanArticle;
  plural?: string;
  exampleGerman?: string;
  exampleEnglish?: string;
  exampleMyanmar?: string;
  level: CEFRLevel;
  category: VocabularyCategory;
  // Specific type extras
  conjugations?: VerbConjugations;
  adjectiveForms?: AdjectiveForms;
  conjugationSummary?: string; // e.g. "entscheidet • entschied • hat entschieden"
  comparativeSummary?: string; // e.g. "gemütlicher • am gemütlichsten"
  remark?: string; // Grammar remark e.g. "Nouns ending in -keit are feminine"
  createdAt?: number;
  updatedAt?: number;
}

export type NavigationTab = 'dashboard' | 'dictionary' | 'flashcards' | 'quiz';

export interface CategoryMeta {
  emoji: string;
  label: string;
  pillClass: string;
}

export const CATEGORIES_META: Record<VocabularyCategory, CategoryMeta> = {
  greetings: { emoji: '👋', label: 'Greetings', pillClass: 'bg-amber-100 text-amber-900 border-amber-200' },
  people: { emoji: '👥', label: 'People', pillClass: 'bg-rose-100 text-rose-900 border-rose-200' },
  home: { emoji: '🏠', label: 'Home', pillClass: 'bg-orange-100 text-orange-900 border-orange-200' },
  food: { emoji: '🥐', label: 'Food', pillClass: 'bg-lime-100 text-lime-900 border-lime-200' },
  shopping: { emoji: '🛍️', label: 'Shopping', pillClass: 'bg-pink-100 text-pink-900 border-pink-200' },
  travel: { emoji: '✈️', label: 'Travel', pillClass: 'bg-sky-100 text-sky-900 border-sky-200' },
  work: { emoji: '💼', label: 'Work', pillClass: 'bg-indigo-100 text-indigo-900 border-indigo-200' },
  education: { emoji: '🎓', label: 'Education', pillClass: 'bg-violet-100 text-violet-900 border-violet-200' },
  health: { emoji: '❤️‍🩹', label: 'Health', pillClass: 'bg-red-100 text-red-900 border-red-200' },
  nature: { emoji: '🌿', label: 'Nature', pillClass: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  time: { emoji: '⏳', label: 'Time', pillClass: 'bg-cyan-100 text-cyan-900 border-cyan-200' },
  places: { emoji: '📍', label: 'Places', pillClass: 'bg-teal-100 text-teal-900 border-teal-200' },
  emotions: { emoji: '😊', label: 'Emotions', pillClass: 'bg-yellow-100 text-yellow-900 border-yellow-200' },
  clothing: { emoji: '🧥', label: 'Clothing', pillClass: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200' },
  leisure: { emoji: '🎨', label: 'Leisure', pillClass: 'bg-purple-100 text-purple-900 border-purple-200' },
  other: { emoji: '✨', label: 'Other', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const CEFR_LEVELS_LIST: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export interface LevelStyle {
  title: string;
  subtitle: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
  count: number;
  progressWidth: string;
}

export const LEVEL_STYLES: Record<CEFRLevel, LevelStyle> = {
  A1: {
    title: 'Goethe A1',
    subtitle: 'Beginner',
    cardBg: 'bg-gradient-to-br from-[#dff4be] via-[#d3efaa] to-[#c4e892]',
    badgeBg: 'bg-[#e3f5c8]',
    badgeText: 'text-[#2f5d15]',
    accent: '#4a8522',
    count: 539,
    progressWidth: '65%',
  },
  A2: {
    title: 'Goethe A2',
    subtitle: 'Elementary',
    cardBg: 'bg-gradient-to-br from-[#bcece0] via-[#a7e5d6] to-[#90dcc9]',
    badgeBg: 'bg-[#cbf2e8]',
    badgeText: 'text-[#155e54]',
    accent: '#1b7a6e',
    count: 532,
    progressWidth: '40%',
  },
  B1: {
    title: 'Goethe B1',
    subtitle: 'Intermediate',
    cardBg: 'bg-gradient-to-br from-[#c6d4fc] via-[#b3c5fa] to-[#9eb4f6]',
    badgeBg: 'bg-[#d8e2fd]',
    badgeText: 'text-[#243c8a]',
    accent: '#3656b8',
    count: 1702,
    progressWidth: '18%',
  },
  B2: {
    title: 'Goethe B2',
    subtitle: 'Upper-Intermediate',
    cardBg: 'bg-gradient-to-br from-[#fed7aa] via-[#fdba74] to-[#fb923c]/70',
    badgeBg: 'bg-[#ffedd5]',
    badgeText: 'text-[#7c2d12]',
    accent: '#c2410c',
    count: 1420,
    progressWidth: '12%',
  },
  C1: {
    title: 'Goethe C1',
    subtitle: 'Advanced',
    cardBg: 'bg-gradient-to-br from-[#e9d5ff] via-[#d8b4fe] to-[#c084fc]/70',
    badgeBg: 'bg-[#f3e8ff]',
    badgeText: 'text-[#581c87]',
    accent: '#7e22ce',
    count: 980,
    progressWidth: '8%',
  },
  C2: {
    title: 'Goethe C2',
    subtitle: 'Mastery',
    cardBg: 'bg-gradient-to-br from-[#fecdd3] via-[#fda4af] to-[#fb7185]/70',
    badgeBg: 'bg-[#ffe4e6]',
    badgeText: 'text-[#881337]',
    accent: '#be123c',
    count: 610,
    progressWidth: '5%',
  },
};

export const ARTICLE_PILL_STYLES: Record<GermanArticle, string> = {
  der: 'bg-[#dbeafe] text-[#1e40af] border-blue-200',
  die: 'bg-[#fce7f3] text-[#9d174d] border-pink-200',
  das: 'bg-[#dcfce7] text-[#166534] border-emerald-200',
};
