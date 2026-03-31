"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { db } from "@/utils/db";
import { eq } from "drizzle-orm";
import { MockInterview } from "@/utils/schema";
import { Trash2, RotateCcw, BarChart2, Briefcase, CalendarDays, Star, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/** Returns score badge config based on rating (0–10). */
const getScoreBadge = (rating) => {
  const n = parseFloat(rating);
  if (isNaN(n)) return null;
  if (n >= 7.5) return { label: `${n}/10`, classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
  if (n >= 5)   return { label: `${n}/10`, classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' };
  return           { label: `${n}/10`, classes: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' };
};

const InterviewItemCard = ({ interview }) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onStart = () => router.push(`/dashboard/interview/${interview?.mockId}`);
  const onFeedbackPress = () => router.push(`/dashboard/interview/${interview?.mockId}/feedback`);

  const onDelete = async () => {
    setDeleting(true);
    try {
      await db.delete(MockInterview).where(eq(MockInterview.mockId, interview?.mockId));
      setIsDialogOpen(false);
      toast.success("Interview deleted");
      router.refresh();
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    } finally {
      setDeleting(false);
    }
  };

  const scoreBadge = getScoreBadge(interview?.rating);

  return (
    <>
      {/* ── Card ─────────────────────────────────────── */}
      <div className="group relative flex flex-col gap-4 p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
        {/* Delete button */}
        <button
          id={`delete-interview-${interview?.mockId}`}
          onClick={() => setIsDialogOpen(true)}
          aria-label="Delete interview"
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Top row: role + badge */}
        <div className="flex items-start justify-between pr-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 shrink-0">
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 leading-tight line-clamp-1">
                {interview?.jobPosition}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {interview?.jobExperience} yr{parseInt(interview?.jobExperience) !== 1 ? 's' : ''} experience
              </p>
            </div>
          </div>

          {scoreBadge && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${scoreBadge.classes}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${scoreBadge.dot}`} />
              <Star className="w-3 h-3" />
              {scoreBadge.label}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="w-3.5 h-3.5" />
          {interview?.createdAt}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            id={`feedback-btn-${interview?.mockId}`}
            onClick={onFeedbackPress}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:border-slate-600 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100/60 dark:bg-slate-800/60 transition-all duration-200"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Feedback
          </button>
          <button
            id={`retry-btn-${interview?.mockId}`}
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-md shadow-indigo-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ─────────────────── */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Interview?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              This will permanently remove{' '}
              <span className="text-slate-800 dark:text-slate-200 font-medium">"{interview?.jobPosition}"</span> and all its feedback. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDialogOpen(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:border-slate-600 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-all duration-200 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewItemCard;