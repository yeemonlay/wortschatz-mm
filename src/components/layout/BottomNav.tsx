import React from 'react';
import { Layers, BookOpen, Sparkles, Award } from 'lucide-react';
import { NavigationTab } from '@/types';
import { cn } from '@/utils/cn';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: Layers },
    { id: 'dictionary' as NavigationTab, label: 'Word Bank', icon: BookOpen },
    { id: 'flashcards' as NavigationTab, label: 'Cards', icon: Sparkles },
    { id: 'quiz' as NavigationTab, label: 'Quiz', icon: Award },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pt-1">
      <nav className="max-w-md mx-auto mb-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all',
                isActive
                  ? 'text-amber-600 font-extrabold bg-amber-50/70'
                  : 'text-slate-400 font-medium hover:text-slate-700'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="text-[11px] leading-tight tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
