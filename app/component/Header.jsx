"use client"
import React, { useState, useEffect } from 'react';
import CTAButton from './CTAButton';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import supabase from "../component/supabase"
import { ChevronDown, User, Settings, LogOut, MessageSquare, LayoutDashboard } from "lucide-react";

const Header = () => {

    const router = useRouter();
    const { user } = useAuth();
    const theme = 'dark'
    const [isOpen, setIsOpen] = useState(false);

    const ProfileDropdown = ({ user, theme, onLogout }) => {
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
        console.log("user", user);
        const userImage = user?.user_metadata?.picture;
        const userName = user?.name || user?.user_metadata?.name || "User";
        const userEmail = user?.email || user?.user_metadata?.email;

        return (
            <div className="relative profile-dropdown">
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 transition-all duration-200 group"
                >
                    <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-white/15 group-hover:ring-gray-300 dark:group-hover:ring-white/25 transition-all duration-200">
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
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className={`
          absolute right-0 top-full mt-2 w-60 rounded-2xl z-50
          border shadow-xl shadow-black/10 dark:shadow-black/60
          ${theme === "dark"
                            ? "bg-[#0a0a0a] border-gray-800"
                            : "bg-white border-gray-200"
                        }
        `}>

                        {/* Top hairline accent */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-t-2xl" />

                        {/* User Info */}
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
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                                        {userName}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                        {userEmail}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px mx-4 bg-gray-100 dark:bg-gray-800" />

                        {/* Menu Items */}
                        <div className="p-2">
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150 group cursor-pointer"
                                onClick={() => {
                                    router.push('/dashboard')
                                }}>
                                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                                    <LayoutDashboard className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Dashboard</span>
                            </button>

                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-150 group cursor-pointer"
                                onClick={() => { router.push('/dashboard/settings') }}>
                                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                                    <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Settings</span>
                            </button>
                        </div>

                        <div className="h-px mx-4 bg-gray-100 dark:bg-gray-800" />

                        <div className="p-2">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-150 group cursor-pointer"
                            >
                                <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                                    <LogOut className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                                </div>
                                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Sign out</span>
                            </button>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent rounded-b-2xl" />

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
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b border-gray-100 dark:border-gray-900 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side: Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer">
                        <button className="font-bold text-xl tracking-tight text-black dark:text-white cursor-pointer" onClick={() => { router.push('/') }}>
                            LeadFlow <span className="text-gray-500 dark:text-gray-400">AI</span>
                        </button>
                    </div>

                    {/* Center nav */}
                    <nav className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/conversations')}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150"
                        >
                            Conversations
                        </button>
                    </nav>


                    {/* Right side: Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            // <button aria-label="Profile" className="group p-1 rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white focus:outline-none transition-colors">
                            //     <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-800 group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-colors">
                            //         <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            //             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            //         </svg>
                            //     </div>
                            // </button>
                            <ProfileDropdown
                                user={user}
                                theme={theme}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <>
                                <button className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors cursor-pointer"
                                    onClick={() => {
                                        router.push("/Authentication");
                                    }}>
                                    Login/Signup
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
