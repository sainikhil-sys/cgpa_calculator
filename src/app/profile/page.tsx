"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  User, 
  Mail, 
  School, 
  Hash, 
  BookOpen, 
  Calendar, 
  ArrowLeft, 
  Save, 
  CheckCircle,
  AlertTriangle,
  Camera,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { user, profile, loading: authLoading, updateProfileDetails, logOut } = useAuth();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Layout protection: Redirect to login if user session is empty
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Sync profile details to form states when loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setCollege(profile.college || "");
      setRollNumber(profile.rollNumber || "");
      setBranch(profile.branch || "");
      setAcademicYear(profile.academicYear || "");
      
      // Extract seed from dicebear url if present
      if (profile.photoURL?.includes("seed=")) {
        const parts = profile.photoURL.split("seed=");
        setAvatarSeed(parts[1] || "");
      } else {
        setAvatarSeed(profile.uid);
      }
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const nameTrimmed = name.trim();
    const collegeTrimmed = college.trim();
    const rollTrimmed = rollNumber.trim();
    const branchTrimmed = branch.trim();
    const yearTrimmed = academicYear.trim();

    if (!nameTrimmed || !collegeTrimmed || !rollTrimmed || !branchTrimmed || !yearTrimmed) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      
      // Generate new photoURL if user modified seed
      const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed.trim() || profile?.uid}`;

      await updateProfileDetails({
        name: nameTrimmed,
        college: collegeTrimmed,
        rollNumber: rollTrimmed,
        branch: branchTrimmed,
        academicYear: yearTrimmed,
        photoURL
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleRandomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(2, 9));
  };

  // Render loading state while validating session
  if (authLoading || (!user && authLoading)) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  // Double check if protected routing is resolved
  if (!user) return null;

  const currentPhotoURL = avatarSeed 
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`
    : profile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.uid}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="glass-panel border-b border-white/5 h-20 px-6 sm:px-12 flex items-center justify-between z-10">
        <Link href="/dashboard" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-650 to-indigo-650 text-white shadow-lg shadow-blue-550/10 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-black text-sm tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            GradeFlow AI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-white/5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Workspace</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Profile Editor Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 z-10">
        
        {/* Navigation and Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-bold group mb-2"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Academic Profile Settings</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Manage your college demographics and workspace theme.</p>
          </div>

          <button
            onClick={handleLogout}
            className="self-start sm:self-center flex items-center gap-2 px-4.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-black cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
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
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
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

        {/* Main Grid Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 bg-slate-950/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />

          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Avatar Update Card */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-white/5 overflow-hidden flex items-center justify-center p-3 shadow-lg group-hover:border-blue-500/30 transition-colors">
                  <img 
                    src={currentPhotoURL} 
                    alt="User Avatar" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-550/15 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  title="Randomize Avatar Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-center sm:text-left space-y-1.5">
                <h3 className="text-sm font-bold text-slate-205">Workspace Avatar</h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm leading-normal">
                  Customize your academic avatar. Press the camera button or edit the seed phrase to generate a new Bottts design dynamically.
                </p>
                <div className="flex items-center gap-2 max-w-xs mt-2">
                  <input
                    type="text"
                    value={avatarSeed}
                    onChange={(e) => setAvatarSeed(e.target.value)}
                    placeholder="Avatar seed"
                    className="px-3 py-1.5 text-[11px] rounded-lg glass-input text-slate-200 font-semibold focus:outline-none placeholder-slate-600 transition-all border border-white/5 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Profile Demographics Form */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demographics Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-semibold focus:outline-none transition-all border border-white/5 focus:border-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* College Email (ReadOnly) */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Registered Email (Disabled)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="email"
                      value={profile?.email || ""}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950/60 text-slate-500 font-semibold focus:outline-none border border-white/5 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* College Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">College / University</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-semibold focus:outline-none transition-all border border-white/5 focus:border-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Roll Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-semibold focus:outline-none transition-all border border-white/5 focus:border-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Branch */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Branch / Major</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-semibold focus:outline-none transition-all border border-white/5 focus:border-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Academic Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 font-semibold focus:outline-none transition-all border border-white/5 focus:border-blue-500/50"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/10 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Demographics</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
