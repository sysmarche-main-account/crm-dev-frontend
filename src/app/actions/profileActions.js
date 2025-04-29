"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";

export const handleProfileDataUpdateAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
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
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV}/users/update`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
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
      message: "Profile update unsuccessful",
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

export const handleChangePasswordAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
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
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/auth`,
      `${process.env.BACKEND_URL_DEV}/auth/change_password`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
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
      message: "password change unsuccessful",
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

export const handleUploadImageAction = async (csrfToken, formData) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
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
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/upload`,
      `${process.env.BACKEND_URL_DEV}/users/update`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
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
      message: "profile pic upload unsuccessful",
    };
  } catch (error) {
    // console.log("log", error);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
        body: formData,
      },
    };
  }
};
