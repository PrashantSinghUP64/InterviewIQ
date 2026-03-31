"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { db } from '@/utils/db';
import { StarStory } from '@/utils/schema';
import { eq, desc } from 'drizzle-orm';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, ArrowLeft, PenTool, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';

const StarBuilderPage = () => {
  const { user } = useUser();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [rawStory, setRawStory] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [stories, setStories] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      setFetching(true);
      const data = await db.select()
        .from(StarStory)
        .where(eq(StarStory.userEmail, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(StarStory.id));
      
      setStories(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load your stories.");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !rawStory) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: title,
          rawStory: rawStory,
          userEmail: user?.primaryEmailAddress?.emailAddress
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Story organized successfully into STAR format!");
        setTitle('');
        setRawStory('');
        await fetchStories(); // reload list
      } else {
        toast.error(data.error || "Failed to generate STAR format.");
      }
    } catch (error) {
      toast.error("An error occurred during formation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <button 
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-yellow-100 dark:bg-yellow-600/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          STAR Answer Builder
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Drop your messy life stories, projects, or challenges. Groq AI will instantly rewrite them into the powerful STAR format (Situation, Task, Action, Result) so you are always ready for behavioral interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Form */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden sticky top-24">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <PenTool className="w-5 h-5 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Draft New Story</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Story Title
                </label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fixing the legacy payment bug"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Raw Details (Dump everything here)
                </label>
                <textarea 
                  required
                  rows={6}
                  value={rawStory}
                  onChange={(e) => setRawStory(e.target.value)}
                  placeholder="We had an issue where payments were double charging. I looked into the logs, found the race condition. I wrote a lock mechanism in Redis. It dropped errors to 0..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !title || !rawStory}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Structuring...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Generate STAR Format
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Story Bank */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Your Story Bank</h2>
          </div>

          {fetching ? (
             <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
             </div>
          ) : stories.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center py-20 text-center px-4">
               <div className="w-16 h-16 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400" />
               </div>
               <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">Your Story Bank is empty</p>
               <p className="text-sm text-slate-500 max-w-[280px]">Fill out the form on the left to structure your first behavioral story!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {stories.map((story) => (
                <div key={story.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden group">
                  <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{story.storyTitle}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> {story.createdAt}
                    </div>
                  </div>
                  <div className="p-6 prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-p:leading-relaxed">
                    <ReactMarkdown>{story.starFormatted}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StarBuilderPage;
