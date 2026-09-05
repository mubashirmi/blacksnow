import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ProfessionalContractEditor = dynamic(() => import('../../components/contracts/ProfessionalContractEditor'), { ssr: false });

export default function ContractEditorPage() {
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedUserId = window.localStorage.getItem('userId');
        if (!storedUserId) {
            // eslint-disable-next-line
            void router.replace('/login');
            return;
        }

        const rawRoles = window.localStorage.getItem('roles');
        let roles: string[] = [];
        if (rawRoles) {
            try {
                const parsed = JSON.parse(rawRoles);
                if (Array.isArray(parsed)) roles = parsed.filter((role): role is string => typeof role === 'string');
                else if (typeof parsed === 'string') roles = [parsed];
            } catch {
                roles = rawRoles
                    .split(',')
                    .map((role) => role.trim())
                    .filter(Boolean);
            }
        }

        if (!roles.includes('InvoiceTool')) {
            // eslint-disable-next-line
            void router.replace('/pricing');
            return;
        }

        setUserId(storedUserId);
        setIsAuthChecked(true);
    }, [router]);

    if (!isAuthChecked || !userId) {
        return <div className='min-h-screen bg-slate-100 p-6 text-sm text-slate-500'>Checking access…</div>;
    }

    return <ProfessionalContractEditor authId={userId} backHref='/invoicecontractdashboard' editorTitle='Professional Contract Studio' />;
}
