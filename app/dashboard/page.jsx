// app/dashboard/page.js
'use client'
import { MessageSquare, Users, TrendingUp, Zap, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const stats = [
 { label: 'Total Conversations', value: '1,284', change: '+12%', icon: MessageSquare },
 { label: 'Active Leads', value: '348', change: '+8%', icon: Users },
 { label: 'Conversion Rate', value: '24.6%', change: '+3.2%', icon: TrendingUp },
 { label: 'AI Responses', value: '9,410', change: '+21%', icon: Zap },
];

export default function DashboardPage() {
 const router = useRouter()
 return (
 <div className="flex-1 p-8 bg-gray-50 [#0a0a0a] min-h-screen">

 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
 Dashboard
 </h1>
 <p className="text-sm text-gray-500 mt-1">
 Welcome back — here's what's happening today.
 </p>
 </div>
 <button
 onClick={() => router.push("/workspace/create")}
 className="flex items-center gap-2 h-10 px-4 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] shrink-0 cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 New Workspace
 </button>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
 {stats.map(({ label, value, change, icon: Icon }) => (
 <div
 key={label}
 className="bg-white [#111] border border-gray-200 rounded-2xl p-5 flex flex-col gap-4"
 >
 <div className="flex items-center justify-between">
 <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
 <Icon className="w-4 h-4 text-gray-600 " />
 </div>
 <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
 {change}
 </span>
 </div>
 <div>
 <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
 <p className="text-xs text-gray-500 mt-0.5">{label}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Quick Actions
 <div className="bg-white [#111] border border-gray-200 rounded-2xl p-6">
 <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
 Quick Start
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <a
 href="/dashboard/conversations"
 className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300 :border-gray-600 hover:bg-gray-50 :bg-white/5 transition-all duration-200 group"
 >
 <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
 <MessageSquare className="w-4 h-4 text-white " />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-900 ">View Conversations</p>
 <p className="text-xs text-gray-400 ">See all AI-managed chats</p>
 </div>
 </a>
 <a
 href="/dashboard/settings/whatsapp"
 className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300 :border-gray-600 hover:bg-gray-50 :bg-white/5 transition-all duration-200 group"
 >
 <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
 <Zap className="w-4 h-4 text-white " />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-900 ">WhatsApp Settings</p>
 <p className="text-xs text-gray-400 ">Configure your AI agent</p>
 </div>
 </a>
 </div>
 </div> */}

 </div>
 );
}