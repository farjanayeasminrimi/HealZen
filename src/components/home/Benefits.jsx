"use client";

import React from "react";
import Image from "next/image";
import { Clock, Award, CalendarCheck, ShieldCheck, Activity } from "lucide-react";
const Benefits = () => {
  // Reusable list of clinical advantages with icon component references
  const advantages = [
    {
      title: "24/7 Digital Support",
      desc: "Access customer support or consult availability instantly.",
      icon: Clock,
    },
    {
      title: "Board Certified Specialists",
      desc: "Top-tier professionals credentialed from elite hospitals.",
      icon: Award,
    },
    {
      title: "Consolidated Health Board",
      desc: "View all booked records and histories inside the dashboard.",
      icon: CalendarCheck,
    },
    {
      title: "Highly Secure Platform",
      desc: "Patient privacy is handled with bank-grade AES-256 standards.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
        {/* Left Side: Text and Benefits Grid */}
        <div className="flex flex-col gap-6">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
            Why HealZen Network
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">
            A Healthcare Infrastructure Built Around Your Peace of Mind
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
            We leverage modern digital coordination to simplify doctor consults. No long wait lines,
            no complicated phone tags. Book appointments within 60 seconds and track all history
            directly within your patient panel.
          </p>

          {/* Core Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {advantages.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="flex gap-4 group">
                  {/* Rounded Icon Backing with hover color swaps */}
                  <div className="w-10 h-10 shrink-0 bg-brand-50 dark:bg-brand-950/40 rounded-xl flex items-center justify-center group-hover:bg-brand-600 dark:group-hover:bg-brand-500 transition-all duration-300">
                    <IconComponent className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Visual Graphic Banner with Interactive Badge */}
        <div className="relative h-[380px] sm:h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/80">
          <Image
            src="https://i.ibb.co.com/b5KhQCpZ/hero-bg.jpg"
            alt="Medical Consultation graphic"
            fill
            className="object-cover object-center hover:scale-105 transition-transform duration-700"
          />

          {/* Floating Vitals Badge with glassmorphism overlay */}
          <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 p-5 rounded-xl shadow-lg border border-white/20 dark:border-slate-800/50 flex items-center gap-4 animate-float">
            <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Active Patient Monitoring
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-455 font-medium leading-none mt-1">
                Real-time vitals & medical schedule coordination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
