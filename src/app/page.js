"use client";
import Login from "@/components/Login/Login";
import React, { useEffect, useState } from "react";
import { sessionTokenCheckAction } from "./actions/authActions";
import { getToken } from "@/utils/getToken";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { useSelector } from "react-redux";
import { routeIds } from "@/utils/routeIds";

const page = () => {
  // if (process.env.NODE_ENV === "production") {
  //   console.log("Running in production mode");
  // } else {
  //   console.log("Running in development mode");
  // }
  const router = useRouter();
  const [bigLoading, setBigLoading] = useState(true);

  const { permissions } = useSelector((state) => state.user);

  const checkUserLoginStatus = async () => {
    const rids = permissions?.pages?.map((p) => p?.id);
    try {
      const result = await sessionTokenCheckAction({
        headers: {
          "Cache-Control": "no-cache, no-store",
        },
      });
      if (result.success && result.status === 200) {
        // console.log("check result", result);
        // router.push("/dashboard");
        if (rids?.length > 0 && rids?.includes(1)) {
          // Use await with router.push to ensure loader continues until navigation
          await new Promise((resolve) => {
            router.push("/dashboard", { scroll: false });
            resolve();
          });
        } else {
          let routeTosend = routeIds[rids[0]];
          // console.log("hit1", routeTosend);
          await new Promise((resolve) => {
            router.push(`${routeTosend}`, { scroll: false });
            resolve();
          });
        }
      } else {
        await getToken();
        setBigLoading(false);
        // console.log("token", token);
        // console.log("No valid session token found.");
      }
    } catch (error) {
      console.log("Error checking session token:", error);
      setBigLoading();
    }
  };

  useEffect(() => {
    setCookie("locale", "en");
    checkUserLoginStatus();
  }, []);

  return (
    <>
      {bigLoading ? (
        <div
          style={{
            height: "100vh",
            width: "100%",
            maxWidth: "100vw",
            maxHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={80} color="#000" />
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};

export default page;
