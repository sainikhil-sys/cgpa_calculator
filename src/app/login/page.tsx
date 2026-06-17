"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Eye, EyeOff, Mail, Lock, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { isValidCollegeEmail } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const { user, signInWithEmail, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Handle Google Auth blocked event (non-edu email)
  useEffect(() => {
    const handleBlockedEmail = () => {
      setError("Authentication blocked: Please use a valid college email address (.edu, .edu.in, or .ac.in).");
      setLoading(false);
    };
    window.addEventListener("auth-blocked-email", handleBlockedEmail);
    return () => window.removeEventListener("auth-blocked-email", handleBlockedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidCollegeEmail(emailTrimmed)) {
      setError("Please use a valid college email address (.edu, .edu.in, or .ac.in).");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(emailTrimmed, password);
      setSuccess("Welcome back! Redirecting to workspace...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "An error occurred during sign in.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      await signInWithGoogle();
      setSuccess("Successfully authenticated! Launching workspace...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Authentication failed. Ensure your Google account matches an educational email.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">
            Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

      {/* Navigation Top Header */}
      <header className="h-20 px-6 sm:px-12 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-650 to-indigo-650 text-white shadow-lg shadow-blue-550/10 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-black text-sm tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            GradeFlow AI
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Login Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b from-blue-600 to-indigo-600" />
            
            {/* Header info */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-100 tracking-tight">Welcome Back</h1>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Log in to GradeFlow AI with your educational account.
              </p>
            </div>

            {/* Notification Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs flex items-start gap-2.5"
                >
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-relaxed font-semibold">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <span className="leading-relaxed font-semibold">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* College Email */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu.in"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-semibold focus:outline-none placeholder-slate-600 transition-all border border-white/5 focus:border-blue-500/50"
                    required
                    disabled={loading}
                  />
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block font-medium">
                  Accepted suffixes: .edu, .edu.in, .ac.in
                </span>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-semibold focus:outline-none placeholder-slate-600 transition-all border border-white/5 focus:border-blue-500/50"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-350 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/10 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <span className="relative px-3 bg-[#0c1221] text-[10px] font-extrabold text-slate-500 uppercase">
                Or Continue With
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 bg-slate-900/50 hover:bg-slate-900 border border-white/5 hover:border-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {/* Google SVG Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47c0,-0.33 -0.03,-0.65 -0.09,-0.9z" fill="#4285F4" />
                  <path d="M12,20.7c2.35,0 4.31,-0.78 5.75,-2.13l-3.3,-2.57c-0.91,0.61 -2.08,0.97 -3.45,0.97c-2.65,0 -4.9,-1.8 -5.7,-4.21H1.9v2.65c1.47,2.93 4.51,4.99 8.1,4.99z" fill="#34A853" />
                  <path d="M6.3,12.76c-0.2,-0.61 -0.31,-1.27 -0.31,-1.95s0.11,-1.34 0.31,-1.95V6.21H1.9c-0.67,1.34 -1.05,2.85 -1.05,4.45s0.38,3.11 1.05,4.45z" fill="#FBBC05" />
                  <path d="M12,5.13c1.28,0 2.43,0.44 3.34,1.31l2.5,-2.5C16.31,2.56 14.35,1.8 12,1.8c-3.59,0 -6.63,2.06 -8.1,4.99l3.4,2.65c0.8,-2.41 3.05,-4.21 5.7,-4.21z" fill="#EA4335" />
                </g>
              </svg>
              <span>Sign In with College Google Account</span>
            </button>

            {/* Footer links */}
            <div className="mt-8 text-center text-xs">
              <span className="text-slate-500 font-medium">New to GradeFlow AI? </span>
              <Link 
                href="/signup" 
                className="font-bold text-blue-500 hover:text-blue-400 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Attributions */}
      <footer className="py-6 text-center text-[10px] text-slate-600 font-semibold border-t border-white/5">
        &copy; {new Date().getFullYear()} GradeFlow AI. Made by Sai Nikhil.
      </footer>
    </div>
  );
}
