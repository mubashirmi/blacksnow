'use client';

import { Calendar, DollarSign, Edit, Eye, Plus, Trash2, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

const campaigns = [
    {
        id: 1,
        name: 'Summer Campaign',
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        status: 'Active',
        clicks: 150,
        conversions: 12,
        revenue: '$1,200',
        budget: '$5,000',
        progress: 75,
    },
    {
        id: 2,
        name: 'Winter Promotion',
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        status: 'Scheduled',
        clicks: 300,
        conversions: 25,
        revenue: '$2,500',
        budget: '$8,000',
        progress: 45,
    },
    {
        id: 3,
        name: 'Spring Launch',
        startDate: '2025-03-01',
        endDate: '2025-05-31',
        status: 'Completed',
        clicks: 450,
        conversions: 38,
        revenue: '$3,800',
        budget: '$10,000',
        progress: 100,
    },
];

export default function Campaigns() {
    const [campaignList] = useState(campaigns);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-gray-100 text-gray-800';
            case 'Paused':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-3xl font-bold text-gray-900'>Campaigns</h2>
                    <p className='text-gray-600 mt-1'>Manage your affiliate marketing campaigns</p>
                </div>
                <button className='flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors'>
                    <Plus className='w-4 h-4' />
                    New Campaign
                </button>
            </div>

            {/* Campaign Stats */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <TrendingUp className='w-5 h-5 text-blue-500' />
                        <span className='text-sm font-medium text-gray-600'>Active Campaigns</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>1</div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <Users className='w-5 h-5 text-green-500' />
                        <span className='text-sm font-medium text-gray-600'>Total Clicks</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>900</div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <TrendingUp className='w-5 h-5 text-purple-500' />
                        <span className='text-sm font-medium text-gray-600'>Total Conversions</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>75</div>
                </div>
                <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                    <div className='flex items-center gap-3 mb-2'>
                        <DollarSign className='w-5 h-5 text-orange-500' />
                        <span className='text-sm font-medium text-gray-600'>Total Revenue</span>
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>$7,500</div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className='grid gap-6'>
                {campaignList.map((campaign) => (
                    <div key={campaign.id} className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='flex items-start justify-between mb-4'>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>{campaign.name}</h3>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>{campaign.status}</div>
                                </div>
                                <div className='flex items-center gap-4 text-sm text-gray-600 mb-3'>
                                    <div className='flex items-center gap-1'>
                                        <Calendar className='w-4 h-4' />
                                        <span>Start Date: {campaign.startDate}</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Calendar className='w-4 h-4' />
                                        <span>End Date: {campaign.endDate}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <button className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'>
                                    <Eye className='w-4 h-4' />
                                </button>
                                <button className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'>
                                    <Edit className='w-4 h-4' />
                                </button>
                                <button className='p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'>
                                    <Trash2 className='w-4 h-4' />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className='mb-4'>
                            <div className='flex justify-between text-sm text-gray-600 mb-1'>
                                <span>Campaign Progress</span>
                                <span>{campaign.progress}%</span>
                            </div>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div className='bg-blue-600 h-2 rounded-full transition-all duration-300' style={{ width: `${campaign.progress}%` }}></div>
                            </div>
                        </div>

                        {/* Campaign Metrics */}
                        <div className='grid grid-cols-4 gap-4 pt-4 border-t border-gray-100'>
                            <div className='text-center'>
                                <div className='text-2xl font-bold text-gray-900'>{campaign.clicks}</div>
                                <div className='text-sm text-gray-500'>Clicks</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-2xl font-bold text-gray-900'>{campaign.conversions}</div>
                                <div className='text-sm text-gray-500'>Conversions</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-2xl font-bold text-green-600'>{campaign.revenue}</div>
                                <div className='text-sm text-gray-500'>Revenue</div>
                            </div>
                            <div className='text-center'>
                                <div className='text-2xl font-bold text-blue-600'>{campaign.budget}</div>
                                <div className='text-sm text-gray-500'>Budget</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create New Campaign */}
            <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Create New Campaign</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Campaign Name</label>
                        <input
                            type='text'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                            placeholder='Enter campaign name...'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Budget</label>
                        <input
                            type='number'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                            placeholder='Enter budget amount...'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Start Date</label>
                        <input
                            type='date'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>End Date</label>
                        <input
                            type='date'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                        />
                    </div>
                    <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Campaign Description</label>
                        <textarea
                            rows={3}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                            placeholder='Describe your campaign...'
                        />
                    </div>
                    <div className='md:col-span-2'>
                        <button className='flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors'>
                            <Plus className='w-4 h-4' />
                            Create Campaign
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
