import React, { use, useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CallIcon from "@/images/phone-call-01.svg";
import Social from "@/images/Socials.svg";
import EmailIcon from "@/images/email.svg";
import MessageIcon from "@/images/message-chat-01.svg";
import {
  Typography,
  IconButton,
  MenuItem,
  Select,
  Box,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import RightArrow from "@/images/right-arrow.svg";
import { useTranslations } from "next-intl";
import SearchIcon from "@/images/search.svg";
import ChevronDown from "@/images/chevron-down.svg";
import FollowUpsModalForMultipleUsers from "./FollowUpsModalForMultipleUsers";
import { useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import { masterDDAction } from "@/app/actions/commonActions";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getReportingUserListAction } from "@/app/actions/userActions";
import { getAllFollowupsAction } from "@/app/actions/followupActions";
import { getToken } from "@/utils/getToken";

const localizer = momentLocalizer(moment);

const formatEventTitle = (title, start, mode) => {
  const startTime = moment(start).format("hh:mm A");
  return (
    <>
      <div
        id="interaction-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span id="interaction-mode-icon" title={mode}>
          {mode === "call" ? (
            <CallIcon
              fontSize="small"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
          ) : mode === "sms" ? (
            <MessageIcon
              fontSize="small"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
          ) : mode === "email" ? (
            <EmailIcon
              fontSize="small"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
          ) : mode === "whatsapp" ? (
            <Social
              fontSize="small"
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
          ) : null}
        </span>
        <span
          id="interaction-start-time"
          style={{ fontSize: "12px", fontWeight: "600" }}
          title={startTime}
        >
          {startTime}
        </span>
      </div>
      <div
        id="interaction-title"
        style={{
          fontSize: "14px",
          fontWeight: "400",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={title}
      >
        {title}
      </div>
    </>
  );
};

const FollowUpCalendar = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [loading, setLoading] = useState({
    data: false,
    filter: false,
    modeList: false,
    reporting: false,
  });
  const [followups, setFollowups] = useState(null);
  const [events, setEvents] = useState(null);

  const [modeList, setModeList] = useState(null);
  const [reportingList, setReportingList] = useState(null);

  const [modeSelect, setModeSelect] = useState("");
  const [ownerSelect, setOwnerSelect] = useState([]);

  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [debouncedInput, setDebouncedInput] = useState("");

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [isMultipleEventModal, setIsMultipleEventModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    moment().format("MMMM YYYY")
  );

  const getModeList = async () => {
    setLoading((prev) => ({ ...prev, modeList: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["sub_activity"], // mandatory input will be an array
      // parent_id: 119, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);
        setModeList(decrypted);
        setLoading((prev) => ({ ...prev, modeList: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, modeList: false }));
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
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, medium: false }));
    }
  };

  const getAllReportingUsers = async () => {
    setLoading((prev) => ({ ...prev, reporting: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // uuid: details?.uuid,
    };
    try {
      const result = await getReportingUserListAction(csrfToken, reqbody);
      // console.log("reporting user DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        setReportingList(decrypted);
        setLoading((prev) => ({ ...prev, reporting: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, reporting: false }));
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
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
                anchorOrigin: { vertical: "top", horizontal: "right" },
              })
            );
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, reporting: false }));
    }
  };

  const getFollowupList = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        // page: page,
        per_page: "all",
      },
      filter: {
        search_term: searchTerm,
        owner: ownerSelect ? ownerSelect : "",
        date_filters: [
          {
            // field: "created_at",
            field: "follow_up_date_time",
            from: moment(currentMonth).startOf("month").format("YYYY-MM-DD"),
            to: moment(currentMonth).endOf("month").format("YYYY-MM-DD"),
          },
        ],
        field_filters: modeSelect
          ? [
              {
                field: "follow_up_mode",
                value: modeSelect,
              },
            ]
          : [],
      },
      // sorting: [
      //   {
      //     field: "created_at",
      //     order: "DESC",
      //   },
      // ],
    };
    console.log("follow cal body", reqbody);

    try {
      const result = await getAllFollowupsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final calendar", decrypted);

        setFollowups(decrypted);
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
  }, [debouncedInput, currentMonth, modeSelect, ownerSelect]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  useEffect(() => {
    getModeList();
    getAllReportingUsers();
  }, []);

  // const eventsWithFormattedTitles = myEventsList.map((event) => ({
  //   ...event,
  //   title: formatEventTitle(event.title, event.start),
  // }));

  useEffect(() => {
    if (followups?.data?.length > 0) {
      setLoading((prev) => ({ ...prev, filter: true }));
      let consolidatedEnvents = followups?.data?.map((follow) => {
        return {
          // name: follow?.title,
          name: follow?.details,
          id: follow?.id,
          status: follow?.action_status?.toLowerCase(),
          title: formatEventTitle(
            // follow?.title,
            follow?.details,
            follow?.follow_up_date_time?.split(" ")[0],
            follow?.follow_up_mode?.name?.toLowerCase()
          ),
          start: follow?.follow_up_date_time?.split(" ")[0],
          end: follow?.follow_up_date_time?.split(" ")[0],
        };
      });
      console.log("cc", consolidatedEnvents);
      setEvents(consolidatedEnvents);
      setLoading((prev) => ({ ...prev, filter: false }));
    } else {
      setEvents([]);
    }
  }, [followups]);

  // useEffect(() => {
  //   if(reportingList?.length > 0) {
  //     const filteredReportingList = reportingList.filter((report) =>
  //       ownerSelect.includes(report?.uuid)
  //     );
  //     setReporting(filteredReportingList);
  //   }
  // },[reporting])

  const handleNavigate = (date) => {
    setCurrentDate(date); // Update the displayed date on navigation
  };

  const CustomToolbar = ({ date, onNavigate }) => {
    const goToPreviousMonth = () => {
      setCurrentMonth(moment(date).subtract(1, "month").format("MMMM YYYY"));
      onNavigate("PREV"); // Use PREV to navigate to the previous month
    };

    const goToNextMonth = () => {
      setCurrentMonth(moment(date).add(1, "month").format("MMMM YYYY"));
      onNavigate("NEXT"); // Use NEXT to navigate to the next month
    };

    return (
      <div id="custom-toolbar-container" className="custom-toolbar">
        <IconButton
          onClick={goToPreviousMonth}
          style={{ transform: "rotate(180deg)" }}
          id="prev-month-button"
        >
          <RightArrow />
        </IconButton>
        <Typography
          variant="h2"
          component="span"
          style={{ fontSize: "14px", margin: "0 8px" }}
          id="month-year-label"
        >
          {moment(date).format("MMMM YYYY")}
        </Typography>
        <IconButton onClick={goToNextMonth} id="next-month-button">
          <RightArrow />
        </IconButton>
      </div>
    );
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsMultipleEventModal(true);
    // const filteredArr = followups?.data?.filter(
    //   (follow) => follow?.follow_up_date_time?.split(" ")[0] === event
    // );
    // if (filteredArr?.length > 0) {
    //   setSelectedEvent(filteredArr);
    //   setIsMultipleEventModal(true);
    // } else {
    //   setSelectedEvent([]);
    // }
    // console.log(event);

    // console.log(event);
    // // Filter events that start and end at the same time as the clicked event
    // const eventsAtSameTime = myEventsList.filter(
    //   (e) =>
    //     moment(e.start).isSame(event.start) && moment(e.end).isSame(event.end)
    // );

    // // Reset modal state
    // setIsEventModalOpen(false);
    // setIsMultipleEventModal(false);

    // // If multiple events exist for the same time, show FollowUpsModalForMultipleUsers
    // if (eventsAtSameTime.length > 1) {
    //   setSelectedEvent(eventsAtSameTime);
    //   setIsMultipleEventModal(true);
    // } else {
    //   // Otherwise, open FollowUpsModal for the single event
    //   setSelectedEvent(event);
    //   setIsEventModalOpen(true);
    // }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-CA");

  const eventPropGetter = (event) => {
    // Add a class based on your condition
    const className =
      event.status === "delayed"
        ? "custom-calendar incomplete"
        : event.status === "completed"
        ? "custom-calendar complete"
        : "custom-calendar";

    return {
      className, // Assign the class
      // style: {
      //   maxEvents: 1, // Limit to 2 events before showing "+X more"
      // },
    };
  };

  return (
    <div id="followup-calendar-view" className="toggle-view__content">
      <div id="followup-calendar-toolbar" className="custom-toolbar-calnder">
        <div
          id="followup-calendar-controls"
          style={{ flex: "1", padding: "16px" }}
        >
          <div
            id="followup-calendar-header"
            className="manager-roles-headers-roles"
            style={{ padding: "0" }}
          >
            <div id="followup-calendar-title" className="role-description-user">
              <h1>{t("followup.fupcal_title")}</h1>
              <p>{t("followup.fupcal_descr")}</p>
            </div>
            {/* <div className="action-buttons">
          {followupSingleActions &&
            followupSingleActions?.length > 0 &&
            followupSingleActions?.some((act) => act.id === 50) && (
              <button
                className="create-role-button"
                onClick={openCreateFollowModal}
              >
                Create Follow Up
              </button>
            )}
        </div> */}
          </div>
          <div id="followup-calendar-filters" className="table-lead-parent">
            <div
              id="followup-filter-container"
              className="role-table-parent-calendar"
            >
              <div id="followup-search-container" className="role-search">
                <div
                  id="followup-search-box"
                  className="search-box"
                  style={{ margin: "0px" }}
                >
                  <input
                    id="followup-search-input"
                    type="text"
                    placeholder={t("leads.lm_search_phldr")}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button id="followup-search-button" className="search-icon">
                    <SearchIcon />
                  </button>
                </div>
              </div>
              <div
                id="followup-selection-container"
                className="follow-up-selection"
              >
                {/* followup mode */}
                <div
                  id="followup-mode-filter"
                  className="form-group"
                  style={{ marginBottom: "0" }}
                >
                  <Select
                    id="followup-mode-select"
                    value={loading?.modeList ? "loading" : modeSelect}
                    onChange={(e) => {
                      setModeSelect(e.target.value);
                    }}
                    displayEmpty
                    IconComponent={ChevronDown}
                    fullWidth
                    style={{ width: "152px", height: "32px", fontSize: "14px" }}
                  >
                    <MenuItem value="">{t("followup.fup_cal_dd")}</MenuItem>
                    {loading?.modeList ? (
                      <MenuItem disabled value="loading">
                        <Box display="flex" alignItems="center">
                          <CircularProgress
                            size={20}
                            color="#000"
                            sx={{ marginRight: 1 }}
                          />
                          {t("editusermodal.loading")}
                        </Box>
                      </MenuItem>
                    ) : modeList?.length === 0 || !modeList ? (
                      <MenuItem disabled>
                        {t("followup.fup_create_dd")}
                      </MenuItem>
                    ) : (
                      modeList?.length > 0 &&
                      modeList?.map((mode) => (
                        <MenuItem key={mode.id} value={mode.id}>
                          {mode.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </div>

                {/* owners */}
                <div
                  id="followup-owner-filter"
                  className="form-group"
                  style={{ marginBottom: "0" }}
                >
                  {/* <Select
                value={loading?.reporting ? "loading" : ownerSelect}
                onChange={(e) => setOwnerSelect(e.target.value)}
                displayEmpty
                IconComponent={ChevronDown}
                fullWidth
                style={{ width: "152px", height: "32px", fontSize: "14px" }}
              >
                <MenuItem value="">
                  {t("leads.select_reporting_user")}
                </MenuItem>
                {loading?.reporting ? (
                  <MenuItem disabled value="loading">
                    <Box display="flex" alignItems="center">
                      <CircularProgress
                        size={20}
                        color="#000"
                        sx={{ marginRight: 1 }}
                      />
                      {t("editusermodal.loading")}
                    </Box>
                  </MenuItem>
                ) : reportingList?.length === 0 || !reportingList ? (
                  <MenuItem disabled>
                    {t("followup.fup_reporting_dd")}
                  </MenuItem>
                ) : (
                  reportingList?.length > 0 &&
                  reportingList?.map((reporting) => (
                    <MenuItem key={reporting?.uuid} value={reporting?.uuid}>
                      {reporting?.first_name} {reporting?.last_name}
                    </MenuItem>
                  ))
                )}
              </Select> */}

                  <Select
                    id="followup-owner-multi-select"
                    multiple
                    value={
                      loading?.reporting
                        ? ["loading"]
                        : Array.isArray(ownerSelect)
                        ? ownerSelect
                        : []
                    }
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value.includes("none")) {
                        setOwnerSelect([]);
                      } else {
                        setOwnerSelect(value);
                      }
                    }}
                    displayEmpty
                    IconComponent={ChevronDown}
                    fullWidth
                    style={{
                      width: "250px",
                      height: "30px",
                      fontSize: "14px",
                    }}
                    renderValue={(selected) => {
                      console.log("selected", selected);
                      return selected?.length === 0 ? (
                        t("leads.select_reporting_user")
                      ) : selected?.includes("loading") ? (
                        <Box display="flex" alignItems="center">
                          <CircularProgress
                            size={20}
                            color="#000"
                            sx={{ marginRight: 1 }}
                          />
                          {t("editusermodal.loading")}
                        </Box>
                      ) : (
                        reportingList
                          ?.filter((rep) => selected?.includes(rep?.uuid))
                          .map((rep) => `${rep?.first_name} ${rep?.last_name}`)
                          .join(", ")
                      );
                    }}
                  >
                    <MenuItem value="none">
                      {t("leads.select_reporting_user")}
                    </MenuItem>

                    {loading?.reporting ? (
                      <MenuItem disabled value="loading">
                        <Box display="flex" alignItems="center">
                          <CircularProgress
                            size={20}
                            color="#000"
                            sx={{ marginRight: 1 }}
                          />
                          {t("editusermodal.loading")}
                        </Box>
                      </MenuItem>
                    ) : reportingList?.length === 0 || !reportingList ? (
                      <MenuItem disabled>
                        {t("followup.fup_reporting_dd")}
                      </MenuItem>
                    ) : (
                      reportingList?.length > 0 &&
                      reportingList?.map((reporting) => (
                        <MenuItem key={reporting?.uuid} value={reporting?.uuid}>
                          <Checkbox
                            id={`followup-owner-checkbox-${reporting?.uuid}`}
                            checked={ownerSelect?.includes(reporting?.uuid)}
                          />
                          {reporting?.first_name} {reporting?.last_name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="followup-calendar-display" style={{ flex: "2" }}>
          {loading?.data || loading?.filter ? (
            <div
              id="followup-calendar-loading"
              style={{
                height: "100%",
                minHeight: "400px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={50} color="#000" />
            </div>
          ) : (
            <Calendar
              id="main-followup-calendar"
              localizer={localizer}
              events={events?.length > 0 ? events : []}
              startAccessor="start"
              endAccessor="end"
              views={["month"]}
              date={currentDate}
              onNavigate={handleNavigate}
              onDrillDown={(date, view) => {
                handleEventClick(formatDate(date));
              }}
              components={{
                toolbar: (props) => (
                  <CustomToolbar {...props} setCurrentDate={setCurrentDate} />
                ),
                event: ({ event }) => (
                  <Typography
                    id={`calendar-event-${event.id}`}
                    title={event?.name}
                    variant="body2"
                    component="span"
                    onClick={() => handleEventClick(event?.start)}
                  >
                    {event.title}
                  </Typography>
                ),
              }}
              eventPropGetter={eventPropGetter}
            />
          )}
        </div>

        {isEventModalOpen && (
          <div id="event-modal-backdrop" className="modal-backdrop">
            <FollowUpsModalForMultipleUsers
              id="single-event-modal"
              event={selectedEvent}
              onClose={() => setIsEventModalOpen(false)}
            />
          </div>
        )}

        {isMultipleEventModal && (
          <div id="multi-event-modal-backdrop" className="modal-backdrop">
            <FollowUpsModalForMultipleUsers
              id="multi-event-modal"
              eventDate={selectedEvent}
              onClose={() => setIsMultipleEventModal(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpCalendar;
