import { Album } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import LeadDistributionChart from "../Charts/LeadDistributionChart";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useTranslations } from "next-intl";
import { getStatusWiseCountAction } from "@/app/actions/dashboardActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";

const LeadDistributionWidget = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { reporting, start, end } = useSelector((state) => state.dashboard);

  const [loading, setLoading] = useState({
    data: false,
  });
  const [data, setData] = useState(null);

  const getStatusWiseData = async () => {
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
    console.log("followup table body", reqbody);

    try {
      const result = await getStatusWiseCountAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("finalFollowup", decrypted);

        setData(decrypted);
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
    getStatusWiseData();
  }, [reporting, start, end]);

  return (
    <div className="distributionContainer">
      <div className="heading">
        <h3>Lead distribution by stages</h3>
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
        <div className="chartContainer">
          <div className="col1">
            <div className="totalLeads">
              <p>Total Leads</p>

              <h2>{data?.total_leads || 0}</h2>
            </div>
            <div className="colors_1">
              {data?.status_counts &&
                data?.status_counts
                  ?.slice(0, data?.status_counts?.length / 2 + 1)
                  .map((stage, index) => (
                    <span key={index} className="single_color_container">
                      <Album
                        sx={{ color: `${stage?.txt_color}` }}
                        fontSize="25px"
                      />
                      <span className="color_title">{stage?.status_name}</span>
                    </span>
                  ))}
            </div>
          </div>
          <div className="col2">
            <LeadDistributionChart data={data} />
          </div>
          <div className="col3">
            {data?.status_counts &&
              data?.status_counts
                ?.slice(data?.status_counts?.length / 2 + 1)
                .map((stage, index) => (
                  <span key={index} className="single_color_container">
                    <Album
                      sx={{ color: `${stage?.txt_color}` }}
                      fontSize="25px"
                    />
                    <span className="color_title">{stage?.status_name}</span>
                  </span>
                ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDistributionWidget;
