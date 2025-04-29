import React, { useState, useEffect } from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getAllFollowupsAction } from "@/app/actions/followupActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { setLoadingFollowup } from "@/lib/slices/dashboardSlice";
import { decryptClient } from "@/utils/decryptClient";
import { CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";

const TotalMissedFollowups = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const router = useRouter();

  const { loadingFollowup, reporting, start, end } = useSelector(
    (state) => state.dashboard
  );

  const dispatch = useDispatch();

  // const [loading, setLoading] = useState({
  //   data: false,
  // });
  const [data, setData] = useState(null);

  const getMissedFollowupData = async () => {
    // setLoading((prev) => ({ ...prev, data: true }));
    dispatch(setLoadingFollowup(true));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      filter: {
        owner: reporting,
        date_filters: [
          {
            field: "follow_up_date_time",
            from: start,
            to: end,
          },
        ],
      },
    };
    console.log("followup table body", reqbody);

    try {
      const result = await getAllFollowupsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("finalFollowup", decrypted);

        setData(decrypted);
        // const { data, ...pageData } = decrypted;
        // setPagesData(pageData);
        // setLoading((prev) => ({ ...prev, data: false }));
        dispatch(setLoadingFollowup(false));
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
        // setLoading((prev) => ({ ...prev, data: false }));
        dispatch(setLoadingFollowup(false));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      // setLoading((prev) => ({ ...prev, data: false }));
      dispatch(setLoadingFollowup(false));
    }
  };

  useEffect(() => {
    getMissedFollowupData();
  }, [reporting, start, end]);

  return (
    <div
      className="missedFollowupContainer"
      onClick={() => {
        router.push("/leads?from=dashboardFollowup");
      }}
    >
      <p>Total Missed Follow-ups</p>
      <h1>
        {/* {loading.data ? ( */}
        {loadingFollowup ? (
          <CircularProgress size={20} sx={{ color: "#30327b" }} />
        ) : (
          data?.delayed_count || 0
        )}
      </h1>
    </div>
  );
};

export default TotalMissedFollowups;
