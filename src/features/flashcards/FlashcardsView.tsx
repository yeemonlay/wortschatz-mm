import React, { useState } from 'react';
import { Sparkles, RotateCw, ChevronLeft, ChevronRight, Volume2, Check, X } from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const demoCards = [
    {
      article: 'das',
      german: 'Buch',
      plural: 'Bücher',
      english: 'Book',
      myanmar: 'စာအုပ်',
      level: 'A1',
      example: 'Das Buch ist sehr interessant.',
      type: 'noun',
    },
    {
      article: 'der',
      german: 'Tee',
      plural: 'Tees',
      english: 'Tea',
      myanmar: 'လက်ဖက်ရည်',
      level: 'A1',
      example: 'Ich trinke morgens gerne Tee.',
      type: 'noun',
    },
    {
      german: 'verstehen',
      english: 'to understand',
      myanmar: 'နားလည်သည်',
      level: 'A1',
      example: 'Ich verstehe das nicht ganz.',
      type: 'verb',
    },
  ];

  const currentCard = demoCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % demoCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + demoCards.length) % demoCards.length);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Flashcards</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Spaced Repetition Practice</h1>
        <p className="text-xs text-slate-500">
          Card {currentIndex + 1} of {demoCards.length}
        </p>
      </div>

      {/* Flashcard Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 sm:h-96 cursor-pointer select-none perspective"
      >
        <div
          className={`w-full h-full rounded-3xl bg-white border-2 border-slate-200/90 shadow-xl p-8 flex flex-col justify-between items-center text-center transition-transform duration-300 hover:border-indigo-400/50 ${
            isFlipped ? 'bg-indigo-50/40 border-indigo-200' : ''
          }`}
        >
          {/* Top header of card */}
          <div className="w-full flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-full font-black bg-slate-100 text-slate-700">
              {currentCard.level}
            </span>
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Tap to flip
            </span>
            <span className="capitalize text-slate-500 font-bold">{currentCard.type}</span>
          </div>

          {/* Card Body */}
          <div className="space-y-3">
            {!isFlipped ? (
              <>
                {currentCard.article && (
                  <span className="text-sm font-black text-indigo-600 uppercase tracking-widest block">
                    {currentCard.article}
                  </span>
                )}
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                  {currentCard.german}
                </h2>
                {currentCard.plural && (
                  <p className="text-xs text-slate-400 font-medium">Plural: {currentCard.plural}</p>
                )}
              </>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    English
                  </span>
                  <p className="text-2xl font-black text-slate-900">{currentCard.english}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Myanmar
                  </span>
                  <p className="text-xl font-black text-amber-700">{currentCard.myanmar}</p>
                </div>
                <div className="pt-2 text-xs italic text-slate-600 bg-white/70 p-3 rounded-2xl border border-slate-200/60">
                  "{currentCard.example}"
                </div>
              </div>
            )}
          </div>

          {/* Bottom audio hint */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>Audio available in Phase 6</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNext}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Still Learning</span>
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Got It!</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
