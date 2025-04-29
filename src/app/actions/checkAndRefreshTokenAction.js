"use server";
import { cookies } from "next/headers";
import { getBearerTokenAction } from "./bearerAction";
import { getCsrfToken } from "./getCsrfToken";
import { getToken } from "@/utils/getToken";

export const checkAndRefreshToken = async () => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");
    const expiry = cookieStore.get("expiry");

    if (!expiry) {
      console.error("Expiry cookie not found");
      return token;
    }

    const targetDate = new Date(expiry.value).getTime();
    const currentDate = new Date().getTime();
    const timeDifference = (targetDate - currentDate) / 1000 / 60;

    // console.log(
    //   "Current date:",
    //   currentDate,
    //   "Target date:",
    //   targetDate,
    //   "Time diff:",
    //   timeDifference
    // );

    if (timeDifference <= 1) {
      console.log("Token is about to expire, refreshing...");
      const csrfToken = await getCsrfToken();
      console.log("CSRF token fetched:", csrfToken);

      const newToken = await getToken();
      return newToken;

      // const newGeneratedToken = await getBearerTokenAction(csrfToken);
      // console.log("New token response:", newGeneratedToken);

      // return { value: newGeneratedToken?.data?.access_token };
    }
    return token;
  } catch (error) {
    console.error("Error in checkAndRefreshToken:", error);
    throw error;
  }
};
