"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Loader2, ChevronLeft, Flag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { callGeminiWithRetry } from "@/utils/GeminiAIModal";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════════════════════ */
const MAX_QUESTIONS = 5;

const getScoreHint = (score) => {
  if (score >= 7) return "The candidate answered well. Ask a more advanced follow-up on a different aspect of the role.";
  if (score >= 4) return "The candidate gave a weak answer. Ask a follow-up that probes the same concept more specifically.";
  return "The candidate struggled. Ask an easier related question to help them demonstrate basic knowledge.";
};

const getAdaptiveBadge = (score) => {
  if (score >= 7) return { type: "advanced", label: "Advanced ↑" };
  if (score >= 4) return { type: "followup", label: "Follow-up ↻" };
  return { type: "simplify", label: "Simplified ↓" };
};

const generateAdaptiveQuestion = async (jobPosition, jobDesc, prevQuestion, userAnswer, score) => {
  const prompt = `You are an expert technical interviewer for ${jobPosition} role requiring ${jobDesc} skills.
Previous question: ${prevQuestion}
Candidate answer: ${userAnswer}
Score: ${score}/10
${getScoreHint(score)}
Generate the next interview question. Return ONLY the question text, nothing else. Max 2 sentences.`;

  const result = await callGeminiWithRetry(prompt);
  return result.response.text().trim().replace(/^["'`]|["'`]$/g, "");
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const StartInterview = () => {
  const params     = useParams();
  const interviewId = params?.interviewId;

  const [interViewData, setInterviewData]           = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isLoading, setIsLoading]                   = useState(true);
  const [isGenerating, setIsGenerating]             = useState(false);
  const [adaptiveBadges, setAdaptiveBadges]         = useState({}); // { [idx]: badge }

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
      // Only seed Q1 from pre-generated list; Q2–Q5 will be adaptive
      setMockInterviewQuestion([parsed[0]].filter(Boolean));
      setInterviewData(result[0]);
    } catch (err) {
      console.error("Failed to fetch interview details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Called by RecordAnswerSection after DB save + scores are ready ── */
  const handleAnswerSave = async ({ scoreCard, userAns }) => {
    const currentIdx      = activeQuestionIndex;
    const currentQuestion = mockInterviewQuestion[currentIdx]?.question || "";

    // Don't generate past the maximum
    if (currentIdx >= MAX_QUESTIONS - 1) return;

    // Compute avg score from the three dimensions
    const avg = scoreCard
      ? Math.round(((scoreCard.clarity ?? 5) + (scoreCard.relevance ?? 5) + (scoreCard.depth ?? 5)) / 3)
      : 5;

    const badge   = getAdaptiveBadge(avg);
    const nextIdx = currentIdx + 1;

    setIsGenerating(true);
    try {
      const nextQ = await generateAdaptiveQuestion(
        interViewData?.jobPosition ?? "the role",
        interViewData?.jobDesc    ?? "required skills",
        currentQuestion,
        userAns ?? "",
        avg
      );

      setMockInterviewQuestion((prev) => {
        const updated = [...prev];
        updated[nextIdx] = {
          question: nextQ,
          answer:   "AI will evaluate your spoken response in real-time.",
          adaptive: true,
        };
        return updated;
      });

      setAdaptiveBadges((prev) => ({ ...prev, [nextIdx]: badge }));
      setActiveQuestionIndex(nextIdx);
    } catch (err) {
      console.error("Adaptive question generation failed:", err);
      // fallback: just advance if a pre-generated question exists
      if (mockInterviewQuestion[nextIdx]) setActiveQuestionIndex(nextIdx);
    } finally {
      setIsGenerating(false);
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
          <p className="text-slate-300 font-medium">Preparing your interview...</p>
          <p className="text-slate-500 text-sm mt-1">Loading questions</p>
        </div>
      </div>
    );
  }

  if (!mockInterviewQuestion.length) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 font-medium">No interview questions found.</p>
          <Link href="/dashboard" className="text-indigo-400 text-sm mt-2 block hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isFirst = activeQuestionIndex === 0;
  const isLast  = activeQuestionIndex >= MAX_QUESTIONS - 1;

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
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
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
            isGenerating={isGenerating}
            adaptiveBadge={adaptiveBadges[activeQuestionIndex] ?? null}
            totalQuestions={MAX_QUESTIONS}
          />
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <div className="flex justify-between items-center gap-4 mt-6 pt-5 border-t border-slate-800">
        {/* Previous */}
        <button
          onClick={() => setActiveQuestionIndex((p) => p - 1)}
          disabled={isFirst || isGenerating}
          id="prev-question-btn"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/60 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Next / End */}
        {!isLast ? (
          /* Hint: progression driven by "Save Answer" in RecordAnswerSection */
          <p className="text-xs text-slate-600 italic">
            Save your answer to continue →
          </p>
        ) : (
          <Link href={`/dashboard/interview/${interViewData?.mockId}/feedback`}>
            <button
              id="end-interview-btn"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              <Flag className="w-4 h-4" />
              End &amp; View Results
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
