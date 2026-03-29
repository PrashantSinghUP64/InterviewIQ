'use client'

import { SignIn } from '@clerk/nextjs'
import { Sparkles, Brain, Mic, BarChart2, Star } from 'lucide-react'
import { useEffect } from 'react'

const features = [
  {
    icon: Brain,
    color: 'text-indigo-400',
    bg: 'bg-indigo-600/20 border-indigo-500/30',
    title: 'AI-Generated Questions',
    desc: 'Tailored to your role and experience level in real-time.',
  },
  {
    icon: Mic,
    color: 'text-purple-400',
    bg: 'bg-purple-600/20 border-purple-500/30',
    title: 'Voice Analysis',
    desc: 'Speak naturally — AI transcribes and evaluates every word.',
  },
  {
    icon: BarChart2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/20 border-emerald-500/30',
    title: 'Instant Feedback',
    desc: 'Detailed score, model answers, and improvement tips.',
  },
]

export default function Page() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* ── Clerk dark overrides ── */
      .cl-rootBox { width: 100% !important; }
      .cl-card {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }
      .cl-headerTitle, .cl-headerSubtitle { display: none !important; }
      .cl-socialButtonsBlockButton {
        background: rgb(30 41 59 / 0.8) !important;
        border: 1px solid rgb(100 116 139 / 0.35) !important;
        border-radius: 12px !important;
        color: #e2e8f0 !important;
        font-weight: 600 !important;
        height: 48px !important;
        transition: all 0.2s ease;
      }
      .cl-socialButtonsBlockButton:hover {
        background: rgb(99 102 241 / 0.15) !important;
        border-color: rgb(99 102 241 / 0.5) !important;
      }
      .cl-socialButtonsBlockButtonText { color: #e2e8f0 !important; }
      .cl-formFieldInput {
        background: rgb(30 41 59 / 0.8) !important;
        border: 1px solid rgb(100 116 139 / 0.35) !important;
        border-radius: 12px !important;
        color: #e2e8f0 !important;
        height: 48px !important;
        padding: 12px 16px !important;
        transition: all 0.2s ease;
      }
      .cl-formFieldInput:focus {
        border-color: rgb(99 102 241 / 0.6) !important;
        box-shadow: 0 0 0 3px rgb(99 102 241 / 0.15) !important;
        outline: none !important;
      }
      .cl-formFieldInput::placeholder { color: #64748b !important; }
      .cl-formFieldLabel { color: #94a3b8 !important; font-size: 12px !important; font-weight: 600 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }
      .cl-formButtonPrimary {
        background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
        border-radius: 12px !important;
        border: none !important;
        font-weight: 700 !important;
        height: 48px !important;
        box-shadow: 0 4px 14px rgba(99,102,241,0.35) !important;
        transition: all 0.2s ease !important;
      }
      .cl-formButtonPrimary:hover {
        box-shadow: 0 6px 20px rgba(99,102,241,0.5) !important;
        transform: translateY(-1px) !important;
      }
      .cl-dividerLine { background: rgb(100 116 139 / 0.2) !important; }
      .cl-dividerText { color: #475569 !important; background: transparent !important; }
      .cl-footerActionText { color: #64748b !important; }
      .cl-footerActionLink { color: #818cf8 !important; font-weight: 600 !important; }
      .cl-footerActionLink:hover { color: #a5b4fc !important; text-decoration: underline !important; }
      .cl-identityPreviewText { color: #e2e8f0 !important; }
      .cl-identityPreviewEditButtonIcon { color: #818cf8 !important; }
      .cl-formFieldError { color: #f87171 !important; }
      .cl-otpCodeFieldInput {
        background: rgb(30 41 59 / 0.8) !important;
        border: 1px solid rgb(100 116 139 / 0.35) !important;
        border-radius: 10px !important;
        color: #e2e8f0 !important;
      }
      .cl-alertText { color: #f87171 !important; }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* ── Left Panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[280px] h-[280px] bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/95 to-indigo-950/30 pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Let's Prepare
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
              AI Interview Platform
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-transparent">
                Ace Your Next
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                Interview with AI
              </span>
            </h1>
            <p className="mt-4 text-slate-400 leading-relaxed max-w-sm">
              Practice with real AI-generated questions, speak your answers, and get detailed scoring — all in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${bg} shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex gap-0.5">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-400">
              <span className="text-slate-200 font-semibold">10,000+</span> interviews practised
            </p>
          </div>
        </div>

        {/* Bottom border line */}
        <div className="relative z-10 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      {/* ── Right Panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Let's Prepare
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-100">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-2">Sign in to continue your interview practice</p>
          </div>

          {/* Clerk Card wrapper */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 shadow-2xl shadow-black/40">
            <SignIn redirectUrl="/dashboard" />
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-600 mt-6">
            By signing in, you agree to our{' '}
            <span className="text-indigo-500 hover:underline cursor-pointer">Terms</span> and{' '}
            <span className="text-indigo-500 hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
