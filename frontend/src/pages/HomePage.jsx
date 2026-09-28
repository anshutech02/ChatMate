import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen w-screen flex flex-col relative overflow-x-hidden bg-[#07070d] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,106,238,0.12)_0%,transparent_40%),radial-gradient(circle_at_80%_80%,rgba(157,133,251,0.08)_0%,transparent_40%)]" />

      {/* Navbar */}
      <header className="flex justify-between items-center px-6 sm:px-10 py-4 border-b border-white/10 bg-[#0d0d18]/70 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/30">
            <i className="ri-brain-line" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            ContextGPT
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-20 relative z-10 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-6 shadow-sm">
          <i className="ri-sparkling-fill" />
          <span>Next-Generation Context-Aware AI</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5 bg-gradient-to-br from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent max-w-4xl">
          Conversations Supercharged with Precision Context
        </h1>

        <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-9">
          Select tailored context persona cards or upload custom PDF and text documents to guide the AI with pinpoint knowledge and writing style.
        </p>

        <div className="flex gap-3.5 flex-wrap justify-center mb-16">
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-xl shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Start Free Today</span>
            <i className="ri-arrow-right-line" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
          >
            Open Workspace
          </Link>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full text-left">
          <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl text-indigo-400 mb-3">
              📜
            </div>
            <h3 className="text-base font-bold text-white mb-1">Persona Cards</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Choose from formal letters, creative storytelling, code review, academic research, and more.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl text-emerald-400 mb-3">
              📂
            </div>
            <h3 className="text-base font-bold text-white mb-1">Document Context Cards</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Drop in PDFs or text files up to 10MB. ContextGPT extracts and feeds exact context directly to the LLM.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl text-cyan-400 mb-3">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white mb-1">Real-Time & Responsive</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Stream responses over WebSockets with glassmorphism aesthetics, mobile drawer, and instant markdown rendering.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-white/10 text-center text-xs text-zinc-500 z-10">
        © {new Date().getFullYear()} ContextGPT. All rights reserved.
      </footer>
    </div>
  );
}
