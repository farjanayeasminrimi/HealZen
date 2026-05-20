"use client";

import React from "react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 transition-colors duration-300">
      {/* Container holding gradient backings and geometrical floating vectors */}
      <div className="relative bg-gradient-to-r from-brand-700 to-brand-850 dark:from-brand-900 dark:to-slate-950 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-12 lg:p-16 text-center max-w-5xl mx-auto border border-brand-600/10 dark:border-slate-800/40">
        {/* Geometric white accent grid in the background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Content area */}
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6 items-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Ready to Book Your Health Consultation?
          </h2>

          <p className="text-sm sm:text-base text-brand-100 font-semibold leading-relaxed">
            Join HealZen hospital networks today. Browse all accredited medical practitioners, read
            patient testimonies, and reserve your time slot dynamically.
          </p>

          {/* Interactive buttons with smooth hover animations */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href="/appointments"
              className="px-8 py-4 bg-white text-brand-800 hover:bg-slate-100 rounded-xl text-sm font-bold shadow-md transition-colors duration-300 cursor-pointer"
            >
              Book Appointment Now
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-brand-600 border border-brand-500 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors duration-300 cursor-pointer"
            >
              Explore Patient Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
