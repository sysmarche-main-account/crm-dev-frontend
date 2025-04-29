"use client";
import React, { useState } from "react";
import NotificationCard from "./NotificationCards";
import { Button, Pagination, Select, MenuItem } from "@mui/material";
import MultipleNotificationSnackbar from "./MultipleNotificationSnackbar";
import { useTranslations } from "next-intl";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";

const Cards = () => {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handlePageChange = (event, value) => setPage(value);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1); // Reset to the first page when rows per page changes
  };

  const cardData = [
    {
      id: 1,
      type: "follow-up",
      status: "todo",
      details: {
        title: "Follow-up Call",
        subtitle: "Manthan Waghmare",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
    {
      id: 2,
      type: "follow-up",
      status: "todo",
      details: {
        title: "Follow-up SMS",
        subtitle: "Manthan Waghmare",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
    {
      id: 3,
      type: "follow-up",
      status: "todo",
      details: {
        title: "Follow-up Whatsapp",
        subtitle: "Manthan Waghmare",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
    {
      id: 4,
      type: "follow-up",
      status: "todo",
      details: {
        title: "Follow-up Email",
        subtitle: "Manthan Waghmare",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
    {
      id: 5,
      type: "follow-up",
      status: "missed",
      details: {
        title: "Missed: Follow-up Call",
        subtitle: "Manthan Waghmare",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
    {
      id: 6,
      type: "leads",
      status: "todo",
      details: {
        title: "New leads assigned",
        subtitle: "+50 New lead",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
    {
      id: 7,
      type: "leads",
      status: "todo",
      details: {
        title: "Lead status updated",
        subtitle: "Ishita leads",
        time: "18:30",
        hoursAgo: "4 hrs ago",
        interestedStatus: "Interested",
      },
    },
    {
      id: 8,
      type: "personal",
      status: "todo",
      details: {
        title: "Personal details updated",
        subtitle: "By Manager",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
    {
      id: 9,
      type: "personal",
      status: "todo",
      details: {
        title: "Roles & permission updated",
        subtitle: "By Manager",
        time: "18:30",
        hoursAgo: "4 hrs ago",
      },
    },
  ];

  const totalPages = Math.ceil(cardData.length / rowsPerPage);
  const paginatedData = cardData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const [notifications, setNotifications] = useState([]);
  const [openSnackbars, setOpenSnackbars] = useState({});

  const handleClick = () => {
    setNotifications(data);
    setOpenSnackbars({}); // Reset state
    showSnackbarsSequentially(0);
  };

  const showSnackbarsSequentially = (index) => {
    if (index >= data.length) return; // Stop if all snackbars have been displayed

    setTimeout(() => {
      setOpenSnackbars((prev) => ({
        ...prev,
        [data[index].id]: true, // Open the current snackbar
      }));
      showSnackbarsSequentially(index + 1); // Show the next snackbar after 2 seconds
    }, 1000);
  };

  const handleClose = (id) => {
    setOpenSnackbars((prev) => ({
      ...prev,
      [id]: false, // Close the specific snackbar
    }));
  };

  const data = [
    {
      id: 1,
      title: "Fee Discussion for BBA",
      name: "Manthan Waghmare",
      followUpTime: "18:00 Today",
      remainingTime: "In 10:00 mins",
    },
    {
      id: 2,
      title: "Document Submission for MBA",
      name: "Ritika Sharma",
      followUpTime: "12:00 Tomorrow",
      remainingTime: "In 1 day",
    },
    {
      id: 3,
      title: "Final Interview for MSc",
      name: "Arjun Mehta",
      followUpTime: "14:00 Today",
      remainingTime: "In 4:00 mins",
    },
  ];

  const handleEditClick = () => {
    alert("Edit button clicked!");
  };

  return <></>;

  // return (
  //   <div>
  //     <div>
  //       <button onClick={handleClick}>
  //         {" "}
  //         {t("notification.cards_show_nf_btn")}
  //       </button>
  //       {notifications.map((notification, index) => (
  //         <MultipleNotificationSnackbar
  //           key={notification.id}
  //           data={notification}
  //           open={openSnackbars[notification.id] || false}
  //           onClose={() => handleClose(notification.id)}
  //           index={index}
  //           onEditClick={handleEditClick}
  //         />
  //       ))}
  //     </div>
  //     <div className="notification_card_wrapper">
  //       {paginatedData.map((card) => (
  //         <NotificationCard
  //           key={card.id}
  //           id={card.id}
  //           type={card.type}
  //           status={card.status}
  //           data={{
  //             title: card.details.title,
  //             subtitle: card.details.subtitle,
  //             time: card.details.time,
  //             hoursAgo: card.details.hoursAgo,
  //             interestedStatus: card.details.interestedStatus,
  //           }}
  //         />
  //       ))}
  //     </div>

  //     {/* Pagination Component */}
  //     <div className="pagination-wrapper">
  //       <div className="pagination-buttons">
  //         <Button
  //           onClick={() => setPage(page - 1)}
  //           disabled={page === 1}
  //           variant="outlined"
  //           sx={{ marginRight: 2, textTransform: "capitalize" }}
  //         >
  //           Back
  //         </Button>

  //         <Pagination
  //           count={totalPages}
  //           page={page}
  //           onChange={handlePageChange}
  //           shape="rounded"
  //           variant="outlined"
  //           color="primary"
  //           sx={{
  //             "& .MuiPaginationItem-root.Mui-selected": {
  //               color: "black",
  //               backgroundColor: "#00BC70",
  //               border: "none",
  //             },
  //           }}
  //         />

  //         <Button
  //           onClick={() => setPage(page + 1)}
  //           disabled={page === totalPages}
  //           variant="outlined"
  //           sx={{ marginLeft: 2, textTransform: "capitalize" }}
  //         >
  //           Next
  //         </Button>
  //       </div>

  //       <div className="form-group-pagination">
  //         <label>{t("leads.lm_results_per_page")}: </label>
  //         <Select
  //           value={rowsPerPage}
  //           onChange={handleRowsPerPageChange}
  //           // label={t("leads.lm_results_per_page")}
  //           sx={{ width: 65, height: 30 }}
  //         >
  //           <MenuItem value={5}>5</MenuItem>
  //           <MenuItem value={10}>10</MenuItem>
  //           <MenuItem value={15}>15</MenuItem>
  //           <MenuItem value={20}>20</MenuItem>
  //         </Select>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default Cards;
