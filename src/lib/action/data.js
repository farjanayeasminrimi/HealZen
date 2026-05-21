"use server";
import { fallbackDoctors, fallbackDepartments } from "./fallbackData";

const getApiUrl = (path) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "https://heal-zen-backend.vercel.app";
  return `${baseUrl}${path}`;
};

const fetchCollection = async (path) => {
  const url = getApiUrl(path);

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`,
      );
    }
    return await res.json();
  } catch (error) {
    console.warn(`Unable to fetch ${path} from backend. Using fallback data.`, error);
    if (path === "/doctors") return fallbackDoctors;
    if (path === "/departments") return fallbackDepartments;
    return [];
  }
};

export const doctorsCollection = async () => await fetchCollection("/doctors");
export const departmentsCollection = async () => await fetchCollection("/departments");
