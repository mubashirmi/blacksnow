'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import lottie from 'lottie-web';
import { DollarSign, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

interface Job {
    id: number;
    title: string;
    description: string;
    location: string;
    salary: number;
    image: string;
    createdAt: string;
    deleted: boolean;
    _count: {
        Applicants: number;
    };
}

type UIJob = {
    id: number;
    title: string;
    description: string;
    location: string;
    image: string;
    salary: string; // formatted
    posted: string; // relative
    applicants: string; // formatted
};

function Careers() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

    const [formData, setFormData] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    // Resume upload state
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeUrl, setResumeUrl] = useState<string>('');
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const LottieAnimation = ({ src, loop = true, autoplay = true, style }) => {
        const containerRef = useRef<HTMLDivElement>(null);
        useEffect(() => {
            if (containerRef.current) {
                const animation = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop,
                    autoplay,
                    path: src,
                });
                return () => animation.destroy();
            }
        }, [src, loop, autoplay]);

        return <div ref={containerRef} style={style} />;
    };

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/v1/careers/?CareerType=Job', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch careers');
                }

                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data.careers)) {
                    setJobs(data.data.careers.filter((job: Job) => !job.deleted));
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                setAlert({
                    type: 'error',
                    message: 'Failed to load careers. Please try again.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const formatJobs = (jobs: Job[]): UIJob[] => {
        return jobs.map((job) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            location: job.location,
            image: job.image,
            salary: `$${job.salary.toLocaleString()}`,
            posted: formatPostedTime(job.createdAt),
            applicants: `${job._count.Applicants} applicant${job._count.Applicants !== 1 ? 's' : ''}`,
        }));
    };

    const formatPostedTime = (createdAt: string) => {
        const now = new Date();
        const postedDate = new Date(createdAt);
        const diffDays = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
    };

    const handleApplyClick = (jobId: number) => {
        setSelectedJobId(jobId);
        // Reset resume state on each open to avoid mixing files between jobs
        setResumeFile(null);
        setResumeUrl('');
        setUploadProgress(0);
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // --------------- Cloudinary upload ---------------
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const uploadResumeToCloudinary = (file: File) =>
        new Promise<string>((resolve, reject) => {
            if (!cloudName || !uploadPreset) {
                reject(new Error('Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'));
                return;
            }

            const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', uploadPreset);
            fd.append('folder', 'careers/resumes');

            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                try {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const json = JSON.parse(xhr.responseText);
                        const secureUrl = json.secure_url as string;
                        if (!secureUrl) {
                            reject(new Error('No secure_url returned from Cloudinary.'));
                            return;
                        }
                        resolve(secureUrl);
                    } else {
                        reject(new Error(`Cloudinary upload failed (${xhr.status})`));
                    }
                } catch (err) {
                    reject(new Error('Invalid Cloudinary response.'));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload.'));
            xhr.send(fd);
        });

    const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setResumeUrl('');
        setUploadProgress(0);

        if (!file) {
            setResumeFile(null);
            return;
        }

        // Validate PDF & size (<= 10MB)
        if (file.type !== 'application/pdf') {
            setAlert({ type: 'error', message: 'Please upload a PDF file.' });
            e.target.value = '';
            return;
        }
        const maxBytes = 10 * 1024 * 1024;
        if (file.size > maxBytes) {
            setAlert({ type: 'error', message: 'File too large. Max size is 10MB.' });
            e.target.value = '';
            return;
        }

        setResumeFile(file);
        setIsUploadingResume(true);

        try {
            const url = await uploadResumeToCloudinary(file);
            setResumeUrl(url);
            setAlert({ type: 'success', message: 'Resume uploaded successfully.' });
        } catch (err: any) {
            setAlert({
                type: 'error',
                message: err?.message || 'Failed to upload resume. Please try again.',
            });
            setResumeFile(null);
            setResumeUrl('');
        } finally {
            setIsUploadingResume(false);
        }
    };
    // -----------------------------------------------

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedJobId) {
            setAlert({ type: 'error', message: 'No job selected.' });
            return;
        }

        if (!resumeUrl) {
            setAlert({
                type: 'error',
                message: 'Please upload your PDF resume before submitting.',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/v1/careers/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    careersId: selectedJobId,
                    resume: resumeUrl, // send the secure Cloudinary URL
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit application');
            }

            setIsModalOpen(false);
            setSuccessModalOpen(true);
            setFormData({ firstName: '', lastName: '', email: '', phone: '' });
            setResumeFile(null);
            setResumeUrl('');
            setUploadProgress(0);
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to submit application. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden'>
            {/* Alert */}
            {alert && (
                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg ${
                        alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {alert.message}
                </div>
            )}

            {/* Header */}
            <div className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-7xl text-center'>
                    <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-5 animate-slide-in-up delay-200'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Career </span>
                        <span className='text-white'> Opportunities</span>
                    </h1>

                    <p className='text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-slide-in-up delay-400'>
                        Join the elite trading community and advance your career with top-tier financial institutions
                    </p>
                </div>
            </div>

            <div className='relative z-10 py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-7xl'>
                    {isLoading ? (
                        <div className='flex justify-center items-center py-16'>
                            <div className='dot-spinner'>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                                <div className='dot-spinner__dot'></div>
                            </div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className='text-center py-16 text-gray-300'>No careers available at the moment.</div>
                    ) : (
                        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                            {formatJobs(jobs).map((job, index) => (
                                <div key={job.id} className='group relative animate-slide-in-up' style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className='absolute inset-0 bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60'></div>

                                    <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-[#2c7bbe]/20 hover:border-[#4cc7e8]/40 transition-all duration-500 rounded-3xl overflow-hidden transform hover:scale-105 hover:-translate-y-2 shadow-lg shadow-[#2c7bbe]/10 group'>
                                        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>

                                        <div className='relative overflow-hidden'>
                                            <Image
                                                src={job.image || '/placeholder.svg'}
                                                alt={job.title}
                                                width={300}
                                                height={200}
                                                className='w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500'
                                            />
                                            <div className='absolute inset-0 bg-gradient-to-t from-[#050608]/60 via-transparent to-transparent'></div>

                                            <div className='absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1'>
                                                <span className='text-white text-xs font-semibold'>{job.posted}</span>
                                            </div>
                                        </div>

                                        <CardHeader className='p-6'>
                                            <CardTitle className='text-xl font-bold text-white mb-2 group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                {job.title}
                                            </CardTitle>
                                            <p className='text-gray-300 leading-relaxed text-sm line-clamp-2'>{job.description}</p>
                                        </CardHeader>

                                        <CardContent className='p-6 pt-0'>
                                            <div className='space-y-3 mb-6'>
                                                <div className='flex items-center space-x-3 text-sm'>
                                                    <div className='w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-lg flex items-center justify-center'>
                                                        <MapPin className='w-4 h-4 text-[#4cc7e8]' />
                                                    </div>
                                                    <span className='text-gray-300'>{job.location}</span>
                                                </div>

                                                <div className='flex items-center space-x-3 text-sm'>
                                                    <div className='w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-lg flex items-center justify-center'>
                                                        <DollarSign className='w-4 h-4 text-[#4cc7e8]' />
                                                    </div>
                                                    <span className='text-gray-300 font-semibold'>{job.salary}</span>
                                                </div>

                                                <div className='flex items-center space-x-3 text-sm'>
                                                    <div className='w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-lg flex items-center justify-center'>
                                                        <Users className='w-4 h-4 text-[#4cc7e8]' />
                                                    </div>
                                                    <span className='text-gray-400'>{job.applicants}</span>
                                                </div>
                                            </div>

                                            <Button
                                                className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] cursor-pointer text-white font-bold transition-all duration-300 group/btn'
                                                onClick={() => handleApplyClick(job.id)}
                                            >
                                                Apply Now
                                            </Button>
                                        </CardContent>

                                        <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Final CTA */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div>
                            <Badge className='uppercase bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                START YOUR CAMPAIGN TODAY
                            </Badge>
                            <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-5'>
                                Ready to <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Transform</span>
                                <br />
                                Your Marketing?
                            </h2>
                            <p className='text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-4 sm:mb-5'>
                                Join thousands of successful businesses who have chosen our email marketing platform to drive engagement, increase conversions,
                                and grow their revenue.
                            </p>
                            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4'>
                                <Link href={'/login'}>
                                    <Button
                                        size='lg'
                                        className='group border-2 box-border border-[#4cc7e8] bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold shadow-lg shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px]'
                                    >
                                        Join Now
                                    </Button>
                                </Link>
                                <Link href={'/pricing'}>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] px-8 sm:px-10 md:px-12 py-5 sm:py-6 text-base sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 rounded-lg w-full sm:w-[300px] bg-transparent'
                                    >
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <div className='relative'>
                                <div className='absolute inset-0 w-96 h-96 bg-gradient-to-br from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-full blur-2xl'></div>
                                <div className='relative w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center shadow-2xl backdrop-blur-xl p-8'>
                                    <LottieAnimation src='/animations/emailmarketingicon.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className='bg-[#050608] border-2 border-[#2c7bbe]/40 text-white'>
                    <DialogHeader>
                        <DialogTitle className='text-2xl font-bold text-[#4cc7e8]'>Apply for Job</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className='space-y-4'>
                        <div>
                            <Label htmlFor='firstName' className='text-gray-300'>
                                First Name
                            </Label>
                            <Input
                                placeholder='Enter your first name'
                                id='firstName'
                                name='firstName'
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className='bg-[#0a0b0f] border-[#2c7bbe]/40 text-white'
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor='lastName' className='text-gray-300'>
                                Last Name
                            </Label>
                            <Input
                                placeholder='Enter your last name'
                                id='lastName'
                                name='lastName'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className='bg-[#0a0b0f] border-[#2c7bbe]/40 text-white'
                                required
                            />
                        </div>
                        <div>
                            {/* <Label htmlFor='email' className='text-gray-300'>
                                Email
                            </Label> */}
                            <Input
                                placeholder='Enter your email'
                                id='email'
                                name='email'
                                type='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                className='bg-[#0a0b0f] border-[#2c7bbe]/40 text-white'
                                required
                            />
                        </div>
                        <div>
                            {/* <Label htmlFor='phone' className='text-gray-300'>
                                Phone
                            </Label> */}
                            <Input
                                placeholder='Enter your phone number'
                                id='phone'
                                name='phone'
                                value={formData.phone}
                                onChange={handleInputChange}
                                className='bg-[#0a0b0f] border-[#2c7bbe]/40 text-white'
                                required
                            />
                        </div>

                        {/* Resume PDF Upload */}
                        <div>
                            <Label htmlFor='resume' className='text-gray-300 block mb-2'>
                                Resume (PDF)
                            </Label>

                            {/* Hide default file input */}
                            <input
                                id='resume'
                                name='resume'
                                type='file'
                                accept='application/pdf'
                                onChange={handleResumeFileChange}
                                className='hidden'
                                required
                            />

                            {/* Custom Button */}
                            <label
                                htmlFor='resume'
                                className='inline-flex items-center justify-start px-4 py-2 rounded-md bg-[#0a0b0f] border border-[#2c7bbe]/40 text-[#4cc7e8] font-semibold w-full text-sm cursor-pointer hover:bg-[#10131a] transition'
                            >
                                Choose File
                            </label>

                            {/* Show filename or 'No file chosen' */}
                            <div className='mt-2 text-sm text-gray-400 flex justify-center items-center'>
                                {resumeFile ? (
                                    <span className='text-green-400'>{resumeFile.name}</span>
                                ) : (
                                    <span className='text-gray-500 italic'>No file chosen</span>
                                )}
                            </div>

                            {/* Upload state feedback */}
                            <div className='mt-2 text-sm text-gray-400'>
                                {isUploadingResume && (
                                    <div className='flex items-center gap-2 justify-center'>
                                        <svg className='animate-spin w-4 h-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 
               0 5.373 0 12h4zm2 5.291A7.962 
               7.962 0 014 12H0c0 3.042 
               1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                        Uploading… {uploadProgress}%
                                    </div>
                                )}

                                {!isUploadingResume && resumeUrl && (
                                    <span className='text-green-400 flex justify-center'>Uploaded ✓ Your resume is attached.</span>
                                )}
                                {!isUploadingResume && !resumeUrl && resumeFile && (
                                    <span className='text-red-400 flex justify-center'>Upload failed. Please try again.</span>
                                )}

                                <div className='text-xs text-gray-500 mt-1 text-center'>PDF only, up to 10MB.</div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => setIsModalOpen(false)}
                                className='border-[#2c7bbe] text-[#4cc7e8] hover:bg-[#2c7bbe]/20 cursor-pointer'
                            >
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                disabled={isSubmitting || isUploadingResume || !resumeUrl}
                                className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] cursor-pointer hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white disabled:opacity-60'
                            >
                                {isSubmitting ? (
                                    <svg className='animate-spin w-5 h-5 mr-2' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                ) : null}
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
                <DialogContent className='bg-[#050608] border-2 border-[#2c7bbe]/40 text-white'>
                    <DialogHeader>
                        <DialogTitle className='text-2xl font-bold text-[#4cc7e8]'>Application Submitted Successfully</DialogTitle>
                    </DialogHeader>
                    <p className='text-gray-300'>
                        Thank you for submitting your application. We will review your details and inform you by email regarding the further procedure.
                    </p>
                    <DialogFooter>
                        <Button
                            onClick={() => setSuccessModalOpen(false)}
                            className='bg-gradient-to-r cursor-pointer from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white'
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export { Careers };
