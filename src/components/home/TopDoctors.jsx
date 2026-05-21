"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Award, Sparkles, MapPin, Clock } from "lucide-react";
import { doctorsCollection } from "@/lib/action/data";
import { fallbackDoctors } from "@/lib/action/fallbackData";

export default function TopDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const fetched = await doctorsCollection();
        if (Array.isArray(fetched) && fetched.length > 0) {
          setDoctors(fetched);
        } else {
          setDoctors(fallbackDoctors);
        }
      } catch (err) {
        console.error("Failed to load top doctors on homepage:", err);
        setDoctors(fallbackDoctors);
      } finally {
        setLoading(false);
      }
    };
    fetchTopDoctors();
  }, []);

  // Sort by rating (descending) and select top 3
  const topThreeDoctors = [...doctors]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  return (
    <section className="bg-slate-100/30 dark:bg-slate-950/20 border-t border-b border-slate-200/50 dark:border-slate-850/50 py-16 sm:py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Area */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block">
            Top Specialists
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
            Our Top Ranked Practitioners
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-xl mx-auto">
            Consult with the highest-rated doctors in our network, recognized for outstanding clinical care and patient reviews.
          </p>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? // Skeleton Loader
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl overflow-hidden flex flex-col h-[460px] animate-pulse"
                >
                  <div className="h-56 bg-slate-200 dark:bg-slate-800 w-full" />
                  <div className="p-6 flex flex-col flex-grow gap-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-xl w-full mt-2" />
                  </div>
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 mt-auto flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  </div>
                </div>
              ))
            : // Doctor Cards
              topThreeDoctors.map((doc, idx) => {
                const docId = doc._id || doc.id;
                // Colors for rank badges
                const rankColors = [
                  "bg-amber-500/90 dark:bg-amber-600/90 text-white shadow-amber-500/10",
                  "bg-slate-400/90 dark:bg-slate-550/90 text-white shadow-slate-400/10",
                  "bg-amber-700/90 dark:bg-amber-800/90 text-white shadow-amber-700/10"
                ];

                return (
                  <div
                    key={docId}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden card-hover flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    {/* Upper Porting: Photo & Ribbons */}
                    <div className="relative h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                      {doc.image ? (
                        <Image
                          src={doc.image}
                          alt={doc.name}
                          fill
                          className="object-cover object-top hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                          <span className="text-2xl font-black">
                            {doc.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div
                        className={`absolute top-4 left-4 text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-xs ${rankColors[idx]}`}
                      >
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>Rank #{idx + 1}</span>
                      </div>

                      {/* Specialty Badge */}
                      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-brand-700 dark:text-brand-400 text-[11px] font-bold px-3 py-1 rounded-lg border border-brand-100/50 dark:border-slate-800/60 shadow-sm">
                        {doc.specialty}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-extrabold text-slate-805 dark:text-white leading-snug mb-1">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-3">
                        {doc.qualifications}
                      </p>

                      {/* Experience and Hospital Location */}
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <Award className="w-4 h-4 text-brand-600 dark:text-brand-450 shrink-0" />
                          <span>{doc.experience} Clinical Practice</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.hospital}</span>
                        </div>
                      </div>

                      {/* Rating details row */}
                      <div className="mt-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 ml-0.5">
                            {doc.rating}
                          </span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {doc.reviewsCount} Patient Feedbacks
                        </span>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="border-t border-slate-100 dark:border-slate-800/85 p-5 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                          Consult Fee
                        </span>
                        <span className="text-base font-extrabold text-slate-800 dark:text-white leading-none">
                          ${doc.fee}
                        </span>
                      </div>

                      <Link
                        href={`/appointments/${docId}`}
                        className="px-4.5 py-2.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
