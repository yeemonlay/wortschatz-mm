import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Volume2,
  Plus,
  Upload,
  Edit3,
  Trash2,
  X,
  WifiOff,
  AlertCircle,
  Database,
  ArrowUp,
  Loader2,
} from 'lucide-react';
import {
  VocabularyWord,
  CATEGORIES_META,
  CEFR_LEVELS_LIST,
  LEVEL_STYLES,
  ARTICLE_PILL_STYLES,
} from '@/types';
import { subscribeToVocabulary, deleteVocabularyWord } from '@/services/vocabularyService';
import { speakGerman } from '@/services/audioService';
import { useNetworkStatus } from '@/hooks';
import { cn } from '@/utils/cn';
import { CustomSelect, CustomSelectOption } from '@/components/ui/CustomSelect';

interface WordBankViewProps {
  isAdmin?: boolean;
  onOpenWordModal: (word?: VocabularyWord) => void;
  onOpenImportExport: () => void;
  selectedLevel?: string;
  onSelectLevel?: (level: string) => void;
}

const BATCH_SIZE = 40;

const TYPE_OPTIONS: CustomSelectOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'noun', label: 'Nouns' },
  { value: 'verb', label: 'Verbs' },
  { value: 'adjective', label: 'Adjectives' },
  { value: 'sentence', label: 'Sentences' },
];

const CATEGORY_OPTIONS: CustomSelectOption[] = [
  { value: 'all', label: 'All 16 Categories' },
  ...Object.entries(CATEGORIES_META).map(([cKey, cat]) => ({
    value: cKey,
    label: cat.label,
    emoji: cat.emoji,
  })),
];

export const WordBankView: React.FC<WordBankViewProps> = ({
  isAdmin = false,
  onOpenWordModal,
  onOpenImportExport,
  selectedLevel: controlledLevel,
  onSelectLevel: setControlledLevel,
}) => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalLevel, setInternalLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Progressive batching & scroll state
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const isOnline = useNetworkStatus();

  // Support controlled level (from Dashboard navigation) or internal level
  const selectedLevel = controlledLevel !== undefined ? controlledLevel.toLowerCase() : internalLevel.toLowerCase();

  const handleSetLevel = (lvl: string) => {
    const normalized = lvl.toLowerCase();
    if (setControlledLevel) {
      setControlledLevel(lvl === 'all' || lvl === 'ALL' ? 'all' : lvl.toUpperCase());
    } else {
      setInternalLevel(normalized);
    }
  };

  // Real-time Firestore subscription (directly from Firestore DB)
  useEffect(() => {
    const unsubscribe = subscribeToVocabulary(
      (loadedWords) => {
        setWords(loadedWords);
        setFirestoreError(null);
        setLoading(false);
      },
      (error: any) => {
        console.error('Firestore subscription error:', error);
        setFirestoreError(error.message || 'Error connecting to Firestore database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter words
  const filteredWords = words.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.german.toLowerCase().includes(q) ||
      item.english.toLowerCase().includes(q) ||
      (item.myanmar && item.myanmar.includes(q)) ||
      (item.plural && item.plural.toLowerCase().includes(q));

    const matchesLevel =
      selectedLevel === 'all' || item.level.toLowerCase() === selectedLevel;

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesType =
      selectedType === 'all' ||
      item.type.toLowerCase() === selectedType.toLowerCase() ||
      (selectedType === 'sentence' && (item.type === 'sentence' || item.type === 'phrase'));

    return matchesSearch && matchesLevel && matchesCategory && matchesType;
  });

  // Reset visible items when search query or filters change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, selectedLevel, selectedCategory, selectedType]);

  // Infinite scroll observer: load next batch as sentinel comes into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < filteredWords.length) {
              return Math.min(prev + BATCH_SIZE, filteredWords.length);
            }
            return prev;
          });
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredWords.length]);

  // Monitor scroll for Floating Back to Top Button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Slice visible items for rendering
  const visibleWords = filteredWords.slice(0, visibleCount);
  const hasMore = visibleCount < filteredWords.length;

  const handleAudioPlay = async (word: string, id: string) => {
    setAudioPlaying(id);
    await speakGerman(word);
    setAudioPlaying(null);
  };

  const handleDelete = async (item: VocabularyWord) => {
    if (!window.confirm(`Delete "${item.german}" from the dictionary?`)) return;
    try {
      await deleteVocabularyWord(item.id);
    } catch (err: any) {
      alert(`Error deleting word: ${err.message}`);
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="mb-4 bg-amber-500/15 border border-amber-500/30 text-amber-900 px-4 py-2 rounded-2xl flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-700" />
            <span>Offline mode active — using cached vocabulary from local persistence.</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider bg-amber-200/60 px-2 py-0.5 rounded-full font-black">
            Offline
          </span>
        </div>
      )}

      {/* Firestore Connection Error Banner */}
      {firestoreError && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-rose-800">
              Cloud Firestore Read Blocked: {firestoreError}
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Your Firebase Firestore Security Rules are currently denying read access (missing or insufficient permissions). Please update your Security Rules in Firebase Console &rarr; Firestore Database &rarr; Rules to allow access.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          MOBILE VIEW (matches Mock UI isMobile buildDictionaryViewHtml)
          ======================================================== */}
      <div className="md:hidden space-y-3">
        {/* Mobile Sticky Filter Panel */}
        <div className="sticky top-[56px] z-20 -mx-4 px-4 pt-0 pb-2.5 bg-[#f8f7f4]/95 backdrop-blur-md border-b border-slate-200/60 shadow-2xs space-y-2.5 transition-all">
          {/* Mobile Header Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Word Bank</h1>
              <p className="text-[11px] md:text-sm text-slate-500 mt-0.5">
                {loading
                  ? 'Loading...'
                  : `${Math.min(visibleWords.length, filteredWords.length)} of ${filteredWords.length} shown`}
              </p>
            </div>
            <div className="w-28 shrink-0">
              <CustomSelect
                value={selectedType}
                onChange={setSelectedType}
                options={TYPE_OPTIONS}
                buttonClassName="h-[34px] px-2.5 pr-7 text-[11px] bg-white rounded-xl"
                menuClassName="right-0 left-auto min-w-[140px]"
              />
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs font-semibold placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Horizontal Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              All
            </button>
            {Object.entries(CATEGORIES_META).map(([cKey, cat]) => {
              const active = selectedCategory === cKey;
              return (
                <button
                  key={cKey}
                  onClick={() => setSelectedCategory(cKey)}
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile CEFR Pills */}
          <div className="flex items-center justify-between gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => handleSetLevel('all')}
              className={`flex-1 py-1 text-center rounded-xl text-[10px] font-black transition-all ${
                selectedLevel === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              ALL
            </button>
            {CEFR_LEVELS_LIST.map((lvl) => {
              const s = LEVEL_STYLES[lvl];
              const active = selectedLevel === lvl.toLowerCase();
              return (
                <button
                  key={lvl}
                  onClick={() => handleSetLevel(lvl)}
                  className={`flex-1 py-1 text-center rounded-xl text-[10px] font-black transition-all ${
                    active
                      ? `${s.badgeBg} ${s.badgeText} ring-2 ring-indigo-600 ring-offset-1 ring-offset-white font-black`
                      : 'text-slate-500'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Vocabulary Cards */}
        <div className="space-y-2 pt-1">
          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Connecting directly to Cloud Firestore database...
            </div>
          ) : firestoreError ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
              <p className="font-bold text-slate-800">Cannot Retrieve From Database</p>
              <p className="text-[11px] text-slate-400">{firestoreError}</p>
            </div>
          ) : words.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2.5">
              <Database className="w-6 h-6 text-amber-500 mx-auto" />
              <p className="font-bold text-slate-800">Cloud Firestore 'vocabulary' is Empty</p>
              <p className="text-[11px] text-slate-400">0 documents found in database collection.</p>
              {isAdmin && (
                <button
                  onClick={onOpenImportExport}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Import Words to Database
                </button>
              )}
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No vocabulary matches your search or filters.
            </div>
          ) : (
            visibleWords.map((item) => {
              const lvl = LEVEL_STYLES[item.level] || LEVEL_STYLES.A1;
              const cat = CATEGORIES_META[item.category] || CATEGORIES_META.other;
              const articleStyle = item.article ? ARTICLE_PILL_STYLES[item.article] : '';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center flex-wrap gap-1.5">
                      {item.type === 'noun' && item.article && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black ${articleStyle}`}
                        >
                          {item.article}
                        </span>
                      )}
                      <span className="text-sm font-black text-slate-900">{item.german}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black ${lvl.badgeBg} ${lvl.badgeText}`}
                      >
                        {item.level}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${cat.pillClass}`}
                      >
                        {cat.emoji} {cat.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-600">{item.english}</p>
                  {item.myanmar && (
                    <p className="text-xs font-semibold text-amber-800">{item.myanmar}</p>
                  )}

                  {(item.exampleGerman || item.plural || item.conjugationSummary) && (
                    <p className="text-[10px] text-slate-400 italic">
                      {item.plural && (
                        <span className="not-italic font-medium text-slate-500 mr-1.5">
                          Pl: {item.plural}
                        </span>
                      )}
                      {item.conjugationSummary && (
                        <span className="not-italic font-medium text-slate-500 mr-1.5">
                          {item.conjugationSummary}
                        </span>
                      )}
                      {item.exampleGerman && `"${item.exampleGerman}"`}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                    <span className="text-[10px] font-semibold text-slate-400 capitalize">
                      {item.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAudioPlay(item.german, item.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          audioPlaying === item.id
                            ? 'bg-amber-100 text-amber-800 scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onOpenWordModal(item)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                            title="Edit entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================
          DESKTOP VIEW (matches Mock UI buildDictionaryViewHtml)
          ======================================================== */}
      <div className="hidden md:block space-y-4">
        {/* Desktop Sticky Header & Filter Toolbar */}
        <div className="sticky top-[65px] z-20 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 pt-0 pb-3 bg-[#f8f7f4]/95 backdrop-blur-md border-b border-slate-200/60 shadow-2xs space-y-3 transition-all">
          {/* Desktop Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Word Bank</h1>
              <p className="text-[11px] md:text-sm text-slate-500 mt-0.5">
                {loading
                  ? 'Connecting...'
                  : `Showing ${Math.min(visibleWords.length, filteredWords.length)} of ${filteredWords.length} entries (${words.length} total)`}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenImportExport}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Import</span>
                </button>
                <button
                  onClick={() => onOpenWordModal()}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 flex items-center gap-1 shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Entry</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Filter Toolbar */}
          <div className="bg-white rounded-[24px] p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="grid grid-cols-12 gap-2.5">
              <div className="col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search German, English or Myanmar..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-0.5 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="col-span-3">
                <CustomSelect
                  value={selectedType}
                  onChange={setSelectedType}
                  options={TYPE_OPTIONS}
                />
              </div>

              <div className="col-span-4">
                <CustomSelect
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </div>

            {/* CEFR Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Level:
              </span>
              <button
                onClick={() => handleSetLevel('all')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                  selectedLevel === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All
              </button>
              {CEFR_LEVELS_LIST.map((lvl) => {
                const s = LEVEL_STYLES[lvl];
                const active = selectedLevel === lvl.toLowerCase();
                return (
                  <button
                    key={lvl}
                    onClick={() => handleSetLevel(lvl)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold transition-all ${
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
        </div>

        {/* Desktop Vocabulary Rows */}
        <div className="space-y-2">
          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Connecting directly to Cloud Firestore database...
            </div>
          ) : firestoreError ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs text-slate-600 text-xs space-y-2 max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-black text-slate-900">Database Access Denied</h3>
              <p className="text-slate-500 leading-relaxed">
                Cloud Firestore rejected the query: <code className="text-rose-600 font-bold">{firestoreError}</code>.
              </p>
              <p className="text-[11px] text-slate-400">
                Please update your Firebase Console Firestore Security Rules to allow read access.
              </p>
            </div>
          ) : words.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs text-slate-600 text-xs space-y-3 max-w-md mx-auto">
              <Database className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-sm font-black text-slate-900">Cloud Firestore is Empty</h3>
              <p className="text-slate-500 leading-relaxed">
                There are currently 0 documents in your Cloud Firestore <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold">vocabulary</code> collection.
              </p>
              {isAdmin && (
                <button
                  onClick={onOpenImportExport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Vocabulary to Firestore</span>
                </button>
              )}
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No vocabulary matches your search or filters.
            </div>
          ) : (
            visibleWords.map((item) => {
              const lvl = LEVEL_STYLES[item.level] || LEVEL_STYLES.A1;
              const cat = CATEGORIES_META[item.category] || CATEGORIES_META.other;
              const articleStyle = item.article ? ARTICLE_PILL_STYLES[item.article] : '';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[20px] p-3.5 border border-slate-200/80 shadow-2xs flex flex-row items-center justify-between gap-3 hover:shadow-xs transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      {item.type === 'noun' && item.article && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black ${articleStyle}`}
                        >
                          {item.article}
                        </span>
                      )}
                      <span className="text-base font-black text-slate-900">{item.german}</span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        ({item.type})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${lvl.badgeBg} ${lvl.badgeText}`}
                      >
                        {item.level}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.pillClass}`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-slate-600">{item.english}</p>
                      {item.myanmar && (
                        <p className="text-sm font-semibold text-amber-800">
                          ({item.myanmar})
                        </p>
                      )}
                    </div>

                    {(item.exampleGerman || item.plural || item.conjugationSummary) && (
                      <p className="text-[11px] text-slate-400 italic">
                        {item.plural && (
                          <span className="not-italic font-medium text-slate-500 mr-2">
                            Pl: {item.plural} •
                          </span>
                        )}
                        {item.conjugationSummary && (
                          <span className="not-italic font-medium text-slate-500 mr-2">
                            {item.conjugationSummary} •
                          </span>
                        )}
                        {item.exampleGerman && `"${item.exampleGerman}"`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-center shrink-0">
                    <button
                      onClick={() => handleAudioPlay(item.german, item.id)}
                      className={`p-2 rounded-xl transition-all ${
                        audioPlaying === item.id
                          ? 'bg-amber-100 text-amber-800 scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onOpenWordModal(item)}
                          className="p-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Shared Sentinel for Infinite Scroll (Visible to IntersectionObserver on both Mobile & Desktop) */}
      <div ref={sentinelRef} className="h-6" />

      {/* Progress & Loading Status Indicator */}
      {filteredWords.length > 0 && (
        <div className="py-4 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
          {hasMore ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading more words ({visibleWords.length} of {filteredWords.length})...</span>
            </>
          ) : (
            <span className="text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full text-[11px] font-bold">
              All {filteredWords.length} entries loaded
            </span>
          )}
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed right-5 z-30 p-3 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center border border-indigo-400/30 cursor-pointer',
            isAdmin ? 'bottom-32 md:bottom-8' : 'bottom-20 md:bottom-8'
          )}
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default WordBankView;
