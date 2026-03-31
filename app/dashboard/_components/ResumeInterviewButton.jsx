"use client";

import React, { useState } from "react";
import { FileText, Sparkles, X, Loader2, Copy, Check, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { chatSession } from "@/utils/GeminiAIModal";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const ResumeInterviewButton = () => {
  const [open, setOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleGenerate = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const prompt = `You are an expert technical interviewer. A candidate has shared their resume. 
Analyze the resume and generate 5 targeted interview questions that probe their specific experiences, projects, and technical decisions mentioned.

RESUME:
${resumeText.substring(0, 3000)}

Generate questions that:
- Reference specific technologies, projects, or experiences from their resume
- Ask them to explain their technical decisions and trade-offs
- Include situational questions about real challenges they likely faced
- Probe leadership/impact if mentioned

Return ONLY a JSON array with this format (no markdown, no extra text):
[
  {
    "question": "Specific question referencing their resume",
    "answer": "What a strong candidate should answer, referencing the resume context"
  }
]`;

      const result = await chatSession.generateContent(prompt);
      const raw = await result.response.text();
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No valid JSON array in response");

      const parsedQuestions = JSON.parse(match[0]);

      const mockId = uuidv4();
      await db.insert(MockInterview).values({
        mockId,
        jsonMockResp: JSON.stringify(parsedQuestions),
        jobPosition: "Resume-Based Interview",
        jobDesc: resumeText.substring(0, 200) + "...",
        jobExperience: "0",
        createdBy: user?.primaryEmailAddress?.emailAddress || "anonymous",
        createdAt: moment().format("DD-MM-YYYY"),
      }).returning({ mockId: MockInterview.mockId });

      setOpen(false);
      setResumeText("");
      router.push("/dashboard/interview/" + mockId);
    } catch (err) {
      console.error(err);
      alert("Failed to generate interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Card */}
      <div
        id="resume-interview-card"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
        className="group relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 bg-white/40 dark:bg-slate-900/40 hover:bg-emerald-600/5 transition-all duration-300 cursor-pointer min-h-[160px] hover:scale-[1.02]"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover:bg-emerald-600/20 group-hover:border-emerald-500/40 transition-all duration-300">
          <FileText className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-emerald-400 transition-colors duration-300" />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200">
            Resume Interview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Questions from your resume</p>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v); }}>
        <DialogContent className="max-w-xl bg-white dark:bg-slate-900 border border-slate-300/60 dark:border-slate-700/60 shadow-2xl shadow-black/60 p-0 overflow-hidden">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Resume-Based Mode</span>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Generate Questions From Your Resume
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Paste your resume text below. AI will generate targeted questions specifically probing your listed experiences, projects, and skills.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <textarea
                placeholder={`Paste your full resume text here...\n\ne.g.\n• Led a team of 4 engineers to build a real-time data pipeline using Apache Kafka and AWS Lambda...\n• Developed a React + TypeScript dashboard used by 50k+ daily active users...`}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={loading}
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 transition-all duration-200 text-sm resize-none font-mono"
              />
              <p className="text-[10px] text-slate-500">
                {resumeText.length} characters · Tip: Include your project details, tech stack, and achievements for the most targeted questions.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || resumeText.trim().length < 50}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Questions...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate My Interview</>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeInterviewButton;
