"use client";
import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Chrome, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

import { useSnackbar } from 'notistack';

import supabase from './supabase';

const AuthCard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { enqueueSnackbar } = useSnackbar();

  const useNotification = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 3000,
      anchorOrigin: { horizontal: 'left', vertical: 'bottom' },
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      useNotification("Please fill in all fields", "warning");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      }

      if (result.error) throw result.error;
      
      useNotification(
        isSignUp ? "Account created! Check your email." : "Successfully signed in.", 
        "success"
      );
    } catch (error) {
      useNotification(error.message || "An authentication error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = async () => {
    if (!formData.email) {
      useNotification("Please enter your email to reset password.", "warning");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/UpdatePassword`,
      });
      if (error) throw error;
      useNotification("Check your email for password reset link.", "success");
    } catch (error) {
      useNotification(error.message || "Error resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          scopes: "email profile",
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (error) {
      useNotification(error.message || "OAuth error occurred", "error");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl shadow-indigo-200/50 border border-slate-100 overflow-hidden">
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 text-sm">
            {isSignUp 
              ? "Join the community and start connecting in real-time." 
              : "Enter your credentials to access your secure session."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                required
                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              {!isSignUp && (
                <button 
                  type="button" 
                  onClick={handleForgetPassword}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all text-slate-900"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold h-14 rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <>
                {isSignUp ? "Create Free Account" : "Login to Dashboard"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={() => handleOAuth('google')}
          className="w-full bg-white border border-slate-200 text-slate-700 font-semibold h-12 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <Chrome className="w-5 h-5 text-indigo-600" />
          Google Account
        </button>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Your privacy is our priority. We never share your data.
          </p>
        </div>
      </div>
      
      <div className="bg-slate-50 py-4 px-8 text-center border-t border-slate-100">
        <p className="text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "New to NexTalk?"} 
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-indigo-600 hover:underline ml-1"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthCard;