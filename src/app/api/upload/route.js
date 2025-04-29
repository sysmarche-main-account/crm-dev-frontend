// import { NextResponse } from "next/server";
// import csrf from "csrf";
// import axios from "axios";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export const POST = async (req) => {
//   try {
//     const csrfProtection = new csrf();
//     const csrfToken = req.headers.get("csrf-token");
//     const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);
//     const customHeader = req.headers.get("X-Requested-From");
//     const customRequire = req.headers.get("X-Data-Type");
//     const token = req.headers.get("session-token");

//     const formData = await req.formData();
//     console.log("from", formData);

//     body = await req.json();
//     console.log("body", body);

//     if (!verified) {
//       return NextResponse.json(
//         { message: "Invalid CSRF token" },
//         { status: 403 }
//       );
//     }

//     if (customHeader !== "internal-component") {
//       return NextResponse.json(
//         { message: "Unauthorized access" },
//         { status: 403 }
//       );
//     }

//     // let res;
//     // if (customRequire === "profilePicUpload") {
//     //   res = await axios.post(
//     //     `${process.env.BACKEND_URL_DEV}/users/update`,
//     //     body,
//     //     {
//     //       headers: {
//     //         "Content-type": "multipart/form-data",
//     //         "session-token": `${token}`,
//     //       },
//     //     }
//     //   );
//     // } else {
//     //   return NextResponse.json({ message: "Unknown request" }, { status: 403 });
//     // }

//     // Return only the response data, not the entire axios response
//     // return NextResponse.json(res.data);
//     return NextResponse.json({ message: "success" });
//   } catch (error) {
//     // Optionally log the error or perform some other action
//     console.error("An error occurred:", error);

//     // Return a meaningful error message and status code
//     return NextResponse.json(
//       { message: error.response?.data?.message || "An error occurred" },
//       { status: error.response?.status || 500 }
//     );
//   }
// };
