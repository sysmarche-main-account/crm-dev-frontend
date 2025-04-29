"use client";
import React from "react";
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@/images/x-03.svg";
import CallIcon from "@/images/phone-call-snackbar.svg";
import { useTranslations } from "next-intl";

const MultipleNotificationSnackbar = ({
  data,
  open,
  onClose,
  index,
  onEditClick,
  onDeleteClick,
}) => {
  const t = useTranslations();
  const buttonLabel = data.buttonLabel || "Edit";
  const handleButtonClick =
    data.buttonType === "edit" ? onEditClick : onDeleteClick;

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        marginTop: `${index * 250}px`, // Adjusts the vertical stacking based on index
        overflow: "hidden !important",
      }}
    >
      <div severity="info" icon={false} className="snackbar_wrapper">
        <div className="snackbar_details">
          <div className="snackbar_call_section">
            <div className="snackbar_title_call_icon">
              <CallIcon />
            </div>
            <div className="snackbar_title">{data.title}</div>
          </div>

          <div className="snackbar_close_icon">
            <IconButton onClick={onClose}>
              {" "}
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        <p className="snackbar_data_name">{data.name}</p>
        <div className="snackbar_time" style={{ marginTop: "12px" }}>
          <p>{t("notification.mn_snb_follow_up_time_lab")}</p>
          <p className="snackbar_tile_details"> {data.followUpTime}</p>
        </div>
        <div
          className="snackbar_time"
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <p
            className="snackbar_tile_details"
            style={{ fontSize: "20px", borderRadius: "4px", padding: "18px" }}
          >
            {data.remainingTime}
          </p>
          <button className="snackbar_edit_button"> {buttonLabel}</button>
        </div>
      </div>
    </Snackbar>
  );
};

export default MultipleNotificationSnackbar;
