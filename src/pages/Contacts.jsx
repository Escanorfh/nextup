import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function ContactsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .select(`
                        *,
                        product:product_id(name),
                        user1_profile:user1(full_name, id),
                        user2_profile:user2(full_name, id)
                    `)
                    .or(`user1.eq.${user.id},user2.eq.${user.id}`)
                    .order('created_at', { ascending: false });
                if (error) throw error;

                const formatted = (data || []).map(conv => {
                    const u1 = conv.user1_profile || { id: conv.user1, full_name: 'User' };
                    const u2 = conv.user2_profile || { id: conv.user2, full_name: 'User' };
                    const other = conv.user1 === user.id ? u2 : u1;
                    return {
                        id: conv.id,
                        name: other.full_name || 'User',
                        initials: (other.full_name || 'User').substring(0, 2).toUpperCase(),
                        productName: conv.product?.name || null,
                        productId: conv.product_id || null,
                    };
                });

                const ids = formatted.map(f => f.id);
                if (ids.length > 0) {
                    const { data: msgs } = await supabase
                        .from('messages')
                        .select('conversation_id, content, created_at')
                        .in('conversation_id', ids)
                        .order('created_at', { ascending: false });
                    if (msgs) {
                        const map = {};
                        msgs.forEach(m => {
                            if (!map[m.conversation_id]) map[m.conversation_id] = m;
                        });
                        formatted.forEach(c => {
                            const last = map[c.id];
                            if (last) {
                                c.lastMessage = last.content;
                                c.lastTime = new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            } else {
                                c.lastMessage = '';
                                c.lastTime = '';
                            }
                        });
                    }
                }

                setItems(formatted);
            } catch (err) {
                console.error('Load contacts error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading contacts...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Contacts</h1>
                </div>
                {items.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                        No conversations yet
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map(item => (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold">
                                        {item.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <div className="font-semibold text-neutral-900 truncate">{item.name}</div>
                                            <div className="text-xs text-gray-400">{item.lastTime}</div>
                                        </div>
                                        {item.productName && (
                                            <div className="text-xs text-blue-600 truncate">re: {item.productName}</div>
                                        )}
                                        <div className="text-sm text-gray-700 truncate">{item.lastMessage || 'No messages yet'}</div>
                                    </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/messages?conversation=${item.id}`)}
                                        className="px-3 py-1.5 bg-neutral-900 text-white rounded-full text-sm hover:bg-neutral-800 transition"
                                    >
                                        Open Chat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

