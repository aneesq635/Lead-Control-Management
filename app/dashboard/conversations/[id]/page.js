"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Phone, MapPin, Building, Info, DollarSign, ExternalLink, Calendar, Menu, PanelRight, PanelRightClose } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useConversationSocket } from '@/lib/socket/client';
import { useSelector } from 'react-redux';

export default function ConversationThreadPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const conversations = useSelector((state) => state.main.conversations);
    const conversation = conversations?.find((conv) => conv._id === id);
    const selectedWorkspace = useSelector((state) => state.main.selectedWorkspace);
    const allMessages = useSelector((state) => state.main.allMessages || []);
    const leads = useSelector((state) => state.main.leads || []);
    
    // Find associated lead
    const currentLead = leads.find((l) => l.phone === conversation?.phone);

    const currentmessages = allMessages.filter((msg) => msg.conversation_id === id);

    const [loading, setLoading] = useState(currentmessages.length === 0);
    const [error, setError] = useState("");
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false); 
    const [inventoryData, setInventoryData] = useState(null);
    const [agentEnabled, setAgentEnabled] = useState(conversation?.agent_run ?? true);

    const [messages, setMessages] = useState(currentmessages);

    const bottomRef = useRef(null);
    const isInitialLoad = useRef(true);
    const isTyping = messageText.trim().length > 0;

    useEffect(() => {
        if (!id) return;
        // Only show spinner if we don't already have cached messages
        if (messages.length === 0) setLoading(true);
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/conversations/${id}`);
                const data = await res.json();
                if (data.success) {
                    setMessages(data.messages || []);
                } else {
                    setError("Unable to load messages.");
                }
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError("Error loading messages.");
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();


    }, [id]);

    useEffect(() => {
        if (conversation?.user_type === 'seller' && selectedWorkspace) {
            const fetchInventory = async () => {
                try {
                    const pythonApiUrl = 'http://127.0.0.1:5000'; // Fallback to local if env not reachable in client
                    const res = await fetch(`${pythonApiUrl}/api/rag/inventory?workspace_id=${selectedWorkspace.workspace_id}`);
                    const data = await res.json();
                    if (data.success) {
                        // Find this specific user's inventory
                        const userInv = data.inventory.find(item => item.owner_phone === conversation.phone);
                        if (userInv) setInventoryData(userInv);
                    }
                } catch (err) {
                    console.error("Error fetching inventory:", err);
                }
            };
            fetchInventory();
        }
    }, [conversation, selectedWorkspace]);

    const toggleAgent = async () => {
        const newValue = !agentEnabled;
        setAgentEnabled(newValue);
        try {
            await fetch('/api/conversations/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, agent_run: newValue })
            });
        } catch (err) {
            console.error("Error toggling agent:", err);
            setAgentEnabled(!newValue);
        }
    };

    const handleSocketMessage = useCallback((newMessage) => {
        setMessages((prev) => {
            if (prev.some((m) => m._id === newMessage._id)) return prev;
            return [...prev, newMessage];
        });
    }, []);

    const handleConversationUpdate = useCallback((updatedConv) => {
        // Since we're using Redux and the Layout handles global updates, 
        // we don't necessarily need to do much here, but we can log it or 
        // trigger local state updates if needed.
        console.log("Conversation updated in real-time:", updatedConv);
    }, []);

    const { connected } = useConversationSocket(id, handleSocketMessage, handleConversationUpdate);

    useEffect(() => {
        if (!bottomRef.current) return;
        if (isInitialLoad.current) {
            bottomRef.current.scrollIntoView({ behavior: 'instant' });
            isInitialLoad.current = false;
        } else {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || sending) return;

        setSending(true);
        const textToSend = messageText.trim();
        setMessageText("");

        try {
            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspace_id: conversation.workspace_id,
                    conversation_id: conversation._id,
                    phone: conversation.phone,
                    text: textToSend
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
            } else {
                setMessageText(textToSend);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setMessageText(textToSend);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            // create some spinner
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="text-center">
                    <p className="text-red-500 text-sm font-medium">{error || "Conversation not found."}</p>
                    <button onClick={() => router.push('/dashboard/conversations')} className="mt-4 text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
            
            {/* Middle Pane: Chat Area */}
            <div className={`flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-[#0a0a0a] transition-all duration-300 ${detailsOpen ? 'mr-80 lg:mr-96' : ''}`}>
                <header className="px-4 py-3 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#111] flex items-center gap-3 shrink-0 rounded-tl-xl md:rounded-none z-10 shadow-sm">
                    {/* Back button for mobile */}
                    <button
                        onClick={() => router.push('/dashboard/conversations')}
                        className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-white/5"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                            {conversation.name?.slice(0,2).toUpperCase() || conversation.phone?.slice(-2)}
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {conversation.name || conversation.phone}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {selectedWorkspace?.company_name}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-amber-400'} shadow-sm`} title={connected ? 'Live' : 'Connecting'} />
                        </div>
                    </div>

                    <button 
                        onClick={toggleAgent}
                        className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm mr-2 ${agentEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
                        title={agentEnabled ? "AI Agent is Active" : "AI Agent is Paused"}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${agentEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {agentEnabled ? "AI Active" : "AI Off"}
                    </button>

                    <button 
                        onClick={() => setDetailsOpen(!detailsOpen)}
                        className={`hidden md:flex p-2 rounded-lg transition-colors ${detailsOpen ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        title="Show Details"
                    >
                        {detailsOpen ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
                    </button>

                    <button 
                        onClick={() => setDetailsOpen(!detailsOpen)}
                        className="md:hidden p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg"
                    >
                        <Info size={18} />
                    </button>
                </header>

                {/* Chat Flow */}
                <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-[#e9edef] dark:bg-transparent relative custom-scrollbar">
                    {/* Subtle chat background pattern for light mode only (WhatsApp style) */}
                    {/* <div className="absolute inset-0 opacity-[0.03] dark:hidden pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 150%, #111 24%, #fff 25%, #fff 28%, #111 29%, #111 36%, #fff 36%, #fff 40%, transparent 40%, transparent), radial-gradient(circle at 0 150%, #111 24%, #fff 25%, #fff 28%, #111 29%, #111 36%, #fff 36%, #fff 40%, transparent 40%, transparent)', backgroundSize: '15px 15px' }} /> */}
                    
                    <div className="max-w-3xl mx-auto flex flex-col space-y-4 relative z-10 w-full">
                        {messages.length === 0 && !isTyping && (
                            <div className="text-center my-10">
                                <span className="text-xs bg-white dark:bg-white/10 px-3 py-1.5 text-gray-500 dark:text-gray-400 rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                                    Start of conversation
                                </span>
                            </div>
                        )}

                        {messages.map((msg, i) => {
                            const isIncoming = msg.direction === 'incoming';
                            const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[i-1].timestamp).toDateString();
                            
                            return (
                                <div key={msg._id} className="flex flex-col w-full px-1 sm:px-4">
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="text-[11px] font-medium bg-white/70 dark:bg-[#111] px-3 py-1 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm shadow-sm">
                                                {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex w-full mb-1 ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                                        <div
                                            className={`relative group max-w-[85%] sm:max-w-[70%] px-4 py-2 text-sm shadow-sm
                                            ${isIncoming
                                                ? 'bg-white dark:bg-[#18181A] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/5'
                                                : 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tr-sm border border-transparent dark:border-white/5'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                {((!isIncoming && msg.sender_type === 'agent') || (!isIncoming && msg.sender_type === 'consultant')) && (
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${msg.sender_type === 'agent' ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                        {msg.sender_type === 'agent' ? 'Agent Generated' : 'Consultant'}
                                                    </span>
                                                )}
                                                <p className="whitespace-pre-wrap leading-relaxed pb-3">
                                                    {msg.text || `[${msg.message_type}]`}
                                                </p>
                                                <span className={`absolute bottom-1.5 right-3 text-[10px] ${isIncoming ? 'text-gray-400 dark:text-gray-500' : 'text-emerald-700/70 dark:text-green-200/50'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isTyping && (
                            <div className="flex w-full justify-end px-1 sm:px-4 mb-2">
                                <div className="bg-[#d9fdd3] dark:bg-[#005c4b] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-[5px]">
                                        {[0, 200, 400].map(delay => (
                                            <span key={delay} className="w-1.5 h-1.5 rounded-full bg-emerald-700/60 dark:bg-green-200" style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: `${delay}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} className="h-4" />
                    </div>
                </div>

                {/* Input Area */}
                <div className="px-3 py-3 sm:px-6 bg-[#f0f2f5] dark:bg-[#111] border-t border-gray-200 dark:border-white/5 shrink-0 z-10">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="flex-1 h-12 px-5 bg-white dark:bg-[#18181a] border border-transparent dark:border-white/10 rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-white/30 transition-all shadow-sm"
                            placeholder="Type a message…"
                            autoComplete="off"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !messageText.trim()}
                            className="w-12 h-12 bg-indigo-600 dark:bg-white dark:text-black hover:bg-indigo-700 dark:hover:bg-gray-200 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 shrink-0 shadow-sm disabled:cursor-not-allowed"
                        >
                            <Send size={18} className="translate-x-[1px]" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Pane: Details Column (Togglable) */}
            <div className={`
    absolute top-0 right-0 h-full bg-white dark:bg-[#111] border-l border-gray-200 dark:border-white/5 
    transition-transform duration-300 ease-in-out z-20 
    w-full md:w-80 lg:w-96 shadow-2xl
    ${detailsOpen ? 'translate-x-0' : 'translate-x-full'}
`}>
                <div className="flex flex-col h-full bg-white dark:bg-[#111]">
                    <header className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#111] shrink-0 h-16 pointer-events-auto mt-14 md:mt-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Contact Details</h3>
                        <button onClick={() => setDetailsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <ArrowLeft size={16} className="md:hidden" />
                            <PanelRightClose size={16} className="hidden md:block" />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar pointer-events-auto">
                        <div className="text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center mb-4 shadow-sm border border-white dark:border-white/5">
                                <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                    {conversation.name?.slice(0,1).toUpperCase() || conversation.phone?.slice(-2)}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{conversation.name || 'Unknown Name'}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 justify-center">
                                <Phone size={12} /> {conversation.phone}
                            </p>
                            
                            {conversation.user_type === 'buyer' && currentLead && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-3 shadow-sm ${
                                    currentLead.lead_status === 'hot' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-900/50' : 
                                    currentLead.lead_status === 'warm' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50' : 
                                    'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
                                }`}>
                                    {currentLead.lead_status} Lead {currentLead.lead_score && `· Score: ${currentLead.lead_score}`}
                                </span>
                            )}

                            {conversation.user_type === 'seller' && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-3 shadow-sm bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                                    Seller / Owner
                                </span>
                            )}
                        </div>

                        <hr className="border-gray-100 dark:border-white/5" />

                        {conversation.user_type === 'seller' ? (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Inventory Information</h3>
                                {inventoryData ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Location</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{inventoryData.area || 'Not specified'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <Building size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Property Type</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{inventoryData.property_type || 'Unknown'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                                <DollarSign size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Price Demand</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{inventoryData.price || 'Not set'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <Info size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Size</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{inventoryData.size || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                                        <Info size={24} className="text-gray-400 mb-2" />
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Collecting Property Details</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            The agent is still gathering inventory details from the seller.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : currentLead ? (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lead Information</h3>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Location</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentLead.lead_data?.area || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <Building size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Property Type</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{currentLead.lead_data?.property_type || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                            <DollarSign size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Budget</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentLead.lead_data?.budget || 'Not set'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-[#18181a] border border-gray-100 dark:border-white/5 p-3.5 rounded-xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Added On</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{new Date(currentLead.createdAt || currentLead.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
                                <Info size={24} className="text-gray-400 mb-2" />
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No Lead Database Entry</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    AI hasn't qualified this contact as a lead yet, or no specific parameters were set.
                                </p>
                            </div>
                        )}
                        
                        <div className="pt-2">
                             <Link 
                                href="/dashboard" 
                                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white text-sm font-semibold rounded-xl py-3 transition-colors shadow-sm"
                            >
                                <ExternalLink size={14} /> View in Leads table
                             </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Overlay for mobile active state */}
            {detailsOpen && (
                <div 
                    className="md:hidden fixed inset-0 z-10 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setDetailsOpen(false)}
                />
            )}
            
        </div>
    );
}
