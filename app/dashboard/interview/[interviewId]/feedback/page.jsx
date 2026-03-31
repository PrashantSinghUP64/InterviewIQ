"use client";
import React, { useEffect, useState, useRef } from "react";
import { db } from "@/utils/db";
import { UserAnswer, MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2, XCircle, Activity,
  ChevronDown, ChevronUp, Lightbulb,
  MessageSquare, BookOpen, Target, Plus,
  Eye, Mic, Brain, Download, RotateCcw,
  Sparkles, Award, ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { chatSession } from "@/utils/GeminiAIModal";
import html2canvas from "html2canvas";
import moment from "moment";
import { useUser } from "@clerk/nextjs";

/* ── Circular SVG Progress Ring ─────────────────────────── */
const CircularProgress = ({ score, outOf = 10, size = 180, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max((score / outOf) * 100, 0), 100);
  const offset = circumference - (pct / 100) * circumference;

  const getColor = (p) => {
    if (p >= 90) return "#10b981"; // emerald (A)
    if (p >= 75) return "#6366f1"; // indigo (B)
    if (p >= 60) return "#f59e0b"; // amber (C)
    return "#ef4444";              // red (D)
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(pct)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s ease-out, stroke 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">
          {score.toFixed(1)}
        </span>
        <span className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">out of {outOf}</span>
      </div>
    </div>
  );
};

const getGrade = (pct) => {
  if (pct >= 90) return { letter: "A", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  if (pct >= 75) return { letter: "B", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" };
  if (pct >= 60) return { letter: "C", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  return { letter: "D", color: "text-red-400 bg-red-500/10 border-red-500/30" };
};

const getScoreStyle = (n) => {
  if (n >= 8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (n >= 5) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  return "text-red-400 bg-red-500/10 border-red-500/30";
};

/* ── Main Component ─────────────────────────────────────── */
export default function Feedback({ params }) {
  const { interviewId } = React.use(params);
  const [feedbackList, setFeedbackList] = useState([]);
  const [interviewData, setInterviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [weakestModelAnswer, setWeakestModelAnswer] = useState(null);
  const [isGeneratingModel, setIsGeneratingModel] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const shareCardRef = useRef(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    fetchData();
  }, [interviewId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [feedbacks, interview] = await Promise.all([
        db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, interviewId)).orderBy(UserAnswer.id),
        db.select().from(MockInterview).where(eq(MockInterview.mockId, interviewId))
      ]);
      setFeedbackList(feedbacks);
      setInterviewData(interview[0]);
    } catch (e) {
      console.error("Failed to load feedback", e);
    }
    setIsLoading(false);
  };

  /* ── Derived Metrics ── */
  const calcAvg = (key) => {
    const valid = feedbackList.map(i => parseFloat(i[key])).filter(n => !isNaN(n));
    return valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
  };
  
  const calcSum = (key) => {
    const valid = feedbackList.map(i => parseFloat(i[key])).filter(n => !isNaN(n));
    return valid.reduce((a, b) => a + b, 0);
  };

  const avgClarity    = calcAvg('clarityRating');
  const avgDepth      = calcAvg('depthRating');
  const avgFluency    = calcAvg('confidenceScore');
  const avgAttention  = calcAvg('attentionScore');
  const avgRating     = calcAvg('rating');

  const totalFillers = calcSum('fillerWordCount');
  const avgDuration  = calcAvg('duration');

  const overallPct = Math.min(Math.max((avgRating / 10) * 100, 0), 100);
  const grade = getGrade(overallPct);

  /* ── Weak Areas & Gemini Generation ── */
  const weakQuestions = feedbackList.filter(q => parseFloat(q.rating) < 5);
  const weakestQuestion = weakQuestions.length > 0 
    ? [...weakQuestions].sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating))[0] 
    : null;

  useEffect(() => {
    if (weakestQuestion && !weakestModelAnswer && !isGeneratingModel && interviewData) {
      generateModelAnswer(weakestQuestion);
    }
  }, [weakestQuestion, interviewData]);

  const generateModelAnswer = async (q) => {
    setIsGeneratingModel(true);
    const prompt = `You are an expert ${interviewData?.jobPosition}. The candidate was asked: "${q.question}". Provide a concise, highly effective model answer. Max 4 sentences. Return ONLY the answer text.`;
    try {
      const res = await chatSession.generateContent(prompt);
      setWeakestModelAnswer(res.response.text().trim());
    } catch (e) {
      setWeakestModelAnswer("Could not generate a model answer at this time.");
    }
    setIsGeneratingModel(false);
  };

  /* ── Download Report ── */
  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, { 
        backgroundColor: '#020617', // slate-950
        scale: 2 // High res
      }); 
      const link = document.createElement('a');
      link.download = `Interview_Report_${interviewId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error("Failed to generate image", e);
    }
    setIsDownloading(false);
  };

  /* ── Animation Styles ── */
  const KEYFRAMES = `
    @keyframes fadeUpStagger {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-stagger-1 { animation: fadeUpStagger 0.6s 0.1s ease-out forwards; opacity: 0; }
    .animate-stagger-2 { animation: fadeUpStagger 0.6s 0.2s ease-out forwards; opacity: 0; }
    .animate-stagger-3 { animation: fadeUpStagger 0.6s 0.3s ease-out forwards; opacity: 0; }
    .animate-stagger-4 { animation: fadeUpStagger 0.6s 0.4s ease-out forwards; opacity: 0; }
    .animate-stagger-5 { animation: fadeUpStagger 0.6s 0.5s ease-out forwards; opacity: 0; }
  `;

  /* Loading State */
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5">
        <style>{KEYFRAMES}</style>
        <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          <Activity className="w-10 h-10 text-indigo-400 animate-pulse" />
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
            Analysing Performance
          </h2>
          <p className="text-slate-500 text-sm">Compiling your comprehensive report...</p>
        </div>
      </div>
    );
  }

  /* Empty State */
  if (feedbackList.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 mx-auto mb-6">
            <XCircle className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No Data Found</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
            We couldn't find any answer records for this interview session. Make sure you complete the questions and save your answers.
          </p>
          <button onClick={() => router.replace('/dashboard')} className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-10">
      <style>{KEYFRAMES}</style>

      {/* ──────────────────────────────────────────────────────────
          1. HERO SECTION
      ────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 p-8 md:p-12 overflow-hidden animate-stagger-1 shadow-xl shadow-slate-900/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <CircularProgress score={avgRating} outOf={10} />
            <div className={`absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 flex items-center justify-center w-14 h-14 rounded-2xl border-2 backdrop-blur-md font-black text-2xl shadow-xl ${grade.color}`}>
              {grade.letter}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" /> Interview Complete
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {interviewData?.jobPosition}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
              You've successfully completed your mock interview for the <span className="text-slate-800 dark:text-slate-200 font-semibold">{interviewData?.jobExperience} years</span> experience level.
              Review your detailed performance breakdown below.
            </p>
            <div className="text-sm text-slate-500 font-medium">
              Completed on {interviewData?.createdAt || moment().format("DD MMM YYYY")}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          2. PERFORMANCE BREAKDOWN
      ────────────────────────────────────────────────────────── */}
      <section className="animate-stagger-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-5 px-1">
          <Activity className="w-5 h-5 text-indigo-400" /> Key Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Clarity */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Clarity</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {avgClarity.toFixed(1)}<span className="text-sm text-slate-500 font-medium tracking-normal ml-0.5">/10</span>
            </div>
          </div>
          {/* Depth */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Depth</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {avgDepth.toFixed(1)}<span className="text-sm text-slate-500 font-medium tracking-normal ml-0.5">/10</span>
            </div>
          </div>
          {/* Fluency / Filler words metric */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Fluency</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {avgFluency.toFixed(0)}<span className="text-sm text-slate-500 font-medium tracking-normal ml-0.5">%</span>
            </div>
          </div>
          {/* Eye Contact */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Eye Contact</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {avgAttention.toFixed(0)}<span className="text-sm text-slate-500 font-medium tracking-normal ml-0.5">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. QUESTION-BY-QUESTION BREAKDOWN
      ────────────────────────────────────────────────────────── */}
      <section className="animate-stagger-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-5 px-1">
          <Target className="w-5 h-5 text-indigo-400" /> Question Breakdown
        </h2>
        <div className="space-y-4">
          {feedbackList.map((item, index) => {
            const isOpen = expandedIndex === index;
            const isAdaptive = index > 0; // First question is predefined
            const qRating = parseFloat(item.rating) || 0;
            
            return (
              <Collapsible key={index} open={isOpen} onOpenChange={(open) => setExpandedIndex(open ? index : null)}>
                <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? "border-indigo-500/40 bg-white/80 dark:bg-slate-900/80 shadow-lg shadow-indigo-500/5" : "border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 hover:bg-white/50 dark:bg-slate-900/50 hover:border-slate-300 dark:border-slate-700"
                }`}>
                  <CollapsibleTrigger className="w-full flex items-center gap-4 p-5 text-left group">
                    <div className={`flex items-center justify-center shrink-0 w-11 h-11 rounded-xl text-sm font-black border ${getScoreStyle(qRating)}`}>
                      {item.rating}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Q{index + 1}</span>
                        {isAdaptive && (
                          <span className="px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                            <Brain className="w-3 h-3" /> Adaptive
                          </span>
                        )}
                      </div>
                      <p className="text-sm md:text-base font-medium text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {item.question}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />}
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-5 pt-0 border-t border-slate-200/60 dark:border-slate-800/60 mt-2">
                      {/* Score Pills */}
                      <div className="flex flex-wrap gap-2 mt-4 mb-5">
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Clarity: <span className="text-sky-400">{item.clarityRating || "N/A"}</span>/10
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Relevance: <span className="text-indigo-400">{item.relevanceRating || "N/A"}</span>/10
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Depth: <span className="text-purple-400">{item.depthRating || "N/A"}</span>/10
                        </div>
                        {item.fillerWordCount != null && (
                          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${parseInt(item.fillerWordCount) <= 2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : parseInt(item.fillerWordCount) <= 5 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {item.fillerWordCount} filler word{item.fillerWordCount !== '1' ? 's' : ''} ({parseInt(item.fillerWordCount) <= 2 ? 'Fluent speaker' : parseInt(item.fillerWordCount) <= 5 ? 'Some hesitation' : 'Work on fluency'})
                          </div>
                        )}
                        {item.duration != null && (
                          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${parseInt(item.duration) < 20 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : parseInt(item.duration) <= 120 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {item.duration} seconds ({parseInt(item.duration) < 20 ? 'Too brief' : parseInt(item.duration) <= 120 ? 'Good length' : 'Too long'})
                          </div>
                        )}
                      </div>

                      {/* ── Side-by-Side Comparison ── */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LEFT: Your Answer */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl bg-slate-200/60 dark:bg-slate-800/80 border border-b-0 border-slate-300 dark:border-slate-700">
                            <Mic className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Your Answer</span>
                          </div>
                          <div className="flex-1 rounded-b-xl rounded-tr-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic min-h-[120px]">
                            &ldquo;{item.userAns || 'No answer recorded.'}&rdquo;
                          </div>
                        </div>
                        {/* RIGHT: Expected / AI Feedback */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl bg-indigo-600/10 border border-b-0 border-indigo-500/30">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Expected / AI Feedback</span>
                          </div>
                          <div className="flex-1 rounded-b-xl rounded-tl-xl bg-indigo-500/5 border border-indigo-500/20 p-4 text-sm text-indigo-200 leading-relaxed font-medium min-h-[120px]">
                            {item.feedback || 'No feedback available.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          4. WEAK AREAS SECTION
      ────────────────────────────────────────────────────────── */}
      {weakQuestions.length > 0 && (
        <section className="animate-stagger-4">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 md:p-8">
            <h2 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5" /> Areas for Improvement
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We noticed you struggled with {weakQuestions.length} question{weakQuestions.length > 1 ? 's' : ''}. Review the AI-generated model answer for your weakest response below.
            </p>

            <div className="space-y-4">
              {weakQuestions.map((q, idx) => {
                const isWeakest = q.id === weakestQuestion?.id;
                return (
                  <div key={idx} className="rounded-2xl border border-red-500/30 bg-white/80 dark:bg-slate-900/80 p-5 shadow-lg">
                    <div className="flex gap-3 items-start">
                      <span className="mt-0.5 px-2 py-1 rounded bg-red-500/10 text-[10px] font-black text-red-400 border border-red-500/20 leading-none">
                        {q.rating}/10
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{q.question}</p>
                    </div>

                    {isWeakest && (
                      <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Award className="w-4 h-4" /> Ideal Model Answer
                        </p>
                        {isGeneratingModel ? (
                          <div className="space-y-2 animate-pulse">
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-4/6" />
                          </div>
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                            {weakestModelAnswer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────
          4.5 FLUENCY SUMMARY
      ────────────────────────────────────────────────────────── */}
      {(totalFillers > 0 || avgDuration > 0) && (
        <section className="animate-stagger-4 pb-6 mt-6">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 flex flex-col items-center text-center max-w-2xl mx-auto shadow-lg">
            <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2 mb-2">
              <Mic className="w-5 h-5" /> Fluency Summary
            </h2>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              You used <span className="text-indigo-400 font-bold">{totalFillers}</span> filler words across {feedbackList.length} answers.
              Average answer length: <span className="text-indigo-400 font-bold">{Math.round(avgDuration)}</span> seconds.
            </p>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────
          5. SHARE CARD & BUTTONS
      ────────────────────────────────────────────────────────── */}
      <section className="animate-stagger-5 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-center justify-between">
        
        {/* The DOM element we capture via html2canvas */}
        <div className="w-full max-w-sm rounded-[2rem] p-1 bg-gradient-to-b from-indigo-500/40 to-slate-800" ref={shareCardRef}>
          <div className="bg-slate-50 dark:bg-slate-950 rounded-[1.8rem] p-6 text-center space-y-4 relative overflow-hidden">
            {/* BG Decals */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="inline-flex px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
              AI Interview Report
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100">{interviewData?.jobPosition}</h3>
            
            <div className="mx-auto w-24 h-24 rounded-full border-4 flex items-center justify-center font-black text-3xl shadow-lg mt-2 mb-2" 
                 style={{ borderColor: grade.letter === 'A' ? '#10b981' : grade.letter === 'B' ? '#6366f1' : grade.letter === 'C' ? '#f59e0b' : '#ef4444', 
                          color: grade.letter === 'A' ? '#10b981' : grade.letter === 'B' ? '#6366f1' : grade.letter === 'C' ? '#f59e0b' : '#ef4444' }}>
              {grade.letter}
            </div>

            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest pb-2 border-b border-slate-200 dark:border-slate-800 w-3/4 mx-auto">
              Overall Rating: {avgRating.toFixed(1)}/10
            </p>

            <div className="grid grid-cols-2 gap-2 text-left pt-2">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Clarity</div>
                <div className="text-lg font-bold text-sky-400">{avgClarity.toFixed(1)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Depth</div>
                <div className="text-lg font-bold text-purple-400">{avgDepth.toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-sm shrink-0">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isDownloading ? <Activity className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isDownloading ? "Generating Image..." : "Download Report"}
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors shadow-lg"
          >
            <RotateCcw className="w-4 h-4" /> Practice Again
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> New Interview
          </button>
        </div>
        
      </section>

    </div>
  );
}