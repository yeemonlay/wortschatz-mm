import React from 'react';
import { Heart, Coffee, MessageCircle, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

export const SupportView: React.FC = () => {
  return (
    <div className="space-y-5 md:space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
          Support
        </h1>
        <p className="text-[11px] md:text-sm text-slate-500 mt-0.5">
          Keep Wortschatz MM free, growing, and helpful for every learner
        </p>
      </div>

      {/* Forever Free Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-amber-50/70 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Heart className="w-6 h-6 fill-white/20" />
          </div>
          <div className="space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Free, Forever</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Forever free for everyone learning German
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Wortschatz MM is built with care for Myanmar learners studying German from A1 to C2.
              All vocabulary, flashcards, audio, and quizzes will always remain completely free—with
              no ads and no paywalls.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[11px] font-bold text-slate-700">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                No Ads
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[11px] font-bold text-slate-700">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                No Paywalls
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[11px] font-bold text-slate-700">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Community Supported
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buy Me a Coffee Card */}
        <section className="rounded-3xl border border-amber-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200/80">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Support Me on Buy Me a Coffee
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Your coffee helps cover hosting costs, add more curated German–Myanmar words, and
                build better study features for the community.
              </p>
            </div>
          </div>

          <a
            href="https://buymeacoffee.com/epicpixellab"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-extrabold transition shadow-xs"
          >
            <Coffee className="w-4 h-4" />
            <span>Buy Me a Coffee</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75" />
          </a>
        </section>

        {/* Telegram Support Card */}
        <section className="rounded-3xl border border-sky-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200/80">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Need Help or Have Feedback?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Spotted a typo, missing a word, or have a feature idea? Message our Telegram support
                bot anytime and we&apos;ll be happy to help.
              </p>
            </div>
          </div>

          <a
            href="https://t.me/wortschatz_mm_support_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-extrabold transition shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open Telegram Support</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </section>
      </div>
    </div>
  );
};

export default SupportView;
