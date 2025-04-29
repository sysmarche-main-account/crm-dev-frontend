import { NextResponse } from "next/server";
import axios from "axios";
import csrf from "csrf";

export const GET = async (req) => {
  try {
    // Get headers
    const customHeader = req.headers.get("X-Requested-From");
    const userAgent = req.headers.get("User-Agent");

    // Check if the custom header is unauthorized
    if (customHeader !== "internal-component") {
      const error = new Error("Unauthorized access");
      error.statusCode = 403; // Assign a status code to the error
      throw error; // Throw the error to be caught by the catch block
    }

    // Get the custom data type required
    const customRequire = req.headers.get("X-Data-Type");

    if (customRequire === "users") {
      // Fetch users data
      const res = await fetch("https://jsonplaceholder.typicode.com/users");

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      return NextResponse.json({ data, userAgent }, { status: 200 });
    } else if (customRequire === "posts") {
      // Fetch posts data
      const res = await fetch("https://jsonplaceholder.typicode.com/posts");

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      return NextResponse.json({ data }, { status: 200 });
    } else {
      // Handle unknown endpoint
      return NextResponse.json(
        { message: "Endpoint not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    // Catch block to handle errors
    console.error("Error occurred:", error);

    return NextResponse.json(
      {
        message: error.message || "An error occurred",
      },
      { status: error.statusCode || 500 } // Use the custom statusCode or default to 500
    );
  }
};

export const POST = async (req) => {
  const csrfProtection = new csrf();
  const csrfToken = req.headers.get("csrf-token");

  // Verify CSRF token
  try {
    const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);
    console.log("ver", verified);
    if (verified) {
      const customHeader = req.headers.get("X-Requested-From");
      if (customHeader !== "internal-component") {
        return NextResponse.json(
          {
            message: "Unauthorized access",
          },

          {
            status: 403,
          }
        );
      }
      const data = await req.formData();
      const title = data.get("title");
      const body = data.get("body");
      const userId = data.get("id");
      const userAgent = req.headers.get("User-Agent");

      console.log("data", { title, body, userId });

      if (!title || !body || !userId) {
        return NextResponse.json(
          {
            success: false,
            message: "All fields are required.",
          },
          { status: 400 }
        );
      } else {
        try {
          const res = await axios.post(
            "https://jsonplaceholder.typicode.com/posts",
            { title, body, userId },
            {
              headers: {
                "Content-type": "application/json; charset=UTF-8",
              },
            }
          );
          console.log("res", res.data);
          return NextResponse.json({
            success: true,
            message: userAgent,
            data: res.data,
          });
        } catch (error) {
          console.log("err", error);
          return NextResponse.json(
            {
              success: false,
              message: "Internal server error",
            },
            { status: 500 }
          );
        }
      }
    } else {
      const error = new Error("Invalid CSRF token");
      error.statusCode = 403;
      throw error;
      // return NextResponse.json(
      //   { message: "Invalid CSRF token" },
      //   { status: 403 }
      // );
    }
    // Proceed with form submission logic here
    // return NextResponse.json(
    //   { message: "Form submission successful" },
    //   { status: 200 }
    // );
  } catch (error) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
};
