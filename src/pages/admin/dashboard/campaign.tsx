import { AlertCircle, Calendar, CheckCircle2, ChevronDown, Info, Loader2, Lock, Mail, Plus, Send, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type EmailUser = {
    id: number;
    email: string;
    fullName: string | null;
    emailUserCSVId: number | null;
    emailUserCSV?: { id: number; name: string };
};

export default function SalesCampaignPage() {
    const [emailUsers, setEmailUsers] = useState<EmailUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Result modal (success/error)
    const [resultModal, setResultModal] = useState<{
        open: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ open: false, type: 'success', title: '', message: '' });

    // Campaign form
    const [formData, setFormData] = useState({
        fromName: '',
        subject: '',
        runAt: '', // datetime-local string
        selectedUsers: [] as number[],
    });
    const [formErrors, setFormErrors] = useState<any>({});

    // Multiple emails (max 5)
    const [emails, setEmails] = useState<string[]>(['']);

    // Collapsible groups (manual + csv lists)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ manual: true });

    // Credentials gate
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCredentialsOk, setHasCredentialsOk] = useState<boolean>(false);

    const [credentialsData, setCredentialsData] = useState<{ email: string; appPassword: string }>({
        email: '',
        appPassword: '',
    });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});

    useEffect(() => {
        (async () => {
            const ok = await checkMarketingCredentials();
            setHasCredentialsOk(ok);
            if (ok) {
                fetchEmailUsers();
            } else {
                setLoading(false); // don't leave spinner if gated
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchEmailUsers = async () => {
        try {
            setLoading(true);
            const id = Number(localStorage.getItem('adminId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }
            const response = await fetch(`/api/v2/email-users?authId=${id}`);
            if (!response.ok) throw new Error('Failed to fetch email users');

            const data = await response.json();
            const usersRaw: EmailUser[] = Array.isArray(data.emailUser) ? data.emailUser : data.emailUser ? [data.emailUser] : [];

            const users = usersRaw.map((u) => ({
                ...u,
                fullName: (u.fullName && u.fullName.trim()) || (u.email ? u.email.split('@')[0] : ''),
            }));

            setEmailUsers(users);

            // open csv groups by default
            const flags: Record<string, boolean> = {};
            users.forEach((u) => {
                if (u.emailUserCSV?.id) flags[`csv-${u.emailUserCSV.id}`] = true;
            });
            setExpanded((prev) => ({ ...prev, ...flags }));
        } catch (e: any) {
            // show as modal
            setResultModal({
                open: true,
                type: 'error',
                title: 'Failed to Load Users',
                message: e?.message || 'Something went wrong while fetching users.',
            });
        } finally {
            setLoading(false);
        }
    };

    // ---------- Grouping & selection ----------
    const groups = useMemo(() => {
        const manual = emailUsers.filter((u) => !u.emailUserCSVId);
        const map = new Map<number, { id: number; name: string; users: EmailUser[] }>();
        emailUsers.forEach((u) => {
            if (u.emailUserCSVId && u.emailUserCSV) {
                const key = u.emailUserCSV.id;
                if (!map.has(key)) map.set(key, { id: key, name: u.emailUserCSV.name, users: [] });
                map.get(key)!.users.push(u);
            }
        });
        const csvGroups = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
        return { manual, csvGroups, totalCount: emailUsers.length };
    }, [emailUsers]);

    const allIds = useMemo(() => emailUsers.map((u) => u.id), [emailUsers]);
    const isAllSelected = formData.selectedUsers.length > 0 && formData.selectedUsers.length === allIds.length;

    const toggleExpanded = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

    const toggleSelectAll = () => {
        setFormData((prev) => ({
            ...prev,
            selectedUsers: isAllSelected ? [] : allIds,
        }));
        if (formErrors.selectedUsers) setFormErrors((p: any) => ({ ...p, selectedUsers: '' }));
    };

    const groupChecked = (ids: number[]) => ids.length > 0 && ids.every((id) => formData.selectedUsers.includes(id));

    const toggleGroup = (ids: number[]) => {
        const allChecked = groupChecked(ids);
        setFormData((prev) => {
            if (allChecked) {
                return { ...prev, selectedUsers: prev.selectedUsers.filter((id) => !ids.includes(id)) };
            }
            const set = new Set(prev.selectedUsers.concat(ids));
            return { ...prev, selectedUsers: Array.from(set) };
        });
        if (formErrors.selectedUsers) setFormErrors((p: any) => ({ ...p, selectedUsers: '' }));
    };

    const toggleUser = (id: number) => {
        setFormData((prev) => ({
            ...prev,
            selectedUsers: prev.selectedUsers.includes(id) ? prev.selectedUsers.filter((x) => x !== id) : [...prev.selectedUsers, id],
        }));
        if (formErrors.selectedUsers) setFormErrors((p: any) => ({ ...p, selectedUsers: '' }));
    };

    // ---------- Credentials: Check + Save ----------
    const checkMarketingCredentials = async (): Promise<boolean> => {
        try {
            setCheckingCredentials(true);
            setIsLoading(true);

            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return false;
            }

            const response = await fetch(`/api/v2/marketingCredentials?adminId=${adminId}`);
            if (!response.ok) {
                setShowCredentialsModal(true);
                return false;
            }

            const data = await response.json();
            const ok =
                data &&
                data.policy &&
                typeof data.policy.email === 'string' &&
                data.policy.email.trim() &&
                typeof data.policy.appPassword === 'string' &&
                data.policy.appPassword.trim();

            setShowCredentialsModal(!ok);
            return !!ok;
        } catch {
            setShowCredentialsModal(true);
            return false;
        } finally {
            setIsLoading(false);
            setCheckingCredentials(false);
        }
    };

    const validateCredentialsForm = () => {
        const errs: { email?: string; appPassword?: string } = {};
        const email = credentialsData.email.trim();
        const appPassword = credentialsData.appPassword.trim();

        if (!email) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errs.email = 'Invalid email format';
        }

        const noSpacePattern = /^[a-zA-Z0-9]{16,}$/;
        const groupedPattern = /^[a-zA-Z0-9]{4}(?:\s[a-zA-Z0-9]{4}){3}$/;

        if (!appPassword) {
            errs.appPassword = 'App password is required';
        } else if (!(noSpacePattern.test(appPassword) || groupedPattern.test(appPassword))) {
            errs.appPassword = 'Use a valid app password format (16+ chars or 4×4 groups)';
        }

        setCredentialsErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCredentialsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentialsData((prev) => ({ ...prev, [name]: value }));
        if (credentialsErrors[name as keyof typeof credentialsErrors]) {
            setCredentialsErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCredentialsSubmit = async () => {
        if (!validateCredentialsForm()) return;

        try {
            setSubmitting(true);
            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/v2/marketingCredentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: adminId,
                    email: credentialsData.email.trim(),
                    appPassword: credentialsData.appPassword.trim(),
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to save credentials');
            }

            setHasCredentialsOk(true);
            setShowCredentialsModal(false);
            if (!emailUsers.length) fetchEmailUsers();

            setResultModal({
                open: true,
                type: 'success',
                title: 'Credentials Saved',
                message: 'Your email credentials have been saved successfully.',
            });
        } catch (e: any) {
            setResultModal({
                open: true,
                type: 'error',
                title: 'Credentials Error',
                message: e?.message || 'Failed to save credentials.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- Helpers ----------
    const handleBasicInput = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if ((formErrors as any)[name]) setFormErrors((prev: any) => ({ ...prev, [name]: '' }));
    };

    const pad2 = (n: number) => String(n).padStart(2, '0');

    // Accepts a Date and returns `YYYY-MM-DDTHH:mm:ss.000+HH:MM`
    const formatDateObjForAPI = (date: Date) => {
        const offset = -date.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const oh = Math.floor(Math.abs(offset) / 60);
        const om = Math.abs(offset) % 60;
        return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
            date.getSeconds()
        )}.000${sign}${pad2(oh)}:${pad2(om)}`;
    };

    // ---------- Multiple Emails UI ----------
    const addEmail = () => {
        if (emails.length >= 5) return;
        setEmails((prev) => [...prev, '']);
    };

    const removeEmail = (idx: number) => {
        setEmails((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateEmail = (idx: number, val: string) => {
        setEmails((prev) => prev.map((v, i) => (i === idx ? val : v)));
    };

    // ---------- Validation & Submit ----------
    const validateForm = () => {
        const errors: any = {};

        if (!formData.fromName.trim()) errors.fromName = 'From name is required';
        if (!formData.subject.trim()) errors.subject = 'Subject is required';

        const nonEmptyEmails = emails.map((e) => e.trim()).filter((e) => e.length > 0);
        if (nonEmptyEmails.length === 0) errors.emails = 'Please write at least one email message';

        if (formData.selectedUsers.length === 0) errors.selectedUsers = 'Please select at least one recipient';

        if (!formData.runAt) {
            errors.runAt = 'Please select a date and time';
        } else {
            const selectedDate = new Date(formData.runAt);
            const now = new Date();
            if (selectedDate < now) errors.runAt = 'Please select a future date and time';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        // Do NOT hit credentials API here. If creds missing, open modal and stop.
        if (!hasCredentialsOk) {
            setShowCredentialsModal(true);
            return;
        }

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const recipients = formData.selectedUsers.slice();
            const messageBodies = emails.map((e) => e.trim()).filter((e) => e.length > 0);

            // Base time from input (datetime-local is local time)
            const base = new Date(formData.runAt);

            // B) One-time scheduled to many (no repeat)
            // Create one item per message, same recipients; nudge runAt +1s per item to avoid backend dedupe
            const items = messageBodies.map((text, idx) => {
                const dt = new Date(base.getTime() + idx * 1000);
                return {
                    recipients,
                    subject: formData.subject.trim(),
                    text,
                    runAt: formatDateObjForAPI(dt),
                    repeated: false,
                };
            });

            const payload = { adminId, items };

            // NOTE: match your spec endpoint exactly
            const response = await fetch('/api/v2/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create campaign');
            }

            // Success modal
            setResultModal({
                open: true,
                type: 'success',
                title: 'Campaign Scheduled',
                message: `Your campaign has been scheduled for ${new Date(formData.runAt).toLocaleString()}.`,
            });

            // Reset form (keep users loaded and group expanded state)
            setFormData({
                fromName: '',
                subject: '',
                runAt: '',
                selectedUsers: [],
            });
            setEmails(['']);
        } catch (e: any) {
            setResultModal({
                open: true,
                type: 'error',
                title: 'Campaign Error',
                message: e?.message || 'Something went wrong while creating the campaign.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || checkingCredentials || isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='dot-spinner'>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                    <div className='dot-spinner__dot'></div>
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-4xl mx-auto rounded-xl overflow-hidden'>
            {/* Header */}
            <div className='bg-gradient-to-r from-slate-800 to-slate-700 p-8'>
                <div className='flex items-center gap-4'>
                    <div className='w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center'>
                        <Mail className='w-8 h-8 text-slate-700' />
                    </div>
                    <div>
                        <h1 className='text-3xl font-bold text-white mb-1'>Create Email Campaign</h1>
                        <p className='text-slate-100'>Schedule and send email campaigns to your users</p>
                    </div>
                </div>
            </div>

            <div className='bg-white shadow-lg border border-slate-200 p-8 space-y-6'>
                {/* From Name */}
                <div>
                    <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                        <Mail className='w-4 h-4' />
                        From Name
                    </label>
                    <input
                        type='text'
                        name='fromName'
                        value={formData.fromName}
                        onChange={handleBasicInput}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.fromName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                        placeholder='e.g., Demo Store, Your Company'
                        disabled={submitting}
                    />
                    {formErrors.fromName && <p className='text-red-600 text-sm mt-1'>{formErrors.fromName}</p>}
                </div>

                {/* Subject */}
                <div>
                    <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                        <Mail className='w-4 h-4' />
                        Email Subject
                    </label>
                    <input
                        type='text'
                        name='subject'
                        value={formData.subject}
                        onChange={handleBasicInput}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.subject ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                        placeholder='e.g., Your report'
                        disabled={submitting}
                    />
                    {formErrors.subject && <p className='text-red-600 text-sm mt-1'>{formErrors.subject}</p>}
                </div>

                {/* Multiple Emails (max 5) */}
                <div>
                    <div className='flex items-center justify-between mb-2'>
                        <label className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
                            <Mail className='w-4 h-4' />
                            Email Message(s)
                        </label>
                        <button
                            type='button'
                            onClick={addEmail}
                            disabled={submitting || emails.length >= 5}
                            className='inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50'
                        >
                            <Plus className='w-4 h-4' />
                            Add another (max 5)
                        </button>
                    </div>

                    <div className='space-y-4'>
                        {emails.map((val, idx) => (
                            <div key={idx} className='relative'>
                                <label className='block text-xs font-semibold text-slate-600 mb-1'>Email #{idx + 1}</label>
                                <textarea
                                    value={val}
                                    onChange={(e) => updateEmail(idx, e.target.value)}
                                    rows={5}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.emails ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all resize-none`}
                                    placeholder='Write your email message here...'
                                    disabled={submitting}
                                />
                                {emails.length > 1 && (
                                    <button
                                        type='button'
                                        onClick={() => removeEmail(idx)}
                                        disabled={submitting}
                                        className='absolute top-6 right-2 text-slate-500 hover:text-red-600'
                                        title='Remove this email'
                                    >
                                        <Trash2 className='w-5 h-5' />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {formErrors.emails && <p className='text-red-600 text-sm mt-1'>{formErrors.emails}</p>}
                </div>

                {/* Schedule */}
                <div>
                    <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                        <Calendar className='w-4 h-4' />
                        Schedule Date & Time
                    </label>
                    <input
                        type='datetime-local'
                        name='runAt'
                        value={formData.runAt}
                        onChange={handleBasicInput}
                        className={`w-full px-4 py-3 rounded-lg border ${
                            formErrors.runAt ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                        disabled={submitting}
                    />
                    {formErrors.runAt && <p className='text-red-600 text-sm mt-1'>{formErrors.runAt}</p>}
                </div>

                {/* Recipients grouped (manual + each CSV) */}
                <div>
                    <div className='flex items-center justify-between mb-3'>
                        <label className='flex items-center gap-2 text-sm font-semibold text-slate-700'>
                            <Users className='w-4 h-4' />
                            Select Recipients ({formData.selectedUsers.length} selected)
                        </label>
                        <button
                            type='button'
                            onClick={toggleSelectAll}
                            className='text-sm text-slate-700 hover:text-slate-800 font-medium'
                            disabled={submitting || emailUsers.length === 0}
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {emailUsers.length === 0 ? (
                        <div className='border border-slate-200 rounded-lg p-6 text-center'>
                            <Users className='w-12 h-12 text-slate-300 mx-auto mb-2' />
                            <p className='text-slate-600'>No email users found</p>
                            <p className='text-slate-500 text-sm'>Please add email users first</p>
                        </div>
                    ) : (
                        <div className={`border ${formErrors.selectedUsers ? 'border-red-300 bg-red-50' : 'border-slate-300'} rounded-lg divide-y`}>
                            {/* Manual group */}
                            <div className='p-4'>
                                <div className='flex items-center justify-between mb-2'>
                                    <button
                                        type='button'
                                        onClick={() => toggleExpanded('manual')}
                                        className='flex items-center gap-2 font-semibold text-slate-800'
                                    >
                                        <ChevronDown className={`w-5 h-5 transition-transform ${expanded.manual ? 'rotate-0' : '-rotate-90'}`} />
                                        Manually created users
                                        <span className='text-slate-500 font-normal'>({groups.manual.length})</span>
                                    </button>

                                    <label className='inline-flex items-center gap-2 text-sm'>
                                        <input
                                            type='checkbox'
                                            className='w-5 h-5'
                                            checked={groups.manual.length > 0 && groups.manual.every((u) => formData.selectedUsers.includes(u.id))}
                                            onChange={() => toggleGroup(groups.manual.map((u) => u.id))}
                                            disabled={submitting}
                                        />
                                        <span>Select group</span>
                                    </label>
                                </div>

                                {expanded.manual && (
                                    <>
                                        {groups.manual.length === 0 ? (
                                            <p className='text-slate-500 text-sm'>No manual users</p>
                                        ) : (
                                            <div className='grid md:grid-cols-2 gap-2'>
                                                {groups.manual.map((u) => (
                                                    <label
                                                        key={u.id}
                                                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors'
                                                    >
                                                        <input
                                                            type='checkbox'
                                                            checked={formData.selectedUsers.includes(u.id)}
                                                            onChange={() => toggleUser(u.id)}
                                                            className='w-5 h-5 text-slate-600 rounded focus:ring-2 focus:ring-slate-500'
                                                            disabled={submitting}
                                                        />
                                                        <div className='flex-1'>
                                                            <p className='font-medium text-slate-800'>{u.fullName || '—'}</p>
                                                            <p className='text-sm text-slate-500'>{u.email}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* CSV groups */}
                            {groups.csvGroups.map((g) => {
                                const key = `csv-${g.id}`;
                                return (
                                    <div key={g.id} className='p-4'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <button
                                                type='button'
                                                onClick={() => toggleExpanded(key)}
                                                className='flex items-center gap-2 font-semibold text-slate-800'
                                            >
                                                <ChevronDown className={`w-5 h-5 transition-transform ${expanded[key] ? 'rotate-0' : '-rotate-90'}`} />
                                                {g.name}
                                                <span className='text-slate-500 font-normal'>({g.users.length})</span>
                                            </button>

                                            <label className='inline-flex items-center gap-2 text-sm'>
                                                <input
                                                    type='checkbox'
                                                    className='w-5 h-5'
                                                    checked={g.users.length > 0 && g.users.every((u) => formData.selectedUsers.includes(u.id))}
                                                    onChange={() => toggleGroup(g.users.map((u) => u.id))}
                                                    disabled={submitting}
                                                />
                                                <span>Select list</span>
                                            </label>
                                        </div>

                                        {expanded[key] && (
                                            <div className='grid md:grid-cols-2 gap-2'>
                                                {g.users.map((u) => (
                                                    <label
                                                        key={u.id}
                                                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors'
                                                    >
                                                        <input
                                                            type='checkbox'
                                                            checked={formData.selectedUsers.includes(u.id)}
                                                            onChange={() => toggleUser(u.id)}
                                                            className='w-5 h-5 text-slate-600 rounded focus:ring-2 focus:ring-slate-500'
                                                            disabled={submitting}
                                                        />
                                                        <div className='flex-1'>
                                                            <p className='font-medium text-slate-800'>{u.fullName || '—'}</p>
                                                            <p className='text-sm text-slate-500'>{u.email}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {formErrors.selectedUsers && <p className='text-red-600 text-sm mt-1'>{formErrors.selectedUsers}</p>}
                </div>

                <div className='pt-2'>
                    <button
                        type='button'
                        onClick={handleSubmit}
                        disabled={submitting || emailUsers.length === 0}
                        className='w-full px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg font-semibold hover:from-slate-700 hover:to-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer'
                    >
                        {submitting ? (
                            <>
                                <Loader2 className='w-5 h-5 animate-spin' />
                                Creating Schedule Campaign...
                            </>
                        ) : (
                            <>
                                <Send className='w-5 h-5' />
                                Create &amp; Schedule Campaign
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Result Modal (success/error) */}
            {resultModal.open && (
                <div className='fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'>
                        <div className={`p-4 ${resultModal.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center justify-between`}>
                            <div className='flex items-center gap-2'>
                                {resultModal.type === 'success' ? <CheckCircle2 className='w-6 h-6' /> : <AlertCircle className='w-6 h-6' />}
                                <h3 className='text-lg font-semibold'>{resultModal.title}</h3>
                            </div>
                            <button onClick={() => setResultModal((p) => ({ ...p, open: false }))}>
                                <X className='w-6 h-6 text-white/90 hover:text-white' />
                            </button>
                        </div>
                        <div className='p-6'>
                            <p className='text-slate-800'>{resultModal.message}</p>
                            <div className='mt-6 text-right'>
                                <button
                                    className={`px-4 py-2 rounded-lg font-semibold ${
                                        resultModal.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                    onClick={() => setResultModal((p) => ({ ...p, open: false }))}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Credentials Modal Gate */}
            {showCredentialsModal && (
                <div className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden'>
                        <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6'>
                            <div className='flex items-center gap-3'>
                                <ShieldCheck className='w-8 h-8 text-white' />
                                <div>
                                    <h2 className='text-2xl font-bold text-white'>Email Credentials Required</h2>
                                    <p className='text-blue-100 text-sm'>Setup required to send marketing emails</p>
                                </div>
                            </div>
                        </div>

                        <div className='p-6 space-y-5'>
                            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                                <div className='flex items-start gap-3'>
                                    <Info className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                                    <div>
                                        <p className='text-blue-900 font-medium mb-1'>Why we need this</p>
                                        <p className='text-blue-800 text-sm'>
                                            We need your email app password to send marketing campaigns from your account. This ensures emails are sent directly
                                            from your email address.
                                        </p>
                                        <p className='text-blue-800 text-sm mt-2'>
                                            <strong>Note:</strong> An app password is different from your regular email password. Generate one from your email
                                            provider&apos;s security settings.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor='email' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                                    <Mail className='w-4 h-4' />
                                    Email Address
                                </label>
                                <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    value={credentialsData.email}
                                    onChange={handleCredentialsInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        credentialsErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder='your.email@gmail.com'
                                />
                                {credentialsErrors.email && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor='appPassword' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                                    <Lock className='w-4 h-4' />
                                    App Password
                                </label>
                                <input
                                    type='text'
                                    id='appPassword'
                                    name='appPassword'
                                    value={credentialsData.appPassword}
                                    onChange={handleCredentialsInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        credentialsErrors.appPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono`}
                                    placeholder='xbsr gbiv sizp twwe'
                                />
                                {credentialsErrors.appPassword && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.appPassword}</p>}
                                <p className='text-slate-500 text-xs mt-1'>Enter the app password exactly as provided by your email provider</p>
                            </div>

                            <div className='pt-2 flex gap-2'>
                                <button
                                    type='button'
                                    onClick={handleCredentialsSubmit}
                                    disabled={submitting}
                                    className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl'
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className='w-5 h-5 animate-spin' />
                                            Saving Credentials...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className='w-5 h-5' />
                                            Save &amp; Continue
                                        </>
                                    )}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setShowCredentialsModal(false)}
                                    className='px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors'
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className='bg-slate-50 rounded-lg p-4 text-center'>
                                <p className='text-slate-600 text-xs'>
                                    Your credentials are securely stored and encrypted. We never share your information with third parties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
