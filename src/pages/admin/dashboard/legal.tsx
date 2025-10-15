'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const legalSections = [
    { id: 1, title: 'Affiliate Agreement', apiRoute: '/api/v2/affiliate-agreement', key: 'affiliateAgreement', responseKey: 'agreement' },
    { id: 2, title: 'Terms and Policy', apiRoute: '/api/v2/terms', key: 'terms', responseKey: 'terms' },
    { id: 3, title: 'Risk Disclosure', apiRoute: '/api/v2/risk-disclosure', key: 'riskDisclosure', responseKey: 'disclosure' },
    { id: 4, title: 'GDPR Compliance', apiRoute: '/api/v2/gdpr', key: 'gdpr', responseKey: 'gdpr' },
    { id: 5, title: 'Privacy Policy', apiRoute: '/api/v2/privacy-policy', key: 'privacyPolicy', responseKey: 'policy' },
];

export default function LegalPage() {
    const [expandedSection, setExpandedSection] = useState(null);
    const [editingContent, setEditingContent] = useState({});
    const [loading, setLoading] = useState({});
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [sectionContents, setSectionContents] = useState({});

    // Fetch content for all sections on page load
    const fetchAllContent = useCallback(async () => {
        try {
            setLoading(legalSections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {}));

            const fetchPromises = legalSections.map(async (section) => {
                try {
                    const response = await fetch(section.apiRoute);
                    if (response.status === 404) {
                        return { id: section.id, content: '' }; // Set empty content for 404
                    }
                    if (!response.ok) throw new Error(`Failed to fetch ${section.title}`);
                    const data = await response.json();

                    // Fixed: Access content using the correct nested structure
                    // For affiliate agreement: data.agreement.affiliateAgreement
                    // For others: data[responseKey][key] (adjust responseKey as needed for other endpoints)
                    let content = '';
                    if (data[section.responseKey] && data[section.responseKey][section.key]) {
                        content = data[section.responseKey][section.key];
                    }

                    return { id: section.id, content };
                } catch (error) {
                    console.error(`Error fetching ${section.title}:`, error);
                    setAlert({
                        show: true,
                        type: 'error',
                        message: `Failed to load ${section.title} content: ${error.message}`,
                    });
                    return { id: section.id, content: '' };
                }
            });

            const results = await Promise.all(fetchPromises);
            const newContents = results.reduce(
                (acc, { id, content }) => ({
                    ...acc,
                    [id]: content,
                }),
                {}
            );

            setSectionContents(newContents);
        } finally {
            setLoading(legalSections.reduce((acc, section) => ({ ...acc, [section.id]: false }), {}));
        }
    }, []);

    // Load all content on component mount
    useEffect(() => {
        fetchAllContent();
    }, [fetchAllContent]);

    // Handle section toggle
    const handleToggleSection = useCallback((sectionId) => {
        setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
    }, []);

    // Handle content save
    const handleSave = async (sectionId) => {
        const section = legalSections.find((s) => s.id === sectionId);
        try {
            setLoading((prev) => ({ ...prev, [sectionId]: true }));
            const response = await fetch(section.apiRoute, {
                method: sectionContents[sectionId] ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(
                    sectionContents[sectionId]
                        ? { id: 1, [section.key]: editingContent[sectionId] || sectionContents[sectionId] }
                        : { [section.key]: editingContent[sectionId] || sectionContents[sectionId] }
                ),
            });
            if (!response.ok) throw new Error('Failed to save content');
            setSectionContents((prev) => ({ ...prev, [sectionId]: editingContent[sectionId] || sectionContents[sectionId] }));
            setEditingContent((prev) => ({ ...prev, [sectionId]: undefined }));
            setAlert({
                show: true,
                type: 'success',
                message: `${section.title} content saved successfully`,
            });
        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: `Failed to save ${section.title}: ${error.message}`,
            });
        } finally {
            setLoading((prev) => ({ ...prev, [sectionId]: false }));
        }
    };

    const handleContentChange = (sectionId, content) => {
        setEditingContent((prev) => ({ ...prev, [sectionId]: content }));
    };

    // Clear alert after 5 seconds
    const clearAlert = useCallback(() => {
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    }, []);

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold text-gray-800'>Legal Documents</h1>
            </div>

            {alert.show && (
                <Alert
                    variant={alert.type === 'error' ? 'destructive' : 'default'}
                    className={alert.type === 'success' ? 'bg-green-50 border-green-200' : ''}
                    onAnimationEnd={clearAlert}
                >
                    <AlertTitle>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
            )}

            <Card className='shadow-sm border-gray-200'>
                <CardHeader className='bg-gray-50 border-b border-gray-200'>
                    <CardTitle className='text-xl text-gray-800'>Legal Content Management</CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                    <div className='space-y-4'>
                        {legalSections.map((section) => (
                            <div key={section.id} className='border border-gray-200 rounded-lg'>
                                <button
                                    onClick={() => handleToggleSection(section.id)}
                                    className='w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors'
                                    disabled={loading[section.id]}
                                >
                                    <span className='font-medium text-gray-800'>{section.title}</span>
                                    {loading[section.id] ? (
                                        <Loader2 className='w-4 h-4 text-gray-500 animate-spin' />
                                    ) : expandedSection === section.id ? (
                                        <ChevronDown className='w-4 h-4 text-gray-500' />
                                    ) : (
                                        <ChevronRight className='w-4 h-4 text-gray-500' />
                                    )}
                                </button>

                                {expandedSection === section.id && (
                                    <div className='border-t border-gray-100 p-4'>
                                        <textarea
                                            value={editingContent[section.id] !== undefined ? editingContent[section.id] : sectionContents[section.id] || ''}
                                            onChange={(e) => handleContentChange(section.id, e.target.value)}
                                            className='w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent resize-none'
                                            placeholder={`Enter ${section.title} content...`}
                                            disabled={loading[section.id]}
                                        />
                                        <div className='mt-4'>
                                            <Button
                                                onClick={() => handleSave(section.id)}
                                                className='bg-gray-800 hover:bg-gray-900 text-white'
                                                disabled={loading[section.id]}
                                            >
                                                {loading[section.id] ? (
                                                    <>
                                                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
