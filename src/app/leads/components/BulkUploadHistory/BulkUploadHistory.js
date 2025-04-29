"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Select,
  Button,
  Pagination,
  CircularProgress,
  Chip,
} from "@mui/material";
import DownloadIcon from "@/images/download.svg";
import ChevronDown from "@/images/chevron-down.svg";
import SearchIcon from "@/images/search.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import { useTranslations } from "next-intl";
import NoContent from "@/components/NoContent";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { getReportingUserListAction } from "@/app/actions/userActions";
import { decryptClient } from "@/utils/decryptClient";
import { useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import { DateRangePicker } from "rsuite";
import { DateRange, Refresh } from "@mui/icons-material";
import { getLeadsUploadHistoryAction } from "@/app/actions/bulkUploadActions";

const BulkUploadHistory = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const { details, permissions } = useSelector((state) => state.user);

  const [bigLoading, setBigLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState({
    alleads: false,
    leadHistory: false,
    stages: false,
    reporting: false,
  });

  const [reportingList, setReportingList] = useState(null);

  const [historyData, setHistoryData] = useState(null);

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [debouncedInput, setDebouncedInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterArray, setFilterArray] = useState([]);

  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [placement, setPlacement] = useState("bottomEnd");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selReported, setSelReported] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [refresh, setRefresh] = useState(false);

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const getAllHistoryData = async () => {
    setIsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      filter: {
        search_term: searchTerm,
        created_by: selReported,
        date_filters: [
          {
            // field: dateType,
            field: "created_at",
            from: startDate,
            to: endDate,
          },
        ],
        // field_filters: [
        //   {
        //     field: "lead_status",
        //     value: selStage,
        //   },
        //   {
        //     field: "university_interested",
        //     value: selUni,
        //   },
        // ],
      },
      // sorting: [
      //   {
      //     field: "created_at",
      //     order: "DESC",
      //   },
      // ],
    };

    try {
      const result = await getLeadsUploadHistoryAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("finalUpload history", decrypted);

        setHistoryData(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setIsLoading(false);
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
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsLoading(false);
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

  useEffect(() => {
    getAllReportingUsers();
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  useEffect(() => {
    if (dataChanged) {
      getAllHistoryData();
      handleDataChange();
    }
  }, [dataChanged]);

  useEffect(() => {
    getAllHistoryData();
  }, [
    page,
    rowsPerPage,
    debouncedInput,
    filter,
    selReported,
    startDate,
    endDate,
    refresh,
  ]);

  useEffect(() => {
    console.log("hit", dateRangeValue);
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

  const handlePageChange = (event, value) => setPage(value);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };

  // Toggle all rows when header checkbox is clicked
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(historyData?.data?.map((_, index) => index)); // Select all
    } else {
      setSelectedRows([]); // Deselect all
    }
  };

  const handleDownloadFailedUploadList = (url) => {
    window.open(url, "_blank");
  };

  // Toggle a single row when its checkbox is clicked
  const handleSelectRow = (index) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(index)) {
        return prevSelectedRows.filter((i) => i !== index); // Deselect
      }
      return [...prevSelectedRows, index]; // Select
    });
  };

  const bulkUploadHistorySingleActions =
    permissions?.leadActions &&
    permissions?.leadActions.filter(
      (set) => set.parent === 92 && set.details === "single_action"
    );

  const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

  if (
    bulkUploadHistorySingleActions?.length === 0 ||
    !bulkUploadHistorySingleActions?.some((act) => act.id === 94)
  ) {
    return <></>;
  }

  return (
    <>
      {bigLoading ? (
        <div
          id="bulk-upload-history-loading-container"
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={80} color="#000" />
        </div>
      ) : historyData?.data?.length === 0 && historyData?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={`No Bulk upload history`}
          subtitle={`Bulk upload leads to see them here`}
        />
      ) : (
        <div
          id="bulk-upload-history-main-container"
          className="table-container manage-roles-container"
          style={{ border: "1px solid #c9ced3" }}
        >
          <div
            id="bulk-upload-history-header-container"
            className="manager-roles-headers-roles"
          >
            <div
              id="bulk-upload-history-title-container"
              className="role-description-user"
            >
              <h1>Bulk upload history</h1>
              <p>Manage and view bul uploads in this space</p>
            </div>
          </div>

          {/* Fixed height for the table container */}
          <div
            id="bulk-upload-history-table-scroll-container"
            className="table-scroll-container"
          >
            {/* Keep the header section fixed */}
            <div
              id="bulk-upload-history-table-parent"
              className="role-table-parent"
            >
              <div
                id="bulk-upload-history-filter-container"
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: "5px",
                  flexWrap: "wrap",
                }}
              >
                {/* reporting user */}
                <Select
                  id="leads-manage-filter-reporting"
                  value={loading?.reporting ? "loading" : selReported}
                  onChange={(e) => setSelReported(e.target.value)}
                  displayEmpty
                  IconComponent={ChevronDown}
                  fullWidth
                  style={{
                    width: "132px",
                    height: "32px",
                    fontSize: "14px",
                  }}
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
                </Select>

                {/* Search and Filter section */}
                <div
                  id="bulk-upload-history-search-container"
                  className="search-box"
                >
                  <input
                    id="user-manage-main-search"
                    type="text"
                    placeholder={t("buttons.buttons_search_phldr")}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="search-icon">
                    <SearchIcon />
                  </button>
                </div>

                <div id="bulk-upload-history-refresh-container">
                  <IconButton
                    id="leads-manage-refresh-leads-btn"
                    size="small"
                    style={{
                      border: "1px solid #e1e1e1",
                      borderRadius: "6px",
                    }}
                    onClick={() => setRefresh(!refresh)}
                  >
                    <Refresh color="success" size={15} />
                  </IconButton>
                </div>
              </div>

              <div id="bulk-upload-history-date-range-container">
                <div
                  id="bulk-upload-history-date-range-picker"
                  className="date-range-picker"
                  style={{ marginBottom: "20px" }}
                >
                  {/* Date range */}
                  <DateRangePicker
                    id="leads-manage-date-range"
                    appearance="subtle"
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

            {/* Scrollable table content */}
            <TableContainer
              id="bulk-upload-history-table-container"
              className="table-container"
              style={{ maxHeight: "395px", overflowY: "auto", borderRadius: 0 }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                    // sx={{ gap: "10px", width: "180px" }}
                    >
                      {/* <Checkbox
                      id="user-manage-select-all-checkbox"
                      style={{ marginRight: "15px" }}
                      checked={selectAll}
                      onChange={handleSelectAll}
                    /> */}
                      File Name
                    </TableCell>
                    <TableCell>Uploaded On</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Total Records</TableCell>
                    <TableCell>Success Count</TableCell>
                    <TableCell>Failure Count</TableCell>
                    <TableCell>Duplicate Count</TableCell>
                    <TableCell>Status</TableCell>
                    {/* <TableCell>
                    {t("manage_user.mu_tbl_reporting_to")}
                  </TableCell>
                  <TableCell sx={{ width: "350px" }}>
                    {t("manage_user.mu_tbl_univ_name")}
                  </TableCell>
                  <TableCell>{t("manage_user.mu_tbl_created_by")}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <SettingIcon />
                  </TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        <CircularProgress size={50} sx={{ color: "#000" }} />
                      </TableCell>
                    </TableRow>
                  ) : !isLoading && historyData?.data?.length > 0 ? (
                    historyData?.data?.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell
                          style={{
                            maxWidth: "150px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {/* <Checkbox
                            id={`user-manage-user-select-${index}`}
                            checked={selectedRows.includes(index)}
                            onChange={() => handleSelectRow(index)}
                          /> */}
                          <span title={row?.file_name}>{row?.file_name}</span>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(row?.created_at)}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: "nowrap",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={`${row?.created_by?.first_name} ${row?.created_by?.last_name}`}
                        >
                          {`${row?.created_by?.first_name} ${row?.created_by?.last_name}`}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.total_records}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: "nowrap", color: "#23A047" }}
                        >
                          {row?.success_count}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: "nowrap", color: "#F00" }}
                        >
                          {row?.failure_count}

                          {(row?.failure_count > 0 ||
                            row?.duplicate_count > 0) && (
                            <IconButton
                              sx={{
                                "&:hover": {
                                  backgroundColor: "transparent",
                                  boxShadow: "none",
                                },
                                width: 40,
                                height: 20,
                                padding: 0,
                              }}
                            >
                              <DownloadIcon
                                id={`marketing-upload-failed-${index}`}
                                fontSize="small"
                                onClick={() => {
                                  console.log(row, "row");

                                  // setSelectedRow(row);
                                  handleDownloadFailedUploadList(
                                    row?.failed_url
                                  );
                                }}
                              />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.duplicate_count}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Chip
                            label={
                              row.status === "Processing"
                                ? "Processing"
                                : row?.failure_count > 0 ||
                                  row?.duplicate_count > 0
                                ? "Failed"
                                : "Completed"
                            }
                            sx={{
                              color:
                                row.status === "Processing"
                                  ? "#002AC5"
                                  : row?.failure_count > 0 ||
                                    row?.duplicate_count > 0
                                  ? "#F00"
                                  : "#23A047",
                              backgroundColor:
                                row.status === "Processing"
                                  ? "#EBEEF9"
                                  : row?.failure_count > 0 ||
                                    row?.duplicate_count > 0
                                  ? "#FBEFEE"
                                  : "#EAFBEF",
                              fontWeight: 500,
                              fontSize: 14,
                            }}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        style={{ textAlign: "center", padding: "30px" }}
                      >
                        {t("manage_user.mu_tbl_no_results")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination and Rows Per Page */}
            <div
              id="bulk-upload-history-pagination-container"
              className="pagination-wrapper"
            >
              {/* Rounded Pagination with Next/Previous Buttons */}
              <div
                id="bulk-upload-history-pagination-buttons"
                className="pagination-buttons"
              >
                <Button
                  id="user-manage-page-back"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outlined"
                  sx={{ marginRight: 2, textTransform: "capitalize" }}
                >
                  {t("leads.lm_pagination_back")}
                </Button>

                <Pagination
                  // count={totalPages}
                  count={pagesData?.total_pages}
                  page={page}
                  onChange={handlePageChange}
                  shape="rounded"
                  variant="outlined"
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root.Mui-selected": {
                      color: "black",
                      backgroundColor: "#00BC70",
                      border: "none",
                    },
                  }}
                />

                <Button
                  id="user-manage-page-next"
                  onClick={() => setPage(page + 1)}
                  // disabled={page === totalPages}
                  disabled={page === pagesData?.total_pages}
                  variant="outlined"
                  sx={{ marginLeft: 2, textTransform: "capitalize" }}
                >
                  {t("leads.lm_pagination_next")}
                </Button>
              </div>
              {/* Results per page */}
              <div
                id="bulk-upload-history-rows-per-page"
                className="form-group-pagination"
              >
                <label>{t("leads.lm_results_per_page")}</label>
                <Select
                  id="user-manage-page-noofpages"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  // label={t("leads.lm_results_per_page")}
                  sx={{ width: 65, height: 30 }}
                >
                  {rowsPerPageOptions.map((opt) => (
                    <MenuItem value={opt} key={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkUploadHistory;
