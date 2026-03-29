"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon, Camera, CheckCircle2, ArrowRight, Briefcase, Code2, Clock } from "lucide-react";
import Link from "next/link";
import Webcam from "react-webcam";
import { useParams } from "next/navigation";

const InterviewPage = () => {
  const params = useParams();
  const interviewId = params?.interviewId;

  const [interviewData, setInterviewData] = useState(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (interviewId) GetInterviewDetails();
  }, [interviewId]);

  const GetInterviewDetails = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId));
      setInterviewData(result[0]);
    } catch (error) {
      console.error("Error fetching interview details:", error);
      alert("Failed to fetch interview details.");
    }
  };

  const handlePermissionRequest = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionGranted(true);
      setWebCamEnabled(true);
    } catch (err) {
      alert("❌ Permission denied or error occurred.");
      console.error("Permission error:", err);
    }
  };

  const detailItems = [
    { icon: Briefcase, label: 'Job Role', value: interviewData?.jobPosition },
    { icon: Code2, label: 'Tech Stack', value: interviewData?.jobDesc },
    { icon: Clock, label: 'Experience', value: interviewData?.jobExperience ? `${interviewData.jobExperience} Year${interviewData.jobExperience > 1 ? 's' : ''}` : null },
  ];

  return (
    <div className="py-6 max-w-5xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Interview Setup</h1>
        <p className="text-slate-400 text-sm mt-1">Review your interview details and enable your camera to begin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left: Details + Info ─────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Interview Details Card */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Details</h2>
            <div className="space-y-3">
              {detailItems.map(({ icon: Icon, label, value }) => (
                value && (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm font-medium text-slate-200 mt-0.5">{value}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-amber-400">Before You Start</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                Enable your <span className="text-slate-200 font-medium">webcam & microphone</span> to begin the AI mock interview.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                You'll answer <span className="text-slate-200 font-medium">5 AI-generated questions</span>. A detailed report follows.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span className="text-slate-400 italic">We never record or store your video.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Right: Camera ────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-video rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden flex items-center justify-center">
            {permissionGranted ? (
              <>
                <Webcam
                  mirrored
                  className="w-full h-full object-cover"
                  onUserMedia={() => setWebCamEnabled(true)}
                  onUserMediaError={() => {
                    alert("Webcam access error");
                    setWebCamEnabled(false);
                    setPermissionGranted(false);
                  }}
                />
                {/* Online indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700">
                  <WebcamIcon className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Camera Disabled</p>
                  <p className="text-slate-500 text-sm mt-1">Click below to grant access</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera toggle button */}
          <button
            id="grant-camera-btn"
            onClick={handlePermissionRequest}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              permissionGranted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-indigo-600/10 hover:border-indigo-500/40 hover:text-indigo-300'
            }`}
            disabled={permissionGranted}
          >
            {permissionGranted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Camera & Microphone Active
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Grant Camera & Mic Access
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Start Button ──────────────────────────── */}
      <div className="flex justify-end mt-8">
        {permissionGranted ? (
          <Link href={`/dashboard/interview/${interviewId}/start`}>
            <button
              id="start-interview-btn"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
            >
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-slate-500 bg-slate-800/60 border border-slate-700 cursor-not-allowed"
          >
            Start Interview
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
