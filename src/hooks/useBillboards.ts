import type { BillboardData, BillboardFormValues, FetchBillboardsResponse } from '@/lib/digital-billboard/types';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export function useBillboards(authId: string | null) {
    const [billboards, setBillboards] = useState<BillboardData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const refresh = useCallback(async () => {
        if (!authId) return;

        setLoading(true);
        setError('');

        try {
            const res = await axios.get<FetchBillboardsResponse>(`/api/v2/digital-billboard?authId=${authId}`);
            const dataArr = Array.isArray(res.data?.data) ? res.data.data : [];
            setBillboards(dataArr);
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            if (err?.response?.status === 404 || msg === 'Not found') {
                setBillboards([]);
            } else {
                console.error('Error fetching billboards:', err);
                setError('Failed to load your billboards. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [authId]);

    useEffect(() => {
        if (!authId) return;
        // eslint-disable-next-line
        void refresh();
    }, [authId, refresh]);

    const createBillboard = useCallback(
        async (values: BillboardFormValues) => {
            if (!authId) throw new Error('Missing authId');
            await axios.post(`/api/v2/digital-billboard?authId=${authId}`, {
                ...values,
                status: 'NotApproved',
            });
        },
        [authId]
    );

    const updateBillboard = useCallback(
        async (billboardId: number, values: BillboardFormValues) => {
            if (!authId) throw new Error('Missing authId');
            await axios.put(`/api/v2/digital-billboard?authId=${authId}`, {
                ...values,
                status: 'NotApproved',
                billboardId,
            });
        },
        [authId]
    );

    return { billboards, loading, error, setError, refresh, createBillboard, updateBillboard };
}
