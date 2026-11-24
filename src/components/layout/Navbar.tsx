import React from 'react';
import { Layers, BookOpen, Sparkles, Award, Crown, Lock, Plus, Upload, Download } from 'lucide-react';
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
  onInstallApp?: () => void;
  isInstalled?: boolean;
  canInstall?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAdminLogin,
  onOpenWordModal,
  onOpenImportExport,
  onInstallApp,
  isInstalled = false,
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: Layers },
    { id: 'dictionary' as NavigationTab, label: 'Word Bank', icon: BookOpen },
    { id: 'flashcards' as NavigationTab, label: 'Flashcards', icon: Sparkles },
    { id: 'quiz' as NavigationTab, label: 'Quizzes', icon: Award },
  ];

  const isAdmin = !!currentUser;

  return (
    <header className="hidden md:flex bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onSelectTab('dashboard')}
          >
            <img
              src="/logo.png"
              alt="Wortschatz Logo"
              className="w-9 h-9 rounded-2xl object-cover shadow-2xs"
            />
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-900">Wortschatz</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                MM
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    'desktop-tab-btn inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs transition-all cursor-pointer',
                    isActive
                      ? 'font-extrabold bg-indigo-600 text-white shadow-2xs'
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

        {/* Desktop Controls */}
        <div className="flex items-center gap-2.5">
          {!isInstalled && onInstallApp && (
            <button
              onClick={onInstallApp}
              title="Install Wortschatz MM App"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition shadow-2xs group border-indigo-200/90 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>Install App</span>
            </button>
          )}

          {isAdmin ? (
            <div className="flex items-center gap-2">
              {currentTab === 'dictionary' && (
                <>
                  <button
                    onClick={onOpenImportExport}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Import/Export</span>
                  </button>
                  <button
                    onClick={onOpenWordModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Word</span>
                  </button>
                </>
              )}
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
      </div>
    </header>
  );
};

export default Navbar;
