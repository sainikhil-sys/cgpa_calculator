"use client";

import { useEffect, useState } from "react";
import { Semester } from "../types";
import { calculateSGPA } from "@/utils/cgpaCalculations";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, BarChart3, LineChart } from "lucide-react";

interface AnalyticsProps {
  semesters: Semester[];
}

export default function Analytics({ semesters }: AnalyticsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-panel rounded-2xl p-6 h-[320px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500">Synchronizing chart engines...</span>
        </div>
      </div>
    );
  }

  // Map data for charts
  const data = semesters.map((sem) => {
    const totalCredits = sem.subjects.reduce((sum, s) => sum + s.credits, 0);
    const sgpa = calculateSGPA(sem.subjects);
    return {
      name: sem.name,
      SGPA: parseFloat(sgpa.toFixed(2)),
      Credits: totalCredits
    };
  });

  const hasData = semesters.some(sem => sem.subjects.length > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      
      {/* SGPA Trend Area Chart */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-center gap-3 border-b border-slate-200/5 dark:border-white/5 pb-4 mb-5 justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">SGPA Progress Trend</h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Semester by Semester Curve</p>
            </div>
          </div>
        </div>

        {hasData ? (
          <div className="h-64 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} dy={10} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={9} dx={-5} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(15, 23, 42, 0.9)", 
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#f8fafc"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="SGPA" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#sgpaGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
            <LineChart className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-xs">No academic scores found to trace trend curves.</p>
          </div>
        )}
      </div>

      {/* Credits Earned Bar Chart */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-center gap-3 border-b border-slate-200/5 dark:border-white/5 pb-4 mb-5 justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Credits Distribution</h3>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Completed Hours Volume</p>
            </div>
          </div>
        </div>

        {hasData ? (
          <div className="h-64 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} dy={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} dx={-5} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(15, 23, 42, 0.9)", 
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#f8fafc"
                  }} 
                />
                <Bar dataKey="Credits" radius={[6, 6, 0, 0]}>
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? "#2563eb" : "#7c3aed"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
            <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-xs">No credits tracked across semester course logs.</p>
          </div>
        )}
      </div>

    </div>
  );
}
