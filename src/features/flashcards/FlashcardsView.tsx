import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Check,
  RotateCcw,
  ArrowLeft,
  Lightbulb,
  Play,
  RotateCw,
  Layers,
  Award,
} from 'lucide-react';
import {
  VocabularyWord,
  CATEGORIES_META,
  CEFR_LEVELS_LIST,
  LEVEL_STYLES,
  ARTICLE_PILL_STYLES,
} from '@/types';
import { subscribeToVocabulary } from '@/services/vocabularyService';
import { speakGerman } from '@/services/audioService';

interface FlashcardsViewProps {
  words?: VocabularyWord[];
  loading?: boolean;
}

type ViewMode = 'hub' | 'playing' | 'summary';
type SessionSize = 10 | 20 | 'all';

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  words: propWords,
  loading: propLoading,
}) => {
  // Vocabulary state (prop or internal subscription)
  const [internalWords, setInternalWords] = useState<VocabularyWord[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    if (propWords && propWords.length > 0) return;
    const unsubscribe = subscribeToVocabulary(
      (loaded) => {
        setInternalWords(loaded);
        setInternalLoading(false);
      },
      () => setInternalLoading(false)
    );
    return () => unsubscribe();
  }, [propWords]);

  const allWords = propWords !== undefined ? propWords : internalWords;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  // View state machine
  const [viewMode, setViewMode] = useState<ViewMode>('hub');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sessionSize, setSessionSize] = useState<SessionSize>(10);

  // Active round state
  const [activeDeckTitle, setActiveDeckTitle] = useState('All Vocabulary');
  const [activeDeckEmoji, setActiveDeckEmoji] = useState('✨');
  const [sessionQueue, setSessionQueue] = useState<VocabularyWord[]>([]);
  const [initialSessionTotal, setInitialSessionTotal] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Round results tracking (In-Session only)
  const [masteredCards, setMasteredCards] = useState<VocabularyWord[]>([]);
  const [stillLearningCards, setStillLearningCards] = useState<VocabularyWord[]>([]);

  // Filter words by currently selected CEFR level
  const levelFilteredWords = allWords.filter(
    (w) => selectedLevel === 'all' || w.level.toLowerCase() === selectedLevel.toLowerCase()
  );

  // Start a study round
  const startSession = (categoryKey: string, deckTitle: string, emoji: string) => {
    let pool = levelFilteredWords;
    if (categoryKey !== 'all') {
      pool = levelFilteredWords.filter((w) => w.category === categoryKey);
    }

    if (pool.length === 0) {
      alert('No vocabulary entries available for this selection yet.');
      return;
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const count = sessionSize === 'all' ? shuffled.length : Math.min(sessionSize, shuffled.length);
    const roundWords = shuffled.slice(0, count);

    setActiveDeckTitle(deckTitle);
    setActiveDeckEmoji(emoji);
    setSessionQueue(roundWords);
    setInitialSessionTotal(roundWords.length);
    setIsRevealed(false);
    setMasteredCards([]);
    setStillLearningCards([]);
    setViewMode('playing');
  };

  // Launch a retry round with missed words
  const startMissedWordsRound = () => {
    if (stillLearningCards.length === 0) return;
    const retryPool = [...stillLearningCards].sort(() => Math.random() - 0.5);
    setSessionQueue(retryPool);
    setInitialSessionTotal(retryPool.length);
    setIsRevealed(false);
    setMasteredCards([]);
    setStillLearningCards([]);
    setViewMode('playing');
  };

  // Current active card in session
  const currentCard = sessionQueue[0] as VocabularyWord | undefined;

  // Handle Audio Pronunciation
  const handleAudioPlay = async (text: string) => {
    setAudioPlaying(true);
    await speakGerman(text);
    setAudioPlaying(false);
  };

  // Action: Got It (Mastered this card)
  const handleGotIt = () => {
    if (!currentCard) return;

    const updatedMastered = [...masteredCards, currentCard];
    setMasteredCards(updatedMastered);

    const remaining = sessionQueue.slice(1);
    setIsRevealed(false);

    if (remaining.length === 0) {
      setViewMode('summary');
    } else {
      setSessionQueue(remaining);
    }
  };

  // Action: Still Learning (Needs practice, re-queue to end of round)
  const handleStillLearning = () => {
    if (!currentCard) return;

    if (!stillLearningCards.some((c) => c.id === currentCard.id)) {
      setStillLearningCards((prev) => [...prev, currentCard]);
    }

    // Push to back of the queue so user sees it again before completing
    const remaining = [...sessionQueue.slice(1), currentCard];
    setIsRevealed(false);
    setSessionQueue(remaining);
  };

  // =========================================================================
  // VIEW 1: THE DECK HUB
  // =========================================================================
  if (viewMode === 'hub') {
    const totalLevelWords = levelFilteredWords.length;

    return (
      <div className="space-y-4 md:space-y-6 animate-fadeIn pb-8">
        {/* Hub Header */}
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
              Flashcards
            </h1>
            <p className="text-[11px] md:text-sm text-slate-500 mt-0.5">
              Choose a topic deck to practice German active recall with bite-sized rounds
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-[10px] md:text-xs font-bold shadow-2xs self-start mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active Recall</span>
          </div>
        </div>

        {/* Configuration Bar: CEFR Filter & Session Size Selector */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
          {/* CEFR Level Filter */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Choose CEFR Level</span>
              <span className="text-slate-400 font-semibold">{totalLevelWords} words available</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1.5 px-0.5 scrollbar-none">
              <button
                onClick={() => setSelectedLevel('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedLevel === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All Levels
              </button>
              {CEFR_LEVELS_LIST.map((lvl) => {
                const s = LEVEL_STYLES[lvl];
                const active = selectedLevel === lvl.toLowerCase();
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all shrink-0 ${
                      s.badgeBg
                    } ${s.badgeText} ${
                      active
                        ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white font-black shadow-2xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Size Selector */}
          <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-600">Round Size</span>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto sm:min-w-[340px]">
              <button
                onClick={() => setSessionSize(10)}
                className={`w-full py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                  sessionSize === 10
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                10 Cards
              </button>
              <button
                onClick={() => setSessionSize(20)}
                className={`w-full py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                  sessionSize === 20
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                20 Cards
              </button>
              <button
                onClick={() => setSessionSize('all')}
                className={`w-full py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                  sessionSize === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Cards
              </button>
            </div>
          </div>
        </div>

        {/* Featured Smart Deck Card: All Words Mix (Light Pastel Aesthetic) */}
        <div
          onClick={() =>
            startSession(
              'all',
              selectedLevel === 'all' ? 'All Vocabulary Mix' : `CEFR ${selectedLevel.toUpperCase()} Complete Mix`,
              '🏆'
            )
          }
          className="relative overflow-hidden rounded-[28px] p-5 bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 border border-amber-200/80 text-slate-900 cursor-pointer shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
              <span>🏆</span> Featured Smart Deck
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded-full">
              {totalLevelWords} words
            </span>
          </div>
          <h3 className="text-xl font-black mt-3 text-slate-900">
            {selectedLevel === 'all'
              ? 'Complete Vocabulary Mix'
              : `Level ${selectedLevel.toUpperCase()} Mixed Deck`}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Practice active recall across all available topics
          </p>
          <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-amber-200/60">
            <span className="text-[11px] font-semibold text-slate-500">
              Round: {sessionSize === 'all' ? totalLevelWords : Math.min(sessionSize, totalLevelWords)} cards
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-900 group-hover:translate-x-1 transition-transform">
              <span>Start Round</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* 16 Category Decks Grid */}
        <div className="space-y-3">
          <div className="flex items-center text-xs font-bold text-slate-700 px-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Category Decks</span>
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-semibold">
              Loading vocabulary decks from Cloud Firestore...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(CATEGORIES_META).map(([cKey, cat]) => {
                const count = levelFilteredWords.filter((w) => w.category === cKey).length;
                const isDisabled = count === 0;

                return (
                  <button
                    key={cKey}
                    disabled={isDisabled}
                    onClick={() => startSession(cKey, cat.label, cat.emoji)}
                    className={`p-4 rounded-3xl border text-left flex flex-col justify-between transition-all select-none ${
                      isDisabled
                        ? 'bg-slate-50 border-slate-200/60 opacity-40 cursor-not-allowed'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-300 hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shadow-2xs">
                        {cat.emoji}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {cat.label}
                      </h4>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-400">
                        {count} {count === 1 ? 'word' : 'words'}
                      </span>
                      {!isDisabled && (
                        <span className="text-indigo-600 font-bold">Start →</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: THE CARD PLAYER (ACTIVE RECALL: EN/MM -> GERMAN)
  // =========================================================================
  if (viewMode === 'playing') {
    if (!currentCard) {
      return null;
    }

    const cat = CATEGORIES_META[currentCard.category] || CATEGORIES_META.other;
    const lvl = LEVEL_STYLES[currentCard.level] || LEVEL_STYLES.A1;
    const articleStyle = currentCard.article ? ARTICLE_PILL_STYLES[currentCard.article] : '';

    const completedSoFar = initialSessionTotal - sessionQueue.length;
    const progressPercent = Math.min(100, Math.round((completedSoFar / initialSessionTotal) * 100));

    return (
      <div className="max-w-md mx-auto space-y-4 animate-fadeIn pb-8">
        {/* Top Player Navigation Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <button
            onClick={() => setViewMode('hub')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Decks</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px]">
              {activeDeckEmoji} {activeDeckTitle}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${lvl.badgeBg} ${lvl.badgeText}`}>
              {currentCard.level}
            </span>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span>Card {completedSoFar + 1} of {initialSessionTotal}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Rounded Pastel Card Frame (Matching Mock UI) */}
        <div
          onClick={() => setIsRevealed(!isRevealed)}
          className="bg-white rounded-[32px] border border-slate-200/90 shadow-md overflow-hidden cursor-pointer select-none transition-all hover:shadow-lg active:scale-[0.99]"
        >
          {/* Pastel Header Banner */}
          <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </span>
            <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {currentCard.type}
            </span>
          </div>

          {/* Card Center Content */}
          <div className="p-7 sm:p-9 text-center space-y-4">
            {/* 80x80 Emoji Box */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl shadow-2xs">
              {cat.emoji}
            </div>

            {/* FRONT SIDE: Active Recall Prompt (English + Myanmar) */}
            {!isRevealed ? (
              <div className="space-y-2 py-2">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">
                  Translate to German
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {currentCard.english}
                </h2>
                {currentCard.myanmar && (
                  <p className="text-lg sm:text-xl font-black text-amber-700">
                    {currentCard.myanmar}
                  </p>
                )}
                <p className="text-xs font-bold text-slate-400 pt-3 flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-slate-400 animate-spin-slow" />
                  <span>Tap card or Reveal to check German</span>
                </p>
              </div>
            ) : (
              /* BACK SIDE: German Target Revealed */
              <div className="space-y-3 py-1 animate-fadeIn">
                <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase block">
                  German Translation
                </span>

                <div className="space-y-1.5">
                  {currentCard.type === 'noun' && currentCard.article && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${articleStyle}`}>
                      {currentCard.article}
                    </span>
                  )}

                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {currentCard.german}
                  </h2>

                  {(currentCard.plural || currentCard.conjugationSummary) && (
                    <p className="text-xs text-slate-500 font-semibold">
                      {currentCard.plural && `Plural: ${currentCard.plural}`}
                      {currentCard.plural && currentCard.conjugationSummary && ' • '}
                      {currentCard.conjugationSummary}
                    </p>
                  )}
                </div>

                {/* Example sentence callout */}
                {currentCard.exampleGerman && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 flex items-start gap-2 text-left mt-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">"{currentCard.exampleGerman}"</p>
                      {currentCard.exampleEnglish && (
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          {currentCard.exampleEnglish}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Audio Button */}
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAudioPlay(currentCard.german);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs ${
                      audioPlaying
                        ? 'bg-amber-100 text-amber-800 scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    <span>Listen Pronunciation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Grading Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleStillLearning}
            className="py-3 px-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs hover:bg-rose-100 transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Still Learning</span>
          </button>

          <button
            onClick={handleGotIt}
            className="py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Got It!</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: THE SESSION SUMMARY
  // =========================================================================
  if (viewMode === 'summary') {
    const totalAttempted = masteredCards.length + stillLearningCards.length;
    const scorePercent =
      totalAttempted > 0 ? Math.round((masteredCards.length / totalAttempted) * 100) : 100;

    return (
      <div className="max-w-md mx-auto space-y-6 animate-fadeIn py-4">
        {/* Celebration Trophy */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100/70 border border-amber-200 flex items-center justify-center shadow-xs">
            <Award className="w-10 h-10 text-amber-600 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>Practice Round Complete!</span>
            <span className="text-3xl">🎉</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold flex items-center justify-center gap-1.5">
            <span className="text-base">{activeDeckEmoji}</span>
            <span>{activeDeckTitle} • CEFR {selectedLevel.toUpperCase()}</span>
          </p>
        </div>

        {/* Score Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-center">
          <div className="space-y-1">
            <span className="text-4xl font-black text-slate-900">{scorePercent}%</span>
            <p className="text-xs font-bold text-slate-400">Mastery Score</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-emerald-700">
                {masteredCards.length}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-emerald-800">Mastered</span>
                <span className="text-base">✅</span>
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-rose-700">
                {stillLearningCards.length}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-rose-800">Needs Review</span>
                <span className="text-base">🔄</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {stillLearningCards.length > 0 && (
            <button
              onClick={startMissedWordsRound}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review Missed Words ({stillLearningCards.length})</span>
            </button>
          )}

          <button
            onClick={() =>
              startSession(
                activeDeckTitle === 'All Vocabulary Mix' ? 'all' : 'all',
                activeDeckTitle,
                activeDeckEmoji
              )
            }
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Practice Another Round</span>
          </button>

          <button
            onClick={() => setViewMode('hub')}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-base">👈</span>
            <span>Back to Category Decks</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default FlashcardsView;
