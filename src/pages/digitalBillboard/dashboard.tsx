import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { BillboardForm } from '@/components/digital-billboard/BillboardForm';
import { BillboardHeader } from '@/components/digital-billboard/BillboardHeader';
import { BillboardList } from '@/components/digital-billboard/BillboardList';
import { BillboardViewModal } from '@/components/digital-billboard/BillboardViewModal';
import { DashboardLayout } from '@/components/digital-billboard/DashboardLayout';
import { DigitalBillboardSidebar } from '@/components/digital-billboard/DigitalBillboardSidebar';

import { useBillboards } from '@/hooks/useBillboards';
import { MAX_BILLBOARDS } from '@/lib/digital-billboard/constants';
import type { BillboardData } from '@/lib/digital-billboard/types';
import { parseRoles, toFormValues } from '@/lib/digital-billboard/utils';

function DigitalBillboardPage() {
    const router = useRouter();

    const [booting, setBooting] = useState(true);
    const [authId, setAuthId] = useState<string | null>(null);

    const { billboards, loading, error, setError, refresh, createBillboard, updateBillboard } = useBillboards(authId);

    const [view, setView] = useState<'list' | 'form'>('list');
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [activeBillboard, setActiveBillboard] = useState<BillboardData | null>(null);

    const [viewModalBillboard, setViewModalBillboard] = useState<BillboardData | null>(null);

    // ✅ Success modal lives in the PAGE — survives regardless of view state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMode, setSuccessMode] = useState<'create' | 'edit'>('create');

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
        router.push('/login');
    };

    const activeKey = useMemo(() => {
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
            <div className=''>
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
                    <BillboardList billboards={billboards} onCreate={openCreate} onEdit={openEdit} onView={(bb) => setViewModalBillboard(bb)} />
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
                                    router.replace('/login');
                                    return;
                                }
                                await createBillboard(values);
                            } else {
                                if (!activeBillboard?.id) throw new Error('Missing billboard id');
                                await updateBillboard(activeBillboard.id, values);
                            }

                            await refresh();

                            // ✅ Show success modal BEFORE navigating away
                            setSuccessMode(formMode);
                            setShowSuccessModal(true);
                        }}
                    />
                )}
            </div>

            {/* ✅ View modal */}
            <BillboardViewModal
                open={!!viewModalBillboard}
                billboard={viewModalBillboard}
                onClose={() => setViewModalBillboard(null)}
                onEdit={(bb) => {
                    setViewModalBillboard(null);
                    openEdit(bb);
                }}
            />

            {/* ✅ Success modal — lives in the page, never unmounts with the form */}
            {showSuccessModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4'>
                        <div className='flex items-center justify-center w-16 h-16 rounded-full bg-green-100'>
                            <svg className='w-8 h-8 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900'>{successMode === 'create' ? 'Billboard Created!' : 'Billboard Updated!'}</h3>
                        <p className='text-gray-500 text-center text-sm'>
                            {successMode === 'create' ? 'Your billboard has been successfully submitted.' : 'Your billboard has been successfully updated.'}
                        </p>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                backToList();
                            }}
                            className='mt-2 w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200'
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
