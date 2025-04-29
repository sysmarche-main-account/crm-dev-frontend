"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";

export const getBearerTokenAction = async (csrfToken) => {
  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  const body = {
    client_id: `${process.env.CLIENT_ID}`, //will provide by administartor
    client_secret: `${process.env.CLIENT_SECRET}`, //will provide by administartor
    grant_type: `${process.env.GRANT_TYPE}`, //will be pass by default
  };

  try {
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/auth`,
      `${process.env.BACKEND_URL_DEV}/oauth/create_token`,
      body
    );
    if (res.status === 200) {
      cookies().set({
        name: "token",
        value: `${res?.data?.access_token}`,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // maxAge: `${60 * 60 * 1}`,
      });
      cookies().set({
        name: "expiry",
        value: `${res?.data?.expires_at}`,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // maxAge: `${60 * 60 * 1}`,
      });
      // const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: res.data,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Token fetch unsuccessful",
      req: body,
    };
  } catch (error) {
    console.log("log", error.response.data, body);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};
