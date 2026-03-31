'use client';

import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: 1,
    icon: "🎯",
    tag: "STEP 01",
    title: "Create Your Interview",
    subtitle: "Tailor it to your dream job",
    color: "#7C3AED",
    glow: "rgba(124,58,237,0.4)",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
    description:
      "Start by entering your target Job Role, preferred Tech Stack, and Years of Experience. Our AI customizes every single question to your exact profile — no two sessions are alike.",
    bullets: [
      { icon: "💼", text: "Pick your job role (e.g. Software Engineer, Frontend Dev)" },
      { icon: "⚡", text: "Select your tech stack — React, Node.js, Python, etc." },
      { icon: "📅", text: "Set experience level: Fresher, 1-3 yrs, or 5+ yrs" },
      { icon: "🚀", text: "AI generates a unique question set just for you" },
    ],
    mockup: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="font-size:11px;color:#a78bfa;letter-spacing:2px;font-weight:700;margin-bottom:4px">SESSION DETAILS</div>
        ${[
          { label: "Job Role", icon: "💼", value: "Software Engineer" },
          { label: "Tech Stack", icon: "⚡", value: "React" },
          { label: "Experience", icon: "🕐", value: "2 Years" },
        ]
          .map(
            (item) => `
          <div style="display:flex;align-items:center;gap:12px;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:12px 16px">
            <div style="width:34px;height:34px;background:rgba(124,58,237,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">${item.icon}</div>
            <div>
              <div style="font-size:10px;color:#6b7280;letter-spacing:1px;text-transform:uppercase">${item.label}</div>
              <div style="font-size:14px;font-weight:700;color:#f1f5f9">${item.value}</div>
            </div>
          </div>`
          )
          .join("")}
        <div style="margin-top:8px;background:linear-gradient(135deg,#7C3AED,#4F46E5);border-radius:12px;padding:12px;text-align:center;font-size:13px;font-weight:700;color:#fff;letter-spacing:0.5px">
          ✨ Create Interview Session
        </div>
      </div>`,
  },
  {
    id: 2,
    icon: "📷",
    tag: "STEP 02",
    title: "Setup & Enable Camera",
    subtitle: "Real interview environment",
    color: "#0EA5E9",
    glow: "rgba(14,165,233,0.4)",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
    description:
      "Grant camera and microphone access to simulate a real interview environment. Your video feed is shown only to YOU — we never record, store, or analyze your video.",
    bullets: [
      { icon: "🎥", text: "Click 'Grant Camera & Mic Access' button" },
      { icon: "✅", text: "Allow permission in the browser popup" },
      { icon: "🔴", text: "LIVE indicator confirms camera is active" },
      { icon: "🔒", text: "Video is never recorded or stored — privacy guaranteed" },
    ],
    mockup: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="position:relative;background:#0d1117;border-radius:14px;overflow:hidden;aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;border:1px solid rgba(14,165,233,0.3)">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%,rgba(14,165,233,0.15),transparent 60%)"></div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:0.7">
            <div style="width:48px;height:48px;background:rgba(14,165,233,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px">📷</div>
            <div style="font-size:12px;color:#94a3b8">Camera Disabled</div>
            <div style="font-size:10px;color:#64748b">Click below to grant access</div>
          </div>
          <div style="position:absolute;top:10px;left:10px;background:rgba(14,165,233,0.2);border:1px solid rgba(14,165,233,0.4);border-radius:6px;padding:3px 8px;font-size:10px;color:#38bdf8;font-weight:700">⬤ STANDBY</div>
        </div>
        <div style="background:rgba(14,165,233,0.12);border:1px solid rgba(14,165,233,0.3);border-radius:12px;padding:12px;text-align:center;font-size:13px;font-weight:700;color:#38bdf8">
          📷 Grant Camera & Mic Access
        </div>
        <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:10px;text-align:center;font-size:11px;color:#6ee7b7">
          ✅ Camera & Microphone Active
        </div>
      </div>`,
  },
  {
    id: 3,
    icon: "🤖",
    tag: "STEP 03",
    title: "AI Generates 5 Questions",
    subtitle: "Personalized & unique every time",
    color: "#10B981",
    glow: "rgba(16,185,129,0.4)",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    description:
      "Once you click 'Start Interview', our AI instantly crafts 5 tailored interview questions based on your exact role and stack. Conceptual, practical, and behavioral — mixed perfectly.",
    bullets: [
      { icon: "🎲", text: "Unique question set generated every session" },
      { icon: "🧠", text: "Mix of conceptual, coding & behavioral questions" },
      { icon: "📋", text: "Q1 through Q5 shown as interactive pills on top" },
      { icon: "🔊", text: "Click 'Listen' to hear the question read aloud by AI" },
    ],
    mockup: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:8px">
          ${["Q1", "Q2", "Q3", "Q4", "Q5"]
            .map(
              (q, i) => `
            <div style="flex:1;height:34px;background:${i === 0 ? "linear-gradient(135deg,#10B981,#059669)" : "rgba(16,185,129,0.12)"};border:1px solid ${i === 0 ? "#10B981" : "rgba(16,185,129,0.25)"};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${i === 0 ? "#fff" : "#6ee7b7"}">${q}</div>`
            )
            .join("")}
        </div>
        <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-size:11px;color:#10B981;font-weight:700;letter-spacing:1px"># QUESTION 1</div>
            <div style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:6px;padding:4px 10px;font-size:11px;color:#6ee7b7">🔊 Listen</div>
          </div>
          <div style="font-size:13px;color:#f1f5f9;line-height:1.6;font-weight:500">
            What is your experience with React, and how have you applied it in your previous projects?
          </div>
        </div>
        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:10px 14px;font-size:11px;color:#fbbf24;line-height:1.5">
          <b>Tip:</b> Take a moment to structure your answer. Speak clearly — our AI transcribes and evaluates in real-time.
        </div>
      </div>`,
  },
  {
    id: 4,
    icon: "🎙️",
    tag: "STEP 04",
    title: "Speak Your Answer Live",
    subtitle: "AI transcribes in real-time",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.4)",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    description:
      "Click 'Start Answer' and speak naturally — just like a real interview. Watch your words appear live in the transcript box. Hit 'Save Answer' when you're done with each question.",
    bullets: [
      { icon: "🎤", text: "Click 'Start Answer' — microphone activates instantly" },
      { icon: "📝", text: "Your spoken words transcribed live in real-time" },
      { icon: "💾", text: "Click 'Save Answer' to lock in your response" },
      { icon: "⏭️", text: "Move through Q1 to Q5 at your own pace" },
    ],
    mockup: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="position:relative;background:#0d1117;border-radius:12px;overflow:hidden;aspect-ratio:4/3;border:1px solid rgba(245,158,11,0.25)">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(245,158,11,0.08),transparent 60%)"></div>
          <div style="position:absolute;top:10px;left:10px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);border-radius:6px;padding:3px 8px;font-size:10px;color:#fca5a5;font-weight:700">⬤ RECORDING</div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:10px;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent)">
            <div style="display:flex;justify-content:center;gap:2px">
              ${Array.from({length:12},(_,i)=>`<div style="width:3px;height:${8+Math.sin(i*0.8)*8}px;background:rgba(245,158,11,0.7);border-radius:2px"></div>`).join("")}
            </div>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:12px">
          <div style="font-size:10px;color:#f59e0b;letter-spacing:2px;font-weight:700;margin-bottom:8px">● LIVE TRANSCRIPT</div>
          <div style="font-size:12px;color:#d1d5db;line-height:1.7;font-style:italic">
            "I have 2 years of experience with React, working on component-based architecture and state management using Redux and Context API..."
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;text-align:center;font-size:12px;color:#94a3b8">🎤 Start Answer</div>
          <div style="background:linear-gradient(135deg,#7C3AED,#4F46E5);border-radius:10px;padding:10px;text-align:center;font-size:12px;color:#fff;font-weight:700">💾 Save Answer</div>
        </div>
      </div>`,
  },
  {
    id: 5,
    icon: "📊",
    tag: "STEP 05",
    title: "Get AI Feedback & Report",
    subtitle: "Detailed performance analysis",
    color: "#EC4899",
    glow: "rgba(236,72,153,0.4)",
    gradient: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
    description:
      "After saving all 5 answers, receive a comprehensive AI-generated report — scores, strengths, weaknesses, ideal answer hints, and specific improvement tips for your next attempt.",
    bullets: [
      { icon: "⭐", text: "Overall performance score out of 10" },
      { icon: "🔍", text: "Per-question feedback with ideal answer hints" },
      { icon: "📈", text: "Skill scores: Technical Depth, Communication, Problem Solving" },
      { icon: "💡", text: "Personalized improvement tips to ace the next round" },
    ],
    mockup: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(236,72,153,0.1);border:1px solid rgba(236,72,153,0.25);border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:28px;font-weight:900;color:#f9a8d4">8.2</div>
            <div style="font-size:10px;color:#9ca3af;letter-spacing:1px">OVERALL SCORE</div>
          </div>
          <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:12px;text-align:center">
            <div style="font-size:28px;font-weight:900;color:#6ee7b7">4/5</div>
            <div style="font-size:10px;color:#9ca3af;letter-spacing:1px">ANSWERED</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${[
            { label: "Technical Depth", score: 85, color: "#7C3AED" },
            { label: "Communication", score: 72, color: "#0EA5E9" },
            { label: "Problem Solving", score: 91, color: "#10B981" },
          ]
            .map(
              (item) => `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#d1d5db;margin-bottom:5px">
                <span>${item.label}</span><span style="color:${item.color};font-weight:700">${item.score}%</span>
              </div>
              <div style="background:rgba(255,255,255,0.06);border-radius:99px;height:5px">
                <div style="background:${item.color};width:${item.score}%;height:100%;border-radius:99px;box-shadow:0 0 8px ${item.color}80"></div>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>`,
  },
];

// ── Particle Canvas ──────────────────────────────────────────────
function Particles({ color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [color]);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Animated Counter ─────────────────────────────────────────────
function Counter({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const duration = 1200;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

// ── Waveform Bars ────────────────────────────────────────────────
function Waveform({ color, active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "24px" }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{
          width: "3px",
          background: color,
          borderRadius: "2px",
          height: active ? `${6 + Math.sin(i * 0.7 + Date.now() * 0.003) * 10}px` : "4px",
          transition: "height 0.15s ease",
          opacity: active ? 0.8 : 0.3,
          animation: active ? `wave${i % 4} 0.8s ease-in-out ${i * 0.05}s infinite alternate` : "none",
        }} />
      ))}
    </div>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [waveActive, setWaveActive] = useState(false);
  const timerRef = useRef(null);

  const step = STEPS[active];

  const goTo = (idx) => {
    if (isAnimating || idx === active) return;
    setDirection(idx > active ? 1 : -1);
    setPrev(active);
    setIsAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setPrev(null);
      setIsAnimating(false);
    }, 350);
  };

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        setActive((a) => {
          const next = (a + 1) % STEPS.length;
          setDirection(1);
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(timerRef.current);
  }, [autoPlay]);

  useEffect(() => {
    const interval = setInterval(() => setWaveActive((w) => !w), 800);
    return () => clearInterval(interval);
  }, []);

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,600;1,400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #07070e; }
    @keyframes wave0 { to { height: 18px; } }
    @keyframes wave1 { to { height: 14px; } }
    @keyframes wave2 { to { height: 20px; } }
    @keyframes wave3 { to { height: 10px; } }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 20px var(--glow); }
      50%       { box-shadow: 0 0 50px var(--glow), 0 0 80px var(--glow); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes scanline {
      0%   { top: 0%; }
      100% { top: 100%; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes orb {
      0%   { transform: translate(0,0) scale(1); }
      33%  { transform: translate(30px,-20px) scale(1.1); }
      66%  { transform: translate(-20px,15px) scale(0.95); }
      100% { transform: translate(0,0) scale(1); }
    }
    .step-btn:hover { transform: translateY(-2px) !important; }
    .step-btn { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1) !important; }
  `;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        minHeight: "100vh",
        background: "#07070e",
        fontFamily: "'DM Sans', sans-serif",
        color: "#f1f5f9",
        overflow: "hidden",
        position: "relative",
      }}>

        {/* ── Background Orbs ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", width: "600px", height: "600px",
            background: `radial-gradient(circle, ${step.glow}30 0%, transparent 70%)`,
            left: "-150px", top: "-100px",
            animation: "orb 10s ease-in-out infinite",
            transition: "background 0.8s ease",
          }} />
          <div style={{
            position: "absolute", width: "500px", height: "500px",
            background: `radial-gradient(circle, ${step.glow}20 0%, transparent 70%)`,
            right: "-100px", bottom: "-100px",
            animation: "orb 14s ease-in-out infinite reverse",
            transition: "background 0.8s ease",
          }} />
          {/* grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "60px 24px 80px" }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: "64px", animation: "fadeSlideIn 0.6s ease forwards" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: `1px solid ${step.color}50`,
              background: `${step.color}15`,
              borderRadius: "99px", padding: "6px 18px", marginBottom: "24px",
              transition: "all 0.5s ease",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: step.color, animation: "pulseGlow 1.5s ease-in-out infinite", "--glow": step.glow }} />
              <span style={{ fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", color: step.color, fontWeight: "700", fontFamily: "'Syne', sans-serif", transition: "color 0.5s ease" }}>
                How It Works
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: "800",
              lineHeight: "1.15",
              marginBottom: "18px",
              background: `linear-gradient(135deg, #fff 30%, ${step.color} 70%, #38bdf8 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
              animation: "shimmer 4s linear infinite",
              transition: "background 0.5s ease",
            }}>
              From Zero to Interview Ready<br />in 5 Simple Steps
            </h1>

            <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "500px", margin: "0 auto", lineHeight: "1.7" }}>
              AI-powered mock interviews tailored to your exact role — practice smart, get real feedback, land the job.
            </p>
          </div>

          {/* ── Step Pills ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "52px" }}>
            {STEPS.map((s, i) => (
              <button
                key={i}
                className="step-btn"
                onClick={() => goTo(i)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: active === i ? s.gradient : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active === i ? s.color : "rgba(255,255,255,0.08)"}`,
                  color: active === i ? "#fff" : "#64748b",
                  borderRadius: "12px",
                  padding: "10px 20px",
                  fontSize: "13px", fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: active === i ? `0 4px 24px ${s.glow}` : "none",
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: "0.3px",
                }}
              >
                <span style={{ fontSize: "16px" }}>{s.icon}</span>
                <span>Step {s.id}</span>
              </button>
            ))}
          </div>

          {/* ── Main Card ── */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${step.color}30`,
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: `0 0 80px ${step.glow}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
            transition: "border-color 0.5s ease, box-shadow 0.5s ease",
            animation: "fadeSlideIn 0.4s ease forwards",
          }}>

            {/* Card Top Bar */}
            <div style={{
              background: `linear-gradient(90deg, ${step.color}20 0%, transparent 100%)`,
              borderBottom: `1px solid ${step.color}20`,
              padding: "16px 32px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "background 0.5s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%", background: step.color,
                  boxShadow: `0 0 12px ${step.color}`,
                  animation: "pulseGlow 2s ease-in-out infinite", "--glow": step.glow,
                }} />
                <span style={{ fontSize: "11px", color: step.color, fontWeight: "700", letterSpacing: "2px", fontFamily: "'Syne', sans-serif" }}>
                  {step.tag} — {step.subtitle.toUpperCase()}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Waveform color={step.color} active={active === 3} />
                <button
                  onClick={() => setAutoPlay((a) => !a)}
                  style={{
                    background: autoPlay ? step.gradient : "rgba(255,255,255,0.05)",
                    border: `1px solid ${autoPlay ? step.color : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "8px", padding: "5px 12px",
                    fontSize: "11px", color: autoPlay ? "#fff" : "#64748b",
                    cursor: "pointer", fontWeight: "700", letterSpacing: "0.5px",
                  }}
                >
                  {autoPlay ? "⏸ Pause" : "▶ Auto"}
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0",
              minHeight: "460px",
            }}>
              {/* Left: Info */}
              <div style={{
                padding: "44px 40px",
                borderRight: `1px solid ${step.color}15`,
                display: "flex", flexDirection: "column", justifyContent: "center",
                animation: "fadeSlideIn 0.45s ease forwards",
                key: active,
              }}>
                {/* Icon */}
                <div style={{
                  width: "64px", height: "64px",
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}40`,
                  borderRadius: "18px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px",
                  marginBottom: "24px",
                  animation: "float 4s ease-in-out infinite",
                  boxShadow: `0 8px 24px ${step.glow}30`,
                }}>
                  {step.icon}
                </div>

                <h2 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(22px, 2.5vw, 30px)",
                  fontWeight: "800",
                  color: "#f8fafc",
                  marginBottom: "14px",
                  lineHeight: "1.2",
                }}>
                  {step.title}
                </h2>

                <p style={{
                  color: "#64748b", fontSize: "14px", lineHeight: "1.8",
                  marginBottom: "28px", maxWidth: "380px",
                }}>
                  {step.description}
                </p>

                {/* Bullets */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {step.bullets.map((b, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      animation: `fadeSlideIn 0.4s ease ${j * 0.08}s both`,
                    }}>
                      <div style={{
                        width: "30px", height: "30px", minWidth: "30px",
                        background: `${step.color}18`,
                        border: `1px solid ${step.color}35`,
                        borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px",
                      }}>{b.icon}</div>
                      <span style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6", paddingTop: "5px" }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Mockup */}
              <div style={{
                padding: "32px",
                display: "flex", flexDirection: "column", justifyContent: "center",
                background: "rgba(0,0,0,0.25)",
                position: "relative", overflow: "hidden",
              }}>
                {/* scanline */}
                <div style={{
                  position: "absolute", left: 0, right: 0, height: "2px",
                  background: `linear-gradient(90deg, transparent, ${step.color}60, transparent)`,
                  animation: "scanline 3s linear infinite",
                  pointerEvents: "none", zIndex: 2,
                }} />
                <Particles color={step.color} />
                <div style={{ position: "relative", zIndex: 1, animation: "fadeSlideIn 0.5s ease 0.1s both" }}
                  dangerouslySetInnerHTML={{ __html: STEPS[active].mockup }}
                />
              </div>
            </div>

            {/* Card Footer */}
            <div style={{
              borderTop: `1px solid ${step.color}15`,
              padding: "20px 32px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(0,0,0,0.2)",
            }}>
              {/* Progress dots */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {STEPS.map((s, i) => (
                  <div key={i} onClick={() => goTo(i)} style={{
                    width: active === i ? "28px" : "8px",
                    height: "8px", borderRadius: "99px",
                    background: active === i ? s.gradient : "rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                    boxShadow: active === i ? `0 0 10px ${s.glow}` : "none",
                  }} />
                ))}
              </div>

              {/* Nav buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => goTo(Math.max(0, active - 1))}
                  disabled={active === 0}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: active === 0 ? "#2d3748" : "#94a3b8",
                    borderRadius: "10px", padding: "10px 22px",
                    fontSize: "13px", fontWeight: "700",
                    cursor: active === 0 ? "not-allowed" : "pointer",
                    fontFamily: "'Syne', sans-serif",
                    transition: "all 0.2s",
                  }}
                >← Prev</button>
                <button
                  onClick={() => active === STEPS.length - 1 ? null : goTo(active + 1)}
                  style={{
                    background: active === STEPS.length - 1 ? "rgba(255,255,255,0.05)" : step.gradient,
                    border: "none",
                    color: "#fff",
                    borderRadius: "10px", padding: "10px 22px",
                    fontSize: "13px", fontWeight: "700",
                    cursor: active === STEPS.length - 1 ? "not-allowed" : "pointer",
                    opacity: active === STEPS.length - 1 ? 0.3 : 1,
                    fontFamily: "'Syne', sans-serif",
                    boxShadow: active < STEPS.length - 1 ? `0 4px 16px ${step.glow}` : "none",
                    transition: "all 0.3s ease",
                  }}
                >{active === STEPS.length - 1 ? "Done ✓" : "Next →"}</button>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px", marginTop: "48px",
            animation: "fadeSlideIn 0.7s ease 0.3s both",
          }}>
            {[
              { val: "5", suffix: " Qs", label: "AI Questions Per Session", icon: "🤖" },
              { val: "100", suffix: "%", label: "Personalized to Your Role", icon: "🎯" },
              { val: "0", suffix: " ₹", label: "Free to Use, No Credit Card", icon: "💸" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px", padding: "24px",
                textAlign: "center",
                transition: "border-color 0.3s",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: "800", color: "#f8fafc" }}>
                  <Counter value={stat.val} />{stat.suffix}
                </div>
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div style={{ textAlign: "center", marginTop: "56px", animation: "fadeSlideIn 0.8s ease 0.4s both" }}>
            <div style={{
              background: step.gradient,
              borderRadius: "16px",
              padding: "1.5px",
              display: "inline-block",
              boxShadow: `0 8px 40px ${step.glow}50`,
              transition: "box-shadow 0.5s ease",
            }}>
              <button style={{
                background: "#07070e",
                border: "none",
                borderRadius: "14px",
                padding: "16px 48px",
                color: "#fff",
                fontSize: "15px", fontWeight: "800",
                cursor: "pointer",
                fontFamily: "'Syne', sans-serif",
                letterSpacing: "0.5px",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span>🚀 Start Your Free Mock Interview</span>
                <span style={{ color: step.color }}>→</span>
              </button>
            </div>
            <p style={{ color: "#334155", fontSize: "12px", marginTop: "14px", letterSpacing: "0.5px" }}>
              Free to use · No credit card · 5 AI questions per session
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
