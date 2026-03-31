"use client";

import React, { useState, useEffect } from 'react';
import { BellRing, Check, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

const MockSchedulerModal = ({ isOpen, onClose }) => {
  const [scheduledTime, setScheduledTime] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('interviewiq_scheduler');
      if (saved) setScheduledTime(saved);
      
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!scheduledTime) {
      toast.error('Please select a valid time.');
      return;
    }

    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== 'granted') {
        toast.error('You must allow notifications to use the scheduler.');
        return;
      }
    }

    localStorage.setItem('interviewiq_scheduler', scheduledTime);
    toast.success(`Practice reminder set for ${scheduledTime} daily!`);
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('interviewiq_scheduler');
    setScheduledTime('');
    toast.info('Practice reminder removed.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 opacity-80" /> Practice Scheduler
          </h2>
          <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Set a daily reminder to take a mock interview. When the time arrives, we'll send you a browser notification to jumpstart your daily practice.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Target Practice Time
              </label>
              <input 
                type="time" 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
              />
            </div>

            {notificationPermission === 'denied' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 rounded-xl">
                 <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                   Notifications are blocked in your browser settings. Please allow them for this site.
                 </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
             <button 
               onClick={handleClear}
               disabled={!scheduledTime}
               className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
             >
               Clear
             </button>
             <button 
               onClick={handleSave}
               className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
             >
               <Check className="w-4 h-4" /> Save Schedule
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MockSchedulerModal;
