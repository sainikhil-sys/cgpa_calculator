"use client";

import { useState } from "react";
import { Semester, Subject } from "../types";
import { calculateSGPA } from "@/utils/cgpaCalculations";
import { GRADE_OPTIONS, GRADE_VALUES } from "@/utils/gradeSystem";
import SubjectRow from "./SubjectRow";
import { Plus, Edit2, Trash2, Check, X, FileSpreadsheet, Sparkles } from "lucide-react";

interface SemesterCardProps {
  semester: Semester;
  onUpdateSemester: (updatedSem: Semester) => void;
  onDeleteSemester: () => void;
  isActive: boolean;
  onSelect: () => void;
}

export default function SemesterCard({
  semester,
  onUpdateSemester,
  onDeleteSemester,
  isActive,
  onSelect
}: SemesterCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(semester.name);

  // Subject quick-add form state
  const [subjName, setSubjName] = useState("");
  const [subjCredits, setSubjCredits] = useState("3");
  const [subjGrade, setSubjGrade] = useState("A+");

  const sgpa = calculateSGPA(semester.subjects);
  const totalCredits = semester.subjects.reduce((sum, s) => sum + s.credits, 0);

  const handleRename = () => {
    if (!editName.trim()) return;
    onUpdateSemester({ ...semester, name: editName.trim() });
    setIsEditingName(false);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;
    const creditsNum = parseFloat(subjCredits);
    if (isNaN(creditsNum) || creditsNum <= 0) return;

    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name: subjName.trim(),
      credits: creditsNum,
      grade: subjGrade
    };

    onUpdateSemester({
      ...semester,
      subjects: [...semester.subjects, newSubject]
    });
    setSubjName(""); // Reset only name to allow rapid entering
  };

  const handleUpdateSubject = (subjId: string, updatedSubj: Subject) => {
    onUpdateSemester({
      ...semester,
      subjects: semester.subjects.map(s => s.id === subjId ? updatedSubj : s)
    });
  };

  const handleDeleteSubject = (subjId: string) => {
    if (window.confirm("Remove this course?")) {
      onUpdateSemester({
        ...semester,
        subjects: semester.subjects.filter(s => s.id !== subjId)
      });
    }
  };

  const handleDeleteSemesterSelf = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${semester.name}"? This will delete all courses within it.`)) {
      onDeleteSemester();
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 relative group cursor-pointer ${
        isActive 
          ? "border-blue-500/40 ring-1 ring-blue-500/10 shadow-lg shadow-blue-500/5 bg-slate-900/90 dark:bg-slate-950/70"
          : "border-slate-200/10 hover:border-slate-250/20 shadow-sm bg-slate-900/40 dark:bg-slate-950/20 hover:bg-slate-900/50"
      }`}
    >
      {/* Active side gradient */}
      <div className={`absolute top-0 bottom-0 left-0 w-[3px] transition-all duration-200 ${
        isActive ? "bg-gradient-to-b from-blue-500 to-indigo-600" : "bg-transparent"
      }`} />

      {/* Header */}
      <div className="p-5 flex justify-between items-center flex-wrap gap-4 border-b border-slate-200/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-2.5 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white font-bold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setEditName(semester.name);
                    setIsEditingName(false);
                  }
                }}
              />
              <button onClick={handleRename} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditingName(false)} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                {semester.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingName(true);
                }}
                className="p-1.5 text-slate-455 hover:text-slate-200 rounded-lg hover:bg-slate-850 opacity-0 group-hover:opacity-100 transition-all duration-150"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Stats Badge & Delete Button */}
        <div className="flex items-center gap-3.5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SGPA:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/10 text-blue-450 border border-blue-500/20">
              {sgpa.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleDeleteSemesterSelf}
            className="p-2 text-slate-455 hover:text-rose-500 hover:bg-rose-500/15 rounded-xl transition-all duration-200"
            title="Delete Semester"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Info Row */}
      <div className="px-5 py-3 flex gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/5 dark:border-white/5 bg-slate-900/10 dark:bg-slate-950/10">
        <div>
          <span>Courses: </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{semester.subjects.length}</span>
        </div>
        <div>
          <span>Credits: </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{totalCredits}</span>
        </div>
      </div>

      {/* Expandable Workspace (Only visible if active) */}
      {isActive && (
        <div className="p-5 space-y-6" onClick={e => e.stopPropagation()}>
          
          {/* Subjects Table */}
          {semester.subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-200/10 rounded-xl">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl mb-3">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">No courses added</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Enter your subjects in the form below to begin tracking grades.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-250/10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-2 px-4">Subject Name</th>
                    <th className="pb-2 px-4 text-center">Credits</th>
                    <th className="pb-2 px-4 text-center">Grade</th>
                    <th className="pb-2 px-4 text-center">Grade Points</th>
                    <th className="pb-2 px-4 text-center">Total Points</th>
                    <th className="pb-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {semester.subjects.map((subj) => (
                    <SubjectRow
                      key={subj.id}
                      subject={subj}
                      onUpdate={(updatedSubj) => handleUpdateSubject(subj.id, updatedSubj)}
                      onDelete={() => handleDeleteSubject(subj.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick-add Subject Form */}
          <form onSubmit={handleAddSubject} className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Add Course Subject</span>
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6">
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems, Thermodynamics"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Credits</label>
                <input
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={subjCredits}
                  onChange={(e) => setSubjCredits(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none text-center"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Grade</label>
                <select
                  value={subjGrade}
                  onChange={(e) => setSubjGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g} className="bg-slate-900 text-white">
                      {g} ({GRADE_VALUES[g]} pts)
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer"
                  title="Add Course"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </form>

        </div>
      )}
    </div>
  );
}
