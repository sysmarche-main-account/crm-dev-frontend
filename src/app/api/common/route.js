import { NextResponse } from "next/server";
import axios from "axios";
import csrf from "csrf";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    console.log("login GET api process env", process.env);
    console.log("login GET api req", req.headers);
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

    const axiosConfig = {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    let res;
    if (customRequire === "commonRoleTempate") {
      res = await axios.get(
        `${process.env.BACKEND_URL_DEV}/common/fetch_role_template`,
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
    console.log("hittttttttttt", error);
    return NextResponse.json(
      { message: error.response?.data || "An error occurred" },
      { status: error.response?.status || 500 }
    );

    // Optionally log the error or perform some other action
    // console.error("Auth error occurred:", error);
  }
};
