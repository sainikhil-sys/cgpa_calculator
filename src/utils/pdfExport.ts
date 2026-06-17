import { jsPDF } from "jspdf";
import { Semester, StudentInfo, AcademicGoal } from "../types";
import { GRADE_VALUES } from "./gradeSystem";
import { calculateSGPA } from "./cgpaCalculations";

export function exportToPDF(
  studentInfo: StudentInfo,
  semesters: Semester[],
  overallCgpaInfo: { cgpa: number; percentage: number; totalCredits: number },
  goals: AcademicGoal[] = []
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageHeight = doc.internal.pageSize.height; // 297mm
  const pageWidth = doc.internal.pageSize.width; // 210mm
  let y = 20;

  const checkPageOverflow = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
      drawHeaderFooter();
      return true;
    }
    return false;
  };

  const drawHeaderFooter = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("GRADEFLOW AI ACADEMIC REPORT", 15, 10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15 - doc.getTextWidth(`Generated: ${new Date().toLocaleDateString()}`), 10);
    doc.setDrawColor(241, 245, 249); // Slate 100
    doc.line(15, 12, pageWidth - 15, 12);

    // Footer
    doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);
    doc.text("Built for Digital Heroes | digitalheroesco.com", 15, pageHeight - 8);
    const pageNum = doc.getNumberOfPages();
    doc.text(`Page ${pageNum}`, pageWidth - 15 - doc.getTextWidth(`Page ${pageNum}`), pageHeight - 8);
  };

  drawHeaderFooter();

  // Report Title
  y = 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text("ACADEMIC PERFORMANCE REPORT", 15, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text("GradeFlow AI Smart Performance Analyzer", 15, y);

  y += 8;
  // Student Information Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(15, y, pageWidth - 30, 32, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("STUDENT DEMOGRAPHICS", 20, y + 6);
  doc.text("CREATOR PROFILE", 115, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${studentInfo.name || "N/A"}`, 20, y + 12);
  doc.text(`Roll No: ${studentInfo.rollNumber || "N/A"}`, 20, y + 17);
  doc.text(`Branch: ${studentInfo.branch || "N/A"}`, 20, y + 22);
  doc.text(`College: ${studentInfo.college || "N/A"} (${studentInfo.academicYear || "N/A"})`, 20, y + 27);

  doc.text(`Developer: Sai Nikhil`, 115, y + 12);
  doc.text(`Email: sainikhil6300725603@gmail.com`, 115, y + 17);
  doc.text(`Platform: GradeFlow AI Platform`, 115, y + 22);
  doc.text(`Link: digitalheroesco.com`, 115, y + 27);

  y += 40;
  // Overall Summary Metrics Dashboard
  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(191, 219, 254); // Blue 200
  doc.roundedRect(15, y, pageWidth - 30, 22, 2, 2, "FD");

  const colW = (pageWidth - 30) / 4;
  const colY = y + 8;

  // Cumulative CGPA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(29, 78, 216); // Blue 700
  doc.text(overallCgpaInfo.cgpa.toFixed(2), 15 + colW / 2, colY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("CUMULATIVE CGPA", 15 + colW / 2, colY + 6, { align: "center" });

  // Percentage
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(29, 78, 216);
  doc.text(`${overallCgpaInfo.percentage.toFixed(2)}%`, 15 + colW + colW / 2, colY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("CONVERTED %", 15 + colW + colW / 2, colY + 6, { align: "center" });

  // Total Credits
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(overallCgpaInfo.totalCredits.toString(), 15 + colW * 2 + colW / 2, colY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("TOTAL CREDITS", 15 + colW * 2 + colW / 2, colY + 6, { align: "center" });

  // Semesters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(semesters.length.toString(), 15 + colW * 3 + colW / 2, colY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("SEMESTERS", 15 + colW * 3 + colW / 2, colY + 6, { align: "center" });

  y += 30;

  // Semesters Breakdown tables
  semesters.forEach((sem) => {
    checkPageOverflow(30);
    const sgpa = calculateSGPA(sem.subjects);

    // Semester Header Banner
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(15, y, pageWidth - 30, 8, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(sem.name.toUpperCase(), 18, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 78, 216); // Blue 700
    doc.text(`SGPA: ${sgpa.toFixed(2)}`, pageWidth - 18 - doc.getTextWidth(`SGPA: ${sgpa.toFixed(2)}`), y + 5.5);

    y += 11;

    // Table Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(15, y, pageWidth - 30, 6.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("SUBJECT NAME", 18, y + 4.2);
    doc.text("CREDITS", 110, y + 4.2, { align: "center" });
    doc.text("GRADE", 140, y + 4.2, { align: "center" });
    doc.text("GRADE POINTS", 175, y + 4.2, { align: "center" });

    y += 6.5;

    if (sem.subjects.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text("No courses added in this semester.", 18, y + 5);
      y += 8;
    } else {
      sem.subjects.forEach((subj, subjIdx) => {
        checkPageOverflow(7.5);

        if (subjIdx % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(250, 250, 250);
        }
        doc.rect(15, y, pageWidth - 30, 7.5, "F");

        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 7.5, pageWidth - 15, y + 7.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);

        let displayName = subj.name;
        if (doc.getTextWidth(displayName) > 80) {
          displayName = doc.splitTextToSize(displayName, 80)[0] + "...";
        }
        doc.text(displayName, 18, y + 4.8);
        doc.text(subj.credits.toString(), 110, y + 4.8, { align: "center" });
        doc.text(subj.grade, 140, y + 4.8, { align: "center" });

        const pts = GRADE_VALUES[subj.grade] ?? 0;
        doc.text(`${pts} / 10`, 175, y + 4.8, { align: "center" });

        y += 7.5;
      });
    }

    y += 6; // Space after semester section
  });

  // Calculate Overall Attendance values for PDF print
  const subjectsWithAttendance = semesters.flatMap(s => s.subjects).filter(s => (s.totalClasses ?? 0) > 0);
  const totalClassesAll = subjectsWithAttendance.reduce((sum, s) => sum + (s.totalClasses ?? 0), 0);
  const attendedClassesAll = subjectsWithAttendance.reduce((sum, s) => sum + (s.attendedClasses ?? 0), 0);
  const overallAttendancePct = totalClassesAll > 0 ? (attendedClassesAll / totalClassesAll) * 100 : 0;

  // 5. Attendance Summary Section
  if (totalClassesAll > 0) {
    checkPageOverflow(26);
    y += 3;
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, pageWidth - 30, 18, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("ATTENDANCE METRICS SUMMARY", 20, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Overall Attendance: ${overallAttendancePct.toFixed(1)}%   (${attendedClassesAll} attended / ${totalClassesAll} total classes)`, 20, y + 12);
    
    if (overallAttendancePct < 75) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38); // Red 600
      doc.text("Status: WARNING (Below 75% threshold)", 140, y + 6);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105); // Green 600
      doc.text("Status: GOOD STANDING", 140, y + 6);
    }
    y += 20;
  }

  // 6. Goals Progress Section
  if (goals && goals.length > 0) {
    checkPageOverflow(20 + goals.length * 6);
    y += 3;
    
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, pageWidth - 30, 10 + goals.length * 6.5, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("ACADEMIC GOALS CHECKLIST", 20, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    goals.forEach((g, idx) => {
      const rowY = y + 13 + idx * 6;
      const statusText = g.completed ? "[X] COMPLETED" : `[ ] IN PROGRESS (${g.currentValue} / ${g.targetValue} ${g.unit})`;
      
      if (g.completed) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(5, 150, 105);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
      }
      
      doc.text(`- ${g.title}`, 20, rowY);
      doc.text(statusText, pageWidth - 80, rowY);
    });

    y += 15 + goals.length * 6.5;
  }

  // Disclaimer and Signature Section
  checkPageOverflow(30);
  y += 5;

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, "FD");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Disclaimer: This performance report is auto-generated based on inputs supplied by the student.", 20, y + 7);
  doc.text("It represents unofficial transcripts and serves only as a self-analytical progress dashboard.", 20, y + 11);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("Built for Digital Heroes | digitalheroesco.com", 20, y + 17);

  const filename = `${studentInfo.name.trim().replace(/\s+/g, "_") || "Student"}_GradeFlow_Report.pdf`;
  doc.save(filename);
}
