"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  // Track which slide index is currently active (0 or 1)
  const [currentSlide, setCurrentSlide] = useState(0);

  // Define the slide content data
  const slides = [
    {
      title: "Your Trustworthy Healthcare Partner",
      subtitle: "Connecting You With Top Clinical Specialists",
      description:
        "Experience hassle-free medical booking. Consult with board-certified medical experts tailored to your personalized health needs from the comfort of your home.",
      primaryCTA: "Book Appointment",
      primaryLink: "/appointments",
      secondaryCTA: "View Doctors",
      secondaryLink: "/appointments",
      image: "https://i.ibb.co.com/b5KhQCpZ/hero-bg.jpg", // First slide image
      tagline: "★ Accredited Hospital System",
    },
    {
      title: "Compassionate Care, Advanced Science",
      subtitle: "Available Whenever You Need Medical Council",
      description:
        "From routine checkups to comprehensive cardiovascular and neurological diagnoses, our practitioners are always ready to offer elite assistance.",
      primaryCTA: "Meet Our Team",
      primaryLink: "/appointments",
      secondaryCTA: "Dashboard Portal",
      secondaryLink: "/dashboard",
      image: "https://i.ibb.co.com/1JwyVRdZ/hero-bg-2.jpg", // Second slide image (distinct from slide 1)
      tagline: "♥ 98% Positive Health Outcomes",
    },
  ];

  // Auto-run slides: updates the active index every 5 seconds to let the zoom animation complete fully
  useEffect(() => {
    const timer = setInterval(() => {
      // Modulo operator ensures the index wraps back to 0 after the last slide
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    // Clean up the timer when the component unmounts to prevent memory leaks
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[550px] sm:h-[600px] lg:h-[650px] bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-200/60 dark:border-slate-850/80 transition-colors duration-300">
      {/* Slider viewport */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Slides container - swiping right-to-left based on currentSlide */}
        <div
          className="flex w-[200%] h-full will-change-transform"
          style={{
            transform: `translate3d(-${currentSlide * 50}%, 0, 0)`,
            transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <div key={index} className="w-1/2 h-full flex-shrink-0 relative flex items-center">
                {/* Premium Gradient Overlay: darkens backgrounds for absolute text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent z-10" />

                {/* Slide Background Image - aligned to the right side */}
                {/* Uses optimized transition-transform with 5000ms duration so the scale expands smoothly while active */}
                <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full opacity-20 lg:opacity-100 overflow-hidden">
                  <Image
                    src={slide.image}
                    width={680}
                    height={650}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    style={{
                      transform: isActive ? "scale(1.08)" : "scale(1)",
                      transition: "transform 5000ms cubic-bezier(0.25, 1, 0.5, 1)",
                      willChange: "transform",
                    }}
                  />
                </div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-20">
                  <div className="max-w-2xl text-left flex flex-col gap-4">
                    {/* Small badge above heading */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-400 w-fit uppercase tracking-widest border border-brand-200/50 dark:border-brand-900/30">
                      {slide.tagline}
                    </span>

                    {/* Responsive Slider Title (Adjustable sizes to avoid screen overflow) */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight text-slate-800 dark:text-white">
                      {slide.title}
                      <span className="block text-brand-600 dark:text-brand-400 mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold">
                        {slide.subtitle}
                      </span>
                    </h1>

                    {/* Slide Description Text */}
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                      {slide.description}
                    </p>

                    {/* Clean, Jump-Free buttons on hover */}
                    <div className="flex flex-wrap items-center gap-3.5 mt-4">
                      {/* Primary Solid Button: smooth background-color transition */}
                      <Link
                        href={slide.primaryLink}
                        className="px-6 py-3.5 bg-brand-600 text-white border border-brand-600 hover:bg-brand-700 hover:border-brand-700 dark:bg-brand-500 dark:border-brand-500 dark:hover:bg-brand-600 dark:hover:border-brand-600 rounded-xl text-xs font-bold transition-colors duration-300 shadow-sm"
                      >
                        {slide.primaryCTA}
                      </Link>

                      {/* Secondary Transparent Button: fills up fully with background color on hover */}
                      <Link
                        href={slide.secondaryLink}
                        className="px-6 py-3.5 bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-700 dark:hover:bg-slate-200 dark:hover:text-slate-900 dark:hover:border-slate-200 rounded-xl text-xs font-bold transition-colors duration-300 shadow-sm"
                      >
                        {slide.secondaryCTA}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Slide Indicators (Dots showing active slide) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
              idx === currentSlide
                ? "w-8 bg-brand-600 dark:bg-brand-500"
                : "w-2 bg-slate-300 dark:bg-slate-800"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
