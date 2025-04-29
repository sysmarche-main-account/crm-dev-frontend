import { NextResponse } from "next/server";
import csrf from "csrf";
import axios from "axios";

export const POST = async (req) => {
  try {
    const csrfProtection = new csrf();
    const csrfToken = req.headers.get("csrf-token");
    const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);
    const customHeader = req.headers.get("X-Requested-From");
    const customRequire = req.headers.get("X-Data-Type");
    const token = req.headers.get("session-token");

    // const formData = await req.formData();
    // console.log("from", formData);

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
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const axiosConfig = {
      "Content-type": "application/json; charset=UTF-8",
      "session-token": `${token}`,
    };

    let res;
    if (customRequire === "createUser") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/users/create`,
        body,
        axiosConfig
      );
    } else if (customRequire === "userDetails") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/users/details`,
        body,
        axiosConfig
      );
    } else if (customRequire === "updateUser") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/users/update`,
        body,
        {
          headers: axiosConfig,
        }
      );
    } else if (customRequire === "all-users") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/users/all_user_list`,
        body,
        {
          headers: axiosConfig,
        }
      );
    } else if (customRequire === "usersdd") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/users/user_list_dd`,
        body,
        {
          headers: axiosConfig,
        }
      );
    } else {
      return NextResponse.json({ message: "Unknown request" }, { status: 403 });
    }

    // Return only the response data, not the entire axios response
    return NextResponse.json(res.data);
  } catch (error) {
    // Optionally log the error or perform some other action
    console.error("An error occurred:", error);

    // Return a meaningful error message and status code
    return NextResponse.json(
      { message: error.response?.data?.message || "An error occurred" },
      { status: error.response?.status || 500 }
    );
  }
};
