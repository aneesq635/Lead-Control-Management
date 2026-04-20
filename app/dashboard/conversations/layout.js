"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/component/AuthContext";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setAddConversation, deleConversation } from "@/app/component/MainSlice";
import { Trash2 } from "lucide-react";
import { useWorkspaceSocket } from "@/lib/socket/client";

export default function ConversationsLayout({ children }) {
    const [loadingConversations, setLoadingConversations] = useState(true);
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

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/conversations/delete?id=${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (data.success) {
                dispatch(deleConversation(id));
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
                    ) : conversations?.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                                📭
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No conversations</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {conversations?.map((conv) => (
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {conv.phone}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDelete(conv._id);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white dark:hover:bg-black/50"
                                        title="Delete Conversation"
                                    >
                                        <Trash2 size={14} />
                                    </button>
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
        </div>
    );
}
