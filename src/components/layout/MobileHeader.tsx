import React from 'react';
import { Crown, Download } from 'lucide-react';
import { User } from 'firebase/auth';

interface MobileHeaderProps {
  currentUser: User | null;
  onOpenAdminLogin: () => void;
  onInstallApp?: () => void;
  isInstalled?: boolean;
  canInstall?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  onOpenAdminLogin,
  onInstallApp,
  isInstalled = false,
}) => {
  const isAdmin = !!currentUser;

  return (
    <header className="md:hidden bg-white/90 backdrop-blur-md px-4 sm:px-6 h-[calc(3.75rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] flex items-center justify-between border-b border-slate-200/70 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Wortschatz Logo"
          className="w-8 h-8 rounded-xl object-cover shadow-2xs"
        />
        <div className="flex items-center gap-1.5">
          <span className="font-black text-base text-slate-900">Wortschatz</span>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            MM
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isInstalled && onInstallApp && (
          <button
            onClick={onInstallApp}
            title="Install Wortschatz MM App"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />Install App
            {/* <span className="hidden xs:inline sm:inline">Install</span> */}
          </button>
        )}

        {isAdmin && (
          <button
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all bg-amber-100 text-amber-900 border-amber-300"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
