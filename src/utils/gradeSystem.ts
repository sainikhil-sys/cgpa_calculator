export const GRADE_VALUES: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'F': 0
};

export const GRADE_OPTIONS = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'];

export const GRADE_COLORS: Record<string, string> = {
  'O': 'bg-blue-500/10 text-blue-450 border-blue-500/20',
  'A+': 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20',
  'A': 'bg-teal-500/10 text-teal-455 border-teal-500/20',
  'B+': 'bg-indigo-500/10 text-indigo-450 border-indigo-500/20',
  'B': 'bg-purple-500/10 text-purple-450 border-purple-500/20',
  'C': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'F': 'bg-rose-500/10 text-rose-450 border-rose-500/20'
};
