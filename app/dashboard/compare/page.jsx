"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq, desc } from 'drizzle-orm';
import { ArrowLeft, GitCompare, Loader2, TrendingUp, TrendingDown, Clock, BrainCircuit } from 'lucide-react';

const CompareHistoryPage = () => {
  const { user } = useUser();
  const router = useRouter();
  
  const [groupedAnswers, setGroupedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    if (user) fetchAndGroupAnswers();
  }, [user]);

  const fetchAndGroupAnswers = async () => {
    try {
      setLoading(true);
      const data = await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.userEmail, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(UserAnswer.id)); // Newest first

      // Group answers by exact question text
      const groups = {};
      data.forEach((ans) => {
        const qText = ans.question.trim().toLowerCase();
        if (!groups[qText]) {
          groups[qText] = {
            originalQuestion: ans.question,
            attempts: []
          };
        }
        groups[qText].attempts.push(ans);
      });

      // Filter only groups that have 2 or more attempts, then map to array
      const repeatedQuestions = Object.values(groups)
        .filter(group => group.attempts.length > 1)
        .sort((a, b) => b.attempts.length - a.attempts.length); // Most attempts first

      setGroupedAnswers(repeatedQuestions);
      if (repeatedQuestions.length > 0) {
        setSelectedQuestion(repeatedQuestions[0]); // Auto-select first
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateImprovement = (oldest, newest) => {
    const oldScore = Number(oldest.rating) || 0;
    const newScore = Number(newest.rating) || 0;
    
    if (oldScore === 0) return { improved: true, diff: 0, text: "Initial Score 0" };
    
    const percentage = Math.round(((newScore - oldScore) / oldScore) * 100);
    return {
      improved: percentage >= 0,
      diff: Math.abs(percentage),
      rawDiff: newScore - oldScore
    };
  };

  if (loading) {
    return (
       <div className="flex justify-center items-center h-[60vh] flex-col gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-slate-500 font-medium">Analyzing historical data...</p>
       </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <button 
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-600/20 rounded-xl">
            <GitCompare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          Answer History Comparison
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-3xl">
          Track your growth across repeated interview questions. Select a deeply analyzed question from your history to securely compare your latest answers and metrics against your original baseline side-by-side. No extra API calls. Local NeoDB Data only.
        </p>
      </div>

      {groupedAnswers.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center py-24 text-center px-4">
           <div className="w-20 h-20 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center mb-5">
              <GitCompare className="w-10 h-10 text-slate-400" />
           </div>
           <p className="text-slate-800 dark:text-slate-200 font-bold text-xl mb-2">No Repeated Questions Yet</p>
           <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm">
             Take more mock interviews! When you are asked the exact same question twice, you can compare your progress here.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Question List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Repeated Questions</h3>
            <div className="space-y-3 pr-2 custom-scrollbar overflow-y-auto max-h-[70vh]">
              {groupedAnswers.map((group, idx) => {
                const isSelected = selectedQuestion === group;
                const oldest = group.attempts[group.attempts.length - 1]; // Because desc order
                const newest = group.attempts[0];
                const improvement = calculateImprovement(oldest, newest);

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedQuestion(group)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <p className={`text-sm font-semibold line-clamp-2 leading-relaxed ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                        {group.originalQuestion}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs mt-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        <HistoryIcon /> {group.attempts.length} Attempts
                      </div>
                      
                      {group.attempts.length >= 2 && (
                        <div className={`flex items-center gap-1 font-bold ${improvement.improved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {improvement.improved ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {improvement.improved ? '+' : '-'}{improvement.diff}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Side-by-side Compare */}
          {selectedQuestion && (
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm h-full">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-relaxed">
                   "{selectedQuestion.originalQuestion}"
                 </h2>

                 {/* Side By Side Container */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {/* Vertical Divider for desktop */}
                    <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2"></div>
                    
                    {/* Attempt 1 (Oldest/Baseline) */}
                    <AttemptCard 
                      label="Baseline Answer (Oldest)"
                      attempt={selectedQuestion.attempts[selectedQuestion.attempts.length - 1]} 
                      isBaseline={true}
                    />

                    {/* Attempt 2 (Newest) */}
                    <AttemptCard 
                      label="Latest Answer (Newest)"
                      attempt={selectedQuestion.attempts[0]} 
                      isBaseline={false}
                    />
                 </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mini helper components
const HistoryIcon = () => <Clock className="w-3.5 h-3.5" />;

const AttemptCard = ({ attempt, label, isBaseline }) => {
  return (
    <div className={`relative flex flex-col p-5 rounded-2xl ${isBaseline ? 'bg-slate-50 border border-slate-200 dark:bg-slate-950/50 dark:border-slate-800' : 'bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className={`text-xs font-bold uppercase tracking-widest ${isBaseline ? 'text-slate-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
          {label}
        </h4>
        <div className="text-xs text-slate-400 font-medium">Rank {attempt.rating}/10</div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 mb-4 flex-1">
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {attempt.userAns || "No spoken answer captured."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
         <MetricBadge title="Clarity" val={attempt.clarityRating} isBaseline={isBaseline} />
         <MetricBadge title="Depth" val={attempt.depthRating} isBaseline={isBaseline} />
         <MetricBadge title="Relevance" val={attempt.relevanceRating} isBaseline={isBaseline} />
      </div>

      {attempt.feedback && (
         <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 border-dashed">
           <h5 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><BrainCircuit className="w-3.5 h-3.5"/> Feedback Notes</h5>
           <p className="text-xs text-slate-600 dark:text-slate-400 italic">
             "{attempt.feedback.substring(0, 150)}{attempt.feedback.length > 150 ? '...' : ''}"
           </p>
         </div>
      )}
    </div>
  );
}

const MetricBadge = ({ title, val, isBaseline }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border ${isBaseline ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50' : 'bg-emerald-100/50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30'}`}>
       <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">{title}</span>
       <span className={`text-sm font-black ${isBaseline ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-700 dark:text-emerald-400'}`}>{val || '-'}<span className="text-[10px] font-medium opacity-50">/10</span></span>
    </div>
  )
}

export default CompareHistoryPage;
