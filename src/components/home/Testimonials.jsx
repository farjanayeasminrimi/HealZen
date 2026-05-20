"use client";

import React from "react";
import { Star } from "lucide-react";

export default function Testimonials() {
  // Predefined review feedback - simple array configuration
  const testimonials = [
    {
      author: "Marcus Vance",
      comment:
        "The coordination on HealZen was perfect. I found a highly rated neurologist in Dr. Emily Ross, booked inside two clicks, and had my treatment plan within 24 hours.",
      role: "Neurology Patient",
      stars: 5,
    },
    {
      author: "Elena Rostova",
      comment:
        "As a busy mother of two, pediatric scheduling used to be a nightmare. Now I book Dr. Chen in seconds, and my children's schedules are saved digitally.",
      role: "Mother of Two",
      stars: 5,
    },
    {
      author: "Gerald Stone",
      comment:
        "Outstanding service. Dr. Jenkins' diagnostic accuracy combined with HealZen's automated dashboard and reminders kept my cardiac rehab entirely on track.",
      role: "Cardiology Patient",
      stars: 5,
    },
  ];

  return (
    <section className="bg-slate-100/50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-850/50 py-16 sm:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1.5 block">
            Patient Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Testimonials from Patient
          </h2>
        </div>

        {/* Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4 relative"
            >
              {/* Rating stars row */}
              <div className="flex gap-0.5">
                {[...Array(test.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Review content */}
              <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed font-medium flex-grow">
                &quot;{test.comment}&quot;
              </p>

              {/* Reviewer bio footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                {/* Visual Initial Avatar */}
                <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950/40 rounded-full flex items-center justify-center font-black text-xs text-brand-600 dark:text-brand-400 shadow-inner">
                  {test.author.charAt(0)}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    {test.author}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                    {test.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
