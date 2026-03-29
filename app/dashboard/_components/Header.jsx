"use client";

import { UserButton } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { Sparkles, LayoutDashboard, HelpCircle, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'How It Works', href: '/dashboard/how', icon: HelpCircle },
  { label: 'Upgrade', href: '/dashboard/upgrade', icon: Zap },
];

const Header = () => {
  const path = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60">
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
            Let's Prepare
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
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'ring-2 ring-indigo-500/40 hover:ring-indigo-500/70 transition-all duration-200',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;