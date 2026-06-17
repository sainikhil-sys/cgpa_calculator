import { Subject, Semester, CgpaPredictorInput, CgpaPredictorResult } from "../types";
import { GRADE_VALUES } from "./gradeSystem";

export function calculateSGPA(subjects: Subject[]): number {
  if (!subjects || subjects.length === 0) return 0;
  
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  subjects.forEach(subject => {
    const credits = parseFloat(subject.credits as any) || 0;
    const gradeVal = GRADE_VALUES[subject.grade] ?? 0;
    totalCredits += credits;
    totalGradePoints += credits * gradeVal;
  });
  
  return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
}

export function calculateOverallCGPA(semesters: Semester[]) {
  if (!semesters || semesters.length === 0) {
    return { cgpa: 0, totalCredits: 0, totalGradePoints: 0, percentage: 0 };
  }
  
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  semesters.forEach(sem => {
    sem.subjects.forEach(subject => {
      const credits = parseFloat(subject.credits as any) || 0;
      const gradeVal = GRADE_VALUES[subject.grade] ?? 0;
      totalCredits += credits;
      totalGradePoints += credits * gradeVal;
    });
  });
  
  const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  return {
    cgpa,
    totalCredits,
    totalGradePoints,
    percentage: cgpa * 9.5
  };
}

export function predictFutureGpa(input: CgpaPredictorInput): CgpaPredictorResult {
  const { currentCgpa, currentCredits, targetCgpa, futureCredits } = input;
  
  if (futureCredits <= 0) {
    return {
      requiredGpa: 0,
      successProbability: 0,
      recommendation: "Future credits must be greater than zero to predict required GPA.",
      status: "impossible"
    };
  }

  const totalCredits = currentCredits + futureCredits;
  const targetTotalPoints = targetCgpa * totalCredits;
  const currentTotalPoints = currentCgpa * currentCredits;
  const requiredFuturePoints = targetTotalPoints - currentTotalPoints;
  const requiredGpa = requiredFuturePoints / futureCredits;

  if (requiredGpa > 10.0) {
    return {
      requiredGpa,
      successProbability: 0,
      recommendation: `This target is mathematically impossible. It requires a future GPA of ${requiredGpa.toFixed(2)} which exceeds the maximum limit of 10.0. Try reducing your target CGPA.`,
      status: "impossible"
    };
  }

  if (requiredGpa <= 0) {
    return {
      requiredGpa: 0,
      successProbability: 100,
      recommendation: "You have already secured enough points to meet your target CGPA! Just passing your future subjects will guarantee success.",
      status: "easy"
    };
  }

  let successProbability = 100;
  let status: 'impossible' | 'critical' | 'moderate' | 'easy' = 'easy';
  let recommendation = "";

  if (requiredGpa > 9.5) {
    successProbability = 15;
    status = 'critical';
    recommendation = `Highly challenging. Requires an exceptional GPA of ${requiredGpa.toFixed(2)} in your future courses. You will need mostly 'O' grades.`;
  } else if (requiredGpa > 9.0) {
    successProbability = 45;
    status = 'critical';
    recommendation = `Demanding. Requires a GPA of ${requiredGpa.toFixed(2)} in your future courses. Steady, high performance (mostly 'O' and 'A+') is needed.`;
  } else if (requiredGpa > 8.0) {
    successProbability = 75;
    status = 'moderate';
    recommendation = `Very achievable. Requires maintaining a solid GPA of ${requiredGpa.toFixed(2)} in your future courses. Solid effort (mix of 'A+' and 'A' grades) will suffice.`;
  } else {
    successProbability = 95;
    status = 'easy';
    recommendation = `Easily achievable. Requires a modest GPA of ${requiredGpa.toFixed(2)} in your future courses. Maintaining average grades (like 'B+' or 'A') will easily secure your target.`;
  }

  return {
    requiredGpa,
    successProbability,
    recommendation,
    status
  };
}
