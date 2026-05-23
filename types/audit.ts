import { z } from 'zod';

export const AuditEventSchema = z.object({
  id: z.uuid(),
  timestamp: z.string(), // ISO String
  actor: z.string(),     // e.g., "Pharmacy-DE-8372"
  action: z.enum([
    'AUTH_LOGIN',
    'PROCUREMENT_ADD',
    'QUOTA_EXCEEDED',
    'QUOTA_THRESHOLD_WARNING',
    'COA_ACCESS',
    'PRESCRIPTION_VALIDATED',
    'SYSTEM_INTEGRITY_CHECK',
    'INVENTORY_SYNC',
    'BACKUP_ROUTATION',
    'MEDCANG_RULE_UPDATE',
    'FHIR_SCHEMA_VALIDATION',
    'GEO_COMPLIANCE_CHECK',
    'VAT_CALCULATION',
    'CHECKOUT_INITIATED',
    'ORDER_CREATED',
    'AUTH_SESSION_ESTABLISHED'
  ]),
  details: z.string(),   // e.g., "Added 500g of IUVO ICC 30/1"
  status: z.enum(['SUCCESS', 'WARNING', 'FAILURE']),
  hash: z.string(),      // A mock SHA-256 hash to simulate immutability
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;
