'use client';

import { useUserRoleStore } from '@/stores/userRoleStore';
import { useEffect, useState } from 'react';

export function UserRolePill(dict: any) {
  const { userRole, identifier, isLoaded } = useUserRoleStore();
  const [mounted, setMounted] = useState(false);
  const t = dict.dict

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return null;

  if (userRole === 'guest') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 border border-rose-500/30 bg-rose-500/5 text-rose-500 rounded-none text-[8px] md:text-[10px] font-mono font-bold tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        {t.unauthorised}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 rounded-none text-[8px] md:text-[10px] font-mono font-bold tracking-widest transition-all hover:bg-emerald-500/10">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {t.identified} {identifier}
    </div>
  );
}
