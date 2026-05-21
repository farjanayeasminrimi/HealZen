"use client";

import Link from "next/link";
import { Home, ArrowLeft, Stethoscope } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/30">
          <Stethoscope className="h-10 w-10 text-brand-600 dark:text-brand-400" />
        </div>

        {/* Error Code */}
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
          The page you are looking for does not exist or may have been moved. You can return to the
          homepage or go back to the previous page.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700 cursor-pointer shadow-sm"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-250 transition hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-gray-400">HealZen • Your trusted healthcare companion</p>
      </div>
    </section>
  );
}

