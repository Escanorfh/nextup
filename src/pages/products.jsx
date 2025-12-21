// src/pages/ListingsPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Search } from 'lucide-react';

export default function ListingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        query: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        sortBy: 'latest',
    });
    const [favorites, setFavorites] = useState(new Set());
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // ✅ جلب الإعلانات + أسماء البائعين
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            setError('');

            try {
                // 1. جلب الإعلانات
                let query = supabase
                    .from('products')
                    .select('id, name, price, location, condition, images, created_at, user_id')
                    .eq('is_active', true);

                if (filters.query) {
                    query = query.ilike('name', `%${filters.query}%`);
                }
                if (filters.category !== 'All') {
                    query = query.eq('category', filters.category);
                }
                if (filters.minPrice) {
                    query = query.gte('price', filters.minPrice);
                }
                if (filters.maxPrice) {
                    query = query.lte('price', filters.maxPrice);
                }

                if (filters.sortBy === 'price-asc') {
                    query = query.order('price', { ascending: true });
                } else if (filters.sortBy === 'price-desc') {
                    query = query.order('price', { ascending: false });
                } else {
                    query = query.order('created_at', { ascending: false });
                }

                const from = (page - 1) * 12;
                const to = from + 11;
                const { data, error } = await query.range(from, to);

                if (error) throw error;

                // 2. جلب أسماء البائعين (مفصولة)
                // 2. جلب أسماء البائعين (مفصولة)
                const userIds = [...new Set(data.map(l => l.user_id))].filter(id => id); // ← ✅ تصفية القيم الفارغة
                let sellerNames = {};

                if (userIds.length > 0) {
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', userIds);

                    if (profileError) {
                        // console.error('Error fetching profiles:', profileError);
                        // ❌ لا توقف التطبيق — استمر بدون أسماء
                    } else if (profiles && profiles.length > 0) {
                        // ✅ فقط الآن استخدم forEach
                        profiles.forEach(profile => {
                            sellerNames[profile.id] = profile.full_name || 'User';
                        });
                    }
                }

                // 3. دمج البيانات
                const listingsWithSellers = data.map(listing => ({
                    ...listing,
                    seller_name: sellerNames[listing.user_id] || 'User',
                }));

                // 4. تحديث الحالة
                if (page === 1) {
                    setListings(listingsWithSellers);
                } else {
                    setListings(prev => [...prev, ...listingsWithSellers]);
                }

                setHasMore(data.length === 12);
            } catch (err) {
                // console.error('Error fetching listings:', err);
                setError(err.message || 'Failed to load listings.');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filters, page]);

    // ✅ جلب المفضلات
    useEffect(() => {
        if (user) {
            supabase
                .from('favorites')
                .select('product_id')
                .eq('user_id', user.id)
                .then(({ data, error }) => {
                    if (!error && data) {
                        setFavorites(new Set(data.map((f) => f.product_id)));
                    }
                });
        }
    }, [user]);

    // ✅ إضافة/حذف من المفضلة
    const toggleFavorite = async (listingId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const isFavorite = favorites.has(listingId);
        try {
            if (isFavorite) {
                await supabase
                    .from('favorites')
                    .delete()
                    .match({ user_id: user.id, product_id: listingId });
                setFavorites(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(listingId);
                    return newSet;
                });
            } else {
                await supabase
                    .from('favorites')
                    .insert([{ user_id: user.id, product_id: listingId }]);
                setFavorites(prev => new Set(prev).add(listingId));
            }
        } catch (err) {
            // console.error('Toggle favorite error:', err);
            alert('Failed to update favorites.');
        }
    };

    const loadMore = () => setPage(prev => prev + 1);

    const categories = [
        'All',
        'Electronics',
        'Clothing',
        'Furniture',
        'Vehicles',
        'Sports',
        'Books',
        'Home',
        'Other',
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="Browse Products"
                description="Explore a wide range of products including electronics, fashion, and furniture on Next Up."
            />
            {/* Header مع فلاتر */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>

                        {/* فلاتر البحث */}
                        <div className="flex flex-wrap gap-3">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={filters.query}
                                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none"
                            />

                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none bg-white"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none bg-white"
                            >
                                <option value="latest">Latest</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* تحميل */}
                {loading && listings.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                                <div className="w-full h-48 bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-900">No products found</h3>
                        <p className="mt-2 text-gray-600">
                            Try changing your search or filter settings.
                        </p>
                        <button
                            onClick={() => setFilters({ query: '', category: 'All', minPrice: '', maxPrice: '', sortBy: 'latest' })}
                            className="mt-4 px-6 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {listings.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                    <div className="relative">
                                        <Link to={`/products/${item.id}`}>
                                            <img
                                                src={item.images?.[0] || '/images/placeholder.jpg'}
                                                alt={item.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/images/placeholder.jpg';
                                                }}
                                            />
                                        </Link>
                                        <button
                                            onClick={() => toggleFavorite(item.id)}
                                            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow"
                                            name={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <svg
                                                className={`w-5 h-5 ${favorites.has(item.id) ? 'text-red-600 fill-current' : 'text-gray-400'}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <Link to={`/products/${item.id}`}>
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-neutral-600">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <div className="mt-3 flex justify-between items-center">
                                            <span className="font-bold text-lg text-neutral-900">
                                                {item.price.toLocaleString()} EGP
                                            </span>
                                            <span className="text-sm text-gray-500">{item.location}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                            <span>{item.condition}</span>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            by <span className="font-medium">{item.seller_name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:bg-gray-300"
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}