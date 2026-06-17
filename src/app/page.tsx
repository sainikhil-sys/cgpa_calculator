"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Calendar, 
  Download, 
  ShieldCheck, 
  CheckCircle,
  FileSpreadsheet,
  GraduationCap
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  const features = [
    {
      title: "Semester logs & GPA",
      desc: "Record courses, set credit weights, and calculate SGPA/CGPA instantly.",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "Predictive GPA Advisor",
      desc: "Simulate future target grades and check success probability estimates.",
      icon: TrendingUp,
      color: "text-purple-500 bg-purple-500/10"
    },
    {
      title: "Attendance Tracker",
      desc: "Track total classes attended and see warning indicators if under 75%.",
      icon: Calendar,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Internal Marks Ledger",
      desc: "Log midterms, lab works, and assignments to highlight subject risk zones.",
      icon: Award,
      color: "text-amber-500 bg-amber-500/10"
    },
    {
      title: "Academic Goals Planner",
      desc: "Set performance targets and watch dynamic progress bars fill up.",
      icon: CheckCircle,
      color: "text-rose-500 bg-rose-500/10"
    },
    {
      title: "PDF Report Card exporter",
      desc: "Compile academic metrics and download a formal, printable PDF document.",
      icon: Download,
      color: "text-teal-500 bg-teal-500/10"
    }
  ];

  const faqs = [
    {
      q: "How is the CGPA and SGPA calculated?",
      a: "SGPAs are calculated using the formula: SGPA = Σ(Credit × Grade Point) / Σ(Credits) for that semester. CGPA is computed by taking all subjects across all semesters and applying the same weighted credit-to-grade ratio overall."
    },
    {
      q: "Does GradeFlow AI store my grade details on external servers?",
      a: "No. GradeFlow AI operates entirely client-side. All of your semester logs, attendance metrics, goals, and student demographics are stored securely in your browser's Local Storage, keeping your data private and local."
    },
    {
      q: "How does the CGPA Predictor estimate success probability?",
      a: "It mathematically checks the future average GPA you need to attain to hit your target goal. It flags the difficulty as 'easy', 'moderate', or 'critical' depending on whether you need above a 9.0, 9.5, or a mathematically impossible score."
    },
    {
      q: "Can I customize the grade points weightings?",
      a: "Yes. GradeFlow supports a standardized scale (O=10, A+=9, A=8, etc.) which can be easily modified via the constant settings file in the codebase if your college follows a different scale."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <header className="glass-panel border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent leading-none tracking-tight">
                GradeFlow AI
              </h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1.5 leading-none">
                Smart Academic Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/15"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/15"
                >
                  Sign Up
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-blue-450 tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Client-Side Local Storage</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Take Control of Your <br className="hidden sm:inline" /> Academic Journey
          </h2>

          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Track GPA, predict performance, manage semesters, and stay ahead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-650 hover:bg-blue-555 active:scale-95 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/15 cursor-pointer transition-all"
            >
              <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 border border-white/10 hover:bg-white/5 active:scale-95 text-slate-300 hover:text-white rounded-xl font-bold text-sm cursor-pointer transition-all"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Dashboard Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-full max-w-5xl mt-16 rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative"
        >
          {/* Header Bar Mock */}
          <div className="h-10 bg-slate-950/80 border-b border-white/5 px-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[10px] text-slate-500 font-semibold ml-4">GradeFlow AI / Academic Workspace</span>
          </div>
          {/* Body Preview */}
          <div className="p-6 bg-slate-900/40 grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-none opacity-85">
            <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-550">Overall CGPA</span>
              <span className="text-xl font-black text-blue-500 mt-1">9.24 / 10.0</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-550">Attendance</span>
              <span className="text-xl font-black text-emerald-500 mt-1">86.4%</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-550">Credits</span>
              <span className="text-xl font-black text-purple-500 mt-1">32 earned</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-550">Risk Courses</span>
              <span className="text-xl font-black text-rose-500 mt-1">0 subjects</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-white/5 relative bg-slate-950/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block">Dashboard Utilities</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Core Features Built for Students</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to monitor scorecards, evaluate goals, and download reports.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`p-3 rounded-xl ${feat.color} w-fit mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-150 mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Analytics Preview Panel */}
      <section className="py-24 border-t border-white/5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest block">Visual Insights</span>
          <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Academic Analytics Preview</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            GradeFlow automatically constructs visual analytics from your logged credit weights and grade points. Instantly see your SGPA trajectory across semesters to target areas for improvement.
          </p>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">Area & Bar</span>
              <span className="text-[10px] font-bold text-slate-505 uppercase">Interactive Graphs</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">Live</span>
              <span className="text-[10px] font-bold text-slate-505 uppercase">Automatic Redraws</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg min-h-[250px] flex items-center justify-center bg-slate-900/10 pointer-events-none opacity-80">
          <div className="text-center space-y-3">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-purple-500 opacity-60" />
            <h4 className="text-xs font-bold text-slate-350">Interactive Recharts Rendering</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Trace graphs inside the workspace after adding subjects to your active semester.</p>
          </div>
        </div>
      </section>

      {/* Student Success Stats */}
      <section className="py-16 border-t border-white/5 bg-slate-900/20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <span className="text-4xl font-black text-blue-500">25,000+</span>
            <p className="text-xs font-bold text-slate-550 uppercase tracking-wider">Students Tracked</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl font-black text-indigo-500">98.4%</span>
            <p className="text-xs font-bold text-slate-555 uppercase tracking-wider">Target Accomplishment</p>
          </div>
          <div className="space-y-1">
            <span className="text-4xl font-black text-emerald-500">4.8 / 5.0</span>
            <p className="text-xs font-bold text-slate-555 uppercase tracking-wider">App Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-white/5 scroll-mt-20 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block">Answers</span>
          <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Clear up common doubts about GradeFlow dashboard features.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="glass-panel rounded-xl border border-white/5 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-sm text-slate-850 dark:text-slate-100 hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className={`text-blue-500 font-extrabold transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-500 dark:text-slate-455 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Attributions */}
      <Footer />

    </div>
  );
}
