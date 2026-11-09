import { getLegalRecord, type LegalDefinition, type LegalRecord } from '@/lib/legal-documents';
import { ArrowUpRight, FileText, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Tab = 'summary' | 'full';

export default function LegalDocumentPage({ document }: { document: LegalDefinition }) {
    const [record, setRecord] = useState<LegalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('summary');

    const contentRef = useRef<HTMLDivElement>(null);

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

    const changeTab = (nextTab: Tab) => {
        setTab(nextTab);

        // Scroll only the document content, not the page.
        contentRef.current?.scrollTo({
            top: 0,
            behavior: 'instant',
        });
    };

    return (
        <>
            <main className='flex h-[calc(100dvh-64px)] min-h-0 items-center justify-center overflow-hidden bg-[#05080d] px-3 py-3 text-white sm:h-[100dvh] sm:px-6 sm:py-8 lg:py-10'>
                <section className='mx-auto flex h-full max-h-[780px] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-[26px] border border-[#1d3551] bg-[linear-gradient(135deg,#0e2033_0%,#091525_55%,#0a1421_100%)] p-4 shadow-[0_15px_55px_rgba(0,0,0,.35)] sm:rounded-[32px] sm:p-9 lg:p-12'>
                    {/* Header */}
                    <header className='flex shrink-0 items-center gap-3 sm:gap-4'>
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#232c35] to-[#080e16] shadow-lg sm:h-16 sm:w-16'>
                            <FileText className='h-5 w-5 text-[#9ccbeb] sm:h-6 sm:w-6' strokeWidth={1.7} />
                        </div>

                        <div className='min-w-0'>
                            <p className='text-lg font-bold tracking-tight text-white sm:text-2xl'>{document.title}</p>

                            <p className='mt-1 text-xs text-[#92a0af] sm:text-sm'>Review and manage your document</p>
                        </div>
                    </header>

                    {/* Tabs */}
                    <div
                        role='tablist'
                        aria-label='Document sections'
                        className='mt-4 grid shrink-0 grid-cols-2 rounded-full border border-[#1c2c41] bg-[#081527] p-1 sm:mt-8'
                    >
                        {(['summary', 'full'] as const).map((item) => (
                            <button
                                key={item}
                                type='button'
                                role='tab'
                                aria-selected={tab === item}
                                onClick={() => changeTab(item)}
                                className={`rounded-full px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:py-3 sm:text-xs ${
                                    tab === item
                                        ? 'border border-[#294863] bg-gradient-to-b from-[#161d26] to-[#070c14] text-white shadow-md'
                                        : 'border border-transparent text-[#92a0b4] hover:text-white'
                                }`}
                            >
                                {item === 'summary' ? 'Summary' : 'Full Document'}
                            </button>
                        ))}
                    </div>

                    <div className='my-4 h-px shrink-0 bg-[#22364b]/75 sm:my-7' />

                    {/* Scrollable Document Content */}
                    <div
                        ref={contentRef}
                        role='region'
                        aria-label='Legal document content'
                        tabIndex={0}
                        className='legal-document-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 sm:pr-3'
                    >
                        {loading ? (
                            <div role='status' className='flex min-h-32 items-center justify-center gap-3 text-[#a4b7ca] sm:min-h-44'>
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
                                {tab === 'summary' ? (
                                    <>
                                        <h1 className='text-xl font-light tracking-tight text-white sm:text-3xl'>Document Summary</h1>

                                        {hasSummary ? (
                                            <div className='legal-rich-text legal-rich-text--summary mt-4 sm:mt-5'>
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
                                                onClick={() => changeTab('full')}
                                                className='mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#305d83] bg-gradient-to-b from-[#19212a] to-[#090d14] px-6 text-sm font-medium shadow-[0_8px_24px_rgba(0,0,0,.3)] transition hover:border-[#5b92b8] hover:bg-[#142438] sm:mt-9 sm:min-h-14'
                                            >
                                                View Full Document
                                                <ArrowUpRight className='h-4 w-4' />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h1 className='text-xl font-light tracking-tight text-white sm:text-3xl'>Full Document</h1>

                                        {hasContent ? (
                                            <div className='legal-rich-text legal-rich-text--document mt-4 sm:mt-6'>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{record.content ?? ''}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className='mt-5 text-sm text-[#91a2b3]'>The full document has not been added yet.</p>
                                        )}

                                        {hasSummary && (
                                            <button
                                                type='button'
                                                onClick={() => changeTab('summary')}
                                                className='mt-7 rounded-full border border-[#305d83] px-6 py-3 text-sm text-white transition hover:bg-white/5 sm:mt-10'
                                            >
                                                Back to Summary
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Custom Thin Dark Scrollbar */}
            <style jsx global>{`
                .legal-document-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(91, 125, 155, 0.45) transparent;
                    scroll-behavior: smooth;
                }

                .legal-document-scroll::-webkit-scrollbar {
                    width: 5px;
                }

                .legal-document-scroll::-webkit-scrollbar-track {
                    background: rgba(8, 18, 30, 0.35);
                    border-radius: 20px;
                }

                .legal-document-scroll::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(85, 124, 160, 0.38), rgba(44, 76, 109, 0.6), rgba(85, 124, 160, 0.38));

                    border-radius: 20px;

                    box-shadow: 0 0 6px rgba(80, 132, 180, 0.18), 0 0 12px rgba(50, 96, 140, 0.12);
                }

                .legal-document-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(108, 153, 191, 0.7);

                    box-shadow: 0 0 8px rgba(90, 145, 195, 0.3);
                }

                .legal-document-scroll::-webkit-scrollbar-corner {
                    background: transparent;
                }
            `}</style>
        </>
    );
}
