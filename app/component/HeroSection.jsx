import React from 'react';
import CTAButton from './CTAButton';

const HeroSection = () => {
 return (
 <section className="relative overflow-hidden bg-white pt-16 sm:pt-24 lg:pt-32 pb-16">
 {/* Background decoration elements */}
 <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-30 pointer-events-none">
 <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-gray-200 to-gray-50 blur-3xl "></div>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

 {/* Left Content */}
 <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-tight">
 Close More Leads <span className="block mt-1">Automatically with <span className="text-gray-500 ">AI</span></span>
 </h1>
 <p className="mt-6 text-lg tracking-tight sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
 AI powered WhatsApp lead management system that automatically talks to customers, captures leads, and helps your team close deals faster.
 </p>
 <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
 <CTAButton variant="primary" className="shadow-[0_0_20px_rgba(0,0,0,0.1)] [0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
 Start Free Trial
 </CTAButton>
 <CTAButton variant="secondary" className="active:scale-95 shadow-sm">
 See How It Works
 </CTAButton>
 </div>

 <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 ">
 <div className="flex items-center">
 <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
 </svg>
 No credit card required
 </div>
 <div className="flex items-center">
 <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
 </svg>
 Setup in 5 minutes
 </div>
 </div>
 </div>

 {/* Right UI Visual */}
 <div className="relative mx-auto w-full max-w-lg lg:max-w-none pt-10 lg:pt-0">
 <div className="relative rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm p-3 shadow-2xl ">
 {/* Fake window controls */}
 <div className="flex items-center space-x-2 mb-3 px-2">
 <div className="w-3 h-3 rounded-full bg-gray-300 "></div>
 <div className="w-3 h-3 rounded-full bg-gray-300 "></div>
 <div className="w-3 h-3 rounded-full bg-gray-300 "></div>
 </div>

 <div className="bg-gray-50 [#0a0a0a] rounded-xl p-4 sm:p-6 min-h-[420px] flex flex-col justify-end space-y-4 relative overflow-hidden ring-1 ring-gray-100 ">

 {/* Floating Notification - Hot Lead */}
 <div className="absolute top-6 right-6 z-20 animate-[bounce_5s_infinite]">
 <div className="bg-white rounded-xl p-3 shadow-xl border border-gray-100 flex items-start space-x-3 w-48 transition-transform hover:scale-105 duration-300">
 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 text-sm mt-0.5">
 🔥
 </div>
 <div>
 <p className="text-xs font-semibold text-black ">Hot Lead</p>
 <div className="mt-1.5 space-y-1">
 <p className="text-[10px] text-gray-500 ">Budget: <span className="font-medium text-black ">2 Crore</span></p>
 <p className="text-[10px] text-gray-500 ">Area: <span className="font-medium text-black ">DHA Phase 5</span></p>
 </div>
 </div>
 </div>
 </div>

 <div className="absolute top-24 left-4 right-4 h-[200px] border border-gray-200 rounded-xl bg-white/60 flex p-4 hidden sm:flex pointer-events-none opacity-40">
 <div className="w-1/3 border-r border-gray-100 pr-4 space-y-3">
 <div className="h-3 w-3/4 bg-gray-200 rounded-md"></div>
 <div className="h-2 w-1/2 bg-gray-100 rounded-md"></div>
 <div className="h-2 w-full bg-gray-100 rounded-md mt-6"></div>
 <div className="h-2 w-5/6 bg-gray-100 rounded-md"></div>
 </div>
 <div className="w-2/3 pl-4 space-y-3">
 <div className="flex items-end h-24 space-x-3 pb-2 border-b border-gray-100 ">
 <div className="w-1/6 h-1/2 bg-gray-200 rounded-t-sm"></div>
 <div className="w-1/6 h-full bg-black rounded-t-sm"></div>
 <div className="w-1/6 h-3/4 bg-gray-200 rounded-t-sm"></div>
 <div className="w-1/6 h-1/4 bg-gray-200 rounded-t-sm"></div>
 <div className="w-1/6 h-5/6 bg-gray-200 rounded-t-sm"></div>
 </div>
 </div>
 </div>

 {/* WhatsApp Chat Bubbles */}
 <div className="space-y-4 z-10 w-full font-medium">
 {/* Customer Message */}
 <div className="flex justify-start">
 <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100 shadow-sm max-w-[85%] inline-block transform origin-bottom-left transition-all hover:-translate-y-1">
 <p className="text-[13px] text-gray-800 ">5 marla house price in DHA?</p>
 <p className="text-[10px] text-left text-gray-400 mt-1.5 font-normal">Customer • 10:41 AM</p>
 </div>
 </div>

 {/* AI Message */}
 <div className="flex justify-end">
 <div className="bg-black text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] [0_4px_14px_0_rgba(255,255,255,0.1)] max-w-[85%] inline-block transform origin-bottom-right transition-all hover:-translate-y-1">
 <p className="text-[13px]">Sure! May I know your budget?</p>
 <p className="text-[10px] text-right text-gray-300 mt-1.5 font-normal">AI Agent • 10:42 AM</p>
 </div>
 </div>

 {/* Customer Reply */}
 <div className="flex justify-start">
 <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100 shadow-sm max-w-[85%] inline-block transform origin-bottom-left transition-all hover:-translate-y-1">
 <p className="text-[13px] text-gray-800 ">Around 2 Crore. Looking for investment.</p>
 <p className="text-[10px] text-left text-gray-400 mt-1.5 font-normal">Customer • 10:44 AM</p>
 </div>
 </div>

 {/* AI Action/Message */}
 <div className="flex justify-end">
 <div className="bg-black text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] [0_4px_14px_0_rgba(255,255,255,0.1)] max-w-[85%] inline-block transform md:scale-105 duration-300 origin-bottom-right">
 <p className="text-[13px]">Perfect! I've noted your requirements. Our area specialist will call you shortly with the best options. 🏡</p>
 <p className="text-[10px] text-right text-gray-300 mt-1.5 font-normal">AI Agent • 10:44 AM ⚡ Auto-assigned</p>
 </div>
 </div>
 </div>

 </div>
 </div>

 {/* Geometric accents */}
 <div className="absolute -z-10 top-1/2 -right-6 w-12 h-12 bg-gray-200 rounded-xl rotate-12 blur-sm hidden lg:block"></div>
 <div className="absolute -z-10 -bottom-6 left-12 w-20 h-20 bg-gray-100 rounded-full blur-md hidden lg:block"></div>
 </div>
 </div>
 </div>
 </section>
 );
};

export default HeroSection;
