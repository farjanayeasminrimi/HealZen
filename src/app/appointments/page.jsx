import AppointmentsClient from "@/components/appointments/AppointmentClient";
import { departmentsCollection, doctorsCollection } from "@/lib/action/data";
import { fallbackDepartments, fallbackDoctors } from "@/lib/action/fallbackData";
import React from "react";

const Appointments = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;
  let doctors = fallbackDoctors;
  let departments = fallbackDepartments;

  try {
    const fetchedDoctors = await doctorsCollection();
    const fetchedDepartments = await departmentsCollection();
    if (Array.isArray(fetchedDoctors) && fetchedDoctors.length > 0) {
      doctors = fetchedDoctors;
    }
    if (Array.isArray(fetchedDepartments) && fetchedDepartments.length > 0) {
      departments = fetchedDepartments;
    }
  } catch (error) {
    console.error("Failed to load appointment data:", error);
  }

  const dept = resolvedSearchParams?.dept || "All";
  return <AppointmentsClient doctors={doctors} departments={departments} initialDept={dept} />;
};

export default Appointments;
