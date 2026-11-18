import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { NavigationTab, CEFRLevel, CEFR_LEVELS_LIST, LEVEL_STYLES, VocabularyWord } from '@/types';
import { subscribeToVocabulary } from '@/services/vocabularyService';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab, level?: CEFRLevel) => void;
  words?: VocabularyWord[];
  loading?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  words: propWords,
  loading: propLoading,
}) => {
  const [internalWords, setInternalWords] = useState<VocabularyWord[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  // Auto-subscribe if words not supplied by parent
  useEffect(() => {
    if (propWords) return;
    const unsubscribe = subscribeToVocabulary(
      (loaded) => {
        setInternalWords(loaded);
        setInternalLoading(false);
      },
      (error) => {
        console.error('Dashboard subscription error:', error);
        setInternalLoading(false);
      }
    );
    return () => unsubscribe();
  }, [propWords]);

  const words = propWords || internalWords;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  const getCountForLevel = (lvl: CEFRLevel): number => {
    return words.filter((w) => w.level.toUpperCase() === lvl.toUpperCase()).length;
  };

  const nounCount = words.filter((w) => w.type === 'noun').length;

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-[11px] md:text-sm text-slate-500 mt-0.5">
          Essential words & phrases organized by CEFR level & 16 categories
        </p>
      </div>

      {/* CEFR Cards Grid (Matching Mock UI exactly with live DB counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {CEFR_LEVELS_LIST.map((lvl) => {
          const meta = LEVEL_STYLES[lvl];
          const dbCount = getCountForLevel(lvl);

          // Calculate visual progress bar based on live DB count vs curriculum target
          const targetCount = meta.count || 500;
          const progressPercent = dbCount > 0 ? Math.min(100, Math.max(8, Math.round((dbCount / targetCount) * 100))) : 0;

          return (
            <div
              key={lvl}
              onClick={() => onNavigate('dictionary', lvl)}
              className={`${meta.cardBg} relative overflow-hidden rounded-2xl md:rounded-[28px] p-4 md:p-5 cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md group`}
            >
              {/* Radial background circle */}
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/20 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="inline-block bg-white/90 text-slate-800 text-[10px] md:text-[11px] px-2.5 md:px-3 py-0.5 md:py-1 font-black rounded-full shadow-2xs">
                    {meta.subtitle}
                  </span>
                  <h3 className="text-lg md:text-xl mt-1.5 md:mt-2 font-black text-slate-900">
                    {meta.title}
                  </h3>
                  <p className="text-[11px] md:text-xs font-semibold text-slate-700/90">
                    {loading ? 'Loading...' : `${dbCount} essential words`}
                  </p>
                </div>

                <div className="hidden md:flex w-10 h-10 rounded-2xl bg-white/85 items-center justify-center text-slate-900 shadow-xs group-hover:scale-105 transition shrink-0">
                  <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10 mt-3 md:mt-4 h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: meta.accent,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Frequency Curated Decks (Matching Mock UI exactly) */}
      <div>
        <h2 className="text-base md:text-lg font-black text-slate-900 mb-0.5">
          Frequency & Drill Sets
        </h2>
        <p className="text-[11px] text-slate-500 mb-2.5 md:mb-3.5">
          Learn the most common words and article rules first
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
          {/* Most Frequent */}
          <div
            onClick={() => onNavigate('flashcards')}
            className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-4 md:p-5 bg-gradient-to-br from-[#a855f7] via-[#9333ea] to-[#7e22ce] text-white cursor-pointer shadow-sm hover:shadow-md transition"
          >
            <span className="inline-flex items-center gap-1.5 bg-white text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
              <span>🏆</span> Most Popular
            </span>
            <h3 className="text-base md:text-xl mt-2 md:mt-3 font-black">
              Top 100 Most Frequent
            </h3>
            <p className="text-[11px] text-purple-100 mt-0.5">
              Master everyday conversation essentials first ({words.length} words in DB)
            </p>
          </div>

          {/* Der Die Das Article Drill */}
          <div
            onClick={() => onNavigate('quiz')}
            className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-4 md:p-5 bg-gradient-to-br from-[#fb7185] via-[#f43f5e] to-[#e11d48] text-white cursor-pointer shadow-sm hover:shadow-md transition"
          >
            <span className="inline-flex items-center gap-1.5 bg-white text-rose-900 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
              <span>🎯</span> Der • Die • Das
            </span>
            <h3 className="text-base md:text-xl mt-2 md:mt-3 font-black">
              Article Mastery Drill
            </h3>
            <p className="text-[11px] text-rose-100 mt-0.5">
              Practice noun genders with instant grammar hints ({nounCount} nouns in DB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
