"use client";

import ThemeToggle from "./ThemeToggle";
import { GraduationCap, ExternalLink } from "lucide-react";

export default function Header() {
  return (
    <header className="glass-panel border-b border-slate-200/5 dark:border-white/5 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between py-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black bg-gradient-to-r from-slate-800 to-slate-650 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-none tracking-tight">
              GradeFlow AI
            </h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1.5 leading-none">
              Academic Dashboard
            </p>
          </div>
        </div>

        {/* Action Controls & Creator Info */}
        <div className="flex items-center gap-4">
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-slate-200/10 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            title="Built for Digital Heroes"
          >
            <span>Built for Digital Heroes</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
