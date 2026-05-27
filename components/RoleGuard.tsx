'use client';

import { useState } from 'react';
import { useUserRoleStore, UserRole } from '@/stores/userRoleStore';
import { useAuditStore } from '@/stores/useAuditStore';
import RLSError from './terminal/RLSError';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  dict: any;
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  dict
}: RoleGuardProps) {
  const { userRole, setUserRole, isLoaded } = useUserRoleStore();
  const addLog = useAuditStore((state) => state.addLog);
  const [showRoleSimulator, setShowRoleSimulator] = useState(false);
  const t = dict;

  const hasAccess = allowedRoles.includes(userRole);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setShowRoleSimulator(false);
    
    const { identifier } = useUserRoleStore.getState();
    addLog(t.roleChange.authEst, t.roleChange.details.replace('{identifier}', identifier).replace('{role}', role), t.roleChange.success);
  };

  const simulatorUI = (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <button
        onClick={() => setShowRoleSimulator(!showRoleSimulator)}
        className="bg-slate-100 border border-slate-700 text-slate-900 px-3 py-2 rounded-lg text-xs font-mono transition-all shadow-2xl flex items-center gap-2"
        title="Role Simulator (CTO Demo Mode)"
      >
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        {t.simulator.uiTitle}
      </button>
      {showRoleSimulator && (
        <div className="absolute bottom-12 right-0 bg-slate-950 border border-slate-700 rounded-none p-4 shadow-2xl w-64 backdrop-blur-xl">
          <h3 className="text-slate-400 font-bold mb-3 text-[10px] uppercase tracking-widest border-b border-slate-800 pb-2">{t.simulator.prompt}</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleRoleChange('guest')}
              className={`w-full text-left px-3 py-2 rounded-none text-[10px] uppercase font-bold transition-colors border ${
                userRole === 'guest' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.simulator.guestUnauthorized}
            </button>
            <button
              onClick={() => handleRoleChange('verified_pharmacy')}
              className={`w-full text-left px-3 py-2 rounded-none text-[10px] uppercase font-bold transition-colors border ${
                userRole === 'verified_pharmacy' ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-emerald-400'
              }`}
            >
              {t.simulator.verifiedPharmacy}
            </button>
            <button
              onClick={() => handleRoleChange('medical_doctor')}
              className={`w-full text-left px-3 py-2 rounded-none text-[10px] uppercase font-bold transition-colors border ${
                userRole === 'medical_doctor' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-blue-400'
              }`}
            >
              {t.simulator.medicalDoctor}
            </button>
          </div>
          <p className="mt-3 text-[9px] text-slate-600 text-center uppercase tracking-tighter">
            {t.simulator.subtitle}
          </p>
        </div>
      )}
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-emerald-500 font-mono text-sm tracking-widest uppercase">
          {t.loading}
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    let errorTitle = t.rlsDenied.title;
    let errorMessage = t.rlsDenied.message;

    if (userRole === 'medical_doctor' && allowedRoles.includes('verified_pharmacy')) {
      errorTitle = t.rlsDenied.conflictTitle;
      errorMessage = t.rlsDenied.conflictMessage;
    }

    return (
      <>
        <RLSError 
          title={errorTitle} 
          message={errorMessage} 
          requiredRole={allowedRoles.join(' | ')}
          policyName={userRole === 'medical_doctor' ? t.rlsError.policyName : undefined}
          dict={dict.rlsError}
        />
        {simulatorUI}
      </>
    );
  }

  return (
    <>
      {children}
      {simulatorUI}
    </>
  );
}
