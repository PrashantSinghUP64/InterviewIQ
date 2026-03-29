"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Mic, StopCircle, Loader2, Camera, CameraOff,
  Radio, CheckCircle2, Sparkles, Eye
} from "lucide-react";
import { toast } from "sonner";
import { callGeminiWithRetry } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import * as faceapi from "face-api.js";

/* ═══════════════════════════════════════════════════════════════════════════
   FILLER-WORD CONFIDENCE ANALYSIS
═══════════════════════════════════════════════════════════════════════════ */
const FILLER_WORDS = [
  "um", "uh", "like", "basically", "you know", "sort of",
  "kind of", "right", "okay so", "actually", "literally",
];

const analyseConfidence = (text) => {
  if (!text?.trim()) return null;
  const lower = text.toLowerCase();
  const totalWords = lower.trim().split(/\s+/).length;
  const counts = {};
  let totalFillers = 0;
  FILLER_WORDS.forEach((filler) => {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lower.match(new RegExp(`\\b${escaped}\\b`, "gi"));
    if (matches?.length) { Object.assign(counts, { [filler]: matches.length }); totalFillers += matches.length; }
  });
  return {
    confidence: Math.max(0, Math.round((1 - totalFillers / totalWords) * 100)),
    totalFillers,
    counts,
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
   GEMINI SCORE-CARD CALL
═══════════════════════════════════════════════════════════════════════════ */
const fetchScoreCard = async (question, answer) => {
  const prompt = `You are an expert interview evaluator.
Evaluate this interview answer and return ONLY a JSON object with no extra text:
Question: ${question}
Answer: ${answer}
Return exactly this format:
{
  "clarity": <number 0-10>,
  "relevance": <number 0-10>,
  "depth": <number 0-10>,
  "clarityFeedback": "<one short sentence>",
  "relevanceFeedback": "<one short sentence>",
  "depthFeedback": "<one short sentence>"
}`;
  const result = await callGeminiWithRetry(prompt);
  const raw    = await result.response.text();
  const match  = raw.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
};

/* ═══════════════════════════════════════════════════════════════════════════
   COLOUR HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const scoreStyle = (n) => {
  if (n >= 8) return { text: "text-emerald-400", border: "border-emerald-500/40", shadow: "shadow-emerald-500/15", bg: "bg-emerald-500/5" };
  if (n >= 5) return { text: "text-amber-400",   border: "border-amber-500/40",   shadow: "shadow-amber-500/15",   bg: "bg-amber-500/5"   };
  return              { text: "text-red-400",     border: "border-red-500/40",     shadow: "shadow-red-500/15",     bg: "bg-red-500/5"     };
};

const barGrad  = (p) => p >= 90 ? "from-emerald-500 to-emerald-600" : p >= 70 ? "from-amber-500 to-amber-600" : "from-red-500 to-red-600";
const barColor = (p) => p >= 90 ? "text-emerald-400" : p >= 70 ? "text-amber-400" : "text-red-400";
const barLabel = (p) => p >= 90
  ? { text: "Excellent",  cls: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" }
  : p >= 70
  ? { text: "Good",       cls: "text-amber-400   bg-amber-500/15   border-amber-500/30"  }
  : { text: "Needs Work", cls: "text-red-400     bg-red-500/15     border-red-500/30"    };

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNT-UP HOOK
═══════════════════════════════════════════════════════════════════════════ */
const useCountUp = (target, ms = 900) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target == null) return;
    setVal(0);
    const steps = 40;
    const inc   = target / steps;
    let cur     = 0;
    const id    = setInterval(() => {
      cur += inc;
      if (cur >= target) { setVal(target); clearInterval(id); }
      else setVal(parseFloat(cur.toFixed(1)));
    }, ms / steps);
    return () => clearInterval(id);
  }, [target, ms]);
  return val;
};

/* ═══════════════════════════════════════════════════════════════════════════
   EYE CONTACT METER COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const EyeContactMeter = ({ score }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 80); return () => clearTimeout(t); }, [score]);
  
  const getStyle = (p) => {
    if (p >= 80) return { grad: "from-emerald-500 to-emerald-600", text: "text-emerald-400", shadow: "rgba(16,185,129,0.5)" };
    if (p >= 60) return { grad: "from-amber-500 to-amber-600", text: "text-amber-400", shadow: "rgba(245,158,11,0.5)" };
    return { grad: "from-red-500 to-red-600", text: "text-red-400", shadow: "rgba(239,68,68,0.5)" };
  };
  const st = getStyle(score);

  return (
    <div className="rounded-xl bg-slate-800/50 border border-indigo-500/25 p-4 mt-4 animate-[fadeUp_0.45s_ease_forwards]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Eye Contact</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${st.grad}`}
            style={{ width: `${w}%`, transition: "width 1.2s ease", boxShadow: `0 0 8px ${st.shadow}` }}
          />
        </div>
        <span className={`text-2xl font-bold tabular-nums ${st.text}`}>{score}%</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIDENCE METER COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const ConfidenceMeter = ({ result }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(result.confidence), 80); return () => clearTimeout(t); }, [result.confidence]);
  const lbl = barLabel(result.confidence);

  return (
    <div className="rounded-xl bg-slate-800/50 border border-indigo-500/25 p-4 mt-4 animate-[fadeUp_0.45s_ease_forwards]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Confidence Score</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${lbl.cls}`}>{lbl.text}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-3 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGrad(result.confidence)}`}
            style={{
              width: `${w}%`,
              transition: "width 1.2s ease",
              boxShadow: result.confidence >= 90 ? "0 0 8px rgba(16,185,129,0.5)" : result.confidence >= 70 ? "0 0 8px rgba(245,158,11,0.5)" : "0 0 8px rgba(239,68,68,0.5)",
            }}
          />
        </div>
        <span className={`text-2xl font-bold tabular-nums ${barColor(result.confidence)}`}>{result.confidence}%</span>
      </div>

      {result.totalFillers === 0 ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" /> Excellent! No filler words detected 🎯
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            <span className="text-slate-300 font-semibold">{result.totalFillers}</span> filler word{result.totalFillers !== 1 ? "s" : ""} detected
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.counts).map(([word, cnt]) => (
              <span key={word} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 ${barColor(result.confidence)}`}>
                {word}<span className="opacity-60">×{cnt}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE CARDS
═══════════════════════════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-700/40 bg-slate-800/30 animate-pulse">
    <div className="h-2.5 w-16 rounded-full bg-slate-700/60" />
    <div className="h-10 w-14 rounded-lg   bg-slate-700/60" />
    <div className="space-y-1.5"><div className="h-2.5 w-full rounded-full bg-slate-700/60" /><div className="h-2.5 w-3/4 rounded-full bg-slate-700/60" /></div>
  </div>
);

const MetricCard = ({ label, score, feedback }) => {
  const animated = useCountUp(score);
  const st = scoreStyle(score);
  return (
    <div className={`flex flex-col gap-2.5 p-4 rounded-xl border shadow-lg ${st.border} ${st.bg} ${st.shadow}`}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-4xl font-extrabold tabular-nums leading-none ${st.text}`}>
        {parseFloat(animated.toFixed(1))}<span className="text-sm text-slate-500 font-normal ml-0.5">/10</span>
      </p>
      <p className="text-xs text-slate-500 leading-relaxed">{feedback}</p>
    </div>
  );
};

const PerAnswerScoreCard = ({ scores, loading }) => {
  const avg = scores ? parseFloat(((scores.clarity + scores.relevance + scores.depth) / 3).toFixed(1)) : null;
  const animatedAvg = useCountUp(avg);
  const avgSt = avg != null ? scoreStyle(avg) : {};
  return (
    <div className="rounded-xl bg-slate-800/50 border border-indigo-500/25 p-4 mt-4 animate-[fadeUp_0.5s_ease_forwards]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Answer Analysis</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loading ? <><SkeletonCard /><SkeletonCard /><SkeletonCard /></> : scores ? (
          <>
            <MetricCard label="Clarity"   score={scores.clarity}   feedback={scores.clarityFeedback} />
            <MetricCard label="Relevance" score={scores.relevance} feedback={scores.relevanceFeedback} />
            <MetricCard label="Depth"     score={scores.depth}     feedback={scores.depthFeedback} />
          </>
        ) : null}
      </div>
      {!loading && scores && (
        <>
          <div className="h-px bg-slate-700/40 my-4" />
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Overall</p>
            <p className={`text-2xl font-bold tabular-nums ${avgSt.text}`}>
              {parseFloat(animatedAvg.toFixed(1))}<span className="text-sm text-slate-500 font-normal">/10</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL KEYFRAMES
═══════════════════════════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onAnswerSave,
}) => {
  const [userAnswer, setUserAnswer]       = useState("");
  const [isRecording, setIsRecording]     = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [savingAnswer, setSavingAnswer]   = useState(false);

  /* ── Face APi Tracking State ── */
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [isFaceMissing, setIsFaceMissing]       = useState(false);
  const [finalAttentionScore, setFinalAttentionScore] = useState(null);
  
  const detectionIntervalRef = useRef(null);
  const lastFaceSeenRef      = useRef(Date.now());
  const statsRef             = useRef({ total: 0, present: 0 });

  /* ── Scoring State ── */
  const [confidenceResult, setConfidenceResult] = useState(null);
  const [scoreCard, setScoreCard]         = useState(null);
  const [scoreLoading, setScoreLoading]   = useState(false);
  const [showScoreCard, setShowScoreCard] = useState(false);

  const recognitionRef = useRef(null);
  const webcamRef      = useRef(null);
  const { user }       = useUser();

  /* ── Load Face API Models ── */
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
        ]);
        setFaceModelsLoaded(true);
      } catch (e) {
        // silently fail
      }
    };
    loadModels();
  }, []);

  /* ── Reset on question change ── */
  useEffect(() => {
    setUserAnswer("");
    setConfidenceResult(null);
    setScoreCard(null);
    setShowScoreCard(false);
    setFinalAttentionScore(null);
    statsRef.current = { total: 0, present: 0 };
    setIsFaceMissing(false);
  }, [activeQuestionIndex]);

  /* ── Face detection loop (only while recording) ── */
  useEffect(() => {
    if (isRecording && webcamEnabled && faceModelsLoaded) {
      lastFaceSeenRef.current = Date.now();
      statsRef.current = { total: 0, present: 0 };
      setIsFaceMissing(false);

      detectionIntervalRef.current = setInterval(async () => {
        if (!webcamRef.current) return;
        try {
          const detection = await faceapi.detectSingleFace(
            webcamRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );

          statsRef.current.total += 1;

          if (detection) {
            statsRef.current.present += 1;
            lastFaceSeenRef.current = Date.now();
            if (isFaceMissing) {
              setIsFaceMissing(false);
              toast.dismiss("face-warning");
            }
          } else {
            const timeMissed = Date.now() - lastFaceSeenRef.current;
            if (timeMissed >= 3000) {
              setIsFaceMissing((prev) => {
                if (!prev) toast.error("⚠️ Look at the camera", { id: "face-warning", duration: 10000 });
                return true;
              });
            }
          }
        } catch (e) { } // ignore
      }, 1500);

    } else {
      // Stopped or disabled
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      toast.dismiss("face-warning");
      
      // Calculate final score
      if (!isRecording && statsRef.current.total > 0) {
        setFinalAttentionScore(
          Math.max(0, Math.round((statsRef.current.present / Math.max(1, statsRef.current.total)) * 100))
        );
      }
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      toast.dismiss("face-warning");
    };
  }, [isRecording, webcamEnabled, faceModelsLoaded]);

  /* ── Live confidence ── */
  useEffect(() => {
    if (!isRecording && userAnswer.trim()) setConfidenceResult(analyseConfidence(userAnswer));
    if (!userAnswer.trim()) setConfidenceResult(null);
  }, [userAnswer, isRecording]);

  /* ── Speech tracking ── */
  useEffect(() => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) return;
    recognitionRef.current = new window.webkitSpeechRecognition();
    const rec = recognitionRef.current;
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = "en-US";
    rec.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
      }
      if (final.trim()) setUserAnswer((prev) => (prev + " " + final).trim());
    };
    rec.onerror = (e) => { toast.error(`Speech error: ${e.error}`); setIsRecording(false); };
    rec.onend   = ()  => setIsRecording(false);
  }, []);

  /* ── Camera controls ── */
  const EnableWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) webcamRef.current.srcObject = stream;
      setWebcamEnabled(true);
      toast.success("Webcam enabled");
    } catch { toast.error("Failed to enable webcam", { description: "Check permissions" }); }
  };
  const DisableWebcam = () => {
    webcamRef.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
    setWebcamEnabled(false);
  };
  const StartStopRecording = () => {
    if (!recognitionRef.current) { toast.error("Speech-to-text not supported"); return; }
    if (isRecording) {
      recognitionRef.current.stop();
      toast.info("Recording stopped");
    } else {
      setConfidenceResult(null);
      setFinalAttentionScore(null);
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info("Recording started — speak clearly");
    }
  };

  /* ── Save Answer ── */
  const UpdateUserAnswer = async () => {
    if (!userAnswer.trim()) { toast.error("Please provide an answer before saving"); return; }
    const currentQ   = mockInterviewQuestion[activeQuestionIndex]?.question;
    const currentAns = userAnswer;

    setSavingAnswer(true);
    setShowScoreCard(true);
    setScoreLoading(true);
    setScoreCard(null);

    const getFeedbackRating = async () => {
      const promptText = `Question: ${currentQ}, User Answer: ${currentAns}. Please give a rating out of 10 and feedback on improvement in JSON format like this: { "rating": 8, "feedback": "Good answer but could use more examples." }`;
      const result    = await callGeminiWithRetry(promptText);
      const rawText   = await result.response.text();
      const jsonMatch = rawText.match(/\{\s*"rating"\s*:\s*\d+[\s\S]*?\}/);
      let parsed      = { rating: 5, feedback: "No feedback provided" };
      if (jsonMatch) { try { parsed = JSON.parse(jsonMatch[0]); } catch { } }
      return parsed;
    };

    const getScores = async (attempt = 1) => {
      try { return await fetchScoreCard(currentQ, currentAns); }
      catch (err) {
        if (attempt < 2) { await new Promise((r) => setTimeout(r, 2000)); return getScores(attempt + 1); }
        return null;
      }
    };

    const [feedbackResult, scoreResult] = await Promise.allSettled([getFeedbackRating(), getScores()]);
    const parsedFeedback = feedbackResult.status === "fulfilled" ? feedbackResult.value : { rating: 5, feedback: "Failed to generate feedback" };
    const scores = scoreResult.status === "fulfilled" ? scoreResult.value : null;

    if (scores) setScoreCard(scores);
    else { toast.error("Analysis unavailable, try again"); setShowScoreCard(false); }
    setScoreLoading(false);

    try {
      await db.insert(UserAnswer).values({
        mockIdRef:  interviewData?.mockId,
        question:   currentQ,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer || "N/A",
        userAns:    currentAns,
        feedback:   parsedFeedback.feedback,
        rating:     String(parsedFeedback.rating),
        clarityRating: scores ? String(scores.clarity) : null,
        relevanceRating: scores ? String(scores.relevance) : null,
        depthRating: scores ? String(scores.depth) : null,
        attentionScore: finalAttentionScore !== null ? String(finalAttentionScore) : null,
        confidenceScore: confidenceResult ? String(confidenceResult.confidence) : null,
        userEmail:  user?.primaryEmailAddress?.emailAddress,
        createdAt:  moment().format("DD-MM-YYYY"),
      });
      toast.success("Answer saved successfully!");
    } catch (e) {
      toast.error("Failed to save answer to database.");
      console.error(e);
    }

    onAnswerSave?.({ scoreCard: scores, userAns: currentAns, attentionScore: finalAttentionScore });

    setUserAnswer("");
    setConfidenceResult(null);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    setSavingAnswer(false);
  };

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col gap-4 relative">
      <style>{KEYFRAMES}</style>
      
      {savingAnswer && (
        <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-slate-950/90 backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mb-3" />
          <p className="text-slate-300 text-sm font-medium">Analysing your answer...</p>
        </div>
      )}

      {/* ── Camera UI ── */}
      <div className="relative w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
        {webcamEnabled ? (
          <>
            <video ref={webcamRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            {/* Recording badge */}
            <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              isRecording ? "bg-red-500/20 border border-red-500/40 text-red-400" : "bg-slate-900/70 border border-slate-700 text-slate-400"
            }`}>
              {isRecording ? <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC</> : <><Radio className="w-3 h-3" /> STANDBY</>}
            </div>

            {/* Models loading text */}
            {!faceModelsLoaded && (
              <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                Loading face detection...
              </div>
            )}

            {/* Attention live indicator */}
            {isRecording && faceModelsLoaded && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-xs font-semibold backdrop-blur-md transition-colors duration-300">
                <span className={`w-2 h-2 rounded-full ${!isFaceMissing ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                <span className={!isFaceMissing ? 'text-emerald-400' : 'text-red-400'}>{!isFaceMissing ? "Attentive" : "Look at camera"}</span>
              </div>
            )}

            {/* Face warning overlay */}
            {isRecording && isFaceMissing && (
              <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
                <span className="bg-red-500/20 border border-red-500/50 text-red-50 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-2xl shadow-red-500/50 animate-pulse">
                  Look at camera 👁️
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center"><Camera className="w-7 h-7 text-slate-500" /></div>
            <p className="text-slate-500 text-sm">Camera off</p>
          </div>
        )}
      </div>

      {/* ── Camera Toggle ── */}
      <button onClick={webcamEnabled ? DisableWebcam : EnableWebcam} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${webcamEnabled ? "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-red-400" : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-indigo-300"}`}>
        {webcamEnabled ? <><CameraOff className="w-3.5 h-3.5" /> Disable Camera</> : <><Camera className="w-3.5 h-3.5" /> Enable Camera</>}
      </button>

      {/* ── Transcript ── */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Transcript</span>
          {userAnswer && <button onClick={() => { setUserAnswer(""); setConfidenceResult(null); setScoreCard(null); setShowScoreCard(false); setFinalAttentionScore(null); }} className="text-xs text-slate-600 hover:text-red-400">Clear</button>}
        </div>
        <textarea className="w-full h-28 px-4 py-3 bg-transparent text-slate-300 placeholder-slate-600 text-sm resize-none focus:outline-none" placeholder="Your spoken answer will appear here as you record..." value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} />
      </div>

      {/* ── Analytics Elements ── */}
      {finalAttentionScore !== null && !isRecording && <EyeContactMeter score={finalAttentionScore} />}
      {confidenceResult && !isRecording && <ConfidenceMeter result={confidenceResult} />}

      {/* ── Placeholder while recording ── */}
      {isRecording && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
           <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Analysis in Progress</span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-700/60 rounded-full overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-500/40 to-purple-500/40 animate-pulse" />
          </div>
        </div>
      )}

      {showScoreCard && <PerAnswerScoreCard scores={scoreCard} loading={scoreLoading} />}

      {/* ── Action Buttons ── */}
      <div className="flex gap-3">
        <button onClick={StartStopRecording} disabled={savingAnswer} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isRecording ? "bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 animate-pulse" : "bg-slate-800/60 border border-slate-700 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-600/5"}`}>
          {isRecording ? <><StopCircle className="w-4 h-4" /> Stop</> : <><Mic className="w-4 h-4" /> Start Answer</>}
        </button>
        <button onClick={UpdateUserAnswer} disabled={savingAnswer || !userAnswer.trim()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
          {savingAnswer ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Answer"}
        </button>
      </div>
    </div>
  );
};

export default RecordAnswerSection;
