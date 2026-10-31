'use client';

import { AlertCircle, CheckCircle, Copy, Download, ExternalLink, Loader2, QrCode, RefreshCw, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Copy the provided transparent logo to your Next.js project's public directory. */
const COMPANY_LOGO_URL = '/logocolored.png';
const QR_BLUE = '#073ccc';
const QR_SIZE = 320;
const QR_LOGO_SIZE = 60; // 18.75% of the SVG; level H protects scannability.

interface AffiliateLink {
    id: number;
    productName: string;
    productLink: string;
    clicks: number;
    conversion: number;
    comission: number;
    createdAt: string;
    updatedAt: string;
    authId: number;
}

interface ApiResponse {
    message: string;
    affiliateData: AffiliateLink[];
}

interface SelectedQrLink {
    id: number;
    productName: string;
    url: string;
}

/** One URL generator shared by the clickable link, Copy, and QR workflows. */
function createAffiliateUrl(productLink: string, userId: string): string | null {
    try {
        const base = typeof window === 'undefined' ? 'https://example.invalid' : window.location.origin;
        const url = new URL(productLink, base);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
        url.searchParams.set('refId', userId);
        return url.toString();
    } catch {
        return null;
    }
}

/**
 * Read the actual transparent company PNG as a self-contained data URL.
 * The logo is embedded INTO the QR SVG, including in its exported PNG.
 * A transparent PNG means there is no fake white square or circular badge.
 */
async function loadEmbeddedLogo(): Promise<string> {
    const response = await fetch(COMPANY_LOGO_URL, { cache: 'force-cache' });
    if (!response.ok) throw new Error('Logo is missing from /public/logocolored.png.');
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) throw new Error('The logo must be an image.');

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Could not read your logo.'));
        };
        reader.onerror = () => reject(new Error('Could not read your logo.'));
        reader.readAsDataURL(blob);
    });
}

function AffiliateQrModal({ link, onClose }: { link: SelectedQrLink; onClose: () => void }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const [embeddedLogo, setEmbeddedLogo] = useState<string | null>(null);
    const [logoReady, setLogoReady] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadEmbeddedLogo()
            .then((dataUrl) => {
                if (!cancelled) {
                    setEmbeddedLogo(dataUrl);
                    setLogoReady(true);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    // Still provide a functional QR even if the branded asset wasn't installed.
                    setLogoError(true);
                    setLogoReady(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Same accessible close behavior as the existing Black Snow dialogs.
    useEffect(() => {
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !dialogRef.current) return;
            const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [onClose]);

    async function handleDownload() {
        if (!svgRef.current || !logoReady || downloading) return;
        setDownloading(true);
        setDownloadError(null);
        let svgObjectUrl: string | null = null;
        let pngObjectUrl: string | null = null;

        try {
            // SVG already includes the logo as a data URI, not a remote linked image.
            const svg = svgRef.current.cloneNode(true) as SVGSVGElement;
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            const markup = new XMLSerializer().serializeToString(svg);
            svgObjectUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));

            const image = new Image();
            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () => reject(new Error('Could not render the QR code.'));
                image.src = svgObjectUrl!;
            });

            const canvas = document.createElement('canvas');
            canvas.width = 1200;
            canvas.height = 1200;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Image downloads are not supported by this browser.');
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            // Clean, high-resolution QR: QR includes a spec-sized 4-module white quiet zone.
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 80, 80, 1040, 1040);

            const png = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Could not create the PNG.'));
                }, 'image/png');
            });

            pngObjectUrl = URL.createObjectURL(png);
            const safeName =
                link.productName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '')
                    .slice(0, 50) || 'affiliate-link';
            const anchor = document.createElement('a');
            anchor.href = pngObjectUrl;
            anchor.download = `blacksnow-${safeName}-${link.id}-qr.png`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
        } catch (error) {
            setDownloadError(error instanceof Error ? error.message : 'The QR code could not be downloaded.');
        } finally {
            if (svgObjectUrl) URL.revokeObjectURL(svgObjectUrl);
            if (pngObjectUrl) window.setTimeout(() => URL.revokeObjectURL(pngObjectUrl!), 5000);
            setDownloading(false);
        }
    }

    const label = link.productName.replace(/([A-Z])/g, ' $1').trim();

    return createPortal(
        <div
            role='presentation'
            className='bs-qr-backdrop fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/80 px-5 py-8 backdrop-blur-md'
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role='dialog'
                aria-modal='true'
                aria-labelledby='bs-qr-title'
                aria-describedby='bs-qr-description'
                className='bs-qr-dialog relative my-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#4cc7e8]/25 px-6 pb-8 pt-9 text-center sm:px-10 sm:pb-10 sm:pt-11'
                style={{
                    background: 'linear-gradient(145deg, rgba(10,18,28,0.96) 0%, rgba(5,6,8,0.95) 54%, rgba(9,19,30,0.96) 100%)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
            >
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-0 opacity-70'
                    style={{
                        background:
                            'radial-gradient(circle at 50% 0%, rgba(76,199,232,0.14), transparent 42%), radial-gradient(circle at 50% 100%, rgba(44,123,190,0.08), transparent 45%)',
                    }}
                />

                <button
                    ref={closeRef}
                    type='button'
                    aria-label='Close QR code dialog'
                    onClick={onClose}
                    className='absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-[#4cc7e8]/35 hover:bg-[#4cc7e8]/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc7e8]'
                >
                    <X className='h-[18px] w-[18px]' />
                </button>

                <div className='relative z-10'>
                    <div className='mx-auto flex w-fit items-center gap-2 rounded-full border border-[#4cc7e8]/20 bg-[#4cc7e8]/[0.045] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#94d7f0]'>
                        <QrCode className='h-3.5 w-3.5' /> Black Snow
                    </div>
                    <h2
                        id='bs-qr-title'
                        className='mt-5 text-[clamp(1.55rem,7vw,2.15rem)] font-normal leading-[1.2] tracking-[-0.025em] text-white'
                        style={{ fontFamily: 'var(--font-michroma), sans-serif' }}
                    >
                        Scan to Open
                    </h2>
                    <p id='bs-qr-description' className='mx-auto mt-2 max-w-[270px] text-[13px] leading-relaxed text-white/55'>
                        Point your camera at the code to open this link.
                    </p>

                    <div className='relative mx-auto mt-7 max-w-[336px]'>
                        <div aria-hidden='true' className='pointer-events-none absolute -inset-[5px] rounded-[27px] border border-[#4cc7e8]/10' />
                        <div className='relative overflow-hidden rounded-[22px] border border-[#bce5fc]/60 bg-white p-3 sm:p-4'>
                            <div className='relative aspect-square w-full overflow-hidden rounded-[12px] bg-white'>
                                {logoReady ? (
                                    <>
                                        <div className='bs-qr-matrix absolute inset-0 flex items-center justify-center'>
                                            <QRCodeSVG
                                                ref={svgRef}
                                                value={link.url}
                                                size={QR_SIZE}
                                                level='H'
                                                marginSize={4}
                                                bgColor='#ffffff'
                                                fgColor={QR_BLUE}
                                                title={`Black Snow QR code for ${label}`}
                                                imageSettings={
                                                    embeddedLogo
                                                        ? {
                                                              src: embeddedLogo,
                                                              width: QR_LOGO_SIZE,
                                                              height: QR_LOGO_SIZE,
                                                              excavate: false, // Keep modules visible through transparent logo areas: no rectangular cutout.
                                                          }
                                                        : undefined
                                                }
                                                className='h-full w-full'
                                            />
                                        </div>
                                        {embeddedLogo && (
                                            // Exactly matches the logo baked into the SVG. This overlay only
                                            // creates the center-first reveal illusion; the download uses the SVG.
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={embeddedLogo}
                                                alt=''
                                                aria-hidden='true'
                                                className='bs-qr-logo-reveal pointer-events-none absolute left-1/2 top-1/2 z-10 h-[18.75%] w-[18.75%] -translate-x-1/2 -translate-y-1/2 object-contain'
                                            />
                                        )}
                                        <div
                                            aria-hidden='true'
                                            className='bs-qr-scan pointer-events-none absolute left-[9%] right-[9%] top-1/2 z-20 h-px bg-gradient-to-r from-transparent via-[#4cc7e8]/70 to-transparent'
                                        />
                                    </>
                                ) : (
                                    <div role='status' className='flex h-full flex-col items-center justify-center gap-3 text-[#073ccc]'>
                                        <QrCode className='h-10 w-10 animate-pulse' />
                                        <span className='text-xs font-medium text-slate-500'>Preparing your QR code...</span>
                                    </div>
                                )}
                            </div>
                            {/* Tiny corner accents stay outside the QR, never obscuring scan modules. */}
                            <span
                                aria-hidden='true'
                                className='pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-tl-lg border-l border-t border-[#73bdf8]/70'
                            />
                            <span
                                aria-hidden='true'
                                className='pointer-events-none absolute bottom-1 right-1 h-4 w-4 rounded-br-lg border-b border-r border-[#73bdf8]/70'
                            />
                        </div>
                    </div>

                    <p className='mx-auto mt-5 max-w-[300px] truncate text-[13px] font-medium text-[#e1eaf5]' title={label}>
                        {label}
                    </p>
                    <div role='status' className='mt-2 flex items-center justify-center gap-2 text-[11px] tracking-wide text-[#9db6c9]'>
                        <span className={`h-1.5 w-1.5 rounded-full ${logoReady ? 'bg-[#61cfbd]' : 'bg-[#4cc7e8] animate-pulse'}`} />
                        {logoReady ? 'Ready to scan' : 'Generating code'}
                    </div>
                    {logoError && (
                        <p role='alert' className='mt-3 text-center text-xs text-amber-300'>
                            The logo could not load. Copy <code>logocolored.png</code> into your public folder.
                        </p>
                    )}
                    {downloadError && (
                        <p role='alert' className='mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200'>
                            {downloadError}
                        </p>
                    )}

                    <button
                        type='button'
                        onClick={() => {
                            // eslint-disable-next-line
                            void handleDownload();
                        }}
                        disabled={!logoReady || downloading}
                        className='group mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#4cc7e8]/35 bg-gradient-to-r from-[#0634aa] via-[#0748d8] to-[#1062df] px-5 py-3.5 text-[13px] font-semibold tracking-wide text-white transition duration-200 hover:from-[#0948cc] hover:via-[#115cf1] hover:to-[#217bea] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc7e8]'
                    >
                        {downloading ? (
                            <Loader2 className='h-[17px] w-[17px] animate-spin' />
                        ) : (
                            <Download className='h-[17px] w-[17px] transition-transform group-hover:-translate-y-0.5' />
                        )}
                        {downloading ? 'Preparing PNG...' : 'Download QR Code'}
                    </button>
                    <p className='mt-3 text-[10px] font-medium tracking-wide text-[#7f9aad]'>High-resolution PNG · Logo included</p>
                </div>
            </div>

            <style>{`
                @keyframes bs-qr-backdrop-fade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes bs-qr-dialog-enter {
                    from { opacity: 0; transform: translateY(15px) scale(.975); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes bs-qr-matrix-assemble {
                    0% { opacity: .08; clip-path: inset(0 50% 0 50%); }
                    30% { opacity: .8; }
                    100% { opacity: 1; clip-path: inset(0 0 0 0); }
                }
                @keyframes bs-qr-logo-create {
                    0% { opacity: 0; scale: .65; }
                    22% { opacity: 1; scale: 1.05; }
                    54% { opacity: 1; scale: 1; }
                    88%, 100% { opacity: 0; scale: 1; }
                }
                @keyframes bs-qr-scan-flash {
                    0% { opacity: 0; transform: translateY(-112px); }
                    25% { opacity: .75; }
                    80% { opacity: .5; }
                    100% { opacity: 0; transform: translateY(112px); }
                }
                .bs-qr-backdrop { animation: bs-qr-backdrop-fade .26s ease both; }
                .bs-qr-dialog { animation: bs-qr-dialog-enter .39s cubic-bezier(.2,.8,.2,1) both; }
                .bs-qr-matrix { animation: bs-qr-matrix-assemble 1.1s cubic-bezier(.2,.85,.2,1) .20s both; }
                .bs-qr-logo-reveal { animation: bs-qr-logo-create 1.12s cubic-bezier(.2,.8,.2,1) both; }
                .bs-qr-scan { animation: bs-qr-scan-flash 1.06s ease-in-out .24s both; }
                @media (prefers-reduced-motion: reduce) {
                    .bs-qr-backdrop, .bs-qr-dialog, .bs-qr-matrix, .bs-qr-logo-reveal, .bs-qr-scan { animation: none !important; }
                    .bs-qr-logo-reveal, .bs-qr-scan { display: none; }
                }
            `}</style>
        </div>,
        document.body
    );
}

export default function AffiliateLinks() {
    const [links, setLinks] = useState<AffiliateLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [retrying, setRetrying] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedQrLink, setSelectedQrLink] = useState<SelectedQrLink | null>(null);
    const closeQrModal = useCallback(() => setSelectedQrLink(null), []);

    // Read localStorage after mount (important for Next.js / SSR).
    useEffect(() => {
        try {
            const storedId = window.localStorage.getItem('userId');
            if (!storedId) {
                setError('User ID was not found. Please sign in again.');
                setLoading(false);
                return;
            }
            setUserId(storedId);
        } catch {
            setError('Unable to access your saved user ID.');
            setLoading(false);
        }
    }, []);

    const fetchAffiliateData = useCallback(async () => {
        if (!userId) return;
        try {
            setError(null);
            const response = await fetch(`/api/v2/admin-affiliate-data/?id=${encodeURIComponent(userId)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data: ApiResponse = await response.json();
            setLinks(data.affiliateData || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch affiliate data');
        } finally {
            setLoading(false);
            setRetrying(false);
        }
    }, [userId]);

    useEffect(() => {
        // eslint-disable-next-line
        if (userId) void fetchAffiliateData();
    }, [userId, fetchAffiliateData]);

    const handleRetry = () => {
        if (!userId) {
            window.location.reload();
            return;
        }
        setRetrying(true);
        setLoading(true);
        // eslint-disable-next-line
        void fetchAffiliateData();
    };

    const copyToClipboard = async (url: string, id: number) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
        } catch {
            setActionError('Could not copy the link. Please check your browser permissions.');
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
    const totalConversions = links.reduce((sum, link) => sum + link.conversion, 0);
    const totalCommission = links.reduce((sum, link) => sum + link.comission, 0);

    if (loading && !retrying) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div role='status' aria-label='Loading affiliate links' className='dot-spinner'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className='dot-spinner__dot' />
                    ))}
                </div>
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className='space-y-6'>
                <div>
                    <h2 className='text-3xl font-bold text-gray-900'>Affiliate Links</h2>
                    <p className='mt-1 text-gray-600'>Manage your affiliate links and track performance</p>
                </div>
                <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center'>
                    <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
                    <h3 className='mb-2 text-lg font-semibold text-red-800'>Error Loading Data</h3>
                    <p className='mb-4 text-red-600'>{error}</p>
                    <button
                        type='button'
                        onClick={handleRetry}
                        disabled={retrying}
                        className='mx-auto flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {retrying ? <Loader2 className='h-4 w-4 animate-spin' /> : <RefreshCw className='h-4 w-4' />}
                        {retrying ? 'Retrying...' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-3xl font-bold text-gray-900'>Affiliate Links</h2>
                <p className='mt-1 text-gray-600'>Manage your affiliate links and track performance</p>
            </div>

            {actionError && (
                <div
                    role='alert'
                    className='flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'
                >
                    <span>{actionError}</span>
                    <button type='button' onClick={() => setActionError(null)} className='rounded-md p-1 hover:bg-amber-100' aria-label='Dismiss notification'>
                        <X className='h-4 w-4' />
                    </button>
                </div>
            )}

            {links.length === 0 && !loading && (
                <div className='rounded-lg border border-gray-200 bg-white py-12 text-center'>
                    <ExternalLink className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>No Affiliate Links</h3>
                    <p className='text-gray-600'>You don&apos;t have any affiliate links yet.</p>
                </div>
            )}

            {links.length > 0 && (
                <div className='grid gap-6'>
                    {links.map((link) => {
                        const trackingUrl = userId ? createAffiliateUrl(link.productLink, userId) : null;
                        return (
                            <div key={link.id} className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6'>
                                <div className='mb-4 flex items-start justify-between gap-4'>
                                    <div className='min-w-0 flex-1'>
                                        <h3 className='mb-2 text-xl font-semibold capitalize text-gray-900'>
                                            {link.productName.replace(/([A-Z])/g, ' $1').trim()}
                                        </h3>
                                        <div className='flex items-start gap-2 text-gray-600'>
                                            <span className='pt-0.5 text-sm'>URL:</span>
                                            {trackingUrl ? (
                                                <a
                                                    href={trackingUrl}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='inline-flex min-w-0 items-start gap-1 break-all font-mono text-sm text-blue-600 hover:text-blue-800'
                                                >
                                                    {trackingUrl}
                                                    <ExternalLink className='mt-0.5 h-3 w-3 shrink-0' />
                                                </a>
                                            ) : (
                                                <span className='text-sm text-red-600'>Invalid affiliate URL</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='flex shrink-0 items-center gap-2'>
                                        <button
                                            type='button'
                                            onClick={() => trackingUrl && setSelectedQrLink({ id: link.id, productName: link.productName, url: trackingUrl })}
                                            disabled={!trackingUrl}
                                            className='group inline-flex items-center gap-1.5 rounded-xl border border-[#87ccf2]/30 bg-gradient-to-r from-[#071c34] to-[#0b3c89] px-3 py-2.5 text-[#d8f1ff] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4cc7e8]/60 hover:from-[#092746] hover:to-[#0753b7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cc7e8] disabled:cursor-not-allowed disabled:opacity-40'
                                            aria-label={`Show QR code for ${link.productName}`}
                                            title='Show QR code'
                                        >
                                            <QrCode className='h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110' />
                                            <span className='hidden text-xs font-semibold sm:inline'>QR code</span>
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                if (trackingUrl) {
                                                    copyToClipboard(trackingUrl, link.id);
                                                }
                                            }}
                                            disabled={!trackingUrl}
                                            className='rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-40'
                                            aria-label={copiedId === link.id ? 'Link copied' : `Copy link for ${link.productName}`}
                                            title={copiedId === link.id ? 'Copied!' : 'Copy URL'}
                                        >
                                            {copiedId === link.id ? (
                                                <CheckCircle className='h-[18px] w-[18px] text-green-500' />
                                            ) : (
                                                <Copy className='h-[18px] w-[18px]' />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4'>
                                    <div className='text-center'>
                                        <div className='text-2xl font-bold text-gray-900'>{link.clicks}</div>
                                        <div className='text-sm text-gray-500'>Clicks</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-2xl font-bold text-gray-900'>{link.conversion}</div>
                                        <div className='text-sm text-gray-500'>Conversions</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-2xl font-bold text-green-600'>{formatCurrency(link.comission)}</div>
                                        <div className='text-sm text-gray-500'>Commission</div>
                                    </div>
                                    <div className='text-center'>
                                        <div className='text-sm font-medium text-gray-900'>{formatDate(link.createdAt)}</div>
                                        <div className='text-sm text-gray-500'>Created</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {links.length > 0 && (
                <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
                    <h3 className='mb-4 text-lg font-semibold text-gray-900'>Summary</h3>
                    <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-gray-900'>{links.length}</div>
                            <div className='text-sm text-gray-500'>Total Links</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-blue-600'>{totalClicks}</div>
                            <div className='text-sm text-gray-500'>Total Clicks</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-600'>{totalConversions}</div>
                            <div className='text-sm text-gray-500'>Total Conversions</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-3xl font-bold text-green-600'>{formatCurrency(totalCommission)}</div>
                            <div className='text-sm text-gray-500'>Total Commission</div>
                        </div>
                    </div>
                </div>
            )}

            {selectedQrLink && <AffiliateQrModal key={selectedQrLink.id} link={selectedQrLink} onClose={closeQrModal} />}
        </div>
    );
}
