"use client";

import { useState, useEffect } from "react";
import { Semester, StudentInfo, Subject, AcademicGoal } from "../types";
import { calculateOverallCGPA } from "@/utils/cgpaCalculations";
import { GRADE_VALUES } from "@/utils/gradeSystem";
import { exportToPDF } from "@/utils/pdfExport";
import SemesterCard from "./SemesterCard";
import CgpaPredictor from "./CgpaPredictor";
import Analytics from "./Analytics";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Calendar, 
  Download, 
  Plus, 
  RefreshCw, 
  User, 
  FileText, 
  Briefcase, 
  School,
  Target,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Trash2
} from "lucide-react";

interface DashboardProps {
  semesters: Semester[];
  setSemesters: (semesters: Semester[]) => void;
  studentInfo: StudentInfo;
  setStudentInfo: (info: StudentInfo) => void;
  goals: AcademicGoal[];
  setGoals: (goals: AcademicGoal[]) => void;
  onReset: () => void;
  onBackToHome: () => void;
}

export default function Dashboard({
  semesters,
  setSemesters,
  studentInfo,
  setStudentInfo,
  goals,
  setGoals,
  onReset,
  onBackToHome
}: DashboardProps) {
  const [activeSemId, setActiveSemId] = useState<string>(
    semesters.length > 0 ? semesters[0].id : ""
  );

  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Demographics form inputs
  const [inputName, setInputName] = useState(studentInfo.name);
  const [inputRoll, setInputRoll] = useState(studentInfo.rollNumber);
  const [inputBranch, setInputBranch] = useState(studentInfo.branch);
  const [inputCollege, setInputCollege] = useState(studentInfo.college);
  const [inputYear, setInputYear] = useState(studentInfo.academicYear);

  // Goal adding inputs
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalType, setNewGoalType] = useState<'cgpa' | 'attendance' | 'custom'>('cgpa');
  const [newGoalTarget, setNewGoalTarget] = useState("9.0");

  const overallCgpaInfo = calculateOverallCGPA(semesters);
  const totalCourses = semesters.reduce((acc, sem) => acc + sem.subjects.length, 0);

  // Overall Attendance calculation
  const subjectsWithAttendance = semesters.flatMap(s => s.subjects).filter(s => (s.totalClasses ?? 0) > 0);
  const totalClassesAll = subjectsWithAttendance.reduce((sum, s) => sum + (s.totalClasses ?? 0), 0);
  const attendedClassesAll = subjectsWithAttendance.reduce((sum, s) => sum + (s.attendedClasses ?? 0), 0);
  const overallAttendancePct = totalClassesAll > 0 ? (attendedClassesAll / totalClassesAll) * 100 : 0;

  // Overall Internals calculation
  const subjectsWithInternals = semesters.flatMap(s => s.subjects).filter(s => 
    (s.midMarks ?? 0) > 0 || (s.assignments ?? 0) > 0 || (s.labMarks ?? 0) > 0
  );
  const totalInternalsSum = subjectsWithInternals.reduce((sum, s) => 
    sum + (s.midMarks ?? 0) + (s.assignments ?? 0) + (s.labMarks ?? 0), 0
  );
  const averageInternals = subjectsWithInternals.length > 0 ? totalInternalsSum / subjectsWithInternals.length : 0;

  // Courses At Risk
  const riskCourses = semesters.flatMap(s => s.subjects).filter(s => {
    const total = s.totalClasses ?? 0;
    const attended = s.attendedClasses ?? 0;
    const attPct = total > 0 ? (attended / total) * 100 : 100;
    const totalInternals = (s.midMarks ?? 0) + (s.assignments ?? 0) + (s.labMarks ?? 0);
    const hasInternals = (s.midMarks ?? 0) > 0 || (s.assignments ?? 0) > 0 || (s.labMarks ?? 0) > 0;
    
    return (total > 0 && attPct < 75) || (hasInternals && totalInternals < 50);
  });

  // Highest & Lowest Grades
  const allSubjects = semesters.flatMap(s => s.subjects);
  let highestGrade = "-";
  let lowestGrade = "-";
  if (allSubjects.length > 0) {
    const sorted = [...allSubjects].sort((a, b) => {
      const aVal = GRADE_VALUES[a.grade] ?? -1;
      const bVal = GRADE_VALUES[b.grade] ?? -1;
      return bVal - aVal;
    });
    highestGrade = sorted[0]?.grade || "-";
    lowestGrade = sorted[sorted.length - 1]?.grade || "-";
  }

  // Auto-sync Goal Current Values based on live data
  useEffect(() => {
    const updatedGoals = goals.map(goal => {
      if (goal.type === 'cgpa') {
        const current = overallCgpaInfo.cgpa;
        return {
          ...goal,
          currentValue: current,
          completed: current >= goal.targetValue
        };
      }
      if (goal.type === 'attendance') {
        const current = overallAttendancePct;
        return {
          ...goal,
          currentValue: parseFloat(current.toFixed(1)),
          completed: current >= goal.targetValue
        };
      }
      return goal;
    });

    // Only update if something actually changed to prevent render loops
    if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
      setGoals(updatedGoals);
    }
  }, [overallCgpaInfo.cgpa, overallAttendancePct, goals, setGoals]);

  // --- Handlers ---
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentInfo({
      name: inputName.trim(),
      rollNumber: inputRoll.trim(),
      branch: inputBranch.trim(),
      college: inputCollege.trim(),
      academicYear: inputYear.trim()
    });
    setIsEditingInfo(false);
  };

  const handleAddSemester = () => {
    const nextNum = semesters.length + 1;
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      name: `Semester ${nextNum}`,
      subjects: []
    };
    setSemesters([...semesters, newSem]);
    setActiveSemId(newSem.id);
  };

  const handleUpdateSemester = (semId: string, updatedSem: Semester) => {
    setSemesters(semesters.map(s => s.id === semId ? updatedSem : s));
  };

  const handleDeleteSemester = (semId: string) => {
    const updated = semesters.filter(s => s.id !== semId);
    setSemesters(updated);
    if (activeSemId === semId && updated.length > 0) {
      setActiveSemId(updated[0].id);
    }
  };

  const handleDownloadPDF = () => {
    exportToPDF(studentInfo, semesters, overallCgpaInfo);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const targetVal = parseFloat(newGoalTarget);
    if (isNaN(targetVal) || targetVal <= 0) return;

    let unit = "";
    let current = 0;
    if (newGoalType === 'cgpa') {
      unit = "CGPA";
      current = overallCgpaInfo.cgpa;
    } else if (newGoalType === 'attendance') {
      unit = "%";
      current = overallAttendancePct;
    } else {
      unit = "tasks";
      current = 0;
    }

    const newGoal: AcademicGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      type: newGoalType,
      targetValue: targetVal,
      currentValue: parseFloat(current.toFixed(2)),
      unit,
      completed: current >= targetVal
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleToggleGoal = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id && g.type === 'custom') {
        const completed = !g.completed;
        return {
          ...g,
          completed,
          currentValue: completed ? g.targetValue : 0
        };
      }
      return g;
    }));
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header with Back to Landing navigation */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
        <button
          onClick={onBackToHome}
          className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>&larr; Back to Landing Page</span>
        </button>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">
          Active Session
        </span>
      </div>

      {/* 2. Student Demographics Panel */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        
        {isEditingInfo ? (
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Edit Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Roll Number</label>
                <input
                  type="text"
                  value={inputRoll}
                  onChange={e => setInputRoll(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-855 dark:text-slate-100 font-semibold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-555 uppercase block mb-1">Branch / Major</label>
                <input
                  type="text"
                  value={inputBranch}
                  onChange={e => setInputBranch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-855 dark:text-slate-100 font-semibold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-555 uppercase block mb-1">College / University</label>
                <input
                  type="text"
                  value={inputCollege}
                  onChange={e => setInputCollege(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-855 dark:text-slate-100 font-semibold focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-555 uppercase block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={inputYear}
                  onChange={e => setInputYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-855 dark:text-slate-100 font-semibold focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-md shadow-blue-500/10"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/15">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight leading-none">
                    {studentInfo.name || "Academic Workspace"}
                  </h2>
                  <span className="text-[10px] font-bold py-0.5 px-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 rounded-full uppercase">
                    {studentInfo.rollNumber || "Demo Mode"}
                  </span>
                </div>
                
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {studentInfo.branch}</span>
                  <span className="flex items-center gap-1.5"><School className="w-3.5 h-3.5 text-slate-400" /> {studentInfo.college}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {studentInfo.academicYear}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditingInfo(true)}
              className="md:ml-auto px-4 py-2 border border-slate-200/10 hover:border-slate-250/20 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800/10"
            >
              Update Demographics
            </button>
          </div>
        )}
      </div>

      {/* 3. Top KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* KPI: CGPA */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">CGPA</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1.5">
                {overallCgpaInfo.cgpa.toFixed(2)}
              </h4>
              <span className="text-[9px] text-slate-400 mt-1 block">Out of 10.0</span>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* KPI: Converted Percentage */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Percentage</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1.5">
                {overallCgpaInfo.percentage.toFixed(2)}%
              </h4>
              <span className="text-[9px] text-slate-400 mt-1 block">CGPA &times; 9.5</span>
            </div>
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* KPI: Total Credits */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Credits completed</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1.5">
                {overallCgpaInfo.totalCredits}
              </h4>
              <span className="text-[9px] text-slate-400 mt-1 block">Sum of weights</span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* KPI: Semesters Count */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-pink-500" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Semesters Logs</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1.5">
                {semesters.length}
              </h4>
              <span className="text-[9px] text-slate-400 mt-1 block">{totalCourses} Courses total</span>
            </div>
            <div className="p-2 bg-violet-500/10 text-violet-500 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Analytics Visual Charts (Recharts) */}
      <Analytics semesters={semesters} />

      {/* 5. Attendance & Internals Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attendance Summary Monitor */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Overall Attendance Monitor</h3>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
              overallAttendancePct >= 75 ? "bg-emerald-500/10 text-emerald-450" : "bg-rose-500/10 text-rose-455"
            }`}>
              {overallAttendancePct.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <span className="text-[9.5px] font-bold text-slate-550 uppercase block">Total Classes</span>
              <span className="text-xl font-extrabold text-slate-200 mt-1 block">{totalClassesAll} classes</span>
            </div>
            <div className="bg-slate-955/45 p-4 rounded-xl border border-white/5">
              <span className="text-[9.5px] font-bold text-slate-550 uppercase block">Attended Classes</span>
              <span className="text-xl font-extrabold text-slate-200 mt-1 block">{attendedClassesAll} classes</span>
            </div>
          </div>

          <div className="mt-4">
            {totalClassesAll > 0 ? (
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                overallAttendancePct >= 75 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {overallAttendancePct >= 75 ? (
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Attendance in good standing overall!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Attendance Warning: Overall attendance is below 75% threshold!</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4 border border-dashed border-white/5 rounded-lg">
                No attendance inputs. Open semester logs and edit course details to log attendance.
              </p>
            )}
          </div>
        </div>

        {/* Internals Marks Overview */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-purple-500" />
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Internals Performance</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Average: {averageInternals.toFixed(1)}/100</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <span className="text-[9.5px] font-bold text-slate-550 uppercase block">At Risk Subjects</span>
              <span className={`text-xl font-extrabold mt-1 block ${riskCourses.length > 0 ? "text-rose-500" : "text-emerald-555"}`}>
                {riskCourses.length} courses
              </span>
            </div>
            <div className="bg-slate-955/45 p-4 rounded-xl border border-white/5">
              <span className="text-[9.5px] font-bold text-slate-550 uppercase block">Total Course Tracked</span>
              <span className="text-xl font-extrabold text-slate-200 mt-1 block">{subjectsWithInternals.length} courses</span>
            </div>
          </div>

          <div className="mt-4">
            {riskCourses.length > 0 ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Critically Low Performance:</span>
                  <p className="mt-1 leading-normal">
                    The following courses need focus (attendance &lt; 75% or internals &lt; 50): <br />
                    <strong className="text-rose-400">{riskCourses.map(c => c.name).join(", ")}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Excellent! Zero subjects are at risk. Keep up the high score!</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 6. Workspace Logs & Goal Sidebars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Semesters logs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/5 dark:border-white/5 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <span>Semesters Logs</span>
              <span className="text-[10.5px] font-semibold py-0.5 px-2 bg-slate-800 rounded-full text-slate-400">
                {semesters.length} total
              </span>
            </h2>
            <button
              onClick={handleAddSemester}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Add Semester</span>
            </button>
          </div>

          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {semesters.map((sem) => (
                <motion.div
                  key={sem.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <SemesterCard
                    semester={sem}
                    isActive={activeSemId === sem.id}
                    onSelect={() => setActiveSemId(sem.id)}
                    onUpdateSemester={(updated) => handleUpdateSemester(sem.id, updated)}
                    onDeleteSemester={() => handleDeleteSemester(sem.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Exporter, Goals Tracker & resets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Export PDF Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-indigo-500" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-205">
                  Export Report Card
                </h3>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  Print Ready PDF Document
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed font-medium">
              Export a formalized, fully printable PDF report card featuring student profile data, individual course grades, SGPA breakdown, and CGPA stats.
            </p>

            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-955 rounded-xl font-bold text-sm shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            >
              <span>Download Report</span>
            </button>
          </div>

          {/* Goal Predictor Advisor */}
          <CgpaPredictor 
            currentCgpa={overallCgpaInfo.cgpa} 
            currentCredits={overallCgpaInfo.totalCredits} 
          />

          {/* Academic Goals Panel */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-rose-500" />
            
            <div className="flex items-center gap-3 border-b border-slate-200/5 dark:border-white/5 pb-4 mb-5">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Academic Goals
                </h3>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  Target Tracking Ledger
                </p>
              </div>
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No academic goals logged yet.</p>
            ) : (
              <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                {goals.map((g) => {
                  const progress = Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100);
                  
                  return (
                    <div key={g.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-2 relative group/goal">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                          {g.type === 'custom' ? (
                            <input
                              type="checkbox"
                              checked={g.completed}
                              onChange={() => handleToggleGoal(g.id)}
                              className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer w-4 h-4"
                            />
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${g.completed ? "bg-emerald-500" : "bg-blue-500"}`} />
                          )}
                          <span className={`text-xs font-bold text-slate-200 ${g.completed ? "line-through opacity-60" : ""}`}>
                            {g.title}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="text-slate-500 hover:text-rose-500 p-1 opacity-0 group-hover/goal:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Progress bar (except for custom simple goals) */}
                      {g.type !== 'custom' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400">
                            <span>Current: {g.currentValue} {g.unit}</span>
                            <span>Target: {g.targetValue} {g.unit}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${g.completed ? "bg-emerald-500" : "bg-blue-600"} transition-all duration-300`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} className="mt-5 p-3 bg-slate-950/30 rounded-xl border border-white/5 space-y-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Add Custom Goal</span>
              
              <div>
                <input
                  type="text"
                  placeholder="e.g. Pass Maths Exam, Reach 85% Attd"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newGoalType}
                  onChange={e => {
                    const type = e.target.value as 'cgpa' | 'attendance' | 'custom';
                    setNewGoalType(type);
                    setNewGoalTarget(type === 'cgpa' ? "9.0" : type === 'attendance' ? "85" : "1");
                  }}
                  className="px-2.5 py-1.5 text-[10px] rounded-lg glass-input text-slate-800 dark:text-slate-100 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="cgpa">CGPA Goal</option>
                  <option value="attendance">Attd Goal</option>
                  <option value="custom">Checklist</option>
                </select>
                
                <input
                  type="number"
                  step="0.05"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none text-center"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Create Target
              </button>
            </form>
          </div>

          {/* System Control Utilities */}
          <div className="glass-panel rounded-2xl p-5 border-dashed">
            <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block mb-3">System Utilities</span>
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-500/20 text-rose-500 hover:bg-rose-505/10 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset GradeFlow Database</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
