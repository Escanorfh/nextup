// src/layouts/MainLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import SEO from '../components/SEO';

export default function MainLayout() {
    const location = useLocation();

    const showFilters =
        location.pathname === '/' ||
        location.pathname === '/listings' ||
        location.pathname.startsWith('/listings/') ||
        location.pathname === '/favorites';

    return (
        <>
            <SEO /> {/* Default SEO */}
            <Header showFilters={showFilters} />
            <main className="pt-2">
                <Outlet />
            </main>
        </>
    );
}