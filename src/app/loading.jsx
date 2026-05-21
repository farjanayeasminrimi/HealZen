"use client";

import React from "react";
import { HeartPulse } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[75vh] w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 transition-colors duration-300">
      <div className="flex flex-col items-center gap-4 max-w-xs text-center">
        {/* Animated pulsing icon container */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/30 shadow-md">
          <HeartPulse className="h-10 w-10 text-brand-600 dark:text-brand-400 animate-pulse" />
          {/* Subtle outer ripple waves */}
          <span className="absolute inline-flex h-full w-full rounded-3xl bg-brand-400 opacity-20 animate-ping pointer-events-none"></span>
        </div>

        {/* Loading text details */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Heal<span className="text-brand-600 dark:text-brand-400">Zen</span>
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1 animate-pulse">
            Connecting you to secure healthcare...
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2 relative">
          <div className="absolute top-0 bottom-0 left-0 w-full bg-brand-600 dark:bg-brand-400 rounded-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
}
