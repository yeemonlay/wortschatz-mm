import {
  Hand,
  Users,
  Home,
  Utensils,
  ShoppingBag,
  Plane,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Leaf,
  Clock,
  MapPin,
  Smile,
  Shirt,
  Palette,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

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

export type NavigationTab = 'dashboard' | 'dictionary' | 'flashcards' | 'quiz' | 'support';

export interface CategoryMeta {
  icon: LucideIcon;
  label: string;
  pillClass: string;
}

export const CATEGORIES_META: Record<VocabularyCategory, CategoryMeta> = {
  greetings: { icon: Hand, label: 'Greetings', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  people: { icon: Users, label: 'People', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  home: { icon: Home, label: 'Home', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  food: { icon: Utensils, label: 'Food', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  shopping: { icon: ShoppingBag, label: 'Shopping', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  travel: { icon: Plane, label: 'Travel', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  work: { icon: Briefcase, label: 'Work', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  education: { icon: GraduationCap, label: 'Education', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  health: { icon: HeartPulse, label: 'Health', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  nature: { icon: Leaf, label: 'Nature', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  time: { icon: Clock, label: 'Time', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  places: { icon: MapPin, label: 'Places', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  emotions: { icon: Smile, label: 'Emotions', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  clothing: { icon: Shirt, label: 'Clothing', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  leisure: { icon: Palette, label: 'Leisure', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  other: { icon: Sparkles, label: 'Other', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
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
  der: 'bg-slate-200/70 text-slate-800 border-slate-300',
  die: 'bg-slate-200/70 text-slate-800 border-slate-300',
  das: 'bg-slate-200/70 text-slate-800 border-slate-300',
};
