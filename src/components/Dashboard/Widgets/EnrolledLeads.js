import React, { useEffect, useState } from "react";
import EnrolledLeadsLogo from "@/images/enrolledLeads.svg";
import { CircularProgress } from "@mui/material";
import { getAllLeadsAction } from "@/app/actions/leadActions";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useTranslations } from "next-intl";
import { getCsrfToken } from "@/app/actions/getCsrfToken";

const EnrolledLeads = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [loading, setLoading] = useState({
    alleads: false,
  });
  const [data, setData] = useState(null);

  const getAllLeadsData = async () => {
    setLoading((prev) => ({ ...prev, alleads: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      filter: {
        field_filters: [
          {
            field: "lead_status",
            value: 34, //Enrolled Status
          },
        ],
      },
    };
    console.log("body allLeads", reqbody);

    try {
      const result = await getAllLeadsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final allLeads", decrypted);

        setData(decrypted);
        // const { data, ...pageData } = decrypted;
        // setPagesData(pageData);
        setLoading((prev) => ({ ...prev, alleads: false }));
        // setBigLoading(false);
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
        setLoading((prev) => ({ ...prev, alleads: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, alleads: false }));
    }
  };

  useEffect(() => {
    getAllLeadsData();
  }, []);

  return (
    <div className="totalLeadsContainer">
      <div className="widgetLogo">
        <EnrolledLeadsLogo />
      </div>
      <div className="widgetInfo">
        <p>Enrolled leads</p>
        <div className="leadNumbers">
          {loading.alleads ? (
            <CircularProgress size={30} sx={{ color: "#30327b" }} />
          ) : (
            <span className="leads">{data?.filter_count || "0"}</span>
          )}
          {/* <Chip
            label={`25%`}
            variant="filled"
            size="small"
            icon={<ArrowDropUp color="#00B63D" />}
            sx={{
              color: "#00B63D",
              backgroundColor: "#DDFFE8",
              fontWeight: 400,
              overflow: "visible",
            }}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default EnrolledLeads;
