"use client";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Loader2, ChevronLeft, Flag } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const StartInterview = () => {
  const params     = useParams();
  const router     = useRouter();
  const { user }   = useUser();
  const interviewId = params?.interviewId;

  const [interViewData, setInterviewData]                 = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex]     = useState(0);
  const [isLoading, setIsLoading]                         = useState(true);
  
  // Track answers locally
  const [userAnswersData, setUserAnswersData] = useState([]); // [{ question, userAns, attentionScore, confidenceScore }]
  const [isEvaluating, setIsEvaluating]       = useState(false);

  useEffect(() => {
    if (interviewId) GetInterviewDetails();
  }, [interviewId]);

  const GetInterviewDetails = async () => {
    try {
      setIsLoading(true);
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId));
        
      const parsed = JSON.parse(result[0]?.jsonMockResp || "[]");
      // Load ALL questions at once
      setMockInterviewQuestion(parsed);
      setInterviewData(result[0]);
    } catch (err) {
      console.error("Failed to fetch interview details:", err);
      toast.error("Failed to load interview");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Handles local saving from RecordAnswerSection ── */
  const handleAnswerSave = (answerData) => {
    setUserAnswersData(prev => {
      const newArr = [...prev];
      newArr[activeQuestionIndex] = answerData;
      return newArr;
    });
    
    // Auto-advance if not the last question
    if (activeQuestionIndex < mockInterviewQuestion.length - 1) {
      setTimeout(() => setActiveQuestionIndex(p => p + 1), 700);
    }
  };

  /* ── Batch Evaluation & Database Save ── */
  const submitAndEvaluateAll = async () => {
    if (userAnswersData.length === 0) {
      toast.error("You need to answer at least one question!");
      return;
    }

    setIsEvaluating(true);
    let evaluationResults = [];

    try {
      // 1. Prepare bulk prompt for Groq
      const payloadString = userAnswersData.map((data, idx) => `
        Q${idx+1}: ${data.question}
        User Answer Q${idx+1}: ${data.userAns}
      `).join("\n");

      // We explicitly request a JSON array mapping to our inputs
      const prompt = `You are an expert technical interviewer evaluating a candidate for ${interViewData?.jobPosition} at ${interViewData?.companyName || 'a company'}.
      I am providing ${userAnswersData.length} question-answer pairs down below.
      Evaluate EACH answer and return ONLY a JSON array of objects. Do not add markdown blocks like \`\`\`json.
      Format:
      [
        {
          "rating": <overall number 0-10>,
          "feedback": "<one short sentence feedback>",
          "clarity": <number 0-10>,
          "relevance": <number 0-10>,
          "depth": <number 0-10>
        },
        ...
      ]

      Here are the answers:
      ${payloadString}`;

      const result = await chatSession.generateContent(prompt);
      const raw    = await result.response.text();
      const match  = raw.match(/\[[\s\S]*\]/);
      
      if (!match) throw new Error("Could not parse AI evaluation JSON array.");
      
      evaluationResults = JSON.parse(match[0]);

      // 2. Perform Batch DB Insert
      if (evaluationResults.length !== userAnswersData.length) {
         console.warn("AI returned wrong number of evaluations, mapping carefully...");
      }

      const dbInserts = userAnswersData.map((data, idx) => {
        const evalData = evaluationResults[idx] || { rating: 5, feedback: "No specific feedback generated.", clarity: 5, relevance: 5, depth: 5 };
        return {
          mockIdRef:  interViewData?.mockId,
          question:   data.question,
          correctAns: mockInterviewQuestion[idx]?.answer || "N/A",
          userAns:    data.userAns,
          feedback:   evalData.feedback,
          rating:     String(evalData.rating),
          clarityRating: String(evalData.clarity),
          relevanceRating: String(evalData.relevance),
          depthRating: String(evalData.depth),
          attentionScore: data.attentionScore !== null ? String(data.attentionScore) : null,
          confidenceScore: data.confidenceScore !== null ? String(data.confidenceScore) : null,
          fillerWordCount: data.fillerWordCount !== undefined && data.fillerWordCount !== null ? String(data.fillerWordCount) : null,
          duration: data.duration !== undefined && data.duration !== null ? String(data.duration) : null,
          userEmail:  user?.primaryEmailAddress?.emailAddress,
          createdAt:  moment().format("DD-MM-YYYY"),
        };
      });

      await db.insert(UserAnswer).values(dbInserts);
      
      toast.success("Interview completed! Generating report...");
      router.push(`/dashboard/interview/${interViewData?.mockId}/feedback`);

    } catch (err) {
      console.error("Batch evaluation failed:", err);
      toast.error("Failed to evaluate completely. Please try again.");
      setIsEvaluating(false);
    }
  };


  /* ── Loading screen ── */
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
        <div className="text-center">
          <p className="text-slate-700 dark:text-slate-300 font-medium">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  // Master Evaluation Screen overlay
  if (isEvaluating) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-6 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
          <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-500/50 shadow-2xl shadow-indigo-500/20 relative z-10">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          </div>
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI is evaluating your answers...</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">We're analyzing everything you said, extracting metrics on clarity, depth, and relevance to generate your final report card.</p>
        </div>
        <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
          <div className="w-full h-full bg-indigo-500 rounded-full animate-[progress_2s_ease-in-out_infinite] origin-left" style={{ animation: "progress 2s infinite" }}/>
        </div>
      </div>
    );
  }

  if (!mockInterviewQuestion.length) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 font-medium">No interview questions found.</p>
        </div>
      </div>
    );
  }

  const MAX_QUESTIONS = mockInterviewQuestion.length;
  const isFirst = activeQuestionIndex === 0;
  const isLast  = activeQuestionIndex >= MAX_QUESTIONS - 1;
  const isCurrentAnswered = userAnswersData[activeQuestionIndex] !== undefined;

  return (
    <div className="py-4">
      {/* ── Progress bar ───────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Question {activeQuestionIndex + 1} of {MAX_QUESTIONS}
          </p>
          <p className="text-xs text-slate-500">
            {Math.round((activeQuestionIndex / MAX_QUESTIONS) * 100)}% complete
          </p>
        </div>
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(activeQuestionIndex / MAX_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Main split layout ──────────────────────────────── */}
      <div className="grid grid-cols-5 gap-5">
        {/* Left 40% — Camera / Record */}
        <div className="col-span-5 md:col-span-2">
          <RecordAnswerSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interViewData}
            onAnswerSave={handleAnswerSave}
          />
        </div>

        {/* Right 60% — Questions */}
        <div className="col-span-5 md:col-span-3">
          <QuestionsSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            onQuestionSelect={setActiveQuestionIndex}
            totalQuestions={MAX_QUESTIONS}
          />
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <div className="flex justify-between items-center gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        {/* Previous */}
        <button
          onClick={() => setActiveQuestionIndex((p) => p - 1)}
          disabled={isFirst}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:border-slate-600 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100/60 dark:bg-slate-800/60 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Next / End */}
        {!isLast ? (
          <button
            onClick={() => setActiveQuestionIndex((p) => p + 1)}
            disabled={!isCurrentAnswered}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCurrentAnswered ? "Next Question" : "Record Answer to Continue"}
          </button>
        ) : (
          <button
            onClick={submitAndEvaluateAll}
            disabled={!isCurrentAnswered || userAnswersData.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Flag className="w-4 h-4" />
            Submit &amp; Evaluate All
          </button>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
