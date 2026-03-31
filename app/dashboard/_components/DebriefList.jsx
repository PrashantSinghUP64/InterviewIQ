"use client";

import { db } from '@/utils/db';
import { InterviewDebrief } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import DebriefItemCard from './DebriefItemCard';
import { Sparkles, Loader2 } from 'lucide-react';

const DebriefList = () => {
  const { user } = useUser();
  const [debriefList, setDebriefList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) GetDebriefList();
  }, [user]);

  const GetDebriefList = async () => {
    setLoading(true);
    const result = await db
      .select()
      .from(InterviewDebrief)
      .where(eq(InterviewDebrief.userEmail, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(InterviewDebrief.id));
    setDebriefList(result);
    setLoading(false);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">Past Debrief Analysis</h2>
        {!loading && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-500">
            {debriefList.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : debriefList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-t border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">No real debriefs yet</p>
          <p className="text-slate-500 text-sm mt-1">Log your first real interview to get an action plan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debriefList.map((debrief, index) => (
            <DebriefItemCard debrief={debrief} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DebriefList;
