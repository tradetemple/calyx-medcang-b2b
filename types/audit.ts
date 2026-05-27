import { z } from 'zod';

export const AuditEventSchema = z.object({
  id: z.uuid(),
  timestamp: z.string(),
  actor: z.string(),    
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
  details: z.string(),   
  status: z.enum(['SUCCESS', 'WARNING', 'FAILURE']),
  hash: z.string(),    
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;
