"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";

export const handleLoginAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  // const bToken = cookieStore.get("token");
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
    // console.log("testNewGen", bToken);
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/auth`,
      `${process.env.BACKEND_URL_DEV}/auth/app_login`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
        },
      }
    );
    // console.log("loggggg", res);
    if (res.status === 200) {
      if (res?.data?.hasOwnProperty("first_name")) {
        cookies().set({
          name: "sessionToken",
          value: `${res?.data?.session_token}`,
          sameSite: "lax",
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          // maxAge: `${60 * 60 * 1}`,
        });
      }
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
      message: "Login unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
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

export const handleForgetPasswordAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  // // const bToken = cookieStore.get("token");
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
      `${process.env.BACKEND_URL_DEV}/auth/forgot_password`,
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
      message: "Forgot password unsuccessful",
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

export const handleLogoutAction = async () => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  if (!sessionToken) {
    return {
      success: false,
      message: "No session token found.",
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/auth`,
      `${process.env.BACKEND_URL_DEV}/auth/logout`,
      { session_token: sessionToken?.value },
      {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Authorization: `Bearer ${bToken?.value}`,
        },
      }
    );

    if (res.status === 200) {
      return {
        success: true,
        status: res.status,
        data: res.data,
        // data: res.data,
        // headers: res.headers,
      };
    }

    return {
      success: false,
      status: res.status,
      message: "Logout unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
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

export const sessionTokenCheckAction = async () => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");
  const pagepermission = cookieStore.get("pgperm");

  if (sessionToken?.value && pagepermission?.value) {
    return {
      success: true,
      status: 200,
    };
  } else {
    return {
      success: false,
      status: 401,
    };
  }
};
