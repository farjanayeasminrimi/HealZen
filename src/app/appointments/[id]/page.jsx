import React from "react";
import DoctorDetailClient from "@/components/appointments/DoctorDetailClient";
import { doctorsCollection } from "@/lib/action/data";
import { fallbackDoctors } from "@/lib/action/fallbackData";

const Details = async ({ params }) => {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let doctors = fallbackDoctors;
  try {
    const fetchedDoctors = await doctorsCollection();
    if (Array.isArray(fetchedDoctors) && fetchedDoctors.length > 0) {
      doctors = fetchedDoctors;
    }
  } catch (error) {
    console.error("Failed to load doctors collection on details page:", error);
  }

  const doctor = doctors.find((doc) => doc._id === id || doc.id === id);

  return <DoctorDetailClient doctor={doctor} id={id} />;
};

export default Details;
