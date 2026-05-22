"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, HeartPulse } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast states
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Password Validation Rules
  const validatePassword = (value) => {
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasMinLength = value.length >= 6;

    if (!value.trim()) {
      return "Password field is required.";
    }

    if (!hasUppercase) {
      return "Password must contain at least 1 uppercase letter.";
    }

    if (!hasLowercase) {
      return "Password must contain at least 1 lowercase letter.";
    }

    if (!hasMinLength) {
      return "Password must be at least 6 characters long.";
    }

    return "";
  };

  // Email Validation
  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Email field is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleMockSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setEmailError("");
    setPasswordError("");
    setSubmitError("");

    const form = e.currentTarget?.form || e.currentTarget || e.target?.closest?.("form");

    if (!form) {
      return;
    }

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (emailValidation || passwordValidation) {
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      const loginData = Object.fromEntries(formData.entries());

      const loginParams = {
        email: loginData.email,
        password: loginData.password,
      };

      if (redirectTo) {
        loginParams.callbackURL = redirectTo;
      }

      const { data, error } = await authClient.signIn.email(loginParams);

      if (error) {
        setSubmitError(error.message || "Login failed. Please try again.");
        triggerToast(error.message || "Login failed. Please try again.");
        return;
      }

      if (data?.user) {
        triggerToast("Logged in successfully!");
        const destination = redirectTo || "/dashboard";
        router.push(destination);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialHandler = async () => {
    const socialParams = { provider: "google" };

    if (redirectTo) {
      socialParams.callbackURL = redirectTo;
    }

    await authClient.signIn.social(socialParams);
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/40 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Logo and Headings */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-4">
            <div className="bg-brand-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md">
              <HeartPulse className="h-6 w-6 animate-pulse" />
            </div>

            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
              Heal<span className="text-brand-600 dark:text-brand-400">Zen</span>
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Login
          </h1>

          <p className="text-xs text-slate-655 dark:text-slate-300 font-semibold mt-2">
            Access your HealZen patient panel
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass rounded-3xl p-6 pt-3 sm:p-8 sm:pt-3 shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 bg-white/80 dark:bg-slate-950/80">
          {/* Form */}
          <form onSubmit={handleMockSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-left text-[10px] font-extrabold text-slate-700 dark:text-slate-250 uppercase tracking-wider">
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>

                <input
                  type="email"
                  name="email"
                  value={email}
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (emailError) {
                      setEmailError(validateEmail(e.target.value));
                    }
                  }}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border rounded-2xl text-xs font-semibold text-slate-850 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors duration-300 shadow-sm ${
                    emailError
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 dark:border-slate-850 focus:border-brand-500"
                  }`}
                />
              </div>

              {emailError && (
                <p className="text-[11px] font-bold text-red-500 px-1">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-left text-[10px] font-extrabold text-slate-700 dark:text-slate-250 uppercase tracking-wider">
                  Password
                </label>

                <button
                  type="button"
                  className="text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>

                <input
                  type="password"
                  name="password"
                  value={password}
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (passwordError) {
                      setPasswordError(validatePassword(e.target.value));
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border rounded-2xl text-xs font-semibold text-slate-850 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors duration-300 shadow-sm ${
                    passwordError
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 dark:border-slate-850 focus:border-brand-500"
                  }`}
                />
              </div>

              {passwordError && (
                <div className="px-1 flex flex-col gap-1">
                  <p className="text-[11px] font-bold text-red-500">{passwordError}</p>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Password must contain:
                    <ul className="list-disc ml-4 mt-1">
                      <li>1 Uppercase letter</li>
                      <li>1 Lowercase letter</li>
                      <li>Minimum 6 characters</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Login Error */}
            {submitError && (
              <div className="w-full rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 px-4 py-3">
                <p className="text-[11px] font-bold text-red-500">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleMockSubmit}
              className="mt-2 w-full py-3.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10 active:scale-98 transition-all duration-300 cursor-pointer border border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>

            <span className="flex-shrink mx-4 text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Or Sign In With
            </span>

            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Social Sign-In Button */}
          <button
            type="button"
            onClick={socialHandler}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-350 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-2xl text-xs font-bold text-slate-755 dark:text-slate-200 transition-all duration-300 cursor-pointer shadow-sm active:scale-98"
          >
            {/* Google Icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.28-4.53-6.16-4.53z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Toggle Register Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-550 dark:text-slate-350 font-semibold">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline transition-colors font-extrabold"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
        {/* TOAST NOTIFICATION */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-teal-600 dark:bg-teal-500 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in border border-teal-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
