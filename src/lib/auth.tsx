import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

// Define the AuthContext type
interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    id: string | null;
    loading: boolean;
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility function to get a specific cookie value
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
    }

    return null;
};

// AuthProvider component to wrap around CoreLayout
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const idFromCookie = getCookie('id');
                setId(idFromCookie);
                const userIsLoggedIn = !!idFromCookie;
                setIsLoggedIn(userIsLoggedIn);
                if (userIsLoggedIn) {
                    try {
                        const response = await fetch('/api/auth/check', {
                            credentials: 'include',
                        });

                        if (response.ok) {
                            await response.json();
                            // console.log('Token from server:', data.token);
                            // setToken(data.token);
                        } else {
                            setToken(null);
                        }
                    } catch (serverError) {
                        console.log('Server request failed, but user still logged in based on ID');
                        setToken(null);
                    }
                } else {
                    // No ID means not logged in
                    setToken(null);
                }
            } catch (error) {
                console.error('Error in auth check:', error);
                setIsLoggedIn(false);
                setToken(null);
                setId(null);
            } finally {
                setLoading(false);
            }
        };

        // Initial auth check
        checkAuth();

        // Listen for storage events (when cookies change in other tabs)
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);

        // Optional: Listen for focus events to check auth when user returns to tab
        const handleFocus = () => {
            checkAuth();
        };

        window.addEventListener('focus', handleFocus);

        // Cleanup event listeners
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);
    return <AuthContext.Provider value={{ isLoggedIn, token, id, loading }}>{children}</AuthContext.Provider>;
};

// Custom hook to access auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
