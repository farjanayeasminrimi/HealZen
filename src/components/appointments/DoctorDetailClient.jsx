"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fallbackDoctors } from "@/lib/action/fallbackData";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Star,
  CheckCircle2,
  MapPin,
  Stethoscope,
  Award,
  Sparkles,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export default function DoctorDetailClient({ doctor: initialDoctor, id }) {
  const [doctor, setDoctor] = useState(initialDoctor);
  const [loading, setLoading] = useState(!initialDoctor);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [formData, setFormData] = useState(() => {
    if (typeof window === "undefined") {
      return {
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        notes: "",
      };
    }

    try {
      const savedUser = localStorage.getItem("loggedUser");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return {
          patientName: u.name || "",
          patientEmail: u.email || "",
          patientPhone: u.phone || "",
          notes: "",
        };
      }
    } catch (e) {
      // ignore
    }

    return {
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      notes: "",
    };
  });
  const [isBooked, setIsBooked] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookingId, setBookingId] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [confirmationResponse, setConfirmationResponse] = useState(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (initialDoctor) return;

    fetch(`${backendUrl}/doctors`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch doctors");
        return res.json();
      })
      .then((docs) => {
        const found = docs.find((doc) => doc._id === id || doc.id === id);
        setDoctor(found);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Client-side doctor fetch failed:", err);
        const fallbackDoctor = fallbackDoctors.find((doc) => doc._id === id || doc.id === id);
        if (fallbackDoctor) {
          setDoctor(fallbackDoctor);
        }
        setLoading(false);
      });
  }, [initialDoctor, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/40">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md text-center shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            Doctor Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            We couldn&apos;t find the medical practitioner you were looking for. They might have
            been relocated or updated.
          </p>
          <Link
            href="/appointments"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!selectedDay) tempErrors.day = "Please select an appointment day.";
    if (!selectedSlot) tempErrors.slot = "Please select an appointment slot.";
    if (!formData.patientName.trim()) tempErrors.patientName = "Patient name is required.";
    if (!formData.patientEmail.trim()) {
      tempErrors.patientEmail = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.patientEmail)) {
      tempErrors.patientEmail = "Invalid email format.";
    }
    if (!formData.patientPhone.trim()) {
      tempErrors.patientPhone = "Phone number is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const generateBookingId = () => `HZ-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newBookingId = generateBookingId();
    setBookingId(newBookingId);

    const newAppointment = {
      bookingId: newBookingId,
      doctorId: doctor?._id || doctor?.id || null,
      doctorName: doctor?.name || "Unknown Doctor",
      doctorSpecialty: doctor?.specialty || "General Medicine",
      doctorImage: doctor?.image || "",
      doctorHospital: doctor?.hospital || "",
      date: selectedDay,
      timeSlot: selectedSlot,
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      patientReason: formData.notes || "",
      status: "Upcoming",
      raw: { doctor, selectedDay, selectedSlot, patientEmail: formData.patientEmail },
    };

    try {
      const savedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
      const updatedAppointments = Array.isArray(savedAppointments)
        ? [newAppointment, ...savedAppointments]
        : [newAppointment];
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    } catch (error) {
      console.error("Failed to save appointment to localStorage:", error);
    }

    const saveAppointment = async () => {
      try {
        const response = await fetch(`${backendUrl}/confirmAppointments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAppointment),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn("Backend appointment save failed:", response.status, errorText);
        }
      } catch (error) {
        console.warn("Backend appointment save failed:", error);
      }
    };

    setAppointmentDetails(newAppointment);
    setIsBooked(true);

    saveAppointment();
  };

  const bookAppointmentHandler = async (appointmentData) => {
    if (!appointmentData) {
      console.warn("No appointment data to confirm on the server.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/confirmAppointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("Failed to save appointment to backend:", response.status, errorText);
        return null;
      }

      const data = await response.json();
      setConfirmationResponse(data);
      return data;
    } catch (error) {
      console.warn("Failed to send appointment confirmation to server:", error);
    }
  };

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-900/40 min-h-screen py-10 sm:py-16 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/appointments"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 text-xs font-bold uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Medical Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: DOCTOR BIO & DETAILS (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Primary Profile Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 dark:bg-brand-500/10 rounded-bl-full flex items-center justify-end p-4 pointer-events-none">
                <Sparkles className="w-5 h-5 text-brand-500 opacity-60" />
              </div>

              {/* Doctor Portrait */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-800 self-center sm:self-start">
                {doctor?.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name || "Doctor"}
                    fill
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="text-lg font-bold">
                      {(doctor?.name || "Dr")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                )}
              </div>

              {/* Doctor Credentials */}
              <div className="flex flex-col justify-between py-1">
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-brand-100 dark:border-brand-900/30 mb-3 w-fit">
                    <Stethoscope className="w-3 h-3" /> {doctor.specialty}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight mb-2">
                    {doctor.name}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    {doctor.qualifications}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {doctor.rating}
                    </span>
                    <span className="text-xs text-slate-400">({doctor.reviewsCount} Reviews)</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <span className="text-xs text-slate-400 block uppercase tracking-wider">
                      Experience
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {doctor.experience}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Highlights Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Consult Fee
                </span>
                <span className="text-base font-extrabold text-slate-800 dark:text-white flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  {doctor.fee}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Clinic Campus
                </span>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 block truncate">
                  {doctor.hospital.split(" ")[0]}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Availability
                </span>
                <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {doctor.availableDays?.length} Days
                </span>
              </div>
            </div>

            {/* Biography About Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
                About Specialist
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {doctor.about}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-600" />
                  <span>{doctor.phone}</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-600" /> Patient Feedback
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Showing {doctor.reviews?.length || 0} reviews
                </span>
              </div>

              <div className="flex flex-col gap-4 max-h-75 overflow-y-auto pr-1">
                {doctor.reviews && doctor.reviews.length > 0 ? (
                  doctor.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          {rev.author}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {rev.date}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {rev.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                        &quot;{rev.comment}&quot;
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">
                    No reviews yet for this practitioner.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE BOOKING SCHEDULER (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 sticky top-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">
                  Schedule Appointment
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Pick your preferred slot and enter patient details.
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-5">
                {/* 1. Pick Available Day */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> 1. Select Available Day
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {doctor.availableDays?.map((day) => {
                      const isSelected = selectedDay === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSelectedDay(day);
                            if (errors.day) setErrors((prev) => ({ ...prev, day: "" }));
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-600 text-white shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {errors.day && <p className="text-[10px] font-bold text-red-500">{errors.day}</p>}
                </div>

                {/* 2. Pick Available Slot */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" /> 2. Select Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {doctor.availableSlots?.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setSelectedSlot(slot);
                            if (errors.slot) setErrors((prev) => ({ ...prev, slot: "" }));
                          }}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer ${
                            isSelected
                              ? "bg-brand-600 text-white shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {errors.slot && (
                    <p className="text-[10px] font-bold text-red-500">{errors.slot}</p>
                  )}
                </div>

                <div className="h-px bg-slate-150 dark:bg-slate-800 my-1" />

                {/* 3. Patient Info */}
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-600" /> 3. Patient Details
                  </label>

                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      name="patientName"
                      placeholder="Patient Full Name"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors"
                    />
                    {errors.patientName && (
                      <p className="text-[10px] font-bold text-red-500 px-1">
                        {errors.patientName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <input
                      type="email"
                      name="patientEmail"
                      placeholder="Email Address"
                      value={formData.patientEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors"
                    />
                    {errors.patientEmail && (
                      <p className="text-[10px] font-bold text-red-500 px-1">
                        {errors.patientEmail}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <input
                      type="tel"
                      name="patientPhone"
                      placeholder="Phone Number"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors"
                    />
                    {errors.patientPhone && (
                      <p className="text-[10px] font-bold text-red-500 px-1">
                        {errors.patientPhone}
                      </p>
                    )}
                  </div>

                  <textarea
                    name="notes"
                    placeholder="Brief notes (symptoms, history, etc.)"
                    rows="3"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={bookAppointmentHandler}
                  type="submit"
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/15 transition-all cursor-pointer mt-2"
                >
                  {`Book Appointment ($${doctor.fee})`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION SUCCESS MODAL */}
      {isBooked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 mb-2 border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                Appointment Booked!
              </h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Confirmation ID: <span className="text-brand-600 font-bold">{bookingId}</span>
              </p>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Booking Recap Details */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 flex flex-col gap-3 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Practitioner</span>
                <span className="text-slate-800 dark:text-white font-bold">{doctor.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Specialty</span>
                <span className="text-slate-800 dark:text-white font-bold">{doctor.specialty}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Date Schedule</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">
                  {selectedDay} ({selectedSlot})
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Patient</span>
                <span className="text-slate-800 dark:text-white font-bold">
                  {formData.patientName}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Hospital campus</span>
                <span className="text-slate-800 dark:text-white font-bold">{doctor.hospital}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Consultation Fee</span>
                <span className="text-slate-800 dark:text-white font-bold">${doctor.fee}</span>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium leading-relaxed">
              We have sent a calendar invitation and confirmation receipt with directions to your
              email at{" "}
              <span className="font-bold text-slate-700 dark:text-slate-350">
                {formData.patientEmail}
              </span>
              .
            </p>

            <button
              onClick={() => {
                setIsBooked(false);
                setSelectedDay("");
                setSelectedSlot("");
                setFormData({
                  patientName: "",
                  patientEmail: "",
                  patientPhone: "",
                  notes: "",
                });
              }}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
