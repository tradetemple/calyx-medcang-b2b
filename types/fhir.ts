import { z } from 'zod';

const FHIRExtensionSchema = z.object({
  url: z.string(),
  valueDate: z.string().optional(),
  valueBoolean: z.boolean().optional()
});

export const FHIRMedicationRequestSchema = z.object({
  resourceType: z.literal('MedicationRequest'),
  id: z.string(),
  status: z.string(),
  subject: z.object({
    reference: z.string(),
    display: z.string(),
    extension: z.array(FHIRExtensionSchema).optional(),
  }),
  medicationCodeableConcept: z.object({
    coding: z.array(z.object({
      display: z.string()
    }))
  }),
  dispenseRequest: z.object({
    quantity: z.object({
      value: z.number(),
      unit: z.string()
    })
  }),
  requester: z.object({
    display: z.string(),
    extension: z.array(FHIRExtensionSchema).optional(),
  })
});

export const ComplianceResultSchema = z.object({
  fhirValid: z.boolean(),
  qesVerified: z.boolean(),
  consultationValid: z.boolean(),
  allPassed: z.boolean(),
  errors: z.array(z.string()),
});

export type FHIRMedicationRequest = z.infer<typeof FHIRMedicationRequestSchema>;
export type ComplianceResult = z.infer<typeof ComplianceResultSchema>;
