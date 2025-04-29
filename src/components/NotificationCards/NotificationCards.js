"use client";
import React, { useState } from "react";
import { Box, Chip } from "@mui/material";
import PersonIcon from "@/images/user-profile-add.svg";
import UserIcon from "@/images/alarm.svg";
import MoreHorizIcon from "@/images/more_icon.svg";
import ArrowRightAltIcon from "@/images/right-arrow.svg";
import SocialIcon from "@/images/Socials.svg";
import CallIcon from "@/images/phone-call-01.svg";
import CallIconMissed from "@/images/phone-call-missed.svg";
import EmailIcon from "@/images/email.svg";
import { useTranslations } from "next-intl";

const getIconForCard = (type, title, status) => {
  if (type === "follow-up") {
    if (title.includes("Call")) {
      return status === "missed" ? <CallIconMissed /> : <CallIcon />;
    }
    if (title.includes("SMS") || title.includes("Whatsapp")) {
      return <SocialIcon />;
    }
    if (title.includes("Email")) {
      return <EmailIcon />;
    }
  }
  if (type === "leads") {
    return <PersonIcon />;
  }
  if (type === "personal") {
    return <UserIcon />;
  }
  return null; // Default case
};

const NotificationCard = ({ id, type, status, data }) => {
  const t = useTranslations();
  const { title, subtitle, time, hoursAgo, interestedStatus } = data;
  const [showButtons, setShowButtons] = useState(false);

  // Get the appropriate icon for the card
  const icon = getIconForCard(type, title, status);

  // Toggle button visibility on card click
  const handleCardClick = () => {
    setShowButtons((prev) => !prev);
  };

  return (
    <Box
      onClick={handleCardClick}
      className="notification_details_section"
      style={{
        backgroundColor: status === "missed" ? "#FFF7F7" : "#ffffff",
        border: status === "missed" ? "1px solid #FFB0B0" : "1px solid #E7E7E7",
      }}
    >
      <div className="title_wrapper">
        <div>
          <p
            className={`icon_section_${
              status === "missed" ? "missed" : "follow"
            }`}
          >
            {icon}
          </p>
          <p className="title_section">{title}</p>
        </div>
        <p className="hours_section">{hoursAgo}</p>
      </div>
      <div className="subtitle_wrapper">
        <div className="subtitle_details">
          <p
            className={`subtitle_text_${
              type === "leads" || type === "personal" ? "leads" : "follow"
            }`}
          >
            {type === "follow-up" && (
              <span>
                <PersonIcon />
              </span>
            )}{" "}
            {subtitle}
          </p>

          {type === "leads" && interestedStatus && (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                color: "#007bff",
              }}
            >
              <ArrowRightAltIcon style={{ marginRight: "8px" }} />
              <Chip
                label={interestedStatus}
                variant="filled"
                size="small"
                sx={{
                  color: "#AA00E4",
                  backgroundColor: "#F0D6F9",
                  fontWeight: 400,
                }}
              />
            </Box>
          )}
        </div>
        <div>
          {type === "follow-up" && (
            <p className="subtitle_time">
              <span>
                {" "}
                <UserIcon />{" "}
              </span>
              {time}
            </p>
          )}
        </div>
        <div className="more_icon">
          <MoreHorizIcon />
        </div>
      </div>

      {/* Render buttons based on showButtons state */}
      {showButtons && (
        <div className="button_notification_wrapper">
          <div className="button_notification_details">
            {type === "follow-up" && status === "missed" && (
              <button className="follow_up_button">
                {t("notification.nfc_follow_up_btn")}
              </button>
            )}
            {type === "follow-up" && status !== "missed" && (
              <>
                <button className="follow_up_button">
                  {t("notification.nfc_follow_up_btn")}
                </button>
                <button className="normal_button">
                  {t("notification.nfc_normal_btn")}
                </button>
              </>
            )}

            {/* Button for Leads and Personal */}
            {(type === "leads" || type === "personal") && (
              <button className="follow_up_button">
                {t("notification.nfc_view_btn")}
              </button>
            )}
          </div>
        </div>
      )}
    </Box>
  );
};

export default NotificationCard;
