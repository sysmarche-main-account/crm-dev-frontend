"use client";
import React from "react";
import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useTranslations } from "next-intl";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { setStage } from "@/lib/slices/dashboardSlice";

const TotalLead = () => {
  const router = useRouter();
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const dispatch = useDispatch();

  const { loadingState, data } = useSelector((state) => state.dashboard);

  return (
    <div className="totalLeadsContainer">
      <div className="widgetInfo">
        <p>Total leads</p>
        <div className="leadNumbers">
          {loadingState ? (
            <CircularProgress size={30} sx={{ color: "#30327b" }} />
          ) : (
            <span className="leads">{data?.lead_total || 0}</span>
          )}
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", gap: "15px" }}>
        <Box display="flex" gap="15px" width="100%">
          {/* Active Leads Bar */}
          <Box
            flex={1}
            position="relative"
            onClick={() => {
              if (!loadingState) {
                dispatch(setStage(data?.lead_active_id));
                router.push("/leads?from=dashboard");
              }
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={`${(data?.lead_active / data?.lead_total) * 100 ?? 0}`}
              sx={{
                height: 40,
                borderRadius: 1,
                [`&.${linearProgressClasses.root}`]: {
                  backgroundColor: "#F0EFFF",
                },
                [`& .${linearProgressClasses.bar}`]: {
                  backgroundColor: "#D3D0FD",
                  borderRadius: 1,
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pointerEvents: "none", // So the bar remains clickable if needed
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                Active leads
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {loadingState ? (
                  <CircularProgress size={20} sx={{ color: "#30327b" }} />
                ) : (
                  data?.lead_active || 0
                )}
              </Typography>
            </Box>
          </Box>

          {/* Invalid Leads Bar */}
          <Box
            flex={1}
            position="relative"
            onClick={() => {
              if (!loadingState) {
                dispatch(setStage(data?.lead_invalid_id));
                router.push("/leads?from=dashboard");
              }
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={`${
                ((data?.lead_invalid ?? 0) / (data?.lead_total || 1)) * 100
              }`}
              sx={{
                height: 40,
                borderRadius: 1,
                [`&.${linearProgressClasses.root}`]: {
                  backgroundColor: "#F8E7E7",
                },
                [`& .${linearProgressClasses.bar}`]: {
                  backgroundColor: "#FFBFBF",
                  borderRadius: 1,
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pointerEvents: "none",
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                Invalid leads
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {loadingState ? (
                  <CircularProgress size={20} sx={{ color: "#30327b" }} />
                ) : (
                  data?.lead_invalid || 0
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </div>
      <div style={{ width: "100%", display: "flex", gap: "15px" }}>
        <Box display="flex" gap="15px" width="100%">
          {/* Enrolled Leads Bar */}
          <Box
            flex={1}
            position="relative"
            onClick={() => {
              if (!loadingState) {
                dispatch(setStage(data?.lead_enrolled_id));
                router.push("/leads?from=dashboard");
              }
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={`${
                ((data?.lead_enrolled ?? 0) / (data?.lead_total || 1)) * 100
              }`}
              sx={{
                height: 40,
                borderRadius: 1,
                [`&.${linearProgressClasses.root}`]: {
                  backgroundColor: "#FFF8E3",
                },
                [`& .${linearProgressClasses.bar}`]: {
                  backgroundColor: "#FFEDB6",
                  borderRadius: 1,
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pointerEvents: "none", // So the bar remains clickable if needed
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                Enrolled leads
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {loadingState ? (
                  <CircularProgress size={20} sx={{ color: "#30327b" }} />
                ) : (
                  data?.lead_enrolled || 0
                )}
              </Typography>
            </Box>
          </Box>

          {/* Dropped Leads Bar */}
          <Box
            flex={1}
            position="relative"
            onClick={() => {
              if (!loadingState) {
                dispatch(setStage(data?.lead_dropped_id));
                router.push("/leads?from=dashboard");
              }
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={`${
                ((data?.lead_dropped ?? 0) / (data?.lead_total || 1)) * 100
              }`}
              sx={{
                height: 40,
                borderRadius: 1,
                [`&.${linearProgressClasses.root}`]: {
                  backgroundColor: "#EDEDED",
                },
                [`& .${linearProgressClasses.bar}`]: {
                  backgroundColor: "#DBDBDB",
                  borderRadius: 1,
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pointerEvents: "none",
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                Dropped leads
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {loadingState ? (
                  <CircularProgress size={20} sx={{ color: "#30327b" }} />
                ) : (
                  data?.lead_dropped || 0
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default TotalLead;
