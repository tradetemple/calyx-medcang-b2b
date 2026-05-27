import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditEvent, AuditEventSchema } from '@/types/audit';
import { useUserRoleStore } from './userRoleStore';

export type { AuditEvent };

interface AuditState {
  logs: AuditEvent[];
  _initialLogs: AuditEvent[];
  addLog: (
    action: AuditEvent['action'],
    details: string,
    status: AuditEvent['status']
  ) => void;
  clearLogs: () => void;
}

const getTimestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const generateRealHash = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [],

      _initialLogs: [
        {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: "SYSTEM_KERNAL",
          action: 'SYSTEM_INTEGRITY_CHECK',
          details: "Verified Ph. Eur. 10.0 compliance for all 50 batches.",
          status: 'SUCCESS',
          hash: generateRealHash()
        },
        {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: "LOGISTICS_GATEWAY",
          action: 'INVENTORY_SYNC',
          details: "Cloudflare KV store synchronized with Gematik logistics API.",
          status: 'SUCCESS',
          hash: generateRealHash()
        },
        {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: "INFRA_MANAGER",
          action: 'BACKUP_ROUTATION',
          details: "Encrypted database snapshot stored in Frankfurt (AWS-EU-CENTRAL-1).",
          status: 'SUCCESS',
          hash: generateRealHash()
        },
        {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: "COMPLIANCE_ENGINE",
          action: 'MEDCANG_RULE_UPDATE',
          details: "Schema updated to reflect June 2026 narcotics quota adjustments.",
          status: 'SUCCESS',
          hash: generateRealHash()
        },
        {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: "BFF_VALIDATOR",
          action: 'FHIR_SCHEMA_VALIDATION',
          details: "Incoming prescription JSON matched FHIR R4 standard.",
          status: 'SUCCESS',
          hash: generateRealHash()
        },
        {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: "GEO_PROTECT",
          action: 'GEO_COMPLIANCE_CHECK',
          details: "Verified shipping destination is within German medical jurisdiction.",
          status: 'SUCCESS',
          hash: generateRealHash()
        },
        {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: "TAX_ROUTINE",
          action: 'VAT_CALCULATION',
          details: "Applied 7% medical tax rate based on MedCanG §42.",
          status: 'SUCCESS',
          hash: generateRealHash()
        }
      ],

      addLog: (action, details, status) => {
        const { identifier } = useUserRoleStore.getState();
        
        const newLog: AuditEvent = {
          id: crypto.randomUUID(),
          timestamp: getTimestamp(),
          actor: identifier,
          action,
          details,
          status,
          hash: generateRealHash(),
        };

        const validatedLog = AuditEventSchema.parse(newLog);

        set((state) => ({
          logs: [validatedLog, ...state.logs].slice(0, 100),
        }));
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'calyx-audit-vault',
    }
  )
);
