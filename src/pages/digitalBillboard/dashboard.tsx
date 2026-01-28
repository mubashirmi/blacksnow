import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState, type ReactElement } from 'react';

import { BillboardForm } from '@/components/digital-billboard/BillboardForm';
import { BillboardHeader } from '@/components/digital-billboard/BillboardHeader';
import { BillboardList } from '@/components/digital-billboard/BillboardList';
import { DashboardLayout } from '@/components/digital-billboard/DashboardLayout';
import { DigitalBillboardSidebar } from '@/components/digital-billboard/DigitalBillboardSidebar';

import { useBillboards } from '@/hooks/useBillboards';
import { MAX_BILLBOARDS } from '@/lib/digital-billboard/constants';
import type { BillboardData } from '@/lib/digital-billboard/types';
import { parseRoles, toFormValues } from '@/lib/digital-billboard/utils';

type NextPageWithLayout<P = {}> = NextPage<P> & {
    getLayout?: (page: ReactElement) => ReactElement;
};

const DigitalBillboardPage: NextPageWithLayout = () => {
    const router = useRouter();

    const [booting, setBooting] = useState(true);
    const [authId, setAuthId] = useState<string | null>(null);

    const { billboards, loading, error, setError, refresh, createBillboard, updateBillboard } = useBillboards(authId);

    const [view, setView] = useState<'list' | 'form'>('list');
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [activeBillboard, setActiveBillboard] = useState<BillboardData | null>(null);

    const canCreateMore = billboards.length < MAX_BILLBOARDS;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const uid = localStorage.getItem('userId');
        if (!uid) {
            router.replace('/login');
            return;
        }

        const roles = parseRoles(localStorage.getItem('roles'));
        if (!roles.includes('DigitalBillboard')) {
            router.replace('/pricing');
            return;
        }

        setAuthId(uid);
        setBooting(false);
    }, [router]);

    const openCreate = () => {
        setFormMode('create');
        setActiveBillboard(null);
        setView('form');
    };

    const openEdit = (bb: BillboardData) => {
        setFormMode('edit');
        setActiveBillboard(bb);
        setView('form');
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userId');
            localStorage.removeItem('roles');
            localStorage.removeItem('referredby');
        }
        router.push('/login');
    };

    const activeKey = useMemo(() => {
        if (view === 'list') return 'list' as const;
        return formMode === 'create' ? ('create' as const) : ('edit' as const);
    }, [view, formMode]);

    // ✅ NORMAL SIDEBAR COMPONENT (NOT A FUNCTION PROP)
    const Sidebar = ({ closeMobile }: { closeMobile: () => void }) => (
        <DigitalBillboardSidebar
            activeKey={activeKey}
            canCreateMore={canCreateMore}
            onShowList={() => {
                setView('list');
                setActiveBillboard(null);
            }}
            onCreate={() => {
                if (!canCreateMore) return;
                openCreate();
            }}
            onLogout={logout}
            closeMobile={closeMobile}
        />
    );

    if (booting || loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
                    <p className='mt-4 text-gray-600'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout Sidebar={Sidebar}>
            <div className='mx-auto'>
                <BillboardHeader
                    view={view}
                    onCreate={openCreate}
                    onBack={() => setView('list')}
                    canCreateMore={canCreateMore}
                    usedCount={billboards.length}
                    maxCount={MAX_BILLBOARDS}
                />

                {error && <div className='mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg p-4'>{error}</div>}

                {view === 'list' ? (
                    <BillboardList billboards={billboards} onCreate={openCreate} onEdit={openEdit} />
                ) : (
                    <BillboardForm
                        mode={formMode}
                        initialValues={formMode === 'edit' && activeBillboard ? toFormValues(activeBillboard) : undefined}
                        usedCount={billboards.length}
                        canCreateMore={canCreateMore}
                        onCancel={() => setView('list')}
                        onSave={async (values) => {
                            setError('');
                            if (!authId) {
                                router.replace('/login');
                                return;
                            }

                            if (formMode === 'create') {
                                await createBillboard(values);
                            } else {
                                if (!activeBillboard?.id) throw new Error('Missing billboard id');
                                await updateBillboard(activeBillboard.id, values);
                            }

                            await refresh();
                            setView('list');
                            setActiveBillboard(null);
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

// ✅ This disables your global CoreLayout ONLY IF your _app.tsx supports getLayout.
// (You still need the _app.tsx change for this to actually work.)
DigitalBillboardPage.getLayout = (page) => page;

export default DigitalBillboardPage;
