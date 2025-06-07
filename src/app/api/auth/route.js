import { NextResponse } from "next/server";
import axios from "axios";
import csrf from "csrf";

export const POST = async (req) => {
  try {
    console.log("login POST api process env", process.env);
    console.log("login POST api req", req.headers);
    const csrfProtection = new csrf();
    const csrfToken = req.headers.get("csrf-token");
    const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);
    const customHeader = req.headers.get("X-Requested-From");
    const customRequire = req.headers.get("X-Data-Type");
    const token = req.headers.get("session-token");

    if (!verified) {
      return NextResponse.json(
        { message: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    if (customHeader !== "internal-component") {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await req.json(); // Parse the request body
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const axiosConfig = {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    let res;
    console.log("login api process env", process.env);
    if (customRequire === "login") {
      console.log("login api call", process.env.BACKEND_URL_DEV);
      console.info("ilogin api call", process.env.BACKEND_URL_DEV);
      console.warn("wlogin api call", process.env.BACKEND_URL_DEV);
      console.error("elogin api call", process.env.BACKEND_URL_DEV);
      
      // **Login Request**
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/auth/app_login`,
        body,
        axiosConfig
      );
    } else if (customRequire === "forgotPassword") {
      // **Forgot Password Request**
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/auth/forgot_password`,
        body,
        axiosConfig
      );
    } else if (customRequire === "resetPassword") {
      // **Reset Password Request**
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/auth/reset_password`,
        body,
        axiosConfig
      );
    } else if (customRequire === "changePassword") {
      // **Change Password Request**
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/auth/change_password`,
        body,
        {
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "session-token": `${token}`,
          },
        }
      );
    } else if (customRequire === "validateToken") {
      // **Validate token Request**
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/auth/validate_pwd_token`,
        body,
        axiosConfig
      );
    } else {
      const error = new Error("Unauthorized access");
      error.statusCode = 403;
      throw error;
    }

    // Return only the response data, not the entire axios response
    return NextResponse.json(res.data);
  } catch (error) {
    // Optionally log the error or perform some other action
    // console.error("Auth error occurred:", error);
    return NextResponse.json(
      { message: error.response?.data || "An error occurred" },
      { status: error.response?.status || 500 }
    );
  }
};
