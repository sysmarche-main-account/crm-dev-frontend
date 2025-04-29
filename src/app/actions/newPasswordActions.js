"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";

export const validatePassToken = async (csrfToken, body) => {
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

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/auth`,
      `${process.env.BACKEND_URL_DEV}/auth/validate_pwd_token`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Validate token unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const handleResetPassword = async (csrfToken, body) => {
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

  try {
    const bToken = await checkAndRefreshToken();
    console.log("body", body, process.env.BACKEND_URL_DEV, bToken);
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/auth`,
      `${process.env.BACKEND_URL_DEV}/auth/reset_password`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
        },
      }
    );
    if (res.status === 200) {
      cookies().set({
        name: "sessionToken",
        value: `${res?.data?.session_token}`,
        sameSite: "strict",
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // maxAge: `${60 * 60 * 1}`,
      });
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Password reset unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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
