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
    <header className="md:hidden bg-white/90 backdrop-blur-md px-5 py-3.5 flex items-center justify-between border-b border-slate-200/70 sticky top-0 z-30 pt-safe">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
          W
        </div>
        <span className="font-black text-base text-slate-900">Wortschatz</span>
      </div>

      <button
        onClick={onOpenAdminLogin}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all ${
          isAdmin
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      >
        {isAdmin ? (
          <>
            <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>Admin</span>
          </>
        ) : (
          <>
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Login</span>
          </>
        )}
      </button>
    </header>
  );
};

export default MobileHeader;
