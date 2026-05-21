"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X, HeartPulse } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname(); // Tracks current URL path (e.g., "/" or "/dashboard")

  // React State variables
  const [theme, setTheme] = useState("light"); // Tracks active color theme ("light" or "dark")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Controls mobile dropdown state

  // ----------------------------------------------------
  // EFFECT 1: Runs once when component mounts in browser
  // ----------------------------------------------------
  useEffect(() => {
    // Sync theme from localStorage (persists theme settings across tab refreshes)
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ----------------------------------------------------
  // ACTION HANDLER: Toggles Light and Dark Modes
  // ----------------------------------------------------
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Adds or removes the ".dark" class on the root <html> element
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Nav link configuration objects (reusable in desktop and mobile rendering)
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Appointment", href: "/appointments" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    // High-Density Glass backdrop blur with thick borders so text stands out in high-contrast over background elements
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-900/90 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* 1. BRAND LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md">
              <HeartPulse className="h-6 w-6 animate-pulse" />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
              Heal<span className="text-brand-600 dark:text-brand-400">Zen</span>
            </span>
          </Link>

          {/* 2. DESKTOP NAVIGATION LINKS (Adjusted text size to text-base for absolute visual elegance) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              // Checks if current router path matches the link destination for active styling
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  // Enlarge to text-base (16px) and tracking-wide for visual balance
                  className={`relative text-base font-semibold tracking-wide transition-all duration-300 py-2 ${
                    isActive
                      ? "text-brand-600 dark:text-brand-400 font-bold"
                      : "text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    // Teal indicator line under the active menu link
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT CONTROLS (Theme Switch & Visual Auth Buttons) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              // Normal hover: smooth background/border transition without shifting text dimensions
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300 shadow-sm cursor-pointer active:scale-95"
              aria-label="Toggle Light/Dark Theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Visual Login Button (Transparent/Outline fills on hover) */}
            <Link
              href="/login"
              className="px-4 py-2.5 bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-700 dark:hover:bg-slate-200 dark:hover:text-slate-900 dark:hover:border-slate-200 rounded-xl text-sm font-bold transition-colors duration-300 shadow-sm"
            >
              Login
            </Link>

            {/* Visual Register Button (Solid color transitions on hover) */}
            <Link
              href="/register"
              className="px-4 py-2.5 bg-brand-600 text-white border border-brand-600 hover:bg-brand-700 hover:border-brand-700 dark:bg-brand-500 dark:border-brand-500 dark:hover:bg-brand-600 dark:hover:border-brand-600 rounded-xl text-sm font-bold transition-colors duration-300 shadow-sm"
            >
              Register
            </Link>
          </div>

          {/* 4. MOBILE DEVICE TOGGLES & TRIGGERS */}
          <div className="flex items-center gap-2 gap-x-3 md:hidden">
            {/* Theme Toggle (Mobile view) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              aria-label="Toggle Mobile Theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Mobile Hamburger menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. MOBILE DROPDOWN DRAWER
          Added premium backdrop-blur-xl and highly opaque bg values (95%) 
          so the navigation overlay completely masks any underlying elements.
      */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-900/85 transition-all duration-300 animate-fade-in">
          <div className="px-4 pt-3 pb-6 space-y-4">
            <div className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    // text-base for absolute visual elegance
                    className={`block px-4 py-3 rounded-xl text-base font-extrabold transition-all duration-200 ${
                      isActive
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Visual Auth Buttons Panel */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-3 bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-700 dark:hover:bg-slate-200 dark:hover:text-slate-900 dark:hover:border-slate-200 rounded-xl text-sm font-extrabold transition-colors duration-300 shadow-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-3 bg-brand-600 text-white border border-brand-600 hover:bg-brand-700 hover:border-brand-700 dark:bg-brand-500 dark:border-brand-500 dark:hover:bg-brand-600 dark:hover:border-brand-600 rounded-xl text-sm font-extrabold transition-colors duration-300 shadow-sm"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
