'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Settings, ChevronDown } from 'lucide-react';

export default function DashboardLayout({ children }) {
 const pathname = usePathname();
 const [convoOpen, setConvoOpen] = useState(pathname.startsWith('/dashboard/conversations'));
 

 const isActive = (href) => pathname === href;
 const isGroupActive = (prefix) => pathname.startsWith(prefix);

 return (
 <div className="flex h-screen bg-gray-100 [#0a0a0a]">
 <aside className="w-56 bg-white [#111] border-r border-gray-200 flex flex-col shrink-0">

 <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">

 {/* Dashboard */}
 <Link
 href="/dashboard"
 className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
 isActive('/dashboard')
 ? 'bg-black text-white '
 : 'text-gray-700 hover:bg-gray-100 :bg-white/5'
 }`}
 >
 <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
 isActive('/dashboard') ? 'bg-white/20 ' : 'bg-gray-100 group-hover:bg-gray-200 :bg-gray-700'
 }`}>
 <LayoutDashboard className="w-3.5 h-3.5" />
 </div>
 Dashboard
 </Link>

 {/* Conversations (collapsible) */}
 <div>
 <button
 onClick={() => setConvoOpen(!convoOpen)}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
 isGroupActive('/dashboard/conversations')
 ? 'text-gray-900 bg-gray-100 '
 : 'text-gray-700 hover:bg-gray-100 :bg-white/5'
 }`}
 >
 <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
 isGroupActive('/dashboard/conversations') ? 'bg-gray-200 ' : 'bg-gray-100 group-hover:bg-gray-200 :bg-gray-700'
 }`}>
 <MessageSquare className="w-3.5 h-3.5" />
 </div>
 <span className="flex-1 text-left">Conversations</span>
 <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${convoOpen ? 'rotate-180' : ''}`} />
 </button>

 <div className={`overflow-hidden transition-all duration-200 ease-in-out ${convoOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
 <div className="ml-4 pl-3 border-l border-gray-100 mt-1 space-y-0.5">
 <Link
 href="/dashboard/conversations"
 className={`flex items-center px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
 isActive('/dashboard/conversations')
 ? 'bg-black text-white font-medium'
 : 'text-gray-600 hover:bg-gray-100 :bg-white/5 hover:text-gray-900 :text-white'
 }`}
 >
 All Conversations
 </Link>
 </div>
 </div>
 </div>

 {/* Settings — direct link, no dropdown here */}
 <Link
 href="/dashboard/settings"
 className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
 isGroupActive('/dashboard/settings')
 ? 'bg-black text-white '
 : 'text-gray-700 hover:bg-gray-100 :bg-white/5'
 }`}
 >
 <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
 isGroupActive('/dashboard/settings') ? 'bg-white/20 ' : 'bg-gray-100 group-hover:bg-gray-200 :bg-gray-700'
 }`}>
 <Settings className="w-3.5 h-3.5" />
 </div>
 Settings
 </Link>

 </nav>
 </aside>

 <main className="flex-1 flex flex-col h-full overflow-hidden">
 {children}
 </main>
 </div>
 );
}