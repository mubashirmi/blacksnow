'use client';

import axios from 'axios';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { parseCookies } from 'nookies';
import * as React from 'react';
import { createPortal } from 'react-dom';

export type VerifiedAction = 'unsubscribe' | 'feedback' | 'pause_subscription' | 'resume_subscription';

type ActionVerificationModalProps = {
    action: VerifiedAction;
    product: string;
    productLabel: string;
    onVerified: (action: VerifiedAction, verificationToken: string) => Promise<void> | void;
    onClose: () => void;
};

// The backend may wrap its response in a `data`, `result`, or `challenge` object.
// Do not proceed if the required challenge or verification token is missing.
function responseField(payload: unknown, keys: string[]): string | null {
    if (!payload || typeof payload !== 'object') return null;
    const root = payload as Record<string, unknown>;
    const nested = [root, root.data, root.result, root.challenge];
    if (root.data && typeof root.data === 'object') {
        nested.push((root.data as Record<string, unknown>).challenge);
        nested.push((root.data as Record<string, unknown>).result);
    }
    for (const obj of nested) {
        if (!obj || typeof obj !== 'object') continue;
        const record = obj as Record<string, unknown>;
        for (const key of keys) {
            const value = record[key];
            if ((typeof value === 'string' && value.trim()) || typeof value === 'number') {
                return String(value);
            }
        }
    }
    return null;
}

function apiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
        const response = error.response?.data as { message?: unknown; error?: unknown } | undefined;
        if (typeof response?.message === 'string' && response.message.trim()) return response.message;
        if (typeof response?.error === 'string' && response.error.trim()) return response.error;
        if (!error.response) return 'Network error. Check your connection and try again.';
    }
    return error instanceof Error && error.message ? error.message : fallback;
}

const ACTION_LABEL: Record<VerifiedAction, string> = {
    unsubscribe: 'Cancel subscription',
    feedback: 'Submit feedback',
    pause_subscription: 'Pause subscription',
    resume_subscription: 'Resume subscription',
};

export function ActionVerificationModal({ action, product, productLabel, onVerified, onClose }: ActionVerificationModalProps) {
    const [step, setStep] = React.useState<'credentials' | 'otp'>('credentials');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [challengeId, setChallengeId] = React.useState('');
    const [challengeToken, setChallengeToken] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const requestLock = React.useRef(false);
    const onCloseRef = React.useRef(onClose);
    onCloseRef.current = onClose;
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Keep the overlay above the dashboard and preserve page scrolling on close.
    React.useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !requestLock.current) onCloseRef.current();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const requestStart = async () => {
        if (requestLock.current) return;
        const cookies = parseCookies();
        const rawId = cookies.id || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
        const userId = Number(String(rawId ?? '').replace(/^"|"$/g, ''));
        if (!rawId || !Number.isSafeInteger(userId) || userId <= 0) {
            setError('Your user session could not be verified. Please sign in again.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Enter a valid email address.');
            return;
        }
        if (!password) {
            setError('Enter your password.');
            return;
        }
        requestLock.current = true;
        setBusy(true);
        setError(null);
        try {
            const response = await axios.post('/api/v2/action-verification/start', {
                userId, // number, never a string
                email: email.trim(),
                password,
                action,
                context: action === 'feedback' ? { toolName: product } : { product },
            });
            if (response.data?.success === false) {
                throw new Error(response.data?.message || 'Unable to start verification.');
            }
            const nextId = responseField(response.data, ['challengeId', 'challenge_id']);
            const nextToken = responseField(response.data, ['challengeToken', 'challenge_token']);
            if (!nextId || !nextToken) {
                throw new Error('Verification started, but the server did not return a challenge ID and token.');
            }
            setChallengeId(nextId);
            setChallengeToken(nextToken);
            setPassword('');
            setOtp('');
            setStep('otp');
        } catch (err) {
            setError(apiError(err, 'Could not send the verification code. Please try again.'));
        } finally {
            requestLock.current = false;
            setBusy(false);
        }
    };

    const requestVerify = async () => {
        if (requestLock.current) return;
        if (!otp.trim()) {
            setError('Enter the verification code.');
            return;
        }
        if (!challengeId || !challengeToken) {
            setError('Verification session is missing. Start again.');
            return;
        }
        requestLock.current = true;
        setBusy(true);
        setError(null);
        try {
            const response = await axios.post('/api/v2/action-verification/verify', {
                challengeId,
                challengeToken,
                otp: otp.trim(),
            });
            if (response.data?.success === false) {
                throw new Error(response.data?.message || 'Incorrect or expired verification code.');
            }
            const verificationToken = responseField(response.data, [
                'verificationToken',
                'verification_token',
                'actionVerificationToken',
                'action_verification_token',
            ]);
            if (!verificationToken) {
                throw new Error('Code verification did not return an action-verification token. The action was not performed.');
            }
            // The final action must be authorized with the freshly verified token.
            // Do not use a login token or perform the action when verification fails.
            await onVerified(action, verificationToken);
            setChallengeId('');
            setChallengeToken('');
            setOtp('');
            onClose();
        } catch (err) {
            setError(apiError(err, 'Verification or the requested action failed. Please try again.'));
        } finally {
            requestLock.current = false;
            setBusy(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className='fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-[#07111e]/60 px-4 py-7 backdrop-blur-md sm:px-5'
            role='presentation'
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !requestLock.current) onClose();
            }}
        >
            <div
                role='dialog'
                aria-modal='true'
                aria-labelledby='action-verification-heading'
                aria-describedby='action-verification-description'
                className='relative my-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#4cc7e8]/30 px-6 py-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.48),0_0_55px_rgba(44,123,190,0.20)] sm:px-9 sm:py-9'
                style={{
                    background: 'linear-gradient(145deg, rgba(28,65,95,0.94) 0%, rgba(13,39,66,0.92) 50%, rgba(22,56,84,0.94) 100%)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
            >
                {/* Subtle glass reflections, matching the Coming Soon dialog. */}
                <div
                    className='pointer-events-none absolute inset-0 opacity-80'
                    style={{
                        background:
                            'radial-gradient(circle at 50% 0%, rgba(76,199,232,0.20), transparent 52%), radial-gradient(circle at 50% 100%, rgba(44,123,190,0.12), transparent 54%)',
                    }}
                />

                <button
                    type='button'
                    disabled={busy}
                    onClick={onClose}
                    aria-label='Close verification dialog'
                    className='absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-white/75 transition hover:border-[#4cc7e8]/50 hover:bg-[#4cc7e8]/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
                >
                    <X className='h-[18px] w-[18px]' />
                </button>

                <div className='relative z-10'>
                    <div className='mx-auto flex w-fit flex-col items-center'>
                        <Image
                            src='/logocolored.png'
                            alt='Black Snow'
                            width={92}
                            height={92}
                            className='h-[72px] w-[72px] object-contain sm:h-[86px] sm:w-[86px]'
                            priority
                        />
                        <p
                            className='mt-2.5 text-[13px] font-medium uppercase tracking-[0.28em] text-white sm:text-[15px]'
                            style={{ fontFamily: 'var(--font-michroma), sans-serif' }}
                        >
                            Black Snow
                        </p>
                    </div>

                    <h2
                        id='action-verification-heading'
                        className='mt-7 text-center text-[clamp(1.4rem,5.8vw,1.85rem)] leading-[1.3] tracking-[-0.025em] text-white'
                        style={{ fontFamily: 'var(--font-michroma), sans-serif', fontWeight: 400 }}
                    >
                        {step === 'credentials' ? 'Verify Your Identity' : 'Verify Your OTP'}
                    </h2>
                    <p
                        id='action-verification-description'
                        className='mx-auto mt-3 max-w-[340px] text-center text-[13px] leading-6 text-[#d6eaf5]/85 sm:text-sm'
                    >
                        {step === 'credentials'
                            ? `${ACTION_LABEL[action]} for ${productLabel}. Enter your email and password to receive a verification code.`
                            : `Enter the verification code sent to ${email.trim()}. Your action will continue once verified.`}
                    </p>

                    <form
                        className='mt-7 space-y-4'
                        onSubmit={(event) => {
                            event.preventDefault();
                            // eslint-disable-next-line
                            if (step === 'credentials') void requestStart();
                            // eslint-disable-next-line
                            else void requestVerify();
                        }}
                    >
                        {step === 'credentials' ? (
                            <>
                                <div>
                                    <label htmlFor='action-verify-email' className='mb-2 block text-[13px] font-medium text-white/90'>
                                        Email address
                                    </label>
                                    <input
                                        id='action-verify-email'
                                        type='email'
                                        autoComplete='email'
                                        autoFocus
                                        required
                                        disabled={busy}
                                        placeholder='Enter your email'
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className='w-full rounded-xl border border-[#9adcf0]/25 bg-[#d7eefb]/[0.09] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#4cc7e8]/80 focus:bg-[#d7eefb]/[0.12] focus:ring-2 focus:ring-[#4cc7e8]/15 disabled:opacity-50'
                                    />
                                </div>
                                <div>
                                    <label htmlFor='action-verify-password' className='mb-2 block text-[13px] font-medium text-white/90'>
                                        Password
                                    </label>
                                    <input
                                        id='action-verify-password'
                                        type='password'
                                        autoComplete='current-password'
                                        required
                                        disabled={busy}
                                        placeholder='Enter your password'
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className='w-full rounded-xl border border-[#9adcf0]/25 bg-[#d7eefb]/[0.09] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#4cc7e8]/80 focus:bg-[#d7eefb]/[0.12] focus:ring-2 focus:ring-[#4cc7e8]/15 disabled:opacity-50'
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label htmlFor='action-verify-otp' className='mb-2 block text-[13px] font-medium text-white/90'>
                                    Verification code
                                </label>
                                <input
                                    id='action-verify-otp'
                                    type='text'
                                    inputMode='numeric'
                                    autoComplete='one-time-code'
                                    autoFocus
                                    required
                                    disabled={busy}
                                    placeholder='Enter your OTP'
                                    value={otp}
                                    onChange={(event) => setOtp(event.target.value)}
                                    className='w-full rounded-xl border border-[#9adcf0]/25 bg-[#d7eefb]/[0.09] px-4 py-3 text-center text-base tracking-[0.18em] text-white placeholder:text-sm placeholder:tracking-normal placeholder:text-white/40 outline-none transition focus:border-[#4cc7e8]/80 focus:bg-[#d7eefb]/[0.12] focus:ring-2 focus:ring-[#4cc7e8]/15 disabled:opacity-50'
                                />
                            </div>
                        )}
                        {error && (
                            <p role='alert' className='rounded-xl border border-red-300/30 bg-red-950/25 px-4 py-3 text-sm text-red-100'>
                                {error}
                            </p>
                        )}

                        <button
                            type='submit'
                            disabled={busy}
                            className='flex w-full items-center justify-center gap-2 rounded-xl border border-[#70d3eb]/45 bg-[#266c98]/85 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(9,36,65,0.25)] transition hover:border-[#97e7f6]/70 hover:bg-[#317fa9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc7e8] disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            {busy && <Loader2 className='h-4 w-4 animate-spin' />}
                            {busy
                                ? step === 'credentials'
                                    ? 'Sending OTP...'
                                    : 'Verifying...'
                                : step === 'credentials'
                                ? 'Continue'
                                : 'Verify OTP and Continue'}
                        </button>

                        {step === 'otp' && (
                            <button
                                type='button'
                                disabled={busy}
                                onClick={() => {
                                    setStep('credentials');
                                    setChallengeId('');
                                    setChallengeToken('');
                                    setOtp('');
                                    setError(null);
                                }}
                                className='w-full rounded-xl border border-white/20 bg-white/[0.05] px-4 py-3 text-sm text-white/85 transition hover:border-[#4cc7e8]/45 hover:bg-white/10 disabled:opacity-50'
                            >
                                Start over
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
