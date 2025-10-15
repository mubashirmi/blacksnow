'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Mail, User, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        agreeToTerms: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            agreeToTerms: checked,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.agreeToTerms) {
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSuccess(true);

        // Reset form after success
        setTimeout(() => {
            setIsSuccess(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                agreeToTerms: false,
            });
            onClose();
        }, 2000);
    };

    const isFormValid = formData.firstName && formData.lastName && formData.email && formData.agreeToTerms;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-md bg-gradient-to-br from-[#050608] via-[#0a0b0f] to-[#050608] border-2 border-[#2c7bbe]/30 shadow-2xl shadow-[#2c7bbe]/20 backdrop-blur-2xl'>
                {/* Custom Close Button */}
                <button
                    onClick={onClose}
                    className='absolute right-4 top-4 w-8 h-8 bg-gradient-to-r from-[#2c7bbe]/20 to-[#4cc7e8]/20 rounded-full flex items-center justify-center border border-[#2c7bbe]/30 hover:border-[#4cc7e8]/50 transition-all duration-300 group z-10'
                >
                    <X className='w-4 h-4 text-[#4cc7e8] group-hover:text-white transition-colors duration-300' />
                </button>

                {!isSuccess ? (
                    <>
                        <DialogHeader className='space-y-6 pb-6'>
                            <div className='flex items-center space-x-4'>
                                <div className='w-12 h-12 bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] rounded-2xl flex items-center justify-center shadow-xl'>
                                    <Mail className='w-6 h-6 text-white' />
                                </div>
                                <div>
                                    <DialogTitle className='text-2xl font-black text-white'>Join Our Elite Newsletter</DialogTitle>
                                    <DialogDescription className='text-[#4cc7e8] font-semibold'>
                                        Get exclusive trading insights and market analysis
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className='space-y-6'>
                            {/* First Name */}
                            <div className='space-y-2'>
                                <Label htmlFor='firstName' className='text-white font-semibold flex items-center'>
                                    <User className='w-4 h-4 mr-2 text-[#4cc7e8]' />
                                    First Name
                                </Label>
                                <Input
                                    id='firstName'
                                    type='text'
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    placeholder='Enter your first name'
                                    className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold focus:border-[#4cc7e8]/50 transition-colors duration-300'
                                    required
                                />
                            </div>

                            {/* Last Name */}
                            <div className='space-y-2'>
                                <Label htmlFor='lastName' className='text-white font-semibold flex items-center'>
                                    <User className='w-4 h-4 mr-2 text-[#4cc7e8]' />
                                    Last Name
                                </Label>
                                <Input
                                    id='lastName'
                                    type='text'
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    placeholder='Enter your last name'
                                    className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold focus:border-[#4cc7e8]/50 transition-colors duration-300'
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className='space-y-2'>
                                <Label htmlFor='email' className='text-white font-semibold flex items-center'>
                                    <Mail className='w-4 h-4 mr-2 text-[#4cc7e8]' />
                                    Email Address
                                </Label>
                                <Input
                                    id='email'
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder='Enter your email address'
                                    className='bg-[#050608]/50 border-[#2c7bbe]/30 text-white placeholder:text-gray-400 backdrop-blur-sm font-semibold focus:border-[#4cc7e8]/50 transition-colors duration-300'
                                    required
                                />
                            </div>

                            {/* Terms and Conditions Checkbox */}
                            <div className='flex items-start space-x-3 p-4 bg-gradient-to-r from-[#2c7bbe]/5 to-[#4cc7e8]/5 rounded-2xl border border-[#2c7bbe]/20'>
                                <Checkbox
                                    id='terms'
                                    checked={formData.agreeToTerms}
                                    onCheckedChange={handleCheckboxChange}
                                    className='mt-1 border-[#2c7bbe] data-[state=checked]:bg-[#4cc7e8] data-[state=checked]:border-[#4cc7e8]'
                                />
                                <div className='space-y-1'>
                                    <Label htmlFor='terms' className='text-sm text-gray-300 leading-relaxed cursor-pointer'>
                                        I agree to the{' '}
                                        <span className='text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300 underline cursor-pointer'>
                                            Terms & Conditions
                                        </span>{' '}
                                        and{' '}
                                        <span className='text-[#4cc7e8] hover:text-[#2c7bbe] transition-colors duration-300 underline cursor-pointer'>
                                            Privacy Policy
                                        </span>
                                    </Label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type='submit'
                                disabled={!isFormValid || isSubmitting}
                                className='w-full bg-gradient-to-r from-[#2c7bbe] to-[#4cc7e8] hover:from-[#4cc7e8] hover:to-[#2c7bbe] text-white font-black py-6 text-lg shadow-2xl shadow-[#2c7bbe]/50 hover:shadow-[#4cc7e8]/60 transition-all duration-500 transform hover:scale-105 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                            >
                                {isSubmitting ? (
                                    <div className='flex items-center space-x-2'>
                                        <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                        <span>Subscribing...</span>
                                    </div>
                                ) : (
                                    'Subscribe to Newsletter'
                                )}
                            </Button>
                        </form>
                    </>
                ) : (
                    /* Success State */
                    <div className='text-center py-8 space-y-6'>
                        <div className='w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce'>
                            <CheckCircle className='w-8 h-8 text-white' />
                        </div>
                        <div>
                            <h3 className='text-2xl font-black text-white mb-2'>Welcome to Black Snow!</h3>
                            <p className='text-gray-300 leading-relaxed'>
                                Thank you for subscribing! You&apos;ll receive our latest trading insights and market analysis directly in your inbox.
                            </p>
                        </div>
                        <div className='flex items-center justify-center space-x-2 text-green-400 font-semibold'>
                            <CheckCircle className='w-5 h-5' />
                            <span>Subscription Confirmed</span>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
