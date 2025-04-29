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
  Pagination,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@/images/search.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import { useTranslations } from "next-intl";
import "@/styles/RoleTable.scss";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import NoContent from "../NoContent";
import { useSelector } from "react-redux";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import { getAllDownloadListAction } from "@/app/actions/marketingActions";
import { InfoOutlined } from "@mui/icons-material";
import CriteriaDetailsModal from "./CriteriaDetailsModal";

const DownloadReports = ({ dataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const [bigLoading, setBigLoading] = useState(true);

  const [loading, setLoading] = useState({
    data: false,
    donwload: false,
  });

  const [downloadList, setDownloadList] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getAllDownloadList = async () => {
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
    console.log("reqBody download list", reqbody);

    try {
      const result = await getAllDownloadListAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final download list", decrypted);

        setDownloadList(decrypted);
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
      setBigLoading(false);
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  useEffect(() => {
    getAllDownloadList();
  }, [page, rowsPerPage, debouncedInput]);

  useEffect(() => {
    if (dataChange) {
      getAllDownloadList();
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
      ) : downloadList?.data?.length === 0 &&
        downloadList?.data?.total_records === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={t("marketing.mktg_dr_nocontent_title")}
          subtitle={t("marketing.mktg_dr_nocontent_subtitle")}
        />
      ) : (
        <>
          <div
            className="table-container"
            style={{ width: "100%", border: "none" }}
          >
            {/* Search Section */}
            <div className="role-table-parent">
              <div className="role-search">
                <div className="search-box">
                  <input
                    id="marketing-downloads-main-search"
                    type="text"
                    placeholder={t("manage_roles.mr_mu_search_phlsr")}
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
                      {t("marketing.mktg_dr_tbl_criteria")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("marketing.mktg_dowld_date")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("marketing.mktg_dowld_time")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("marketing.mktg_dr_tbl_records_count")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("marketing.mktg_download_type")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("marketing.mktg_download_count")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("marketing.mktg_dr_tbl_downld_by")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading.data ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        <CircularProgress size={50} sx={{ color: "#000" }} />
                      </TableCell>
                    </TableRow>
                  ) : downloadList?.data?.length > 0 ? (
                    downloadList?.data?.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <span title={row?.search_criteria}>
                            {row?.search_criteria}
                          </span>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.log_date}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.log_time}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.total_records || 0}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.download_type}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.records_count_downloaded || 0}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.user_name}
                        </TableCell>
                        <TableCell
                          style={{ whiteSpace: "nowrap", textAlign: "center" }}
                        >
                          <InfoOutlined
                            id={`marketing-downloads-info-${row?.log_time}`}
                            onClick={() => {
                              setSelectedRow(row);
                              setDetailModal(true);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={5}
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
                  id="marketing-downloads-page-back"
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
                  id="marketing-downloads-page-next"
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
                  id="marketing-downloads-page-noofpages"
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

          {detailModal && (
            <div className="modal-backdrop">
              <CriteriaDetailsModal
                open={detailModal}
                onClose={() => setDetailModal(false)}
                data={selectedRow}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default DownloadReports;
