'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronRight, Upload } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

export default function RequisitionPage() {
    const [expandedCareers, setExpandedCareers] = useState<string[]>([]);
    const [expandedInquiries, setExpandedInquiries] = useState<string[]>([]);
    const [careers, setCareers] = useState<any[]>([]);
    const [recruitments, setRecruitments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        jobTitle: '',
        description: '',
        location: '',
        salary: '',
        image: '',
        jobType: '',
    });
    const [errors, setErrors] = useState<{
        jobTitle?: string;
        description?: string;
        location?: string;
        salary?: string;
        image?: string;
        jobType?: string;
    }>({});
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingType, setEditingType] = useState<'Job' | 'Recruitment' | null>(null);
    const cloudinaryWidgetRef = useRef<any>(null);

    const salaryRanges = [
        { label: '$50,000 - $70,000', value: '50k-70k', min: 50000, max: 70000, avg: 60000 },
        { label: '$70,000 - $90,000', value: '70k-90k', min: 70000, max: 90000, avg: 80000 },
        { label: '$90,000 - $120,000', value: '90k-90k', min: 90000, max: 120000, avg: 105000 },
        { label: '$120,000+', value: '120k+', min: 120000, max: Infinity, avg: 120000 },
    ];

    // Initialize Cloudinary widget (unchanged)
    useEffect(() => {
        console.log(editingType);
        const script = document.createElement('script');
        script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            cloudinaryWidgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: 'dpl3j2r3f',
                    uploadPreset: 'gptfrontend',
                    sources: ['local'],
                    multiple: false,
                    resourceType: 'image',
                    clientAllowedFormats: ['jpg', 'png', 'jpeg'],
                    maxFileSize: 5000000,
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === 'success') {
                        setFormData((prev) => ({
                            ...prev,
                            image: result.info.secure_url,
                        }));
                        setAlert({
                            type: 'success',
                            message: 'Image uploaded successfully!',
                        });
                        setErrors((prev) => ({ ...prev, image: undefined }));
                    } else if (error) {
                        setAlert({
                            type: 'error',
                            message: 'Failed to upload image. Please try again.',
                        });
                    }
                }
            );
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [editingType]); // Add editingType to the dependency array

    useEffect(() => {
        fetchCareers();
        fetchRecruitments();
    }, []);

    const fetchCareers = async () => {
        try {
            const response = await fetch('/api/v1/careers/?CareerType=Job');
            const data = await response.json();
            if (data.success) {
                setCareers(data.data.careers.map((c: any) => ({ ...c, expanded: false, applicants: [], loading: false, deleting: false, error: null })));
            } else {
                setAlert({ type: 'error', message: 'Failed to fetch careers.' });
            }
        } catch (error) {
            console.error('Failed to fetch careers:', error);
            setAlert({ type: 'error', message: 'Failed to fetch careers. Please try again.' });
        }
    };

    const fetchRecruitments = async () => {
        try {
            const response = await fetch('/api/v1/careers/?CareerType=Recruitment');
            const data = await response.json();
            if (data.success) {
                setRecruitments(data.data.careers.map((c: any) => ({ ...c, expanded: false, applicants: [], loading: false, deleting: false, error: null })));
            } else {
                setAlert({ type: 'error', message: 'Failed to fetch recruitments.' });
            }
        } catch (error) {
            console.error('Failed to fetch recruitments:', error);
            setAlert({ type: 'error', message: 'Failed to fetch recruitments. Please try again.' });
        }
    };

    const fetchApplicants = async (id: number, isCareer: boolean) => {
        try {
            const response = await fetch(`/api/v1/careers?id=${id}`);
            const data = await response.json();
            console.log('Fetch Applicants Response:', data); // Debug log
            if (data.success && data.data.career) {
                const applicants = data.data.career.Applicants || [];
                if (isCareer) {
                    setCareers((prev) => prev.map((c) => (c.id === id ? { ...c, applicants, loading: false, error: null } : c)));
                } else {
                    setRecruitments((prev) => prev.map((c) => (c.id === id ? { ...c, applicants, loading: false, error: null } : c)));
                }
            } else {
                throw new Error(data.message || 'Failed to fetch applicants');
            }
        } catch (error: any) {
            console.error('Failed to fetch applicants for ID', id, ':', error);
            const errorMessage = error.message || 'Failed to fetch applicants';
            if (isCareer) {
                setCareers((prev) => prev.map((c) => (c.id === id ? { ...c, loading: false, error: errorMessage } : c)));
            } else {
                setRecruitments((prev) => prev.map((c) => (c.id === id ? { ...c, loading: false, error: errorMessage } : c)));
            }
            setAlert({ type: 'error', message: errorMessage });
        }
    };

    const toggleCareer = (id: number) => {
        const idStr = id.toString();
        setExpandedCareers((prev) => {
            if (prev.includes(idStr)) {
                return prev.filter((t) => t !== idStr);
            } else {
                const career = careers.find((c) => c.id === id);
                if (career && career._count?.Applicants > 0 && career.applicants.length === 0) {
                    setCareers((prevC) => prevC.map((c) => (c.id === id ? { ...c, loading: true, error: null } : c)));
                    fetchApplicants(id, true);
                }
                return [...prev, idStr];
            }
        });
    };

    const toggleInquiry = (id: number) => {
        const idStr = id.toString();
        setExpandedInquiries((prev) => {
            if (prev.includes(idStr)) {
                return prev.filter((t) => t !== idStr);
            } else {
                const recruitment = recruitments.find((c) => c.id === id);
                if (recruitment && recruitment._count?.Applicants > 0 && recruitment.applicants.length === 0) {
                    setRecruitments((prevC) => prevC.map((c) => (c.id === id ? { ...c, loading: true, error: null } : c)));
                    fetchApplicants(id, false);
                }
                return [...prev, idStr];
            }
        });
    };

    // Edit and Delete functions (unchanged from your provided code)
    const handleEdit = (item: any, isCareer: boolean) => {
        const jobType = isCareer ? 'Career' : 'Recruitment Agency';
        const salaryRange = salaryRanges.find((r) => r.min <= item.salary && item.salary <= r.max)?.value || '';
        setFormData({
            jobTitle: item.title,
            description: item.description,
            location: item.location,
            salary: salaryRange,
            image: item.image,
            jobType,
        });
        setMode('edit');
        setEditingId(item.id);
        setEditingType(isCareer ? 'Job' : 'Recruitment');
        setErrors({});
        setAlert(null);
    };

    const handleDelete = async (id: number, isCareer: boolean) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        if (isCareer) {
            setCareers((prev) => prev.map((c) => (c.id === id ? { ...c, deleting: true } : c)));
        } else {
            setRecruitments((prev) => prev.map((c) => (c.id === id ? { ...c, deleting: true } : c)));
        }

        try {
            const response = await fetch(`/api/v1/careers?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            setAlert({
                type: 'success',
                message: 'Item deleted successfully!',
            });
            if (isCareer) {
                fetchCareers();
            } else {
                fetchRecruitments();
            }
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to delete item. Please try again.',
            });
            if (isCareer) {
                setCareers((prev) => prev.map((c) => (c.id === id ? { ...c, deleting: false } : c)));
            } else {
                setRecruitments((prev) => prev.map((c) => (c.id === id ? { ...c, deleting: false } : c)));
            }
        }
    };

    const handleCancelEdit = () => {
        setMode('create');
        setEditingId(null);
        setEditingType(null);
        setFormData({
            jobTitle: '',
            description: '',
            location: '',
            salary: '',
            image: '',
            jobType: '',
        });
        setErrors({});
        setAlert(null);
    };

    const validateForm = () => {
        const newErrors: { jobTitle?: string; description?: string; location?: string; salary?: string; image?: string; jobType?: string } = {};
        if (!formData.jobTitle.trim()) {
            newErrors.jobTitle = 'Job title is required';
        } else if (formData.jobTitle.length < 3) {
            newErrors.jobTitle = 'Job title must be at least 3 characters long';
        } else if (formData.jobTitle.length > 100) {
            newErrors.jobTitle = 'Job title cannot exceed 100 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        } else if (formData.description.length > 1000) {
            newErrors.description = 'Description cannot exceed 1000 characters';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        } else if (formData.location.length < 2) {
            newErrors.location = 'Location must be at least 2 characters long';
        } else if (formData.location.length > 100) {
            newErrors.location = 'Location cannot exceed 100 characters';
        }

        if (!formData.salary) {
            newErrors.salary = 'Salary is required';
        }

        if (!formData.image.trim()) {
            newErrors.image = 'Image is required';
        }

        if (!formData.jobType) {
            newErrors.jobType = 'Job type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = () => {
        if (cloudinaryWidgetRef.current) {
            cloudinaryWidgetRef.current.open();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlert(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const selectedRange = salaryRanges.find((r) => r.value === formData.salary);
            if (!selectedRange) {
                throw new Error('Invalid salary range');
            }
            const salaryValue = selectedRange.avg;
            const jobTypeMapped = formData.jobType === 'Career' ? 'Job' : 'Recruitment';
            const url = mode === 'edit' && editingId ? `/api/v1/careers?id=${editingId}` : '/api/v1/careers';
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.jobTitle.trim(),
                    description: formData.description.trim(),
                    location: formData.location.trim(),
                    salary: salaryValue,
                    image: formData.image.trim(),
                    type: jobTypeMapped,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${mode} career`);
            }

            setAlert({
                type: 'success',
                message: `Career ${mode === 'edit' ? 'updated' : 'created'} successfully!`,
            });
            handleCancelEdit();
            fetchCareers();
            fetchRecruitments();
        } catch (error) {
            setAlert({
                type: 'error',
                message: `Failed to ${mode} career. Please try again.`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='space-y-8'>
            {/* Alert */}
            {alert && (
                <div className={`p-4 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{alert.message}</div>
            )}

            {/* Requisition Form */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4'>
                    <h2 className='text-2xl font-bold text-white'>{mode === 'edit' ? 'Edit Requisition' : 'Requisition'}</h2>
                </div>

                <form onSubmit={handleSubmit} className='p-6 space-y-6'>
                    <div>
                        <Label htmlFor='jobTitle' className='text-slate-700 font-medium'>
                            Job Title
                        </Label>
                        <Input
                            id='jobTitle'
                            value={formData.jobTitle}
                            onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                            className={`mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${errors.jobTitle ? 'border-red-500' : ''}`}
                            placeholder='Enter job title'
                            disabled={isLoading}
                        />
                        {errors.jobTitle && <p className='text-red-500 text-sm mt-1'>{errors.jobTitle}</p>}
                    </div>

                    <div>
                        <Label htmlFor='description' className='text-slate-700 font-medium'>
                            Description
                        </Label>
                        <Textarea
                            id='description'
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            className={`mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px] ${
                                errors.description ? 'border-red-500' : ''
                            }`}
                            placeholder='Enter job description'
                            disabled={isLoading}
                        />
                        {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description}</p>}
                    </div>

                    <div>
                        <Label htmlFor='location' className='text-slate-700 font-medium'>
                            Location
                        </Label>
                        <Input
                            id='location'
                            value={formData.location}
                            onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                            className={`mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${errors.location ? 'border-red-500' : ''}`}
                            placeholder='Enter location'
                            disabled={isLoading}
                        />
                        {errors.location && <p className='text-red-500 text-sm mt-1'>{errors.location}</p>}
                    </div>

                    <div>
                        <Label htmlFor='salary' className='text-slate-700 font-medium'>
                            Salary
                        </Label>
                        <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, salary: value }))} disabled={isLoading}>
                            <SelectTrigger
                                className={`mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${errors.salary ? 'border-red-500' : ''}`}
                            >
                                <SelectValue placeholder='Select salary range' />
                            </SelectTrigger>
                            <SelectContent className='bg-slate-50 border border-black/30'>
                                {salaryRanges.map((range) => (
                                    <SelectItem key={range.value} className='cursor-pointer hover:bg-slate-200' value={range.value}>
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.salary && <p className='text-red-500 text-sm mt-1'>{errors.salary}</p>}
                    </div>

                    <div>
                        <Label htmlFor='jobType' className='text-slate-700 font-medium'>
                            Job Type
                        </Label>
                        <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, jobType: value }))} disabled={isLoading || mode === 'edit'}>
                            <SelectTrigger
                                className={`mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 ${errors.jobType ? 'border-red-500' : ''}`}
                            >
                                <SelectValue placeholder='Select job type' />
                            </SelectTrigger>
                            <SelectContent className='bg-slate-50 border border-black/30'>
                                <SelectItem className='cursor-pointer hover:bg-slate-200' value='Career'>
                                    Career
                                </SelectItem>
                                <SelectItem className='cursor-pointer hover:bg-slate-200' value='Recruitment Agency'>
                                    Recruitment Agency
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.jobType && <p className='text-red-500 text-sm mt-1'>{errors.jobType}</p>}
                    </div>

                    <div>
                        <Label className='text-slate-700 font-medium'>Upload Image</Label>
                        <div className='mt-2 flex items-center space-x-4'>
                            <Button
                                type='button'
                                onClick={handleImageUpload}
                                className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md'
                                disabled={isLoading}
                            >
                                <Upload className='mr-2 h-4 w-4' />
                                Choose Image
                            </Button>
                            {formData.image && (
                                <div className='text-sm text-gray-600'>
                                    Image URL: <span className='font-medium truncate'>{formData.image}</span>
                                </div>
                            )}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>Upload a single image (JPG, PNG, JPEG, max 5MB)</p>
                        {errors.image && <p className='text-red-500 text-sm mt-1'>{errors.image}</p>}
                    </div>

                    <div className='flex space-x-4'>
                        <Button
                            type='submit'
                            className='bg-gradient-to-r cursor-pointer from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2 rounded-lg shadow-lg transition-all duration-200'
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className='animate-spin w-5 h-5 mr-2 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                `${mode === 'edit' ? 'Update' : 'Create'} Career`
                            )}
                        </Button>
                        {mode === 'edit' && (
                            <Button
                                type='button'
                                onClick={handleCancelEdit}
                                className='bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 rounded-lg shadow-lg transition-all duration-200'
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Careers Section */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4'>
                    <h3 className='text-xl font-bold text-white'>Careers</h3>
                </div>

                <div className='divide-y divide-slate-200'>
                    {careers.map((career) => {
                        const count = career._count?.Applicants || 0;
                        const idStr = career.id.toString();
                        const isExpanded = expandedCareers.includes(idStr);
                        return (
                            <div key={career.id}>
                                <div className='flex items-center justify-between p-4 hover:bg-slate-50 transition-colors'>
                                    <button
                                        onClick={() => toggleCareer(career.id)}
                                        className='flex-grow text-left'
                                        disabled={career.loading || career.deleting}
                                    >
                                        <span className='font-medium text-slate-800'>{career.title}</span>
                                    </button>
                                    <div className='flex items-center space-x-4'>
                                        {count > 0 && <span className='text-slate-600'>Applicants: {count}</span>}
                                        {count > 0 &&
                                            (isExpanded ? (
                                                <ChevronDown className='w-5 h-5 text-slate-600' />
                                            ) : (
                                                <ChevronRight className='w-5 h-5 text-slate-600' />
                                            ))}
                                        <Button
                                            onClick={() => handleEdit(career, true)}
                                            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm'
                                            disabled={career.loading || career.deleting}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(career.id, true)}
                                            className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm'
                                            disabled={career.deleting || career.loading}
                                        >
                                            {career.deleting ? (
                                                <svg
                                                    className='animate-spin w-4 h-4 text-white'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                    <path
                                                        className='opacity-75'
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                    ></path>
                                                </svg>
                                            ) : (
                                                'Delete'
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className='px-4 pb-4 bg-slate-50'>
                                        {career.loading ? (
                                            <div className='flex items-center justify-center py-4'>
                                                <svg
                                                    className='animate-spin w-5 h-5 mr-2 text-slate-600'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                    <path
                                                        className='opacity-75'
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                    ></path>
                                                </svg>
                                                Loading applicants...
                                            </div>
                                        ) : career.error ? (
                                            <p className='text-red-500 py-4'>{career.error}</p>
                                        ) : career.applicants.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Phone</TableHead>
                                                        <TableHead>Resume</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {career.applicants.map((app: any) => (
                                                        <TableRow key={app.id}>
                                                            <TableCell>
                                                                {app.firstName} {app.lastName}
                                                            </TableCell>
                                                            <TableCell>{app.email}</TableCell>
                                                            <TableCell>{app.phone || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                {app.resume ? (
                                                                    <a
                                                                        href={app.resume}
                                                                        target='_blank'
                                                                        rel='noopener noreferrer'
                                                                        className='text-blue-500 hover:underline'
                                                                    >
                                                                        View Resume
                                                                    </a>
                                                                ) : (
                                                                    'No Resume'
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <p className='text-slate-600 py-4'>No applicants found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recruitment Agency Inquiries */}
            <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                <div className='bg-gradient-to-r from-green-600 to-green-700 px-6 py-4'>
                    <h3 className='text-xl font-bold text-white'>Recruitment Agency Inquiries</h3>
                </div>

                <div className='divide-y divide-slate-200'>
                    {recruitments.map((recruitment) => {
                        const count = recruitment._count?.Applicants || 0;
                        const idStr = recruitment.id.toString();
                        const isExpanded = expandedInquiries.includes(idStr);
                        return (
                            <div key={recruitment.id}>
                                <div className='flex items-center justify-between p-4 hover:bg-slate-50 transition-colors'>
                                    <button
                                        onClick={() => toggleInquiry(recruitment.id)}
                                        className='flex-grow text-left'
                                        disabled={recruitment.loading || recruitment.deleting}
                                    >
                                        <span className='font-medium text-slate-800'>Company: {recruitment.title}</span>
                                    </button>
                                    <div className='flex items-center space-x-4'>
                                        {count > 0 && <span className='text-slate-600'>Applicants: {count}</span>}
                                        {count > 0 &&
                                            (isExpanded ? (
                                                <ChevronDown className='w-5 h-5 text-slate-600' />
                                            ) : (
                                                <ChevronRight className='w-5 h-5 text-slate-600' />
                                            ))}
                                        <Button
                                            onClick={() => handleEdit(recruitment, false)}
                                            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm'
                                            disabled={recruitment.loading || recruitment.deleting}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(recruitment.id, false)}
                                            className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm'
                                            disabled={recruitment.deleting || recruitment.loading}
                                        >
                                            {recruitment.deleting ? (
                                                <svg
                                                    className='animate-spin w-4 h-4 text-white'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                    <path
                                                        className='opacity-75'
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                    ></path>
                                                </svg>
                                            ) : (
                                                'Delete'
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className='px-4 pb-4 bg-slate-50'>
                                        {recruitment.loading ? (
                                            <div className='flex items-center justify-center py-4'>
                                                <svg
                                                    className='animate-spin w-5 h-5 mr-2 text-slate-600'
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                                    <path
                                                        className='opacity-75'
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                    ></path>
                                                </svg>
                                                Loading applicants...
                                            </div>
                                        ) : recruitment.error ? (
                                            <p className='text-red-500 py-4'>{recruitment.error}</p>
                                        ) : recruitment.applicants.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Phone</TableHead>
                                                        <TableHead>Resume</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {recruitment.applicants.map((app: any) => (
                                                        <TableRow key={app.id}>
                                                            <TableCell>
                                                                {app.firstName} {app.lastName}
                                                            </TableCell>
                                                            <TableCell>{app.email}</TableCell>
                                                            <TableCell>{app.phone || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                {app.resume ? (
                                                                    <a
                                                                        href={app.resume}
                                                                        target='_blank'
                                                                        rel='noopener noreferrer'
                                                                        className='text-blue-500 hover:underline'
                                                                    >
                                                                        View Resume
                                                                    </a>
                                                                ) : (
                                                                    'No Resume'
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <p className='text-slate-600 py-4'>No applicants found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
