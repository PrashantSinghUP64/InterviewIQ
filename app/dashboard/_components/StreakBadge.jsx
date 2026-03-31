"use client";

import React, { useState, useEffect } from "react";
import { Flame, X, Trophy, Star } from "lucide-react";

const MILESTONES = [3, 7, 14, 30];

const StreakBadge = () => {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("iq_streak_date");
    const storedStreak = parseInt(localStorage.getItem("iq_streak_count") || "0", 10);
    const storedRecord = parseInt(localStorage.getItem("iq_streak_best") || "0", 10);

    if (storedDate === today) {
      // Already visited today — keep current streak
      setStreak(storedStreak);
      setBestStreak(storedRecord);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak;
      if (storedDate === yesterdayStr) {
        // Consecutive day — increment
        newStreak = storedStreak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      localStorage.setItem("iq_streak_date", today);
      localStorage.setItem("iq_streak_count", newStreak.toString());

      if (newStreak > storedRecord) {
        localStorage.setItem("iq_streak_best", newStreak.toString());
        setIsNewRecord(true);
        setBestStreak(newStreak);
      } else {
        setBestStreak(storedRecord);
      }
      setStreak(newStreak);
    }
  }, []);
  const nextMilestone = MILESTONES.find(m => m > streak) || null;
  const daysToNext = nextMilestone ? nextMilestone - streak : 0;

  const getFlameColor = () => {
    if (streak >= 30) return "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]";
    if (streak >= 14) return "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
    if (streak >= 7)  return "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]";
    if (streak >= 3)  return "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]";
    return "text-slate-500";
  };

  const getBadgeLabel = () => {
    if (streak >= 30) return { label: "🏆 Legend", cls: "border-purple-500/50 bg-purple-500/10 text-purple-300" };
    if (streak >= 14) return { label: "⚡ On Fire", cls: "border-red-500/50 bg-red-500/10 text-red-300" };
    if (streak >= 7)  return { label: "🔥 Week Warrior", cls: "border-orange-500/40 bg-orange-500/10 text-orange-400" };
    if (streak >= 3)  return { label: "✨ Building Habit", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" };
    return { label: "🌱 Just Started", cls: "border-slate-500/40 bg-slate-500/10 text-slate-400" };
  };

  const badge = getBadgeLabel();

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        id="streak-badge-btn"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 ${
          streak >= 3
            ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
            : "border-slate-600/40 bg-slate-800/40 hover:bg-slate-700/40"
        }`}
        title={`${streak} day streak`}
      >
        <Flame className={`w-4 h-4 transition-all ${getFlameColor()} ${streak >= 3 ? "animate-pulse" : ""}`} />
        <span className={`text-xs font-bold tabular-nums ${streak >= 3 ? "text-amber-300" : "text-slate-400"}`}>
          {streak}
        </span>
      </button>

      {/* Dropdown Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          
          <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="relative px-5 py-4 bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-b border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setShowPanel(false)}
                className="absolute right-3 top-3 p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Flame className={`w-6 h-6 ${getFlameColor()}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">{streak} <span className="text-sm font-medium text-slate-500">days</span></p>
                  <p className="text-xs text-slate-500 font-medium">Current Streak</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* New Record Banner */}
              {isNewRecord && streak > 1 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">New Personal Record! 🎉</span>
                </div>
              )}

              {/* Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badge.cls}`}>
                {badge.label}
              </div>

              {/* Milestone Progress */}
              {nextMilestone && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Next milestone: {nextMilestone} days</span>
                    <span className="text-xs text-slate-500">{daysToNext} day{daysToNext !== 1 ? "s" : ""} to go</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                      style={{ width: `${Math.min((streak / nextMilestone) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Best Streak */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Best Streak</span>
                </div>
                <span className="text-sm font-black text-indigo-400 tabular-nums">{bestStreak} days</span>
              </div>

              {/* Motivation Message */}
              <p className="text-xs text-slate-500 leading-relaxed text-center pb-1">
                {streak === 0
                  ? "Start today to build your streak! 💪"
                  : streak < 3
                  ? "Keep going! {3 - streak} more day{3 - streak !== 1 ? 's' : ''} to unlock your first badge."
                  : streak < 7
                  ? `Amazing! ${7 - streak} more day${7 - streak !== 1 ? 's' : ''} to unlock Week Warrior! 🔥`
                  : streak >= 7
                  ? "You're crushing it! Consistency is your superpower. 🚀"
                  : ""}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StreakBadge;
