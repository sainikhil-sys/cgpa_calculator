"use client";

import { ExternalLink, Mail, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/10 dark:border-white/5 bg-slate-950/20 py-8 mt-12 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Brand info */}
        <div className="text-center md:text-left">
          <p className="text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            GradeFlow AI
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Smart academic performance analysis & calculations. &copy; {new Date().getFullYear()}
          </p>
        </div>

        {/* Middle: Mandatory Digital Heroes Requirements */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200/10">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span>Sai Nikhil</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200/10">
            <Mail className="w-3.5 h-3.5 text-purple-500" />
            <a href="mailto:sainikhil6300725603@gmail.com" className="hover:text-blue-500 transition-colors">
              sainikhil6300725603@gmail.com
            </a>
          </div>
        </div>

        {/* Right Side: Exact required button */}
        <div>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Built for Digital Heroes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
