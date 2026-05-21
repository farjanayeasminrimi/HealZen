"use client";
 
import Link from "next/link";
import { Home, ArrowLeft, Stethoscope } from "lucide-react";
 
export default function NotFound() {
  return (
    <section className="w-full bg-slate-50/50 dark:bg-slate-900/40 py-20 sm:py-32 flex items-center justify-center px-6 transition-colors duration-300">
      <div className="max-w-lg w-full text-center glass rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/30">
          <Stethoscope className="h-10 w-10 text-brand-600 dark:text-brand-400 animate-float" />
        </div>
 
        {/* Error Code */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-400 w-fit uppercase tracking-widest border border-brand-200/50 dark:border-brand-900/30 mb-3">
          Error 404
        </span>
 
        {/* Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white sm:text-4xl leading-tight">
          Page Not Found
        </h1>
 
        {/* Description */}
        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          The clinic section or page you are looking for does not exist or may have been relocated.
          Let&apos;s get you back on track to your wellness journey.
        </p>
 
        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white border border-brand-600 hover:bg-brand-700 hover:border-brand-700 dark:bg-brand-500 dark:border-brand-500 dark:hover:bg-brand-600 dark:hover:bg-brand-600 px-5 py-3 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
 
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-700 dark:hover:bg-slate-200 dark:hover:text-slate-900 dark:hover:border-slate-200 px-5 py-3 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
 
        {/* Footer */}
        <p className="mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          HealZen • Your trusted healthcare companion
        </p>
      </div>
    </section>
  );
}

