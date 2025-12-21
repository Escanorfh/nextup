// src/pages/ListingDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { Phone } from 'lucide-react';

export default function ListingDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPhone, setShowPhone] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            if (!id) {
                setError('Invalid listing ID');
                setLoading(false);
                return;
            }

            const listingId = id;

            try {
                const { data: listingData, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', listingId)
                    .maybeSingle();

                if (error) throw error;

                if (!listingData) {
                    setError('Listing not found.');
                    setLoading(false);
                    return;
                }

                let seller = null;
                if (listingData.user_id) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name, phone')
                        .eq('id', listingData.user_id)
                        .single();

                    if (!profileError && profile) {
                        seller = profile;
                    }
                }

                setListing({
                    ...listingData,
                    profiles: seller,
                });
            } catch (err) {
                // console.error('Error:', err);
                setError(err.message || 'Failed to load listing.');
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    const nextImage = () => {
        const images = Array.isArray(listing?.images) ? listing.images : listing?.imageUrl ? [listing.imageUrl] : [];
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        const images = Array.isArray(listing?.images) ? listing.images : listing?.imageUrl ? [listing.imageUrl] : [];
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };



    const handleChat = async () => {
        if (!listing?.user_id || !user?.id || listing.user_id === user.id) {
            if (listing.user_id === user.id) {
                alert('You cannot chat with yourself.');
            }
            return;
        }

        try {
            // 👈 نحتاج listingId + الطرفين + conversation واحدة فقط لنفس الإعلان
            const { data: existing, error: fetchError } = await supabase
                .from('conversations')
                .select('id')
                .eq('product_id', listing.id)
                .or(`and(user1.eq.${user.id},user2.eq.${listing.user_id}),and(user1.eq.${listing.user_id},user2.eq.${user.id})`)
                .maybeSingle();

            let convId;

            if (existing) {
                convId = existing.id;
            } else {
                // 👈 إنشاء محادثة جديدة مربوطة بالإعلان
                const { data, error: insertError } = await supabase
                    .from('conversations')
                    .insert([
                        {
                            user1: user.id,
                            user2: listing.user_id,
                            product_id: listing.id,
                        },
                    ])
                    .select('id')
                    .single();

                if (insertError) throw insertError;
                convId = data.id;
            }

            // 👈 توجيه صح (مهم جداً)
            navigate(`/messages?conversation=${convId}&to=${listing.user_id}&listing=${listing.id}`);

        } catch (err) {
            // console.error('Chat error:', err);
            alert(`Chat Error: ${err.message}. Details: ${err.details || ''} Hint: ${err.hint || ''}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md text-center">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate(`/messages?to=${listing.user_id}`)}
                        className="..."
                    >
                        Chat with Seller
                    </button>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">Not found</div>
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
            <SEO
                title={listing.name}
                description={listing.description ? listing.description.substring(0, 160) : `Check out ${listing.name} on Next Up.`}
                image={listing.images?.[0] || listing.imageUrl}
            />
            <main className="container mx-auto px-4 py-6">
                <nav className="text-sm text-gray-500 mb-6">
                    <button onClick={() => navigate('/')} className="hover:text-neutral-600">
                        Home
                    </button>
                    <span className="mx-2">/</span>
                    <button onClick={() => navigate('/products')} className="hover:text-neutral-600">
                        Products
                    </button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{listing.name}</span>
                </nav>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="relative">
                        {(() => {
                            const images = Array.isArray(listing.images) ? listing.images : listing.imageUrl ? [listing.imageUrl] : [];
                            return images.length > 0 ? (
                                <div className="relative">
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={listing.name}
                                        className="w-full h-64 sm:h-72 md:h-96 object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/placeholder.jpg';
                                        }}
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                                            >
                                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                                            >
                                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                                {images.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-3 h-3 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-64 sm:h-72 md:h-96 bg-gray-100 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">{listing.name}</h1>
                                <div className="mt-2 flex items-center">
                                    <span className="text-3xl font-bold text-neutral-900">
                                        {listing.price?.toLocaleString() || '0'} EGP
                                    </span>
                                    <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                                        {listing.condition}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center text-gray-500">
                                    <span>{listing.location}</span>
                                    <span className="mx-2">•</span>
                                    <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
                                    <div className="mt-3 flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-700 font-semibold flex items-center justify-center">
                                            {listing.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="ml-3">
                                            <div className="font-medium text-gray-900">
                                                {listing.profiles?.full_name || 'User'}
                                            </div>
                                            {listing.profiles?.phone && (
                                                <div className="text-sm text-gray-500">{listing.profiles.phone}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {listing.description && (
                                    <div className="mt-6">
                                        <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                                        <p className="mt-2 text-gray-600 whitespace-pre-line">{listing.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Sidebar */}
                            <div className="mt-6 md:mt-0 md:ml-8 w-full md:w-64 space-y-3">
                                <button
                                    onClick={() => setShowPhone(!showPhone)}
                                    className={`w-full font-semibold py-3 px-4 rounded-lg shadow flex items-center justify-center transition-colors ${showPhone ? 'bg-white text-neutral-900 border-2 border-neutral-900' : 'bg-neutral-900 text-white hover:bg-neutral-800'}`}
                                >
                                    <Phone className={`w-5 h-5 mr-2 ${showPhone ? 'text-neutral-900' : 'text-white'}`} />
                                    {showPhone ? (listing.profiles?.phone || 'No phone number') : 'Show Phone Number'}
                                </button>

                                {/* زر Chat يظهر فقط لو المستخدم مش البائع */}
                                {user?.id !== listing?.user_id && (
                                    <button
                                        onClick={handleChat}
                                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-4 rounded-lg shadow flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        Chat with Seller
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
