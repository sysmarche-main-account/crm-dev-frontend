"use server";
import { cookies } from "next/headers";

export const getCsrfToken = async () => {
  try {
    // Access the backend URL securely from environment variables
    const backendUrl = process.env.BACKEND_UAT_URL;
    console.log("getbackendUrl", backendUrl);
    
    // Perform the API call to get the CSRF token
    const res = await fetch(`${backendUrl}/api/csrf-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store", // Prevent caching
    });

    // Throw an error if the response is not OK
    if (!res.ok) throw new Error("Failed to fetch CSRF token");

    // Parse and return the CSRF token
    const data = await res.json();
    console.log("data", data);
    
    cookies().set({
      name: "cToken",
      value: `${data?.csrfToken}`,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      // maxAge: `${60 * 60 * 1}`,
    });
    return data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null; // You can also throw the error to handle it upstream
  }
};
