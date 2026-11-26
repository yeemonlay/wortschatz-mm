import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { WordBankView } from '@/features/vocabulary/WordBankView';
import { FlashcardsView } from '@/features/flashcards/FlashcardsView';
import { QuizView } from '@/features/quiz/QuizView';
import { AdminLoginModal } from '@/components/modals/AdminLoginModal';
import { WordFormModal } from '@/components/modals/WordFormModal';
import { ImportExportModal } from '@/components/modals/ImportExportModal';
import { NavigationTab, VocabularyWord, CEFRLevel } from '@/types';
import { subscribeToAuth } from '@/services/authService';
import { subscribeToVocabulary } from '@/services/vocabularyService';
import { User } from 'firebase/auth';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);

  // Modals state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Vocabulary subscription
  useEffect(() => {
    const unsubscribe = subscribeToVocabulary(
      (loaded) => {
        setWords(loaded);
        setWordsLoading(false);
      },
      () => setWordsLoading(false)
    );
    return () => unsubscribe();
  }, []);

  const handleOpenWordModal = (word?: VocabularyWord) => {
    setEditingWord(word || null);
    setIsWordModalOpen(true);
  };

  const handleNavigate = (tab: NavigationTab, level?: CEFRLevel) => {
    if (level) {
      setSelectedLevelFilter(level);
    }
    setCurrentTab(tab);
  };

  // Reset scroll position when switching top-level tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={handleNavigate}
            words={words}
            loading={wordsLoading}
          />
        );
      case 'dictionary':
        return (
          <WordBankView
            isAdmin={!!currentUser}
            onOpenWordModal={handleOpenWordModal}
            onOpenImportExport={() => setIsImportExportOpen(true)}
            selectedLevel={selectedLevelFilter}
            onSelectLevel={setSelectedLevelFilter}
          />
        );
      case 'flashcards':
        return <FlashcardsView words={words} loading={wordsLoading} />;
      case 'quiz':
        return <QuizView words={words} loading={wordsLoading} />;
      default:
        return (
          <DashboardView
            onNavigate={handleNavigate}
            words={words}
            loading={wordsLoading}
          />
        );
    }
  };

  return (
    <>
      <AppShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenWordModal={() => handleOpenWordModal()}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      >
        {renderContent()}
      </AppShell>

      {/* Admin Login Modal (Task 3) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        currentUser={currentUser}
      />

      {/* Add / Edit Vocabulary Form Modal (Task 4) */}
      <WordFormModal
        isOpen={isWordModalOpen}
        onClose={() => {
          setIsWordModalOpen(false);
          setEditingWord(null);
        }}
        editingWord={editingWord}
      />

      {/* In-App Batch Import / Export Modal (Task 5) */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />
    </>
  );
};

export default App;
