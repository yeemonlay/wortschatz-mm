import React from 'react';
import { Navbar } from './Navbar';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import { PWAInstallModal } from '@/components/modals/PWAInstallModal';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { NavigationTab } from '@/types';
import { User } from 'firebase/auth';
import { Plus, Upload } from 'lucide-react';

interface AppShellProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: User | null;
  onOpenAdminLogin: () => void;
  onOpenWordModal: () => void;
  onOpenImportExport: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAdminLogin,
  onOpenWordModal,
  onOpenImportExport,
  children,
}) => {
  const isAdmin = !!currentUser;
  const {
    isInstalled,
    platform,
    browser,
    canInstall,
    blockReason,
    isInstallModalOpen,
    setIsInstallModalOpen,
    triggerInstall,
  } = usePWAInstall();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f8f7f4] text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Desktop Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        currentUser={currentUser}
        onOpenAdminLogin={onOpenAdminLogin}
        onOpenWordModal={onOpenWordModal}
        onOpenImportExport={onOpenImportExport}
        onInstallApp={triggerInstall}
        isInstalled={isInstalled}
        canInstall={canInstall}
      />

      {/* Mobile Top Header */}
      <MobileHeader
        currentUser={currentUser}
        onOpenAdminLogin={onOpenAdminLogin}
        onInstallApp={triggerInstall}
        isInstalled={isInstalled}
        canInstall={canInstall}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 md:pb-12 ${
          isAdmin && currentTab === 'dictionary'
            ? 'pb-32'
            : 'pb-[calc(4.75rem+env(safe-area-inset-bottom,0.5rem))]'
        }`}
      >
        {children}
      </main>

      {/* Mobile Floating Admin Actions (Word Bank screen only) */}
      {isAdmin && currentTab === 'dictionary' && (
        <div
          className="md:hidden fixed inset-x-4 flex items-center gap-2 z-30 max-w-md mx-auto"
          style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom, 0.5rem))' }}
        >
          <button
            onClick={onOpenWordModal}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-indigo-600/95 backdrop-blur-md text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 border border-indigo-400/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Word</span>
          </button>
          <button
            onClick={onOpenImportExport}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import/Export</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Pill Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={onSelectTab} />

      {/* PWA Install Modal — shown for iOS, unsupported, or manual guidance */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        platform={platform}
        browser={browser}
        canInstall={canInstall}
        isInstalled={isInstalled}
        blockReason={blockReason}
        onDirectInstall={triggerInstall}
      />
    </div>
  );
};
