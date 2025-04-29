"use client";
import React, { useEffect, useState } from "react";
import { Chip, CircularProgress } from "@mui/material";
import FollowUpChart from "../Charts/FollowupChart";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useTranslations } from "next-intl";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { getAllFollowupsAction } from "@/app/actions/followupActions";
import { decryptClient } from "@/utils/decryptClient";

const FollowupStats = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [loading, setLoading] = useState({
    data: false,
  });
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState("right");
  const [dataArr, setDataArr] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const todaysDate = new Date().toLocaleDateString("en-CA");

  const weekStartDate = new Date(
    new Date().setDate(
      new Date().getDate() -
        new Date().getDay() +
        (new Date().getDay() === 0 ? -6 : 1)
    )
  ).toLocaleDateString("en-CA");

  const weekEndDate = new Date(
    new Date().setDate(
      new Date().getDate() -
        new Date().getDay() +
        (new Date().getDay() === 0 ? -6 : 1) +
        6
    )
  ).toLocaleDateString("en-CA");

  const getFollowupList = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      filter: {
        date_filters: [
          {
            field: "follow_up_date_time",
            from: selected === "right" ? weekStartDate : todaysDate,
            to: selected === "right" ? weekEndDate : todaysDate,
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
        setDataArr([
          decrypted?.completed_count,
          decrypted?.delayed_count,
          decrypted?.todo_count,
        ]);
        setTotalCount(
          decrypted?.completed_count +
            decrypted?.delayed_count +
            decrypted?.todo_count
        );
        // const { data, ...pageData } = decrypted;
        // setPagesData(pageData);
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
    getFollowupList();
  }, [selected]);

  // useEffect(() => {
  //   if (selected === "left") {
  //     setDataArr([15, 5, 10]);
  //   } else {
  //     setDataArr([72, 54, 24]);
  //   }
  // }, [selected]);

  return (
    <div className="followupStatsContainer">
      <div className="heading">
        <h3>Follow - ups stats</h3>
        <div className="leadsAndchips">
          <div className="chipContainer">
            <Chip
              className={`chip ${selected === "left" ? "selected" : ""}`}
              label="Today"
              size="small"
              onClick={() => setSelected("left")}
            />
            <Chip
              className={`chip ${selected === "right" ? "selected" : ""}`}
              label="This Week"
              size="small"
              onClick={() => setSelected("right")}
            />
          </div>
        </div>
      </div>
      <div className="content" style={{ height: loading?.data && "100%" }}>
        {loading.data ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress size={50} sx={{ color: "#30327b" }} />
          </div>
        ) : (
          <>
            <FollowUpChart
              tab={selected}
              dataArr={dataArr}
              totalCount={totalCount}
            />
            <div className="chartLegend">
              <div className="item">
                <div className="greenDot"></div>
                <span className="label">
                  Total Completed -{" "}
                  <span className="labelNumber">{dataArr[0] || 0}</span>
                </span>
              </div>
              <div className="item">
                <div className="redDot"></div>
                <span className="label">
                  Total Missed -{" "}
                  <span className="labelNumber">{dataArr[1] || 0}</span>
                </span>
              </div>
              <div className="item">
                <div className="orangeDot"></div>
                <span className="label">
                  Total Pending -{" "}
                  <span className="labelNumber">{dataArr[2] || 0}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FollowupStats;
