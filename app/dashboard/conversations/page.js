"use client";

import { MessageSquare } from "lucide-react";

export default function ConversationsIndexPage() {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors h-full overflow-hidden">
            <div className="text-center max-w-sm px-6">
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <MessageSquare size={28} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Your Messages
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select a conversation from the sidebar to view the thread and start messaging.
                </p>
            </div>
        </div>
    );
}