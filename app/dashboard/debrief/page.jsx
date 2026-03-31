"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Building2, Briefcase, MessageSquare, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const DebriefPage = () => {
  const { user } = useUser();
  const router = useRouter();
  
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !role || !questions) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          role,
          questionsAsked: questions,
          userEmail: user?.primaryEmailAddress?.emailAddress
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Debrief analyzed successfully!");
        router.push(`/dashboard/debrief/${data.id}`);
      } else {
        toast.error(data.error || "Failed to analyze debrief.");
      }
    } catch (error) {
      toast.error("An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-600/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          Post-Interview Debrief
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Just finished a real interview? Paste the questions you were asked. Groq AI will analyze them and build a personalized preparation plan for your next round.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> Company Name
              </label>
              <input 
                type="text" 
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Amazon"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Target Role
              </label>
              <input 
                type="text" 
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" /> Questions Asked (Be as detailed as possible)
            </label>
            <textarea 
              required
              rows={8}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder="- They asked what is the difference between React Server Components & Client Components...\n- A System Design question on designing a URL shortener...\n- Behavioral question on handling team conflicts..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-y"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !companyName || !role || !questions}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing with Groq AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Action Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebriefPage;
