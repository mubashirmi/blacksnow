import { AlertCircle, Calendar, CheckCircle, ChevronDown, Clock, Info, Loader2, Lock, Mail, Plus, Send, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

type ScheduleMode = 'weekdays' | 'weeklyRotation' | 'intervalRotation';

type EmailUser = {
    id: number;
    email: string;
    fullName: string | null;
    emailUserCSVId: number | null;
    emailUserCSV?: { id: number; name: string };
    createdAt?: string;
};

export default function Automation() {
    const [users, setUsers] = useState<EmailUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // field-level validation errors
    const [formErrors, setFormErrors] = useState<any>({});

    // Credentials gate
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // for credentials flow spinners
    const [credentialsData, setCredentialsData] = useState<{ email: string; appPassword: string }>({
        email: '',
        appPassword: '',
    });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});

    // Feedback modal (success/error)
    const [feedbackModal, setFeedbackModal] = useState<{
        open: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ open: false, type: 'success', title: '', message: '' });

    // Core form
    const [subject, setSubject] = useState('');
    const [fromName, setFromName] = useState('');
    const [emails, setEmails] = useState<string[]>(['']); // 1..5
    const MAX_EMAILS = 5;

    // Recipient selection
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    // Collapsible groups state
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ manual: true });

    // Scheduling mode
    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('weekdays');

    // Weekdays mode
    const [runAtDate, setRunAtDate] = useState('');
    const [runAtTime, setRunAtTime] = useState('');
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]); // 0..6 (Sun..Sat)

    // Weekly rotation
    const [rotationDayOfWeek, setRotationDayOfWeek] = useState<number | ''>('');
    const [rotationTime, setRotationTime] = useState<string>('09:00');

    // Interval rotation (in days/hours)
    const [intervalDays, setIntervalDays] = useState<string>('2');
    const [intervalHours, setIntervalHours] = useState<string>('0');

    useEffect(() => {
        (async () => {
            const ok = await checkMarketingCredentials();
            if (ok) {
                fetchUsers();
            } else {
                setLoading(false); // don't leave page spinner if gated by credentials
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const id = Number(localStorage.getItem('adminId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }
            const response = await fetch(`/api/v2/email-users?authId=${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            const list: EmailUser[] = Array.isArray(data?.emailUser) ? data.emailUser : data?.emailUser ? [data.emailUser] : [];

            setUsers(
                list
                    .filter((u) => u.email)
                    .map((u) => ({
                        ...u,
                        fullName: (u.fullName && u.fullName.trim()) || u.email?.split('@')[0] || '',
                    }))
            );

            // initialize expanded flags for csv groups
            const csvFlags: Record<string, boolean> = {};
            list.forEach((u) => {
                if (u.emailUserCSV?.id) csvFlags[`csv-${u.emailUserCSV.id}`] = true;
            });
            setExpanded((prev) => ({ ...prev, ...csvFlags }));
        } catch (err: any) {
            // also show as modal
            setFeedbackModal({
                open: true,
                type: 'error',
                title: 'Error',
                message: err.message || 'Something went wrong',
            });
        } finally {
            setLoading(false);
        }
    };

    // ---------- Credentials: Check + Validate + Save ----------
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
        } catch (e: any) {
            console.error('Failed to check marketing credentials:', e);
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

        // Accept 16+ alphanum OR 4 groups of 4 alphanum separated by spaces (e.g., "xbsr gbiv sizp twwe")
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

            setShowCredentialsModal(false);

            // If we haven't loaded users yet, do it now so the page is ready
            if (!users.length) {
                fetchUsers();
            }

            setFeedbackModal({
                open: true,
                type: 'success',
                title: 'Credentials saved',
                message: 'Your email credentials were saved successfully.',
            });
        } catch (e: any) {
            setFeedbackModal({
                open: true,
                type: 'error',
                title: 'Error',
                message: e.message || 'Failed to save credentials',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- Recipient Grouping ----------
    const groups = useMemo(() => {
        const manual = users.filter((u) => !u.emailUserCSVId);
        const map = new Map<number, { id: number; name: string; users: EmailUser[] }>();
        users.forEach((u) => {
            if (u.emailUserCSVId && u.emailUserCSV) {
                const key = u.emailUserCSV.id;
                if (!map.has(key)) map.set(key, { id: key, name: u.emailUserCSV.name, users: [] });
                map.get(key)!.users.push(u);
            }
        });
        const csvGroups = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
        return { manual, csvGroups, totalCount: users.length };
    }, [users]);

    const allIds = useMemo(() => users.map((u) => u.id), [users]);

    const isAllSelected = selectedUsers.length > 0 && selectedUsers.length === allIds.length;
    // const someSelected = selectedUsers.length > 0 && selectedUsers.length < allIds.length;

    const toggleSelectAll = () => {
        setSelectedUsers(isAllSelected ? [] : allIds);
    };

    const groupChecked = (ids: number[]) => ids.every((id) => selectedUsers.includes(id));
    const toggleGroup = (ids: number[]) => {
        const allChecked = groupChecked(ids);
        setSelectedUsers((prev) => {
            if (allChecked) return prev.filter((id) => !ids.includes(id));
            const set = new Set(prev.concat(ids));
            return Array.from(set);
        });
    };

    const toggleUser = (id: number) => {
        setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    // ---------- Email blocks ----------
    const addEmail = () => {
        if (emails.length >= MAX_EMAILS) return;
        setEmails((e) => [...e, '']);
    };
    const removeEmail = (idx: number) => {
        setEmails((e) => e.filter((_, i) => i !== idx));
    };
    const updateEmail = (idx: number, value: string) => {
        setEmails((e) => e.map((v, i) => (i === idx ? value : v)));
    };

    // ---------- Validation ----------
    const validate = () => {
        const errs: any = {};
        if (!fromName.trim()) errs.fromName = 'From name is required';
        if (!subject.trim()) errs.subject = 'Subject is required';

        const nonEmptyEmails = emails.map((t) => t.trim()).filter((t) => t.length > 0);
        if (nonEmptyEmails.length === 0) errs.emails = 'Write at least one email message';
        if (emails.length > MAX_EMAILS) errs.emails = `Maximum ${MAX_EMAILS} emails allowed`;

        if (selectedUsers.length === 0) errs.selectedUsers = 'Please select at least one recipient';

        if (scheduleMode === 'weekdays') {
            if (!runAtDate) errs.runAtDate = 'Date is required';
            if (!runAtTime) errs.runAtTime = 'Time is required';
            if (runAtDate && runAtTime) {
                const dt = new Date(`${runAtDate}T${runAtTime}`);
                if (dt < new Date()) errs.runAtTime = 'Please choose a future time';
            }
            // NOTE: we intentionally removed the "one email only" validation per your request
        }

        if (scheduleMode === 'weeklyRotation') {
            if (rotationDayOfWeek === '' || rotationDayOfWeek === null) errs.rotationDayOfWeek = 'Pick a weekday';
            if (!rotationTime) errs.rotationTime = 'Time is required';
        }

        if (scheduleMode === 'intervalRotation') {
            const d = parseInt(intervalDays || '0', 10);
            const h = parseInt(intervalHours || '0', 10);
            if (!(d > 0 || h > 0)) errs.interval = 'Interval must be at least 1 hour or 1 day';
        }

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ---------- Helpers ----------
    const formatDateTimeWithTZ = (date: string, time: string) => {
        const dateTime = new Date(`${date}T${time}`);
        const offset = -dateTime.getTimezoneOffset();
        const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
        const offsetSign = offset >= 0 ? '+' : '-';

        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getDate()).padStart(2, '0');
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const seconds = String(dateTime.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
    };

    const parseHourMinute = (hhmm: string) => {
        const [h, m] = hhmm.split(':').map((n) => parseInt(n || '0', 10));
        return { hour: isNaN(h) ? 0 : h, minute: isNaN(m) ? 0 : m };
    };

    // ---------- Submit ----------
    const handleSubmit = async () => {
        // IMPORTANT FIX #1: do NOT re-check credentials here (it was causing an extra /api/v2/marketingCredentials hit)
        if (!validate()) return;

        try {
            setSubmitting(true);

            const adminId = Number(localStorage.getItem('adminId'));
            if (!adminId) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const trimmedEmails = emails.map((t) => t.trim()).filter((t) => t.length > 0);
            const items: any[] = [];

            if (scheduleMode === 'weekdays') {
                const runAt = formatDateTimeWithTZ(runAtDate, runAtTime);
                // Now supports MULTIPLE emails: we’ll create an item per email per user with same weekdays/runAt
                selectedUsers.forEach((id) => {
                    trimmedEmails.forEach((text) => {
                        items.push({
                            id,
                            subject: subject.trim(),
                            text,
                            runAt,
                            weekdays: selectedWeekdays, // e.g., [3,5,0]
                        });
                    });
                });
            }

            if (scheduleMode === 'weeklyRotation') {
                const totalSteps = trimmedEmails.length;
                const { hour, minute } = parseHourMinute(rotationTime);
                selectedUsers.forEach((id) => {
                    trimmedEmails.forEach((text, idx) => {
                        items.push({
                            id,
                            subject: subject.trim(),
                            text,
                            weeklyRotation: {
                                dayOfWeek: rotationDayOfWeek, // 0..6
                                totalSteps,
                                position: idx + 1,
                                hour,
                                minute,
                            },
                            repeated: true,
                        });
                    });
                });
            }

            if (scheduleMode === 'intervalRotation') {
                const d = parseInt(intervalDays || '0', 10);
                const h = parseInt(intervalHours || '0', 10);
                const intervalSeconds = d * 86400 + h * 3600;
                const totalSteps = trimmedEmails.length;
                selectedUsers.forEach((id) => {
                    trimmedEmails.forEach((text, idx) => {
                        items.push({
                            id,
                            subject: subject.trim(),
                            text,
                            intervalRotation: { intervalSeconds, totalSteps, position: idx + 1 },
                            repeated: true,
                        });
                    });
                });
            }

            const payload = { adminId, items };

            const response = await fetch('/api/v2/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create automation');
            }

            // open success modal
            setFeedbackModal({
                open: true,
                type: 'success',
                title: 'Automation created!',
                message: 'Your email campaign has been scheduled.',
            });

            // Reset minimal fields; keep users loaded
            setSubject('');
            setFromName('');
            setEmails(['']);
            setSelectedUsers([]);
            setRunAtDate('');
            setRunAtTime('');
            setSelectedWeekdays([]);
            setRotationDayOfWeek('');
            setRotationTime('09:00');
            setIntervalDays('2');
            setIntervalHours('0');
        } catch (err: any) {
            // open error modal
            setFeedbackModal({
                open: true,
                type: 'error',
                title: 'Error',
                message: err.message || 'Something went wrong',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ---------- UI helpers ----------
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const toggleWeekday = (d: number) => {
        setSelectedWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
        if (formErrors.weekdays) setFormErrors((p: any) => ({ ...p, weekdays: '' }));
    };

    const toggleExpanded = (key: string) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
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
        <div className='min-h-screen p-8'>
            <div className='max-w-5xl mx-auto'>
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 p-8'>
                        <div className='flex items-center gap-4'>
                            <div className='w-16 h-16 border-2 border-white rounded-xl flex items-center justify-center'>
                                <Mail className='w-8 h-8 text-slate-100' />
                            </div>
                            <div>
                                <h1 className='text-3xl font-bold text-white mb-1'>Email Automation</h1>
                                <p className='text-slate-100'>Schedule one-off or rotating campaigns</p>
                            </div>
                        </div>
                    </div>

                    <div className='p-8 space-y-8'>
                        {/* Sender & Subject */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>From Name</label>
                                <input
                                    type='text'
                                    value={fromName}
                                    onChange={(e) => {
                                        setFromName(e.target.value);
                                        if (formErrors.fromName) setFormErrors((p: any) => ({ ...p, fromName: '' }));
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.fromName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                    placeholder='e.g., Demo Store'
                                    disabled={submitting}
                                />
                                {formErrors.fromName && <p className='text-red-600 text-sm mt-1'>{formErrors.fromName}</p>}
                            </div>
                            <div>
                                <label className='block text-sm font-semibold text-slate-700 mb-2'>Email Subject</label>
                                <input
                                    type='text'
                                    value={subject}
                                    onChange={(e) => {
                                        setSubject(e.target.value);
                                        if (formErrors.subject) setFormErrors((p: any) => ({ ...p, subject: '' }));
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        formErrors.subject ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                    placeholder='e.g., Big Sale Tomorrow'
                                    disabled={submitting}
                                />
                                {formErrors.subject && <p className='text-red-600 text-sm mt-1'>{formErrors.subject}</p>}
                            </div>
                        </div>

                        {/* Email blocks (1..5) */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <label className='text-sm font-semibold text-slate-700'>Email Content (up to 5)</label>
                                <button
                                    type='button'
                                    onClick={addEmail}
                                    disabled={submitting || emails.length >= MAX_EMAILS}
                                    className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-50'
                                >
                                    <Plus className='w-4 h-4' />
                                    Add email
                                </button>
                            </div>

                            {formErrors.emails && <p className='text-red-600 text-sm'>{formErrors.emails}</p>}

                            <div className='space-y-4'>
                                {emails.map((val, idx) => (
                                    <div key={idx} className='border border-slate-200 rounded-lg p-4'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <p className='font-semibold text-slate-800'>Email {idx + 1}</p>
                                            {emails.length > 1 && (
                                                <button
                                                    type='button'
                                                    onClick={() => removeEmail(idx)}
                                                    disabled={submitting}
                                                    className='text-slate-600 hover:text-red-600 inline-flex items-center gap-1 text-sm'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            rows={4}
                                            value={val}
                                            onChange={(e) => updateEmail(idx, e.target.value)}
                                            className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all resize-none'
                                            placeholder='Write the email body...'
                                            disabled={submitting}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recipients grouped (collapsible) */}
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-3'>
                                <Users className='w-4 h-4 inline mr-2' />
                                Select Recipients
                            </label>

                            <div className='flex items-center justify-between mb-2'>
                                <div className='flex items-center gap-3'>
                                    <label className='inline-flex items-center gap-2 text-sm'>
                                        <input type='checkbox' className='w-5 h-5' checked={isAllSelected} onChange={toggleSelectAll} />
                                        <span>Select all</span>
                                    </label>
                                    {selectedUsers.length > 0 && <span className='text-xs text-slate-500'>({selectedUsers.length} selected)</span>}
                                </div>
                                {formErrors.selectedUsers && <p className='text-red-600 text-sm'>{formErrors.selectedUsers}</p>}
                            </div>

                            <div className='border border-slate-300 rounded-lg divide-y'>
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
                                                checked={groups.manual.length > 0 && groups.manual.every((u) => selectedUsers.includes(u.id))}
                                                onChange={() => toggleGroup(groups.manual.map((u) => u.id))}
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
                                                                checked={selectedUsers.includes(u.id)}
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
                                                        checked={g.users.length > 0 && g.users.every((u) => selectedUsers.includes(u.id))}
                                                        onChange={() => toggleGroup(g.users.map((u) => u.id))}
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
                                                                checked={selectedUsers.includes(u.id)}
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
                        </div>

                        {/* Schedule mode */}
                        <div className='border-t border-slate-200 pt-6'>
                            <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
                                <Clock className='w-5 h-5 text-slate-800' />
                                Schedule Settings
                            </h3>

                            {/* Mode toggles */}
                            <div className='flex gap-2 p-1 bg-slate-100 rounded-lg w-full md:w-fit mb-4'>
                                {(
                                    [
                                        { key: 'weekdays', label: 'Specific weekdays' },
                                        { key: 'weeklyRotation', label: 'Weekly rotation' },
                                        { key: 'intervalRotation', label: 'Interval rotation' },
                                    ] as { key: ScheduleMode; label: string }[]
                                ).map((m) => (
                                    <button
                                        key={m.key}
                                        type='button'
                                        onClick={() => {
                                            setScheduleMode(m.key);
                                            setFormErrors((p: any) => (p ? { ...p, weekdays: '', rotationDayOfWeek: '', rotationTime: '', interval: '' } : {}));
                                        }}
                                        className={`py-2.5 px-4 rounded-md font-medium transition-all ${
                                            scheduleMode === m.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* Mode panels */}
                            {scheduleMode === 'weekdays' && (
                                <div className='space-y-6'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                                <Calendar className='w-4 h-4 inline mr-2' />
                                                Start Date
                                            </label>
                                            <input
                                                type='date'
                                                value={runAtDate}
                                                onChange={(e) => {
                                                    setRunAtDate(e.target.value);
                                                    if (formErrors.runAtDate) setFormErrors((p: any) => ({ ...p, runAtDate: '' }));
                                                }}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={`w-full px-4 py-3 rounded-lg border ${
                                                    formErrors.runAtDate ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                                } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                                disabled={submitting}
                                            />
                                            {formErrors.runAtDate && <p className='text-red-600 text-sm mt-1'>{formErrors.runAtDate}</p>}
                                        </div>

                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 mb-2'>
                                                <Clock className='w-4 h-4 inline mr-2' />
                                                Time
                                            </label>
                                            <input
                                                type='time'
                                                value={runAtTime}
                                                onChange={(e) => {
                                                    setRunAtTime(e.target.value);
                                                    if (formErrors.runAtTime) setFormErrors((p: any) => ({ ...p, runAtTime: '' }));
                                                }}
                                                className={`w-full px-4 py-3 rounded-lg border ${
                                                    formErrors.runAtTime ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                                } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                                disabled={submitting}
                                            />
                                            {formErrors.runAtTime && <p className='text-red-600 text-sm mt-1'>{formErrors.runAtTime}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Repeat on</label>
                                        <div className='flex flex-wrap gap-2'>
                                            {weekdayLabels.map((lbl, idx) => {
                                                const active = selectedWeekdays.includes(idx);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type='button'
                                                        onClick={() => toggleWeekday(idx)}
                                                        className={`px-3 py-2 rounded-md border ${
                                                            active ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-700'
                                                        }`}
                                                        disabled={submitting}
                                                    >
                                                        {lbl}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {formErrors.weekdays && <p className='text-red-600 text-sm mt-1'>{formErrors.weekdays}</p>}
                                    </div>
                                </div>
                            )}

                            {scheduleMode === 'weeklyRotation' && (
                                <div className='space-y-6'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 mb-2'>Day of week</label>
                                            <select
                                                value={rotationDayOfWeek === '' ? '' : rotationDayOfWeek}
                                                onChange={(e) => {
                                                    const v = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                                    setRotationDayOfWeek(v as any);
                                                    if (formErrors.rotationDayOfWeek) setFormErrors((p: any) => ({ ...p, rotationDayOfWeek: '' }));
                                                }}
                                                className={`w-full px-4 py-3 rounded-lg border ${
                                                    formErrors.rotationDayOfWeek ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                                } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                                disabled={submitting}
                                            >
                                                <option value=''>Select…</option>
                                                {weekdayLabels.map((lbl, i) => (
                                                    <option key={i} value={i}>
                                                        {lbl}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.rotationDayOfWeek && <p className='text-red-600 text-sm mt-1'>{formErrors.rotationDayOfWeek}</p>}
                                        </div>

                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 mb-2'>Time</label>
                                            <input
                                                type='time'
                                                value={rotationTime}
                                                onChange={(e) => {
                                                    setRotationTime(e.target.value);
                                                    if (formErrors.rotationTime) setFormErrors((p: any) => ({ ...p, rotationTime: '' }));
                                                }}
                                                className={`w-full px-4 py-3 rounded-lg border ${
                                                    formErrors.rotationTime ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                                } focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all`}
                                                disabled={submitting}
                                            />
                                            {formErrors.rotationTime && <p className='text-red-600 text-sm mt-1'>{formErrors.rotationTime}</p>}
                                        </div>
                                    </div>

                                    <div className='text-sm text-slate-600'>
                                        <p>
                                            We’ll create <strong>{emails.filter((t) => t.trim()).length}</strong> rotating steps (positions 1…
                                            {emails.filter((t) => t.trim()).length || 1}) for the chosen weekday/time.
                                        </p>
                                        <p className='mt-1 text-slate-500'>
                                            Example per user item:{' '}
                                            <code>
                                                weeklyRotation: {'{'} dayOfWeek, totalSteps, position, hour, minute {'}'}
                                            </code>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {scheduleMode === 'intervalRotation' && (
                                <div className='space-y-6'>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 mb-2'>Every (days)</label>
                                            <input
                                                type='number'
                                                min='0'
                                                value={intervalDays}
                                                onChange={(e) => {
                                                    setIntervalDays(e.target.value);
                                                    if (formErrors.interval) setFormErrors((p: any) => ({ ...p, interval: '' }));
                                                }}
                                                className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all'
                                                placeholder='e.g., 2'
                                                disabled={submitting}
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-slate-700 mb-2'>Every (hours)</label>
                                            <input
                                                type='number'
                                                min='0'
                                                value={intervalHours}
                                                onChange={(e) => {
                                                    setIntervalHours(e.target.value);
                                                    if (formErrors.interval) setFormErrors((p: any) => ({ ...p, interval: '' }));
                                                }}
                                                className='w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all'
                                                placeholder='optional'
                                                disabled={submitting}
                                            />
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='text-sm text-slate-600'>
                                                {formErrors.interval && <p className='text-red-600'>{formErrors.interval}</p>}
                                                {!formErrors.interval && (
                                                    <p className='text-slate-500'>
                                                        Interval seconds = {parseInt(intervalDays || '0') * 86400 + parseInt(intervalHours || '0') * 3600}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className='text-sm text-slate-500'>
                                        Example per user item:{' '}
                                        <code>
                                            intervalRotation: {'{'} intervalSeconds, totalSteps, position {'}'}
                                        </code>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className='flex gap-4 pt-2'>
                            <button
                                type='button'
                                onClick={handleSubmit}
                                disabled={submitting}
                                className='flex-1 px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-lg font-semibold hover:from-slate-700 hover:to-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer'
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className='w-5 h-5 animate-spin' />
                                        Creating Automation...
                                    </>
                                ) : (
                                    <>
                                        <Send className='w-5 h-5' />
                                        Create Automation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
                                <label htmlFor='cred-email' className='flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2'>
                                    <Mail className='w-4 h-4' />
                                    Email Address
                                </label>
                                <input
                                    type='email'
                                    id='cred-email'
                                    name='email'
                                    value={credentialsData.email}
                                    onChange={handleCredentialsInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        credentialsErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder='your.email@gmail.com'
                                    disabled={submitting}
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
                                    disabled={submitting}
                                />
                                {credentialsErrors.appPassword && <p className='text-red-600 text-sm mt-1'>{credentialsErrors.appPassword}</p>}
                                <p className='text-slate-500 text-xs mt-1'>Enter the app password exactly as provided by your email provider</p>
                            </div>

                            <div className='pt-4'>
                                <button
                                    type='button'
                                    onClick={handleCredentialsSubmit}
                                    disabled={submitting}
                                    className='w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl'
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

            {/* Feedback Modal (Success / Error) */}
            {feedbackModal.open && (
                <div className='fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'>
                        <div className={`p-4 flex items-center justify-between ${feedbackModal.type === 'success' ? 'bg-green-800/90' : 'bg-red-800/90'}`}>
                            <div className='flex items-center gap-3'>
                                {feedbackModal.type === 'success' ? (
                                    <CheckCircle className='w-6 h-6 text-white' />
                                ) : (
                                    <AlertCircle className='w-6 h-6 text-white' />
                                )}
                                <h2 className='text-white text-lg font-semibold'>{feedbackModal.title}</h2>
                            </div>
                            <button
                                type='button'
                                onClick={() => setFeedbackModal((m) => ({ ...m, open: false }))}
                                className='text-white/90 hover:text-white rounded-lg p-1'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>
                        <div className='p-6'>
                            <p className='text-slate-700'>{feedbackModal.message}</p>
                            <div className='mt-6 text-right'>
                                <button
                                    type='button'
                                    onClick={() => setFeedbackModal((m) => ({ ...m, open: false }))}
                                    className={`px-4 py-2 rounded-md font-semibold ${
                                        feedbackModal.type === 'success' ? 'bg-green-700 hover:bg-green-800' : 'bg-red-700 hover:bg-red-800'
                                    } text-white`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
