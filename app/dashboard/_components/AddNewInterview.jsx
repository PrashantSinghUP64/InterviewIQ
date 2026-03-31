"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { chatSession } from '@/utils/GeminiAIModal';
import { LoaderCircle, Plus, Briefcase, Code2, Clock, ChevronRight, ChevronLeft, Sparkles, Building2, UserRoundCheck } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useRouter } from 'next/navigation';

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [interviewRound, setInterviewRound] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [difficulty, setDifficulty] = useState('Medium');
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const pending = localStorage.getItem("pendingCompanyInterview");
    if (pending) {
      setCompanyName(pending);
      setOpenDialog(true);
      localStorage.removeItem("pendingCompanyInterview");
    }
  }, []);

  const resetForm = () => {
    setJobPosition('');
    setCompanyName('');
    setInterviewRound('');
    setJobDesc('');
    setJobExperience('');
    setDifficulty('Medium');
    setStep(1);
  };

  const handleDialogClose = () => {
    if (!loading) {
      setOpenDialog(false);
      resetForm();
    }
  };

  const canProceedStep1 = jobPosition.trim().length > 0;
  const canProceedStep2 = jobDesc.trim().length > 0 && jobExperience.toString().trim().length > 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canProceedStep2) return;
    setLoading(true);

    try {
      const prompt = `
        Job Position: ${jobPosition}
        Company Name: ${companyName || 'Not specified'}
        Interview Round: ${interviewRound || 'General'}
        Job Description: ${jobDesc}
        Years of Experience: ${jobExperience}
        Difficulty Level: ${difficulty}
        
        Based on the above information, create ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5} interview questions with their corresponding answers in JSON format. 
        Tailor the difficulty, tone, and focus based on the specific Company values and Interview Round (if provided).
        Difficulty guidance:
        - Easy: Basic conceptual questions, straightforward answers expected.
        - Medium: Mix of theoretical and practical, some follow-ups.
        - Hard: Deep technical or situational questions, expect multi-layered answers, include tricky edge cases and follow-up sub-questions within the main question text.
        
        Please structure the response as an array of objects with the following format:
        [
          {
            "question": "Your interview question here",
            "answer": "A comprehensive answer that a qualified candidate should provide"
          }
        ]
        
        Make sure the questions are relevant to the job position and experience level mentioned.
      `;

      const result = await chatSession.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJsonResponse = (responseText || "")
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanJsonResponse);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        throw new Error("Failed to parse AI response. Please try again.");
      }

      if (parsedResponse && Array.isArray(parsedResponse)) {
        const mockId = uuidv4();
        const dbResponse = await db.insert(MockInterview).values({
          mockId,
          jsonMockResp: cleanJsonResponse,
          jobPosition,
          jobDesc,
          jobExperience,
          companyName,
          interviewRound,
          createdBy: user?.primaryEmailAddress?.emailAddress || 'anonymous',
          createdAt: moment().format('DD-MM-YYYY'),
        }).returning({ mockId: MockInterview.mockId });

        setOpenDialog(false);
        resetForm();

        if (dbResponse && dbResponse.length > 0) {
          router.push('/dashboard/interview/' + dbResponse[0].mockId);
        }
      } else {
        throw new Error("Invalid response format from AI");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      if (error?.message?.includes("429")) {
        alert(`⚠️ API Rate Limit / Quota Error: ${error?.message || "Too many requests"}`);
      } else if (error?.message?.includes("JSON")) {
        alert(`❌ Failed to process AI response: ${error?.message}`);
      } else {
        alert(`❌ Something went wrong: ${error?.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Trigger Card ─────────────────────────────── */}
      <div
        id="add-new-interview-card"
        onClick={() => setOpenDialog(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenDialog(true); }}
        className="group relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500/60 bg-white/40 dark:bg-slate-900/40 hover:bg-indigo-600/5 transition-all duration-300 cursor-pointer min-h-[160px] hover:scale-[1.02]"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40 transition-all duration-300">
          <Plus className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-400 transition-colors duration-300" />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-slate-100 transition-colors duration-200">
            New Interview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Set up a mock session</p>
        </div>
      </div>

      {/* ── Dialog ───────────────────────────────────── */}
      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border border-slate-300/60 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 shadow-2xl shadow-black/60 p-0 overflow-hidden">
          {/* Step indicator bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors duration-200 ${
                  step === s
                    ? 'text-indigo-300 border-b-2 border-indigo-500'
                    : step > s
                    ? 'text-slate-600 dark:text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  step > s
                    ? 'bg-indigo-600 text-white'
                    : step === s
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border border-slate-300 dark:border-slate-700'
                }`}>
                  {s}
                </span>
                {s === 1 ? 'Job Role' : 'Details'}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <DialogHeader className="pb-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  Step {step} of 2
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {step === 1 ? 'What role are you preparing for?' : 'Tell us more about the role'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                {step === 1
                  ? 'Enter the job position you want to practice interviewing for.'
                  : 'Add tech stack and experience so AI can tailor the questions.'}
              </DialogDescription>
            </DialogHeader>

            {/* ── Step 1 ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5" />
                    Job Role / Position *
                  </label>
                  <input
                    id="jobPosition"
                    type="text"
                    placeholder="e.g. Software Engineer, Product Manager..."
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200 text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5" />
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google, Amazon..."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <UserRoundCheck className="w-3.5 h-3.5" />
                      Round (Optional)
                    </label>
                    <select
                      value={interviewRound}
                      onChange={(e) => setInterviewRound(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200 text-sm appearance-none"
                    >
                      <option value="" className="bg-white dark:bg-slate-900">General / Any</option>
                      <option value="Technical" className="bg-white dark:bg-slate-900">Technical / Coding</option>
                      <option value="System Design" className="bg-white dark:bg-slate-900">System Design</option>
                      <option value="HR / Cultural Fit" className="bg-white dark:bg-slate-900">HR / Cultural Fit</option>
                      <option value="Managerial" className="bg-white dark:bg-slate-900">Managerial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <Code2 className="w-3.5 h-3.5" />
                    Tech Stack / Description
                  </label>
                  <textarea
                    id="jobDesc"
                    placeholder="e.g. React, Node.js, TypeScript, AWS, REST APIs..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    required
                    disabled={loading}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200 text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    Years of Experience
                  </label>
                  <input
                    id="jobExperience"
                    type="number"
                    placeholder="e.g. 3"
                    value={jobExperience}
                    onChange={(e) => setJobExperience(e.target.value)}
                    required
                    disabled={loading}
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 transition-all duration-200 text-sm"
                  />
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Difficulty Level
                  </label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          difficulty === level
                            ? level === 'Easy'
                              ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-400'
                              : level === 'Medium'
                              ? 'bg-amber-600/20 border-amber-500/60 text-amber-400'
                              : 'bg-red-600/20 border-red-500/60 text-red-400'
                            : 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {level === 'Easy' ? '🟢' : level === 'Medium' ? '🟡' : '🔴'} {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {difficulty === 'Easy' ? 'Basic conceptual questions, straightforward answers.' : difficulty === 'Medium' ? 'Mix of theory and practical, some follow-ups.' : 'Deep technical questions, edge cases, multi-layered answers.'}
                  </p>
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={step === 1 ? handleDialogClose : () => setStep(1)}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:border-slate-600 transition-all duration-200 disabled:opacity-40"
              >
                {step === 1 ? 'Cancel' : (
                  <>
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </>
                )}
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  id="step1-next-btn"
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !canProceedStep2}
                  id="generate-interview-btn"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 min-w-[150px] justify-center"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Questions
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;