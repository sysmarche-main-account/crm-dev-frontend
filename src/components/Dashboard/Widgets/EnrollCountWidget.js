"use client";
import React, { useEffect, useState } from "react";
import EnrolledCountChart from "../Charts/EnrollCountChart";
import { useSelector } from "react-redux";
import { getCounsellorWiseCountAction } from "@/app/actions/dashboardActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import { CircularProgress } from "@mui/material";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useTranslations } from "next-intl";

const EnrollCountWidget = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { reporting, start, end } = useSelector((state) => state.dashboard);

  const [loading, setLoading] = useState({
    data: false,
  });
  const [data, setData] = useState(null);

  const getCounsellorWiseCount = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      filter: {
        owner: reporting,
        date_filters: [
          {
            field: "updated_at",
            from: start,
            to: end,
          },
        ],
      },
    };
    console.log("counsellor wise body", reqbody);

    try {
      const result = await getCounsellorWiseCountAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("counsellor count", decrypted);

        setData(decrypted);
        setLoading((prev) => ({ ...prev, data: false }));
      } else {
        console.error(result.error);
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) =>
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              })
            );
          }
        }
        setLoading((prev) => ({ ...prev, data: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  useEffect(() => {
    getCounsellorWiseCount();
  }, [reporting, start, end]);

  return (
    <div className="enrollContainer">
      <div className="heading">
        <h3>Enrolled count by counsellor</h3>
      </div>
      {loading.data ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <CircularProgress size={50} sx={{ color: "#30327b" }} />
        </div>
      ) : (
        <div style={{ width: "100%" }}>
          {data?.counselor_enroll_counts?.length > 0 ? (
            <EnrolledCountChart data={data} />
          ) : (
            "NO DATA FOUND"
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollCountWidget;
