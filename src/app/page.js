"use client";

import Benefits from "@/components/home/Benefits";
import Hero from "@/components/home/Hero";
import StatsHero from "@/components/home/StatsHero";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <div className="w-full relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 min-h-screen transition-colors duration-300">
      {/* Hero banner */}
      <Hero></Hero>
      {/* Hero Stats */}
      <StatsHero></StatsHero>
      {/* Benefits */}
      <Benefits></Benefits>
      <Testimonials></Testimonials>
      <h1>Home Page</h1>
    </div>
  );
}
