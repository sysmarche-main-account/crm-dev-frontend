"use client";
import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import TotalLead from "./Widgets/TotalLead";
import NewLeads from "./Widgets/NewLeads";
import {
  Checkbox,
  MenuItem,
  Select,
  Box,
  CircularProgress,
} from "@mui/material";
import UpcomingFollowups from "./Widgets/UpcomingFollowups";
import FollowupStats from "./Widgets/FollowupStats";
import { useDispatch, useSelector } from "react-redux";
import { resetFollowup } from "@/lib/slices/followupSlice";
import FollowUpDirectModal from "@/app/leads/components/FollowUps/FollowUpDirectModal";
import { getReportingUserListAction } from "@/app/actions/userActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useTranslations } from "next-intl";
import { DateRangePicker } from "rsuite";
import { DateRange } from "@mui/icons-material";
import ChevronDown from "@/images/chevron-down.svg";
import {
  setCallData,
  setData,
  setEnd,
  setLoadingCall,
  setLoadingState,
  setReporting,
  setStart,
} from "@/lib/slices/dashboardSlice";
import OverallEnrolledLeads from "./Widgets/OverallEnrolledLeads";
import CallWidget from "./Widgets/CallWidget";
import TotalMissedFollowups from "./Widgets/TotalMissedFollowups";
import {
  getCallCountAction,
  getLeadCountAction,
} from "@/app/actions/dashboardActions";
import LeadDistributionWidget from "./Widgets/LeadDistributionWidget";
import EnrollCountWidget from "./Widgets/EnrollCountWidget";
import { set } from "rsuite/esm/internals/utils/date";

const WidgetDash = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const {
    comm_modal_display,
    config,
    followup_id,
    lead_details,
    lead_id,
    mode,
  } = useSelector((state) => state.followup);

  const { reporting, start, end } = useSelector((state) => state.dashboard);

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [isDraggable, setIsDraggable] = useState(false); // Toggle dragging mode

  const [loading, setLoading] = useState({
    reporting: false,
    data: false,
  });
  const [reportingList, setReportingList] = useState(null);
  const [selReported, setSelReported] = useState(reporting || []);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [placement, setPlacement] = useState("bottomEnd");

  const [widgets, setWidgets] = useState([
    {
      id: "widget1",
      name: "Overall Enrolled Leads",
      show: true,
      // component: <TotalLead />,
      component: <OverallEnrolledLeads />,
      width: 2,
    },
    {
      id: "widget2",
      name: "Total Leads",
      show: true,
      // component: <EnrolledLeads />,
      component: <TotalLead />,
      width: 4,
    },
    {
      id: "widget3",
      name: "New Leads",
      show: true,
      // component: <NewLeads />,
      component: <CallWidget />,
      width: 4,
    },
    {
      id: "widget4",
      name: "Upcoming Follow-ups",
      show: true,
      component: <TotalMissedFollowups />,
      // component: <UpcomingFollowups />,
      width: 2,
    },
    {
      id: "widget5",
      name: "Follow-ups stats",
      show: true,
      // component: <FollowupStats />,
      component: <UpcomingFollowups />,
      width: 4,
    },
    {
      id: "widget6",
      name: "Follow-ups stats",
      show: true,
      component: <FollowupStats />,
      width: 4,
    },
    {
      id: "widget7",
      name: "Follow-ups stats",
      show: true,
      component: <NewLeads />,
      width: 4,
    },
    {
      id: "widget8",
      name: "Follow-ups stats",
      show: true,
      component: <LeadDistributionWidget />,
      width: 5,
    },
    {
      id: "widget9",
      name: "Follow-ups stats",
      show: true,
      component: <EnrollCountWidget />,
      width: 7,
    },
    // { id: "widget1", show: true, component: <Widget1 id={1} />, width: 3 },
    // { id: "widget2", show: true, component: <Widget1 id={2} />, width: 3 },
    // { id: "widget3", show: true, component: <Widget1 id={3} />, width: 3 },
    // { id: "widget4", show: true, component: <Widget1 id={4} />, width: 3 },
  ]);

  const layout = [
    {
      i: "widget1",
      x: 0,
      y: 0,
      w: widgets[0].width,
      h: 4,
      minW: widgets[0].width,
      minH: 4,
    },
    {
      i: "widget2",
      x: 2,
      y: 0,
      w: widgets[1].width,
      h: 4,
      minW: widgets[1].width,
      minH: 4,
    },
    {
      i: "widget3",
      x: 6,
      y: 0,
      w: widgets[2].width,
      h: 4,
      minW: widgets[2].width,
      minH: 4,
    },
    // { i: "widget2", x: 3, y: 0, w: widgets[1].width, h: 4 },
    // { i: "widget3", x: 6, y: 0, w: widgets[2].width, h: 4 },
    {
      i: "widget4",
      x: 10,
      y: 0,
      w: widgets[3].width,
      h: 4,
      minW: widgets[3].width,
      minH: 4,
    },
    {
      i: "widget5",
      x: 0,
      y: 5,
      w: widgets[4].width,
      h: 7,
      minW: widgets[4].width,
      minH: 7,
    },
    {
      i: "widget6",
      x: 4,
      y: 5,
      w: widgets[5].width,
      h: 7,
      minW: widgets[5].width,
      minH: 7,
    },
    {
      i: "widget7",
      x: 8,
      y: 5,
      w: widgets[6].width,
      h: 7,
      minW: widgets[6].width,
      minH: 7,
    },
    {
      i: "widget8",
      x: 0,
      y: 13,
      w: widgets[7].width,
      h: 7,
      minW: widgets[7].width,
      minH: 7,
    },
    {
      i: "widget9",
      x: 6,
      y: 13,
      w: widgets[8].width,
      h: 7,
      minW: widgets[8].width,
      minH: 7,
    },
  ];

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
        console.log("final reporting", decrypted);

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
      setLoading((prev) => ({ ...prev, reporting: false }));
    }
  };

  const fetchLeadCountData = async () => {
    dispatch(setLoadingState(true));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      filter: {
        owner: selReported,
        date_filters: [
          {
            field: "updated_at",
            from: startDate,
            to: endDate,
          },
        ],
      },
    };

    try {
      const result = await getLeadCountAction(csrfToken, reqbody);
      // console.log("data user DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final lead count", decrypted);

        dispatch(setData(decrypted));
        dispatch(setLoadingState(false));
      } else {
        console.error(result.error);
        dispatch(setLoadingState(false));
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
      dispatch(setLoadingState(false));
    }
  };

  const fetchCallCountData = async () => {
    dispatch(setLoadingCall(true));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      filter: {
        owner: selReported,
        date_filters: [
          {
            field: "date_created", // and for update date_updated
            from: startDate,
            to: endDate,
          },
        ],
      },
    };

    try {
      const result = await getCallCountAction(csrfToken, reqbody);
      // console.log("data user DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        dispatch(setCallData(decrypted));
        dispatch(setLoadingCall(false));
      } else {
        console.error(result.error);
        dispatch(setLoadingCall(false));
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
      dispatch(setLoadingCall(false));
    }
  };

  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  };

  const formatDate = (date) => date.toLocaleDateString("en-CA");

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  // const toggleWidget = (id) => {
  //   setWidgets((prev) =>
  //     prev.map((widget) =>
  //       widget.id === id ? { ...widget, show: !widget.show } : widget
  //     )
  //   );
  // };

  // const expandWidget = (id) => {
  //   setWidgets((prev) =>
  //     prev.map(
  //       (widget) => (widget.id === id ? { ...widget, width: 12 } : widget) // Set width to 12 to occupy all columns
  //     )
  //   );
  // };

  // Update viewport width on window resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // fetchLeadCountData();
    // fetchCallCountData();
    getAllReportingUsers();
  }, []);

  useEffect(() => {
    if (!start || !end) {
      // Set to default month dates if no existing values
      const [defaultStart, defaultEnd] = getDefaultDates();
      setDateRangeValue([defaultStart, defaultEnd]);
    } else {
      // Sync with existing Redux values
      setDateRangeValue([new Date(start), new Date(end)]);
    }
  }, []);

  useEffect(() => {
    fetchLeadCountData();
    fetchCallCountData();
  }, [selReported, startDate, endDate]);

  useEffect(() => {
    setSelReported(reporting);
  }, [reporting]);

  useEffect(() => {
    if (dateRangeValue?.length === 2) {
      const formattedStart = formatDate(dateRangeValue[0]);
      const formattedEnd = formatDate(dateRangeValue[1]);

      // Update Redux only if dates changed
      if (formattedStart !== start || formattedEnd !== end) {
        setStartDate(formattedStart);
        setEndDate(formattedEnd);
        dispatch(setStart(formattedStart));
        dispatch(setEnd(formattedEnd));
      }
    } else {
      // Handle empty/cancel case by setting to default
      const [defaultStart, defaultEnd] = getDefaultDates();
      setDateRangeValue([defaultStart, defaultEnd]);
      setStartDate(null);
      setEndDate(null);
    }
  }, [dateRangeValue]);

  // useEffect(() => {
  //   if (dateRangeValue && dateRangeValue.length > 1) {
  //     const formattedStartdate = new Date(dateRangeValue[0]).toLocaleDateString(
  //       "en-CA"
  //     );
  //     const formattedEnddate = new Date(dateRangeValue[1]).toLocaleDateString(
  //       "en-CA"
  //     );
  //     setStartDate(formattedStartdate);
  //     setEndDate(formattedEnddate);
  //     dispatch(setStart(formattedStartdate));
  //     dispatch(setEnd(formattedEnddate));
  //   } else {
  //     setStartDate("");
  //     setEndDate("");
  //     dispatch(setStart(""));
  //     dispatch(setEnd(""));
  //   }
  // }, [dateRangeValue]);

  // const toggleDraggable = () => {
  //   setIsDraggable((prev) => !prev);
  // };

  return (
    <div>
      <div
        style={{
          display: "flex",
          // justifyContent: "flex-end",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          margin: 5,
          padding: 5,
        }}
      >
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        {/* <IconButton
          id="widget-list"
          onClick={handleClick}
          title="Show/Hide widgets"
        >
          {anchorEl ? <WidgetsOutlined /> : <WidgetsRounded />}
        </IconButton>

        <Menu
          id="widget-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {widgets.map((widget) => (
            <MenuItem key={widget.id} onClick={() => toggleWidget(widget.id)}>
              <Checkbox checked={widget.show} />
              {widget.name}
            </MenuItem>
          ))}
        </Menu>

        <IconButton
          id="widget-drag-enable-disable"
          onClick={toggleDraggable}
          title={isDraggable ? "Disable Dragging" : "Enable Dragging"}
        >
          {isDraggable ? <PanToolOutlined /> : <PanTool />}
        </IconButton> */}

        {/* reporting user */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <div>
            {/* <Select
              id="leads-manage-filter-reporting"
              value={loading?.reporting ? "loading" : selReported}
              onChange={(e) => {
                setSelReported(e.target.value);
                dispatch(setReporting(e.target.value));
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{
                width: "250px",
                height: "30px",
                fontSize: "14px",
              }}
            >
              <MenuItem value="">{t("leads.select_reporting_user")}</MenuItem>
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
                <MenuItem disabled>{t("followup.fup_reporting_dd")}</MenuItem>
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
              multiple
              value={
                loading?.reporting
                  ? ["loading"]
                  : Array.isArray(selReported)
                  ? selReported
                  : []
              }
              onChange={(e) => {
                const value = e.target.value;

                if (value.includes("none")) {
                  setSelReported([]);
                  dispatch(setReporting([]));
                } else {
                  setSelReported(value);
                  dispatch(setReporting(value));
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
                <MenuItem disabled>{t("followup.fup_reporting_dd")}</MenuItem>
              ) : (
                reportingList?.length > 0 &&
                reportingList?.map((reporting) => (
                  <MenuItem key={reporting?.uuid} value={reporting?.uuid}>
                    <Checkbox
                      // checked={selReported.indexOf(reporting?.uuid) > -1}
                      checked={selReported?.includes(reporting?.uuid)}
                    />
                    {reporting?.first_name} {reporting?.last_name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div>
          <div>
            <DateRangePicker
              value={dateRangeValue}
              onChange={setDateRangeValue}
              placement={placement}
              showHeader={false}
              ranges={[]}
              placeholder="dd-mm-yy - dd-mm-yy"
              format="dd/MM/yy"
              character=" – "
              // onOk={(val) => console.log("val", val)}
              onClean={() => {
                setStartDate("");
                setEndDate("");
                setDateRangeValue([]);
                // const [defaultStart, defaultEnd] = getDefaultDates();
                // setDateRangeValue([defaultStart, defaultEnd]);
              }}
              caretAs={DateRange}
              locale={{ ok: "Done" }}
              style={{
                maxWidth: placement === "bottomStart" ? 250 : "100%",
              }}
            />
          </div>
        </div>
      </div>

      {isMobile ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            margin: 5,
            padding: 5,
          }}
        >
          {widgets
            .filter((widget) => widget.show)
            .map((widget) => (
              <div
                key={widget.id}
                style={{
                  border: "1px solid #DADADA",
                  borderRadius: 6,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    padding:
                      widget.id === "widget1" ||
                      widget.id === "widget3" ||
                      widget.id === "widget4"
                        ? "0px"
                        : "10px",
                  }}
                >
                  {widget.component}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <>
          {/* WidgetDash Layout */}
          <GridLayout
            className="layout"
            layout={layout.filter(
              (l) => widgets.find((w) => w.id === l.i)?.show
            )}
            cols={12}
            rowHeight={50}
            width={viewportWidth}
            // width={1500}
            isDraggable={isDraggable}
            isResizable={isDraggable}
          >
            {widgets
              .filter((widget) => widget.show)
              .map((widget) => (
                <div
                  key={widget.id}
                  style={{
                    border: "1px solid #DADADA",
                    borderRadius: 6,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* {widget.id} */}
                  <div
                    style={{
                      flex: 1, // Allows content to take available space
                      overflowY: "auto", // Enables scrolling if content overflows
                      padding:
                        widget.id == "widget1" ||
                        widget.id == "widget3" ||
                        widget.id == "widget4"
                          ? "0px"
                          : "10px",
                    }}
                  >
                    {widget.component}
                  </div>
                  {/* <button
                onClick={() => expandWidget(widget.id)}
                style={{ marginTop: "1rem" }}
              >
                Expand {widget.id}
              </button> */}
                </div>
              ))}
          </GridLayout>
        </>
      )}

      {comm_modal_display && (
        <div className="modal-backdrop">
          <FollowUpDirectModal
            {...config}
            type={mode}
            lead={lead_id}
            leadDetails={lead_details}
            followupId={followup_id}
            onClose={() => dispatch(resetFollowup())}
          />
        </div>
      )}
    </div>
  );
};

export default WidgetDash;
