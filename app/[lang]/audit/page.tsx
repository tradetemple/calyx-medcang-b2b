import { getHomeData } from '@/app/[lang]/utils/page-data'
import AuditVaultPage from './AuditClient';
import RoleGuard from '@/components/RoleGuard';

export default async function Audit({
  params
}: { 
  params: Promise<{ lang: string }>;
}) {
    const lang = (await params).lang;
    const { dict } = await getHomeData(lang);
    const auditDict = dict.audit;

    return (
        <>
          <RoleGuard allowedRoles={['verified_pharmacy']} dict={dict.roleGuard}>
            <AuditVaultPage dict={auditDict} />
          </RoleGuard>
        </>
    );
}