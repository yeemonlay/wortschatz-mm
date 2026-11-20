import React, { useState, useEffect } from 'react';
import {
  Award,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Flame,
  Play,
  Lightbulb,
  Zap,
} from 'lucide-react';
import {
  VocabularyWord,
  CEFR_LEVELS_LIST,
  LEVEL_STYLES,
} from '@/types';
import { subscribeToVocabulary } from '@/services/vocabularyService';
import { speakGerman } from '@/services/audioService';
import {
  QuizMode,
  QuizQuestion,
  QuizOption,
  createQuizSession,
} from './quizGenerator';

interface QuizViewProps {
  words?: VocabularyWord[];
  loading?: boolean;
}

type ViewMode = 'hub' | 'playing' | 'summary';
type SessionSize = 10 | 20 | 'all';

export const QuizView: React.FC<QuizViewProps> = ({
  words: propWords,
  loading: propLoading,
}) => {
  // Vocabulary data source (props or direct Firestore subscription)
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
  const [selectedMode, setSelectedMode] = useState<QuizMode>('mixed');
  const [sessionSize, setSessionSize] = useState<SessionSize>(10);

  // Active quiz session state
  const [questionQueue, setQuestionQueue] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Scoring & streaks
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<{
    question: QuizQuestion;
    userOptionId: string;
    isCorrect: boolean;
  }[]>([]);

  // Filter words by currently selected CEFR level
  const levelFilteredWords = allWords.filter(
    (w) => selectedLevel === 'all' || w.level.toLowerCase() === selectedLevel.toLowerCase()
  );

  const nounWordsCount = levelFilteredWords.filter(
    (w) => w.type === 'noun' && !!w.article
  ).length;

  // Start a fresh quiz session
  const startQuiz = (modeOverride?: QuizMode) => {
    const mode = modeOverride || selectedMode;
    const questions = createQuizSession(allWords, {
      level: selectedLevel,
      mode,
      questionCount: sessionSize,
    });

    if (questions.length === 0) {
      alert('Not enough vocabulary words available to start a quiz for this selection.');
      return;
    }

    setQuestionQueue(questions);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setAnsweredQuestions([]);
    setViewMode('playing');
  };

  // Launch a retry session with missed questions
  const startMissedQuestionsRound = () => {
    const missed = answeredQuestions
      .filter((a) => !a.isCorrect)
      .map((a) => a.question);

    if (missed.length === 0) return;

    // Reshuffle options for missed questions
    const reshuffledQueue: QuizQuestion[] = missed.map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));

    setQuestionQueue(reshuffledQueue);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setAnsweredQuestions([]);
    setViewMode('playing');
  };

  const currentQuestion: QuizQuestion | undefined = questionQueue[currentIndex];

  // Handle Option Selection
  const handleSelectOption = (option: QuizOption) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    setSelectedOptionId(option.id);
    setIsAnswerSubmitted(true);

    const isCorrect = option.isCorrect;
    const nextStreak = isCorrect ? currentStreak + 1 : 0;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCurrentStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }
    } else {
      setCurrentStreak(0);
    }

    setAnsweredQuestions((prev) => [
      ...prev,
      {
        question: currentQuestion,
        userOptionId: option.id,
        isCorrect,
      },
    ]);
  };

  // Move to next question or complete session
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questionQueue.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setViewMode('summary');
    }
  };

  // Handle audio playback
  const handleAudioPlay = async (text?: string) => {
    if (!text) return;
    setAudioPlaying(true);
    await speakGerman(text);
    setAudioPlaying(false);
  };

  // =========================================================================
  // VIEW 1: QUIZ HUB & SETUP
  // =========================================================================
  if (viewMode === 'hub') {
    const totalLevelWords = levelFilteredWords.length;

    return (
      <div className="space-y-4 md:space-y-6 animate-fadeIn pb-8 max-w-5xl mx-auto">
        {/* Hub Header */}
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
              Interactive Quizzes
            </h1>
            <p className="text-[11px] md:text-sm text-slate-500 mt-0.5">
              Test and master German vocabulary with full-block multiple-choice challenges
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-[10px] md:text-xs font-bold shadow-2xs self-start mt-0.5">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mastery Assessment</span>
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
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
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
                className={`w-full py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionSize === 10
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                10 Questions
              </button>
              <button
                onClick={() => setSessionSize(20)}
                className={`w-full py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionSize === 20
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                20 Questions
              </button>
              <button
                onClick={() => setSessionSize('all')}
                className={`w-full py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sessionSize === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Available
              </button>
            </div>
          </div>
        </div>

        {/* 4 Quiz Modes Selection Cards */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-600 px-1">Select Quiz Challenge Mode</span>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-semibold">
              Loading vocabulary from Cloud Firestore...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Mode 1: Der, Die, Das (Articles Only for Nouns) */}
              <div
                onClick={() => {
                  setSelectedMode('articles');
                  startQuiz('articles');
                }}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer group ${
                  selectedMode === 'articles'
                    ? 'bg-gradient-to-br from-blue-50/90 via-white to-sky-100/40 border-blue-300 shadow-sm'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-blue-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-2xs">
                      👑
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      {nounWordsCount} Nouns
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Der, Die, Das
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Practice German grammatical articles exclusively for nouns with plural forms & grammar rules.
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Start Articles Quiz</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Mode 2: Meaning Match */}
              <div
                onClick={() => {
                  setSelectedMode('meaning');
                  startQuiz('meaning');
                }}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer group ${
                  selectedMode === 'meaning'
                    ? 'bg-gradient-to-br from-indigo-50/90 via-white to-indigo-100/40 border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-2xs">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Meaning Match
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Given a German word, choose the correct English & Myanmar meaning among 4 full-block choices.
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Start Meaning Quiz</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Mode 3: Sentence in Context */}
              <div
                onClick={() => {
                  setSelectedMode('sentence');
                  startQuiz('sentence');
                }}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer group ${
                  selectedMode === 'sentence'
                    ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-100/40 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shadow-2xs">
                    🧩
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Sentence in Context
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Fill in the missing word in authentic German example sentences using context clues.
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Start Sentence Quiz</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Mode 4: Mixed Challenge */}
              <div
                onClick={() => {
                  setSelectedMode('mixed');
                  startQuiz('mixed');
                }}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all select-none cursor-pointer group ${
                  selectedMode === 'mixed'
                    ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 border-amber-300 shadow-sm'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:border-amber-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shadow-2xs">
                    🎲
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Mixed Challenge
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Dynamic combination of articles, word meanings, and sentences for a complete workout.
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>Start Mixed Quiz</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE QUIZ PLAYER
  // =========================================================================
  if (viewMode === 'playing') {
    if (!currentQuestion) return null;

    const totalQuestions = questionQueue.length;
    const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
    const lvl = LEVEL_STYLES[currentQuestion.targetWord.level] || LEVEL_STYLES.A1;
    const optionLetterLabels = ['A', 'B', 'C', 'D'];

    const getModeBadge = () => {
      switch (currentQuestion.type) {
        case 'articles':
          return 'Choose the correct article (Der, Die, or Das)';
        case 'sentence':
          return 'Fill in the blank';
        default:
          return 'Choose the correct meaning';
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-4 md:space-y-5 animate-fadeIn pb-8">
        {/* Top Player Navigation Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <button
            onClick={() => setViewMode('hub')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quit Quiz</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Live Streak Counter */}
            {currentStreak >= 2 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black text-[11px] animate-bounce">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>{currentStreak} Streak!</span>
              </span>
            )}

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${lvl.badgeBg} ${lvl.badgeText}`}>
              {currentQuestion.targetWord.level}
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px]">
              Score: {score}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Header Card */}
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {getModeBadge()}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {currentQuestion.prompt}
            </h2>

            {currentQuestion.promptSub && (
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                {currentQuestion.promptSub}
              </p>
            )}
          </div>

          {/* Safe Audio Button (No answer spoilers) */}
          {currentQuestion.promptAudioText && (
            <div className="pt-1 flex justify-center">
              <button
                onClick={() => handleAudioPlay(currentQuestion.promptAudioText)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  audioPlaying
                    ? 'bg-indigo-100 text-indigo-800 scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Listen German</span>
              </button>
            </div>
          )}
        </div>

        {/* Full-Block Options Stack (One Per Line) */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, optIdx) => {
            const letter = optionLetterLabels[optIdx] || String(optIdx + 1);
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.isCorrect;

            let cardStyle =
              'bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50 text-slate-800 shadow-2xs';
            let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                // Correct option (highlighted in emerald)
                cardStyle =
                  'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20';
                badgeStyle = 'bg-emerald-500 text-white border-emerald-600';
              } else if (isSelected && !isCorrect) {
                // Selected wrong option (highlighted in rose)
                cardStyle =
                  'bg-rose-50/90 border-rose-500 text-rose-950 shadow-sm ring-2 ring-rose-500/20';
                badgeStyle = 'bg-rose-500 text-white border-rose-600';
              } else {
                // Dim other unselected incorrect options
                cardStyle = 'bg-slate-50/60 border-slate-200/60 text-slate-400 opacity-40';
                badgeStyle = 'bg-slate-100 text-slate-400 border-slate-200';
              }
            }

            return (
              <button
                key={option.id}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(option)}
                className={`w-full py-4 px-4 sm:px-5 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Letter badge: A, B, C, D */}
                  <span
                    className={`w-8 h-8 rounded-xl font-black text-xs shrink-0 flex items-center justify-center border ${badgeStyle}`}
                  >
                    {letter}
                  </span>

                  {/* Main Option Label + Sublabel */}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-bold truncate">
                      {option.label}
                    </div>
                    {option.subLabel && (
                      <div className="text-xs font-semibold text-amber-800/80 mt-0.5 truncate">
                        {option.subLabel}
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Indicator Icon */}
                {isAnswerSubmitted && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Explanation Card & Next Button */}
        {isAnswerSubmitted && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3.5 animate-fadeIn shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedOptionId &&
                currentQuestion.options.find((o) => o.id === selectedOptionId)?.isCorrect ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Richtig! (Correct!)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-600 font-black text-sm">
                    <XCircle className="w-4 h-4" />
                    <span>Falsch! (Incorrect)</span>
                  </div>
                )}
              </div>

              {currentStreak >= 3 && (
                <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-500" />
                  <span>On Fire!</span>
                </span>
              )}
            </div>

            {/* Explanation & Grammar Details */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* Reveal full pronunciation after answer */}
              {currentQuestion.explanationAudioText && (
                <div className="pt-1 border-t border-slate-200/60 flex items-center">
                  <button
                    type="button"
                    onClick={() => handleAudioPlay(currentQuestion.explanationAudioText)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      audioPlaying
                        ? 'bg-indigo-100 text-indigo-800 scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Listen full pronunciation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Next Question Action Button */}
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <span>{currentIndex + 1 < totalQuestions ? 'Next Question' : 'View Results'}</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: QUIZ SESSION SUMMARY
  // =========================================================================
  if (viewMode === 'summary') {
    const totalAttempted = answeredQuestions.length;
    const correctCount = score;
    const missedCount = totalAttempted - correctCount;
    const accuracyPercent =
      totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 100;

    const getPerformanceTitle = () => {
      if (accuracyPercent >= 90) return { title: 'Ausgezeichnet!', sub: 'Outstanding mastery!' };
      if (accuracyPercent >= 70) return { title: 'Sehr gut!', sub: 'Great job, keep it up!' };
      if (accuracyPercent >= 50) return { title: 'Gut gemacht!', sub: 'Good effort, practice makes perfect.' };
      return { title: 'Weiter üben!', sub: 'Keep practicing to reinforce these words.' };
    };

    const performance = getPerformanceTitle();

    return (
      <div className="max-w-md mx-auto space-y-6 animate-fadeIn py-4">
        {/* Celebration Trophy */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-100/70 border border-indigo-200 flex items-center justify-center shadow-xs">
            <Award className="w-10 h-10 text-indigo-600 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>{performance.title}</span>
            <span className="text-3xl">🎉</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold">
            {performance.sub}
          </p>
        </div>

        {/* Score Breakdown Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-center">
          <div className="space-y-1">
            <span className="text-4xl font-black text-slate-900">{accuracyPercent}%</span>
            <p className="text-xs font-bold text-slate-400">Accuracy Score</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xl font-black text-emerald-700">{correctCount}</span>
              <span className="text-[11px] font-bold text-emerald-800 mt-0.5">Correct</span>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xl font-black text-rose-700">{missedCount}</span>
              <span className="text-[11px] font-bold text-rose-800 mt-0.5">Missed</span>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-xl font-black text-amber-700">{maxStreak}</span>
              <span className="text-[11px] font-bold text-amber-800 mt-0.5">Max Streak</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {missedCount > 0 && (
            <button
              onClick={startMissedQuestionsRound}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 text-white font-black text-xs hover:bg-amber-700 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review Missed Questions ({missedCount})</span>
            </button>
          )}

          <button
            onClick={() => startQuiz()}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Practice Another Round</span>
          </button>

          <button
            onClick={() => setViewMode('hub')}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-base">👈</span>
            <span>Back to Quiz Hub</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizView;
