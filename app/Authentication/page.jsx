"use client";
import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import supabase from "../component/supabase";
import { useSnackbar } from "notistack";
import { useRouter, useSearchParams } from "next/navigation";

function SearchParamsHandler({ setRedirectTo }) {
 const searchParams = useSearchParams();
 const redirectTo = searchParams.get("redirectTo") || "/";
 useEffect(() => setRedirectTo(redirectTo), [redirectTo, setRedirectTo]);
 return null;
}

function Page() {
 // states
 const [isSignUp, setIsSignUp] = useState(false);
 const [redirectTo, setRedirectTo] = useState("/");
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [formData, setFormData] = useState({
 email: "",
 password: "",
 });
 const { enqueueSnackbar } = useSnackbar();

 // Functions
 const useErrorNotification = (message) => {
 enqueueSnackbar(message, {
 variant: "error",
 autoHideDuration: 2000,
 anchorOrigin: { horizontal: "left", vertical: "top" },
 });
 };

 const useWarnNotification = (message) => {
 enqueueSnackbar(message, {
 variant: "warning",
 autoHideDuration: 2000,
 anchorOrigin: { horizontal: "left", vertical: "top" },
 });
 };

 const useSuccessNotification = (message) => {
 enqueueSnackbar(message, {
 variant: "success",
 autoHideDuration: 2000,
 anchorOrigin: { horizontal: "left", vertical: "top" },
 });
 };

 const handleInputChange = (e) => {
 const { name, value } = e.target;
 setFormData((prev) => ({
 ...prev,
 [name]: value,
 }));
 };

 // Sign In with email and password
 const handleAuth = async (e) => {
 setLoading(true);
 try {
 let authError = null;
 if (isSignUp) {
 const { error } = await supabase.auth.signUp({
 email: formData.email,
 password: formData.password,
 });
 authError = error;
 } else {
 const { error } = await supabase.auth.signInWithPassword({
 email: formData.email,
 password: formData.password,
 });
 authError = error;
 }
 if (authError) throw authError;
 } catch (error) {
 useErrorNotification("An error occurred", error.message);
 } finally {
 setLoading(false);
 }
 };

 // forget password functionality
 const handleForgetPassword = async () => {
 console.log("Forget password clicked");
 setLoading(true);
 const emailValue = formData.email;
 if (!emailValue) {
 useWarnNotification("Please enter your email to reset password.");
 setLoading(false);
 return;
 }
 try {
 const { error } = await supabase.auth.resetPasswordForEmail(emailValue, {
 redirectTo: `${window.location.origin}/UpdatePassword`,
 });
 useSuccessNotification("Check your email for password reset link.");
 if (error) throw error;
 } catch (error) {
 useErrorNotification("An error occured: ", error.message);
 } finally {
 setLoading(false);
 }
 };

 // sign in using provider
 const handleOAuth = async (provider) => {
 try {
 console.log("provider", provider);
 if (provider == "google") {
 const { error } = await supabase.auth.signInWithOAuth({
 provider,
 options: {
 scopes:
 "email profile",
 redirectTo: `${window.location.origin}${redirectTo}`,
 queryParams: { access_type: "offline", prompt: "consent" },
 },
 });
 if (error) throw error;
 } else {
 const { error } = await supabase.auth.signInWithOAuth({
 provider,
 options: {
 redirectTo: `${window.location.origin}`,
 },
 });
 if (error) throw error;
 }
 } catch (error) {
 useErrorNotification(
 error.message || "An error occurred during OAuth login"
 );
 }
 };

 const backHandler = () => {
 console.log("Close modal");
 router.push("/");
 };

 const togglePasswordVisibility = () => {
 setShowPassword(!showPassword);
 };

 return (
 <div className="fixed inset-0 flex items-center justify-center z-30 px-4">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={backHandler} />

 <Suspense fallback={null}>
 <SearchParamsHandler setRedirectTo={setRedirectTo} />
 </Suspense>

 {/* Modal Card */}
 <div className="relative w-full max-w-md mx-auto z-10">

 {/* Glow accent */}
 <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-gray-300/30 via-transparent to-gray-700/20 pointer-events-none" />

 <div className="relative bg-white [#0a0a0a] rounded-2xl border border-gray-200 shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">

 {/* Top bar accent */}
 <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-400 to-transparent" />

 <div className="p-7 sm:p-9">

 {/* Close button */}
 <button
 onClick={backHandler}
 className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 :text-gray-200 hover:bg-gray-100 :bg-gray-800 transition-all duration-200"
 >
 <ArrowLeft size={17} />
 </button>

 {/* Header */}
 <div className="mb-8">
 {/* Logo mark */}
 {/* <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-5">
 <svg className="w-5 h-5 text-white " fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 </div> */}
 <h2 className="text-2xl font-bold tracking-tight text-black ">
 {isSignUp ? "Create your account" : "Welcome back"}
 </h2>
 <p className="text-sm text-gray-500 mt-1.5">
 {isSignUp
 ? "Start closing more leads with AI today"
 : "Sign in to your AI lead management dashboard"}
 </p>
 </div>

 {/* Google OAuth - Prominent */}
 <button
 onClick={() => handleOAuth("google")}
 className="w-full h-11 border border-gray-200 hover:border-gray-400 :border-gray-500 text-gray-700 bg-white [#111] hover:bg-gray-50 :bg-[#161616] rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 group"
 >
 <svg className="w-4 h-4" viewBox="0 0 24 24">
 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
 </svg>
 Continue with Google
 </button>

 {/* Divider */}
 <div className="relative my-6">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-gray-100 " />
 </div>
 <div className="relative flex justify-center">
 <span className="px-4 bg-white [#0a0a0a] text-xs text-gray-400 tracking-wider uppercase">
 or with email
 </span>
 </div>
 </div>

 {/* Form Fields */}
 <div className="space-y-4">

 {/* Email */}
 <div className="group">
 <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
 Email
 </label>
 <input
 type="email"
 name="email"
 value={formData.email}
 onChange={handleInputChange}
 className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 [#111] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black :ring-white focus:border-transparent transition-all duration-200 text-sm"
 placeholder="you@company.com"
 required
 />
 </div>

 {/* Password */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Password
 </label>
 {!isSignUp && (
 <button
 onClick={handleForgetPassword}
 className="text-xs text-gray-400 hover:text-black :text-white transition-colors"
 >
 Forgot password?
 </button>
 )}
 </div>
 <div className="relative">
 <input
 type={showPassword ? "text" : "password"}
 name="password"
 value={formData.password}
 onChange={handleInputChange}
 className="w-full h-11 px-4 pr-11 rounded-xl border border-gray-200 bg-gray-50 [#111] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black :ring-white focus:border-transparent transition-all duration-200 text-sm"
 placeholder="Enter your password"
 required
 />
 <button
 type="button"
 onClick={togglePasswordVisibility}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 :text-gray-300 transition-colors p-1"
 >
 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
 </button>
 </div>
 </div>

 {/* Submit */}
 <button
 onClick={handleAuth}
 disabled={loading}
 className="w-full h-11 bg-black hover:bg-gray-800 :bg-gray-100 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] [0_4px_14px_0_rgba(255,255,255,0.1)] active:scale-[0.98] mt-2"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={18} />
 ) : (
 <>
 {isSignUp ? "Create Account" : "Sign In"}
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
 </svg>
 </>
 )}
 </button>
 </div>

 {/* Toggle sign in/up */}
 <p className="text-center text-sm text-gray-500 mt-6">
 {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
 <button
 onClick={() => setIsSignUp(!isSignUp)}
 className="text-black font-semibold hover:underline underline-offset-2 transition-all"
 >
 {isSignUp ? "Sign in" : "Sign up"}
 </button>
 </p>

 </div>

 {/* Bottom bar accent */}
 <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
 </div>
 </div>
 </div>
 );
// return (
// <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-30 pt-4 sm:pt-20 px-4">
// <Suspense fallback={null}>
// <SearchParamsHandler setRedirectTo={setRedirectTo} />
// </Suspense>
// <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto">
// {/* Close button */}
// <button
// onClick={backHandler}
// className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-700 :text-gray-200 p-1 rounded-full hover:bg-gray-100 :bg-gray-700 transition-colors"
// >
// <ArrowLeft size={20} />
// </button>

// {/* Title */}
// <div className="text-center mb-6 sm:mb-8 mt-8 sm:mt-0">
// <h2 className="text-xl sm:text-2xl font-bold text-gray-900 ">
// {isSignUp ? "Create Your Account" : "Sign in to your account"}
// </h2>
// </div>

// {/* Form */}
// <div className="space-y-4 sm:space-y-6">
// {/* Email Field */}
// <div>
// <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
// Email
// </label>
// <input
// type="email"
// name="email"
// value={formData.email}
// onChange={handleInputChange}
// className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 :ring-blue-400 focus:border-transparent transition-colors text-sm sm:text-base"
// placeholder="Enter your email"
// required
// />
// </div>

// {/* Password Field */}
// <div>
// <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
// Password
// </label>
// <div className="relative">
// <input
// type={showPassword ? "text" : "password"}
// name="password"
// value={formData.password}
// onChange={handleInputChange}
// className="w-full h-10 sm:h-12 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 :ring-blue-400 focus:border-transparent transition-colors text-sm sm:text-base"
// placeholder="Enter your password"
// required
// />
// <button
// type="button"
// onClick={togglePasswordVisibility}
// className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 :text-gray-200 transition-colors"
// >
// {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// </button>
// </div>
// </div>

// {/* Submit button */}
// <button
// onClick={handleAuth}
// disabled={loading}
// className="w-full h-10 cursor-pointer sm:h-12 bg-blue-600 hover:bg-blue-700 :bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
// >
// {loading ? (
// <Loader2 className="animate-spin" size={20} />
// ) : isSignUp ? (
// "Sign up"
// ) : (
// "Sign in"
// )}
// </button>
// </div>

// {/* Forget Password */}
// <div className="text-center my-4 sm:my-6">
// <button
// onClick={handleForgetPassword}
// className="text-blue-600 cursor-pointer hover:text-blue-700 :text-blue-300 text-sm sm:text-base transition-colors"
// >
// Forget Password?
// </button>
// </div>

// {/* Divider */}
// <div className="relative my-4 sm:my-6">
// <div className="absolute inset-0 flex items-center">
// <div className="w-full border-t border-gray-300 " />
// </div>
// <div className="relative flex justify-center text-xs sm:text-sm">
// <span className="px-4 bg-white text-gray-500 ">
// or continue with
// </span>
// </div>
// </div>

// {/* Google OAuth Button */}
// <button
// onClick={() => handleOAuth("google")}
// className="w-full h-10 sm:h-12 border cursor-pointer border-gray-300 hover:border-gray-400 :border-gray-500 text-gray-700 bg-white hover:bg-gray-50 :bg-gray-600 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-3"
// >
// <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
// <path
// fill="#4285F4"
// d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
// />
// <path
// fill="#34A853"
// d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
// />
// <path
// fill="#FBBC05"
// d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
// />
// <path
// fill="#EA4335"
// d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
// />
// </svg>
// Continue with Google
// </button>

// {/* Toggle Sign in/Sign up */}
// <div className="text-center mt-4 sm:mt-6">
// <button
// onClick={() => setIsSignUp(!isSignUp)}
// className="text-blue-600 hover:text-blue-700 cursor-pointer :text-blue-300 text-sm sm:text-base transition-colors"
// >
// {isSignUp
// ? "Already have an account? Sign in"
// : "Don't have an account? Sign up"}
// </button>
// </div>
// </div>
// </div>
// );
}

export default function PageWrapper() {
 return (
 <Suspense fallback={<div>Loading...</div>}>
 <Page />
 </Suspense>
 );
}