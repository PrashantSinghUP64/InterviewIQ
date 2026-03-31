"use client";
import { Volume2, Hash, Brain, Loader2 } from "lucide-react";
import React from "react";

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

  React.useEffect(() => {
    if (mockInterviewQuestion && mockInterviewQuestion[activeQuestionIndex]) {
      // Auto-speak the question
      textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question);
    }
  }, [activeQuestionIndex, mockInterviewQuestion]);

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
              onClick={() => exists && onQuestionSelect?.(index)}
              disabled={!exists}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : isAnswered && exists
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400"
                  : exists && !isPending
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-indigo-500/40 hover:text-indigo-300"
                  : "bg-white/40 dark:bg-slate-900/40 text-slate-700 border border-dashed border-slate-200 dark:border-slate-800 cursor-not-allowed"
              }`}
            >
              Q{index + 1}
            </button>
          );
        })}
      </div>

        {/* ── Question card: NORMAL state ──────────────── */}
        <div
          key={`q-${activeQuestionIndex}`}
          className="flex-1 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-5"
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
            </div>

            {/* TTS button */}
            <button
              id="tts-btn"
              onClick={() =>
                textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-600/5 transition-all duration-200 shrink-0"
              title="Read question aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen
            </button>
          </div>

          {/* Question text */}
          <p className="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-medium leading-relaxed flex-1">
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
    </div>
  );
};

export default QuestionsSection;
