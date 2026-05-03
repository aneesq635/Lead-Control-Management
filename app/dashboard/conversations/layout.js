"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/component/AuthContext";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setAddConversation, deleConversation } from "@/app/component/MainSlice";
import { MoreVertical, Trash2, MessageSquareX, Table, Package, AlertTriangle, X } from "lucide-react";
import { useWorkspaceSocket } from "@/lib/socket/client";

export default function ConversationsLayout({ children }) {
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useAuth();
    const supabase_id = user?.id;

    const pathname = usePathname();
    const params = useParams();
    const activeId = params?.id;

    const selectedWorkspace = useSelector((state) => state.main.selectedWorkspace);
    const conversations = useSelector((state) => state.main.conversations);
    const dispatch = useDispatch();

    useEffect(() => {
        if (conversations) {
            setLoadingConversations(false);
        }
    }, [conversations]);

    const [menuOpenId, setMenuOpenId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, conv: null });

    const handleDelete = async (id, options = { deleteData: false }) => {
        try {
            const queryParams = new URLSearchParams({ id });
            if (options.deleteData) queryParams.append('deleteData', 'true');

            const response = await fetch(`/api/conversations/delete?${queryParams.toString()}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            const data = await response.json();
            if (data.success) {
                dispatch(deleConversation(id));
                setDeleteModal({ open: false, conv: null });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleClearChat = async (id) => {
        try {
            const response = await fetch(`/api/conversations/clear?id=${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const data = await response.json();
            if (data.success) {
                // Optionally refresh or show a notification
                setMenuOpenId(null);
                // If the active conversation is the one cleared, we might want to refresh messages
                if (activeId === id) window.location.reload(); 
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleConversationUpdate = useCallback((conversation) => {
        dispatch(setAddConversation(conversation));
    }, [dispatch]);

    const {} = useWorkspaceSocket(selectedWorkspace?.workspace_id, handleConversationUpdate);

    if (!supabase_id) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const showListOnMobile = !activeId;

    const filteredConversations = conversations?.filter(conv => {
        const matchesTab = 
            activeTab === 'all' ? true :
            activeTab === 'sellers' ? conv.user_type === 'seller' :
            activeTab === 'buyers' ? conv.user_type === 'buyer' :
            activeTab === 'general' ? (!conv.user_type || conv.user_type === 'unknown') : true;

        const matchesSearch = 
            conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            conv.phone?.includes(searchQuery);

        return matchesTab && matchesSearch;
    }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

    return (
        <div className="flex h-full bg-gray-50 dark:bg-[#0a0a0a] transition-colors">
            {/* Left Pane: Conversation List */}
            <div className={`
                ${showListOnMobile ? 'flex flex-col w-full' : 'hidden md:flex flex-col w-80 lg:w-96'} 
                bg-white dark:bg-[#111] border-r border-gray-200 dark:border-white/5 h-full shrink-0 transition-colors
            `}>
                <header className="px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] shrink-0">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Conversations</h1>
                    {selectedWorkspace && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {selectedWorkspace.company_name}
                        </p>
                    )}
                    
                    <div className="mt-4 relative">
                        <input 
                            type="text" 
                            placeholder="Search name or number..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1 custom-scrollbar scrollbar-hide">
                        {['all', 'general', 'buyers', 'sellers'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-none min-w-[70px] flex-1 capitalize text-sm font-medium py-1.5 px-3 rounded-lg transition-colors ${activeTab === tab ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
                    {!selectedWorkspace ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                                🏢
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No workspace selected</p>
                        </div>
                    ) : loadingConversations ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 animate-pulse">
                                    <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-lg w-1/3 mb-2" />
                                    <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded-lg w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : filteredConversations?.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                                📭
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No {activeTab} conversations</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {filteredConversations?.map((conv) => (
                                <Link
                                    key={conv._id}
                                    href={`/dashboard/conversations/${conv._id}`}
                                    className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-200 group relative
                                        ${activeId === conv._id 
                                            ? 'bg-gray-100 dark:bg-white/10 shadow-sm' 
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                                        {conv.name?.slice(0, 1).toUpperCase() || conv.phone?.slice(-2)}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-8">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                {conv.name || conv.phone}
                                            </h3>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                                                {new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {conv.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setMenuOpenId(menuOpenId === conv._id ? null : conv._id);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {menuOpenId === conv._id && (
                                            <div 
                                                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); handleClearChat(conv._id); }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <MessageSquareX size={14} className="text-amber-500" />
                                                    Clear Chat
                                                </button>

                                                {conv.user_type === 'buyer' && (
                                                    <Link 
                                                        href="/dashboard/leads" 
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <Table size={14} className="text-blue-500" />
                                                        View in Lead Table
                                                    </Link>
                                                )}

                                                {conv.user_type === 'seller' && (
                                                    <Link 
                                                        href="/dashboard/rag" 
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <Package size={14} className="text-purple-500" />
                                                        View Inventory
                                                    </Link>
                                                )}

                                                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                                                <button 
                                                    onClick={(e) => { e.preventDefault(); setDeleteModal({ open: true, conv }); setMenuOpenId(null); }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete Conversation
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Pane (& Right Pane): Thread & Details */}
            <div className={`
                ${!showListOnMobile ? 'flex' : 'hidden md:flex'} 
                flex-1 h-full min-w-0 bg-gray-50 dark:bg-[#0a0a0a] transition-colors
            `}>
                {children}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-50 dark:border-white/5">
                            <h3 className="text-lg font-bold">Delete Conversation</h3>
                            <button onClick={() => setDeleteModal({ open: false, conv: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                                <AlertTriangle size={32} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                You are about to delete the conversation with <span className="font-bold text-gray-900 dark:text-white">{deleteModal.conv?.name || deleteModal.conv?.phone}</span>. 
                                How would you like to proceed?
                            </p>

                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={() => handleDelete(deleteModal.conv?._id, { deleteData: false })}
                                    className="w-full py-3.5 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl text-sm font-semibold transition-all"
                                >
                                    Delete Conversation Only
                                </button>
                                
                                {deleteModal.conv?.user_type === 'seller' && (
                                    <button 
                                        onClick={() => handleDelete(deleteModal.conv?._id, { deleteData: true })}
                                        className="w-full py-3.5 px-4 bg-red-600 text-white hover:bg-red-700 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
                                    >
                                        Delete Conversation + Inventory
                                    </button>
                                )}

                                {deleteModal.conv?.user_type === 'buyer' && (
                                    <button 
                                        onClick={() => handleDelete(deleteModal.conv?._id, { deleteData: true })}
                                        className="w-full py-3.5 px-4 bg-red-600 text-white hover:bg-red-700 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
                                    >
                                        Delete Conversation + Lead
                                    </button>
                                )}

                                {(deleteModal.conv?.user_type !== 'seller' && deleteModal.conv?.user_type !== 'buyer') && (
                                    <button 
                                        onClick={() => handleDelete(deleteModal.conv?._id, { deleteData: true })}
                                        className="w-full py-3.5 px-4 bg-red-600 text-white hover:bg-red-700 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
                                    >
                                        Delete Conversation + All Data
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
