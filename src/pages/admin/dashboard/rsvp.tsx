import { ChevronDown, ChevronRight, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const RSVPPage = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [expandedEvents, setExpandedEvents] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/v1/calendar');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setUpcomingEvents(data.data || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
                setUpcomingEvents([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const toggleEvent = (id: number) => {
        setExpandedEvents((prev) => (prev.includes(id) ? prev.filter((eventId) => eventId !== id) : [...prev, id]));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            <div className='max-w-5xl mx-auto space-y-6'>
                {/* Card shell with dark gradient header (matches the shared design) */}
                <div className='bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden'>
                    <div className='bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4'>
                        <h2 className='text-2xl font-bold text-white'>Upcoming Events</h2>
                    </div>

                    <div className='p-6'>
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
                        ) : (
                            <div className='space-y-4'>
                                {upcomingEvents.length === 0 ? (
                                    <p className='text-slate-500 text-center py-8'>No upcoming events</p>
                                ) : (
                                    upcomingEvents.map((event: any) => (
                                        <div key={event.id} className='border border-slate-200 rounded-lg overflow-hidden'>
                                            <button
                                                onClick={() => toggleEvent(event.id)}
                                                className='w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors'
                                            >
                                                <div className='flex-1'>
                                                    <span className='font-medium block text-slate-900'>{formatDate(event.date)}</span>
                                                    <span className='text-sm text-slate-600 mt-1 flex items-center gap-3'>
                                                        <span>🕒 {event.time}</span>
                                                        <span>
                                                            👥 {event.userBroughtProduct.length}/{event.limit} attendees
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className='ml-4'>
                                                    {expandedEvents.includes(event.id) ? (
                                                        <ChevronDown className='w-5 h-5 text-slate-500' />
                                                    ) : (
                                                        <ChevronRight className='w-5 h-5 text-slate-500' />
                                                    )}
                                                </div>
                                            </button>

                                            {expandedEvents.includes(event.id) && (
                                                <div className='border-t border-slate-200 bg-slate-50 p-6'>
                                                    <div className='space-y-4'>
                                                        <div className='grid grid-cols-2 gap-4'>
                                                            <div className='bg-white p-3 rounded-lg border border-slate-200'>
                                                                <div className='text-xs text-slate-500 mb-1'>Time</div>
                                                                <div className='text-sm font-medium text-slate-900'>{event.time}</div>
                                                            </div>
                                                            <div className='bg-white p-3 rounded-lg border border-slate-200'>
                                                                <div className='text-xs text-slate-500 mb-1'>Capacity</div>
                                                                <div className='text-sm font-medium text-slate-900'>
                                                                    {event.userBroughtProduct.length} / {event.limit}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {event.userBroughtProduct.length > 0 ? (
                                                            <div className='mt-6'>
                                                                <div className='flex items-center gap-2 mb-4'>
                                                                    <User className='w-4 h-4 text-slate-600' />
                                                                    <h3 className='font-semibold text-slate-900'>
                                                                        Attendees ({event.userBroughtProduct.length})
                                                                    </h3>
                                                                </div>
                                                                <div className='space-y-3'>
                                                                    {event.userBroughtProduct.map((attendee: any) => (
                                                                        <div
                                                                            key={attendee.id}
                                                                            className='bg-white p-4 rounded-lg border border-slate-200 shadow-sm'
                                                                        >
                                                                            <div className='font-medium text-slate-900 mb-2'>
                                                                                {attendee.firstName} {attendee.lastName}
                                                                            </div>
                                                                            <div className='space-y-1'>
                                                                                <div className='flex items-center gap-2 text-sm text-slate-600'>
                                                                                    <Mail className='w-4 h-4' />
                                                                                    <a
                                                                                        href={`mailto:${attendee.email}`}
                                                                                        className='hover:text-blue-600 hover:underline'
                                                                                    >
                                                                                        {attendee.email}
                                                                                    </a>
                                                                                </div>
                                                                                <div className='flex items-center gap-2 text-sm text-slate-600'>
                                                                                    <Phone className='w-4 h-4' />
                                                                                    <a
                                                                                        href={`tel:${attendee.phone}`}
                                                                                        className='hover:text-blue-600 hover:underline'
                                                                                    >
                                                                                        {attendee.phone}
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className='mt-6 text-center py-8 bg-white rounded-lg border border-slate-200'>
                                                                <User className='w-12 h-12 text-slate-300 mx-auto mb-2' />
                                                                <p className='text-slate-500 text-sm'>No attendees yet</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RSVPPage;
