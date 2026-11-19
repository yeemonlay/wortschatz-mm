import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { GermanArticle } from '@/types';

export const QuizView: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<GermanArticle | null>(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);

  const sampleQuestion = {
    word: 'Tisch',
    plural: 'Tische',
    meaningEnglish: 'table',
    meaningMyanmar: 'စားပွဲ',
    correctArticle: 'der' as GermanArticle,
    explanation: 'Most masculine nouns ending in single syllables or referring to instruments/furniture like "der Tisch" take "der".',
  };

  const handleAnswer = (article: GermanArticle) => {
    setSelectedArticle(article);
    if (article === sampleQuestion.correctArticle) {
      setScore((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setSelectedArticle(null);
    setQuestionCount((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
            Quizzes
          </h1>
          <p className="text-[11px] md:text-sm text-slate-500 mt-0.5">
            Question {questionCount} • Score: {score} • Practice German articles with instant feedback
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-[10px] md:text-xs font-bold shadow-2xs self-start mt-0.5">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>Article Master</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-4">

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-center">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Select the correct gender
          </span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            ___ {sampleQuestion.word}
          </h2>
          <div className="text-xs text-slate-500">
            Plural: {sampleQuestion.plural} • {sampleQuestion.meaningEnglish} ({sampleQuestion.meaningMyanmar})
          </div>
        </div>

        {/* 3-Button selection */}
        <div className="grid grid-cols-3 gap-3">
          {(['der', 'die', 'das'] as GermanArticle[]).map((article) => {
            const isSelected = selectedArticle === article;
            const isCorrect = article === sampleQuestion.correctArticle;

            let buttonStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200';
            if (selectedArticle) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20';
              } else {
                buttonStyle = 'opacity-40 bg-slate-50 text-slate-400 border-slate-200';
              }
            }

            return (
              <button
                key={article}
                disabled={selectedArticle !== null}
                onClick={() => handleAnswer(article)}
                className={`py-4 rounded-2xl text-lg font-black border-2 transition-all uppercase tracking-wide ${buttonStyle}`}
              >
                {article}
              </button>
            );
          })}
        </div>

        {/* Result & Explanation */}
        {selectedArticle && (
          <div className="pt-4 border-t border-slate-100 space-y-3 animate-fadeIn text-left">
            <div className="flex items-center gap-2">
              {selectedArticle === sampleQuestion.correctArticle ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Richtig! (Correct!)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-600 font-black text-sm">
                  <XCircle className="w-5 h-5" />
                  <span>Falsch! It's {sampleQuestion.correctArticle} {sampleQuestion.word}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <span className="font-bold text-slate-800">Grammar tip: </span>
              {sampleQuestion.explanation}
            </p>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Question</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
