"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  Shield, 
  AlertCircle, 
  ExternalLink, 
  Smartphone, 
  Settings, 
  Key, 
  Webhook, 
  PlusCircle,
  Play,
  ArrowRight,
  Info
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Create Meta Developer App",
    description: "Start by creating a dedicated application in the Meta Developers portal to access WhatsApp APIs.",
    instructions: [
      "Navigate to developers.facebook.com and log in.",
      "Click on 'My Apps' and then 'Create App'.",
      "Select 'Other' then 'Business' as the app type.",
      "Give your app a name (e.g., 'LeadFlow Integration') and choose your Business Account."
    ],
    highlight: "Make sure you have a verified Facebook Business Account for production use.",
    icon: <PlusCircle className="w-6 h-6" />
  },
  {
    id: 2,
    title: "Enable WhatsApp Product",
    description: "Add the WhatsApp product to your Meta app to enable messaging capabilities.",
    instructions: [
      "In your App Dashboard, scroll down to 'Add products to your app'.",
      "Locate 'WhatsApp' and click 'Set Up'.",
      "Select or create a Meta Business Account for the integration."
    ],
    highlight: "This step initializes the WhatsApp Cloud API for your specific application.",
    icon: <Settings className="w-6 h-6" />
  },
  {
    id: 3,
    title: "Access API Details",
    description: "Retrieve your Phone Number ID and WhatsApp Business Account ID from the API Setup page.",
    instructions: [
      "Go to WhatsApp > API Setup in the left sidebar.",
      "Note down the 'Phone Number ID' (used for sending messages).",
      "Note down the 'WhatsApp Business Account ID' (used for management)."
    ],
    fields: [
      { label: "Phone Number ID", value: "Example: 109283746509182" },
      { label: "Business Account ID", value: "Example: 509283746509182" }
    ],
    icon: <Smartphone className="w-6 h-6" />
  },
  {
    id: 4,
    title: "Generate Access Token",
    description: "Generate a system user access token with 'whatsapp_business_messaging' permissions.",
    instructions: [
      "Meta provides a temporary 24-hour token by default in API Setup.",
      "For production, go to Business Settings > System Users.",
      "Generate a 'Permanent Token' with 'whatsapp_business_messaging' and 'whatsapp_business_management' scopes."
    ],
    highlight: "Never share your permanent token. Use environment variables to store it securely.",
    icon: <Key className="w-6 h-6" />
  },
  {
    id: 5,
    title: "Configure Webhook",
    description: "Set up the callback URL so LeadFlow AI can receive messages in real-time.",
    instructions: [
      "Go to WhatsApp > Configuration in the Meta sidebar.",
      "Click 'Edit' next to Webhook.",
      "Enter your Callback URL: https://your-domain.com/api/webhook/whatsapp",
      "Enter your 'Verify Token' (a secret string of your choice)."
    ],
    highlight: "After saving, click 'Manage' and subscribe to 'messages' and 'message_deliveries' fields.",
    icon: <Webhook className="w-6 h-6" />
  },
  {
    id: 6,
    title: "Connect to LeadFlow AI",
    description: "Enter your Meta credentials into the LeadFlow dashboard to activate the AI agent.",
    instructions: [
      "Go to LeadFlow Dashboard > Settings > WhatsApp.",
      "Paste your Permanent Access Token.",
      "Enter your Phone Number ID.",
      "Enter the Verify Token you created in Step 5."
    ],
    icon: <Check className="w-6 h-6" />
  },
  {
    id: 7,
    title: "Send a Test Message",
    description: "Verify the integration by sending a message from a real WhatsApp account.",
    instructions: [
      "Send any message (e.g., 'Hi') to your registered WhatsApp number.",
      "Open the LeadFlow 'Conversations' tab.",
      "Check if the message appears and if the AI agent responds."
    ],
    icon: <Play className="w-6 h-6" />
  }
];

const faqs = [
  {
    q: "Token is not working or expired?",
    a: "Ensure you are using a System User Permanent Token, not the temporary 24-hour token provided on the API Setup page."
  },
  {
    q: "Webhook verification failed?",
    a: "Check that your server is running and the Verify Token in Meta matches exactly what you've set in LeadFlow."
  },
  {
    q: "Messages aren't appearing in dashboard?",
    a: "Make sure you have subscribed to the 'messages' field in the Meta Webhook configuration settings."
  }
];

export default function WhatsAppSetupPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-100 dark:border-emerald-500/20">
            <Smartphone className="w-3 h-3" />
            Official Meta Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Connect Your WhatsApp to LeadFlow AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Follow these simple steps to start receiving and managing leads directly from WhatsApp using the official Cloud API.
          </p>
          <div className="mt-10">
            <button 
              onClick={() => document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 mx-auto"
            >
              Start Setup <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Progress Indicator */}
      <section className="py-8 px-6 sticky top-16 z-30 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-y border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between min-w-[600px] px-4">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                className={`flex flex-col items-center gap-2 transition-all ${activeStep === step.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === step.id ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                  {step.id}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">Step {step.id}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Content */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          {steps.map((step) => (
            <div 
              key={step.id} 
              id={`step-${step.id}`}
              onMouseEnter={() => setActiveStep(step.id)}
              className="group scroll-mt-40"
            >
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-500/20">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    {step.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 block">Step 0{step.id}</span>
                    <h2 className="text-2xl font-bold">{step.title}</h2>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {step.description}
                </p>

                <div className="space-y-4 mb-8">
                  {step.instructions.map((inst, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{inst}</p>
                    </div>
                  ))}
                </div>

                {step.fields && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {step.fields.map((field, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{field.label}</p>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs text-emerald-600 dark:text-emerald-400 font-mono truncate">{field.value}</code>
                          <button 
                            onClick={() => copyToClipboard(field.value)}
                            className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {copied === field.value ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.highlight && (
                  <div className="flex gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-5 rounded-2xl">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
                      {step.highlight}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-[#050505] border-t border-gray-100 dark:border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Troubleshooting</h2>
            <p className="text-gray-500 dark:text-gray-400">Common issues and how to fix them quickly.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-[1.5rem] overflow-hidden transition-all duration-300 open:shadow-lg">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-bold text-sm">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-white/5 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-emerald-900 text-white rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Security First</h2>
                <p className="text-emerald-100/70 mb-8 leading-relaxed">
                  Your WhatsApp integration is protected by industrial-grade encryption. Ensure you follow these tips to keep your data safe.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <Check className="w-4 h-4 text-emerald-400" /> Never expose tokens in frontend code
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <Check className="w-4 h-4 text-emerald-400" /> Use environment variables for API keys
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium">
                    <Check className="w-4 h-4 text-emerald-400" /> Regenerate tokens if leaks are suspected
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse absolute inset-0" />
                  <div className="relative bg-emerald-800 border border-emerald-700 p-8 rounded-3xl shadow-inner">
                    <Key className="w-24 h-24 text-emerald-400/20 rotate-12" />
                    <AlertCircle className="w-8 h-8 text-emerald-400 absolute -top-2 -right-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 dark:border-white/5 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="font-bold text-xl mb-4">LeadFlow AI</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-8">
            The intelligent way to manage your WhatsApp leads.
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
            <Link href="/how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How It Works</Link>
            <Link href="/dashboard/settings" className="hover:text-black dark:hover:text-white transition-colors">Settings</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50 dark:border-white/5 text-xs text-gray-400">
            © {new Date().getFullYear()} LeadFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
