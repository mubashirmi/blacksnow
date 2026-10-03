import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { BillboardForm } from '@/components/digital-billboard/BillboardForm';
import { BillboardHeader } from '@/components/digital-billboard/BillboardHeader';
import { BillboardList } from '@/components/digital-billboard/BillboardList';
import { BillboardViewModal } from '@/components/digital-billboard/BillboardViewModal';
import { DashboardLayout } from '@/components/digital-billboard/DashboardLayout';
import { DigitalBillboardBilling } from '@/components/digital-billboard/DigitalBillboardBilling';
import { DigitalBillboardSidebar } from '@/components/digital-billboard/DigitalBillboardSidebar';

import { useBillboards } from '@/hooks/useBillboards';
import { MAX_BILLBOARDS } from '@/lib/digital-billboard/constants';
import type { BillboardData } from '@/lib/digital-billboard/types';
import { parseRoles, toFormValues } from '@/lib/digital-billboard/utils';

type DashboardView = 'list' | 'form' | 'billing';
type BillboardFormMode = 'create' | 'edit';

function DigitalBillboardPage() {
    const router = useRouter();

    const [booting, setBooting] = useState(true);
    const [authId, setAuthId] = useState<string | null>(null);

    const { billboards, loading, error, setError, refresh, createBillboard, updateBillboard } = useBillboards(authId);

    const [view, setView] = useState<DashboardView>('list');
    const [formMode, setFormMode] = useState<BillboardFormMode>('create');
    const [activeBillboard, setActiveBillboard] = useState<BillboardData | null>(null);

    const [viewModalBillboard, setViewModalBillboard] = useState<BillboardData | null>(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMode, setSuccessMode] = useState<BillboardFormMode>('create');

    const canCreateMore = billboards.length < MAX_BILLBOARDS;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const uid = localStorage.getItem('userId');

        if (!uid) {
            // eslint-disable-next-line
            void router.replace('/login');
            return;
        }

        const roles = parseRoles(localStorage.getItem('roles'));

        if (!roles.includes('DigitalBillboard')) {
            // eslint-disable-next-line
            void router.replace('/pricing');
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

    const openEdit = (billboard: BillboardData) => {
        setFormMode('edit');
        setActiveBillboard(billboard);
        setView('form');
    };

    const openBilling = () => {
        setActiveBillboard(null);
        setViewModalBillboard(null);
        setView('billing');
    };

    const backToList = () => {
        setView('list');
        setActiveBillboard(null);
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userId');
            localStorage.removeItem('roles');
            localStorage.removeItem('referredby');
        }
        // eslint-disable-next-line
        void router.push('/login');
    };

    const activeKey = useMemo(() => {
        if (view === 'billing') return 'billing' as const;
        if (view === 'list') return 'list' as const;

        return formMode === 'create' ? ('create' as const) : ('edit' as const);
    }, [view, formMode]);

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
            onBilling={openBilling}
            onLogout={logout}
            closeMobile={closeMobile}
        />
    );

    if (booting || loading) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600' />
                    <p className='mt-4 text-gray-600'>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout Sidebar={Sidebar}>
            <div>
                {view !== 'billing' && (
                    <BillboardHeader
                        view={view}
                        onCreate={openCreate}
                        onBack={backToList}
                        canCreateMore={canCreateMore}
                        usedCount={billboards.length}
                        maxCount={MAX_BILLBOARDS}
                    />
                )}

                {error && view !== 'billing' && <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700'>{error}</div>}

                {view === 'billing' ? (
                    authId ? (
                        <DigitalBillboardBilling authId={authId} />
                    ) : null
                ) : view === 'list' ? (
                    <BillboardList billboards={billboards} onCreate={openCreate} onEdit={openEdit} onView={(billboard) => setViewModalBillboard(billboard)} />
                ) : (
                    <BillboardForm
                        mode={formMode}
                        initialValues={formMode === 'edit' && activeBillboard ? toFormValues(activeBillboard) : undefined}
                        usedCount={billboards.length}
                        canCreateMore={canCreateMore}
                        onCancel={backToList}
                        onSave={async (values) => {
                            setError('');

                            if (formMode === 'create') {
                                if (!authId) {
                                    // eslint-disable-next-line
                                    void router.replace('/login');
                                    return;
                                }

                                await createBillboard(values);
                            } else {
                                if (!activeBillboard?.id) {
                                    throw new Error('Missing billboard id');
                                }

                                await updateBillboard(activeBillboard.id, values);
                            }

                            await refresh();

                            setSuccessMode(formMode);
                            setShowSuccessModal(true);
                        }}
                    />
                )}
            </div>

            <BillboardViewModal
                open={!!viewModalBillboard}
                billboard={viewModalBillboard}
                onClose={() => setViewModalBillboard(null)}
                onEdit={(billboard) => {
                    setViewModalBillboard(null);
                    openEdit(billboard);
                }}
            />

            {showSuccessModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl'>
                        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                            <svg className='h-8 w-8 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                            </svg>
                        </div>

                        <h3 className='text-xl font-bold text-gray-900'>{successMode === 'create' ? 'Billboard Created!' : 'Billboard Updated!'}</h3>

                        <p className='text-center text-sm text-gray-500'>
                            {successMode === 'create' ? 'Your billboard has been successfully submitted.' : 'Your billboard has been successfully updated.'}
                        </p>
                        <button
                            type='button'
                            onClick={() => {
                                setShowSuccessModal(false);
                                backToList();
                            }}
                            className='mt-2 w-full rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-green-600'
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

DigitalBillboardPage.getLayout = (page) => page;

export default DigitalBillboardPage;
