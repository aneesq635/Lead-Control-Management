'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Settings, ChevronDown, Plus, ArrowLeft, Smartphone, Database, PanelLeftClose, PanelLeft, Sun, Moon, Menu } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedWorkspace } from '../component/MainSlice';
import { useTheme } from 'next-themes';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const workspaces = useSelector((state)=> state.main.workspace)
    const selectedWorkspace = useSelector((state)=> state.main.selectedWorkspace)
    
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/dashboard/settings'));
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    // Theme setup
    const { theme, setTheme } = useTheme();

    const isActive = (href) => pathname === href;
    const isGroupActive = (prefix) => pathname.startsWith(prefix);

    useEffect(() => {
        setMounted(true);
        if(workspaces) setLoadingWorkspaces(false);
    }, [workspaces]);

    const settingsLinks = [
        { href: '/dashboard/settings/whatsapp', label: 'WhatsApp', icon: Smartphone },
    ];

    const isCollapsed = sidebarCollapsed;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* Mobile Header */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 z-40">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -ml-2 text-gray-500 dark:text-gray-400">
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => router.push("/")} className="text-gray-500 dark:text-gray-400">
                        <ArrowLeft size={20} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside 
                className={`${isCollapsed ? 'w-[72px]' : 'w-64'} 
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                fixed md:relative top-0 left-0 h-full z-50
                bg-white dark:bg-[#111] border-r border-gray-200 dark:border-white/5 
                flex flex-col shrink-0 transition-all duration-300 ease-in-out`}
            >
                {/* Top: Back + New Workspace */}
                <div className="p-4 space-y-3 border-b border-gray-100 dark:border-white/5 mt-14 md:mt-0">
                    <div className="flex items-center justify-between overflow-hidden">
                        <button
                            onClick={() => router.push("/")}
                            className={`flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer ${isCollapsed ? 'mx-auto' : ''}`}
                            title="Go Back"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {!isCollapsed && <span>Back</span>}
                        </button>
                        {!isCollapsed && (
                            <button
                                onClick={() => setSidebarCollapsed(true)}
                                className="hidden md:flex p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <PanelLeftClose size={16} />
                            </button>
                        )}
                    </div>
                    
                    {isCollapsed && (
                        <div className="hidden md:flex justify-center pb-2">
                             <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <PanelLeft size={16} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/workspace/create')}
                        className={`flex items-center justify-center gap-2 w-full h-10 ${isCollapsed ? 'px-0' : 'px-4'} 
                        bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white 
                        rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] mt-2`}
                        title="New Workspace"
                    >
                        <Plus className="w-4 h-4" />
                        {!isCollapsed && <span>New Workspace</span>}
                    </button>

                    {/* Workspace Selector */}
                    {!isCollapsed && (
                        <div className="pt-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                Workspace
                            </p>
                            {loadingWorkspaces ? (
                                <div className="h-10 w-full bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
                            ) : (
                                <select
                                    value={selectedWorkspace?.workspace_id || ''}
                                    onChange={(e) => {
                                        const ws = workspaces.find((w) => w.workspace_id === e.target.value);
                                        dispatch(setSelectedWorkspace(ws || null));
                                    }}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-black bg-gray-50 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all appearance-none cursor-pointer"
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
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {/* Dashboard */}
                    <Link
                        href="/dashboard"
                        title="Dashboard"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                            isActive('/dashboard')
                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/5 dark:shadow-white/5'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            isActive('/dashboard') ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                        }`}>
                            <LayoutDashboard className="w-4 h-4" />
                        </div>
                        {!isCollapsed && <span>Dashboard</span>}
                    </Link>

                    {/* Conversations */}
                    <Link
                        href="/dashboard/conversations"
                        title="Conversations"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                            isGroupActive('/dashboard/conversations')
                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/5 dark:shadow-white/5'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            isGroupActive('/dashboard/conversations') ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                        }`}>
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        {!isCollapsed && <span>Conversations</span>}
                    </Link>
                    
                    {/* Inventory */}
                    {/* <Link
                        href="/dashboard/inventory"
                        title="Inventory"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                            isGroupActive('/dashboard/inventory')
                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/5 dark:shadow-white/5'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            isGroupActive('/dashboard/inventory') ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                        }`}>
                            <Database className="w-4 h-4" />
                        </div>
                        {!isCollapsed && <span>Inventory</span>}
                    </Link> */}

                    {/* RAG Knowledge Base */}
                    <Link
                        href="/dashboard/rag"
                        title="Knowledge Base"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                            isGroupActive('/dashboard/rag')
                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md shadow-black/5 dark:shadow-white/5'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            isGroupActive('/dashboard/rag') ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                        }`}>
                            <Database className="w-4 h-4" />
                        </div>
                        {!isCollapsed && <span>Knowledge Base</span>}
                    </Link>

                </nav>

                {/* Settings & Theme */}
                <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#111]">
                    {!isCollapsed ? (
                        <>
                            <button
                                onClick={() => setSettingsOpen(!settingsOpen)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                    isGroupActive('/dashboard/settings') ? 'bg-gray-200 dark:bg-white/10' : 'bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                                }`}>
                                    <Settings className="w-4 h-4" />
                                </div>
                                <span className="flex-1 text-left">Settings</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Settings sub-links */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${settingsOpen ? 'max-h-40 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0 mb-0'}`}>
                                <div className="ml-5 pl-3 border-l-2 border-gray-100 dark:border-white/5 space-y-1">
                                    {settingsLinks.map(({ href, label, icon: Icon }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                                                isActive(href)
                                                    ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-sm'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Theme Toggle */}
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="w-full mt-1 flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/50 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors group"
                                >
                                    <span className="flex items-center gap-2">
                                        {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
                                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                    </span>
                                    <div className="w-8 h-4 bg-gray-200 dark:bg-white/20 rounded-full relative transition-colors duration-300">
                                        <div className={`absolute top-[2px] left-[2px] w-3 h-3 bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Link
                                href="/dashboard/settings/whatsapp"
                                title="Settings"
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    isGroupActive('/dashboard/settings') ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                }`}
                            >
                                <Settings className="w-4 h-4" />
                            </Link>
                            
                            {mounted && (
                                <button
                                    title="Toggle Theme"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </aside>
            
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <main className="flex-1 flex flex-col h-full overflow-hidden mt-14 md:mt-0 relative">
                {children}
            </main>
        </div>
    );
}