// src/pages/AddListingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function AddListingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Electronics');
    const [condition, setCondition] = useState('Used');
    const [location, setLocation] = useState('Cairo');
    const [phone, setPhone] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // ✅ جلب رقم الجوال من البروفايل (إذا موجود)
    useEffect(() => {
        const fetchPhone = async () => {
            if (!user) return;

            const { profile, error } = await supabase
                .from('profiles')
                .select('phone')
                .eq('id', user.id)
                .single();

            if (error) {
                // console.error('Error fetching profile:', error);
                return;
            }

            if (profile?.phone) {
                setPhone(profile.phone);
            }
        };

        fetchPhone();
    }, [user]);

    // ✅ معالجة اختيار الصور
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 6) {
            setError('You can upload up to 6 images.');
            return;
        }
        setImages((prev) => [...prev, ...files]);

        // معاينات الصور
        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previews]);
    };

    // ✅ حذف صورة
    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // ✅ رفع الصور على Storage
    const uploadImages = async () => {
        const urls = [];
        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const fileName = `${user.id}/${Date.now()}-${file.name}`;

            const { upload, error } = await supabase.storage
                .from('uploads')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            const { publicUrl } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName).data;

            urls.push(publicUrl);
        }
        return urls;
    };

    // ✅ حفظ الإعلان
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) return setError('Please enter a title.');
        if (!price || isNaN(price) || parseFloat(price) <= 0) return setError('Please enter a valid price.');
        if (!location.trim()) return setError('Please enter a location.');
        if (!phone.trim()) return setError('Please enter your phone number.');
        if (images.length === 0) return setError('Please upload at least one image.');

        setUploading(true);

        try {
            // 1. رفع الصور
            const imageUrls = await uploadImages();

            // 2. حفظ الإعلان
            const { data, error } = await supabase
                .from('products')
                .insert([
                    {
                        user_id: user.id,
                        name: title.trim(),
                        description: description.trim(),
                        price: parseFloat(price),
                        category,
                        condition,
                        location: location.trim(),
                        images: imageUrls,
                        phone, // ← إذا أضفت العمود في الجدول
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            // ✅ الآن 'data' تحتوي على الإعلان الجديد
            const newListing = data;

            // 3. تحديث البروفايل (رقم الجوال)
            if (phone) {
                await supabase
                    .from('profiles')
                    .upsert({ id: user.id, phone }, { onConflict: 'id' });
            }

            alert('Product created successfully!');
            navigate(`/products/${newListing.id}`);
        } catch (err) {
            // console.error('Error creating product:', err);
            setError(err.message || 'Failed to create product.');
        } finally {
            setUploading(false);
        }
    };

    const categories = [
        'Electronics', 'Clothing', 'Furniture', 'Vehicles', 'Sports', 'Books', 'Home', 'Other',
    ];

    const conditions = [
        { value: 'New', label: 'New' },
        { value: 'Like New', label: 'Like New' },
        { value: 'Good', label: 'Good' },
        { value: 'Fair', label: 'Fair' },
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please log in to add a product.</p>
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-neutral-900 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Add New Product</h1>
                        <p className="text-neutral-400 mt-1">Fill in the details below to list your item</p>
                    </div>

                    {error && (
                        <div className="px-6 py-4 bg-red-50 text-red-700 rounded-b-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none"
                                placeholder="e.g., iPhone 13 Pro Max"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none"
                                placeholder="Describe the item..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (EGP) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">EGP</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none"
                                    placeholder="e.g., Nasr City, Cairo"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none bg-white"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Condition
                                </label>
                                <select
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none bg-white"
                                >
                                    {conditions.map((cond) => (
                                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-200 focus:border-neutral-500 outline-none"
                                placeholder="e.g., 01012345678"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Images *
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Max 6 images, JPG/PNG only.</p>

                            {/* معاينة الصور */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${i + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/products')}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`px-6 py-3 rounded-lg text-white ${uploading ? 'bg-neutral-400' : 'bg-neutral-900 hover:bg-neutral-800'
                                    }`}
                            >
                                {uploading ? 'Creating...' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}