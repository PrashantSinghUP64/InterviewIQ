"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { GitCompare } from 'lucide-react';

const CompareHistoryButton = () => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push('/dashboard/compare')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push('/dashboard/compare'); }}
      className="group relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 bg-white/40 dark:bg-slate-900/40 hover:bg-emerald-600/5 transition-all duration-300 cursor-pointer min-h-[160px] hover:scale-[1.02]"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover:bg-emerald-600/20 group-hover:border-emerald-500/40 transition-all duration-300">
        <GitCompare className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors duration-300" />
      </div>

      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors duration-300">
          Compare History
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          View improvement on repeated questions
        </p>
      </div>
    </div>
  );
};

export default CompareHistoryButton;
