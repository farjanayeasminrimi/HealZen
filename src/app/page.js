"use client";

import Benefits from "@/components/home/Benefits";
import CTA from "@/components/home/CTA";
import Hero from "@/components/home/Hero";
import Specialties from "@/components/home/Specialties";
import StatsHero from "@/components/home/StatsHero";
import Testimonials from "@/components/home/Testimonials";
import TopDoctors from "@/components/home/TopDoctors";

export default function Home() {
  return (
    <div className="w-full relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 min-h-screen transition-colors duration-300">
      {/* Hero banner */}
      <Hero></Hero>
      {/* Hero Stats */}
      <StatsHero></StatsHero>
      {/* Benefits */}
      <Benefits></Benefits>
      {/* Top rated Doctor's */}
      <TopDoctors></TopDoctors>
      {/* Specialties */}
      <Specialties></Specialties>
      {/* Testimonial */}
      <Testimonials></Testimonials>
      {/* Call to action btn */}
      <CTA></CTA>
    </div>
  );
}

