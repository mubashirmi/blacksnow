'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Facebook, Globe, Mail, MessageSquareText, Monitor, Podcast, Share2, Twitter, Users, X, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface Billboard {
    id: number;
    createdAt: string;
    updatedAt: string;
    fullName: string;
    website: string | null;
    podcast: string | null;
    twitter: string | null;
    youTube: string | null;
    facebook: string | null;
    image: string | null;
    companyName: string | null;
    description: string | null;
    status: string; // Approved / Rejected / NotApproved
    authId?: number;
}

interface ApiResponse {
    message: string;
    data: Billboard[];
}

export default function Page() {
    const [billboards, setBillboards] = useState<Billboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Share banner state (per selected billboard)
    const [shareOpen, setShareOpen] = useState(false);
    const [shareTitle, setShareTitle] = useState<string>('');
    const [shareDescription, setShareDescription] = useState<string>('');
    const [shareUrl, setShareUrl] = useState<string>('');

    useEffect(() => {
        const fetchBillboards = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/api/v2/get-approved-digital-billboard', { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to fetch billboards');
                const json: ApiResponse = await res.json();
                const approved = (json.data || []).filter((b) => String(b.status).toLowerCase() === 'approved');
                setBillboards(approved);
            } catch (e: any) {
                setError(e?.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchBillboards();
    }, []);

    const openShareForBillboard = (b: Billboard) => {
        const path = `/billboards/${b.id}`;
        const absolute = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;

        setShareTitle(b.fullName || b.companyName || 'Billboard');
        setShareDescription(b.description || b.companyName || 'Digital Billboard');
        setShareUrl(absolute);
        setShareOpen(true);
    };

    return (
        <div className='min-h-screen bg-black overflow-hidden relative pb-24'>
            {/* Five-dot spinner CSS (move to globals if you prefer) */}
            <style jsx global>{`
                .dot-spinner {
                    --uib-size: 2.6rem;
                    --uib-speed: 0.9s;
                    --uib-color: #259dd3;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    height: var(--uib-size);
                    width: var(--uib-size);
                }
                .dot-spinner__dot {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                }
                .dot-spinner__dot::before {
                    content: '';
                    height: 22%;
                    width: 22%;
                    border-radius: 50%;
                    background-color: var(--uib-color);
                    transform: scale(0);
                    opacity: 0.75;
                    animation: pulse0112 calc(var(--uib-speed) * 1.111) ease-in-out infinite;
                    box-shadow: 0 0 18px rgba(37, 157, 211, 0.35);
                }
                .dot-spinner__dot:nth-child(2) {
                    transform: rotate(72deg);
                }
                .dot-spinner__dot:nth-child(3) {
                    transform: rotate(144deg);
                }
                .dot-spinner__dot:nth-child(4) {
                    transform: rotate(216deg);
                }
                .dot-spinner__dot:nth-child(5) {
                    transform: rotate(288deg);
                }
                .dot-spinner__dot:nth-child(2)::before {
                    animation-delay: calc(var(--uib-speed) * -0.8);
                }
                .dot-spinner__dot:nth-child(3)::before {
                    animation-delay: calc(var(--uib-speed) * -0.6);
                }
                .dot-spinner__dot:nth-child(4)::before {
                    animation-delay: calc(var(--uib-speed) * -0.4);
                }
                .dot-spinner__dot:nth-child(5)::before {
                    animation-delay: calc(var(--uib-speed) * -0.2);
                }
                @keyframes pulse0112 {
                    0%,
                    100% {
                        transform: scale(0);
                        opacity: 0.7;
                    }
                    50% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>

            {/* Hero (compact) */}
            <section className='relative pt-24 pb-6 px-6'>
                <div className='container mx-auto max-w-6xl text-center'>
                    <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                        DIGITAL BILLBOARD SHOWCASE
                    </Badge>
                    <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                        Premium <span className='bg-gradient-to-r from-[#259dd3] to-[#1e7ba8] bg-clip-text text-transparent'>Billboards</span>
                    </h1>
                    <div className='w-64 sm:w-80 md:w-96 h-1 sm:h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-4 sm:mb-5 mx-auto'></div>
                    <p className='text-base md:text-lg text-gray-300 max-w-3xl mx-auto'>Wide, readable, and elegant — not oversized.</p>
                </div>
            </section>

            {/* Grid */}
            <section className='relative pb-20 pt-4 px-6'>
                <div className='container mx-auto max-w-7xl'>
                    {loading ? (
                        <div className='flex items-center justify-center py-16'>
                            <div className='dot-spinner'>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className='text-center py-16'>
                            <div className='text-red-400 text-xl mb-2'>Error loading billboards</div>
                            <p className='text-gray-400'>{error}</p>
                        </div>
                    ) : billboards.length === 0 ? (
                        <div className='text-center py-16'>
                            <Monitor className='w-16 h-16 text-gray-500 mx-auto mb-4' />
                            <div className='text-gray-400 text-xl'>No billboards available</div>
                        </div>
                    ) : (
                        <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-3'>
                            {billboards.map((b) => (
                                <BillboardCard key={b.id} b={b} onShare={() => openShareForBillboard(b)} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA (unchanged sizing) */}
            <section className='relative py-20 px-6'>
                <div className='container mx-auto max-w-4xl text-center'>
                    <Badge className='uppercase bg-gradient-to-r from-[#259dd3] to-[#259dd3] text-white mb-5 px-6 py-2 text-sm font-bold'>
                        JOIN OUR BILLBOARD
                    </Badge>
                    <h2 className='text-4xl md:text-5xl font-black text-white mb-4'>
                        Ready to <span className='bg-gradient-to-r from-[#259dd3] to-[#1e7ba8] bg-clip-text text-transparent'>Showcase</span>?
                    </h2>
                    <div className='flex flex-col sm:flex-row gap-6 justify-center pt-8'>
                        <Link href='/login?signup'>
                            <Button className='group bg-gradient-to-r from-[#259dd3] to-[#1e7ba8] hover:from-[#1e7ba8] hover:to-[#259dd3] text-white px-10 py-6 text-base font-bold shadow-2xl shadow-[#259dd3]/40 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer w-full sm:w-[300px]'>
                                <Monitor className='w-5 h-5 mr-3' />
                                Get Featured
                                <ArrowRight className='w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform' />
                            </Button>
                        </Link>
                        <Link href='/advertising'>
                            <Button
                                variant='outline'
                                className='border-2 border-[#259dd3] text-[#259dd3] hover:bg-[#259dd3] hover:text-black px-10 py-6 text-base font-bold transition-all duration-300 cursor-pointer transform hover:scale-[1.02] bg-transparent w-full sm:w-[300px]'
                            >
                                <Users className='w-5 h-5 mr-3' />
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ✅ Fixed Share Banner (shows ONLY after clicking share on a billboard card) */}
            {shareOpen && <ShareBannerInline title={shareTitle} description={shareDescription} url={shareUrl} onClose={() => setShareOpen(false)} />}
        </div>
    );
}

/* ---------- Share Banner (INLINE in same page) ---------- */

function isIOS() {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function ShareBannerInline({ title, description, url, onClose }: { title?: string; description?: string; url: string; onClose: () => void }) {
    const shareText = useMemo(() => {
        const parts = [title ? `Check this out: ${title}` : 'Check this out!', description || null, url || null].filter(Boolean);
        return parts.join('\n');
    }, [title, description, url]);

    const smsHref = useMemo(() => {
        const body = encodeURIComponent(shareText);
        return isIOS() ? `sms:&body=${body}` : `sms:?&body=${body}`;
    }, [shareText]);

    const emailHref = useMemo(() => {
        const subject = encodeURIComponent(title ? `Shared: ${title}` : 'Shared link');
        const body = encodeURIComponent(shareText);
        return `mailto:?subject=${subject}&body=${body}`;
    }, [title, shareText]);

    return (
        <div
            className='fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/70 backdrop-blur'
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
        >
            <div className='mx-auto max-w-7xl px-4 py-3'>
                <div className='flex items-center gap-3'>
                    <div className='hidden sm:flex items-center gap-2 text-white/80 text-sm'>
                        <Share2 className='w-4 h-4' />
                        <span className='truncate max-w-[380px]'>{title || 'Share'}</span>
                    </div>

                    <div className='flex w-full gap-3'>
                        {/* SMS LEFT (GREEN) */}
                        <a
                            href={smsHref}
                            className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold bg-green-500 hover:bg-green-600 text-white transition'
                            aria-label='Share via SMS'
                            title='Share via SMS'
                        >
                            <MessageSquareText className='w-5 h-5' />
                            SMS
                        </a>

                        {/* EMAIL RIGHT (YELLOW) */}
                        <a
                            href={emailHref}
                            className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold bg-yellow-400 hover:bg-yellow-500 text-black transition'
                            aria-label='Share via Email'
                            title='Share via Email'
                        >
                            <Mail className='w-5 h-5' />
                            Email
                        </a>

                        {/* Close */}
                        <button
                            type='button'
                            onClick={onClose}
                            className='shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition text-white'
                            aria-label='Close share banner'
                            title='Close'
                        >
                            <X className='w-5 h-5' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- Card & helpers ---------- */

function getDomain(url?: string | null) {
    if (!url) return null;
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, '');
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/\/.*/, '');
    }
}

function BillboardCard({ b, onShare }: { b: Billboard; onShare: () => void }) {
    const socials = useMemo(
        () =>
            [
                { icon: Globe, url: b.website, label: 'Website' },
                { icon: Podcast, url: b.podcast, label: 'Podcast' },
                { icon: Twitter, url: b.twitter, label: 'Twitter' },
                { icon: Youtube, url: b.youTube, label: 'YouTube' },
                { icon: Facebook, url: b.facebook, label: 'Facebook' },
            ].filter((s) => !!s.url),
        [b]
    );

    return (
        <article
            className='
        relative overflow-hidden rounded-2xl border border-[#259dd3]/25
        bg-gradient-to-br from-black/90 via-[#0a0b0f]/95 to-black/90
        hover:border-[#259dd3]/45 transition-all duration-300
      '
        >
            {/* Canvas: small 16:9, md+ 2:1 */}
            <div className='relative aspect-[16/9] md:aspect-[2/1]'>
                <Image
                    src={b.image || '/placeholder.svg'}
                    alt={b.companyName ? `${b.companyName} billboard` : 'Billboard'}
                    fill
                    sizes='(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'
                    className='object-cover'
                    priority={false}
                />
                {/* Soft gradient for legibility */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

                {/* Status pill */}
                <div className='absolute top-3 left-3'>
                    <span className='rounded-full bg-[#259dd3] text-black font-semibold text-[10px] px-2.5 py-1'>{String(b.status)}</span>
                </div>

                {/* Quick website chip (top-right) */}
                {b.website && (
                    <div className='absolute top-3 right-3'>
                        <Link
                            href={b.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1.5 rounded-full bg-white/10 text-white/90 text-xs px-3 py-1 border border-white/20 hover:bg-white/15 transition'
                        >
                            <Globe className='w-3.5 h-3.5' />
                            {getDomain(b.website)}
                            <ExternalLink className='w-3 h-3' />
                        </Link>
                    </div>
                )}

                {/* Content */}
                <div className='absolute inset-x-0 bottom-0 p-4 md:p-5'>
                    <h2 className='text-white font-extrabold text-2xl md:text-3xl leading-tight truncate'>{b.fullName || '—'}</h2>
                    {b.companyName && <p className='text-[#7bd3f6] font-semibold text-sm md:text-base truncate'>{b.companyName}</p>}
                    {b.description && <p className='mt-2 text-gray-200 text-sm md:text-[15px] line-clamp-2'>{b.description}</p>}

                    {/* Actions row (socials + share + visit) */}
                    <div className='mt-3 flex items-center gap-2'>
                        {socials.map((s, i) => (
                            <Link
                                key={i}
                                href={s.url as string}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition text-white'
                                aria-label={s.label}
                                title={s.label}
                            >
                                <s.icon className='w-4.5 h-4.5' />
                            </Link>
                        ))}

                        <button
                            type='button'
                            onClick={onShare}
                            className='ml-auto inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition text-white'
                            aria-label='Share billboard'
                            title='Share'
                        >
                            <Share2 className='w-4.5 h-4.5' />
                        </button>

                        <Link href={`/billboards/${b.id}`}>
                            <Button className='h-9 px-3 text-xs bg-gradient-to-r from-[#259dd3] to-[#1e7ba8] hover:from-[#1e7ba8] hover:to-[#259dd3] text-white cursor-pointer'>
                                Visit
                                <ArrowRight className='w-3.5 h-3.5 ml-1.5' />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
