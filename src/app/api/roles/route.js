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

    if (!verified) {
      // const error = new Error("Invalid CSRF token");
      // error.statusCode = 403;
      // throw error;
      return NextResponse.json(
        { message: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    if (customHeader !== "internal-component") {
      // const error = new Error("Unauthorized access");
      // error.statusCode = 403;
      // throw error;
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 403 }
      );
    }

    // // Parse FormData
    // let formData;
    // try {
    //   formData = await req.formData(); // Parse FormData
    // } catch (error) {
    //   return NextResponse.json(
    //     { message: "Invalid request body" },
    //     { status: 400 }
    //   );
    // }

    // // Extract form fields from FormData
    // const body = Object.fromEntries(formData.entries());

    // Parse body
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
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    let res;
    if (customRequire === "createRole") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/role/create`,
        body,
        axiosConfig
      );
    } else if (customRequire === "rolesdd") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/role/role_list_dd`,
        body,
        axiosConfig
      );
    } else if (customRequire === "updateRole") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/role/update`,
        body,
        axiosConfig
      );
    } else if (customRequire === "disableRole") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/role/disable`,
        body,
        axiosConfig
      );
    } else {
      // const error = new Error("Unknown request");
      // error.statusCode = 403;
      // throw error;
      return NextResponse.json({ message: "Unknown request" }, { status: 403 });
    }

    // Return only the response data, not the entire axios response
    return NextResponse.json(res.data);
  } catch (error) {
    // Return a meaningful error message and status code
    return NextResponse.json(
      { message: error.response?.data?.message || "An error occurred" },
      { status: error.response?.status || 500 }
    );
    // Optionally log the error or perform some other action
    // console.error("An error occurred:", error);
  }
};

export const GET = async (req) => {
  try {
    const csrfProtection = new csrf();
    const csrfToken = req.headers.get("csrf-token");
    const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);
    const customHeader = req.headers.get("X-Requested-From");
    const customRequire = req.headers.get("X-Data-Type");

    if (!verified) {
      const error = new Error("Invalid CSRF token");
      error.statusCode = 403;
      throw error;
    }

    if (customHeader !== "internal-component") {
      const error = new Error("Unauthorized access");
      error.statusCode = 403;
      throw error;
      // return NextResponse.json(
      //   { message: "Unauthorized access" },
      //   { status: 403 }
      // );
    }

    // Parse body
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
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    let res;
    if (customRequire === "all-roles") {
      res = await axios.post(
        `${process.env.BACKEND_URL_DEV}/role/all_role_list`,
        body,
        axiosConfig
      );
    } else if (customRequire === "rolesdd") {
      res = await axios.get(
        `${process.env.BACKEND_URL_DEV}/role/role_list_dd`,
        body,
        axiosConfig
      );
    } else if (customRequire === "roleDetails") {
      res = await axios.get(
        `${process.env.BACKEND_URL_DEV}/role/details`,
        body,
        axiosConfig
      );
    } else {
      // const error = new Error("Unknown request");
      // error.statusCode = 403;
      // throw error;
      return NextResponse.json({ message: "Unknown request" }, { status: 403 });
    }

    // Return only the response data, not the entire axios response
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json(
      { message: error.response?.data || "An error occurred" },
      { status: error.response?.status || 500 }
    );

    // Optionally log the error or perform some other action
    // console.error("Auth error occurred:", error);
  }
};
