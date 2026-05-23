import TelemedicineClient from './TelemedicineClient';
import { Metadata } from 'next';
import RoleGuard from '@/components/RoleGuard';
import { getHomeData } from '@/app/[lang]/utils/page-data'

export const metadata: Metadata = {
  title: 'Telemedicine Triage | Calyx Systems',
  description: 'Gematik FHIR R4 Regulatory Compliance Engine',
};

export default async function TelemedicinePage({
  params
}: { 
  params: Promise<{ lang: string }>;
}) {
  const lang = (await params).lang;
  const { dict } = await getHomeData(lang);
  const telemedicineDict = dict.telemedicine;

  return (
    <RoleGuard allowedRoles={['verified_pharmacy', 'medical_doctor']} dict={dict.roleGuard}>
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
        <TelemedicineClient dict={telemedicineDict} />
      </div>
    </RoleGuard>
  );
}
