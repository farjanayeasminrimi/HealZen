"use client";

import Hero from "@/components/home/Hero";

export default function Home() {
  return (
    <div className="w-full relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 min-h-screen transition-colors duration-300">
      {/* Hero banner */}
      <Hero></Hero>
      <h1>Home Page</h1>
    </div>
  );
}
