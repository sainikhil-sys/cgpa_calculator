"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Semester, StudentInfo, AcademicGoal } from "@/types";
import { calculateOverallCGPA, calculateSGPA } from "@/utils/cgpaCalculations";
import { GRADE_VALUES } from "@/utils/gradeSystem";
import { exportToPDF } from "@/utils/pdfExport";
import SemesterCard from "@/components/SemesterCard";
import SubjectRow from "@/components/SubjectRow";
import CgpaPredictor from "@/components/CgpaPredictor";
import Analytics from "@/components/Analytics";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
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
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  Percent,
  Sliders,
  LogOut,
  HelpCircle,
  Clock
} from "lucide-react";

// Default demo dataset
const DEFAULT_SEMESTERS: Semester[] = [
  {
    id: "sem-1",
    name: "Semester 1",
    subjects: [
      { 
        id: "subj-11", 
        name: "Introduction to Software Engineering", 
        credits: 4, 
        grade: "O",
        totalClasses: 24,
        attendedClasses: 22,
        midMarks: 27,
        assignments: 18,
        labMarks: 46
      },
      { 
        id: "subj-12", 
        name: "Calculus & Analytical Geometry", 
        credits: 3, 
        grade: "A+",
        totalClasses: 20,
        attendedClasses: 16,
        midMarks: 24,
        assignments: 17,
        labMarks: 0
      },
      { 
        id: "subj-13", 
        name: "Applied Physics Lab", 
        credits: 2, 
        grade: "A",
        totalClasses: 12,
        attendedClasses: 11,
        midMarks: 0,
        assignments: 18,
        labMarks: 42
      },
      { 
        id: "subj-14", 
        name: "Technical Communication Skills", 
        credits: 2, 
        grade: "A+",
        totalClasses: 15,
        attendedClasses: 12,
        midMarks: 25,
        assignments: 16,
        labMarks: 0
      }
    ]
  },
  {
    id: "sem-2",
    name: "Semester 2",
    subjects: [
      { 
        id: "subj-21", 
        name: "Data Structures & Algorithm Design", 
        credits: 4, 
        grade: "A+",
        totalClasses: 24,
        attendedClasses: 20,
        midMarks: 26,
        assignments: 18,
        labMarks: 44
      },
      { 
        id: "subj-22", 
        name: "Digital Logic Design & Systems", 
        credits: 3, 
        grade: "A",
        totalClasses: 20,
        attendedClasses: 15,
        midMarks: 23,
        assignments: 16,
        labMarks: 0
      },
      { 
        id: "subj-23", 
        name: "Environmental Sciences & Ecology", 
        credits: 2, 
        grade: "O",
        totalClasses: 12,
        attendedClasses: 12,
        midMarks: 28,
        assignments: 19,
        labMarks: 0
      },
      { 
        id: "subj-24", 
        name: "Discrete Mathematical Structures", 
        credits: 3, 
        grade: "B+",
        totalClasses: 20,
        attendedClasses: 14,
        midMarks: 21,
        assignments: 15,
        labMarks: 0
      }
    ]
  }
];

const DEFAULT_STUDENT_INFO: StudentInfo = {
  name: "Sai Nikhil",
  rollNumber: "20CSE1094",
  branch: "Computer Science & Engineering",
  college: "National Institute of Technology",
  academicYear: "2023 - 2027"
};

const DEFAULT_GOALS: AcademicGoal[] = [
  {
    id: "goal-1",
    title: "Maintain overall CGPA above 9.0",
    type: "cgpa",
    targetValue: 9.0,
    currentValue: 9.24,
    unit: "CGPA",
    completed: true
  },
  {
    id: "goal-2",
    title: "Keep attendance above 85%",
    type: "attendance",
    targetValue: 85.0,
    currentValue: 86.4,
    unit: "%",
    completed: true
  },
  {
    id: "goal-3",
    title: "Finish Software Engineering Lab Files",
    type: "custom",
    targetValue: 1,
    currentValue: 0,
    unit: "tasks",
    completed: false
  }
];

export default function DashboardPage() {
  const { user, profile, loading: authLoading, updateProfileDetails, logOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'semesters' | 'attendance' | 'predictor'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Protected route redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // States
  const [studentInfo, setStudentInfo, infoInitialized] = useLocalStorage<StudentInfo>(
    "gf_student_info",
    DEFAULT_STUDENT_INFO
  );
  const [semesters, setSemesters, semestersInitialized] = useLocalStorage<Semester[]>(
    "gf_semesters_data",
    DEFAULT_SEMESTERS
  );
  const [goals, setGoals, goalsInitialized] = useLocalStorage<AcademicGoal[]>(
    "gf_academic_goals",
    DEFAULT_GOALS
  );

  const [activeSemId, setActiveSemId] = useState<string>("");

  // Demographics form inputs
  const [inputName, setInputName] = useState("");
  const [inputRoll, setInputRoll] = useState("");
  const [inputBranch, setInputBranch] = useState("");
  const [inputCollege, setInputCollege] = useState("");
  const [inputYear, setInputYear] = useState("");

  // Goal adding inputs
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalType, setNewGoalType] = useState<'cgpa' | 'attendance' | 'custom'>('cgpa');
  const [newGoalTarget, setNewGoalTarget] = useState("9.0");

  useEffect(() => {
    if (semestersInitialized && semesters.length > 0 && !activeSemId) {
      setActiveSemId(semesters[0].id);
    }
  }, [semestersInitialized, semesters, activeSemId]);

  // Sync demographics input defaults on load
  useEffect(() => {
    if (infoInitialized) {
      setInputName(studentInfo.name);
      setInputRoll(studentInfo.rollNumber);
      setInputBranch(studentInfo.branch);
      setInputCollege(studentInfo.college);
      setInputYear(studentInfo.academicYear);
    }
  }, [infoInitialized, studentInfo]);

  // Calculations for KPIs
  const overallCgpaInfo = calculateOverallCGPA(semesters);
  const totalCourses = semesters.reduce((acc, sem) => acc + sem.subjects.length, 0);

  // Attendance metrics
  const subjectsWithAttendance = semesters.flatMap(s => s.subjects).filter(s => (s.totalClasses ?? 0) > 0);
  const totalClassesAll = subjectsWithAttendance.reduce((sum, s) => sum + (s.totalClasses ?? 0), 0);
  const attendedClassesAll = subjectsWithAttendance.reduce((sum, s) => sum + (s.attendedClasses ?? 0), 0);
  const overallAttendancePct = totalClassesAll > 0 ? (attendedClassesAll / totalClassesAll) * 100 : 0;

  // Internals metrics
  const subjectsWithInternals = semesters.flatMap(s => s.subjects).filter(s => 
    (s.midMarks ?? 0) > 0 || (s.assignments ?? 0) > 0 || (s.labMarks ?? 0) > 0
  );
  const totalInternalsSum = subjectsWithInternals.reduce((sum, s) => 
    sum + (s.midMarks ?? 0) + (s.assignments ?? 0) + (s.labMarks ?? 0), 0
  );
  const averageInternals = subjectsWithInternals.length > 0 ? totalInternalsSum / subjectsWithInternals.length : 0;

  // Risk courses
  const riskCourses = semesters.flatMap(s => s.subjects).filter(s => {
    const total = s.totalClasses ?? 0;
    const attended = s.attendedClasses ?? 0;
    const attPct = total > 0 ? (attended / total) * 100 : 100;
    const totalInternals = (s.midMarks ?? 0) + (s.assignments ?? 0) + (s.labMarks ?? 0);
    const hasInternals = (s.midMarks ?? 0) > 0 || (s.assignments ?? 0) > 0 || (s.labMarks ?? 0) > 0;
    
    return (total > 0 && attPct < 75) || (hasInternals && totalInternals < 50);
  });

  // Extremum grades
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

  // Auto-sync Goal Progress
  useEffect(() => {
    if (goalsInitialized) {
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

      if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
        setGoals(updatedGoals);
      }
    }
  }, [overallCgpaInfo.cgpa, overallAttendancePct, goals, setGoals, goalsInitialized]);

  // --- Core Handlers ---
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedInfo = {
      name: inputName.trim(),
      rollNumber: inputRoll.trim(),
      branch: inputBranch.trim(),
      college: inputCollege.trim(),
      academicYear: inputYear.trim()
    };
    setStudentInfo(updatedInfo);
    
    try {
      await updateProfileDetails(updatedInfo);
    } catch (err) {
      console.warn("Failed to sync demographics to Firebase profile:", err);
    }
    
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

  const handleDownloadPDF = () => {
    exportToPDF(studentInfo, semesters, overallCgpaInfo, goals);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all dashboard details?")) {
      setSemesters(DEFAULT_SEMESTERS);
      setStudentInfo(DEFAULT_STUDENT_INFO);
      setGoals(DEFAULT_GOALS);
      if (DEFAULT_SEMESTERS.length > 0) {
        setActiveSemId(DEFAULT_SEMESTERS[0].id);
      }
    }
  };

  if (authLoading || !infoInitialized || !semestersInitialized || !goalsInitialized) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            GradeFlow AI Workspace Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeSemester = semesters.find(s => s.id === activeSemId) || semesters[0];

  const sidebarLinks = [
    { id: 'overview', name: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'semesters', name: 'Semester Manager', icon: BookOpen },
    { id: 'attendance', name: 'Attendance & Internals', icon: CalendarDays },
    { id: 'predictor', name: 'GPA predictor & goals', icon: Sliders }
  ];

  return (
    <div className="min-h-screen flex bg-[#090d16] text-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-white/5 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-650 to-indigo-650 text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">GradeFlow AI</h2>
            <span className="text-[9px] font-bold text-blue-500 uppercase">Core Workspace</span>
          </div>
        </div>

        {/* User Profile display in Sidebar */}
        {profile && (
          <div className="p-4 border-b border-white/5 bg-slate-900/10 flex items-center gap-3">
            <Link href="/profile" className="relative group cursor-pointer flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 overflow-hidden p-1 group-hover:border-blue-550/40 transition-colors">
                <img 
                  src={profile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.uid}`} 
                  alt="Avatar" 
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link href="/profile" className="font-extrabold text-[11px] text-slate-200 hover:text-blue-400 truncate block leading-tight">
                {profile.name}
              </Link>
              <span className="text-[9.5px] text-slate-500 font-semibold truncate block mt-0.5 leading-none">
                {profile.email}
              </span>
            </div>
          </div>
        )}

        {/* Links Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id as any)}
                className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Utilities */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-850 text-white border border-white/5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
          
          <button
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold cursor-pointer transition-colors animate-hover-spin"
            title="Reset All Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>

          <button
            onClick={async () => {
              await logOut();
              router.push("/login");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-slate-350 text-[10px] font-bold cursor-pointer mt-1"
          >
            <span>Back to Homepage</span>
          </Link>
        </div>
      </aside>

      {/* MOBILE COLLAPSIBLE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-40"
            />
            {/* Slide-out Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-white/5 z-50 flex flex-col h-screen"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-black">GradeFlow AI</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile display in Mobile Sidebar */}
              {profile && (
                <div className="p-4 border-b border-white/5 bg-slate-900/10 flex items-center gap-3">
                  <Link href="/profile" onClick={() => setIsSidebarOpen(false)} className="relative group cursor-pointer flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 overflow-hidden p-1 group-hover:border-blue-550/40 transition-colors">
                      <img 
                        src={profile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.uid}`} 
                        alt="Avatar" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href="/profile" onClick={() => setIsSidebarOpen(false)} className="font-extrabold text-[11px] text-slate-200 hover:text-blue-400 truncate block leading-tight">
                      {profile.name}
                    </Link>
                    <span className="text-[9.5px] text-slate-500 font-semibold truncate block mt-0.5 leading-none">
                      {profile.email}
                    </span>
                  </div>
                </div>
              )}

              <nav className="flex-1 py-6 px-4 space-y-1.5">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id as any);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? "bg-blue-650 text-white shadow-md shadow-blue-500/10"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5 space-y-2">
                <button
                  onClick={() => {
                    handleDownloadPDF();
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white border border-white/5 rounded-xl text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
                <button
                  onClick={() => {
                    handleResetData();
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Database</span>
                </button>
                <button
                  onClick={async () => {
                    setIsSidebarOpen(false);
                    await logOut();
                    router.push("/login");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
                <Link
                  href="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 text-[10px] font-bold cursor-pointer mt-1"
                >
                  <span>Back to Homepage</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN WORKSPACE WRAPPER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900/10 relative">
        
        {/* Top Header Bar */}
        <header className="glass-panel border-b border-white/5 h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white border border-white/5 bg-slate-950/30 rounded-xl"
              title="Open Navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h2 className="text-sm sm:text-base font-black capitalize text-slate-800 dark:text-slate-100">
                {activeTab === 'overview' && "Dashboard Overview"}
                {activeTab === 'semesters' && "Semesters Manager"}
                {activeTab === 'attendance' && "Attendance & Internals"}
                {activeTab === 'predictor' && "Predictive Goal Advisor"}
              </h2>
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mt-0.5 leading-none">
                Workspace / {activeTab}
              </p>
            </div>
          </div>

          {/* User toggle details */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-semibold text-slate-400 dark:text-slate-500">
              Student: <strong className="text-slate-700 dark:text-slate-300">{studentInfo.name}</strong>
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Scrolling Workspace Sub-views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              
              {/* --- VIEW 1: OVERVIEW DASHBOARD --- */}
              {activeTab === 'overview' && (
                <>
                  {/* Student Demographic header */}
                  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                    {isEditingInfo ? (
                      <form onSubmit={handleSaveInfo} className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-205 uppercase tracking-wider mb-2">Edit Student Information</h3>
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

                  {/* Top KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Overall CGPA</span>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{overallCgpaInfo.cgpa.toFixed(2)}</h4>
                      <span className="text-[9px] text-slate-450 mt-1 block">Out of 10.0</span>
                    </div>
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Converted Percentage</span>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{overallCgpaInfo.percentage.toFixed(2)}%</h4>
                      <span className="text-[9px] text-slate-455 mt-1 block">CGPA &times; 9.5</span>
                    </div>
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Credits Earned</span>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{overallCgpaInfo.totalCredits}</h4>
                      <span className="text-[9px] text-slate-450 mt-1 block">Sum of weights</span>
                    </div>
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Subjects Logs</span>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{totalCourses}</h4>
                      <span className="text-[9px] text-slate-450 mt-1 block">{semesters.length} Semesters</span>
                    </div>
                  </div>

                  {/* Recharts Analytics graphs */}
                  <Analytics semesters={semesters} />

                  {/* Attendance & risk alerts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attendance KPI Card */}
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <h3 className="text-xs font-bold text-slate-200">Overall Attendance Monitor</h3>
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                          overallAttendancePct >= 75 ? "bg-emerald-500/10 text-emerald-450" : "bg-rose-500/10 text-rose-455"
                        }`}>
                          {overallAttendancePct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Total Classes</span>
                          <span className="text-lg font-extrabold text-slate-200 mt-1 block">{totalClassesAll} classes</span>
                        </div>
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Attended Classes</span>
                          <span className="text-lg font-extrabold text-slate-200 mt-1 block">{attendedClassesAll} classes</span>
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
                                <span>Attendance is in good standing overall!</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 font-bold">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <span>Attendance Warning: Overall attendance is below 75%!</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic text-center py-4 border border-dashed border-white/5 rounded-lg">
                            No attendance logged yet. Use the 'Attendance & Internals' tab to input details.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* KPI Extremums and Risks */}
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                            <Award className="w-4 h-4" />
                          </div>
                          <h3 className="text-xs font-bold text-slate-200">Academic Risk Advisor</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400">Average Internals: {averageInternals.toFixed(1)}/100</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">At Risk Subjects</span>
                          <span className={`text-lg font-extrabold mt-1 block ${riskCourses.length > 0 ? "text-rose-500" : "text-emerald-555"}`}>
                            {riskCourses.length} courses
                          </span>
                        </div>
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Highest/Lowest Grade</span>
                          <span className="text-sm font-extrabold text-slate-200 mt-1 block">
                            Max: <span className="text-emerald-500">{highestGrade}</span> | Min: <span className="text-rose-500">{lowestGrade}</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex-1 flex flex-col justify-end">
                        {riskCourses.length > 0 ? (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs rounded-lg flex items-start gap-2">
                            <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">Low Performance Warning:</span>
                              <p className="mt-1 leading-normal">
                                The following courses need attention: <strong className="text-rose-400">{riskCourses.map(c => c.name).join(", ")}</strong>.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 text-xs rounded-lg flex items-center gap-2">
                            <CheckCircle2 className="w-4.5 h-4.5" />
                            <span>Zero subjects are at risk. Keep up the high score!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- VIEW 2: SEMESTER MANAGER --- */}
              {activeTab === 'semesters' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                        <span>Semesters Ledger</span>
                        <span className="text-[10px] font-semibold py-0.5 px-2 bg-slate-800 rounded-full text-slate-400">
                          {semesters.length} semesters
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Select a semester to open its course table and add subjects, credits, and grade values.</p>
                    </div>
                    
                    <button
                      onClick={handleAddSemester}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Semester</span>
                    </button>
                  </div>

                  <div className="space-y-5">
                    {semesters.map((sem) => (
                      <SemesterCard
                        key={sem.id}
                        semester={sem}
                        isActive={activeSemId === sem.id}
                        onSelect={() => setActiveSemId(sem.id)}
                        onUpdateSemester={(updated) => handleUpdateSemester(sem.id, updated)}
                        onDeleteSemester={() => handleDeleteSemester(sem.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* --- VIEW 3: ATTENDANCE & INTERNALS MONITOR --- */}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Course Attendance & Internal Marks Tracker</h2>
                    <p className="text-xs text-slate-500 mt-1">To edit details, select a semester, expand the subject row using the down-chevron button (v), and fill out the fields.</p>
                  </div>

                  {/* Active Semester Quick Select */}
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
                    {semesters.map(sem => (
                      <button
                        key={sem.id}
                        onClick={() => setActiveSemId(sem.id)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          activeSemId === sem.id
                            ? "bg-blue-600/10 border-blue-500 text-blue-500"
                            : "border-white/5 hover:bg-white/5 text-slate-400"
                        }`}
                      >
                        {sem.name}
                      </button>
                    ))}
                  </div>

                  {activeSemester && (
                    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -z-10" />
                      <h3 className="font-extrabold text-sm text-slate-200 mb-4 flex items-center justify-between">
                        <span>Active Course Log - {activeSemester.name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-550">
                          Credits: {activeSemester.subjects.reduce((sum, s) => sum + s.credits, 0)} | SGPA: {calculateSGPA(activeSemester.subjects).toFixed(2)}
                        </span>
                      </h3>

                      {activeSemester.subjects.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-8">No subjects logged inside this semester. Go to the Semester Manager to add courses.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-250/10 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="pb-2 px-2 text-center w-8">v</th>
                                <th className="pb-2 px-4">Subject Name</th>
                                <th className="pb-2 px-4 text-center">Credits</th>
                                <th className="pb-2 px-4 text-center">Grade</th>
                                <th className="pb-2 px-4 text-center">Grade Points</th>
                                <th className="pb-2 px-4 text-center">Total Points</th>
                                <th className="pb-2 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {activeSemester.subjects.map((subj) => {
                                const handleUpdateSelfSubj = (updatedSubj: any) => {
                                  handleUpdateSemester(activeSemester.id, {
                                    ...activeSemester,
                                    subjects: activeSemester.subjects.map(s => s.id === subj.id ? updatedSubj : s)
                                  });
                                };
                                const handleDeleteSelfSubj = () => {
                                  if (window.confirm("Remove this course?")) {
                                    handleUpdateSemester(activeSemester.id, {
                                      ...activeSemester,
                                      subjects: activeSemester.subjects.filter(s => s.id !== subj.id)
                                    });
                                  }
                                };
                                return (
                                  <SubjectRow
                                    key={subj.id}
                                    subject={subj}
                                    onUpdate={handleUpdateSelfSubj}
                                    onDelete={handleDeleteSelfSubj}
                                  />
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- VIEW 4: GPA PREDICTOR & GOALS --- */}
              {activeTab === 'predictor' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Predictive Goal Advisor & Milestone Tracker</h2>
                    <p className="text-xs text-slate-500 mt-1">Simulate future GPA requirements to hit target milestones and track your personal academic goals.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: CGPA Predictor */}
                    <div className="lg:col-span-6">
                      <CgpaPredictor 
                        currentCgpa={overallCgpaInfo.cgpa} 
                        currentCredits={overallCgpaInfo.totalCredits} 
                      />
                    </div>

                    {/* Right Column: Academic Goals Checklist */}
                    <div className="lg:col-span-6 glass-panel rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -z-10" />
                      <div className="flex items-center gap-3 border-b border-slate-200/5 dark:border-white/5 pb-4 mb-5">
                        <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Academic Milestones
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                            Track and execute goals
                          </p>
                        </div>
                      </div>

                      {/* Goal addition form */}
                      <form onSubmit={handleAddGoal} className="space-y-4 mb-6 p-4 bg-slate-950/20 border border-white/5 rounded-xl">
                        <h4 className="text-xs font-bold text-slate-300">Create New Goal</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Goal Description</label>
                            <input
                              type="text"
                              value={newGoalTitle}
                              onChange={e => setNewGoalTitle(e.target.value)}
                              placeholder="e.g., Get A+ in Data Structures"
                              className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-slate-850 dark:text-slate-100 font-semibold focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Metric Type</label>
                            <select
                              value={newGoalType}
                              onChange={e => {
                                const val = e.target.value as any;
                                setNewGoalType(val);
                                setNewGoalTarget(val === 'cgpa' ? "9.0" : val === 'attendance' ? "85" : "1");
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer"
                            >
                              <option value="cgpa" className="bg-slate-900 text-white">CGPA Target</option>
                              <option value="attendance" className="bg-slate-900 text-white">Attendance %</option>
                              <option value="custom" className="bg-slate-900 text-white">Custom Task</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                          <div className="w-1/3">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Target Value</label>
                            <input
                              type="number"
                              min="0"
                              step="0.05"
                              value={newGoalTarget}
                              onChange={e => setNewGoalTarget(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-slate-850 dark:text-slate-100 font-semibold focus:outline-none"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-lg shadow-md shadow-blue-500/10 cursor-pointer"
                          >
                            Add Milestone
                          </button>
                        </div>
                      </form>

                      {/* Goals Checklist */}
                      <div className="space-y-3">
                        {goals.length === 0 ? (
                          <p className="text-xs text-slate-500 italic text-center py-6">No goals active. Define a milestone above to start tracking.</p>
                        ) : (
                          goals.map((goal) => {
                            const pct = goal.targetValue > 0 ? Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100)) : 0;
                            return (
                              <div 
                                key={goal.id} 
                                className={`p-4 rounded-xl border transition-colors flex items-start gap-3 justify-between ${
                                  goal.completed 
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-slate-300"
                                    : "bg-slate-950/20 border-white/5 text-slate-300"
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {goal.type === 'custom' ? (
                                      <input
                                        type="checkbox"
                                        checked={goal.completed}
                                        onChange={() => handleToggleGoal(goal.id)}
                                        className="h-4 w-4 rounded border-white/10 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                                      />
                                    ) : (
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                        goal.completed ? "border-emerald-500 bg-emerald-500/20 text-emerald-555" : "border-slate-600"
                                      }`}>
                                        {goal.completed && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                      </div>
                                    )}
                                    <span className={`text-xs font-bold leading-normal truncate block ${goal.completed ? "line-through text-slate-500" : ""}`}>
                                      {goal.title}
                                    </span>
                                  </div>

                                  {/* Progress bar (except for custom tasks unless numeric) */}
                                  {goal.type !== 'custom' && (
                                    <div className="mt-3 space-y-1">
                                      <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                        <span>Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                                        <span>{pct.toFixed(0)}%</span>
                                      </div>
                                      <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-300 ${
                                            goal.completed ? "bg-emerald-500" : "bg-blue-500"
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleDeleteGoal(goal.id)}
                                  className="text-slate-500 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                                  title="Delete Goal"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Footer component included in dashboard for consistent attributions */}
        <Footer />

      </div>
    </div>
  );
}
