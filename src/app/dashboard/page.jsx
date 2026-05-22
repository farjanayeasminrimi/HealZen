"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Trash2,
  User,
  Edit2,
  X as CloseIcon,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const getUserInitial = (name, email) => {
  const char = name?.trim()?.[0] || email?.trim()?.[0] || "U";
  return String(char).toUpperCase();
};

function AvatarLoader({ src, fallbackInitial, sizeClass = "w-14 h-14" }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isUrl =
    src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/") ||
      src.includes(".png") ||
      src.includes(".jpg") ||
      src.includes(".jpeg") ||
      src.includes(".svg") ||
      src.includes("data:image"));

  if (!isUrl || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100 font-bold uppercase`}
      >
        {fallbackInitial}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative shrink-0`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-xl font-bold uppercase text-slate-700 dark:text-slate-100 transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        {fallbackInitial}
      </div>
      <Image
        src={src}
        alt="Patient Profile Picture"
        fill
        onLoadingComplete={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="object-cover object-center transition-opacity duration-300"
        unoptimized
      />
    </div>
  );
}

/**
 * PATIENT PORTAL DASHBOARD PAGE
 * Renders a complete interactive client panel for appointment tracking and biographical cards.
 *
 * Features:
 * - Tab-based Navigation: "My Bookings Track" vs "My Profile".
 * - Dynamic Profile Customization: Patients can change their profile Name and select from 4 preset avatars.
 * - LocalStorage Synchronizations: Profile edits automatically persist locally and propagate to appointment details.
 * - Non-jumpy buttons with smooth transitions.
 */
export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab control state: "bookings" or "profile"
  const [activeTab, setActiveTab] = useState(() => {
    // Check if tab query parameter is set to "profile"
    return searchParams.get("tab") === "profile" ? "profile" : "bookings";
  });

  // Editing state variables
  const [isEditing, setIsEditing] = useState(false);

  // Get session data
  const { data: session, isPending, error, refetch } = authClient.useSession();

  // Use session user data, fallback to localStorage
  const getInitialUser = () => {
    if (session?.user) {
      return {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || "",
        phone: session.user.phone || "+1 (555) 000-0000",
        age: session.user.age || 30,
        gender: session.user.gender || "Not specified",
        bloodGroup: session.user.bloodGroup || "Not specified",
      };
    }

    try {
      const saved = localStorage.getItem("loggedUser");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }

    const defaultUser = {
      name: "John Doe",
      email: "j.doe@healzen.net",
      image: "",
      phone: "+1 (555) 019-2834",
      age: 32,
      gender: "Male",
      bloodGroup: "O-Negative",
    };
    try {
      localStorage.setItem("loggedUser", JSON.stringify(defaultUser));
    } catch (e) {}
    return defaultUser;
  };

  const initialUser = typeof window !== "undefined" ? getInitialUser() : null;
  const [user, setUser] = useState(initialUser);
  const [editName, setEditName] = useState(initialUser?.name || "");
  const [editAvatar, setEditAvatar] = useState(
    initialUser?.avatar || initialUser?.image || "avatar-1",
  );

  // Cancellation Modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // Edit Appointment Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [apptToEdit, setApptToEdit] = useState(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formReason, setFormReason] = useState("");

  // Toast states
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Core application states
  const [appointments, setAppointments] = useState([]);

  // ----------------------------------------------------
  // EFFECT 0: Update user when session data changes
  // ----------------------------------------------------
  useEffect(() => {
    if (session?.user) {
      const sessionUser = {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || "",
        phone: session.user.phone || "+1 (555) 000-0000",
        age: session.user.age || 30,
        gender: session.user.gender || "Not specified",
        bloodGroup: session.user.bloodGroup || "Not specified",
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(sessionUser);
      setEditName(sessionUser.name);
      setEditAvatar(sessionUser.image || "avatar-1");
      try {
        localStorage.setItem("loggedUser", JSON.stringify(sessionUser));
      } catch (e) {
        // ignore storage failures
      }
    }
  }, [session?.user]);

  // ----------------------------------------------------
  // EFFECT 1: Initial Mount - Sync State from LocalStorage
  // ----------------------------------------------------
  useEffect(() => {
    // Load scheduled appointments from API, fallback to localStorage
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
      "https://heal-zen-backend.vercel.app";

    const currentUser = user ||
      initialUser || {
        name: "John Doe",
        email: "j.doe@healzen.net",
        phone: "+1 (555) 019-2834",
      };
    const userEmail = currentUser?.email;

    const loadAppointments = async () => {
      // Get cancelled appointments list from localStorage
      const cancelledIds = (() => {
        try {
          const c = localStorage.getItem("cancelledAppointments");
          return c ? JSON.parse(c) : [];
        } catch (e) {
          return [];
        }
      })();

      // Try API endpoints that may exist on user's backend
      const endpoints = [
        `${backendUrl}/appointments${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""}`,
        `${backendUrl}/bookings${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""}`,
        `${backendUrl}/appointments`,
        `${backendUrl}/bookings`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Normalize minimal expected fields if needed
            const normalized = data
              .map((d) => ({
                bookingId: d.bookingId || d.id || d._id || (d.booking && d.booking.id),
                doctorId: d.doctorId || d.doctor?._id || d.doctorId,
                doctorName: d.doctorName || d.doctor?.name || d.doctorName,
                doctorSpecialty: d.doctorSpecialty || d.doctor?.specialty || d.specialty,
                doctorImage: d.doctorImage || d.doctor?.image || d.image || d.doctorImage,
                doctorHospital: d.doctorHospital || d.doctor?.hospital || d.hospital,
                date: d.date || d.appointmentDate || d.slotDate,
                timeSlot: d.timeSlot || d.slot || d.time,
                patientName: d.patientName || d.user?.name || currentUser.name,
                patientEmail: d.patientEmail || d.user?.email || currentUser.email,
                patientPhone: d.patientPhone || d.user?.phone || currentUser.phone,
                patientReason: d.patientReason || d.reason || d.note || "",
                status: d.status || (new Date(d.date) >= new Date() ? "Upcoming" : "Completed"),
                raw: d,
              }))
              .filter((appt) => appt && appt.bookingId && !cancelledIds.includes(appt.bookingId));

            // Merge backend data with locally saved appointments
            const savedLocal = (() => {
              try {
                const s = localStorage.getItem("appointments");
                return s ? JSON.parse(s) : [];
              } catch (e) {
                return [];
              }
            })();

            const merged = [...normalized];
            if (Array.isArray(savedLocal)) {
              savedLocal.forEach((localAppt) => {
                if (
                  localAppt &&
                  localAppt.bookingId &&
                  !cancelledIds.includes(localAppt.bookingId) &&
                  !merged.some((m) => m.bookingId === localAppt.bookingId)
                ) {
                  merged.push(localAppt);
                }
              });
            }

            setAppointments(merged);
            localStorage.setItem("appointments", JSON.stringify(merged));
            return;
          }
        } catch (e) {
          // try next endpoint
        }
      }

      // If no API data, fallback to localStorage saved appointments
      const saved = localStorage.getItem("appointments");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed.filter(
              (appt) => appt && appt.bookingId && !cancelledIds.includes(appt.bookingId),
            );
            setAppointments(filtered);
            return;
          }
        } catch (e) {}
      }

      // Final fallback: keep appointments empty (no seed data)
      setAppointments([]);
    };

    loadAppointments();
  }, [initialUser, user]);

  const saveUserLocally = (updatedUser) => {
    try {
      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    } catch (e) {
      console.warn("Unable to save profile locally:", e);
    }
    setUser(updatedUser);
  };

  const updateUserRemote = async (updatedUser) => {
    try {
      const res = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedUser.name,
          image: updatedUser.image || updatedUser.avatar,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to update profile on server");
      }
      return true;
    } catch (error) {
      console.warn("Profile update failed:", error);
      return false;
    }
  };

  // ----------------------------------------------------
  // ACTION HANDLER: Save Profile Details
  // ----------------------------------------------------
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updatedUser = {
      ...user,
      name: editName,
      avatar: editAvatar,
      image: editAvatar,
    };

    saveUserLocally(updatedUser);
    setIsEditing(false);

    const success = await updateUserRemote(updatedUser);
    if (!success) {
      // Keep the profile saved locally if backend update fails.
      return;
    }
  };

  // ----------------------------------------------------
  // ACTION HANDLER: Cancel Profile Editing
  // ----------------------------------------------------
  const handleCancelEdit = () => {
    setEditName(user.name || "");
    setEditAvatar(user.image || user.avatar || "avatar-1");
    setIsEditing(false);
  };

  // ----------------------------------------------------
  // ACTION HANDLER: Cancel Appointment
  // ----------------------------------------------------
  const handleCancelAppointment = (bookingId) => {
    const appt = appointments.find((a) => a.bookingId === bookingId);
    if (appt) {
      setApptToCancel(appt);
      setConfirmInput("");
      setConfirmError("");
      setIsCancelModalOpen(true);
    }
  };

  // ----------------------------------------------------
  // ACTION HANDLER: Confirm Cancellation from Modal
  // ----------------------------------------------------
  const handleConfirmCancellation = async (e) => {
    e.preventDefault();
    if (!apptToCancel) return;

    const cleanDocName = apptToCancel.doctorName
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .trim();
    const cleanInput = confirmInput
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .trim();

    if (!cleanInput) {
      setConfirmError("Please write one word from the doctor's name.");
      return;
    }

    const docNameWords = cleanDocName.split(/\s+/);
    const inputWords = cleanInput.split(/\s+/);

    const isMatch =
      cleanDocName.includes(cleanInput) || inputWords.some((word) => docNameWords.includes(word));

    if (isMatch) {
      // Try deleting via backend if possible
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
        "https://heal-zen-backend.vercel.app";

      let deletedRemotely = false;
      const candidateId = apptToCancel.raw?.id || apptToCancel.raw?._id || apptToCancel.bookingId;

      if (candidateId) {
        const deleteEndpoints = [
          `${backendUrl}/appointments/${candidateId}`,
          `${backendUrl}/bookings/${candidateId}`,
        ];

        for (const url of deleteEndpoints) {
          try {
            const res = await fetch(url, { method: "DELETE" });
            if (res.ok) {
              deletedRemotely = true;
              break;
            }
          } catch (e) {
            // ignore and try next
          }
        }
      }

      // Add to cancelledAppointments blacklist in localStorage
      try {
        const cancelled = JSON.parse(localStorage.getItem("cancelledAppointments") || "[]");
        if (!cancelled.includes(apptToCancel.bookingId)) {
          cancelled.push(apptToCancel.bookingId);
          localStorage.setItem("cancelledAppointments", JSON.stringify(cancelled));
        }
      } catch (e) {
        console.error("Failed to update cancelledAppointments blacklist:", e);
      }

      const updated = appointments.filter((appt) => appt.bookingId !== apptToCancel.bookingId);
      // Persist locally regardless of remote outcome to keep UI in sync
      localStorage.setItem("appointments", JSON.stringify(updated));
      setAppointments(updated);
      setIsCancelModalOpen(false);
      setApptToCancel(null);
    } else {
      setConfirmError(`"${confirmInput}" does not match any word in "${apptToCancel.doctorName}".`);
    }
  };

  // ----------------------------------------------------
  // ACTION HANDLER: Trigger toast notification
  // ----------------------------------------------------
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // ----------------------------------------------------
  // ACTION HANDLER: Open Edit Appointment Modal
  // ----------------------------------------------------
  const handleEditAppointment = (appt) => {
    setApptToEdit(appt);
    setFormName(appt.patientName || "");
    setFormPhone(appt.patientPhone || "");
    setFormDate(appt.date || "");
    setFormTime(appt.timeSlot || "");
    setFormReason(appt.patientReason || "");
    setIsEditModalOpen(true);
  };

  // ----------------------------------------------------
  // ACTION HANDLER: Save Edited Appointment
  // ----------------------------------------------------
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!apptToEdit) return;

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
      "https://heal-zen-backend.vercel.app";

    const candidateId = apptToEdit.raw?.id || apptToEdit.raw?._id || apptToEdit.bookingId;

    if (candidateId) {
      const updateEndpoints = [
        `${backendUrl}/appointments/${candidateId}`,
        `${backendUrl}/bookings/${candidateId}`,
      ];

      for (const url of updateEndpoints) {
        try {
          const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...apptToEdit.raw,
              date: formDate,
              timeSlot: formTime,
              patientName: formName,
              patientPhone: formPhone,
              patientReason: formReason,
            }),
          });
          if (res.ok) break;
        } catch (err) {
          // ignore and try next
        }
      }
    }

    const updated = appointments.map((appt) => {
      if (appt.bookingId === apptToEdit.bookingId) {
        return {
          ...appt,
          date: formDate,
          timeSlot: formTime,
          patientName: formName,
          patientPhone: formPhone,
          patientReason: formReason,
        };
      }
      return appt;
    });

    setAppointments(updated);
    localStorage.setItem("appointments", JSON.stringify(updated));

    setIsEditModalOpen(false);
    setApptToEdit(null);
    triggerToast("Appointment updated successfully!");
  };

  // ----------------------------------------------------
  // HELPER: Dynamic rendering of Preset Patient Avatars
  // ----------------------------------------------------
  const renderAvatar = (avatarId, sizeClass = "w-14 h-14") => {
    const isUrl =
      avatarId &&
      (avatarId.startsWith("http://") ||
        avatarId.startsWith("https://") ||
        avatarId.startsWith("/") ||
        avatarId.includes(".png") ||
        avatarId.includes(".jpg") ||
        avatarId.includes(".jpeg") ||
        avatarId.includes(".svg") ||
        avatarId.includes("data:image"));

    if (isUrl) {
      return (
        <AvatarLoader
          src={avatarId}
          fallbackInitial={getUserInitial(user?.name, user?.email)}
          sizeClass={sizeClass}
        />
      );
    }

    const presets = {
      "avatar-1": {
        bg: "bg-gradient-to-tr from-blue-600 to-indigo-400",
        initial: "PT",
      },
      "avatar-2": {
        bg: "bg-gradient-to-tr from-teal-600 to-emerald-400",
        initial: "PH",
      },
      "avatar-3": {
        bg: "bg-gradient-to-tr from-purple-600 to-pink-400",
        initial: "PM",
      },
      "avatar-4": {
        bg: "bg-gradient-to-tr from-amber-500 to-orange-400",
        initial: "PC",
      },
    };

    const selected = presets[avatarId] || presets["avatar-1"];

    const updateAppointmentHandler = async () => {
      const updateData = await fetch(`/api/confirmAppointments/${_id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          // authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentUpdateData),
      });
      const data = await updateData.json();
    };
    return (
      <div
        className={`${sizeClass} rounded-2xl ${selected.bg} flex items-center justify-center font-bold shadow-inner relative overflow-hidden text-white shrink-0 border border-white/10 transition-transform duration-300`}
      >
        {/* Stylized vector patient headshot */}
        <svg className="w-1/2 h-1/2 opacity-90 fill-current" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[7px] font-black tracking-widest uppercase bg-white/20 px-1 py-0.5 rounded text-white/90">
          {selected.initial}
        </span>
      </div>
    );
  };

  // Split appointments into categories based on date/status and user email
  const currentUserObj = user || initialUser || { email: "j.doe@healzen.net" };
  const upcomingAppts = appointments.filter(
    (appt) =>
      (appt.status === "Upcoming" || new Date(appt.date) >= new Date()) &&
      (!appt.patientEmail ||
        appt.patientEmail.toLowerCase() === currentUserObj.email?.toLowerCase()),
  );

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-900/40 min-h-screen py-10 sm:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* 1. TOP HERO INFORMATION BAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user && renderAvatar(user.image || user.avatar || "avatar-1", "w-16 h-16")}
            <div>
              <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
                Patient Portal
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-0.5 leading-none">
                {user ? user.name : "John Doe"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {user ? user.email : "j.doe@healzen.net"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/appointments"
              className="px-5 py-3 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors duration-300 text-center"
            >
              Book New Appointment
            </Link>
          </div>
        </div>

        {/* 2. DYNAMIC TWO-TAB TOGGLER PANEL */}
        <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-px">
          <button
            onClick={() => {
              setActiveTab("bookings");
              setIsEditing(false);
            }}
            className={`pb-4 text-xs sm:text-sm font-extrabold tracking-wider uppercase border-b-2 transition-all duration-300 cursor-pointer ${
              activeTab === "bookings"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            My Bookings Track
          </button>
          <button
            onClick={() => {
              setActiveTab("profile");
            }}
            className={`pb-4 text-xs sm:text-sm font-extrabold tracking-wider uppercase border-b-2 transition-all duration-300 cursor-pointer ${
              activeTab === "profile"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            My Profile
          </button>
        </div>

        {/* 3. TAB 1: MY BOOKINGS TRACK CONTENT */}
        {activeTab === "bookings" && (
          <div className="max-w-4xl mx-auto w-full animate-fade-in">
            {/* Upcoming Appts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
              <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                Upcoming Doctor Visits ({upcomingAppts.length})
              </h3>

              {upcomingAppts.length === 0 ? (
                <div className="py-12 text-center flex flex-col gap-3">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    You have no upcoming consultations scheduled.
                  </p>
                  <Link
                    href="/appointments"
                    className="mx-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/10 transition-colors duration-300 w-fit"
                  >
                    Schedule a Consultation
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {upcomingAppts.map((appt) => (
                    <div
                      key={appt.bookingId}
                      className="border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row justify-between bg-white dark:bg-slate-900"
                    >
                      {/* Doctor details */}
                      <div className="p-5 flex gap-4">
                        <div className="relative w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                          <Image
                            src={appt.doctorImage}
                            alt={appt.doctorName}
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-[9px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                            {appt.doctorSpecialty}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                            {appt.doctorName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {appt.doctorHospital}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-500 dark:text-slate-400 font-bold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-brand-600" /> {appt.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-600" /> {appt.timeSlot}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation & Update operations */}
                      <div className="px-5 py-4 sm:py-0 bg-slate-50 dark:bg-slate-950/60 sm:bg-transparent border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/80 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 p-4 sm:px-6 min-w-45">
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-500 text-[10px] font-bold rounded-lg uppercase tracking-wider w-fit sm:hidden">
                          {appt.status}
                        </span>
                        <button
                          onClick={() => handleEditAppointment(appt)}
                          className="w-full px-4 py-2.5 bg-brand-50 hover:bg-brand-600 dark:bg-brand-950/20 dark:hover:bg-brand-600 text-brand-600 hover:text-white dark:text-brand-400 dark:hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-300 shadow-sm cursor-pointer border border-transparent"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Update
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appt.bookingId)}
                          className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-500 dark:bg-red-950/20 dark:hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-300 shadow-sm cursor-pointer border border-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TAB 2: MY PROFILE TAB CONTENT (WITH DYNAMIC INLINE EDITING) */}
        {activeTab === "profile" && user && (
          <div className="max-w-3xl mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 rounded-3xl shadow-sm animate-fade-in">
            {/* View Mode */}
            {!isEditing ? (
              <div className="flex flex-col gap-8">
                {/* Profile Header card */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                  {renderAvatar(
                    user.image || user.avatar || "avatar-1",
                    "w-24 h-24 sm:w-28 sm:h-28",
                  )}

                  <div className="text-center sm:text-left">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 w-fit uppercase tracking-wider border border-brand-200/20 dark:border-brand-900/20">
                      Active Gold Member
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2 leading-none">
                      {user.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1 flex items-center gap-1 justify-center sm:justify-start">
                      <Mail className="w-3.5 h-3.5 text-brand-600" /> {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="sm:ml-auto px-5 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white dark:bg-brand-500 dark:hover:bg-brand-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-305 cursor-pointer shadow-sm border border-transparent"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile Details
                  </button>
                </div>

                {/* Additional detailed metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3.5 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-550 dark:text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                        Contact Phone
                      </span>
                      <strong className="text-slate-800 dark:text-white font-bold text-xs">
                        {user.phone}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-550 dark:text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                        Age / Years
                      </span>
                      <strong className="text-slate-800 dark:text-white font-bold text-xs">
                        {user.age} Years
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                  🔐 Your biographical details and clinical appointments are strictly confidential.
                </div>
              </div>
            ) : (
              /* Inline Edit Mode */
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-850 dark:text-white">
                      Modify Profile Details
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                      Customize your patient details instantly
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 dark:hover:text-red-500 rounded-xl transition-colors duration-300 border border-transparent cursor-pointer"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* 1. Name Input Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-extrabold text-slate-750 dark:text-slate-350 uppercase tracking-wide">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="E.g. John Doe"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 2. Custom Profile Picture URL Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-extrabold text-slate-750 dark:text-slate-350 uppercase tracking-wide">
                    Profile Picture URL
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10">
                    {renderAvatar(user.image || editAvatar, "w-16 h-16")}
                    <div className="w-full grow">
                      <input
                        type="text"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="Paste image link (e.g. https://images.unsplash.com/...)"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 transition-colors duration-300 shadow-sm"
                      />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-2">
                        You can paste a direct web image URL (e.g. from Unsplash, Imgur) or use a
                        gradient key (&quot;avatar-1&quot; to &quot;avatar-4&quot;).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition-colors duration-300 cursor-pointer border border-transparent"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors duration-300 cursor-pointer border border-transparent"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* 5. CANCELLATION CONFIRMATION MODAL */}
      {isCancelModalOpen && apptToCancel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 transform scale-100 transition-all duration-300">
            {/* Danger Warning Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-left">
                  Cancel Appointment
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 text-left">
                  This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1.5 bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Details & Verification Input form */}
            <form onSubmit={handleConfirmCancellation} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-left text-[10px] font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Doctor Name Verification
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-left">
                  To confirm cancellation, type any{" "}
                  <strong className="text-slate-850 dark:text-slate-200">single word</strong> from
                  the doctor&apos;s name:
                </p>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-center my-1">
                  <span className="text-xs font-black text-brand-600 dark:text-brand-400 select-all tracking-wide">
                    {apptToCancel.doctorName}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={confirmInput}
                  onChange={(e) => {
                    setConfirmInput(e.target.value);
                    if (confirmError) setConfirmError("");
                  }}
                  placeholder="Type a word (e.g. Sarah or Jenkins)..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-red-500 transition-colors duration-300"
                  autoFocus
                />
              </div>

              {confirmError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded-xl text-left animate-fade-in">
                  ⚠ {confirmError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="grow py-3 bg-slate-100 hover:bg-slate-205 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center"
                >
                  Keep Visit
                </button>
                <button
                  type="submit"
                  className="grow py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT APPOINTMENT MODAL */}
      {isEditModalOpen && apptToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-5 transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider text-left">
                  Update Appointment Details
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 text-left">
                  Review and update your clinical booking details
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setApptToEdit(null);
                }}
                className="p-1.5 bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveAppointment}
              className="flex flex-col gap-4 text-left max-h-[70vh] overflow-y-auto pr-1"
            >
              {/* Doctor Details (Read-only section) */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" /> Doctor & Hospital Details (Read-only)
                </div>
                <div className="flex gap-3 mt-1 items-center">
                  <div className="relative w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-850">
                    <Image
                      src={apptToEdit.doctorImage}
                      alt={apptToEdit.doctorName}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white truncate">
                      {apptToEdit.doctorName}
                    </span>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
                      {apptToEdit.doctorSpecialty}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {apptToEdit.doctorHospital}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Email Address (Read-only field) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Email Address (Read-only)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    readOnly
                    value={apptToEdit.patientEmail}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/65 rounded-xl text-xs font-semibold text-slate-405 dark:text-slate-450 cursor-not-allowed outline-none select-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="formName"
                    className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Patient Name
                  </label>
                  <input
                    id="formName"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter patient name..."
                    className="w-full px-4.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Patient Phone */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="formPhone"
                    className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Contact Phone
                  </label>
                  <input
                    id="formPhone"
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Enter phone number..."
                    className="w-full px-4.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Appointment Date */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="formDate"
                    className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Appointment Date
                  </label>
                  <input
                    id="formDate"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Time Slot Selection */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="formTime"
                    className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Time Slot
                  </label>
                  <select
                    id="formTime"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {/* Make sure the current value is always an option */}
                    {![
                      "08:00 AM",
                      "08:30 AM",
                      "09:00 AM",
                      "09:30 AM",
                      "10:00 AM",
                      "10:30 AM",
                      "11:00 AM",
                      "11:30 AM",
                      "01:00 PM",
                      "01:30 PM",
                      "02:00 PM",
                      "02:30 PM",
                      "03:00 PM",
                      "03:30 PM",
                      "04:00 PM",
                      "04:30 PM",
                      "05:00 PM",
                    ].includes(formTime) &&
                      formTime && <option value={formTime}>{formTime}</option>}
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Reason for Appointment */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="formReason"
                  className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Reason for Consultation / Symptoms
                </label>
                <textarea
                  id="formReason"
                  rows={3}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="E.g. Routine general checkup, high blood pressure symptoms, etc..."
                  className="w-full px-4.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setApptToEdit(null);
                  }}
                  className="grow py-3 bg-slate-100 hover:bg-slate-205 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={updateAppointmentHandler}
                  className="grow py-3 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. TOAST NOTIFICATION ALERTS */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 dark:bg-teal-500 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in border border-teal-500/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
