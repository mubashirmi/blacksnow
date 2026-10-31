import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function SalesEditorPage() {
    return (
        <div className='space-y-6'>
            {/* Coming Soon Banner */}
            <Card className='border-orange-200 bg-orange-50'>
                <CardContent className='p-6'>
                    <div className='flex items-center gap-3'>
                        <AlertCircle className='h-6 w-6 text-orange-600' />
                        <div>
                            <h3 className='text-lg font-semibold text-orange-800'>Coming Soon</h3>
                            <p className='text-orange-700'>The Sales Content Editor is currently under development and will be available soon.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Placeholder Content */}
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
                <h2 className='text-2xl font-bold mb-4'>Content Editor</h2>
                <p className='text-gray-600'>
                    This section will provide a powerful content editor for creating sales materials, email templates, and marketing content for your sales
                    campaigns.
                </p>
            </div>
        </div>
    );
}
