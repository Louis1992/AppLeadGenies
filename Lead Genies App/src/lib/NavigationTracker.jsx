import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Simple navigation tracker for Supabase migration
// Previously used Base44 auth and logging - now simplified
export default function NavigationTracker() {
    const location = useLocation();

    // Optional: Add analytics tracking here (Google Analytics, Plausible, etc.)
    useEffect(() => {
        // Log page view to browser console for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('Navigation:', location.pathname);
        }

        // TODO: Add analytics integration here if needed
        // Example: window.gtag?.('event', 'page_view', { page_path: location.pathname });
    }, [location]);

    return null;
}