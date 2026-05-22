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

export default function Dashboard() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") === "profile" ? "profile" : "bookings";
  });

  const [isEditing, setIsEditing] = useState(false);

  // Session
  const { data: session, isPending, error, refetch } = authClient.useSession();

  // User state
  const [user, setUser] = useState(null);

  const [editName, setEditName] = useState("");

  const [editAvatar, setEditAvatar] = useState("avatar-1");

  // Appointments
  const [appointments, setAppointments] = useState([]);

  // Cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [apptToCancel, setApptToCancel] = useState(null);

  const [confirmInput, setConfirmInput] = useState("");

  const [confirmError, setConfirmError] = useState("");

  // Edit appointment modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [apptToEdit, setApptToEdit] = useState(null);

  const [formName, setFormName] = useState("");

  const [formPhone, setFormPhone] = useState("");

  const [formDate, setFormDate] = useState("");

  const [formTime, setFormTime] = useState("");

  const [formReason, setFormReason] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const [showToast, setShowToast] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ?? "";
  const updateUserEndpoint = API_BASE ? `${API_BASE}/update-user` : "/api/auth/update-user";

  // ------------------------------------------------
  // USER LOAD
  // ------------------------------------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
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

          setUser(sessionUser);

          setEditName(sessionUser.name);

          setEditAvatar(sessionUser.image || "avatar-1");

          localStorage.setItem("loggedUser", JSON.stringify(sessionUser));

          return;
        }

        const saved = localStorage.getItem("loggedUser");

        if (saved) {
          const parsed = JSON.parse(saved);

          setUser(parsed);

          setEditName(parsed.name || "");

          setEditAvatar(parsed.image || parsed.avatar || "avatar-1");

          return;
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

        setUser(defaultUser);

        setEditName(defaultUser.name);

        setEditAvatar("avatar-1");

        localStorage.setItem("loggedUser", JSON.stringify(defaultUser));
      } catch (error) {
        console.error("User load failed:", error);
      }
    };

    loadUser();
  }, [session?.user]);

  // ------------------------------------------------
  // LOAD APPOINTMENTS
  // ------------------------------------------------
  useEffect(() => {
    if (!user?.email) return;

    const loadAppointments = async () => {
      try {
        const { data } = await authClient.getSession();

        const token = data?.token;

        const cancelledIds = JSON.parse(localStorage.getItem("cancelledAppointments") || "[]");

        const res = await fetch(
          `${API_BASE}/appointments?email=${encodeURIComponent(user.email)}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const dataAppointments = await res.json();

        if (Array.isArray(dataAppointments) && dataAppointments.length > 0) {
          const normalized = dataAppointments
            .map((d) => ({
              bookingId: d.bookingId || d.id || d._id,

              doctorId: d.doctorId || d.doctor?._id,

              doctorName: d.doctorName || d.doctor?.name,

              doctorSpecialty: d.doctorSpecialty || d.doctor?.specialty,

              doctorImage: d.doctorImage || d.doctor?.image,

              doctorHospital: d.doctorHospital || d.doctor?.hospital,

              date: d.date || d.appointmentDate,

              timeSlot: d.timeSlot || d.slot,

              patientName: d.patientName || user.name,

              patientEmail: d.patientEmail || user.email,

              patientPhone: d.patientPhone || user.phone,

              patientReason: d.patientReason || d.reason || "",

              status: d.status || "Upcoming",

              raw: d,
            }))
            .filter((appt) => appt.bookingId && !cancelledIds.includes(appt.bookingId));

          setAppointments(normalized);

          localStorage.setItem("appointments", JSON.stringify(normalized));

          return;
        }

        // fallback localStorage
        const saved = localStorage.getItem("appointments");

        if (saved) {
          const parsed = JSON.parse(saved);

          setAppointments(parsed);
        }
      } catch (error) {
        console.error("Appointments fetch failed:", error);

        const saved = localStorage.getItem("appointments");

        if (saved) {
          const parsed = JSON.parse(saved);

          setAppointments(parsed);
        }
      }
    };

    loadAppointments();
  }, [user]);

  // ------------------------------------------------
  // SAVE USER
  // ------------------------------------------------
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!editName.trim()) return;

    const updatedUser = {
      ...user,
      name: editName,
      avatar: editAvatar,
      image: editAvatar,
    };

    try {
      const { data } = await authClient.getSession();

      const token = data?.token;

      const response = await fetch(updateUserEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updatedUser.name,
          image: updatedUser.image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || response.statusText || "Profile update failed.";
        throw new Error(errorMessage);
      }

      setUser(updatedUser);
      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      setIsEditing(false);
      triggerToast("Profile updated successfully!");

      if (typeof refetch === "function") {
        await refetch();
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      triggerToast(error?.message || "Profile update failed. Please try again.");
    }
  };

  // ------------------------------------------------
  // CANCEL EDIT
  // ------------------------------------------------
  const handleCancelEdit = () => {
    setEditName(user.name || "");

    setEditAvatar(user.image || user.avatar || "avatar-1");

    setIsEditing(false);
  };

  // ------------------------------------------------
  // CANCEL APPOINTMENT
  // ------------------------------------------------
  const handleCancelAppointment = (bookingId) => {
    const appt = appointments.find((a) => a.bookingId === bookingId);

    if (!appt) return;

    setApptToCancel(appt);

    setConfirmInput("");

    setConfirmError("");

    setIsCancelModalOpen(true);
  };

  // ------------------------------------------------
  // CONFIRM CANCEL
  // ------------------------------------------------
  const handleConfirmCancellation = async (e) => {
    e.preventDefault();

    if (!apptToCancel) return;

    const cleanDocName = apptToCancel.doctorName.toLowerCase().trim();

    const cleanInput = confirmInput.toLowerCase().trim();

    if (!cleanDocName.includes(cleanInput)) {
      setConfirmError("Doctor name does not match.");

      return;
    }

    try {
      const { data: session } = await authClient.token();

      const token = session?.token;

      await fetch(`${API_BASE}/appointments/${apptToCancel.raw?._id || apptToCancel.bookingId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Delete failed:", error);
    }

    const updated = appointments.filter((appt) => appt.bookingId !== apptToCancel.bookingId);

    setAppointments(updated);

    localStorage.setItem("appointments", JSON.stringify(updated));

    const cancelled = JSON.parse(localStorage.getItem("cancelledAppointments") || "[]");

    cancelled.push(apptToCancel.bookingId);

    localStorage.setItem("cancelledAppointments", JSON.stringify(cancelled));

    setIsCancelModalOpen(false);

    setApptToCancel(null);
  };

  // ------------------------------------------------
  // TOAST
  // ------------------------------------------------
  const triggerToast = (msg) => {
    setToastMessage(msg);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // ------------------------------------------------
  // EDIT APPOINTMENT
  // ------------------------------------------------
  const handleEditAppointment = (appt) => {
    setApptToEdit(appt);

    setFormName(appt.patientName || "");

    setFormPhone(appt.patientPhone || "");

    setFormDate(appt.date || "");

    setFormTime(appt.timeSlot || "");

    setFormReason(appt.patientReason || "");

    setIsEditModalOpen(true);
  };

  // ------------------------------------------------
  // SAVE APPOINTMENT
  // ------------------------------------------------
  const handleSaveAppointment = async (e) => {
    e.preventDefault();

    if (!apptToEdit) return;

    try {
      const { data } = await authClient.getSession();

      const token = data?.token;

      await fetch(`${API_BASE}/confirmAppointments/${apptToEdit.raw?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formDate,
          timeSlot: formTime,
          patientName: formName,
          patientPhone: formPhone,
          patientReason: formReason,
        }),
      });
    } catch (error) {
      console.error("Update failed:", error);
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

  // ------------------------------------------------
  // RENDER AVATAR
  // ------------------------------------------------
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

    return (
      <div
        className={`${sizeClass} rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center font-bold text-white`}
      >
        <User className="w-6 h-6" />
      </div>
    );
  };

  // ------------------------------------------------
  // FILTER UPCOMING
  // ------------------------------------------------
  const upcomingAppts = appointments.filter(
    (appt) => appt.status === "Upcoming" || new Date(appt.date) >= new Date(),
  );

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------
  if (isPending || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/40">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
