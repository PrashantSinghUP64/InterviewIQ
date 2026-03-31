"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Calendar, Sparkles } from 'lucide-react';

const DebriefItemCard = ({ debrief }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{debrief?.companyName}</h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">{debrief?.role}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-100/50 dark:bg-slate-800/40 p-2 rounded-lg w-fit">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium">{debrief?.createdAt}</span>
      </div>
      
      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800 border-dashed">
         <button 
           onClick={() => router.push(`/dashboard/debrief/${debrief?.id}`)} 
           className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 transition-colors shadow-sm"
         >
           <Sparkles className="w-4 h-4 text-indigo-400" /> View Prep Plan
         </button>
      </div>
    </div>
  );
};

export default DebriefItemCard;
