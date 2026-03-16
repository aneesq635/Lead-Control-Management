'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Settings, ChevronDown, Plus, ArrowLeft, Smartphone } from 'lucide-react';
import {useAuth} from "../component/AuthContext"
import { useSelector, useDispatch } from 'react-redux';
import { setWorkspace, setSelectedWorkspace } from '../component/MainSlice';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const supabase_id = user?.id;
    const dispatch = useDispatch();
    const workspaces = useSelector((state)=> state.main.workspace)
    const selectedWorkspace = useSelector((state)=> state.main.selectedWorkspace)

    // const [workspaces, setWorkspaces] = useState([]);
    // const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/dashboard/settings'));

    const isActive = (href) => pathname === href;
    const isGroupActive = (prefix) => pathname.startsWith(prefix);

    useEffect(() => {
        if (!supabase_id) return;
        const fetchWorkspaces = async () => {
            setLoadingWorkspaces(true);
            try {
                const res = await fetch(`/api/workspace/get?supabase_id=${supabase_id}`);
                const data = await res.json();
                if (data.success) {
                    dispatch(setWorkspace(data.workspaces));
                    if (data.workspaces.length > 0) {
                        dispatch(setSelectedWorkspace(data.workspaces[0]));
                    }
                }
            } catch (err) {
                console.error('Error fetching workspaces:', err);
            } finally {
                setLoadingWorkspaces(false);
            }
        };
        fetchWorkspaces();
    }, [supabase_id]);

    const settingsLinks = [
        { href: '/dashboard/settings/whatsapp', label: 'WhatsApp', icon: Smartphone },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">

                {/* Top: Back + New Workspace */}
                <div className="p-3 space-y-2 border-b border-gray-100">
                    <button
                        onClick={() => {router.push("/")}}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {/* <span>Back</span> */}
                    </button>

                    <button
                        onClick={() => router.push('/workspace/create')}
                        className="flex items-center justify-center gap-2 w-full h-9 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Workspace
                    </button>

                    {/* Workspace Selector */}
                    <div className="pt-1">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
                            Workspace
                        </p>
                        {loadingWorkspaces ? (
                            <div className="h-9 w-full bg-gray-100 rounded-xl animate-pulse" />
                        ) : (
                            <select
                                value={selectedWorkspace?.workspace_id || ''}
                                onChange={(e) => {
                                    const ws = workspaces.find((w) => w.workspace_id === e.target.value);
                                    dispatch(setSelectedWorkspace(ws || null));
                                }}
                                className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            >
                                <option value="">Select workspace…</option>
                                {workspaces.map((ws) => (
                                    <option key={ws.workspace_id} value={ws.workspace_id}>
                                        {ws.company_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">

                    {/* Dashboard */}
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                            isActive('/dashboard')
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isActive('/dashboard') ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                            <LayoutDashboard className="w-3.5 h-3.5" />
                        </div>
                        Dashboard
                    </Link>

                    {/* All Conversations — flat link, no dropdown */}
                    <Link
                        href="/dashboard/conversations"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                            isGroupActive('/dashboard/conversations')
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isGroupActive('/dashboard/conversations') ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        Conversations
                    </Link>

                </nav>

                {/* Settings — pinned to bottom, collapsible like VS Code */}
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className={`w-full text-black  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group `}
                    >
                        <div className={`w-7 h-7 rounded-lg flex items-center text-black justify-center transition-colors ${
                            isGroupActive('/dashboard/settings') ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                            <Settings className="w-3.5 h-3.5" />
                        </div>
                        <span className="flex-1 text-left">Settings</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Settings sub-links */}
                    <div className={`overflow-hidden transition-all duration-200 ease-in-out ${settingsOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-4 pl-3 border-l border-gray-100 space-y-0.5">
                            {settingsLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                                        isActive(href)
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {children}
            </main>
        </div>
    );
}

// 'use client';

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { LayoutDashboard, MessageSquare, Settings, ChevronDown, Plus, ArrowLeft } from 'lucide-react';

// export default function DashboardLayout({ children }) {
//     const pathname = usePathname();
//     const [convoOpen, setConvoOpen] = useState(pathname.startsWith('/dashboard/conversations'));
//     const router = useRouter()

//     const isActive = (href) => pathname === href;
//     const isGroupActive = (prefix) => pathname.startsWith(prefix);

//     return (
//         <div className="flex h-screen bg-gray-100 [#0a0a0a]">
//             <aside className="w-56 bg-white [#111] border-r border-gray-200 flex flex-col shrink-0">

//                 <button
//                     onClick={() => router.back()}
//                     className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 :text-white mb-6 transition-colors group"
//                 >
//                     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />

//                 </button>
//                 <button
//                     onClick={() => router.push("/workspace/create")}
//                     className="flex items-center gap-2 h-10 px-4 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] shrink-0 cursor-pointer"
//                 >
//                     <Plus className="w-4 h-4" />
//                     New Workspace
//                 </button>
//                 <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">


//                     {/* Dashboard */}
//                     <Link
//                         href="/dashboard"
//                         className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive('/dashboard')
//                             ? 'bg-black text-white '
//                             : 'text-gray-700 hover:bg-gray-100 :bg-white/5'
//                             }`}
//                     >
//                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isActive('/dashboard') ? 'bg-white/20 ' : 'bg-gray-100 group-hover:bg-gray-200 :bg-gray-700'
//                             }`}>
//                             <LayoutDashboard className="w-3.5 h-3.5" />
//                         </div>
//                         Dashboard
//                     </Link>

//                     {/* Conversations (collapsible) */}
//                     <div>
//                         <button
//                             onClick={() => setConvoOpen(!convoOpen)}
//                             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isGroupActive('/dashboard/conversations')
//                                 ? 'text-gray-900 bg-gray-100 '
//                                 : 'text-gray-700 hover:bg-gray-100 :bg-white/5'
//                                 }`}
//                         >
//                             <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isGroupActive('/dashboard/conversations') ? 'bg-gray-200 ' : 'bg-gray-100 group-hover:bg-gray-200 :bg-gray-700'
//                                 }`}>
//                                 <MessageSquare className="w-3.5 h-3.5" />
//                             </div>
//                             <span className="flex-1 text-left">Conversations</span>
//                             <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${convoOpen ? 'rotate-180' : ''}`} />
//                         </button>

//                         <div className={`overflow-hidden transition-all duration-200 ease-in-out ${convoOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
//                             <div className="ml-4 pl-3 border-l border-gray-100 mt-1 space-y-0.5">
//                                 <Link
//                                     href="/dashboard/conversations"
//                                     className={`flex items-center px-3 py-2 rounded-xl text-sm transition-all duration-150 ${isActive('/dashboard/conversations')
//                                         ? 'bg-black text-white font-medium'
//                                         : 'text-gray-600 hover:bg-gray-100 :bg-white/5 hover:text-gray-900 :text-white'
//                                         }`}
//                                 >
//                                     All Conversations
//                                 </Link>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Settings — direct link, no dropdown here */}
//                     <Link
//                         href="/dashboard/settings"
//                         className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isGroupActive('/dashboard/settings')
//                             ? 'bg-black text-white '
//                             : 'text-gray-700 hover:bg-gray-100 :bg-white/5'
//                             }`}
//                     >
//                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isGroupActive('/dashboard/settings') ? 'bg-white/20 ' : 'bg-gray-100 group-hover:bg-gray-200 :bg-gray-700'
//                             }`}>
//                             <Settings className="w-3.5 h-3.5" />
//                         </div>
//                         Settings
//                     </Link>

//                 </nav>
//             </aside>

//             <main className="flex-1 flex flex-col h-full overflow-hidden">
//                 {children}
//             </main>
//         </div>
//     );
// }