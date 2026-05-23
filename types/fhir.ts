import { z } from 'zod';

export const FHIRMedicationRequestSchema = z.object({
  resourceType: z.literal('MedicationRequest'),
  id: z.string(),
  status: z.string(),
  subject: z.object({
    display: z.string(),
    id: z.string(),
    last_in_person_consultation: z.string(), // ISO Date string
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
    qes_verified: z.boolean()
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
