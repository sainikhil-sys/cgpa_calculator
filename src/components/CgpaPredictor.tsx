"use client";

import { useState, useEffect } from "react";
import { predictFutureGpa } from "@/utils/cgpaCalculations";
import { CgpaPredictorInput } from "../types";
import { Sparkles, Compass, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface CgpaPredictorProps {
  currentCgpa: number;
  currentCredits: number;
}

export default function CgpaPredictor({ currentCgpa, currentCredits }: CgpaPredictorProps) {
  const [targetCgpa, setTargetCgpa] = useState("8.5");
  const [futureCredits, setFutureCredits] = useState("20");

  const [inputState, setInputState] = useState<CgpaPredictorInput>({
    currentCgpa,
    currentCredits,
    targetCgpa: 8.5,
    futureCredits: 20
  });

  // Auto-fill current stats when semesters calculate
  useEffect(() => {
    setInputState(prev => ({
      ...prev,
      currentCgpa,
      currentCredits
    }));
  }, [currentCgpa, currentCredits]);

  const handlePredict = () => {
    const target = parseFloat(targetCgpa);
    const future = parseFloat(futureCredits);
    
    if (isNaN(target) || target <= 0 || target > 10) return;
    if (isNaN(future) || future <= 0) return;

    setInputState(prev => ({
      ...prev,
      targetCgpa: target,
      futureCredits: future
    }));
  };

  // Run advisor calculation
  const prediction = predictFutureGpa(inputState);

  // Status mapping
  const statusConfig = {
    easy: {
      color: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
      progressBg: "bg-emerald-500",
      icon: CheckCircle,
      label: "Highly Probable"
    },
    moderate: {
      color: "text-blue-500 bg-blue-500/15 border-blue-500/30",
      progressBg: "bg-blue-500",
      icon: Compass,
      label: "Moderate Effort"
    },
    critical: {
      color: "text-amber-500 bg-amber-500/15 border-amber-500/30",
      progressBg: "bg-amber-500",
      icon: AlertTriangle,
      label: "Critical Target"
    },
    impossible: {
      color: "text-rose-500 bg-rose-500/15 border-rose-500/30",
      progressBg: "bg-rose-500",
      icon: ShieldAlert,
      label: "Mathematically Blocked"
    }
  };

  const currentConf = statusConfig[prediction.status];
  const StatusIcon = currentConf.icon;

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-purple-500" />
      
      <div className="flex items-center gap-3 border-b border-slate-200/5 dark:border-white/5 pb-4 mb-5">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-650 dark:text-purple-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            CGPA Goal Predictor
          </h3>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            Academic Performance Advisor
          </p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Target CGPA Goal</label>
          <input
            type="number"
            min="1"
            max="10"
            step="0.05"
            value={targetCgpa}
            onChange={(e) => {
              setTargetCgpa(e.target.value);
              setInputState(prev => ({ ...prev, targetCgpa: parseFloat(e.target.value) || 0 }));
            }}
            className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-850 dark:text-slate-100 font-semibold focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Upcoming Credits</label>
          <input
            type="number"
            min="1"
            step="1"
            value={futureCredits}
            onChange={(e) => {
              setFutureCredits(e.target.value);
              setInputState(prev => ({ ...prev, futureCredits: parseFloat(e.target.value) || 0 }));
            }}
            className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-850 dark:text-slate-100 font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* Results Display */}
      <div className="space-y-4 p-4.5 bg-slate-950/40 rounded-xl border border-white/5">
        
        {/* Required Future GPA */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">Required Future GPA</span>
            <span className="text-xs text-slate-500 mt-1 block">To reach target CGPA ({inputState.targetCgpa.toFixed(2)})</span>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-black ${
              prediction.status === 'impossible' ? 'text-rose-500' : 'text-purple-500 dark:text-purple-400'
            }`}>
              {prediction.status === 'impossible' ? "N/A" : prediction.requiredGpa.toFixed(2)}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Out of 10.0</span>
          </div>
        </div>

        {/* Probability bar */}
        {prediction.status !== 'impossible' && (
          <div className="space-y-1.5 border-t border-white/5 pt-3">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Goal Probability</span>
              <span className="text-slate-300">{prediction.successProbability}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full ${currentConf.progressBg} transition-all duration-500`}
                style={{ width: `${prediction.successProbability}%` }}
              />
            </div>
          </div>
        )}

        {/* Status indicator tag */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <div className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border ${currentConf.color} flex items-center gap-1.5`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentConf.label}</span>
          </div>
        </div>

        {/* Recommendation text */}
        <p className="text-[11px] font-medium leading-relaxed text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-800/20 italic">
          &ldquo;{prediction.recommendation}&rdquo;
        </p>

      </div>
    </div>
  );
}
