import IvrCalling from "./ivrcalling";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useEffect, useState } from "react";
import {
  MenuItem,
  Select,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Box,
} from "@mui/material";
import { DateRange } from "@mui/icons-material";
import ChevronDown from "@/images/chevron-down.svg";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { DateRangePicker } from "rsuite";
import CounsellorWise from "./counsellorwise";
import IvrDump from "./ivrDump";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  counselorCallDurationReport,
  dumpReport,
  getIvrCallingReport,
} from "@/app/actions/reportsAction";
import { decryptClient } from "@/utils/decryptClient";
//import { saveAs } from 'file-saver';
import { getReportingUserListAction } from "@/app/actions/userActions";
import useLogout from "@/app/hooks/useLogout";

const Reports = () => {
  const [bigLoading, setBigLoading] = useState(false);
  // const [selectedTab, setSelectedTab] = useState({ index: 0, id: 100 });
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [ivrCalling, setIvrCalling] = useState([]);
  const [endDate, setEndDate] = useState("");
  const [placement, setPlacement] = useState("bottomEnd");
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [exportCsv, setExportCsv] = useState("");
  const [totalIvrCallings, setTotalIvrCallings] = useState({});
  const [counsellorDropdown, setCounsellorDropdown] = useState([]);
  const [counsellorCallDurationData, setCounsellorCallDurationData] = useState({
    list: [],
    total: {},
  });
  const [dumpReportData, setDumpReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { details, permissions } = useSelector((state) => state.user);
  const { showSnackbar } = useSnackbar();

  const t = useTranslations();
  const logout = useLogout();
  useEffect(() => {
    const handleResize = () =>
      setPlacement(window.innerWidth <= 1300 ? "bottomStart" : "bottomEnd");
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedTab?.id === 100) {
      getIvrCallingList();
    } else if (selectedTab?.id === 101) {
      getCounsellorCallList();
    } else if (selectedTab?.id === 102) {
      getDumpReportList();
    } else if (!selectedTab?.id) {
      setSelectedTab({ index: 0, id: permissions?.reportsActions[0]?.id });
    }
  }, [selectedTab, startDate, endDate, selectedCounselor]);

  useEffect(() => {
    getCounsellorList();
  }, []);

  useEffect(() => {
    if (dateRangeValue && dateRangeValue.length > 1) {
      const formattedStartdate = new Date(dateRangeValue[0]).toLocaleDateString(
        "en-CA"
      );
      const formattedEnddate = new Date(dateRangeValue[1]).toLocaleDateString(
        "en-CA"
      );
      setStartDate(formattedStartdate);
      setEndDate(formattedEnddate);
    }
  }, [dateRangeValue]);

  const getCounsellorList = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      //   uuid: details?.uuid,
    };
    setLoading(true);

    try {
      // const result = await getUsersDDAction(csrfToken, reqbody);
      const result = await getReportingUserListAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final counsellors", decrypted);

        setCounsellorDropdown(decrypted);
        setLoading(false);
      } else {
        console.error(result);
        if (result.error.status === 500) {
          await logout();
          setLoading(false);
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
      setLoading(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
      //   set((prev) => ({ ...prev, users: false }));
    }
  };

  const calculateTotalIvrCalling = (data) => {
    return data.reduce(
      (totals, item) => {
        totals.total_distinct_leads += item.distinct_leads;
        totals.total_outbound_call_attempts += item.outbound_call_attempts;
        totals.total_outbound_successful_calls += Number(
          item.outbound_successful_calls
        );
        totals.total_outbound_call_duration += item.outbound_call_duration;
        totals.total_outbound_avg_call_duration +=
          item.outbound_avg_call_duration;

        return totals;
      },
      {
        total_distinct_leads: 0,
        total_outbound_call_attempts: 0,
        total_outbound_successful_calls: 0,
        total_outbound_call_duration: 0,
        total_outbound_avg_call_duration: 0,
      }
    );
  };

  const getIvrCallingList = async () => {
    setBigLoading(true);
    const csrfToken = await getCsrfToken();

    let reqbody = {
      user_id: selectedCounselor,
      start_date: startDate,
      end_date: endDate,
      export: "",
    };

    reqbody = Object.fromEntries(
      Object.entries(reqbody).filter(([_, v]) => v !== "")
    );

    try {
      const result = await getIvrCallingReport(csrfToken, reqbody);
      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final download list", decrypted);

        const { data, total, ...pageData } = decrypted;

        setIvrCalling(data);
        // setTotalIvrCallings(calculateTotalIvrCalling(data));
        setTotalIvrCallings(total);
        setBigLoading(false);
        setExportCsv("");
      } else {
        console.error(result);
        setBigLoading(false);
        setExportCsv("");
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
          } else if (errValues?.length > 0) {
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
      setBigLoading(false);
      setExportCsv("");
      console.error("Unexpected error:", error);
    }
  };

  const getCounsellorCallList = async () => {
    setBigLoading(true);

    const csrfToken = await getCsrfToken();

    let reqbody = {
      user_id: selectedCounselor,
      start_date: startDate,
      end_date: endDate,
      export: "",
    };

    reqbody = Object.fromEntries(
      Object.entries(reqbody).filter(([_, v]) => v !== "")
    );

    try {
      const result = await counselorCallDurationReport(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final download list", decrypted);

        const { data, ...pageData } = decrypted;

        console.log(data, "");

        setCounsellorCallDurationData({
          list: data,
          total: decrypted?.total,
        });
        setBigLoading(false);
      } else {
        console.error(result);
        setBigLoading(false);
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
          } else if (errValues?.length > 0) {
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
      setBigLoading(false);
      console.error("Unexpected error:", error);
    }
  };

  const getDumpReportList = async () => {
    setBigLoading(true);

    const csrfToken = await getCsrfToken();

    let reqbody = {
      user_id: selectedCounselor,
      start_date: startDate,
      end_date: endDate,
      export: "",
    };

    reqbody = Object.fromEntries(
      Object.entries(reqbody).filter(([_, v]) => v !== "")
    );

    try {
      const result = await dumpReport(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final download list", decrypted);

        const { data, ...pageData } = decrypted;

        console.log(data, "");
        setDumpReportData(data);
        setBigLoading(false);
      } else {
        console.error(result);
        setBigLoading(false);
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
          } else if (errValues?.length > 0) {
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
      setBigLoading(false);
      console.error("Unexpected error:", error);
    }
  };

  return (
    <div id="reports-root-container">
      {bigLoading ? (
        <div
          id="reports-loading-container"
          style={{
            height: "calc(100vh - 150px)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={80} color="#000" />
        </div>
      ) : (
        <>
          <div
            id="reports-table-wrapper"
            className="table-container manage-roles-container"
          >
            <div id="reports-header" className="manager-roles-headers-roles">
              <div id="reports-title" className="role-description-user">
                <h1>IVR Analysis</h1>
                <p>Manage and create reports in this space </p>
              </div>
            </div>

            <Tabs
              value={selectedTab?.index}
              sx={{
                minHeight: "40px",
                ".MuiTabs-indicator": { bottom: 0 },
                mx: 1,
              }}
            >
              {permissions?.reportsActions?.map((item, index) => (
                <Tab
                  key={index}
                  label={item.name}
                  className="fs-3 pb-1"
                  onClick={() => {
                    setSelectedTab({ index, id: item?.id });
                    setSelectedCounselor("");
                  }}
                  sx={{
                    pb: 0,
                    minHeight: "40px",
                    textTransform: "none",
                  }}
                />
              ))}
            </Tabs>
            <Divider sx={{ mt: 1, mb: 2 }} />

            <Box
              id="reports-filter-container"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2, mx: 2 }}
            >
              <div id="reports-counselor-select">
                <Select
                  id="report-counselor"
                  value={selectedCounselor || ""}
                  onChange={(e) => setSelectedCounselor(e.target.value)}
                  displayEmpty
                  IconComponent={ChevronDown}
                  fullWidth
                  style={{
                    width: "250px",
                    height: "32px",
                    fontSize: "14px",
                  }}
                >
                  <MenuItem value="">
                    {t("leads.select_reporting_user")}
                  </MenuItem>
                  {loading ? (
                    <MenuItem>{t("editusermodal.loading")}</MenuItem>
                  ) : counsellorDropdown?.length === 0 ||
                    !counsellorDropdown ? (
                    <MenuItem disabled>
                      {t("followup.fup_reporting_dd")}
                    </MenuItem>
                  ) : (
                    counsellorDropdown.length > 0 &&
                    counsellorDropdown.map((d) => (
                      <MenuItem key={d.uuid} value={d.uuid}>
                        {" "}
                        {d.first_name} {d.last_name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </div>

              <Box id="reports-actions" display="flex" alignItems="center">
                <div
                  id="reports-date-range-wrapper"
                  style={{
                    gap: "5px",
                    border: "1px solid gray",
                    borderRadius: "6px",
                    padding: "2px",
                    marginRight: "15px",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: 600,
                  }}
                >
                  <DateRangePicker
                    id="reports-date-range"
                    appearance="subtle"
                    value={dateRangeValue}
                    onChange={(val) => {
                      console.log("Selected Date Range:", val);
                      setDateRangeValue(val);
                    }}
                    placement={placement}
                    showHeader={false}
                    ranges={[]}
                    placeholder="dd-mm-yy - dd-mm-yy"
                    format="dd/MM/yy"
                    character=" – "
                    onOk={(val) => console.log("val", val)}
                    onClean={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    caretAs={DateRange}
                    locale={{ ok: "Done" }}
                    style={{
                      maxWidth: placement === "bottomStart" ? 250 : "100%",
                      pointerEvents: "auto",
                    }}
                    inputProps={{
                      style: { cursor: "pointer" },
                      readOnly: true,
                    }}
                    onClick={(e) => {
                      if (!e.target.closest(".rs-picker-toggle-clean")) {
                        e.currentTarget.querySelector("input").blur();
                      }
                    }}
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
                <Button
                  id="reports-export-btn"
                  variant="outlined"
                  sx={{ color: "gray", borderColor: "gray" }}
                  onClick={() => setExportCsv("csv")}
                >
                  Export
                </Button>
              </Box>
            </Box>
          </div>

          {selectedTab?.id === 100 && (
            <IvrCalling
              data={ivrCalling}
              total={totalIvrCallings}
              exportCsv={exportCsv}
              selectedTab={selectedTab}
              setExportCsv={setExportCsv}
            />
          )}
          {selectedTab?.id === 101 && (
            <CounsellorWise
              data={counsellorCallDurationData?.list}
              total={counsellorCallDurationData?.total}
              exportCsv={exportCsv}
              selectedTab={selectedTab}
              setExportCsv={setExportCsv}
            />
          )}

          {selectedTab?.id === 102 && (
            <IvrDump
              data={dumpReportData}
              exportCsv={exportCsv}
              selectedTab={selectedTab}
              setExportCsv={setExportCsv}
            />
          )}
        </>
      )}

      {/* <Tab label="IVR Calling Report" />
        <Tab label="Counsellor Wise Total Call Duration" />
        <Tab label="IVR Dump Report" /> */}
    </div>
  );
};

export default Reports;
