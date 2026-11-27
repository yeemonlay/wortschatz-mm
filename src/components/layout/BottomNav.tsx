import React from 'react';
import { Layers, BookOpen, Sparkles, Award, Heart } from 'lucide-react';
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
    { id: 'flashcards' as NavigationTab, label: 'Flashcard', icon: Sparkles },
    { id: 'quiz' as NavigationTab, label: 'Quiz', icon: Award },
    { id: 'support' as NavigationTab, label: 'Support', icon: Heart },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-1px_3px_rgba(0,0,0,0.03)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all select-none cursor-pointer',
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <div
                className={cn(
                  'w-10 h-7 flex items-center justify-center rounded-full transition-all',
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isActive ? 'stroke-[2.5] scale-105' : 'stroke-[1.8]'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight tracking-tight mt-0.5 transition-all',
                  isActive ? 'font-bold text-indigo-600' : 'font-semibold text-slate-500'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
