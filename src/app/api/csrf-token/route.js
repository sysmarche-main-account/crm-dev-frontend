import { NextResponse } from "next/server";
import csrf from "csrf";

export const GET = async () => {
  const csrfProtection = new csrf();
  const csrfToken = csrfProtection.create(process.env.CSRF_SECRET);

  // Set token in a cookie (httpOnly, secure in production)
  const response = NextResponse.json({ csrfToken });
  // response.cookies.set("csrfToken", csrfToken, {
  //   sameSite: "lax",
  //   httpOnly: true,
  //   path: "/",
  //   secure: process.env.NODE_ENV === "production",
  // });

  return response;
};
