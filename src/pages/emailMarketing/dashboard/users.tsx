import { AlertCircle, Check, ChevronDown, ChevronRight, FileText, Info, Loader2, Lock, Mail, Plus, ShieldCheck, Upload, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function SalesProfilePage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', fullName: '' });
    const [formErrors, setFormErrors] = useState<{ email?: string; fullName?: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadMode, setUploadMode] = useState<'single' | 'csv'>('single');
    const [csvData, setCsvData] = useState<{ name: string; file: File | null }>({ name: '', file: null });
    const [csvErrors, setCsvErrors] = useState<{ name?: string; file?: string }>({});
    const [csvParsedData, setCsvParsedData] = useState<any[]>([]);
    const [csvParseError, setCsvParseError] = useState<string | null>(null);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [checkingCredentials, setCheckingCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [credentialsData, setCredentialsData] = useState<{ email: string; appPassword: string }>({
        email: '',
        appPassword: '',
    });
    const [credentialsErrors, setCredentialsErrors] = useState<{ email?: string; appPassword?: string }>({});

    useEffect(() => {
        (async () => {
            const ok = await checkMarketingCredentials();
            if (ok) {
                fetchUsers();
            } else {
                setLoading(false);
            }
        })();
    }, []);

    const splitRespectingQuotes = (line: string, delim: string): string[] => {
        const out: string[] = [];
        let cur = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === delim && !inQuotes) {
                out.push(cur);
                cur = '';
            } else {
                cur += ch;
            }
        }
        out.push(cur);
        return out;
    };

    const detectDelimiter = (header: string): string => {
        const candidates = [',', ';', '\t'];
        let best = ',';
        let bestCount = -1;
        for (const d of candidates) {
            const count = header.split(d).length - 1;
            if (count > bestCount) {
                bestCount = count;
                best = d;
            }
        }
        return best;
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const id = Number(localStorage.getItem('userId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const response = await fetch(`/api/v2/email-users?authId=${id}`);
            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            const list = Array.isArray(data?.emailUser) ? data.emailUser : data?.emailUser ? [data.emailUser] : [];

            const normalized = list
                .map((u: any) => ({
                    id: u.id,
                    email: u.email,
                    fullName:
                        (typeof u.fullName === 'string' && u.fullName.trim()) ||
                        (typeof u.email === 'string' && u.email.includes('@') ? u.email.split('@')[0] : ''),
                    createdAt: u.createdAt,
                    fromCSV: !!u.emailUserCSVId,
                    csvListName: u.emailUserCSV?.name ?? (u.emailUserCSVId ? `List #${u.emailUserCSVId}` : null),
                }))
                .filter((u: any) => typeof u.email === 'string' && u.email.trim());

            setUsers(normalized);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const checkMarketingCredentials = async (): Promise<boolean> => {
        try {
            setCheckingCredentials(true);
            setIsLoading(true);

            const id = Number(localStorage.getItem('userId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return false;
            }

            const response = await fetch(`/api/v2/marketingCredentials?adminId=${id}`);

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

            if (ok) {
                setShowCredentialsModal(false);
                return true;
            } else {
                setShowCredentialsModal(true);
                return false;
            }
        } catch (e) {
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
            setError(null);
            setSubmitting(true);
            const adminId = Number(localStorage.getItem('userId'));
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
            setIsModalOpen(true);

            if (!users.length) {
                fetchUsers();
            }
        } catch (e: any) {
            setError(e.message || 'Failed to save credentials');
        } finally {
            setSubmitting(false);
        }
    };

    const parseCSV = (raw: string): any[] => {
        const text = raw.replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row');

        const delim = detectDelimiter(lines[0]);

        const headers = splitRespectingQuotes(lines[0], delim).map((h) => h.trim().toLowerCase());
        const idxOf = (names: string[]) => {
            for (const n of names) {
                const i = headers.findIndex((h) => h === n);
                if (i !== -1) return i;
            }
            return -1;
        };

        const emailIndex = idxOf(['email', 'e-mail', 'email address', 'emailaddress']);
        const nameIndex = idxOf(['fullname', 'full name', 'name']);

        if (emailIndex === -1) {
            throw new Error('No "email" column found. Include a column named email.');
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const seen = new Set<string>();
        const out: { email: string; fullName: string }[] = [];
        let invalidRows = 0;

        for (let i = 1; i < lines.length; i++) {
            const cols = splitRespectingQuotes(lines[i], delim).map((c) => c.trim());
            const rawEmail = (cols[emailIndex] || '').replace(/^mailto:/i, '');
            if (!emailRe.test(rawEmail)) {
                invalidRows++;
                continue;
            }
            const normEmail = rawEmail.toLowerCase();
            if (seen.has(normEmail)) continue;
            seen.add(normEmail);

            const rawName = nameIndex !== -1 ? cols[nameIndex] || '' : '';
            const fullName = rawName.trim() || rawEmail.split('@')[0];

            out.push({ email: rawEmail, fullName });
        }

        if (out.length === 0) throw new Error('No valid users found in CSV');

        const dataRows = Math.max(lines.length - 1, 1);
        const invalidShare = invalidRows / dataRows;
        if (invalidShare > 0.6) {
            throw new Error(
                'This file does not look like a contact list. Most rows lack valid emails. Tips: keep a column literally named "email", export to CSV (not Excel), and avoid mixed delimiters.'
            );
        }

        return out;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isCSVExt = /\.csv$/i.test(file.name);
        const looksCSVType = !file.type || /csv|plain|text/i.test(file.type);

        if (!isCSVExt && !looksCSVType) {
            setCsvErrors((prev) => ({ ...prev, file: 'Please upload a CSV file (.csv)' }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setCsvErrors((prev) => ({ ...prev, file: 'File size must be less than 5MB' }));
            return;
        }

        setCsvData((prev) => ({ ...prev, file }));
        setCsvErrors((prev) => ({ ...prev, file: undefined }));
        setCsvParseError(null);
        setCsvParsedData([]);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = (event.target?.result as string) ?? '';
                const parsedUsers = parseCSV(text);
                setCsvParsedData(parsedUsers);
            } catch (err: any) {
                setCsvParseError(err.message);
                setCsvParsedData([]);
            }
        };
        reader.onerror = () => {
            setCsvParseError('Failed to read file');
            setCsvParsedData([]);
        };
        reader.readAsText(file);
    };

    const validateCSVForm = () => {
        const errors: { name?: string; file?: string } = {};

        if (!csvData.name.trim()) {
            errors.name = 'List name is required';
        } else if (csvData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!csvData.file) {
            errors.file = 'Please upload a CSV file';
        }

        if (csvParseError) {
            errors.file = csvParseError;
        }

        if (csvParsedData.length === 0 && csvData.file) {
            errors.file = 'No valid users found in CSV';
        }

        setCsvErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCSVSubmit = async () => {
        if (!validateCSVForm()) return;

        try {
            setSubmitting(true);
            setError(null);
            const id = Number(localStorage.getItem('userId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/v2/email-users-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authId: id,
                    csv: { name: csvData.name.trim() },
                    users: csvParsedData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to upload CSV');
            }

            setSuccess(true);
            setCsvData({ name: '', file: null });
            setCsvParsedData([]);
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
                setUploadMode('single');
                fetchUsers();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const validateForm = () => {
        const errors: any = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            errors.fullName = 'Name must be at least 2 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (uploadMode === 'csv') {
            await handleCSVSubmit();
            return;
        }

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            setError(null);

            const id = Number(localStorage.getItem('userId'));
            if (!id) {
                if (typeof window !== 'undefined') window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/v2/email-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    fullName: formData.fullName.trim(),
                    authId: id,
                }),
            });

            let data: any = null;
            try {
                data = await response.json();
            } catch {}

            const dupMsg = typeof data?.message === 'string' && /email already exist/i.test(data.message);

            if (dupMsg) {
                setFormErrors((prev: any) => ({ ...prev, email: 'Email already exists.' }));
                setError(null);
                return;
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Failed to create user');
            }

            setSuccess(true);
            setFormData({ email: '', fullName: '' });
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
                fetchUsers();
            }, 1500);
        } catch (err: any) {
            if (typeof err?.message === 'string' && /email already exist/i.test(err.message)) {
                setFormErrors((prev: any) => ({ ...prev, email: 'Email already exists.' }));
                setError(null);
            } else {
                setError(err?.message || 'Something went wrong');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if ((formErrors as any)[name]) {
            setFormErrors((prev: any) => ({ ...prev, [name]: '' }));
        }
    };

    const handleKeyPress = (e: any) => {
        if (e.key === 'Enter' && !submitting && uploadMode === 'single') {
            handleSubmit();
        }
    };

    const groupedUsers = React.useMemo(() => {
        const groups: { [key: string]: any[] } = {
            manual: [],
        };

        users.forEach((user) => {
            if (user.fromCSV && user.csvListName) {
                const key = user.csvListName;
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(user);
            } else {
                groups.manual.push(user);
            }
        });

        return groups;
    }, [users]);

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
            } else {
                newSet.add(groupKey);
            }
            return newSet;
        });
    };

    const openModal = async () => {
        const ok = await checkMarketingCredentials();
        if (!ok) {
            return;
        }
        setIsModalOpen(true);
        setFormData({ email: '', fullName: '' });
        setFormErrors({});
        setCsvData({ name: '', file: null });
        setCsvErrors({});
        setCsvParsedData([]);
        setCsvParseError(null);
        setError(null);
        setSuccess(false);
        setUploadMode('single');
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
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8'>
            <div className='max-w-7xl mx-auto'>
                <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h1 className='text-2xl font-bold text-white'>Email Users</h1>
                                <p className='text-white/70 text-sm'>Manage your email users</p>
                            </div>
                            <button
                                onClick={openModal}
                                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm cursor-pointer'
                            >
                                <span className='inline-flex items-center gap-2'>
                                    <Plus className='w-4 h-4' />
                                    Add Email User
                                </span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className='mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                            <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                            <div className='flex-1'>
                                <p className='text-red-800 font-medium'>Error</p>
                                <p className='text-red-600 text-sm'>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className='p-6'>
                        {users.length === 0 ? (
                            <div className='text-center py-16'>
                                <User className='w-16 h-16 text-slate-300 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold text-slate-700 mb-2'>No email users found</h3>
                                <p className='text-slate-500'>Create your first email user to get started</p>
                            </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='border-b border-slate-200'>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Group</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Full Name</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Email</th>
                                            <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider'>Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(groupedUsers).map(([groupKey, groupUsers]) => {
                                            const isExpanded = expandedGroups.has(groupKey);
                                            const isManual = groupKey === 'manual';
                                            const groupName = isManual ? 'Manually Created Users' : groupKey;
                                            const groupCount = groupUsers.length;

                                            return (
                                                <React.Fragment key={groupKey}>
                                                    <tr
                                                        className='bg-slate-50 hover:bg-slate-100 cursor-pointer border-b border-slate-200'
                                                        onClick={() => toggleGroup(groupKey)}
                                                    >
                                                        <td colSpan={4} className='py-4 px-6'>
                                                            <div className='flex items-center gap-3'>
                                                                {isExpanded ? (
                                                                    <ChevronDown className='w-5 h-5 text-slate-600' />
                                                                ) : (
                                                                    <ChevronRight className='w-5 h-5 text-slate-600' />
                                                                )}
                                                                {isManual ? (
                                                                    <User className='w-5 h-5 text-blue-600' />
                                                                ) : (
                                                                    <FileText className='w-5 h-5 text-green-600' />
                                                                )}
                                                                <span className='font-semibold text-slate-800 text-base'>{groupName}</span>
                                                                <span className='inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-medium'>
                                                                    {groupCount} {groupCount === 1 ? 'user' : 'users'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {isExpanded &&
                                                        groupUsers.map((user: any, index: number) => (
                                                            <tr
                                                                key={user.id ?? `${user.email}-${index}`}
                                                                className='border-b border-slate-100 hover:bg-slate-50 transition-colors'
                                                            >
                                                                <td className='py-4 px-6 pl-16'>
                                                                    <span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm'>
                                                                        {index + 1}
                                                                    </span>
                                                                </td>
                                                                <td className='py-4 px-6'>
                                                                    <div className='flex items-center gap-3'>
                                                                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold'>
                                                                            {typeof user.fullName === 'string' && user.fullName.trim()
                                                                                ? user.fullName.charAt(0).toUpperCase()
                                                                                : user.email?.charAt(0)?.toUpperCase() || '?'}
                                                                        </div>
                                                                        <span className='font-medium text-slate-800'>
                                                                            {user.fullName || user.email?.split('@')[0] || '—'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className='py-4 px-6'>
                                                                    <div className='flex items-center gap-2 text-slate-600'>
                                                                        <Mail className='w-4 h-4 text-slate-400' />
                                                                        {user.email}
                                                                    </div>
                                                                </td>
                                                                <td className='py-4 px-6'>
                                                                    <span className='text-slate-600 text-sm'>
                                                                        {user.createdAt
                                                                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                                  year: 'numeric',
                                                                                  month: 'short',
                                                                                  day: 'numeric',
                                                                                  hour: '2-digit',
                                                                                  minute: '2-digit',
                                                                              })
                                                                            : '--'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

                            {error && (
                                <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                                    <p className='text-red-800 text-sm'>{error}</p>
                                </div>
                            )}

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

            {isModalOpen && (
                <div className='fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50'>
                    <div className='bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden'>
                        <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center justify-between'>
                            <h2 className='text-lg font-bold text-white'>Add Email Users</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className='text-white/90 hover:text-white rounded-lg p-1 transition-colors'
                                disabled={submitting}
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>

                        <div className='p-6 space-y-5'>
                            <div className='flex gap-2 p-1 bg-slate-100 rounded-lg'>
                                <button
                                    type='button'
                                    onClick={() => setUploadMode('single')}
                                    disabled={submitting}
                                    className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                                        uploadMode === 'single' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                >
                                    <span className='inline-flex items-center gap-2'>
                                        <User className='w-4 h-4' />
                                        Single User
                                    </span>
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setUploadMode('csv')}
                                    disabled={submitting}
                                    className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all ${
                                        uploadMode === 'csv' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                >
                                    <span className='inline-flex items-center gap-2'>
                                        <Upload className='w-4 h-4' />
                                        CSV Upload
                                    </span>
                                </button>
                            </div>

                            {success && (
                                <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3'>
                                    <div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'>
                                        <Check className='w-3 h-3 text-white' />
                                    </div>
                                    <p className='text-green-800 font-medium'>
                                        {uploadMode === 'csv' ? 'CSV uploaded successfully!' : 'User created successfully!'}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                                    <p className='text-red-800 text-sm'>{error}</p>
                                </div>
                            )}

                            {uploadMode === 'single' ? (
                                <>
                                    <div>
                                        <label htmlFor='fullName' className='block text-sm font-semibold text-slate-700 mb-2'>
                                            Full Name
                                        </label>
                                        <input
                                            type='text'
                                            id='fullName'
                                            name='fullName'
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                formErrors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                            placeholder='Enter full name'
                                            disabled={submitting}
                                        />
                                        {formErrors.fullName && <p className='text-red-600 text-sm mt-1'>{formErrors.fullName}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor='email' className='block text-sm font-semibold text-slate-700 mb-2'>
                                            Email Address
                                        </label>
                                        <input
                                            type='email'
                                            id='email'
                                            name='email'
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                            placeholder='user@example.com'
                                            disabled={submitting}
                                        />
                                        {formErrors.email && <p className='text-red-600 text-sm mt-1'>{formErrors.email}</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                                        <div className='flex items-start gap-3'>
                                            <Info className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
                                            <div>
                                                <p className='text-blue-900 font-medium mb-1'>CSV Format Requirements</p>
                                                <p className='text-blue-800 text-sm'>
                                                    Your CSV must include an <strong>email</strong> column. Optional: <strong>fullName</strong> or{' '}
                                                    <strong>name</strong> column.
                                                </p>
                                                <p className='text-blue-800 text-sm mt-1'>
                                                    Example: <code className='bg-blue-100 px-1 rounded'>email,fullName</code>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor='csvName' className='block text-sm font-semibold text-slate-700 mb-2'>
                                            List Name
                                        </label>
                                        <input
                                            type='text'
                                            id='csvName'
                                            value={csvData.name}
                                            onChange={(e) => {
                                                setCsvData((prev) => ({ ...prev, name: e.target.value }));
                                                if (csvErrors.name) {
                                                    setCsvErrors((prev) => ({ ...prev, name: undefined }));
                                                }
                                            }}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                csvErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                            placeholder='e.g., November Import'
                                            disabled={submitting}
                                        />
                                        {csvErrors.name && <p className='text-red-600 text-sm mt-1'>{csvErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className='block text-sm font-semibold text-slate-700 mb-2'>Upload CSV File</label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                                                csvErrors.file ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400'
                                            }`}
                                        >
                                            <input
                                                type='file'
                                                accept='.csv'
                                                onChange={handleFileChange}
                                                className='hidden'
                                                id='csvFileInput'
                                                disabled={submitting}
                                            />
                                            <label htmlFor='csvFileInput' className='cursor-pointer'>
                                                <Upload className='w-12 h-12 text-slate-400 mx-auto mb-3' />
                                                {csvData.file ? (
                                                    <div className='space-y-2'>
                                                        <p className='text-slate-700 font-medium'>{csvData.file.name}</p>
                                                        <p className='text-slate-500 text-sm'>{(csvData.file.size / 1024).toFixed(2)} KB</p>
                                                        {csvParsedData.length > 0 && (
                                                            <div className='flex items-center justify-center gap-2 text-green-600'>
                                                                <Check className='w-4 h-4' />
                                                                <span className='text-sm font-medium'>{csvParsedData.length} users found</span>
                                                            </div>
                                                        )}
                                                        <button type='button' className='text-blue-600 text-sm hover:underline' disabled={submitting}>
                                                            Change file
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className='text-slate-700 font-medium mb-1'>Click to upload or drag and drop</p>
                                                        <p className='text-slate-500 text-sm'>CSV files only (max 5MB)</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        {csvErrors.file && <p className='text-red-600 text-sm mt-1'>{csvErrors.file}</p>}
                                        {csvParseError && (
                                            <div className='mt-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3'>
                                                <p className='font-medium mb-1'>We couldn&apos;t read that file as a contact list.</p>
                                                <ul className='list-disc pl-5 space-y-1'>
                                                    <li>
                                                        Ensure there&apos;s a column literally named <code>email</code>.
                                                    </li>
                                                    <li>
                                                        Export as <strong>CSV</strong> (not .xlsx).
                                                    </li>
                                                    <li>Use commas, semicolons, or tabs consistently.</li>
                                                </ul>
                                                <p className='mt-2 text-amber-900'>
                                                    Quick example: <code className='bg-amber-100 px-1 rounded'>email,fullName</code>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {csvParsedData.length > 0 && (
                                        <div className='bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto'>
                                            <p className='text-sm font-semibold text-slate-700 mb-2'>Preview ({csvParsedData.length} users)</p>
                                            <div className='space-y-1'>
                                                {csvParsedData.slice(0, 5).map((user, idx) => (
                                                    <div key={idx} className='text-sm text-slate-600 flex items-center gap-2'>
                                                        <Mail className='w-3 h-3' />
                                                        <span>{user.email}</span>
                                                        <span className='text-slate-400'>•</span>
                                                        <span>{user.fullName}</span>
                                                    </div>
                                                ))}
                                                {csvParsedData.length > 5 && (
                                                    <p className='text-xs text-slate-500 pt-1'>And {csvParsedData.length - 5} more...</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className='flex gap-3 pt-4'>
                                <button
                                    type='button'
                                    onClick={() => setIsModalOpen(false)}
                                    className='flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors'
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className='flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer'
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className='w-5 h-5 animate-spin' />
                                            {uploadMode === 'csv' ? 'Uploading...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            {uploadMode === 'csv' ? (
                                                <>
                                                    <Upload className='w-5 h-5' />
                                                    Upload CSV
                                                </>
                                            ) : (
                                                'Create User'
                                            )}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
