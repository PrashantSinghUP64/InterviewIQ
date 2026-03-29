'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Mic, MessageSquare, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-8 h-8 text-indigo-400" />,
    title: 'AI Questions',
    desc: 'Role-specific questions generated in real-time by Gemini AI, tailored to your experience level and tech stack.',
    gradient: 'from-indigo-500/10 to-indigo-500/5',
    border: 'border-indigo-500/20 hover:border-indigo-500/50',
    glow: 'group-hover:shadow-indigo-500/10',
  },
  {
    icon: <Mic className="w-8 h-8 text-purple-400" />,
    title: 'Voice Analysis',
    desc: 'Speak your answers naturally. Our speech-to-text engine captures every word and feeds it to the AI for evaluation.',
    gradient: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/20 hover:border-purple-500/50',
    glow: 'group-hover:shadow-purple-500/10',
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-emerald-400" />,
    title: 'Smart Feedback',
    desc: 'Receive detailed ratings, model answers, and actionable improvement tips instantly after each interview session.',
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
    glow: 'group-hover:shadow-emerald-500/10',
  },
];

const testimonials = [
  {
    quote: 'This AI mock interview platform made me so confident! I cracked my FAANG interview thanks to Let\'s Prepare.',
    author: 'Arjun Sharma',
    role: 'Software Engineer @ Google',
    color: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/30',
  },
  {
    quote: 'Loved the instant feedback and analytics. Felt like a real interview experience. Highly recommend!',
    author: 'Priya Patel',
    role: 'Product Manager @ Microsoft',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
  },
];

const Page = () => {
  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans">

      {/* ── HEADER ──────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Let's Prepare
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-indigo-300 transition-colors duration-200">Features</a>
            <a href="#testimonials" className="text-sm text-slate-400 hover:text-indigo-300 transition-colors duration-200">Testimonials</a>
            <Link href="/dashboard">
              <button className="text-sm px-5 py-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/40 hover:border-indigo-400 transition-all duration-200">
                Dashboard
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ── HERO ────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-20">
          {/* Background orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Gemini AI
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              <span className="bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Ace Your Next
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                Interview with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              Practice with AI-generated mock interviews, get real-time voice analysis,
              and receive expert feedback — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <button
                  id="hero-start-interview-btn"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
                >
                  Start Interview
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  {/* Glow ring */}
                  <span className="absolute inset-0 rounded-xl ring-2 ring-indigo-500/0 group-hover:ring-indigo-500/50 transition-all duration-300" />
                </button>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-300 rounded-xl border border-slate-700 hover:border-indigo-500/60 hover:text-indigo-300 hover:bg-slate-800/50 transition-all duration-300"
              >
                See How It Works
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-slate-800/60">
              {[
                { value: '500+', label: 'Interview Topics' },
                { value: '10K+', label: 'Interviews Practised' },
                { value: '4.9★', label: 'User Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────── */}
        <section id="features" className="py-28 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Features</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  nail the interview
                </span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Powerful tools designed to build confidence, sharpen your answers, and help you stand out.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`group relative p-8 rounded-2xl bg-gradient-to-br ${f.gradient} border ${f.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${f.glow}`}
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────── */}
        <section id="testimonials" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Testimonials</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-100">
                What our users say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`relative p-8 rounded-2xl bg-gradient-to-br ${t.color} border ${t.border} transition-all duration-300 hover:scale-[1.01]`}
                >
                  <div className="text-5xl text-indigo-400/60 font-serif leading-none mb-4">"</div>
                  <p className="text-slate-300 leading-relaxed mb-6">{t.quote}</p>
                  <div>
                    <p className="font-semibold text-slate-100">{t.author}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ─────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                Ready to land your dream job?
              </h2>
              <p className="text-slate-400 mb-8">Join thousands of candidates who've already improved their interview skills.</p>
              <Link href="/dashboard">
                <button
                  id="cta-banner-btn"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Let's Prepare
            </span>
          </div>
          <p className="text-sm text-slate-600">© 2025 Let's Prepare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Page;
