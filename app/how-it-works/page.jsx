"use client";

import React from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Settings, 
  MessageCircle, 
  Layout, 
  UserCheck, 
  BookOpen, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Zap, 
  ArrowRight,
  ChevronRight,
  Search,
  Users,
  Database,
  Globe
} from 'lucide-react';

const steps = [
  {
    title: "Create Workspace",
    description: "User creates a workspace that represents their business WhatsApp number.",
    icon: <PlusCircle className="w-6 h-6" />,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Connect WhatsApp",
    description: "User adds WhatsApp Cloud API credentials (token, phone number ID) in settings to activate messaging.",
    icon: <Settings className="w-6 h-6" />,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Customer Sends Message",
    description: "A customer sends a message on WhatsApp like: '5 Marla house price?'. System automatically captures the message.",
    icon: <MessageCircle className="w-6 h-6" />,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Conversation Appears",
    description: "The conversation instantly appears in the Conversations panel with customer name and number. Agent can reply manually.",
    icon: <Layout className="w-6 h-6" />,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    title: "Agent Qualification",
    description: "Agent asks questions: Buyer or Seller? Budget? Area? System classifies the conversation based on user type.",
    icon: <UserCheck className="w-6 h-6" />,
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    title: "Knowledge Base (RAG)",
    description: "Agent uses built-in knowledge base: Property inventory, Company documents, Policies. System can generate responses using this data.",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    title: "Lead Creation (Buyer)",
    description: "If user is a buyer: Agent collects requirements, System creates a structured lead. Conversation is paused.",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-rose-500/10 text-rose-500",
  },
  {
    title: "Inventory Creation (Seller)",
    description: "If user is a seller: Agent collects property details, System adds property to inventory, Inventory PDF is auto-generated.",
    icon: <Package className="w-6 h-6" />,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Dashboard Insights",
    description: "All data appears in dashboard: Leads, Inventory, Graphs (hot, cold, follow-ups).",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-teal-500/10 text-teal-500",
  },
  {
    title: "Automation (Future)",
    description: "Upcoming features: Auto follow-ups, Consultant reminders, Lead tracking panel.",
    icon: <Zap className="w-6 h-6" />,
    color: "bg-yellow-500/10 text-yellow-500",
  }
];

const features = [
  {
    title: "WhatsApp Integration",
    description: "Seamless connection with Official WhatsApp Cloud API.",
    icon: <MessageCircle className="w-8 h-8 text-emerald-500" />
  },
  {
    title: "AI Agent",
    description: "Powered by LangChain + OpenAI for intelligent interactions.",
    icon: <Search className="w-8 h-8 text-indigo-500" />
  },
  {
    title: "Knowledge Base (RAG)",
    description: "Retrieval-Augmented Generation for accurate property data.",
    icon: <Database className="w-8 h-8 text-purple-500" />
  },
  {
    title: "CRM Dashboard",
    description: "Advanced analytics and lead management interface.",
    icon: <BarChart3 className="w-8 h-8 text-blue-500" />
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Navbar handled by ConditionalHeader, but we can add a local one if needed or just styling */}
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100 dark:border-indigo-500/20">
            <Users className="w-3 h-3" />
            Designed for Real Estate
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            How LeadFlow AI Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            From WhatsApp message to closed deal — fully automated with AI. 
            Empowering real estate agencies with intelligent lead qualification.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-black/5 dark:shadow-white/5 flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
              View Demo
            </Link>
          </div>
        </div>
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-0 opacity-20 dark:opacity-40">
           <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-[120px]" />
           <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
        </div>
      </section>

      {/* Vertical Timeline Workflow */}
      <section className="py-20 px-6 bg-white dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">The Complete Workflow</h2>
            <p className="text-gray-500 dark:text-gray-400">Step-by-step automation from lead to inventory.</p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="group relative flex gap-8">
                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-[27px] top-14 bottom-[-48px] w-0.5 bg-gradient-to-b from-gray-200 to-transparent dark:from-white/10 dark:to-transparent" />
                )}
                
                {/* Icon Container */}
                <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-white/5 transition-transform group-hover:scale-110 duration-300 ${step.color}`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step {index + 1}</span>
                      <div className="h-px flex-1 bg-gray-200 dark:bg-white/5" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-500 transition-colors">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Flow Diagram Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="bg-black dark:bg-[#111] rounded-[3rem] p-12 text-center relative overflow-hidden">
            <h3 className="text-2xl font-bold text-white mb-12">System Data Flow</h3>
            
            <div className="flex flex-wrap justify-center items-center gap-6 relative z-10">
              <div className="flex flex-col items-center gap-3 px-6 py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Globe className="w-6 h-6 text-emerald-500" />
                <span className="text-xs font-bold text-white">WhatsApp</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 hidden md:block" />
              <div className="flex flex-col items-center gap-3 px-6 py-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Layout className="w-6 h-6 text-blue-500" />
                <span className="text-xs font-bold text-white">Conversations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 hidden md:block" />
              <div className="flex flex-col items-center gap-3 px-6 py-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                <UserCheck className="w-6 h-6 text-purple-500" />
                <span className="text-xs font-bold text-white">Agent</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 hidden md:block" />
              <div className="flex flex-col items-center gap-3 px-6 py-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <BookOpen className="w-6 h-6 text-indigo-500" />
                <span className="text-xs font-bold text-white">RAG + Knowledge</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 hidden md:block" />
              <div className="flex flex-col items-center gap-3 px-6 py-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <span className="text-xs font-bold text-white">Lead/Inventory</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 hidden md:block" />
              <div className="flex flex-col items-center gap-3 px-6 py-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <BarChart3 className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-bold text-white">Dashboard</span>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-10">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Technology</h2>
            <p className="text-gray-500 dark:text-gray-400">Built with modern tools for maximum performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all duration-300">
                <div className="mb-6 bg-gray-50 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold mb-3">{feature.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 dark:border-white/5 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="font-bold text-xl mb-4">LeadFlow AI</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-8">
            From WhatsApp message to closed deal — fully automated with AI.
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
            <Link href="/dashboard/conversations" className="hover:text-black dark:hover:text-white transition-colors">Conversations</Link>
            <Link href="/dashboard/rag" className="hover:text-black dark:hover:text-white transition-colors">Knowledge Base</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50 dark:border-white/5 text-xs text-gray-400">
            © {new Date().getFullYear()} LeadFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
