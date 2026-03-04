// src/pages/change-opt-setting/index.tsx
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

export default function ChangeOptSettingPage() {
    const router = useRouter();

    const token = useMemo(() => {
        const t = router.query.token;
        return Array.isArray(t) ? t[0] : t;
    }, [router.query.token]);

    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [message, setMessage] = useState('Preparing...');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!router.isReady) return;

        if (!token || typeof token !== 'string') {
            setStatus('error');
            setMessage('Missing token.');
            return;
        }

        (async () => {
            try {
                setStatus('loading');
                setMessage('Updating your preference...');

                const r = await fetch('/api/v2/change-opt-setting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await r.json().catch(() => ({}));

                if (!r.ok) {
                    setStatus('error');
                    setMessage(data?.message ?? 'Failed to update.');
                    return;
                }

                setStatus('done');
                setEmail(data?.user?.email ?? '');
                setMessage('Your email preference has been updated successfully.');
            } catch (e: any) {
                setStatus('error');
                setMessage(e?.message ?? 'Something went wrong.');
            }
        })();
    }, [router.isReady, token]);

    const badge = (() => {
        const base: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.2,
            border: '1px solid',
            userSelect: 'none',
        };

        if (status === 'loading') {
            return { ...base, color: '#1d4ed8', background: '#eff6ff', borderColor: '#bfdbfe' };
        }
        if (status === 'done') {
            return { ...base, color: '#166534', background: '#f0fdf4', borderColor: '#bbf7d0' };
        }
        if (status === 'error') {
            return { ...base, color: '#991b1b', background: '#fef2f2', borderColor: '#fecaca' };
        }
        return { ...base, color: '#374151', background: '#f9fafb', borderColor: '#e5e7eb' };
    })();

    const badgeLabel = status === 'loading' ? 'Updating' : status === 'done' ? 'Updated' : status === 'error' ? 'Error' : 'Ready';

    return (
        <div
            style={{
                minHeight: '100vh',
                background:
                    'radial-gradient(1200px 500px at 20% 0%, #eef2ff 0%, rgba(238,242,255,0) 60%), radial-gradient(900px 400px at 90% 20%, #ecfeff 0%, rgba(236,254,255,0) 55%), #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
            }}
        >
            <div style={{ width: '100%', maxWidth: 560 }}>
                <div
                    style={{
                        marginBottom: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Preference Center</div>
                        <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.2, color: '#111827' }}>Email Preference</h1>
                    </div>

                    <span style={badge}>
                        {status === 'loading' ? (
                            <span
                                aria-hidden
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 999,
                                    border: '2px solid #93c5fd',
                                    borderTopColor: '#2563eb',
                                    display: 'inline-block',
                                    animation: 'spin 0.8s linear infinite',
                                }}
                            />
                        ) : (
                            <span
                                aria-hidden
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 999,
                                    background: status === 'done' ? '#22c55e' : status === 'error' ? '#ef4444' : '#9ca3af',
                                    display: 'inline-block',
                                }}
                            />
                        )}
                        {badgeLabel}
                    </span>
                </div>

                <div
                    style={{
                        background: '#ffffff',
                        border: '1px solid rgba(17,24,39,0.08)',
                        borderRadius: 16,
                        boxShadow: '0 10px 30px rgba(17,24,39,0.08)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ padding: 18 }}>
                        <p style={{ margin: 0, color: '#374151', fontSize: 14, lineHeight: 1.6 }}>{message}</p>

                        {status === 'done' && email ? (
                            <div
                                style={{
                                    marginTop: 14,
                                    padding: 12,
                                    borderRadius: 12,
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    color: '#166534',
                                    fontSize: 14,
                                }}
                            >
                                Updated for: <b style={{ color: '#14532d' }}>{email}</b>
                            </div>
                        ) : null}

                        {status === 'error' ? (
                            <div
                                style={{
                                    marginTop: 14,
                                    padding: 12,
                                    borderRadius: 12,
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#991b1b',
                                    fontSize: 14,
                                }}
                            >
                                Please try again or contact support.
                            </div>
                        ) : null}
                    </div>

                    <div
                        style={{
                            padding: 14,
                            borderTop: '1px solid rgba(17,24,39,0.08)',
                            background: 'linear-gradient(to bottom, rgba(249,250,251,0.7), #f9fafb)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 10,
                        }}
                    >
                        <button
                            type='button'
                            onClick={() => router.push('/')}
                            style={{
                                appearance: 'none',
                                border: '1px solid rgba(17,24,39,0.12)',
                                background: '#ffffff',
                                borderRadius: 12,
                                padding: '10px 12px',
                                fontSize: 14,
                                cursor: 'pointer',
                                color: '#111827',
                            }}
                        >
                            Back to home
                        </button>

                        <button
                            type='button'
                            onClick={() => router.reload()}
                            disabled={status === 'loading'}
                            style={{
                                appearance: 'none',
                                border: '1px solid rgba(17,24,39,0.12)',
                                background: status === 'loading' ? '#f3f4f6' : '#111827',
                                borderRadius: 12,
                                padding: '10px 12px',
                                fontSize: 14,
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                color: status === 'loading' ? '#6b7280' : '#ffffff',
                            }}
                        >
                            {status === 'loading' ? 'Please wait…' : 'Retry'}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                    If you didn’t request this change, you can ignore this page.
                </div>
            </div>

            {/* simple spinner animation */}
            <style jsx>{`
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
