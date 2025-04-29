import React, { useState } from "react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import CallIcon from "@/images/phone-call-01.svg";
import PersonIcon from "@/images/user-profile-add.svg";
import MissedCallIcon from "@/images/phone-call-missed.svg";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const NotificationModal = ({
  anchorElNotification,
  handleCloseNotification,
}) => {
  const [activeNotifications, setActiveNotifications] = useState([1]); // Initially setting the first notification as active.
  const t = useTranslations();
  const router = useRouter();

  const notifications = [];
  // const notifications = [
  //   {
  //     id: 1,
  //     type: "follow-up",
  //     status: "todo",
  //     details: {
  //       title: "Follow-up: BBA Fee Discussion",
  //       subtitle: "Manthan Waghmare",
  //       time: "18:00",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <CallIcon />,
  //   },
  //   {
  //     id: 2,
  //     type: "lead-assigned",
  //     status: "todo",
  //     details: {
  //       title: "New lead assigned to you",
  //       subtitle: "Ishita Rastogi",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 3,
  //     type: "lead-update",
  //     status: "todo",
  //     details: {
  //       title: "Lead details updated",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 4,
  //     type: "missed-follow-up",
  //     status: "missed",
  //     details: {
  //       title: "Missed Follow-up",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <MissedCallIcon />,
  //   },
  //   {
  //     id: 1,
  //     type: "follow-up",
  //     status: "todo",
  //     details: {
  //       title: "Follow-up: BBA Fee Discussion",
  //       subtitle: "Manthan Waghmare",
  //       time: "18:00",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <CallIcon />,
  //   },
  //   {
  //     id: 2,
  //     type: "lead-assigned",
  //     status: "todo",
  //     details: {
  //       title: "New lead assigned to you",
  //       subtitle: "Ishita Rastogi",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 3,
  //     type: "lead-update",
  //     status: "todo",
  //     details: {
  //       title: "Lead details updated",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 4,
  //     type: "missed-follow-up",
  //     status: "missed",
  //     details: {
  //       title: "Missed Follow-up",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <MissedCallIcon />,
  //   },
  //   {
  //     id: 1,
  //     type: "follow-up",
  //     status: "todo",
  //     details: {
  //       title: "Follow-up: BBA Fee Discussion",
  //       subtitle: "Manthan Waghmare",
  //       time: "18:00",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <CallIcon />,
  //   },
  //   {
  //     id: 2,
  //     type: "lead-assigned",
  //     status: "todo",
  //     details: {
  //       title: "New lead assigned to you",
  //       subtitle: "Ishita Rastogi",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 3,
  //     type: "lead-update",
  //     status: "todo",
  //     details: {
  //       title: "Lead details updated",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 4,
  //     type: "missed-follow-up",
  //     status: "missed",
  //     details: {
  //       title: "Missed Follow-up",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <MissedCallIcon />,
  //   },
  //   {
  //     id: 1,
  //     type: "follow-up",
  //     status: "todo",
  //     details: {
  //       title: "Follow-up: BBA Fee Discussion",
  //       subtitle: "Manthan Waghmare",
  //       time: "18:00",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <CallIcon />,
  //   },
  //   {
  //     id: 2,
  //     type: "lead-assigned",
  //     status: "todo",
  //     details: {
  //       title: "New lead assigned to you",
  //       subtitle: "Ishita Rastogi",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 3,
  //     type: "lead-update",
  //     status: "todo",
  //     details: {
  //       title: "Lead details updated",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <PersonIcon />,
  //   },
  //   {
  //     id: 4,
  //     type: "missed-follow-up",
  //     status: "missed",
  //     details: {
  //       title: "Missed Follow-up",
  //       subtitle: "Avni Rajput",
  //       hoursAgo: "4hrs ago",
  //     },
  //     icon: <MissedCallIcon />,
  //   },
  // ];

  const handleMarkAllAsRead = () => {
    setActiveNotifications([]); // Clear all active notifications.
  };

  const handleRedirect = () => {
    handleCloseNotification(); // Call your existing function
    router.push("/allnotifications"); // Redirect to the desired path
  };

  return (
    <Box>
      <Menu
        anchorEl={anchorElNotification}
        open={Boolean(anchorElNotification)}
        onClose={handleCloseNotification}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              width: "420px !important",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Fixed Header Section */}
        <div
          className="notification_dropdown_section"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "white",
            padding: "8px 16px",
            borderBottom: "1px solid #E3E3E3",
          }}
        >
          <p>{t("notification.nfm_title")}</p>
          {/* <button onClick={handleMarkAllAsRead}>{t('notification.nfm_mark_all_as_read')}</button> */}
        </div>

        {/* Scrollable Content Section */}
        <div
          style={{
            flex: 1,
            height: "100px",
            maxHeight: "420px",
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 0px; /* Hides the scrollbar */
              height: 0px; /* Hides the horizontal scrollbar (if any) */
            }

            div::-webkit-scrollbar-thumb {
              background-color: transparent; /* Makes the thumb invisible */
            }

            div::-webkit-scrollbar-track {
              background: transparent; /* Makes the track invisible */
            }
          `}</style>

          {/* Notification content */}
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                sx={{
                  display: "flex",
                  alignItems: "start",
                  padding: "12px 16px",
                  gap: 1,
                  borderBottom: "1px solid #E3E3E3",
                  width: "450px",
                  backgroundColor: activeNotifications.includes(notification.id)
                    ? "#EBF4F0"
                    : "transparent",
                }}
                onClick={handleCloseNotification}
              >
                <div className="notification_details">
                  <div style={{ marginTop: "-10px" }}>
                    <p className="notification_icon">{notification.icon}</p>
                  </div>
                  <div>
                    <div className="notification_content">
                      <p className="notification_title">
                        {notification.details.title}
                      </p>
                      <p className="notification_hours">
                        {notification.details.hoursAgo}
                      </p>
                    </div>
                    <div>
                      <p className="notification_subtitle">
                        {notification.details.subtitle}
                      </p>
                      {notification.details.time && (
                        <p className="notification_time">
                          {" "}
                          {t("notification.nfm_time")} -{" "}
                          {notification.details.time}
                        </p>
                      )}
                    </div>
                    {notification.type === "follow-up" && (
                      <button className="notification_button">
                        {" "}
                        {t("notification.nfm_follow_up_btn")}
                      </button>
                    )}
                  </div>
                </div>
              </MenuItem>
            ))
          ) : (
            <MenuItem
              sx={{
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <p> {t("notification.nfm_no_nf")} </p>
            </MenuItem>
          )}
        </div>

        {/* Fixed Footer Section */}
        <div
          style={{
            position: "sticky",
            bottom: 10,
            zIndex: 1,
            backgroundColor: "white",
            padding: "0px 16px",
            borderTop: "1px solid #E3E3E3",
            textAlign: "right",
          }}
        >
          <button className="all_notification" onClick={handleRedirect}>
            {t("notification.nfm_see_all_nf")}
          </button>
        </div>
      </Menu>
    </Box>
  );
};

export default NotificationModal;
