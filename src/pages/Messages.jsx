import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function MessagesPage() {
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const [searchParams] = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    // URL Params
    const paramTo = searchParams.get('to');
    const paramListing = searchParams.get('listing');
    const paramConvId = searchParams.get('conversation');

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages]);

    // ==========================================
    // 1. Load All Conversations (Sidebar)
    // ==========================================
    useEffect(() => {
        if (!user) return;

        const loadConversations = async () => {
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

                // Process and format data
                const formatted = data.map(conv => {
                    // Fallback for missing profiles
                    const u1 = conv.user1_profile || { id: conv.user1, full_name: 'Unknown User' };
                    const u2 = conv.user2_profile || { id: conv.user2, full_name: 'Unknown User' };

                    const otherUser = conv.user1 === user.id ? u2 : u1;
                    
                    return {
                        id: conv.id,
                        otherUserId: otherUser.id,
                        name: otherUser.full_name || 'User',
                        avatar: (otherUser.full_name || 'User').substring(0, 2).toUpperCase(),
                        productName: conv.product?.name,
                        productId: conv.product_id,
                        lastMessage: '',
                        lastMessageTime: '',
                    };
                });

                // Fetch last messages
                const convIds = formatted.map(c => c.id);
                if (convIds.length > 0) {
                    const { data: msgs } = await supabase
                        .from('messages')
                        .select('conversation_id, content, created_at')
                        .in('conversation_id', convIds)
                        .order('created_at', { ascending: false });

                    if (msgs) {
                        const lastMsgMap = {};
                        // Take the first one found for each conversation (since ordered by desc)
                        msgs.forEach(m => {
                            if (!lastMsgMap[m.conversation_id]) {
                                lastMsgMap[m.conversation_id] = m;
                            }
                        });

                        formatted.forEach(conv => {
                            const last = lastMsgMap[conv.id];
                            if (last) {
                                conv.lastMessage = last.content;
                                conv.lastMessageTime = new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                        });
                    }
                }

                setConversations(formatted);
            } catch (err) {
                console.error("Load conversations error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
    }, [user]);

    // ==========================================
    // 2. Handle URL Params & Selection
    // ==========================================
    useEffect(() => {
        if (!user || loading) return;

        const handleParams = async () => {
            // Case A: Select by Conversation ID
            if (paramConvId) {
                const existing = conversations.find(c => c.id === paramConvId);
                if (existing) {
                    selectConversation(existing);
                    return;
                }
            }

            // Case B: Select by Target User (and optional listing)
            if (paramTo) {
                // Check existing by otherUserId AND product (if listing provided)
                // If listing is provided, we prefer a conversation about that listing.
                // If not, we just find any conversation with that user? 
                // Requirement says: "display all conversations... regardless of product" for header click.
                // But for Product Details click, we want specific context.
                
                let existing;
                if (paramListing) {
                    existing = conversations.find(c => c.otherUserId === paramTo && c.productId === paramListing);
                } else {
                    existing = conversations.find(c => c.otherUserId === paramTo);
                }

                if (existing) {
                    selectConversation(existing);
                } else {
                    // Create Temp "NEW" Conversation
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', paramTo)
                        .single();
                    
                    const tempConv = {
                        id: 'NEW',
                        otherUserId: paramTo,
                        name: profile?.full_name || 'User',
                        avatar: (profile?.full_name || 'User').substring(0, 2).toUpperCase(),
                        productName: 'New Inquiry', // Placeholder until product loaded or just generic
                        productId: paramListing || null,
                        messages: []
                    };
                    setSelectedConversation(tempConv);
                }
            }
        };

        handleParams();
    }, [loading, paramConvId, paramTo, paramListing]); // removed conversations dependency to avoid loop

    // ==========================================
    // 3. Realtime Subscription
    // ==========================================
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMsg = payload.new;
                
                // Update selected conversation if match
                setSelectedConversation(prev => {
                    if (prev && prev.id === newMsg.conversation_id) {
                        return {
                            ...prev,
                            messages: [...(prev.messages || []), newMsg]
                        };
                    }
                    return prev;
                });

                // Update sidebar list (Last message)
                setConversations(prev => prev.map(c => {
                    if (c.id === newMsg.conversation_id) {
                        return {
                            ...c,
                            lastMessage: newMsg.content,
                            lastMessageTime: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                    }
                    return c;
                }));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // ==========================================
    // 4. Helper: Select Conversation
    // ==========================================
    const selectConversation = async (conv) => {
        if (conv.id === 'NEW') {
            setSelectedConversation(conv);
            return;
        }

        // Fetch full messages
        const { data: msgs, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

        if (!error) {
            setSelectedConversation({
                ...conv,
                messages: msgs || []
            });
            // Update URL without reloading to reflect current selection
            // navigate(`/messages?conversation=${conv.id}`, { replace: true });
        }
    };

    // ==========================================
    // 5. Send Message
    // ==========================================
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const content = newMessage.trim();
        setNewMessage('');

        try {
            let finalConvId = selectedConversation.id;

            // Create Conversation if NEW
            if (selectedConversation.id === 'NEW') {
                const { data: newConv, error: createError } = await supabase
                    .from('conversations')
                    .insert([{
                        user1: user.id,
                        user2: selectedConversation.otherUserId,
                        product_id: selectedConversation.productId || null
                    }])
                    .select('*, product:product_id(name)') // Fetch product name too if possible
                    .single();

                if (createError) throw createError;
                
                finalConvId = newConv.id;
                
                // Add to sidebar
                const newConvFormatted = {
                    id: finalConvId,
                    otherUserId: selectedConversation.otherUserId,
                    name: selectedConversation.name,
                    avatar: selectedConversation.avatar,
                    productName: selectedConversation.productId ? 'Product Inquiry' : null, // Simplify
                    lastMessage: content,
                    lastMessageTime: 'Just now'
                };
                setConversations(prev => [newConvFormatted, ...prev]);
            }

            // Insert Message
            const { data: msgData, error: msgError } = await supabase
                .from('messages')
                .insert([{
                    conversation_id: finalConvId,
                    sender_id: user.id,
                    receiver_id: selectedConversation.otherUserId,
                    content: content,
                    product_id: selectedConversation.productId || null
                }])
                .select()
                .single();

            if (msgError) throw msgError;

            // Optimistic update handled by Realtime? 
            // Better to update manually to be instant, duplicate check might be needed if realtime is fast.
            // For now, let's update manually and let realtime double check or just ignore if ID exists.
            // Actually, realtime is better for *incoming*, manual for *outgoing* to feel responsive.
            
            const newMsgObj = { ...msgData };

            setSelectedConversation(prev => {
                // If we just converted NEW to real ID, update ID too
                if (prev.id === 'NEW') {
                    return {
                        ...prev,
                        id: finalConvId,
                        messages: [newMsgObj]
                    };
                }
                // Check if message already added by realtime (race condition)
                if (prev.messages?.some(m => m.id === newMsgObj.id)) return prev;
                
                return {
                    ...prev,
                    messages: [...(prev.messages || []), newMsgObj]
                };
            });

            // Update sidebar if not NEW (NEW handled above)
            if (selectedConversation.id !== 'NEW') {
                setConversations(prev => prev.map(c => 
                    c.id === finalConvId 
                        ? { ...c, lastMessage: content, lastMessageTime: 'Just now' }
                        : c
                ));
            }

        } catch (err) {
            console.error("Send message error:", err);
            alert("Failed to send message");
        }
    };

    // ==========================================
    // Render
    // ==========================================
    if (loading && !selectedConversation) {
        return <div className="flex items-center justify-center h-screen text-gray-500">Loading messages...</div>;
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* --- Left Sidebar (Contact List) --- */}
            <div className="hidden md:flex md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv.id}
                                onClick={() => selectConversation(conv)}
                                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
                                    selectedConversation?.id === conv.id ? 'bg-neutral-50 border-l-4 border-l-neutral-900' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold shrink-0">
                                        {conv.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                                            <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                                        </div>
                                        {conv.productName && (
                                            <div className="text-xs text-blue-600 truncate mb-0.5">
                                                re: {conv.productName}
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 truncate">
                                            {conv.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- Right Chat Area --- */}
            <div className="flex-1 flex flex-col bg-white">
                {!selectedConversation && (
                    <div className="md:hidden flex-1 overflow-y-auto p-4 bg-white">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {conversations.map(conv => (
                                    <div 
                                        key={conv.id}
                                        onClick={() => selectConversation(conv)}
                                        className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm active:scale-[0.99] transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-bold shrink-0">
                                                {conv.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline">
                                                    <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                                                    <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                                                </div>
                                                {conv.productName && (
                                                    <div className="text-xs text-blue-600 truncate mb-0.5">
                                                        re: {conv.productName}
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conv.lastMessage || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                {/* Back button for mobile */}
                                <button 
                                    className="md:hidden text-gray-500"
                                    onClick={() => setSelectedConversation(null)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">
                                    {selectedConversation.avatar}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">{selectedConversation.name}</h2>
                                    {selectedConversation.productName && (
                                        <p className="text-xs text-gray-500">Item: {selectedConversation.productName}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {selectedConversation.messages?.length === 0 && (
                                <div className="text-center text-gray-400 mt-10">
                                    Start the conversation with {selectedConversation.name}
                                </div>
                            )}
                            
                            {selectedConversation.messages?.map((msg, idx) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                            isMe 
                                                ? 'bg-neutral-900 text-white rounded-br-none' 
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-neutral-900 text-white p-2 rounded-full hover:bg-neutral-800 disabled:opacity-50 transition shadow-sm"
                                >
                                    <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
