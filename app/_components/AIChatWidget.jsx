"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, GraduationCap, Loader2 } from "lucide-react";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hi! I'm your AI Study Assistant. What tech or interview doubt can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const historyStr = messages
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
        .join("\n");
      const prompt = `You are InterviewIQ's expert AI Career & Study Assistant.\nKeep answers concise, helpful and focused on tech/interviews.\n\nPast Chat:\n${historyStr}\n\nUser: ${userMsg}\nAI:`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      if (!data.text) throw new Error(data.error || "Empty response");

      setMessages((prev) => [...prev, { role: "ai", content: data.text }]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Tooltip (Only show when closed) */}
      {!isOpen && (
        <div className="absolute right-[60px] top-1/2 -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap hidden md:block">
          AI Career Guide
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-4 w-[340px] h-[480px] bg-[#0c1120] border border-indigo-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">AI Study Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] text-sm p-3 rounded-2xl leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white/5 text-zinc-200 border border-white/10 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white/5 border-t border-white/10">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 bg-[#060912] border border-white/10 rounded-full pr-1.5 pl-4 py-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your doubt..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="peer group w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl hover:scale-110 hover:-rotate-3 text-white flex justify-center items-center shadow-[0_8px_28px_rgba(99,102,241,0.28)] hover:shadow-[0_8px_44px_rgba(99,102,241,0.48)] transition-all duration-300"
        >
          <GraduationCap className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
