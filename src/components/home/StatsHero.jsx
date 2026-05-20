"use client";

import React from "react";
import { Stethoscope, UserCheck, Users, Star } from "lucide-react";

const StatsHero = () => {
  const stats = [
    {
      label: "Active Certified Doctors",
      value: "150+",
      icon: <Stethoscope className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    },
    {
      label: "Successful Consultations",
      value: "24,000+",
      icon: <UserCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    },
    {
      label: "Satisfied Active Patients",
      value: "12,000+",
      icon: <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
    },
    {
      label: "Average Patient Rating",
      value: "4.9/5.0",
      icon: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />,
    },
  ];

  return (
    <section className="relative z-20 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Floating Card Wrapper with glassmorphic styles and custom shadows */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/85 rounded-2xl shadow-xl p-6 sm:p-8 transition-colors duration-300">
        {/* Grid layout that goes 1-column on mobile, 2 on tablet, and 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              // Adjust padding-left on larger devices to center dividers
              className={`flex items-center gap-4 sm:gap-5 ${
                idx > 0 ? "pt-6 sm:pt-0 lg:pl-8" : ""
              }`}
            >
              {/* Rounded icon backing */}
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl shrink-0 transition-colors duration-300">
                {stat.icon}
              </div>

              {/* Stat text detail */}
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-450 leading-tight">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsHero;
