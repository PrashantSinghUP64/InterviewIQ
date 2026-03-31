"use client";

import { UserButton } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Sparkles, LayoutDashboard, HelpCircle, Zap, BookOpen, Bell } from 'lucide-react';
import { ThemeToggle } from '../../_components/ThemeToggle';
import MockSchedulerModal from './MockSchedulerModal';
import StreakBadge from './StreakBadge';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Companies', href: '/dashboard/companies', icon: Zap },
  { label: 'STAR Builder', href: '/dashboard/star-builder', icon: BookOpen },
  { label: 'How It Works', href: '/dashboard/how', icon: HelpCircle },
];

const Header = () => {
  const path = usePathname();
  const router = useRouter();
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  useEffect(() => {
    // Check if notifications are supported and target time is met
    const checkSchedule = () => {
      const scheduledTime = localStorage.getItem('interviewiq_scheduler');
      if (!scheduledTime) return;

      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      if (scheduledTime === currentTimeString) {
        // To prevent massive spam, check if we've already notified for this specific minute today
        const lastNotified = localStorage.getItem('interviewiq_last_notified');
        const todayString = now.toDateString();
        
        if (lastNotified !== todayString) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Time to Practice!', {
              body: 'Your scheduled mock interview time has arrived. Let\'s get started!',
              icon: '/favicon.ico', // fallback
            });
            localStorage.setItem('interviewiq_last_notified', todayString);
          }
        }
      }
    };

    const intervalId = setInterval(checkSchedule, 60000); // Check every minute
    checkSchedule(); // check immediately on mount

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200"
          id="header-brand-btn"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
            InterviewIQ
          </span>
        </button>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const isActive = path === href;
            return (
              <button
                key={href}
                id={`header-nav-${label.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => router.push(href)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100/60 dark:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <StreakBadge />
          <button 
            onClick={() => setIsSchedulerOpen(true)}
            className="p-2 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'ring-2 ring-indigo-500/40 hover:ring-indigo-500/70 transition-all duration-200',
              },
            }}
          />
        </div>
      </div>
      <MockSchedulerModal isOpen={isSchedulerOpen} onClose={() => setIsSchedulerOpen(false)} />
    </header>
  );
};

export default Header;