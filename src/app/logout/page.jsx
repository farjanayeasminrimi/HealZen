"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const signOutUser = async () => {
      await authClient.signOut();
    };
    signOutUser();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-xl w-full text-center rounded-4xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 shadow-2xl">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 flex items-center justify-center">
          <LogOut className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
          You are logged out
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Your session has been cleared. You can return to the login page or continue browsing the
          site.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-2xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all duration-200"
          >
            Go to Login
          </Link>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
