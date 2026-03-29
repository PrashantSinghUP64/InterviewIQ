"use client";
import { Volume2, Hash, Brain, Loader2 } from "lucide-react";
import React from "react";

/* ── Adaptive badge colour map ────────────────────────────── */
const BADGE_STYLES = {
  advanced: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  followup: "text-amber-400  bg-amber-500/15  border-amber-500/30",
  simplify: "text-blue-400   bg-blue-500/15   border-blue-500/30",
};

/* ── Keyframes (injected once via <style>) ─────────────────── */
const KEYFRAMES = `
  @keyframes fadeUpQ {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes bounceDelay0 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
`;

const QuestionsSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  onQuestionSelect,
  isGenerating   = false,
  adaptiveBadge  = null,
  totalQuestions = 5,
}) => {
  const textToSpeech = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    } else {
      alert("Sorry, your browser does not support text to speech");
    }
  };

  if (!mockInterviewQuestion) return null;

  return (
    <div className="flex flex-col gap-5 h-full">
      <style>{KEYFRAMES}</style>

      {/* ── Question number pills ─────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const exists     = index < mockInterviewQuestion.length;
          const isActive   = activeQuestionIndex === index;
          const isAnswered = index < activeQuestionIndex;
          const isPending  = index > activeQuestionIndex;

          return (
            <button
              key={index}
              id={`question-tab-${index + 1}`}
              onClick={() => exists && !isGenerating && onQuestionSelect?.(index)}
              disabled={!exists || isGenerating}
              title={!exists ? "Will be generated adaptively" : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : isAnswered && exists
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400"
                  : exists && !isPending
                  ? "bg-slate-800 text-slate-400 border border-slate-700 hover:border-indigo-500/40 hover:text-indigo-300"
                  : "bg-slate-900/40 text-slate-700 border border-dashed border-slate-800 cursor-not-allowed"
              }`}
            >
              Q{index + 1}
            </button>
          );
        })}
      </div>

      {/* ── Question card: GENERATING state ──────────── */}
      {isGenerating ? (
        <div
          key="generating"
          className="flex-1 rounded-2xl bg-slate-900/60 border border-indigo-500/40 p-6 flex flex-col items-center justify-center gap-5 min-h-[220px]"
          style={{ animation: "fadeUpQ 0.3s ease forwards" }}
        >
          {/* Spinner */}
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>

          {/* Text */}
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-indigo-300 animate-pulse">
              Generating next question based on your answer...
            </p>
            <p className="text-xs text-slate-500">
              AI is adapting the interview to your performance
            </p>
          </div>

          {/* Bouncing dots */}
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-500/70 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ── Question card: NORMAL state ──────────────── */
        <div
          key={`q-${activeQuestionIndex}`}
          className="flex-1 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col gap-5"
          style={{ animation: "fadeUpQ 0.35s ease forwards" }}
        >
          {/* Header row: number badge + adaptive badge + TTS */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Q number */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Question {activeQuestionIndex + 1}
                </span>
              </div>

              {/* Adaptive badge */}
              {adaptiveBadge && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                    BADGE_STYLES[adaptiveBadge.type] ?? BADGE_STYLES.followup
                  }`}
                >
                  <Brain className="w-3 h-3" />
                  {adaptiveBadge.label}
                </div>
              )}

              {/* "Adaptive" label for any AI-generated question (no score-based badge yet, e.g. first load) */}
              {!adaptiveBadge && mockInterviewQuestion[activeQuestionIndex]?.adaptive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold text-indigo-400 bg-indigo-500/10 border-indigo-500/30">
                  <Brain className="w-3 h-3" />
                  Adaptive
                </div>
              )}
            </div>

            {/* TTS button */}
            <button
              id="tts-btn"
              onClick={() =>
                textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-slate-700 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-600/5 transition-all duration-200 shrink-0"
              title="Read question aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen
            </button>
          </div>

          {/* Question text */}
          <p className="text-slate-100 text-lg md:text-xl font-medium leading-relaxed flex-1">
            {mockInterviewQuestion[activeQuestionIndex]?.question}
          </p>

          {/* Tip box */}
          <div className="rounded-xl bg-indigo-600/5 border border-indigo-500/20 p-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-indigo-400 font-semibold">Tip: </span>
              Take a moment to structure your answer. Enable your microphone and speak
              clearly — our AI will transcribe and evaluate your response in real time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsSection;
