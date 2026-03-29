import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { BrainCircuit } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="py-4">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
            Dashboard
          </h1>
        </div>
        <p className="text-slate-400 ml-[52px] text-sm md:text-base">
          Create a new mock interview or review your past sessions.
        </p>
      </div>

      {/* New Interview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <AddNewInterview />
      </div>

      {/* Previous Interviews */}
      <div className="w-full">
        <InterviewList />
      </div>
    </div>
  );
};

export default Dashboard;
