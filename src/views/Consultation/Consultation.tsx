'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import lottie from 'lottie-web';
import { ArrowRight, Award, BarChart3, Calendar, CheckCircle, Clock, Globe, Heart, Settings, Shield, Target, Users, X, Zap } from 'lucide-react';
import Link from 'next/link';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';

function Consultation() {
    const LottieAnimation: React.FC<{ src: string; loop?: boolean; autoplay?: boolean; style?: CSSProperties }> = ({
        src,
        loop = true,
        autoplay = true,
        style,
    }) => {
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

    const services = [
        {
            title: 'Tailored Recruitment Solutions',
            description: 'We customize our services to meet your unique hiring needs, ensuring the perfect fit for your team.',
            icon: Target,
            color: 'from-[#4cc7e8] to-[#2c7bbe]',
        },
        {
            title: 'Access to Top Talent',
            description: 'Our extensive network gives you access to a diverse pool of qualified candidates, ready to elevate your business.',
            icon: Users,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
        },
        {
            title: 'Streamlined Hiring Process',
            description: 'We handle the heavy lifting from sourcing to interviewing, allowing you to focus on what you do best—running your business.',
            icon: Zap,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
        },
        {
            title: 'Industry Expertise',
            description: "Our team specializes in various sectors, bringing in-depth knowledge to find candidates who understand your industry's challenges.",
            icon: Award,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
        },
        {
            title: 'Time and Cost Efficiency',
            description: 'Reduce hiring time and costs by leveraging our proven strategies and resources, enabling you to onboard talent faster.',
            icon: Clock,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
        },
        {
            title: 'Comprehensive Screening',
            description: 'We conduct thorough background checks and assessments to ensure candidates meet your high standards before you meet them.',
            icon: Shield,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
        },
        {
            title: 'Flexible Engagement Models',
            description:
                'Whether you need temporary staffing, permanent placements, or executive search, we offer flexible solutions that suit your business model.',
            icon: Settings,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
        },
        {
            title: 'Ongoing Support',
            description:
                "Our partnership doesn't end once a candidate is placed. We provide continuous support to ensure smooth integration and long-term success.",
            icon: Heart,
            color: 'from-[#2c7bbe] to-[#4cc7e8]',
        },
        {
            title: 'Proven Track Record',
            description: 'With a history of successful placements, our satisfied clients are a testament to our commitment to excellence in recruitment.',
            icon: BarChart3,
            color: 'from-[#4cc7e8] to-[#2a8dcc]',
        },
        {
            title: 'Commitment to Diversity and Inclusion',
            description: 'We prioritize diverse talent acquisition, helping you build a more inclusive workplace that drives innovation and success.',
            icon: Globe,
            color: 'from-[#2a8dcc] to-[#2c7bbe]',
        },
    ];

    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        location: '',
        title: '',
        email: '',
        phone: '',
        numOfPositions: '',
        dateTime: '',
    });

    const [errors, setErrors] = useState<{
        name?: string;
        companyName?: string;
        location?: string;
        title?: string;
        email?: string;
        phone?: string;
        numOfPositions?: string;
        dateTime?: string;
        terms?: string;
        privacy?: string;
    }>({});

    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters long';
        else if (formData.name.length > 100) newErrors.name = 'Name cannot exceed 100 characters';

        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        else if (formData.companyName.length < 2) newErrors.companyName = 'Company name must be at least 2 characters long';
        else if (formData.companyName.length > 100) newErrors.companyName = 'Company name cannot exceed 100 characters';

        if (!formData.location.trim()) newErrors.location = 'Location is required';
        else if (formData.location.length < 2) newErrors.location = 'Location must be at least 2 characters long';
        else if (formData.location.length > 100) newErrors.location = 'Location cannot exceed 100 characters';

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        else if (formData.title.length < 2) newErrors.title = 'Title must be at least 2 characters long';
        else if (formData.title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';

        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Please enter a valid phone number';

        if (!formData.numOfPositions) newErrors.numOfPositions = 'Number of positions is required';

        if (!formData.dateTime) newErrors.dateTime = 'Preferred date and time is required';
        else {
            const selectedDate = new Date(formData.dateTime);
            const now = new Date();
            if (selectedDate < now) newErrors.dateTime = 'Date and time must be in the future';
        }

        if (!isTermsChecked) newErrors.terms = 'You must agree to the terms and conditions';
        if (!isPrivacyChecked) newErrors.privacy = 'You must agree to the privacy policy';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const numOfPositionsValue = parseInt(formData.numOfPositions.split('-')[0]) || parseInt(formData.numOfPositions.replace('+', '')) || 50;

            const response = await fetch('/api/v1/consultation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    companyName: formData.companyName.trim(),
                    location: formData.location.trim(),
                    title: formData.title.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    numOfPositions: numOfPositionsValue,
                    dateTime: new Date(formData.dateTime).toISOString(),
                }),
            });

            if (!response.ok) throw new Error('Failed to schedule consultation');

            setIsSuccessModalOpen(true);
            setFormData({
                name: '',
                companyName: '',
                location: '',
                title: '',
                email: '',
                phone: '',
                numOfPositions: '',
                dateTime: '',
            });
            setIsTermsChecked(false);
            setIsPrivacyChecked(false);
            setErrors({});
        } catch (error) {
            setSubmitError('Failed to schedule consultation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#050608] overflow-hidden relative'>
            {/* Error Toast */}
            {submitError && (
                <div className='fixed top-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-red-500/20 backdrop-blur-xl border border-red-500/50 text-red-300 text-sm font-medium shadow-2xl z-50 animate-slide-down'>
                    {submitError}
                </div>
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={() => setIsSuccessModalOpen(false)} />
                    <div className='relative w-full max-w-lg mx-auto rounded-3xl bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border border-[#2c7bbe]/40 p-8 shadow-2xl animate-scale-in'>
                        <div className='flex items-start justify-between mb-6'>
                            <div className='flex items-center space-x-4'>
                                <div className='w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center shadow-lg'>
                                    <CheckCircle className='w-8 h-8 text-green-400' />
                                </div>
                                <div>
                                    <h3 className='text-2xl font-black text-white'>Consultation Booked!</h3>
                                    <p className='text-gray-300 mt-1'>We’ll reach out shortly with confirmation details.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className='p-2 rounded-xl hover:bg-white/10 transition-colors'
                                aria-label='Close'
                            >
                                <X className='w-5 h-5 text-white' />
                            </button>
                        </div>

                        <div className='h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mb-6' />

                        <div className='flex flex-col sm:flex-row gap-3'>
                            <Button
                                onClick={() => setIsSuccessModalOpen(false)}
                                className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white font-bold px-8 py-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all'
                            >
                                Done
                            </Button>
                            <Button
                                variant='outline'
                                onClick={() => setIsSuccessModalOpen(false)}
                                className='border-2 border-[#4cc7e8] text-[#4cc7e8] hover:bg-[#4cc7e8] hover:text-[#050608] font-bold px-8 py-6 rounded-2xl bg-transparent'
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-7xl text-center'>
                    <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                        PROFESSIONAL RECRUITMENT SERVICES
                    </Badge>
                    <h1 className='text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4 sm:mb-5 leading-tight'>
                        <span className='bg-gradient-to-r from-[#4cc7e8] via-[#2c7bbe] to-[#2a8dcc] bg-clip-text text-transparent'>Black Snow</span>
                        <br />
                        Recruitment Agency
                    </h1>
                    <div className='w-96 h-2 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] rounded-full mx-auto'></div>
                </div>
            </section>

            {/* Main Content */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 mb-32'>
                        {/* Left: Agency Info */}
                        <div className='space-y-10 animate-slide-in-left'>
                            <div className='space-y-8'>
                                <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight'>
                                    <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Connecting Companies</span>
                                    <br />
                                    with Exceptional Talent
                                </h2>
                                <p className='text-lg sm:text-xl text-gray-300 leading-relaxed'>
                                    At Black Snow Recruitment Agency, we are dedicated to connecting companies with exceptional talent tailored to their
                                    specific needs. Our team of experienced recruiters leverages extensive industry knowledge and a vast network of candidates
                                    to streamline the hiring process, ensuring you find the perfect fit for your organization.
                                </p>
                                <p className='text-lg text-gray-300 leading-relaxed'>
                                    With a commitment to <span className='text-[#4cc7e8] font-semibold'>excellence, diversity, and long-term partnerships</span>
                                    , we empower businesses to thrive by providing{' '}
                                    <span className='text-[#2c7bbe] font-semibold'>top-tier recruitment solutions</span> that drive success.
                                </p>
                            </div>
                        </div>

                        {/* Right: Consultation Form */}
                        <div className='relative animate-slide-in-right'>
                            <Card className='bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border-2 border-[#2c7bbe]/30 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden'>
                                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc]'></div>
                                <CardHeader className='p-8 pb-6'>
                                    <CardTitle className='text-3xl font-black text-white flex items-center'>
                                        <Calendar className='w-8 h-8 text-[#4cc7e8] mr-3' />
                                        Schedule Consultation
                                    </CardTitle>
                                    <p className='text-gray-300 mt-2'>Ready to find your perfect candidates? Book a free consultation with our experts.</p>
                                </CardHeader>
                                <CardContent className='p-8 pt-0'>
                                    <form onSubmit={handleSubmit} className='space-y-6'>
                                        {/* Company Name */}
                                        <div className='space-y-2'>
                                            <Input
                                                id='companyName'
                                                value={formData.companyName}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                                                placeholder='Company Name'
                                                className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                    errors.companyName ? 'border-red-500' : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.companyName && <p className='text-red-500 text-sm'>{errors.companyName}</p>}
                                        </div>

                                        {/* Location */}
                                        <div className='space-y-2'>
                                            <Input
                                                id='location'
                                                value={formData.location}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                                                placeholder='Location'
                                                className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                    errors.location ? 'border-red-500' : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.location && <p className='text-red-500 text-sm'>{errors.location}</p>}
                                        </div>

                                        {/* Title */}
                                        <div className='space-y-2'>
                                            <Input
                                                id='title'
                                                value={formData.title}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                                placeholder='Your Job Title'
                                                className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                    errors.title ? 'border-red-500' : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.title && <p className='text-red-500 text-sm'>{errors.title}</p>}
                                        </div>

                                        {/* Name */}
                                        <div className='space-y-2'>
                                            <Input
                                                id='name'
                                                value={formData.name}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                placeholder='Full Name'
                                                className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                    errors.name ? 'border-red-500' : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.name && <p className='text-red-500 text-sm'>{errors.name}</p>}
                                        </div>

                                        {/* Email */}
                                        <div className='space-y-2'>
                                            <Input
                                                id='email'
                                                type='email'
                                                value={formData.email}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                                placeholder='Work Email'
                                                className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                    errors.email ? 'border-red-500' : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
                                        </div>

                                        {/* Phone */}
                                        <div className='space-y-2'>
                                            <Input
                                                id='phone'
                                                type='tel'
                                                value={formData.phone}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                                placeholder='Phone Number'
                                                className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-500 focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                    errors.phone ? 'border-red-500' : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.phone && <p className='text-red-500 text-sm'>{errors.phone}</p>}
                                        </div>

                                        {/* Positions */}
                                        <div className='space-y-2'>
                                            <Select
                                                value={formData.numOfPositions}
                                                onValueChange={(value) => setFormData((prev) => ({ ...prev, numOfPositions: value }))}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger
                                                    className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                        errors.numOfPositions ? 'border-red-500' : ''
                                                    }`}
                                                >
                                                    <SelectValue placeholder='Number of positions' />
                                                </SelectTrigger>
                                                <SelectContent className='bg-[#0a0b0f] border-[#2c7bbe]/30 rounded-2xl'>
                                                    <SelectItem value='1-5'>1–5 positions</SelectItem>
                                                    <SelectItem value='6-10'>6–10 positions</SelectItem>
                                                    <SelectItem value='11-25'>11–25 positions</SelectItem>
                                                    <SelectItem value='26-50'>26–50 positions</SelectItem>
                                                    <SelectItem value='50+'>50+ positions</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.numOfPositions && <p className='text-red-500 text-sm'>{errors.numOfPositions}</p>}
                                        </div>

                                        {/* DateTime */}
                                        <div className='space-y-2'>
                                            <Input
                                                id='dateTime'
                                                type='datetime-local'
                                                value={formData.dateTime}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, dateTime: e.target.value }))}
                                                className={`bg-[#0a0b0f]/50 border-[#2c7bbe]/30 text-white focus:border-[#4cc7e8] transition-colors duration-300 rounded-2xl ${
                                                    errors.dateTime ? 'border-red-500' : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors.dateTime && <p className='text-red- r500 text-sm'>{errors.dateTime}</p>}
                                        </div>

                                        {/* Checkboxes */}
                                        <div className='space-y-4'>
                                            <div className='flex items-center space-x-3'>
                                                <Checkbox
                                                    id='terms'
                                                    checked={isTermsChecked}
                                                    onCheckedChange={(checked) => setIsTermsChecked(!!checked)}
                                                    className={`border-[#2c7bbe] data-[state=checked]:bg-[#4cc7e8] data-[state=checked]:border-[#4cc7e8] rounded-lg ${
                                                        errors.terms ? 'border-red-500' : ''
                                                    }`}
                                                    disabled={isLoading}
                                                />
                                                <Label htmlFor='terms' className='text-gray-300 text-sm leading-tight'>
                                                    I agree to the{' '}
                                                    <Link href='#' className='text-[#4cc7e8] hover:underline font-medium'>
                                                        Terms and Conditions
                                                    </Link>
                                                </Label>
                                            </div>
                                            {errors.terms && <p className='text-red-500 text-sm'>{errors.terms}</p>}

                                            <div className='flex items-center space-x-3'>
                                                <Checkbox
                                                    id='privacy'
                                                    checked={isPrivacyChecked}
                                                    onCheckedChange={(checked) => setIsPrivacyChecked(!!checked)}
                                                    className={`border-[#2c7bbe] data-[state=checked]:bg-[#4cc7e8] data-[state=checked]:border-[#4cc7e8] rounded-lg ${
                                                        errors.privacy ? 'border-red-500' : ''
                                                    }`}
                                                    disabled={isLoading}
                                                />
                                                <Label htmlFor='privacy' className='text-gray-300 text-sm leading-tight'>
                                                    I agree to the{' '}
                                                    <Link href='#' className='text-[#4cc7e8] hover:underline font-medium'>
                                                        Privacy Policy
                                                    </Link>
                                                </Label>
                                            </div>
                                            {errors.privacy && <p className='text-red-500 text-sm'>{errors.privacy}</p>}
                                        </div>

                                        {/* Submit */}
                                        <Button
                                            type='submit'
                                            size='lg'
                                            className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2a8dcc] text-white py-6 text-lg font-bold shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed rounded-2xl'
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className='animate-spin w-6 h-6 mr-3' viewBox='0 0 24 24'>
                                                        <circle
                                                            className='opacity-25'
                                                            cx='12'
                                                            cy='12'
                                                            r='10'
                                                            stroke='currentColor'
                                                            strokeWidth='4'
                                                            fill='none'
                                                        />
                                                        <path
                                                            className='opacity-75'
                                                            fill='currentColor'
                                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                        />
                                                    </svg>
                                                    Scheduling...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className='w-6 h-6 mr-3' />
                                                    Confirm Consultation
                                                    <ArrowRight className='w-5 h-5 ml-3' />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div className='space-y-12'>
                        <h2 className='text-4xl sm:text-5xl md:text-6xl font-black text-white text-center'>
                            <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Our Comprehensive</span> Services
                        </h2>
                        <div className='grid md:grid-cols-2 gap-6'>
                            {services.map((service, index) => (
                                <Card
                                    key={index}
                                    className='group bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 rounded-2xl overflow-hidden animate-slide-in-up'
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardContent className='p-6 sm:p-8'>
                                        <div className='flex items-start space-x-4'>
                                            <div
                                                className={`w-14 h-14 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                                            >
                                                <service.icon className='w-7 h-7 text-white' />
                                            </div>
                                            <div>
                                                <h4 className='text-xl font-bold text-white group-hover:text-[#4cc7e8] transition-colors duration-300'>
                                                    {service.title}
                                                </h4>
                                                <p className='text-gray-300 text-sm sm:text-base leading-relaxed mt-2'>{service.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className='relative py-10 sm:py-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#0a0b0f] via-[#050608] to-[#0a0b0f]'>
                <div className='container mx-auto max-w-8xl'>
                    <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
                        <div>
                            <Badge className='bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] text-white mb-4 sm:mb-5 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-xs sm:text-sm font-bold'>
                                READY TO GET STARTED?
                            </Badge>
                            <h2 className='text-5xl sm:text-6xl font-black text-white leading-tight mb-4 sm:mb-5'>
                                Let&apos;s Find Your <span className='bg-gradient-to-r from-[#4cc7e8] to-[#2c7bbe] bg-clip-text text-transparent'>Perfect</span>
                                <br />
                                Candidates
                            </h2>
                            <p className='text-lg sm:text-xl text-gray-300 leading-relaxed'>
                                Partner with Black Snow Recruitment Agency and experience the difference that professional, dedicated recruitment services can
                                make for your organization. Let&apos;s build your dream team together.
                            </p>
                        </div>

                        <div className='flex justify-center'>
                            <div className='relative'>
                                <div className='w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-[#050608]/90 via-[#0a0b0f]/95 to-[#050608]/90 rounded-3xl border border-[#2c7bbe]/30 flex items-center justify-center shadow-2xl backdrop-blur-xl p-8'>
                                    <LottieAnimation src='/animations/consultationicon2.json' loop={true} autoplay={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export { Consultation };
