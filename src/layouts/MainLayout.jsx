// src/layouts/MainLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';

export default function MainLayout() {
    const location = useLocation();

    const showFilters =
        location.pathname === '/' ||
        location.pathname === '/listings' ||
        location.pathname.startsWith('/listings/') ||
        location.pathname === '/favorites';

    return (
        <>
            <Header showFilters={showFilters} />
            <main className="pt-2">
                <Outlet />
            </main>
        </>
    );
}