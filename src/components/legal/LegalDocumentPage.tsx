import { getLegalRecord, type LegalDefinition, type LegalRecord } from '@/lib/legal-documents';
import { ArrowUpRight, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Tab = 'summary' | 'full';

export default function LegalDocumentPage({ document }: { document: LegalDefinition }) {
    const [record, setRecord] = useState<LegalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('summary');

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError('');
        setRecord(null);
        setTab('summary');

        getLegalRecord(document.endpoint, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setRecord(data);
                }
            })
            .catch((err: unknown) => {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Could not load document.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [document.endpoint]);

    const hasSummary = Boolean(record?.summary?.trim());
    const hasContent = Boolean(record?.content?.trim());

    return (
        <main className='min-h-screen bg-[#05080d] px-3 py-8 text-white sm:px-6 sm:py-14 lg:py-20'>
            <section className='mx-auto w-full max-w-4xl rounded-[26px] border border-[#1d3551] bg-[linear-gradient(135deg,#0e2033_0%,#091525_55%,#0a1421_100%)] p-5 shadow-[0_15px_55px_rgba(0,0,0,.35)] sm:rounded-[32px] sm:p-9 lg:p-12'>
                {/* Header */}
                <header className='flex items-center gap-4'>
                    <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#232c35] to-[#080e16] shadow-lg sm:h-16 sm:w-16'>
                        <FileText className='h-6 w-6 text-[#9ccbeb]' strokeWidth={1.7} />
                    </div>

                    <div className='min-w-0'>
                        <p className='text-xl font-bold tracking-tight text-white sm:text-2xl'>{document.title}</p>

                        <p className='mt-1 text-xs text-[#92a0af] sm:text-sm'>Review and manage your document</p>
                    </div>
                </header>

                {/* Tabs */}
                <div
                    role='tablist'
                    aria-label='Document sections'
                    className='mt-6 grid grid-cols-2 rounded-full border border-[#1c2c41] bg-[#081527] p-1 sm:mt-8'
                >
                    {(['summary', 'full'] as const).map((item) => (
                        <button
                            key={item}
                            type='button'
                            role='tab'
                            aria-selected={tab === item}
                            onClick={() => setTab(item)}
                            className={`rounded-full px-2 py-3 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:text-xs ${
                                tab === item
                                    ? 'border border-[#294863] bg-gradient-to-b from-[#161d26] to-[#070c14] text-white shadow-md'
                                    : 'border border-transparent text-[#92a0b4] hover:text-white'
                            }`}
                        >
                            {item === 'summary' ? 'Summary' : 'Full Document'}
                        </button>
                    ))}
                </div>

                <div className='my-7 h-px bg-[#22364b]/75' />

                {/* Loading */}
                {loading ? (
                    <div role='status' className='flex min-h-44 items-center justify-center gap-3 text-[#a4b7ca]'>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        Loading document...
                    </div>
                ) : error ? (
                    <div role='alert' className='rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-200'>
                        {error}
                    </div>
                ) : !record ? (
                    <p className='py-8 text-[#9caabb]'>This document has not been published yet.</p>
                ) : (
                    <div role='tabpanel'>
                        {/* Summary Tab */}
                        {tab === 'summary' ? (
                            <>
                                <h1 className='text-2xl font-light tracking-tight text-white sm:text-3xl'>Document Summary</h1>

                                {hasSummary ? (
                                    <div className='legal-rich-text legal-rich-text--summary mt-5'>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{record.summary ?? ''}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className='mt-5 text-sm leading-7 text-[#91a2b3]'>
                                        A summary has not been added for this document yet. You can still read the full document.
                                    </p>
                                )}

                                {hasContent && (
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setTab('full');
                                            window.scrollTo({
                                                top: 0,
                                                behavior: 'smooth',
                                            });
                                        }}
                                        className='mt-9 flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-[#305d83] bg-gradient-to-b from-[#19212a] to-[#090d14] px-6 text-sm font-medium shadow-[0_8px_24px_rgba(0,0,0,.3)] transition hover:border-[#5b92b8] hover:bg-[#142438]'
                                    >
                                        View Full Document
                                        <ArrowUpRight className='h-4 w-4' />
                                    </button>
                                )}
                            </>
                        ) : (
                            /* Full Document Tab */
                            <>
                                <h1 className='text-2xl font-light tracking-tight text-white sm:text-3xl'>Full Document</h1>

                                {hasContent ? (
                                    <div className='legal-rich-text legal-rich-text--document mt-6'>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{record.content ?? ''}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className='mt-5 text-sm text-[#91a2b3]'>The full document has not been added yet.</p>
                                )}

                                {hasSummary && (
                                    <button
                                        type='button'
                                        onClick={() => setTab('summary')}
                                        className='mt-10 rounded-full border border-[#305d83] px-6 py-3 text-sm text-white transition hover:bg-white/5'
                                    >
                                        Back to Summary
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
