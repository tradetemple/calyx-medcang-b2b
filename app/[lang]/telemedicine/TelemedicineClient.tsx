'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileJson, 
  Activity, 
  User, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Play
} from 'lucide-react';
import { useAuditStore } from '@/stores/useAuditStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FHIRMedicationRequest, 
  FHIRMedicationRequestSchema, 
  ComplianceResult 
} from '@/types/fhir';

const VALID_PAYLOAD = {
  "resourceType": "MedicationRequest",
  "id": "e-rezept-7721-abc",
  "status": "active",
  "subject": {
    "display": "Max Mustermann",
    "id": "PAT-9921",
    "last_in_person_consultation": "2026-03-15"
  },
  "medicationCodeableConcept": {
    "coding": [{ "display": "IUVO ICC 30/1" }]
  },
  "dispenseRequest": {
    "quantity": { "value": 50, "unit": "g" }
  },
  "requester": {
    "display": "Dr. Elena Schmidt",
    "qes_verified": true
  }
};

const INVALID_PAYLOAD = {
  "resourceType": "MedicationRequest",
  "id": "e-rezept-7721-abc",
  "status": "active",
  "subject": {
    "display": "Max Mustermann",
    "id": "PAT-9921",
    "last_in_person_consultation": "2025-01-10"
  },
  "medicationCodeableConcept": {
    "coding": [{ "display": "IUVO ICC 30/1" }]
  },
  "dispenseRequest": {
    "quantity": { "value": 50, "unit": "g" }
  },
  "requester": {
    "display": "Dr. Elena Schmidt",
    "qes_verified": false 
  }
};

interface telemedicineProps {
  dict: any;
}

export default function TelemedicineClient(dict: telemedicineProps) {
  const { addLog } = useAuditStore();
  const [jsonInput, setJsonInput] = useState(JSON.stringify(VALID_PAYLOAD, null, 2));
  const [triageResult, setTriageResult] = useState<{
    data: FHIRMedicationRequest | null;
    compliance: ComplianceResult | null;
  }>({ data: null, compliance: null });

  const t = dict.dict

  const checklistDict = {
    fail: t.rightColumn.checklistFail,
    pass: t.rightColumn.checklistPass
  }

  const handleTriage = () => {
    let parsedData: any = null;
    let compliance: ComplianceResult = {
      fhirValid: false,
      qesVerified: false,
      consultationValid: false,
      allPassed: false,
      errors: []
    };

    try {
      const raw = JSON.parse(jsonInput);
      const validation = FHIRMedicationRequestSchema.safeParse(raw);
      
      if (validation.success) {
        compliance.fhirValid = true;
        parsedData = validation.data;

        const today = new Date('2026-05-22');
        const lastConsultation = new Date(parsedData.subject.last_in_person_consultation);
        const diffTime = Math.abs(today.getTime() - lastConsultation.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        compliance.consultationValid = diffDays <= 365;
        compliance.qesVerified = parsedData.requester.qes_verified;
        
        compliance.allPassed = compliance.fhirValid && compliance.qesVerified && compliance.consultationValid;

        if (compliance.allPassed) {
          addLog(
            t.handleTriage.fhirValidation, 
            t.handleTriage.allPassed.replace('{parsedData.id}', parsedData.id).replace('{parsedData.subject.id}', parsedData.subject.id).replace('{parsedData.dispenseRequest.quantity.value}', parsedData.dispenseRequest.quantity.value.toString()), 
            t.handleTriage.success
          );
        } else {
          addLog(
            t.handleTriage.fhirValidation, 
            t.handleTriage.notPassed.replace('{parsedData.subject.id}', parsedData.subject.id),
            t.handleTriage.failure
          );
        }
      } else {
        compliance.errors = validation.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
        addLog(t.handleTriage.fhirValidation, t.handleTriage.payloadFailed, t.handleTriage.failure);
      }
    } catch (e) {
      compliance.errors = [t.handleTriage.invalidJson];
      addLog(t.handleTriage.fhirValidation, t.handleTriage.parseFailed, t.handleTriage.failure);
    }

    setTriageResult({ data: parsedData, compliance });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            {t.title}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">{t.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Ingestion Terminal */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              {t.leftColumn.title}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setJsonInput(JSON.stringify(VALID_PAYLOAD, null, 2))}
                className="text-xs h-8"
              >
                {t.leftColumn.loadValid}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setJsonInput(JSON.stringify(INVALID_PAYLOAD, null, 2))}
                className="text-xs h-8"
              >
                {t.leftColumn.loadInvalid}
              </Button>
            </div>
          </div>

          <div className="relative group">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              spellCheck={false}
              aria-label={t.leftColumn.jsonTerminal}
              className="w-full h-[500px] bg-slate-900 text-emerald-400 font-mono text-sm p-6 rounded-lg border border-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none shadow-inner transition-all"
            />
            <div className="absolute top-4 right-4 text-slate-300 text-[10px] font-mono uppercase">
              {t.leftColumn.jsonTerminal}
            </div>
          </div>

          <Button 
            onClick={handleTriage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-current" />
            {t.leftColumn.execute}
          </Button>
        </div>

        {/* Right Column: Clinical Dashboard */}
        <div className="flex flex-col space-y-6">
          {triageResult.compliance ? (
            <>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">{t.rightColumn.title}</h3>
                </div>
                
                <div className="p-6 space-y-8">
                  {/* Patient & Prescription Info */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.rightColumn.identityTitle}</span>
                      </div>
                      {triageResult.data ? (
                        <div>
                          <p className="text-lg font-bold text-slate-900 leading-tight">{triageResult.data.subject.display}</p>
                          <p className="text-sm font-mono text-slate-500">{triageResult.data.subject.id}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 italic">{t.rightColumn.noData}</p>
                      )}
                    </div>
                    <div className="space-y-3 border-l border-slate-100 pl-8">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.rightColumn.prescriptionTitle}</span>
                      </div>
                      {triageResult.data ? (
                        <div>
                          <p className="text-lg font-bold text-slate-900 leading-tight">
                            {triageResult.data.medicationCodeableConcept.coding[0]?.display}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t.rightColumn.quantity} <span className="font-semibold text-slate-900">{triageResult.data.dispenseRequest.quantity.value}{triageResult.data.dispenseRequest.quantity.unit}</span>
                          </p>
                          <p className="text-xs text-slate-600 mt-1">{t.rightColumn.ref} {triageResult.data.requester.display}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 italic">{t.rightColumn.noData}</p>
                      )}
                    </div>
                  </div>

                  {/* Compliance Checklist */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{t.rightColumn.complianceTitle}</h4>
                    <div className="space-y-3">
                      <ChecklistRow 
                        label={t.rightColumn.fhirValidation} 
                        passed={triageResult.compliance.fhirValid} 
                        dict={checklistDict}
                      />
                      <ChecklistRow 
                        label={t.rightColumn.qesSignature} 
                        passed={triageResult.compliance.qesVerified} 
                        dict={checklistDict}
                      />
                      <ChecklistRow 
                        label={t.rightColumn.consultationCheck}
                        passed={triageResult.compliance.consultationValid} 
                        detail={triageResult.data ? `${t.rightColumn.lastSeen} ${triageResult.data.subject.last_in_person_consultation}` : undefined}
                        dict={checklistDict}
                      />
                    </div>
                  </div>

                  {/* Final Triage Decision */}
                  <div className="pt-4">
                    {triageResult.compliance.allPassed ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                          <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div>
                          <h5 className="text-emerald-900 font-black tracking-tight text-xl uppercase">{t.rightColumn.triageApprovedTitle}</h5>
                          <p className="text-emerald-700 text-sm font-medium">{t.rightColumn.triageApprovedSubtitle}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                          <XCircle className="h-7 w-7" />
                        </div>
                        <div>
                          <h5 className="text-red-900 font-black tracking-tight text-xl uppercase">{t.rightColumn.triageRejectedTitle}</h5>
                          <p className="text-red-700 text-sm font-medium">{t.rightColumn.triageRejectedSubtitle}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!triageResult.compliance.fhirValid && triageResult.compliance.errors.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] text-red-400 border border-red-900/50">
                  <p className="text-white mb-2 uppercase font-bold tracking-widest text-[10px]">{t.rightColumn.errorTrace}</p>
                  {triageResult.compliance.errors.map((err, i) => (
                    <p key={i}> {err}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white/50 p-12 text-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Activity className="h-12 w-12" />
              </div>
              <p className="font-semibold text-slate-600">{t.rightColumn.awaitingInjestion}</p>
              <p className="text-sm max-w-[240px] mt-1">{t.rightColumn.instructUser}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ChecklistRow({ label, passed, detail, dict }: { label: string, passed: boolean, detail?: string, dict: Record<string, string> }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-colors",
      passed ? "bg-emerald-50/30 border-emerald-100" : "bg-red-50/30 border-red-100"
    )}>
      <div className="flex items-center gap-3">
        {passed ? (
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
        )}
        <div>
          <p className={cn("text-sm font-bold", passed ? "text-slate-800" : "text-red-900")}>{label}</p>
          {detail && <p className="text-[10px] text-slate-600 font-mono mt-0.5">{detail}</p>}
        </div>
      </div>
      <div className={cn(
        "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
        passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      )}>
        {passed ? dict.pass : dict.fail}
      </div>
    </div>
  );
}
