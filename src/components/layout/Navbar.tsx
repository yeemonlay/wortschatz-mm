import React from 'react';
import { Layers, BookOpen, Sparkles, Award, Crown, Lock, Plus, Upload } from 'lucide-react';
import { NavigationTab } from '@/types';
import { cn } from '@/utils/cn';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: User | null;
  onOpenAdminLogin: () => void;
  onOpenWordModal: () => void;
  onOpenImportExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAdminLogin,
  onOpenWordModal,
  onOpenImportExport,
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: Layers },
    { id: 'dictionary' as NavigationTab, label: 'Word Bank', icon: BookOpen },
    { id: 'flashcards' as NavigationTab, label: 'Flashcards', icon: Sparkles },
    { id: 'quiz' as NavigationTab, label: 'Quizzes', icon: Award },
  ];

  const isAdmin = !!currentUser;

  return (
    <header className="hidden md:flex bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-7 py-4 items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSelectTab('dashboard')}
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-xs">
            W
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-tight text-slate-900">Wortschatz</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              DE
            </span>
          </div>
        </div>

        {/* Tab Navigation (Matching Mock UI exactly) */}
        <nav className="flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'desktop-tab-btn inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs transition-all',
                  isActive
                    ? 'font-extrabold bg-slate-900 text-white shadow-2xs'
                    : 'font-bold text-slate-600 hover:bg-slate-100'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop Admin Controls (Matching Mock UI exactly) */}
      <div className="flex items-center gap-2.5">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImportExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import/Export</span>
            </button>
            <button
              onClick={onOpenWordModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Admin</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
