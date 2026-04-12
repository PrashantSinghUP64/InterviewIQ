"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Mic, StopCircle, Loader2, Camera, CameraOff,
  Radio, CheckCircle2, Sparkles, Eye
} from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

/* ═══════════════════════════════════════════════════════════════════════════
   FILLER-WORD CONFIDENCE ANALYSIS
═══════════════════════════════════════════════════════════════════════════ */
const FILLER_WORDS = [
  "um", "uh", "like", "basically", "you know", "sort of",
  "kind of", "right", "okay so", "actually", "literally",
];

const analyseConfidence = (text, durationSecs = 0) => {
  if (!text?.trim()) return null;
  const lower = text.toLowerCase();
  const words = lower.trim().split(/\s+/);
  const totalWords = words.length;
  const counts = {};
  let totalFillers = 0;
  FILLER_WORDS.forEach((filler) => {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = lower.match(new RegExp(`\\b${escaped}\\b`, "gi"));
    if (matches?.length) { Object.assign(counts, { [filler]: matches.length }); totalFillers += matches.length; }
  });

  // Filler penalty: each filler deducts more aggressively (3× weight)
  const fillerRatio = totalFillers / Math.max(1, totalWords);
  const fillerScore = Math.max(0, 1 - fillerRatio * 3);

  // Length penalty: short answers are penalised regardless of filler count
  let lengthMultiplier;
  if (totalWords < 10)      lengthMultiplier = 0.35;
  else if (totalWords < 25) lengthMultiplier = 0.60;
  else if (totalWords < 50) lengthMultiplier = 0.80;
  else                      lengthMultiplier = 1.00;

  // Speech-rate check (words per minute)
  let rateMultiplier = 1.0;
  if (durationSecs > 5) {
    const wpm = (totalWords / durationSecs) * 60;
    if (wpm < 60 || wpm > 220) rateMultiplier = 0.80; // too slow or too rushed
  }

  const raw = fillerScore * lengthMultiplier * rateMultiplier * 100;
  return {
    confidence: Math.max(5, Math.min(99, Math.round(raw))),
    totalFillers,
    counts,
    totalWords,
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
  const result = await chatSession.generateContent(prompt);
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
const EyeContactMeter = ({ score, stream }) => {
  const videoTrack = stream?.getVideoTracks?.()[0];
  const isCameraOn = videoTrack && videoTrack.enabled && videoTrack.readyState === 'live';
  const displayScore = isCameraOn ? score : 0;

  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(displayScore), 80); return () => clearTimeout(t); }, [displayScore]);
  
  // Score 0 = error state (no face detected or camera off)
  const isError = displayScore === 0;

  const getStyle = (p, isOff) => {
    if (isOff || p === 0) return { grad: "from-red-500 to-red-600", text: "text-red-400", shadow: "rgba(239,68,68,0.5)", label: isOff ? "Camera Off" : "No Face Detected" };
    if (p >= 80) return { grad: "from-emerald-500 to-emerald-600", text: "text-emerald-400", shadow: "rgba(16,185,129,0.5)", label: `${p}%` };
    if (p >= 60) return { grad: "from-amber-500 to-amber-600", text: "text-amber-400", shadow: "rgba(245,158,11,0.5)", label: `${p}%` };
    return { grad: "from-red-500 to-red-600", text: "text-red-400", shadow: "rgba(239,68,68,0.5)", label: `${p}%` };
  };
  const st = getStyle(displayScore, !isCameraOn);

  return (
    <div className={`rounded-xl border p-4 mt-4 animate-[fadeUp_0.45s_ease_forwards] ${
      isError || !isCameraOn
        ? "bg-red-500/5 border-red-500/30"
        : "bg-slate-100/50 dark:bg-slate-800/50 border-indigo-500/25"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Eye Contact</span>
        </div>
        {(isError || !isCameraOn) && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400">
            ⚠ {!isCameraOn ? "Camera Off" : "Face Not Detected"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${st.grad}`}
            style={{ width: `${w}%`, transition: "width 1.2s ease", boxShadow: `0 0 8px ${st.shadow}` }}
          />
        </div>
        <span className={`text-xl font-bold tabular-nums ${st.text} text-nowrap`}>{st.label}</span>
      </div>
      {(isError || !isCameraOn) && (
        <p className="text-xs text-red-400/80 mt-2">
          {!isCameraOn
            ? "Enable your camera and stay in frame while recording."
            : "Your face was not visible during recording. Ensure good lighting and look at the camera."}
        </p>
      )}
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
    <div className="rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-indigo-500/25 p-4 mt-4 animate-[fadeUp_0.45s_ease_forwards]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Confidence Score</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${lbl.cls}`}>{lbl.text}</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
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
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{result.totalFillers}</span> filler word{result.totalFillers !== 1 ? "s" : ""} detected
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.counts).map(([word, cnt]) => (
              <span key={word} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 ${barColor(result.confidence)}`}>
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
  <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-300/40 dark:border-slate-700/40 bg-slate-100/30 dark:bg-slate-800/30 animate-pulse">
    <div className="h-2.5 w-16 rounded-full bg-slate-200/60 dark:bg-slate-700/60" />
    <div className="h-10 w-14 rounded-lg   bg-slate-200/60 dark:bg-slate-700/60" />
    <div className="space-y-1.5"><div className="h-2.5 w-full rounded-full bg-slate-200/60 dark:bg-slate-700/60" /><div className="h-2.5 w-3/4 rounded-full bg-slate-200/60 dark:bg-slate-700/60" /></div>
  </div>
);

const MetricCard = ({ label, score, feedback }) => {
  const animated = useCountUp(score);
  const st = scoreStyle(score);
  return (
    <div className={`flex flex-col gap-2.5 p-4 rounded-xl border shadow-lg ${st.border} ${st.bg} ${st.shadow}`}>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}</p>
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
    <div className="rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-indigo-500/25 p-4 mt-4 animate-[fadeUp_0.5s_ease_forwards]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Answer Analysis</span>
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
          <div className="h-px bg-slate-200/40 dark:bg-slate-700/40 my-4" />
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

  /* ── Camera Tracking & Timer State ── */
  const [isFaceMissing, setIsFaceMissing]       = useState(false);
  const [cameraActive, setCameraActive]         = useState(true);
  const [finalAttentionScore, setFinalAttentionScore] = useState(null);
  const [answerDuration, setAnswerDuration]     = useState(0);
  
  const detectionIntervalRef = useRef(null);
  const timerIntervalRef     = useRef(null);
  const statsRef             = useRef({ total: 0, present: 0 });

  /* ── Scoring State ── */
  const [confidenceResult, setConfidenceResult] = useState(null);
  const [scoreCard, setScoreCard]         = useState(null);
  const [scoreLoading, setScoreLoading]   = useState(false);
  const [showScoreCard, setShowScoreCard] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef       = useRef(null);
  const streamRef      = useRef(null);
  const { user }       = useUser();

  /* ── Reset on question change ── */
  useEffect(() => {
    setUserAnswer("");
    setConfidenceResult(null);
    setScoreCard(null);
    setShowScoreCard(false);
    setFinalAttentionScore(null);
    setAnswerDuration(0);
    statsRef.current = { total: 0, present: 0 };
    setIsFaceMissing(false);
  }, [activeQuestionIndex]);

  /* ── Camera Canvas Detection (every 3 seconds) ── */
  useEffect(() => {
    if (webcamEnabled && isRecording) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      statsRef.current = { total: 0, present: 0 };
      setIsFaceMissing(false);
      setCameraActive(true);

      detectionIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !streamRef.current) {
          setCameraActive(false);
          return;
        }

        const stream = streamRef.current;
        const hasActiveTracks = stream.getVideoTracks().some(t => t.readyState === 'live');
        const isPlaying = videoRef.current.readyState > 2 && !videoRef.current.paused;

        if (!hasActiveTracks || !isPlaying) {
          setCameraActive(false);
          setIsFaceMissing(true);
          return;
        }

        try {
          // Use a 64×64 sample for better resolution
          const SAMPLE = 64;
          canvas.width = SAMPLE; canvas.height = SAMPLE;
          ctx.drawImage(videoRef.current, 0, 0, SAMPLE, SAMPLE);
          const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

          let totalBrightness = 0;
          let centerBrightness = 0;
          let skinTonePixels = 0;
          const cMin = Math.floor(SAMPLE * 0.30), cMax = Math.floor(SAMPLE * 0.70); // middle 40%

          for (let y = 0; y < SAMPLE; y++) {
            for (let x = 0; x < SAMPLE; x++) {
              const idx = (y * SAMPLE + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              const lum = (r + g + b) / 3;
              totalBrightness += lum;
              if (x >= cMin && x < cMax && y >= cMin && y < cMax) {
                centerBrightness += lum;
                // Loose skin-tone heuristic: reddish, not too dark, not saturated/white
                if (r > 60 && r > g && r > b && (r - b) > 15 && r < 250 && g > 30) {
                  skinTonePixels++;
                }
              }
            }
          }

          const totalPixels  = SAMPLE * SAMPLE;
          const centerPixels = (cMax - cMin) * (cMax - cMin);
          totalBrightness /= totalPixels;
          centerBrightness /= centerPixels;

          // Face considered present ONLY if frame is decently bright AND
          // centre region has visible skin-tone pixels (no skin = no face)
          const isActive = totalBrightness > 30 && skinTonePixels > 8;

          setCameraActive(isActive);
          statsRef.current.total += 1;
          if (isActive) {
            statsRef.current.present += 1;
            setIsFaceMissing(false);
            toast.dismiss("face-warning");
          } else {
            setIsFaceMissing((prev) => {
              if (!prev) toast.error("⚠️ Face not detected — stay in frame", { id: "face-warning", duration: 10000 });
              return true;
            });
          }
        } catch (e) {
          setCameraActive(false);
        }
      }, 3000);

    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      toast.dismiss("face-warning");
      
      // When recording stops, compute final attention score.
      // If detection never ran (too-short recording), force 0 so user sees the failure.
      if (!isRecording) {
        setFinalAttentionScore(
          statsRef.current.total > 0
            ? Math.max(0, Math.round((statsRef.current.present / statsRef.current.total) * 100))
            : 0
        );
      }
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      toast.dismiss("face-warning");
    };
  }, [isRecording, webcamEnabled]);

  /* ── Answer Duration Timer ── */
  useEffect(() => {
    if (isRecording) {
       setAnswerDuration(0);
       timerIntervalRef.current = setInterval(() => {
          setAnswerDuration(prev => prev + 1);
       }, 1000);
    } else {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  /* ── Live confidence ── */
  useEffect(() => {
    if (!isRecording && userAnswer.trim()) setConfidenceResult(analyseConfidence(userAnswer, answerDuration));
    if (!userAnswer.trim()) setConfidenceResult(null);
  }, [userAnswer, isRecording, answerDuration]);

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
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (webcamEnabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [webcamEnabled]);

  const EnableWebcam = () => {
    setWebcamEnabled(true);
    toast.success("Webcam enabled");
  };
  const DisableWebcam = () => {
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

  /* ── Save Answer Locally ── */
  const UpdateUserAnswer = () => {
    if (!userAnswer.trim()) { toast.error("Please provide an answer before saving"); return; }
    const currentQ   = mockInterviewQuestion[activeQuestionIndex]?.question;
    const currentAns = userAnswer;

    const fillerCount = confidenceResult ? confidenceResult.totalFillers : null;

    // Send answer and local analytics to parent component (page.jsx)
    onAnswerSave?.({ 
      question: currentQ, 
      userAns: currentAns, 
      attentionScore: finalAttentionScore,
      confidenceScore: confidenceResult ? confidenceResult.confidence : null,
      fillerWordCount: fillerCount,
      duration: answerDuration
    });

    toast.success("Answer recorded!");

    setUserAnswer("");
    setConfidenceResult(null);
    setFinalAttentionScore(null);
    setAnswerDuration(0);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col gap-4 relative">
      <style>{KEYFRAMES}</style>
      
      {/* ── Camera UI ── */}
      <div className="relative w-full aspect-video rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
        {webcamEnabled ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
                borderRadius: "8px"
              }}
            />

            {/* Minimal Status Indicators */}
            {isRecording && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-4 text-xs font-semibold shadow-lg text-white">
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Recording
                 </div>
                 <div className="w-px h-3 bg-white/20" />
                 <div className="tabular-nums tracking-widest">{Math.floor(answerDuration / 60)}:{(answerDuration % 60).toString().padStart(2, '0')}</div>
                 <div className="w-px h-3 bg-white/20" />
                 <div className="flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-sky-400" /> Listening
                 </div>
              </div>
            )}

            <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white/70 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 backdrop-blur-sm shadow-sm`}>
               {cameraActive ? (
                 <><span className="w-2 h-2 rounded-full bg-emerald-500" /> Live</>
               ) : (
                 <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Camera off</>
               )}
            </div>

            {/* Focus warning overlay */}
            {isRecording && isFaceMissing && (
              <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300 pointer-events-none">
                <span className="bg-red-500/20 border border-red-500/50 text-red-50 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-2xl shadow-red-500/50 animate-pulse">
                  Unfocused / Too dark 👁️
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center"><Camera className="w-7 h-7 text-slate-500" /></div>
            <p className="text-slate-500 text-sm">Camera off</p>
          </div>
        )}
      </div>

      {/* ── Camera Toggle ── */}
      <button onClick={webcamEnabled ? DisableWebcam : EnableWebcam} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${webcamEnabled ? "bg-slate-100/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-400" : "bg-slate-100/60 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-300"}`}>
        {webcamEnabled ? <><CameraOff className="w-3.5 h-3.5" /> Disable Camera</> : <><Camera className="w-3.5 h-3.5" /> Enable Camera</>}
      </button>

      {/* ── Transcript ── */}
      <div className="rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Live Transcript</span>
          {userAnswer && <button onClick={() => { setUserAnswer(""); setConfidenceResult(null); setFinalAttentionScore(null); }} className="text-xs text-slate-600 hover:text-red-400">Clear</button>}
        </div>
        <textarea className="w-full h-28 px-4 py-3 bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-600 text-sm resize-none focus:outline-none" placeholder="Your spoken answer will appear here as you record..." value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} />
      </div>

      {/* ── Analytics Elements ── */}
      {finalAttentionScore !== null && !isRecording && <EyeContactMeter score={finalAttentionScore} stream={streamRef.current} />}
      {confidenceResult && !isRecording && <ConfidenceMeter result={confidenceResult} />}

      {/* ── Action Buttons ── */}
      <div className="flex gap-3 mt-2">
        <button onClick={StartStopRecording} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isRecording ? "bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 animate-pulse" : "bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-600/5"}`}>
          {isRecording ? <><StopCircle className="w-4 h-4" /> Stop</> : <><Mic className="w-4 h-4" /> Start Answer</>}
        </button>
        <button onClick={UpdateUserAnswer} disabled={!userAnswer.trim()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
          Save Answer
        </button>
      </div>
    </div>
  );
};

export default RecordAnswerSection;
