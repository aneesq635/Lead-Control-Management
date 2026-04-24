"use client"
import React, { useState, useEffect } from 'react';
import CTAButton from './CTAButton';
import { useAuth } from './AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import supabase from "../component/supabase"
import { ChevronDown, User, Settings, LogOut, MessageSquare, LayoutDashboard , Sun, Moon,X, Menu } from "lucide-react";
import { useTheme } from 'next-themes';

const Header = () => {

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "RAG", href: "/dashboard/rag" },
        { label: "Conversations", href: "/dashboard/conversations" },
    ];

      const isActive = (href) => href === "/" ? pathname === "/" : pathname?.startsWith(href);

 const ProfileDropdown = ({ user, theme, onLogout }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest(".profile-dropdown")) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    const userImage = user?.user_metadata?.picture;
    const userName = user?.name || user?.user_metadata?.name || "User";
    const userEmail = user?.email || user?.user_metadata?.email;

    return (
        <div className="relative profile-dropdown">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-200 group"
            >
                <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-white/25 group-hover:ring-gray-300 transition-all duration-200">
                    {userImage ? (
                        <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white max-w-[90px] truncate">
                        {userName}
                    </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl z-50 border shadow-xl shadow-black/10 dark:shadow-black/40 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-t-2xl" />

                    <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-white/10 flex-shrink-0">
                                {userImage ? (
                                    <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{userName}</p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px mx-4 bg-gray-100 dark:bg-white/5" />

                    <div className="p-2">
                        <button onClick={() => { router.push('/dashboard'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150 group cursor-pointer">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
                                <LayoutDashboard className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Dashboard</span>
                        </button>

                        <button onClick={() => { router.push('/dashboard/settings'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150 group cursor-pointer">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
                                <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Settings</span>
                        </button>
                    </div>

                    <div className="h-px mx-4 bg-gray-100 dark:bg-white/5" />

                    <div className="p-2">
                        <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-150 group cursor-pointer">
                            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                                <LogOut className="w-3.5 h-3.5 text-red-500" />
                            </div>
                            <span className="text-sm text-red-600 font-medium">Sign out</span>
                        </button>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent rounded-b-2xl" />
                </div>
            )}
        </div>
    );
};
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (error) {
      console.log("Error occured while signout: ", error);
      useErrorNotification("Error occur during sign out");
    }
  };

  return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <button
                            className="font-bold text-xl tracking-tight text-black dark:text-white cursor-pointer"
                            onClick={() => router.push('/')}
                        >
                            LeadFlow <span className="text-gray-500">AI</span>
                        </button>
                        
                        {/* Center Nav - desktop */}
                        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                            {navLinks.map(({ label, href }) => (
                                <button
                                    key={href}
                                    onClick={() => router.push(href)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                                        isActive(href)
                                            ? 'bg-black dark:bg-white text-white dark:text-black cursor-default'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            {/* Theme toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                {theme === 'dark' ? <Moon size={15} className="text-indigo-400" /> : <Sun size={15} className="text-amber-500" />}
                            </button>

                            {/* Profile or Login - desktop */}
                            <div className="hidden lg:block">
                                {user ? (
                                    <ProfileDropdown user={user} theme={theme} onLogout={handleLogout} />
                                ) : (
                                    <button
                                        onClick={() => router.push("/Authentication")}
                                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        Login/Signup
                                    </button>
                                )}
                            </div>

                            {/* Hamburger - mobile only */}
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400"
                            >
                                <Menu size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div className={`lg:hidden fixed top-0 right-0 h-full w-72 z-50 bg-white dark:bg-[#0f0f0f] border-l border-gray-100 dark:border-white/5 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                    <span className="font-bold text-lg text-black dark:text-white">LeadFlow <span className="text-gray-500">AI</span></span>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navLinks.map(({ label, href }) => (
                        <button
                            key={href}
                            onClick={() => { router.push(href); setMobileOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                                isActive(href)
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Bottom: Dark mode + Login */}
                <div className="px-3 py-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        <span>Dark Mode</span>
                        <div className="flex items-center gap-2">
                            <Sun size={15} className="text-amber-500" />
                            <div className="w-10 h-5 bg-gray-200 dark:bg-white/20 rounded-full relative transition-colors duration-300">
                                <div className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <Moon size={15} className="text-indigo-400" />
                        </div>
                    </button>

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                            <LogOut size={15} />
                            Sign out
                        </button>
                    ) : (
                        <button
                            onClick={() => { router.push("/Authentication"); setMobileOpen(false); }}
                            className="w-full px-4 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold transition-colors"
                        >
                            Login / Signup
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;
