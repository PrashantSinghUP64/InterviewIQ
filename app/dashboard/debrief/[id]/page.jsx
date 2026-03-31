"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { InterviewDebrief } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Building2, Briefcase, Calendar, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const DebriefResultPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebriefData();
  }, [id]);

  const fetchDebriefData = async () => {
    try {
      const result = await db.select()
        .from(InterviewDebrief)
        .where(eq(InterviewDebrief.id, parseInt(id)));
        
      if (result.length > 0) {
        setData(result[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <p className="text-center mt-10 text-slate-500">No debrief found.</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <button 
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-indigo-500" />
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            Groq AI Debrief
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> {data.createdAt}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Next Round Preparation Plan
        </h1>

        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Building2 className="w-4 h-4" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">{data.companyName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Briefcase className="w-4 h-4" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">{data.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Questions Asked */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Questions You Faced</h3>
            <div className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300">
              <p className="whitespace-pre-wrap">{data.questionsAsked}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Groq Analysis */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
               Action Plan
            </h3>
            
            <div className="prose dark:prose-invert prose-slate max-w-none prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400 prose-a:text-indigo-500">
              <ReactMarkdown>{data.groqAnalysis}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebriefResultPage;
