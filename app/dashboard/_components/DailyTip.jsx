"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Lightbulb, X } from 'lucide-react';

const DailyTip = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    fetchDailyTip();
  }, []);

  const fetchDailyTip = async () => {
    try {
      const cacheKey = "interviewiq_daily_tip";
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { text, timestamp } = JSON.parse(cachedData);
        const hoursPassed = (new Date().getTime() - timestamp) / (1000 * 60 * 60);

        if (hoursPassed < 24) {
          setTip(text);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }

      // If no valid cache, fetch from Groq via API
      const res = await fetch('/api/daily-tip');
      const data = await res.json();

      if (data.success) {
        setTip(data.tip);
        localStorage.setItem(cacheKey, JSON.stringify({
          text: data.tip,
          timestamp: new Date().getTime()
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 animate-pulse">
         <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
           <Lightbulb className="w-5 h-5 text-yellow-500" />
         </div>
         <div className="flex-1 space-y-2">
           <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
           <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full max-w-[400px]"></div>
         </div>
      </div>
    );
  }

  if (!tip || closed) return null;

  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-slate-900 border border-yellow-200/60 dark:border-yellow-900/40 rounded-2xl p-4 mb-8 group shadow-sm">
       <button 
         onClick={() => setClosed(true)}
         className="absolute top-4 right-4 sm:top-1/2 sm:-translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
       >
         <X className="w-4 h-4" />
       </button>

       <div className="w-10 h-10 min-w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-500">
         <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400 drop-shadow-sm" />
       </div>
       
       <div className="flex-1 pr-6 pb-1 sm:pb-0">
         <h4 className="text-xs font-bold text-amber-800/80 dark:text-amber-500/80 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
           Tip of the Day <Sparkles className="w-3 h-3" />
         </h4>
         <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic pr-2">
           &quot;{tip}&quot;
         </p>
       </div>
    </div>
  );
};

export default DailyTip;
