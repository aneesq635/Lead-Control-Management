import Link from 'next/link';
import { MessageSquare, Settings } from 'lucide-react';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">LCM Admin</h2>
          <p className="text-xs text-gray-500 mt-1">Multi-Tenant AI Engine</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard/conversations" className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md text-gray-700">
            <MessageSquare size={20} />
            <span>Conversations</span>
          </Link>
          <Link href="/dashboard/settings/whatsapp" className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md text-gray-700">
            <Settings size={20} />
            <span>WhatsApp Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
