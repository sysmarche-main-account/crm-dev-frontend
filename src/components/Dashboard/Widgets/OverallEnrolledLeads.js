import React from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import useLogout from "@/app/hooks/useLogout";
import { setStage } from "@/lib/slices/dashboardSlice";
import { ArrowOutward } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

const OverallEnrolledLeads = () => {
  const router = useRouter();
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const dispatch = useDispatch();

  const { loadingState, data } = useSelector((state) => state.dashboard);

  return (
    <div className="overallContainer">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <p>Overall</p>
        <ArrowOutward
          onClick={() => {
            if (!loadingState) {
              dispatch(setStage(data?.lead_enrolled_id));
              router.push("/leads?from=dashboard");
            }
          }}
          sx={{
            color: "#D7C89D",
            cursor: "pointer",
          }}
        />
      </div>
      <h1>
        {loadingState ? (
          <CircularProgress size={20} sx={{ color: "#30327b" }} />
        ) : (
          data?.lead_enrolled || 0
        )}
      </h1>
      <span className="title">Enrolled leads</span>
    </div>
  );
};

export default OverallEnrolledLeads;
