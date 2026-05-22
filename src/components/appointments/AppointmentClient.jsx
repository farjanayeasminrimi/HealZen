"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Star, BookmarkPlus, Filter, Clock, MapPin, RefreshCw } from "lucide-react";

import { fallbackDoctors, fallbackDepartments } from "@/lib/action/fallbackData";

import { authClient } from "@/lib/auth-client";

function AppointmentsContent({
  doctors: initialDoctors = [],
  departments: initialDepartments = [],
  initialDept = "All",
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  const deptFromParams = searchParams.get("dept");

  const [activeDept, setActiveDept] = useState(() => deptFromParams || initialDept);

  const [doctors, setDoctors] = useState(
    initialDoctors.length > 0 ? initialDoctors : fallbackDoctors,
  );

  const [departments, setDepartments] = useState(
    initialDepartments.length > 0 ? initialDepartments : fallbackDepartments,
  );

  const [loading, setLoading] = useState(
    !initialDoctors ||
      initialDoctors.length === 0 ||
      !initialDepartments ||
      initialDepartments.length === 0,
  );

  // Client-side fallback fetch
  useEffect(() => {
    if (
      initialDoctors &&
      initialDoctors.length > 0 &&
      initialDepartments &&
      initialDepartments.length > 0
    ) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data: session } = await authClient.token();

        const token = session?.token;

        console.log(session);

        // Doctors
        const doctorsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/doctors`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const doctorsData = await doctorsRes.json();

        // Departments
        const departmentsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/departments`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const departmentsData = await departmentsRes.json();

        if (Array.isArray(doctorsData) && doctorsData.length > 0) {
          setDoctors(doctorsData);
        }

        if (Array.isArray(departmentsData) && departmentsData.length > 0) {
          setDepartments(departmentsData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Fetch failed:", error);

        setDoctors((prev) => (prev.length > 0 ? prev : fallbackDoctors));

        setDepartments((prev) => (prev.length > 0 ? prev : fallbackDepartments));

        setLoading(false);
      }
    };

    fetchData();
  }, [initialDoctors, initialDepartments]);

  // Normalize department list
  const deptList = (departments || []).map((d) => (typeof d === "string" ? d : d.name));

  const handleDeptSelect = (dept) => {
    setActiveDept(dept);

    const params = new URLSearchParams(searchParams.toString());

    if (dept === "All") {
      params.delete("dept");
    } else {
      params.set("dept", dept);
    }

    router.push(`/appointments?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveDept("All");
    router.push("/appointments");
  };

  // Filter doctors
  const filteredDoctors = (doctors || []).filter((doc) => {
    const specialty = doc.specialty || "";
    const name = doc.name || "";
    const qualifications = doc.qualifications || "";

    const matchesDept =
      activeDept === "All" || specialty.toLowerCase() === activeDept.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qualifications.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDept && matchesSearch;
  });

  if (loading && doctors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/40">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-900/40 min-h-screen py-10 sm:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-10 max-w-2xl">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
            Medical Directory
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Schedule a Consultation
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Search our highly qualified hospital network, filter by medical specialty, and choose
            clinical time slots.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Search */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-3">
              <label
                htmlFor="search"
                className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Search Doctor
              </label>

              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Name, specialty, or hospital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-xs text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />

                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Departments */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-brand-600" />
                  Specialty
                </span>

                {(activeDept !== "All" || searchTerm) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {deptList.map((dept) => {
                  const isSelected = activeDept === dept;

                  return (
                    <button
                      key={dept}
                      onClick={() => handleDeptSelect(dept)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-brand-600 text-white font-bold shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <span>{dept}</span>

                      {!isSelected && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dept === "All"
                            ? doctors.length
                            : doctors.filter(
                                (d) => (d.specialty || "").toLowerCase() === dept.toLowerCase(),
                              ).length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden hidden lg:block">
              <div className="absolute right-0 bottom-0 opacity-15 w-24 h-24 bg-white/20 rounded-full translate-x-4 translate-y-4" />

              <h4 className="text-sm font-bold mb-2">Need Immediate Guidance?</h4>

              <p className="text-[11px] text-brand-100 leading-relaxed font-semibold mb-4">
                Call our Hospital Hotline to consult with an emergency medical coordinator right
                away.
              </p>

              <p className="text-xs font-bold bg-white/10 px-3 py-2 rounded-lg w-fit">
                ☏ +1 (800) HEALZEN
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-3">
            {/* Top Stats */}
            <div className="flex items-center justify-between mb-6 px-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing{" "}
                <span className="text-slate-600 dark:text-slate-200">{filteredDoctors.length}</span>{" "}
                Doctors
              </p>

              {activeDept !== "All" && (
                <span className="text-xs font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 px-3 py-1 rounded-full border border-brand-200/40 dark:border-brand-900/30">
                  Division: {activeDept}
                </span>
              )}
            </div>

            {/* Empty State */}
            {filteredDoctors.length === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  No Doctors Found
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-6">
                  We couldn&apos;t find any medical practitioners matching your criteria.
                </p>

                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/15 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc._id || doc.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Top */}
                  <div className="p-5 flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                      {doc?.image ? (
                        <Image
                          src={doc.image}
                          alt={doc.name || "Doctor"}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                          <span className="text-sm font-bold">
                            {(doc?.name || "Dr")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-1.5 flex-grow">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                        {doc.specialty}
                      </span>

                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug">
                        {doc.name}
                      </h3>

                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xs line-clamp-1">
                        {doc.qualifications}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {doc.rating}
                        </span>

                        <span className="text-[10px] text-slate-400 font-semibold">
                          ({doc.reviewsCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle */}
                  <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-850 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase tracking-wider mb-0.5">
                        Exp
                      </span>

                      <span className="text-slate-700 dark:text-slate-200 font-bold">
                        {doc.experience}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase tracking-wider mb-0.5">
                        Consult Fee
                      </span>

                      <span className="text-slate-700 dark:text-slate-200 font-bold">
                        ${doc.fee}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[8px] text-slate-400 uppercase tracking-wider mb-0.5">
                        Availability
                      </span>

                      <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        Next slot
                      </span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                      <span className="truncate max-w-[130px]">
                        {doc?.hospital?.split(" ")[0]} Campus
                      </span>
                    </div>

                    <Link
                      href={`/appointments/${doc._id || doc.id}`}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Appointments({ doctors = [], departments = [], initialDept = "All" }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/40">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AppointmentsContent doctors={doctors} departments={departments} initialDept={initialDept} />
    </Suspense>
  );
}
