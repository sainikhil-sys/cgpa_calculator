export interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
  // Attendance fields
  totalClasses?: number;
  attendedClasses?: number;
  // Internal marks fields
  midMarks?: number; // e.g., out of 30
  assignments?: number; // e.g., out of 20
  labMarks?: number; // e.g., out of 50
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface StudentInfo {
  name: string;
  rollNumber: string;
  branch: string;
  college: string;
  academicYear: string;
}

export interface CgpaPredictorInput {
  currentCgpa: number;
  currentCredits: number;
  targetCgpa: number;
  futureCredits: number;
}

export interface CgpaPredictorResult {
  requiredGpa: number;
  successProbability: number;
  recommendation: string;
  status: 'impossible' | 'critical' | 'moderate' | 'easy';
}

export interface AcademicGoal {
  id: string;
  title: string;
  type: 'cgpa' | 'attendance' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
}
