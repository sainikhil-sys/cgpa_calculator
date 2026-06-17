"use client";

import { useState } from "react";
import { Subject } from "../types";
import { GRADE_OPTIONS, GRADE_VALUES, GRADE_COLORS } from "@/utils/gradeSystem";
import { 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CalendarRange, 
  Gauge, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";

interface SubjectRowProps {
  subject: Subject;
  onUpdate: (updatedSubject: Subject) => void;
  onDelete: () => void;
}

export default function SubjectRow({ subject, onUpdate, onDelete }: SubjectRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Core row edits
  const [editName, setEditName] = useState(subject.name);
  const [editCredits, setEditCredits] = useState(subject.credits.toString());
  const [editGrade, setEditGrade] = useState(subject.grade);

  // Detail panel states (attendance & internals)
  const [totalClasses, setTotalClasses] = useState(subject.totalClasses?.toString() || "0");
  const [attendedClasses, setAttendedClasses] = useState(subject.attendedClasses?.toString() || "0");
  
  const [midMarks, setMidMarks] = useState(subject.midMarks?.toString() || "0");
  const [assignments, setAssignments] = useState(subject.assignments?.toString() || "0");
  const [labMarks, setLabMarks] = useState(subject.labMarks?.toString() || "0");

  const handleSaveMain = () => {
    if (!editName.trim()) return;
    const parsedCredits = parseFloat(editCredits);
    if (isNaN(parsedCredits) || parsedCredits <= 0) return;

    onUpdate({
      ...subject,
      name: editName.trim(),
      credits: parsedCredits,
      grade: editGrade
    });
    setIsEditing(false);
  };

  const handleSaveDetails = () => {
    const total = parseInt(totalClasses) || 0;
    const attended = parseInt(attendedClasses) || 0;
    const mid = parseFloat(midMarks) || 0;
    const assign = parseFloat(assignments) || 0;
    const lab = parseFloat(labMarks) || 0;

    if (attended > total) {
      alert("Attended classes cannot exceed total classes.");
      return;
    }

    onUpdate({
      ...subject,
      totalClasses: total,
      attendedClasses: attended,
      midMarks: mid,
      assignments: assign,
      labMarks: lab
    });
    alert("Subject details updated successfully.");
  };

  const handleCancel = () => {
    setEditName(subject.name);
    setEditCredits(subject.credits.toString());
    setEditGrade(subject.grade);
    setIsEditing(false);
  };

  // Calculations for display
  const gradePoint = GRADE_VALUES[subject.grade] ?? 0;
  const totalPoints = subject.credits * gradePoint;

  const totalClassesNum = subject.totalClasses ?? 0;
  const attendedClassesNum = subject.attendedClasses ?? 0;
  const attendancePct = totalClassesNum > 0 ? (attendedClassesNum / totalClassesNum) * 100 : 0;

  // Attendance advisor
  let attendanceMessage = "No attendance tracked yet.";
  let attendanceStatus: 'empty' | 'danger' | 'warning' | 'success' = 'empty';
  let requiredActionText = "";

  if (totalClassesNum > 0) {
    if (attendancePct < 75) {
      attendanceStatus = 'danger';
      attendanceMessage = "Attendance critically below 75%!";
      // Calculate classes needed to reach 75%
      // (Attended + X) / (Total + X) >= 0.75 => Attended + X >= 0.75Total + 0.75X => 0.25X >= 0.75Total - Attended => X >= 3Total - 4Attended
      const requiredClasses = Math.ceil(3 * totalClassesNum - 4 * attendedClassesNum);
      requiredActionText = `Attend the next ${requiredClasses} consecutive classes to reach 75%.`;
    } else {
      attendanceStatus = 'success';
      attendanceMessage = "Attendance in good standing.";
      // Calculate how many classes user can afford to miss
      // Attended / (Total + Y) >= 0.75 => Attended >= 0.75Total + 0.75Y => 0.75Y <= Attended - 0.75Total => Y <= (4Attended - 3Total) / 3
      const missableClasses = Math.floor((4 * attendedClassesNum - 3 * totalClassesNum) / 3);
      requiredActionText = missableClasses > 0 
        ? `You can afford to miss the next ${missableClasses} classes while staying above 75%.`
        : `You are on the line! Do not miss future classes.`;
    }
  }

  // Internals Performance
  const midMarksNum = subject.midMarks ?? 0;
  const assignMarksNum = subject.assignments ?? 0;
  const labMarksNum = subject.labMarks ?? 0;
  const totalInternals = midMarksNum + assignMarksNum + labMarksNum; // Out of 100
  const isAtRisk = totalInternals < 50 && (totalClassesNum > 0 || totalInternals > 0);

  return (
    <>
      <tr className="border-b border-slate-200/5 dark:border-white/5 hover:bg-slate-800/10 dark:hover:bg-slate-900/10 transition-colors text-sm text-slate-300">
        
        {/* Toggle Expand Trigger column */}
        <td className="py-4 px-2 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors focus:outline-none"
            title="Expand Details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>

        {isEditing ? (
          /* EDIT MODE ROW */
          <>
            <td className="py-3 px-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </td>
            <td className="py-3 px-4 text-center">
              <input
                type="number"
                min="0.5"
                max="20"
                step="0.5"
                value={editCredits}
                onChange={(e) => setEditCredits(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-lg glass-input text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none text-center mx-auto"
              />
            </td>
            <td className="py-3 px-4 text-center">
              <select
                value={editGrade}
                onChange={(e) => setEditGrade(e.target.value)}
                className="px-3 py-1.5 rounded-lg glass-input text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none mx-auto cursor-pointer"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-white">
                    {g} ({GRADE_VALUES[g]} pts)
                  </option>
                ))}
              </select>
            </td>
            <td className="py-3 px-4 text-center text-slate-500">-</td>
            <td className="py-3 px-4 text-center text-slate-500">-</td>
            <td className="py-3 px-4 text-right">
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={handleSaveMain}
                  className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 text-slate-400 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </td>
          </>
        ) : (
          /* DISPLAY MODE ROW */
          <>
            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-150">
              <div className="flex flex-col">
                <span>{subject.name}</span>
                <div className="flex gap-3 text-[10px] text-slate-500 mt-1 font-bold">
                  {totalClassesNum > 0 && (
                    <span className={attendancePct < 75 ? "text-rose-500" : "text-emerald-555"}>
                      Attd: {attendancePct.toFixed(0)}%
                    </span>
                  )}
                  {totalInternals > 0 && (
                    <span className={isAtRisk ? "text-rose-500" : "text-slate-400"}>
                      Internals: {totalInternals}/100
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-350">
              {subject.credits}
            </td>
            <td className="py-4 px-4 text-center">
              <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                GRADE_COLORS[subject.grade] || 'bg-slate-500/10 text-slate-450 border-slate-500/20'
              }`}>
                {subject.grade}
              </span>
            </td>
            <td className="py-4 px-4 text-center font-semibold text-slate-500 dark:text-slate-450">
              {gradePoint}
            </td>
            <td className="py-4 px-4 text-center font-black text-slate-850 dark:text-slate-200">
              {totalPoints.toFixed(1)}
            </td>
            <td className="py-4 px-4 text-right">
              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-450 hover:bg-slate-800/10 dark:hover:bg-slate-900/50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Course"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-455 hover:bg-slate-800/10 dark:hover:bg-slate-900/50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </>
        )}
      </tr>

      {/* COLLAPSIBLE DETAILS PANEL */}
      {isExpanded && (
        <tr className="bg-slate-950/30 dark:bg-slate-950/50 border-b border-slate-200/5 dark:border-white/5">
          <td colSpan={7} className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Attendance Tracker Details */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <CalendarRange className="w-4 h-4 text-blue-500" />
                  <span>Attendance Monitor</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Attended Classes</label>
                    <input
                      type="number"
                      min="0"
                      value={attendedClasses}
                      onChange={e => setAttendedClasses(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Total Classes</label>
                    <input
                      type="number"
                      min="0"
                      value={totalClasses}
                      onChange={e => setTotalClasses(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status Advice Box */}
                {totalClassesNum > 0 ? (
                  <div className={`p-3 rounded-lg border text-xs font-medium space-y-1.5 ${
                    attendanceStatus === 'danger'
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {attendanceStatus === 'danger' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{attendanceMessage} (Current: {attendancePct.toFixed(1)}%)</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{requiredActionText}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Enter attended and total classes to trigger calculations.</p>
                )}
              </div>

              {/* Internal Marks Details */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Gauge className="w-4 h-4 text-purple-500" />
                  <span>Internal Marks Tracker</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Midterm (30)</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={midMarks}
                      onChange={e => setMidMarks(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Assigns (20)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={assignments}
                      onChange={e => setAssignments(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Lab Work (50)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={labMarks}
                      onChange={e => setLabMarks(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg glass-input text-slate-800 dark:text-slate-100 font-semibold focus:outline-none text-center"
                    />
                  </div>
                </div>

                {/* Risk assessment message */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="text-xs font-bold">
                    <span className="text-slate-500 block uppercase text-[9.5px]">Total Internals</span>
                    <span className={`text-base font-black ${isAtRisk ? "text-rose-500 animate-pulse" : "text-slate-200"}`}>
                      {totalInternals} / 100
                    </span>
                  </div>

                  {isAtRisk && (
                    <div className="px-2 py-1 bg-rose-500/10 text-rose-455 border border-rose-500/20 text-[10px] font-black rounded-lg uppercase flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>At Risk Zone</span>
                    </div>
                  )}

                  <button
                    onClick={handleSaveDetails}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer"
                  >
                    Save Details
                  </button>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}
