// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [productsCount, setproductsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // ✅ جلب عدد الإعلانات الخاصة بالمستخدم
    useEffect(() => {
        const fetchproductsCount = async () => {
            if (!user) return;

            try {
                const { count, error } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (error) throw error;
                setproductsCount(count || 0);
            } catch (err) {
                console.error('Error fetching products count:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchproductsCount();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (err) {
            console.error('Logout error:', err.message);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // ✅ استخراج البيانات من user_metadata
    const fullName = user.user_metadata?.full_name || '-';
    const phone = user.user_metadata?.phone || '-';
    const email = user.email;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-900 font-bold flex items-center justify-center text-xl">
                                {fullName.charAt(0).toUpperCase() || email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                                <p className="text-gray-600">{email}</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <button
                                onClick={() => navigate('/addProducts')}
                                className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition shadow-sm"
                            >
                                + Add product
                            </button>
                            <button
                                onClick={() => navigate('/edit-profile')}
                                className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-4 -mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-neutral-900">{productsCount}</div>
                            <div className="text-sm text-gray-600 mt-1">Your products</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-neutral-900">0</div>
                            <div className="text-sm text-gray-600 mt-1">Messages</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-neutral-900">0</div>
                            <div className="text-sm text-gray-600 mt-1">Favorites</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Info Section */}
            <div className="container mx-auto px-4 mt-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="mt-1 text-gray-900">{fullName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Email</label>
                                    <p className="mt-1 text-gray-900">{email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                                    <p className="mt-1 text-gray-900">{phone}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Member Since</label>
                                    <p className="mt-1 text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString('en-GB')}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate('/change-password')}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-neutral-900"
                                >
                                    🔐 Change Password
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                                >
                                    📤 Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Your products Section */}
            <div className="container mx-auto px-4 mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Your products</h2>
                    {productsCount > 0 && (
                        <Link
                            to="/my-products"
                            className="text-neutral-900 hover:text-neutral-700 text-sm font-medium"
                        >
                            View all →
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="ml-2 text-gray-500">Loading your products...</span>
                    </div>
                ) : productsCount === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No products yet</h3>
                        <p className="mt-1 text-gray-500">Get started by adding your first product.</p>
                        <button
                            onClick={() => navigate('/addProducts')}
                            className="mt-4 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition"
                        >
                            + Create Your First product
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="divide-y divide-gray-200">
                            {/* هنا يمكن إضافة عينة من الإعلانات لاحقًا */}
                            <div className="p-4 text-center text-gray-500">
                                You have {productsCount} product{productsCount !== 1 ? 's' : ''}.
                                <br />
                                <Link to="/my-products" className="text-neutral-900 hover:underline">
                                    View all your products →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}