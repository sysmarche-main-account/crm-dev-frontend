"use client";
import { useActiveComponent } from "@/app/(context)/ActiveComponentProvider";
// import { CircularProgress } from "@mui/material";
import { useTranslations } from "next-intl";

const GlobalSpinner = () => {
  const t = useTranslations();
  const { logoutLoading } = useActiveComponent();

  if (!logoutLoading) return null;

  return (
    <div className="spinner-overlay">
      <div className="globalspinner">
        {/* Replace this with your spinner animation */}
        {/* space issue */}
        <span>{t("login.global_spinner_logout")}</span>
        <div className="loader"></div>
        {/* <CircularProgress size={65} color="inherit" /> */}
      </div>
    </div>
  );
};

export default GlobalSpinner;
