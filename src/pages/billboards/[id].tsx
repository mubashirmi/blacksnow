import ShareBanner from '@/components/ShareBanner';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import { ArrowLeft, ExternalLink, Facebook, Globe, Podcast, Twitter, Youtube } from 'lucide-react';

import Image from 'next/image';

import Link from 'next/link';

import { useRouter } from 'next/router';

import { useEffect, useMemo, useState } from 'react';

type Billboard = {
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

    status: string;

    authId?: number;
};

type ApiByIdResponse = {
    message: string;

    data: Billboard;
};

function safeParseId(idParam: string | string[] | undefined): number | null {
    if (!idParam) return null;

    const raw = Array.isArray(idParam) ? idParam[0] : idParam;

    const n = Number(raw);

    if (!Number.isFinite(n) || n <= 0) return null;

    return Math.floor(n);
}

function getDomain(url?: string | null) {
    if (!url) return null;

    try {
        const u = new URL(url);

        return u.hostname.replace(/^www\./, '');
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/\/.*/, '');
    }
}

function formatDate(iso?: string) {
    if (!iso) return '';

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) return '';

    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BillboardDetailPage() {
    const router = useRouter();

    const billboardId = useMemo(() => safeParseId(router.query.id), [router.query.id]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [billboard, setBillboard] = useState<Billboard | null>(null);

    useEffect(() => {
        if (!router.isReady) return;

        if (!billboardId) {
            setLoading(false);

            setError('Invalid billboard id.');

            return;
        }

        let cancelled = false;

        const fetchBillboard = async () => {
            try {
                setLoading(true);

                setError(null);

                const res = await fetch(`/api/v2/digital-billboard?id=${billboardId}`, { cache: 'no-store' });

                if (!res.ok) {
                    const txt = await res.text().catch(() => '');

                    throw new Error(txt || `Failed to fetch billboard (${res.status})`);
                }

                const json = (await res.json()) as ApiByIdResponse;

                if (!json?.data?.id) throw new Error('Billboard not found');

                if (!cancelled) setBillboard(json.data);
            } catch (e: any) {
                if (cancelled) return;

                setError(e?.message || 'Failed to load billboard');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBillboard();

        return () => {
            cancelled = true;
        };
    }, [router.isReady, billboardId]);

    const links = useMemo(() => {
        if (!billboard) return [];

        return [
            { icon: Globe, label: 'Website', url: billboard.website },

            { icon: Podcast, label: 'Podcast', url: billboard.podcast },

            { icon: Twitter, label: 'Twitter', url: billboard.twitter },

            { icon: Youtube, label: 'YouTube', url: billboard.youTube },

            { icon: Facebook, label: 'Facebook', url: billboard.facebook },
        ].filter((l) => !!l.url);
    }, [billboard]);

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Ambient background */}

            <div className='absolute inset-0 pointer-events-none'></div>

            <ShareBanner />

            <div className='relative container mx-auto max-w-6xl px-6 pt-10 pb-24'>
                {/* Back */}

                <div className='mb-6'>
                    <button onClick={() => router.back()} className='inline-flex items-center gap-2 text-gray-300 hover:text-white transition'>
                        <ArrowLeft className='w-4 h-4' />
                        Back
                    </button>
                </div>

                {loading ? (
                    <div className='flex items-center justify-center py-20 text-gray-400'>Loading billboard...</div>
                ) : error ? (
                    <div className='bg-white/5 border border-white/10 rounded-2xl p-8 text-center'>
                        <div className='text-red-400 text-xl font-bold mb-2'>Error</div>

                        <p className='text-gray-300'>{error}</p>

                        <div className='mt-6 flex justify-center'>
                            <Link href='/billboards'>
                                <Button className='bg-[#4333AF] text-white'>Go to Billboards</Button>
                            </Link>
                        </div>
                    </div>
                ) : !billboard ? (
                    <div className='flex items-center justify-center py-20 text-gray-400'>No billboard found</div>
                ) : (
                    <>
                        {/* HERO IMAGE */}

                        <div className='relative w-full aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl shadow-[#4333AF]/15'>
                            <Image
                                src={billboard.image || '/placeholder.svg'}
                                alt={billboard.companyName || 'Billboard'}
                                fill
                                className='object-cover'
                                sizes='(max-width: 1024px) 100vw, 1200px'
                                priority
                            />

                            {/* overlay for legibility */}

                            <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent' />

                            {/* top badge */}

                            <div className='absolute top-5 left-5'>
                                <Badge className='uppercase bg-[#4333AF] text-white px-5 py-2 text-xs font-bold'>DIGITAL BILLBOARD</Badge>
                            </div>

                            {/* title overlay */}

                            <div className='absolute inset-x-0 bottom-0 p-6 md:p-10'>
                                <h1 className='text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight'>{billboard.companyName || 'Billboard'}</h1>

                                <p className='text-gray-200 mt-2 text-base md:text-lg'>{billboard.fullName}</p>

                                {billboard.website && (
                                    <div className='mt-4'>
                                        <a
                                            href={billboard.website}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex items-center gap-2 text-sm text-[#4333AF] hover:text-white transition'
                                        >
                                            {getDomain(billboard.website)}

                                            <ExternalLink className='w-4 h-4' />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CONTENT */}

                        <div className='mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8'>
                            {/* Description */}

                            <div className='lg:col-span-2'>
                                <div className='rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8'>
                                    <h2 className='text-white font-extrabold text-2xl'>About this billboard</h2>

                                    <div className='mt-4 text-gray-200 leading-relaxed text-[15px] md:text-[16px] whitespace-pre-wrap'>
                                        {billboard.description?.trim() ? billboard.description : 'No description provided.'}
                                    </div>

                                    {/* Soft meta row */}

                                    <div className='mt-6 flex flex-wrap gap-2 text-xs text-gray-400'>
                                        {billboard.createdAt && (
                                            <span className='px-3 py-1 rounded-full bg-black/30 border border-white/10'>
                                                Posted: {formatDate(billboard.createdAt)}
                                            </span>
                                        )}

                                        {billboard.updatedAt && (
                                            <span className='px-3 py-1 rounded-full bg-black/30 border border-white/10'>
                                                Updated: {formatDate(billboard.updatedAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Links / Actions */}

                            <div className='lg:col-span-1'>
                                <div className='rounded-3xl border border-[#414A5D] bg-[#0C0F18] p-6 md:p-8'>
                                    <h3 className='text-white font-extrabold text-xl'>Links</h3>

                                    {links.length === 0 ? (
                                        <p className='mt-3 text-sm text-gray-400'>No links available.</p>
                                    ) : (
                                        <div className='mt-4 space-y-3'>
                                            {links.map((l) => (
                                                <a
                                                    key={l.label}
                                                    href={l.url as string}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition'
                                                >
                                                    <span className='flex items-center gap-3 text-gray-100 font-semibold'>
                                                        <l.icon className='w-5 h-5 text-[#4333AF]' />

                                                        {l.label}
                                                    </span>

                                                    <ExternalLink className='w-4 h-4 text-gray-400' />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className='mt-8 flex gap-3'>
                                        <Link href='/billboards' className='flex-1'>
                                            <Button className='w-full bg-transparent border-2 border-[#414A5D] text-[#4333AF] hover:bg-[#4333AF] hover:text-white'>
                                                Back
                                            </Button>
                                        </Link>

                                        {billboard.website && (
                                            <a href={billboard.website} target='_blank' rel='noopener noreferrer' className='flex-1'>
                                                <Button className='w-full bg-[#4333AF] text-white'>Visit</Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
