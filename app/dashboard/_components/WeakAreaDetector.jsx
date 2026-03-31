"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq, desc } from 'drizzle-orm';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, Brain, Loader2, CalendarHeart, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

const WeakAreaDetector = () => {
  const { user } = useUser();
  const [weakAnswers, setWeakAnswers] = useState([]);
  const [checking, setChecking] = useState(true);

  // Plan State
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      checkWeakAreas();
      loadCachedPlan();
    }
  }, [user]);

  const loadCachedPlan = () => {
    const cacheKey = `weakAreaPlan_${user.primaryEmailAddress.emailAddress}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { planText, timestamp } = JSON.parse(cached);
        const hoursPassed = (new Date().getTime() - timestamp) / (1000 * 60 * 60);
        
        // Cache lasts 3 days (72 hours) matching the plan length
        if (hoursPassed < 72) {
          setPlan(planText);
        } else {
          localStorage.removeItem(cacheKey); // Expired
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  };

  const saveCachedPlan = (planText) => {
    const cacheKey = `weakAreaPlan_${user.primaryEmailAddress.emailAddress}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      planText,
      timestamp: new Date().getTime()
    }));
  };

  const checkWeakAreas = async () => {
    try {
      const answers = await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.userEmail, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(UserAnswer.id));

      // Filter answers scored 6 or below
      const weaknesses = answers.filter(a => Number(a.rating) <= 6);
      
      // Grab top 5 weakest answers
      setWeakAnswers(weaknesses.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const RequestPracticePlan = async () => {
    if (weakAnswers.length === 0) return;
    
    setGenerating(true);
    try {
      const res = await fetch('/api/weak-areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weakAnswers: weakAnswers.map(a => ({ question: a.question, rating: a.rating, feedback: a.feedback })),
          userEmail: user?.primaryEmailAddress?.emailAddress
        })
      });
      const data = await res.json();
      if (data.success) {
         setPlan(data.plan);
         saveCachedPlan(data.plan);
         toast.success("Personalized 3-Day Plan Generated!");
      } else {
         toast.error(data.error || "Failed to generate plan");
      }
    } catch (e) {
      toast.error("An error occurred connecting to Groq AI");
    } finally {
      setGenerating(false);
    }
  };

  if (checking) return null; // Invisible while checking DB
  if (weakAnswers.length < 2 && !plan) return null; // Needs at least 2 weak answers to build a solid pattern

  return (
    <div className="mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`border rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 shadow-sm ${plan ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'}`}>
        
        {/* Background Graphic */}
        <div className="absolute -right-8 -top-8 opacity-5 dark:opacity-10 pointer-events-none">
           {plan ? <Brain className="w-64 h-64 text-indigo-500" /> : <AlertCircle className="w-64 h-64 text-rose-500" />}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl flex items-center justify-center ${plan ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'}`}>
                {plan ? <CalendarHeart className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <h2 className={`text-xl font-bold ${plan ? 'text-slate-900 dark:text-slate-100' : 'text-rose-900 dark:text-rose-100'}`}>
                {plan ? "Your 3-Day Practice Plan" : "Weak Areas Detected"}
              </h2>
            </div>
            
            <p className={`text-sm mb-5 max-w-2xl leading-relaxed ${plan ? 'text-slate-600 dark:text-slate-400' : 'text-rose-800 dark:text-rose-200/80'}`}>
              {plan 
                ? "Follow this specialized Groq AI roadmap to fix the specific weaknesses found in your recent interviews. Re-evaluate after 3 days."
                : `We noticed you scored poorly (under 7/10) on ${weakAnswers.length} recent interview questions. Focus on improving these concepts to boost your overall score.`
              }
            </p>

            {!plan && (
              <button 
                onClick={RequestPracticePlan}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-lg shadow-rose-600/20"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {generating ? "Building Plan..." : "Generate 3-Day Practice Plan"}
              </button>
            )}

            {plan && (
              <button 
                onClick={RequestPracticePlan}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 mt-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
               >
                 <RefreshCcw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} /> 
                 Regenerate Plan (Groq)
               </button>
            )}
          </div>
          
          {/* Display The Plan */}
          {plan && (
             <div className="w-full md:w-3/5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 prose dark:prose-invert prose-sm prose-p:leading-relaxed prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400 max-h-[400px] overflow-y-auto custom-scrollbar">
                <ReactMarkdown>{plan}</ReactMarkdown>
             </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default WeakAreaDetector;
