"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from "recharts";
import { Loader2, TrendingUp, Target, Brain, Award } from "lucide-react";

const DashboardMetrics = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (user) fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      
      const [interviews, answers] = await Promise.all([
        db.select().from(MockInterview).where(eq(MockInterview.createdBy, email)).orderBy(desc(MockInterview.id)),
        db.select().from(UserAnswer).where(eq(UserAnswer.userEmail, email))
      ]);

      let totalInterviews = interviews.length;
      
      let totalClarity = 0, totalRelevance = 0, totalDepth = 0, totalFluency = 0;
      let ratedAnswers = 0;
      let ratedFluencyAnswers = 0;

      const sessionScores = {}; 
      
      answers.forEach(ans => {
        const rating = Number(ans.rating);
        const clarity = Number(ans.clarityRating);
        const relevance = Number(ans.relevanceRating);
        const depth = Number(ans.depthRating);
        const fluency = Number(ans.confidenceScore);
        
        if (!isNaN(rating)) {
          if (!sessionScores[ans.mockIdRef]) {
            sessionScores[ans.mockIdRef] = { total: 0, count: 0, date: ans.createdAt };
          }
          sessionScores[ans.mockIdRef].total += rating;
          sessionScores[ans.mockIdRef].count += 1;
        }

        if (!isNaN(clarity) && !isNaN(relevance) && !isNaN(depth)) {
          totalClarity += clarity;
          totalRelevance += relevance;
          totalDepth += depth;
          ratedAnswers += 1;
        }

        if (!isNaN(fluency) && fluency >= 0) {
          totalFluency += fluency;
          ratedFluencyAnswers += 1;
        }
      });

      const avgClarity = ratedAnswers ? (totalClarity / ratedAnswers) : 5;
      const avgRelevance = ratedAnswers ? (totalRelevance / ratedAnswers) : 5;
      const avgDepth = ratedAnswers ? (totalDepth / ratedAnswers) : 5;
      const avgFluency = ratedFluencyAnswers ? (totalFluency / ratedFluencyAnswers) : 50;

      const radarData = [
        { subject: 'Clarity', A: Math.round(avgClarity * 10), fullMark: 100 },
        { subject: 'Relevance', A: Math.round(avgRelevance * 10), fullMark: 100 },
        { subject: 'Depth', A: Math.round(avgDepth * 10), fullMark: 100 },
        { subject: 'Fluency', A: Math.round(avgFluency), fullMark: 100 },
      ];

      const lineData = Object.entries(sessionScores)
        .map(([mockIdRef, val]) => ({
          date: val.date ? val.date.substring(0, 5) : "N/A",
          score: Math.round(val.total / val.count * 10), 
        }))
        .reverse()
        .slice(-10);
        
      const overallAvgScore = lineData.length ? Math.round(lineData.reduce((acc, curr) => acc + curr.score, 0) / lineData.length) : 0;

      setMetrics({
        totalInterviews,
        overallAvgScore,
        radarData,
        lineData,
        ratedAnswers
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 rounded-2xl mb-10 w-full animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!metrics || metrics.totalInterviews === 0) {
    return null; 
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 animate-in fade-in duration-500">
       <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
          <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 h-full shadow-lg shadow-black/20">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
               <Award className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{metrics.overallAvgScore}<span className="text-base text-slate-500 font-medium">/100</span></p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Average Score</p>
          </div>

          <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 h-full shadow-lg shadow-black/20">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
               <Target className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{metrics.totalInterviews}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Completed Sessions</p>
          </div>
       </div>

       <div className="col-span-1 md:col-span-1 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden h-[256px] shadow-lg shadow-black/20">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2 z-10 relative">
            <Brain className="w-4 h-4 text-indigo-400" /> Skill Radar
          </h3>
          <div className="absolute inset-0 top-6 left-[0px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="60%" data={metrics.radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Skills" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
       </div>

       <div className="col-span-1 md:col-span-2 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-[256px] flex flex-col shadow-lg shadow-black/20">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Progress Over Time
          </h3>
          <div className="flex-1 w-full ml-[-20px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f1f5f9' }} 
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};

export default DashboardMetrics;
