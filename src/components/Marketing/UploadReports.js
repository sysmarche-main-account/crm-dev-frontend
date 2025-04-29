"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@/images/search.svg";
import { useTranslations } from "next-intl";
import "@/styles/RoleTable.scss";
import EmptyRoles from "@/images/empty-roles.svg";
import DownloadIcon from "@/images/download.svg";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useSelector } from "react-redux";
import {
  downloadFailedUploadListActon,
  getAllUploadListAction,
} from "@/app/actions/marketingActions";
import { decryptClient } from "@/utils/decryptClient";
import NoContent from "../NoContent";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";

const UploadReports = ({ dataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const [bigLoading, setBigLoading] = useState(true);

  const [loading, setLoading] = useState({
    data: false,
    donwload: false,
  });

  const [uploadList, setUploadList] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getAllUploadList = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      uuid: details?.uuid,
      search_term: searchTerm ? searchTerm : "",
    };
    console.log("reqBody upload list", reqbody);

    try {
      const result = await getAllUploadListAction(csrfToken, reqbody);
      // console.log("all user list result:", result);
      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final upload list", decrypted);

        setUploadList(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setLoading((prev) => ({ ...prev, data: false }));
        setBigLoading(false);
      } else {
        console.error(result);
        setBigLoading(false);
        setLoading((prev) => ({ ...prev, data: false }));
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
      debugger;
      setBigLoading(false);
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  useEffect(() => {
    getAllUploadList();
  }, [page, rowsPerPage, debouncedInput]);

  useEffect(() => {
    if (dataChange) {
      getAllUploadList();
    }
  }, [dataChange]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  const handlePageChange = (event, page) => setPage(page);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to the first page when rows per page changes
  };

  const handleDownloadFailedUploadList = async (filename) => {
    setLoading((prev) => ({ ...prev, donwload: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = filename;
    try {
      const result = await downloadFailedUploadListActon(csrfToken, reqbody);

      if (result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final download", decrypted);

        // Create a Blob from the CSV data
        const blob = new Blob([decrypted], { type: "text/csv" });

        // Create a link element to download the Blob as a CSV file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename || "download.csv";

        // Programmatically click the link to trigger the download
        link.click();

        setLoading((prev) => ({ ...prev, donwload: false }));
      } else {
        setLoading((prev) => ({ ...prev, donwload: false }));
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
      }
    } catch (error) {
      setLoading((prev) => ({ ...prev, donwload: false }));
      console.error("Unexpected error:", error);
    }
  };

  return (
    <>
      {bigLoading ? (
        <div
          style={{
            overflow: "hidden",
            minHeight: "500px",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={80} color="#000" />
        </div>
      ) : uploadList?.data?.length === 0 &&
        uploadList?.data?.total_records === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={t("marketing.mktg_ur_nocontent_title")}
          subtitle={t("marketing.mktg_ur_nocontent_subtitle")}
        />
      ) : (
        <div
          className="table-container"
          style={{ width: "100%", border: "none" }}
        >
          {/* Search Section */}
          <div className="role-table-parent">
            <div className="role-search">
              <div className="search-box">
                <input
                  id="marketing-upload-main-search"
                  type="text"
                  placeholder={t("leads.lm_search_phldr")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-icon">
                  <SearchIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <TableContainer
            component={Paper}
            className="user-table-container"
            style={{ maxHeight: "360px", overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {t("followup.cf_creator_lab")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {t("followup.fupm_date_value")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {t("followup.fupm_time_lab")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {t("marketing.mktg_ur_tbl_records")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {t("rules.rule_managerule_satus")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {t("marketing.mktg_ur_tbl_success_count")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {t("marketing.mktg_ur_tbl_failure_count")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading.data ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      <CircularProgress size={50} sx={{ color: "#000" }} />
                    </TableCell>
                  </TableRow>
                ) : uploadList?.data?.length > 0 ? (
                  uploadList?.data?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row?.user_name}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row?.log_date}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row?.log_time}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row?.total_records}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          label={row?.status}
                          sx={{
                            color:
                              row?.status === "Completed"
                                ? "#23A047"
                                : "#002AC5",
                            backgroundColor:
                              row?.status === "Completed"
                                ? "#EAFBEF"
                                : "#EBEEF9",
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row?.inserted_count}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{row?.failed_count}</span>
                          {row?.failed_count > 0 &&
                            row?.status !== "Failed" && (
                              <div>
                                {loading?.donwload &&
                                  selectedRow?.failed_records_file ===
                                  row?.failed_records_file && (
                                    <CircularProgress size={17} color="#000" />
                                  )}
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
                                      setSelectedRow(row);
                                      handleDownloadFailedUploadList(
                                        row?.failed_records_file
                                      );
                                    }}
                                  />
                                </IconButton>
                              </div>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={7}
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      {t("manage_template.smst_no_results_found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div className="pagination-wrapper">
            <div className="pagination-buttons">
              <Button
                id="marketing-upload-page-back"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outlined"
                sx={{ marginRight: 2, textTransform: "capitalize" }}
              >
                Back
              </Button>
              <Pagination
                count={pagesData?.total_pages} // Adjust this as per your API response or local state
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
                id="marketing-upload-page-next"
                onClick={() => setPage(page + 1)}
                disabled={page === pagesData?.total_pages}
                variant="outlined"
                sx={{ marginLeft: 2, textTransform: "capitalize" }}
              >
                Next
              </Button>
            </div>
            {/* Results per page */}
            <div className="form-group-pagination">
              <label>{t("leads.lm_results_per_page")}:</label>
              <Select
                id="marketing-upload-noofpages"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
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
      )}
    </>
  );
};

export default UploadReports;
