import { getLegalRecord, legalDocuments, saveLegalRecord, type LegalRecord } from '@/lib/legal-documents';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LegalDocumentsAdmin() {
    const [selected, setSelected] = useState<number>(0);
    const [record, setRecord] = useState<LegalRecord | null>(null);
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const document = legalDocuments[selected];

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError('');
        setNotice('');
        setRecord(null);
        setContent('');
        setSummary('');

        getLegalRecord(document.endpoint, controller.signal)
            .then((item) => {
                if (controller.signal.aborted) return;

                setRecord(item);
                setContent(item?.content ?? '');
                setSummary(item?.summary ?? '');
            })
            .catch((err: unknown) => {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Unable to load document.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [document.endpoint]);

    async function save() {
        if (loading || saving || error) return;

        if (!content.trim()) {
            setError('Full document content is required.');
            return;
        }

        setSaving(true);
        setNotice('');

        try {
            await saveLegalRecord(document.endpoint, record?.id ?? null, content, summary);

            // Fetch the latest record to get its actual database ID.
            const fresh = await getLegalRecord(document.endpoint);

            if (!fresh) {
                throw new Error('Saved, but the record was not returned by GET. Please reload.');
            }

            setRecord(fresh);
            setContent(fresh.content ?? '');
            setSummary(fresh.summary ?? '');
            setError('');
            setNotice('Document saved successfully.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Could not save document.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className='min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#1f2937] sm:px-8 lg:py-12'>
            <div className='mx-auto max-w-6xl'>
                {/* Page Header */}
                <div className='mb-7'>
                    <h1 className='text-2xl font-semibold sm:text-3xl'>Legal Documents</h1>

                    <p className='mt-2 text-sm text-slate-500'>Manage the summary and full content of all ten legal pages. Use Markdown for formatting.</p>
                </div>

                <div className='grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]'>
                    {/* Sidebar */}
                    <nav aria-label='Legal documents' className='rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-sm lg:self-start'>
                        {legalDocuments.map((item, index) => (
                            <button
                                key={item.endpoint}
                                type='button'
                                disabled={saving}
                                onClick={() => setSelected(index)}
                                className={`block w-full rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                                    selected === index ? 'bg-[#eaf2fc] font-semibold text-[#1e5180]' : 'text-slate-600 hover:bg-[#f5f8fc] hover:text-[#1e5180]'
                                }`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </nav>

                    {/* Editor Card */}
                    <section className='min-w-0 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-7'>
                        {/* Document Header */}
                        <div className='flex flex-wrap items-start justify-between gap-3 border-b border-[#e8edf3] pb-5'>
                            <div>
                                <h2 className='text-xl font-semibold text-[#1f2937]'>{document.title}</h2>

                                <p className='mt-1 text-xs text-slate-500'>
                                    {record
                                        ? `Existing record · ID ${record.id} · PUT on save`
                                        : loading
                                        ? 'Loading...'
                                        : error
                                        ? 'Unable to determine record status'
                                        : 'No record yet · POST on save'}
                                </p>
                            </div>

                            <Link
                                href={`/${document.slug}`}
                                target='_blank'
                                className='rounded-full border border-[#d8e3ed] px-4 py-2 text-xs font-medium text-[#28587e] transition hover:bg-[#f0f6fc]'
                            >
                                View Public Page ↗
                            </Link>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className='flex min-h-48 items-center justify-center gap-2 text-slate-500'>
                                <Loader2 className='h-5 w-5 animate-spin' />
                                Loading...
                            </div>
                        ) : (
                            <div className='mt-6 space-y-6'>
                                {/* Summary Editor */}
                                <div>
                                    <label htmlFor='legal-summary' className='mb-2 block text-sm font-medium text-[#263548]'>
                                        Document Summary
                                    </label>

                                    <p className='mb-3 text-xs text-slate-500'>
                                        Displayed under the Summary tab. Separate paragraphs with blank lines; use - for checklist items.
                                    </p>

                                    <textarea
                                        id='legal-summary'
                                        value={summary}
                                        onChange={(e) => {
                                            setSummary(e.target.value);
                                            setError('');
                                            setNotice('');
                                        }}
                                        disabled={saving}
                                        placeholder={
                                            'A quick overview of this document.\n\n' +
                                            '- Review key terms and conditions\n' +
                                            '- See important dates and parties'
                                        }
                                        className='min-h-48 w-full resize-y rounded-xl border border-[#d8e2ed] bg-[#fcfdff] p-4 text-sm leading-7 text-[#263548] outline-none placeholder:text-slate-400 focus:border-[#467eab] focus:ring-2 focus:ring-[#467eab]/10 disabled:opacity-60'
                                    />
                                </div>

                                {/* Full Document Editor */}
                                <div>
                                    <label htmlFor='legal-content' className='mb-2 block text-sm font-medium text-[#263548]'>
                                        Full Document
                                    </label>

                                    <p className='mb-3 text-xs text-slate-500'>
                                        Use Markdown headings (## Section), **bold**, and lists. Plain paragraphs also work.
                                    </p>

                                    <textarea
                                        id='legal-content'
                                        value={content}
                                        onChange={(e) => {
                                            setContent(e.target.value);
                                            setError('');
                                            setNotice('');
                                        }}
                                        disabled={saving}
                                        placeholder={'Last Updated: October 9, 2026\n\n' + '## 1. Introduction\n\n' + 'Write your legal content here...'}
                                        className='min-h-[420px] w-full resize-y rounded-xl border border-[#d8e2ed] bg-[#fcfdff] p-4 font-mono text-sm leading-7 text-[#263548] outline-none placeholder:text-slate-400 focus:border-[#467eab] focus:ring-2 focus:ring-[#467eab]/10 disabled:opacity-60'
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <p role='alert' className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                                        {error}
                                    </p>
                                )}

                                {/* Success Message */}
                                {notice && (
                                    <p role='status' className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
                                        {notice}
                                    </p>
                                )}

                                {/* Save Action */}
                                <div className='flex justify-end'>
                                    <button
                                        type='button'
                                        // eslint-disable-next-line
                                        onClick={save}
                                        disabled={saving || loading || Boolean(error && error !== 'Full document content is required.')}
                                        className='inline-flex items-center gap-2 rounded-full border border-[#234d70] bg-[#285b82] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#1e496c] disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                        {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}

                                        {saving ? 'Saving...' : record ? 'Update Document' : 'Create Document'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
