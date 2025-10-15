'use client';

import { Calendar, CheckCircle, Clock, Mail, Send, Upload, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

const emailCampaigns = [
    {
        id: 1,
        subject: 'Summer Sale Promo',
        recipients: 1000,
        status: 'Sent',
        sentDate: '2024-01-15',
        openRate: '24.5%',
        clickRate: '3.2%',
    },
    {
        id: 2,
        subject: 'New Product Launch',
        recipients: 500,
        status: 'Draft',
        sentDate: null,
        openRate: null,
        clickRate: null,
    },
    {
        id: 3,
        subject: 'Weekly Newsletter',
        recipients: 750,
        status: 'Scheduled',
        sentDate: '2024-01-20',
        openRate: null,
        clickRate: null,
    },
];

export default function BulkEmailCampaigns() {
    const [campaigns] = useState(emailCampaigns);
    // const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Sent':
                return <CheckCircle className='w-4 h-4 text-green-500' />;
            case 'Scheduled':
                return <Clock className='w-4 h-4 text-blue-500' />;
            case 'Draft':
                return <XCircle className='w-4 h-4 text-gray-500' />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Sent':
                return 'bg-green-100 text-green-800';
            case 'Scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'Draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-3xl font-bold text-gray-900'>Bulk Email Campaigns</h2>
                    <p className='text-gray-600 mt-1'>Create and manage your email marketing campaigns</p>
                </div>
                <button className='flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors'>
                    <Mail className='w-4 h-4' />
                    New Campaign
                </button>
            </div>

            {/* Campaign Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <Mail className='w-5 h-5 text-blue-500' />
                        <span className='text-sm font-medium text-gray-600'>Total Campaigns</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>3</div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <Users className='w-5 h-5 text-green-500' />
                        <span className='text-sm font-medium text-gray-600'>Total Recipients</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>2,250</div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <CheckCircle className='w-5 h-5 text-purple-500' />
                        <span className='text-sm font-medium text-gray-600'>Avg. Open Rate</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>24.5%</div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <Send className='w-5 h-5 text-orange-500' />
                        <span className='text-sm font-medium text-gray-600'>Avg. Click Rate</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>3.2%</div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
                <div className='p-6 border-b border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900'>Recent Campaigns</h3>
                </div>
                <div className='divide-y divide-gray-200'>
                    {campaigns.map((campaign) => (
                        <div key={campaign.id} className='p-6 hover:bg-gray-50 transition-colors'>
                            <div className='flex items-center justify-between'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <h4 className='text-lg font-medium text-gray-900'>{campaign.subject}</h4>
                                        <div
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                                        >
                                            {getStatusIcon(campaign.status)}
                                            {campaign.status}
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-6 text-sm text-gray-600'>
                                        <div className='flex items-center gap-1'>
                                            <Users className='w-4 h-4' />
                                            <span>{campaign.recipients} recipients</span>
                                        </div>
                                        {campaign.sentDate && (
                                            <div className='flex items-center gap-1'>
                                                <Calendar className='w-4 h-4' />
                                                <span>{campaign.sentDate}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='flex items-center gap-6'>
                                    {campaign.openRate && (
                                        <div className='text-center'>
                                            <div className='text-lg font-semibold text-gray-900'>{campaign.openRate}</div>
                                            <div className='text-xs text-gray-500'>Open Rate</div>
                                        </div>
                                    )}
                                    {campaign.clickRate && (
                                        <div className='text-center'>
                                            <div className='text-lg font-semibold text-gray-900'>{campaign.clickRate}</div>
                                            <div className='text-xs text-gray-500'>Click Rate</div>
                                        </div>
                                    )}
                                    <div className='flex items-center gap-2'>
                                        <button className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                                            Edit
                                        </button>
                                        <button className='px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'>
                                            View
                                        </button>
                                        {campaign.status === 'Draft' && (
                                            <button className='px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors'>
                                                Send
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create New Campaign */}
            <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quick Campaign Creator</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Campaign Subject</label>
                        <input
                            type='text'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                            placeholder='Enter email subject...'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Recipient List</label>
                        <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'>
                            <option>All Subscribers</option>
                            <option>Premium Users</option>
                            <option>New Users</option>
                            <option>Active Traders</option>
                        </select>
                    </div>
                    <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Email Content</label>
                        <textarea
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                            placeholder='Enter your email content...'
                        />
                    </div>
                    <div className='md:col-span-2 flex items-center gap-4'>
                        <button className='flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors'>
                            <Send className='w-4 h-4' />
                            Send Now
                        </button>
                        <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
                            <Calendar className='w-4 h-4' />
                            Schedule
                        </button>
                        <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
                            <Upload className='w-4 h-4' />
                            Save Draft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
