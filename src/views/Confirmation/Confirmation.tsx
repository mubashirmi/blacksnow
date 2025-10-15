import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, CheckCircle, Hash, Sparkles, User } from 'lucide-react';
import Link from 'next/link';

function Confirmation() {
    return (
        <div className='min-h-screen bg-[#050608] relative overflow-hidden flex items-center justify-center'>
            {/* Confirmation Card */}
            <div className='relative z-10 w-full max-w-2xl px-6'>
                {/* Success Badge */}
                <div className='text-center mb-8 animate-slide-in-up'>
                    <div className='inline-flex items-center space-x-3 bg-gradient-to-r from-green-500/10 via-emerald-500/20 to-green-500/10 backdrop-blur-2xl border border-green-400/30 rounded-full px-8 py-4 shadow-2xl shadow-green-500/20 mb-6'>
                        <CheckCircle className='w-6 h-6 text-green-400 animate-pulse' />
                        <span className='text-green-400 font-bold text-sm tracking-wider uppercase'>Success</span>
                    </div>
                </div>

                {/* Glowing Background Effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl blur-2xl opacity-60'></div>

                <Card className='relative bg-gradient-to-br from-[#050608]/95 via-[#0a0b0f]/90 to-[#050608]/95 backdrop-blur-2xl border-2 border-green-500/30 hover:border-green-400/50 transition-all duration-500 rounded-3xl overflow-hidden shadow-2xl shadow-green-500/20 animate-slide-in-up delay-200'>
                    {/* Top Border */}
                    <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600'></div>

                    <CardHeader className='p-12 text-center'>
                        {/* Success Icon */}
                        <div className='w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40 animate-bounce-slow'>
                            <CheckCircle className='w-12 h-12 text-white' />
                        </div>

                        <CardTitle className='text-4xl lg:text-5xl font-black text-white mb-6'>
                            <span className='bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent'>Confirmation</span>
                        </CardTitle>

                        <div className='space-y-4 text-center'>
                            <h2 className='text-2xl lg:text-3xl font-bold text-white'>Your webinar has been scheduled!</h2>

                            <div className='bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 max-w-md mx-auto'>
                                <p className='text-lg text-gray-300 mb-4'>
                                    Thank you <span className='text-green-400 font-bold'>Jane Doe</span> for your order.
                                </p>
                                <p className='text-base text-gray-300 mb-4'>We appreciate your business!</p>

                                {/* Order Details */}
                                <div className='flex items-center justify-center space-x-3 bg-gradient-to-r from-[#050608]/50 to-[#0a0b0f]/50 rounded-xl p-4 border border-green-500/20'>
                                    <Hash className='w-5 h-5 text-green-400' />
                                    <span className='text-white font-semibold'>Order Number:</span>
                                    <span className='text-green-400 font-black text-lg'>98765</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className='p-12 pt-0'>
                        {/* Additional Info */}
                        <div className='grid md:grid-cols-2 gap-6 mb-8'>
                            <div className='bg-gradient-to-r from-[#2c7bbe]/10 to-[#4cc7e8]/10 rounded-2xl p-6 border border-[#4cc7e8]/20 text-center'>
                                <Calendar className='w-8 h-8 text-[#4cc7e8] mx-auto mb-3' />
                                <h3 className='text-white font-bold mb-2'>Webinar Details</h3>
                                <p className='text-gray-300 text-sm'>Check your email for the webinar link and calendar invite</p>
                            </div>

                            <div className='bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 text-center'>
                                <User className='w-8 h-8 text-green-400 mx-auto mb-3' />
                                <h3 className='text-white font-bold mb-2'>Account Access</h3>
                                <p className='text-gray-300 text-sm'>Your premium account has been activated</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Button
                                asChild
                                className='bg-gradient-to-r from-[#2c7bbe] via-[#4cc7e8] to-[#2a8dcc] hover:from-[#4cc7e8] hover:via-[#2a8dcc] hover:to-[#2c7bbe] text-white font-bold py-6 px-8 text-lg shadow-2xl shadow-[#2c7bbe]/40 transition-all duration-500 transform hover:scale-105 rounded-2xl group'
                            >
                                <Link href='/dashboard'>
                                    Access Dashboard
                                    <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                                </Link>
                            </Button>

                            <Button
                                asChild
                                variant='outline'
                                className='bg-transparent border-2 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50 font-bold py-6 px-8 text-lg transition-all duration-300 rounded-2xl'
                            >
                                <Link href='/'>Return Home</Link>
                            </Button>
                        </div>
                    </CardContent>

                    {/* Floating Elements */}
                    <div className='absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow opacity-80'>
                        <Sparkles className='w-5 h-5 text-white' />
                    </div>

                    <div className='absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse opacity-60'>
                        <CheckCircle className='w-6 h-6 text-white' />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export { Confirmation };
