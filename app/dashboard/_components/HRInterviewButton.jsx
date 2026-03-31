"use client";

import React, { useState } from "react";
import { Users, Sparkles, Loader2, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { chatSession } from "@/utils/GeminiAIModal";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const HR_COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Flipkart", "Infosys", "TCS", "Zomato", "Swiggy", "Uber", "Other"];

const HRInterviewButton = () => {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `You are a senior HR interviewer at ${company || "a top tech company"}. 
Generate 5 pure behavioural interview questions for a ${experience} level candidate applying to ${company || "a top tech company"}.

Requirements:
- Focus ONLY on behavioural/situational questions (NO technical or coding questions)
- Questions must be relevant to the company's culture, values, and mission
- Include classic HR questions: motivation, teamwork, conflict, leadership, failure, growth
- Vary the difficulty based on experience: "${experience}"
- For freshers: simpler situational questions about college/internships
- For experienced: deeper leadership, impact, and decision-making questions
- Make the model answer a guide for what a STAR-format response should cover

Return ONLY a JSON array (no markdown, no extra text):
[
  {
    "question": "Behavioural question tailored to company",
    "answer": "Strong STAR-format answer guide covering: Situation, Task, Action, Result"
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
        jobPosition: `HR Round${company ? ` – ${company}` : ""}`,
        jobDesc: `Behavioural HR round focused on culture fit and soft skills`,
        jobExperience: experience,
        createdBy: user?.primaryEmailAddress?.emailAddress || "anonymous",
        createdAt: moment().format("DD-MM-YYYY"),
      }).returning({ mockId: MockInterview.mockId });

      setOpen(false);
      router.push("/dashboard/interview/" + mockId);
    } catch (err) {
      console.error(err);
      alert("Failed to generate HR interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Card */}
      <div
        id="hr-interview-card"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
        className="group relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500/60 bg-white/40 dark:bg-slate-900/40 hover:bg-purple-600/5 transition-all duration-300 cursor-pointer min-h-[160px] hover:scale-[1.02]"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 group-hover:bg-purple-600/20 group-hover:border-purple-500/40 transition-all duration-300">
          <Users className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-purple-400 transition-colors duration-300" />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200">
            HR Mock Round
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Behavioural & culture fit</p>
        </div>
        {/* Badge */}
        <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 uppercase tracking-wider">
          Most skipped
        </span>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v); }}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-300/60 dark:border-slate-700/60 shadow-2xl shadow-black/60 p-0 overflow-hidden">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">HR Behavioural Mode</span>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Mock HR Round
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm leading-relaxed">
                5 pure behavioural questions tailored to company culture. No DSA, no system design — just the questions 90% of students fail to prepare for.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Company Selector */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" /> Target Company (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {HR_COMPANIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCompany(company === c ? "" : c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                        company === c
                          ? "bg-purple-600/20 border-purple-500/60 text-purple-300"
                          : "bg-slate-100/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-500 hover:border-purple-500/40 hover:text-purple-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Experience Level
                </label>
                <div className="flex gap-2">
                  {["Fresher", "1-3 Years", "3-6 Years", "6+ Years"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                        experience === lvl
                          ? "bg-purple-600/20 border-purple-500/60 text-purple-300"
                          : "bg-slate-100/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-500"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* What to expect */}
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <p className="text-xs font-bold text-purple-400 mb-1.5">What to expect:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Tell me about yourself &amp; your background</li>
                  <li>• Why {company || "this company"}? Why this role?</li>
                  <li>• Strength / Weakness / Conflict questions</li>
                  <li>• STAR-format situational questions</li>
                  <li>• Career goals and culture alignment</li>
                </ul>
              </div>
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
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating HR Questions...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Start HR Mock Round</>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HRInterviewButton;
