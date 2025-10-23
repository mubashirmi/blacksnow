'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, LogOut, Mail, MapPin, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SalesProfilePage() {
    const router = useRouter();

    const handleLogout = () => {
        // Add logout logic here
        console.log('Logging out...');
        // For now, redirect to home page
        router.push('/');
    };

    return (
        <div className='space-y-6'>
            {/* Profile Header */}
            <Card>
                <CardHeader className='pb-4'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='text-2xl font-bold'>Sales Profile</CardTitle>
                        <Button onClick={handleLogout} variant='destructive' className='flex items-center gap-2'>
                            <LogOut className='h-4 w-4' />
                            Logout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center gap-4 mb-6'>
                        <div className='w-16 h-16 bg-slate-500 rounded-full flex items-center justify-center'>
                            <User className='h-8 w-8 text-white' />
                        </div>
                        <div>
                            <h3 className='text-xl font-semibold'>Sales Representative</h3>
                            <p className='text-gray-600'>Black Snow Sales Team</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Contact Information */}
                        <div className='space-y-4'>
                            <h4 className='font-semibold text-lg'>Contact Information</h4>
                            <div className='space-y-3'>
                                <div className='flex items-center gap-3'>
                                    <Mail className='h-4 w-4 text-gray-500' />
                                    <span>sales@blacksnow.com</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Phone className='h-4 w-4 text-gray-500' />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <MapPin className='h-4 w-4 text-gray-500' />
                                    <span>New York, NY</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Calendar className='h-4 w-4 text-gray-500' />
                                    <span>Joined: January 2024</span>
                                </div>
                            </div>
                        </div>

                        {/* Sales Statistics */}
                        <div className='space-y-4'>
                            <h4 className='font-semibold text-lg'>Sales Statistics</h4>
                            <div className='space-y-3'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Total Sales:</span>
                                    <span className='font-semibold'>$125,000</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Active Campaigns:</span>
                                    <span className='font-semibold'>8</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>Conversion Rate:</span>
                                    <span className='font-semibold'>15.2%</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-gray-600'>This Month:</span>
                                    <span className='font-semibold'>$18,500</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <Button variant='outline' className='h-12 bg-transparent'>
                            Edit Profile
                        </Button>
                        <Button variant='outline' className='h-12 bg-transparent'>
                            Change Password
                        </Button>
                        <Button variant='outline' className='h-12 bg-transparent'>
                            Download Reports
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                            <span>Created new sales campaign</span>
                            <span className='text-sm text-gray-500'>2 hours ago</span>
                        </div>
                        <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                            <span>Updated client contact information</span>
                            <span className='text-sm text-gray-500'>1 day ago</span>
                        </div>
                        <div className='flex items-center justify-between py-2 border-b border-gray-100'>
                            <span>Completed sales training module</span>
                            <span className='text-sm text-gray-500'>3 days ago</span>
                        </div>
                        <div className='flex items-center justify-between py-2'>
                            <span>Generated monthly sales report</span>
                            <span className='text-sm text-gray-500'>1 week ago</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
