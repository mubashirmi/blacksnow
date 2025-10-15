'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Custom Alert Component
const Alert = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, type === 'error' ? 5000 : 4000);
        return () => clearTimeout(timer);
    }, [onClose, type]);

    return (
        <div
            className={`fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg border flex items-center justify-between z-50 ${
                type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-green-50 border-green-500 text-green-800'
            }`}
        >
            <span>{message}</span>
            <button onClick={onClose} className='ml-4 text-sm font-semibold hover:text-gray-600'>
                ✕
            </button>
        </div>
    );
};

function Dashboard() {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 5));
    const [selectedDate, setSelectedDate] = useState(18);
    const [eventForm, setEventForm] = useState({
        date: '2025-06-18',
        startTime: '10:00',
        seats: '50',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);

    // Sync form date with calendar selection
    useEffect(() => {
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
        setEventForm((prev) => ({ ...prev, date: formattedDate }));
    }, [selectedDate, currentDate]);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    const navigateMonth = (direction) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!eventForm.date) newErrors.date = 'Date is required';
        if (!eventForm.startTime) newErrors.startTime = 'Start time is required';
        if (!eventForm.seats) newErrors.seats = 'Number of seats is required';
        else if (isNaN(eventForm.seats) || Number(eventForm.seats) <= 0) newErrors.seats = 'Seats must be a positive number';
        else if (Number(eventForm.seats) > 1000) newErrors.seats = 'Seats cannot exceed 1000';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            setAlert({
                type: 'error',
                message: 'Please correct the form errors before submitting',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/calendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: eventForm.date,
                    time: eventForm.startTime,
                    limit: Number(eventForm.seats),
                }),
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch (err) {
                throw new Error('Invalid server response format');
            }

            if (!response.ok) {
                throw new Error(
                    responseData.message ||
                        (response.status >= 500
                            ? `Server error (${response.status})`
                            : response.status === 400
                            ? 'Invalid input data'
                            : 'Event creation failed')
                );
            }

            if (responseData.success === false || !responseData.eventId) {
                throw new Error(responseData.message || 'Event creation did not complete successfully');
            }

            setAlert({
                type: 'success',
                message: `Event scheduled for ${eventForm.date} at ${eventForm.startTime} with ${eventForm.seats} seats!`,
            });
            setEventForm({
                date: eventForm.date,
                startTime: '10:00',
                seats: '50',
            });
        } catch (error) {
            let errorMessage;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error: Unable to connect to the server';
            } else if (error.message.includes('Server error')) {
                errorMessage = `Server error: ${error.message.split('(')[1]?.replace(')', '') || 'Internal server issue'}`;
            } else if (error.message === 'Invalid server response format') {
                errorMessage = 'Server returned an invalid response';
            } else {
                errorMessage = error.message || 'An unexpected error occurred during event creation';
            }

            setAlert({
                type: 'error',
                message: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Previous month's trailing days
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
        const prevMonthDays = prevMonth.getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(
                <button key={`prev-${prevMonthDays - i}`} disabled className='w-12 h-12 text-gray-400 rounded-lg cursor-not-allowed'>
                    {prevMonthDays - i}
                </button>
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = day === selectedDate;
            const isWeekend = (firstDay + day - 1) % 7 >= 5;

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`w-12 h-12 rounded-lg transition-all duration-200 ${
                        isSelected ? 'bg-slate-600 text-white shadow-md' : isWeekend ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
                    } font-medium`}
                >
                    {day}
                </button>
            );
        }

        // Next month's leading days
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (firstDay + daysInMonth);

        for (let day = 1; day <= remainingCells; day++) {
            days.push(
                <button key={`next-${day}`} disabled className='w-12 h-12 text-gray-400 rounded-lg cursor-not-allowed'>
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className='max-w-5xl mx-auto p-6'>
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
            <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-8'>
                <h2 className='text-2xl font-bold text-gray-800 mb-8'>Manage Events</h2>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                    {/* Calendar */}
                    <div className='space-y-6'>
                        <div className='flex items-center justify-between bg-gray-50 p-4 rounded-lg'>
                            <button onClick={() => navigateMonth('prev')} className='p-3 hover:bg-gray-200 rounded-full transition-colors'>
                                <ChevronLeft className='w-6 h-6 text-gray-600' />
                            </button>
                            <h3 className='text-xl font-semibold text-gray-800'>
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <button onClick={() => navigateMonth('next')} className='p-3 hover:bg-gray-200 rounded-full transition-colors'>
                                <ChevronRight className='w-6 h-6 text-gray-600' />
                            </button>
                        </div>

                        <div className='grid grid-cols-7 gap-2 mb-4'>
                            {daysOfWeek.map((day) => (
                                <div key={day} className='w-12 h-10 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-md'>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className='grid grid-cols-7 gap-2'>{renderCalendar()}</div>
                    </div>

                    {/* Event Form */}
                    <div className='space-y-6'>
                        <div>
                            <Label htmlFor='date' className='text-gray-700 font-medium'>
                                Date
                            </Label>
                            <Input
                                id='date'
                                type='date'
                                value={eventForm.date}
                                onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                                className={`mt-1 border-gray-300 focus:ring-slate-600 focus:border-slate-600 ${errors.date ? 'border-red-500' : ''}`}
                            />
                            {errors.date && <p className='mt-1 text-sm text-red-500'>{errors.date}</p>}
                        </div>

                        <div>
                            <Label htmlFor='startTime' className='text-gray-700 font-medium'>
                                Start Time
                            </Label>
                            <Input
                                id='startTime'
                                type='time'
                                value={eventForm.startTime}
                                onChange={(e) => setEventForm((prev) => ({ ...prev, startTime: e.target.value }))}
                                className={`mt-1 border-gray-300 focus:ring-slate-600 focus:border-slate-600 ${errors.startTime ? 'border-red-500' : ''}`}
                            />
                            {errors.startTime && <p className='mt-1 text-sm text-red-500'>{errors.startTime}</p>}
                        </div>

                        <div>
                            <Label htmlFor='seats' className='text-gray-700 font-medium'>
                                Number of Seats
                            </Label>
                            <Input
                                id='seats'
                                type='number'
                                value={eventForm.seats}
                                onChange={(e) => setEventForm((prev) => ({ ...prev, seats: e.target.value }))}
                                className={`mt-1 border-gray-300 focus:ring-slate-600 focus:border-slate-600 ${errors.seats ? 'border-red-500' : ''}`}
                            />
                            {errors.seats && <p className='mt-1 text-sm text-red-500'>{errors.seats}</p>}
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className='w-full cursor-pointer bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading ? (
                                <span className='flex items-center justify-center'>
                                    <svg
                                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                'Create Event'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Dashboard };
