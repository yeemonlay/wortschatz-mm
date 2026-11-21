import { VocabularyWord, GermanArticle } from '@/types';

export type QuizMode = 'articles' | 'meaning' | 'sentence' | 'mixed';

export interface QuizOption {
  id: string;
  label: string;
  subLabel?: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'articles' | 'meaning' | 'sentence';
  prompt: string;
  promptSub?: string;
  targetWord: VocabularyWord;
  options: QuizOption[];
  explanation: string;
  promptAudioText?: string;
  explanationAudioText?: string;
}

export interface QuizSessionConfig {
  level: string; // 'all' | 'a1' | 'a2' | etc.
  mode: QuizMode;
  questionCount: number;
}

/**
 * Fisher-Yates array shuffle (non-mutating)
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Clean and format the word with article for nouns
 */
export function formatGermanWordWithArticle(word: VocabularyWord): string {
  if (word.type === 'noun' && word.article) {
    return `${word.article} ${word.german}`;
  }
  return word.german;
}

/**
 * Selects smart distractors from the vocabulary pool.
 *
 * Part-of-speech enforcement:
 * If targetWord is a verb, all distractors must be verbs.
 * If targetWord is a noun, all distractors must be nouns.
 * If targetWord is an adjective, all distractors must be adjectives.
 *
 * Preference hierarchy:
 * 1. Strict same part of speech (verb -> verbs, noun -> nouns, etc.):
 *    a. Same POS + same category + same level
 *    b. Same POS + same category
 *    c. Same POS + same level
 *    d. Same POS from active pool
 *    e. Same POS from global pool (cross-level if needed)
 * 2. Graceful fallback (only if total database words of this POS < count):
 *    a. Same category and level
 *    b. Same category
 *    c. Same level
 *    d. Any other valid word
 */
function getSmartDistractors(
  targetWord: VocabularyWord,
  pool: VocabularyWord[],
  count: number = 3,
  globalPool?: VocabularyWord[]
): VocabularyWord[] {
  const targetType = targetWord.type;

  const isValidCandidate = (w: VocabularyWord): boolean =>
    w.id !== targetWord.id &&
    w.german.trim().toLowerCase() !== targetWord.german.trim().toLowerCase() &&
    w.english.trim().toLowerCase() !== targetWord.english.trim().toLowerCase() &&
    w.type !== 'sentence' &&
    w.english.length <= 45;

  const activeCandidates = pool.filter(isValidCandidate);
  const globalCandidates = (globalPool || []).filter(isValidCandidate);

  const selectedDistractors: VocabularyWord[] = [];
  const selectedIds = new Set<string>();

  const tryAdd = (candidates: VocabularyWord[]) => {
    const shuffled = shuffleArray(candidates);
    for (const item of shuffled) {
      if (selectedDistractors.length >= count) break;
      if (!selectedIds.has(item.id)) {
        selectedDistractors.push(item);
        selectedIds.add(item.id);
      }
    }
  };

  // Step 1: Prioritize matching the exact same part of speech (verb -> verbs, noun -> nouns, etc.)
  if (targetType) {
    const sameTypeActive = activeCandidates.filter((w) => w.type === targetType);
    const sameTypeGlobal = globalCandidates.filter((w) => w.type === targetType);

    // Try from active pool first
    tryAdd(sameTypeActive.filter((w) => w.category === targetWord.category && w.level.toLowerCase() === targetWord.level.toLowerCase()));
    if (selectedDistractors.length < count) tryAdd(sameTypeActive.filter((w) => w.category === targetWord.category));
    if (selectedDistractors.length < count) tryAdd(sameTypeActive.filter((w) => w.level.toLowerCase() === targetWord.level.toLowerCase()));
    if (selectedDistractors.length < count) tryAdd(sameTypeActive);

    // If active pool doesn't have enough words of the same POS (e.g. fewer than 3 verbs in current level/category),
    // pull from the global vocabulary pool so options REMAIN verbs/nouns/adjectives!
    if (selectedDistractors.length < count) {
      tryAdd(sameTypeGlobal.filter((w) => w.category === targetWord.category && w.level.toLowerCase() === targetWord.level.toLowerCase()));
      if (selectedDistractors.length < count) tryAdd(sameTypeGlobal.filter((w) => w.category === targetWord.category));
      if (selectedDistractors.length < count) tryAdd(sameTypeGlobal.filter((w) => w.level.toLowerCase() === targetWord.level.toLowerCase()));
      if (selectedDistractors.length < count) tryAdd(sameTypeGlobal);
    }
  }

  // Step 2: Graceful fallback ONLY if the entire database has fewer than `count` words of this part of speech
  if (selectedDistractors.length < count) {
    tryAdd(activeCandidates.filter((w) => w.category === targetWord.category && w.level.toLowerCase() === targetWord.level.toLowerCase()));
    if (selectedDistractors.length < count) tryAdd(activeCandidates.filter((w) => w.category === targetWord.category));
    if (selectedDistractors.length < count) tryAdd(activeCandidates.filter((w) => w.level.toLowerCase() === targetWord.level.toLowerCase()));
    if (selectedDistractors.length < count) tryAdd(activeCandidates);
    if (selectedDistractors.length < count) tryAdd(globalCandidates);
  }

  return selectedDistractors;
}

/**
 * Generate a "Der, Die, Das" article question strictly for nouns
 */
export function generateArticleQuestion(targetWord: VocabularyWord): QuizQuestion {
  const articles: { article: GermanArticle; genderEn: string; genderMm: string }[] = [
    { article: 'der', genderEn: 'Masculine', genderMm: 'ပုလ္လိင်' },
    { article: 'die', genderEn: 'Feminine', genderMm: 'ဣတ္ထိလ္လိင်' },
    { article: 'das', genderEn: 'Neuter', genderMm: 'နပုံသကလိင်' },
  ];

  const options: QuizOption[] = articles.map((item) => ({
    id: `opt-article-${item.article}-${targetWord.id}`,
    label: item.article,
    subLabel: `${item.genderEn} • ${item.genderMm}`,
    isCorrect: targetWord.article === item.article,
  }));

  let explanation = `It's "${targetWord.article} ${targetWord.german}" (${targetWord.english}).`;
  if (targetWord.plural) {
    explanation += ` Plural: die ${targetWord.plural}.`;
  }
  if (targetWord.remark) {
    explanation += ` Tip: ${targetWord.remark}`;
  }

  return {
    id: `q-article-${targetWord.id}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'articles',
    prompt: `___ ${targetWord.german}`,
    promptSub: `${targetWord.plural ? `Plural: die ${targetWord.plural} • ` : ''}${targetWord.english}${
      targetWord.myanmar ? ` (${targetWord.myanmar})` : ''
    }`,
    targetWord,
    options,
    explanation,
    // Strictly pronounce only the noun itself before answering (e.g. "Tisch"), zero der/die/das spoiler!
    promptAudioText: targetWord.german,
    // Full article + noun pronunciation revealed only after submitting answer
    explanationAudioText: `${targetWord.article || ''} ${targetWord.german}`.trim(),
  };
}

/**
 * Generate a "Meaning Match" question:
 * Prompt: German word (e.g. "der Tisch")
 * Options: English + Myanmar meanings
 */
export function generateMeaningQuestion(
  targetWord: VocabularyWord,
  pool: VocabularyWord[],
  globalPool?: VocabularyWord[]
): QuizQuestion {
  const distractors = getSmartDistractors(targetWord, pool, 3, globalPool);

  const correctOption: QuizOption = {
    id: `opt-correct-${targetWord.id}`,
    label: targetWord.english,
    subLabel: targetWord.myanmar || undefined,
    isCorrect: true,
  };

  const distractorOptions: QuizOption[] = distractors.map((d) => ({
    id: `opt-distractor-${d.id}`,
    label: d.english,
    subLabel: d.myanmar || undefined,
    isCorrect: false,
  }));

  const options = shuffleArray([correctOption, ...distractorOptions]);

  const germanWithArticle = formatGermanWordWithArticle(targetWord);
  let explanation = `"${germanWithArticle}" means "${targetWord.english}"`;
  if (targetWord.myanmar) {
    explanation += ` (${targetWord.myanmar})`;
  }
  if (targetWord.plural) {
    explanation += `. Plural: ${targetWord.plural}`;
  }
  if (targetWord.conjugationSummary) {
    explanation += `. Conjugation: ${targetWord.conjugationSummary}`;
  }
  if (targetWord.remark) {
    explanation += `. Tip: ${targetWord.remark}`;
  }

  return {
    id: `q-meaning-${targetWord.id}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'meaning',
    prompt: germanWithArticle,
    promptSub: targetWord.type ? `Part of speech: ${targetWord.type}` : undefined,
    targetWord,
    options,
    explanation,
    promptAudioText: targetWord.german,
    explanationAudioText: germanWithArticle,
  };
}

/**
 * Generate a "Sentence in Context / Fill-in-the-Blank" question:
 * Prompt: Sentence with masked word: e.g. "Deutschland ist ein schönes ___."
 * PromptSub: English / Myanmar sentence translation
 * Options: German words
 */
export function generateSentenceQuestion(
  targetWord: VocabularyWord,
  pool: VocabularyWord[],
  globalPool?: VocabularyWord[]
): QuizQuestion | null {
  if (!targetWord.exampleGerman || targetWord.exampleGerman.length > 55) {
    return null;
  }

  const rawSentence = targetWord.exampleGerman;
  // Look for target word or its stem in the example sentence
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordRegex = new RegExp(`\\b${escapeRegExp(targetWord.german)}\\b`, 'i');

  let blankedSentence = rawSentence;
  if (wordRegex.test(rawSentence)) {
    blankedSentence = rawSentence.replace(wordRegex, '_______');
  } else {
    // If exact whole word is not found (e.g. inflected or compound), replace first occurrence of stem if >= 4 chars
    if (targetWord.german.length >= 4) {
      const stem = targetWord.german.slice(0, -1);
      const stemRegex = new RegExp(`\\b${escapeRegExp(stem)}[a-zäöüß]*\\b`, 'i');
      if (stemRegex.test(rawSentence)) {
        blankedSentence = rawSentence.replace(stemRegex, '_______');
      } else {
        return null; // Cannot create a clean fill-in-the-blank
      }
    } else {
      return null;
    }
  }

  const distractors = getSmartDistractors(targetWord, pool, 3, globalPool);

  const correctOption: QuizOption = {
    id: `opt-sentence-correct-${targetWord.id}`,
    label: targetWord.german,
    subLabel: targetWord.type === 'noun' && targetWord.article ? `(${targetWord.article})` : undefined,
    isCorrect: true,
  };

  const distractorOptions: QuizOption[] = distractors.map((d) => ({
    id: `opt-sentence-distractor-${d.id}`,
    label: d.german,
    subLabel: d.type === 'noun' && d.article ? `(${d.article})` : undefined,
    isCorrect: false,
  }));

  const options = shuffleArray([correctOption, ...distractorOptions]);

  const explanation = `Complete sentence: "${rawSentence}" — ${targetWord.exampleEnglish || targetWord.english}${
    targetWord.exampleMyanmar ? ` (${targetWord.exampleMyanmar})` : ''
  }`;

  return {
    id: `q-sentence-${targetWord.id}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'sentence',
    prompt: blankedSentence,
    promptSub: targetWord.exampleEnglish
      ? targetWord.exampleMyanmar
        ? `${targetWord.exampleEnglish} • ${targetWord.exampleMyanmar}`
        : targetWord.exampleEnglish
      : targetWord.english,
    targetWord,
    options,
    explanation,
    promptAudioText: undefined, // Don't spoil the missing word before answering
    explanationAudioText: rawSentence,
  };
}

/**
 * Builds a complete randomized quiz session queue based on user configuration
 */
export function createQuizSession(
  words: VocabularyWord[],
  config: QuizSessionConfig
): QuizQuestion[] {
  if (!words || words.length === 0) return [];

  // Filter pool by level
  const levelFiltered = words.filter(
    (w) => config.level === 'all' || w.level.toLowerCase() === config.level.toLowerCase()
  );

  let candidatePool = levelFiltered;
  if (config.mode === 'articles') {
    // Only nouns that have an article
    candidatePool = levelFiltered.filter((w) => w.type === 'noun' && !!w.article);
    if (candidatePool.length === 0) {
      candidatePool = words.filter((w) => w.type === 'noun' && !!w.article);
    }
  } else {
    // Exclude long multi-line dialogue sentences from multiple-choice quizzes
    candidatePool = levelFiltered.filter(
      (w) => w.type !== 'sentence' && w.german.length <= 32 && w.english.length <= 40
    );
    if (candidatePool.length < 4) {
      candidatePool = words.filter(
        (w) => w.type !== 'sentence' && w.german.length <= 32 && w.english.length <= 40
      );
    }
  }

  const shuffledCandidates = shuffleArray(candidatePool);
  const questions: QuizQuestion[] = [];

  for (const word of shuffledCandidates) {
    if (questions.length >= config.questionCount) {
      break;
    }

    if (config.mode === 'articles') {
      if (word.type === 'noun' && word.article) {
        questions.push(generateArticleQuestion(word));
      }
    } else if (config.mode === 'sentence') {
      const q = generateSentenceQuestion(word, candidatePool, words);
      if (q) questions.push(q);
    } else if (config.mode === 'meaning') {
      questions.push(generateMeaningQuestion(word, candidatePool, words));
    } else {
      // Mixed mode: articles, sentence, or meaning
      const dice = Math.random();
      if (word.type === 'noun' && word.article && dice < 0.3) {
        questions.push(generateArticleQuestion(word));
      } else if (word.exampleGerman && dice < 0.65) {
        const sentenceQ = generateSentenceQuestion(word, candidatePool, words);
        if (sentenceQ) {
          questions.push(sentenceQ);
          continue;
        }
        questions.push(generateMeaningQuestion(word, candidatePool, words));
      } else {
        questions.push(generateMeaningQuestion(word, candidatePool, words));
      }
    }
  }

  return questions;
}
