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

function statusPill(status?: string) {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return 'bg-green-500 text-white';
    if (s === 'notapproved') return 'bg-blue-500 text-white';
    if (s === 'rejected') return 'bg-red-500 text-white';
    return 'bg-gray-600 text-white';
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

        const ac = new AbortController();

        const fetchBillboard = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`/api/v2/digital-billboard?id=${billboardId}`, {
                    cache: 'no-store',
                    signal: ac.signal,
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(txt || `Failed to fetch billboard (${res.status})`);
                }

                const json = (await res.json()) as ApiByIdResponse;
                if (!json?.data?.id) throw new Error('Billboard not found');

                setBillboard(json.data);
            } catch (e: any) {
                if (e?.name === 'AbortError') return;
                setError(e?.message || 'Failed to load billboard');
            } finally {
                setLoading(false);
            }
        };

        fetchBillboard();

        return () => ac.abort();
    }, [router.isReady, billboardId]);

    const socials = useMemo(() => {
        if (!billboard) return [];
        return [
            { icon: Globe, url: billboard.website, label: 'Website' },
            { icon: Podcast, url: billboard.podcast, label: 'Podcast' },
            { icon: Twitter, url: billboard.twitter, label: 'Twitter' },
            { icon: Youtube, url: billboard.youTube, label: 'YouTube' },
            { icon: Facebook, url: billboard.facebook, label: 'Facebook' },
        ].filter((s) => !!s.url);
    }, [billboard]);

    return (
        <div className='min-h-screen bg-black relative overflow-hidden'>
            {/* Top gradient glow */}
            <div className='absolute inset-0 bg-gradient-to-b from-[#0a0b0f] via-black to-black pointer-events-none' />

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
                                <Button className='bg-gradient-to-r from-[#259dd3] to-[#1e7ba8] text-white'>Go to Billboards</Button>
                            </Link>
                        </div>
                    </div>
                ) : !billboard ? (
                    <div className='flex items-center justify-center py-20 text-gray-400'>No billboard found</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
                            <div>
                                <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 px-6 py-2 text-xs font-bold'>
                                    DIGITAL BILLBOARD
                                </Badge>

                                <h1 className='text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight'>{billboard.companyName || 'Billboard'}</h1>
                                <p className='text-gray-300 mt-2 text-lg'>{billboard.fullName}</p>

                                <div className='mt-4 flex items-center gap-3'>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusPill(billboard.status)}`}>{billboard.status}</span>

                                    {billboard.website && (
                                        <a
                                            href={billboard.website}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex items-center gap-2 text-sm text-[#7bd3f6] hover:text-white transition'
                                        >
                                            {getDomain(billboard.website)}
                                            <ExternalLink className='w-4 h-4' />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Socials */}
                            {socials.length > 0 && (
                                <div className='flex items-center gap-2'>
                                    {socials.map((s, i) => (
                                        <a
                                            key={i}
                                            href={s.url as string}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition text-white'
                                            aria-label={s.label}
                                            title={s.label}
                                        >
                                            <s.icon className='w-5 h-5' />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Main */}
                        <div className='mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8'>
                            {/* Image */}
                            <div className='lg:col-span-3'>
                                <div className='relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#259dd3]/25 bg-white/5'>
                                    <Image
                                        src={billboard.image || '/placeholder.svg'}
                                        alt={billboard.companyName || 'Billboard'}
                                        fill
                                        className='object-cover'
                                        sizes='(max-width: 1024px) 100vw, 60vw'
                                    />
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
                                </div>
                            </div>

                            {/* Details */}
                            <div className='lg:col-span-2'>
                                <div className='rounded-2xl border border-white/10 bg-gradient-to-br from-black/70 via-[#0a0b0f]/85 to-black/70 p-6'>
                                    <h2 className='text-white font-extrabold text-xl'>About</h2>
                                    <p className='text-gray-300 mt-3 leading-relaxed'>{billboard.description || 'No description provided.'}</p>

                                    <div className='mt-6 grid grid-cols-1 gap-3'>
                                        <div className='rounded-xl bg-white/5 border border-white/10 p-4'>
                                            <div className='text-xs uppercase tracking-wide text-gray-400'>Billboard ID</div>
                                            <div className='text-white font-semibold mt-1'>#{billboard.id}</div>
                                        </div>

                                        <div className='rounded-xl bg-white/5 border border-white/10 p-4'>
                                            <div className='text-xs uppercase tracking-wide text-gray-400'>Last Updated</div>
                                            <div className='text-white font-semibold mt-1'>{new Date(billboard.updatedAt).toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className='mt-6 flex gap-3'>
                                        <Link href='/billboards' className='flex-1'>
                                            <Button className='w-full bg-transparent border-2 border-[#2c7bbe] text-[#2c7bbe] hover:bg-[#2c7bbe] hover:text-white'>
                                                Back to List
                                            </Button>
                                        </Link>

                                        {billboard.website && (
                                            <a href={billboard.website} target='_blank' rel='noopener noreferrer' className='flex-1'>
                                                <Button className='w-full bg-gradient-to-r from-[#259dd3] to-[#1e7ba8] text-white'>Visit Website</Button>
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
