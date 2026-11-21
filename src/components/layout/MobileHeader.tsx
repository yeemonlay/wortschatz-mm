import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { User } from 'firebase/auth';

interface MobileHeaderProps {
  currentUser: User | null;
  onOpenAdminLogin: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  onOpenAdminLogin,
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

      <button
        onClick={onOpenAdminLogin}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
          isAdmin
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : 'bg-white text-slate-600 border-slate-200 shadow-2xs hover:bg-slate-50'
        }`}
      >
        {isAdmin ? (
          <>
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Admin</span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin Login</span>
          </>
        )}
      </button>
    </header>
  );
};

export default MobileHeader;
