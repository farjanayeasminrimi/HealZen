"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Activity, Users, TrendingUp, ShieldCheck } from "lucide-react";

export default function Specialties() {
  // Reusable array configuration for clinical division cards
  const specialties = [
    {
      name: "Cardiology",
      desc: "Expert heart and vascular care",
      count: "12 Doctors",
      icon: <Activity className="w-8 h-8 text-rose-500" />,
      bg: "bg-rose-50 dark:bg-rose-950/20",
    },
    {
      name: "Pediatrics",
      desc: "Compassionate child development care",
      count: "18 Doctors",
      icon: <Users className="w-8 h-8 text-sky-500" />,
      bg: "bg-sky-50 dark:bg-sky-950/20",
    },
    {
      name: "Neurology",
      desc: "Advanced brain and nerve treatments",
      count: "8 Doctors",
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      name: "Orthopedics",
      desc: "Surgical and joint mobility care",
      count: "15 Doctors",
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ];

  return (
    <section className="bg-slate-100/50 dark:bg-slate-950/40 border-y border-slate-200/50 dark:border-slate-850/50 py-16 sm:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1.5 block">
              Departments
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Explore Clinical Divisions
            </h2>
          </div>
          <Link
            href="/appointments"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:translate-x-1 transition-all duration-300"
          >
            See All Specialists <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Division Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((dept, idx) => (
            <Link
              key={idx}
              href={`/appointments?dept=${dept.name}`}
              className="group flex flex-col p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              {/* Specialized Division Icon backing with bounce-hover effect */}
              <div
                className={`w-14 h-14 rounded-2xl ${dept.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {dept.icon}
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {dept.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 leading-relaxed font-medium mb-4 flex-grow">
                {dept.desc}
              </p>

              {/* Doctor count badge */}
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg w-fit transition-colors">
                {dept.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
