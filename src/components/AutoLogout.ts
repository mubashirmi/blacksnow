'use client';

import { destroyCookie } from 'nookies';
import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 30 minutes
const ACTIVITY_STORAGE_KEY = 'lastActivityAt';
const ACTIVITY_WRITE_THROTTLE_MS = 1000;
const CHECK_INTERVAL_MS = 10_000;

const LOCAL_STORAGE_KEYS = ['userId', 'firstName', 'lastName', 'email', 'id', 'adminId', 'roles', 'pausedRoles', 'referredby'];

const COOKIE_KEYS = ['id', 'token', 'admin_token', 'firstName', 'lastName', 'email', 'adminId', 'userId'];

export default function AutoLogout() {
    const loggingOutRef = useRef(false);
    const lastWriteRef = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const logout = () => {
            if (loggingOutRef.current) return;

            loggingOutRef.current = true;

            COOKIE_KEYS.forEach((cookieName) => {
                destroyCookie(null, cookieName, {
                    path: '/',
                });
            });

            LOCAL_STORAGE_KEYS.forEach((key) => {
                localStorage.removeItem(key);
            });

            localStorage.removeItem(ACTIVITY_STORAGE_KEY);

            // Hard navigation ensures all authenticated client state is cleared.
            window.location.replace('/');
        };

        const getLastActivity = () => {
            const storedValue = localStorage.getItem(ACTIVITY_STORAGE_KEY);
            const timestamp = Number(storedValue);

            return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
        };

        const recordActivity = () => {
            if (loggingOutRef.current) return;

            const now = Date.now();

            // Avoid constantly writing to localStorage on mouse movement.
            if (now - lastWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) {
                return;
            }

            lastWriteRef.current = now;
            localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
        };

        const checkInactivity = () => {
            if (loggingOutRef.current) return;

            const lastActivity = getLastActivity();

            if (!lastActivity) {
                recordActivity();
                return;
            }

            const inactiveFor = Date.now() - lastActivity;

            if (inactiveFor >= INACTIVITY_TIMEOUT_MS) {
                logout();
            }
        };

        // If no timestamp exists yet, start the inactivity clock now.
        if (!getLastActivity()) {
            localStorage.setItem(ACTIVITY_STORAGE_KEY, String(Date.now()));
        } else {
            // Important when returning after the browser/computer was asleep.
            checkInactivity();
        }
        // eslint-disable-next-line
        const activityEvents: Array<keyof WindowEventMap> = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'pointerdown'];

        activityEvents.forEach((eventName) => {
            window.addEventListener(eventName, recordActivity, {
                passive: true,
            });
        });

        // Activity in another tab updates localStorage.
        const handleStorage = (event: StorageEvent) => {
            if (event.key === ACTIVITY_STORAGE_KEY) {
                checkInactivity();
            }
        };

        window.addEventListener('storage', handleStorage);

        // Check periodically instead of relying solely on setTimeout.
        // This is more reliable when a laptop sleeps or browser tabs
        // are heavily throttled.
        const intervalId = window.setInterval(checkInactivity, CHECK_INTERVAL_MS);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkInactivity();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            activityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, recordActivity);
            });

            window.removeEventListener('storage', handleStorage);

            document.removeEventListener('visibilitychange', handleVisibilityChange);

            window.clearInterval(intervalId);
        };
    }, []);

    return null;
}
