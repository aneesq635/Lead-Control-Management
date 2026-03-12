// app/dashboard/settings/page.js
import Link from 'next/link';
import { Smartphone, ChevronRight } from 'lucide-react';

const settingsOptions = [
 {
 href: '/dashboard/settings/whatsapp',
 label: 'WhatsApp Settings',
 description: 'Configure your WhatsApp Cloud API credentials, phone number ID, and webhook verify token.',
 icon: Smartphone,
 },
];

export default function SettingsPage() {
 return (
 <div className="p-6 sm:p-8 max-w-2xl">
 <div className="mb-8">
 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
 <p className="text-sm text-gray-500 mt-1">
 Manage your integrations and workspace configuration.
 </p>
 </div>

 <div className="space-y-3">
 {settingsOptions.map(({ href, label, description, icon: Icon }) => (
 <Link
 key={href}
 href={href}
 className="flex items-center gap-4 bg-white [#111] border border-gray-200 rounded-2xl p-5 hover:border-gray-300 :border-gray-600 hover:shadow-sm transition-all duration-150 group"
 >
 <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 :bg-gray-700 transition-colors">
 <Icon className="w-5 h-5 text-gray-600 " />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-900 ">{label}</p>
 <p className="text-xs text-gray-500 mt-0.5">{description}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-gray-600 :text-gray-400 transition-colors" />
 </Link>
 ))}
 </div>
 </div>
 );
}