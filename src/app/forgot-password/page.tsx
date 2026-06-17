"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, ShieldAlert, CheckCircle, ArrowLeft, Send } from "lucide-react";
import { isValidCollegeEmail } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidCollegeEmail(emailTrimmed)) {
      setError("Please use a valid college email address ending with .edu, .edu.in, or .ac.in.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(emailTrimmed);
      setSuccess("A password reset link has been sent to your college email address.");
      setEmail("");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(err.message || "Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header */}
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b from-blue-600 to-indigo-600" />

            {/* Back to Login Link */}
            <div className="mb-6">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-bold group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Login</span>
              </Link>
            </div>

            {/* Header info */}
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-100 tracking-tight">Reset Password</h1>
              <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                Enter your registered college email and we'll send you instructions to reset your password.
              </p>
            </div>

            {/* Notifications */}
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
                    <span>Send Reset Instructions</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
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
