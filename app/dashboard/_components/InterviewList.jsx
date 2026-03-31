"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { History, Loader2 } from "lucide-react";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    setLoading(true);
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(MockInterview.id));
    setInterviewList(result);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">Previous Sessions</h2>
        {!loading && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-500">
            {interviewList.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : interviewList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-4">
            <History className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">No interviews yet</p>
          <p className="text-slate-600 text-sm mt-1">Create your first mock interview above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewList.map((interview, index) => (
            <InterviewItemCard interview={interview} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewList;