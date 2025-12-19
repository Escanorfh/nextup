// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Furniture', 'Vehicles', 'Sports', 'Books'];

export default function Header({
    onSearch,
    onCategoryChange,
    onSortChange,
    onMinPriceChange,
    onMaxPriceChange,
}) {
    // Mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy] = useState('relevance');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Propagate filter changes
    useEffect(() => onSearch?.(query), [query, onSearch]);
    useEffect(() => onCategoryChange?.(category), [category, onCategoryChange]);
    useEffect(() => onSortChange?.(sortBy), [sortBy, onSortChange]);
    useEffect(() => onMinPriceChange?.(minPrice), [minPrice, onMinPriceChange]);
    useEffect(() => onMaxPriceChange?.(maxPrice), [maxPrice, onMaxPriceChange]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (err) {
            console.error('Logout error:', err.message);
        }
    };

    const isActive = (path) => location.pathname === path;

    // Extract initials for profile avatar
    const getInitials = () => {
        if (!user) return '?';
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <>
            {/* Main Navbar */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-lg font-bold text-neutral-900">
                        <img src={logo} alt="logo" className="w-15" />
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
                        <NavLink to="/products" isActive={isActive('/products')}>Browse</NavLink>
                        <NavLink to="/favorites" isActive={isActive('/favorites')}>Favorites</NavLink>
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-2">
                                {/* Notifications */}
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition relative"
                                    title="Notifications"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.71 5.59A5.48 5.48 0 005 11v1l-1 4v2h2l1 4h2l1-4h4l1 4h2l1-4h2v-2l-1-4V11a5.48 5.48 0 00-5.71-5.41z" />
                                        <circle cx="16.5" cy="4.5" r="1.5" fill="currentColor" />
                                    </svg>
                                </button>
                                {/* Messages */}
                                <button
                                    onClick={() => navigate('/messages')}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition relative"
                                    title="Messages"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                                {/* Profile dropdown */}
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-900 font-semibold flex items-center justify-center hover:bg-neutral-200 transition"
                                        title="Profile"
                                    >
                                        {getInitials()}
                                    </button>
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="./auth/signin"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="./auth/signup"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                {/* Mobile navigation panel */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden bg-white border-t border-gray-200">
                        <div className="grid grid-cols-4 gap-2 p-3">
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg ${isActive('/') ? 'bg-neutral-100 text-neutral-900' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" /></svg>
                                <span className="text-xs mt-1">Home</span>
                            </Link>
                            <Link
                                to="/products"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg ${isActive('/products') ? 'bg-neutral-100 text-neutral-900' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 10h18M3 16h18" /></svg>
                                <span className="text-xs mt-1">Browse</span>
                            </Link>
                            <Link
                                to="/favorites"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg ${isActive('/favorites') ? 'bg-neutral-100 text-neutral-900' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.318a4.5 4.5 0 010-6.364z" /></svg>
                                <span className="text-xs mt-1">Favorites</span>
                            </Link>
                            {user && (
                                <>
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); navigate('/messages'); }}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        <span className="text-xs mt-1">Messages</span>
                                    </button>
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); navigate('/notifications'); }}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.71 5.59A5.48 5.48 0 005 11v1l-1 4v2h2l1 4h2l1-4h4l1 4h2l1-4h2v-2l-1-4V11a5.48 5.48 0 00-5.71-5.41z" /></svg>
                                        <span className="text-xs mt-1">Alerts</span>
                                    </button>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span className="text-xs mt-1">Profile</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                )}
            </header>
        </>
    );
}

// Sub‑component for navigation links
function NavLink({ to, children, isActive }) {
    return (
        <Link
            to={to}
            className={`px-3 py-2 rounded-lg font-medium transition ${isActive ? 'bg-neutral-100 text-neutral-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
        >
            {children}
        </Link>
    );
}
