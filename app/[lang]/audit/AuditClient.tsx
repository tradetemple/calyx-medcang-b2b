'use client';

import { useAuditStore, AuditEvent } from '@/stores/useAuditStore';
import { ShieldCheck, Database, Terminal as TerminalIcon } from 'lucide-react';

const AuditRow = ({ event }: { event: AuditEvent }) => {
  const statusColor: Record<string, string> = {
    SUCCESS: 'text-emerald-400',
    WARNING: 'text-amber-400',
    FAILURE: 'text-rose-400',
  };

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors font-mono text-[11px]">
      <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
        [{new Date(event.timestamp).toLocaleTimeString()}]
      </td>
      <td className="py-2 px-3">
        <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-none border border-emerald-500/20 font-bold text-[9px] tracking-tighter">
          {event.actor}
        </span>
      </td>
      <td className="py-2 px-3 text-blue-400 font-bold uppercase tracking-tighter">
        {event.action}
      </td>
      <td className={`py-2 px-3 font-bold ${statusColor[event.status] || 'text-slate-400'}`}>
        {event.status}
      </td>
      <td className="py-2 px-3 text-slate-100 max-w-md">
        <span className="truncate block" title={event.details}>
          {event.details}
        </span>
      </td>
      <td className="py-2 px-3 text-slate-600 text-[10px]">
        {event.hash.slice(0, 12)}...
      </td>
    </tr>
  );
};

interface AuditVaultProps {
  dict: any;
}

export default function AuditVaultPage(dict: AuditVaultProps) {
  const { logs, clearLogs, _initialLogs } = useAuditStore();
  const t = dict.dict

  const displayLogs = logs.length > 0 ? logs : (_initialLogs || []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono p-4 md:p-8 selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-emerald-500 text-xs font-bold tracking-[0.2em] uppercase">
              <div className='inline-flex gap-2'>
                <ShieldCheck className="w-4 h-4" />
                <span>{t.header.title}</span>
              </div>
              <div className='inline-flex items-center gap-1.5'>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
                <span className="text-[10px] text-emerald-500 md:ml-1">{t.header.live}</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tighter uppercase flex items-center gap-3 py-3">
              <Database className="w-7 h-7 text-slate-300" />
              {t.header.logsTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">{t.header.nodeIdentity}</div>
              <div className="text-xs text-slate-100 font-bold">{t.header.mockId}</div>
            </div>
            <button 
              onClick={clearLogs}
              className="px-3 py-1 border border-slate-700 text-slate-300 text-[10px] uppercase font-bold hover:bg-slate-800 hover:text-slate-100 transition-colors"
            >
              {t.header.flushLogs}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-sm overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{t.terminal.title}</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/50 text-slate-300 text-[10px] uppercase tracking-widest font-bold border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-3 px-3 w-[120px]">{t.terminal.timestamp}</th>
                  <th className="py-3 px-3 w-[150px]">{t.terminal.actorId}</th>
                  <th className="py-3 px-3 w-[150px]">{t.terminal.action}</th>
                  <th className="py-3 px-3 w-[100px]">{t.terminal.status}</th>
                  <th className="py-3 px-3">{t.terminal.details}</th>
                  <th className="py-3 px-3 w-[150px]">{t.terminal.hashKey}</th>
                </tr>
              </thead>
              <tbody>
                {displayLogs.length > 0 ? (
                  displayLogs.map((event: AuditEvent) => (
                    <AuditRow key={event.id} event={event} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-600 italic animate-pulse">
                      {t.terminal.awaitingLogs}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 text-[9px] text-slate-400 uppercase tracking-widest font-bold pt-4">
          <div className="flex gap-4">
            <span>{t.footer.securityProtocol}</span>
            <span>{t.footer.immutability}</span>
          </div>
          <div>
            {t.footer.copyright}
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50" style={{ backgroundSize: '100% 2px, 3px 100%' }} />
    </div>
  );
}
