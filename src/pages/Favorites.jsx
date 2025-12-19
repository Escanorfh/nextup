// src/pages/FavoritesPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function FavoritesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('newest'); // 'newest', 'price_asc', 'price_desc'

    // ✅ جلب المفضلات
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('favorites')
                    .select(`
            product_id,
            created_at,
            products:product_id (
                id,
                name,
                price,
                location,
                images,
                condition
            )
          `)
                    .eq('user_id', user.id);

                if (error) throw error;

                // ✅ تحويل النتيجة لشكل مناسب (Filter out null products)
                const favList = data
                    .filter(fav => fav.products) // Ensure product still exists
                    .map((fav) => ({
                        id: fav.product_id,
                        added_at: fav.created_at, // Date added to favorites
                        ...fav.products,
                    }));

                setFavorites(favList);
            } catch (err) {
                console.error('Error fetching favorites:', err);
                setError(err.message || 'Failed to load favorites.');
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    // ✅ حذف من المفضلة
    const removeFromFavorites = async (listingId) => {
        try {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .match({ user_id: user.id, product_id: listingId });

            if (error) throw error;

            // ✅ تحديث محلي فوري
            setFavorites((prev) => prev.filter((fav) => fav.id !== listingId));
        } catch (err) {
            console.error('Remove favorite error:', err);
            alert('Failed to remove from favorites.');
        }
    };

    // ✅ Sorting Logic
    const sortedFavorites = useMemo(() => {
        const sorted = [...favorites];
        if (sortOption === 'newest') {
            sorted.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
        } else if (sortOption === 'price_asc') {
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOption === 'price_desc') {
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
        return sorted;
    }, [favorites, sortOption]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to view your favorites.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-500">Loading your favorites...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md text-center">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Your Favorites ({favorites.length})
                    </h1>

                    <div className="flex items-center space-x-4">
                        {/* Sorting Dropdown */}
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-neutral-500 focus:border-neutral-500"
                        >
                            <option value="newest">Newest Added</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>

                        <button
                            onClick={() => navigate('/products')}
                            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            Browse All
                        </button>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">❤️</div>
                        <h2 className="text-xl font-semibold text-gray-900">No favorites yet</h2>
                        <p className="mt-2 text-gray-600">
                            Save listings you like by clicking the heart icon on any listing.
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="mt-6 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                        >
                            Start Browsing
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedFavorites.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="relative">
                                    <Link to={`/products/${item.id}`}>
                                        <img
                                            src={item.images?.[0] || '/images/placeholder.jpg'}
                                            alt={item.name}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder.jpg';
                                            }}
                                        />
                                    </Link>
                                    <button
                                        onClick={() => removeFromFavorites(item.id)}
                                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow text-red-500 hover:text-red-600 transition-colors"
                                        title="Remove from favorites"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-4">
                                    <Link to={`/products/${item.id}`}>
                                        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-neutral-600">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="font-bold text-lg text-neutral-900">
                                            {item.price?.toLocaleString()} EGP
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="truncate">{item.location}</span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {item.condition}
                                        </span>
                                        <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}