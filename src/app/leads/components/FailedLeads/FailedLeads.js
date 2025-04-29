"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  Button,
  Pagination,
  CircularProgress,
} from "@mui/material";
import ChevronDown from "@/images/chevron-down.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import SearchIcon from "@/images/search.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import Modal from "@/components/common/Modal/Modal";
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
import { DateRange } from "@mui/icons-material";
import { getFailedLeadsAction } from "@/app/actions/failedLeadsAction";
import { singleFailedLeadDeleteAction } from "@/app/actions/leadActions";

const FailedLeads = () => {
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

  const [failedData, setFailedData] = useState(null);

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

  const [selectedLead, setSelectedLead] = useState(null);

  const [openEditLeadModal, setOpenEditLeadModal] = useState(false);
  const [selAction, setSelAction] = useState(null);

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const getAllFailedLeadsData = async () => {
    setIsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      filter: {
        search_term: searchTerm,
        owner: selReported,
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
      const result = await getFailedLeadsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("finalUpload history", decrypted);

        setFailedData(decrypted);
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
      getAllFailedLeadsData();
      handleDataChange();
    }
  }, [dataChanged]);

  useEffect(() => {
    getAllFailedLeadsData();
  }, [
    page,
    rowsPerPage,
    debouncedInput,
    filter,
    selReported,
    startDate,
    endDate,
  ]);

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

  const handlePageChange = (event, value) => setPage(value);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };

  // Toggle all rows when header checkbox is clicked
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(failedData?.data?.map((_, index) => index)); // Select all
    } else {
      setSelectedRows([]); // Deselect all
    }
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

  const handleEditClick = () => {
    setOpenEditLeadModal(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  const handleConfirmDelete = async (id) => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: [id],
    };
    console.log("body", reqbody);
    try {
      const result = await singleFailedLeadDeleteAction(csrfToken, reqbody);
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        if (!decrypted?.error) {
          handleModalClose();
          showSnackbar({
            message: decrypted?.message,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
          handleDataChange();
        } else {
          showSnackbar({
            message: decrypted?.message,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
      } else {
        console.error(result.error);
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
    }
  };

  const handleActionClick = (action, id) => {
    setSelAction(action);
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`${t("leads.led_del_title")}?`);
      setModalContent(t("leads.led_del_content"));
      setModalActions([
        {
          label: "Cancel",
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("leads.led_del_btn"),
          className: "confirm-button",
          onClick: () => handleConfirmDelete(id),
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    }
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
          id="failed-leads-loading-container"
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
      ) : failedData?.data?.length === 0 && failedData?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={`No Bulk upload history`}
          subtitle={`Bulk upload leads to see them here`}
        />
      ) : (
        <>
          <div
            id="failed-leads-main-container"
            className="table-container manage-roles-container"
            style={{ border: "1px solid #c9ced3" }}
          >
            <div
              id="failed-leads-header-container"
              className="manager-roles-headers-roles"
            >
              <div
                id="failed-leads-title-container"
                className="role-description-user"
              >
                <h1>Failed Leads</h1>
                <p>Manage and failed leads in this space</p>
              </div>
            </div>

            {/* Fixed height for the table container */}
            <div
              id="failed-leads-table-scroll-container"
              className="table-scroll-container"
            >
              {/* Keep the header section fixed */}
              <div
                id="failed-leads-filter-parent"
                className="role-table-parent"
              >
                <div
                  id="failed-leads-filter-controls-container"
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
                    id="failed-leads-search-container"
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
                </div>

                <div id="failed-leads-date-range-container">
                  <div
                    id="failed-leads-date-range-picker"
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
                id="failed-leads-table-container"
                className="table-container"
                style={{
                  maxHeight: "395px",
                  overflowY: "auto",
                  borderRadius: 0,
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ gap: "10px", width: "180px" }}>
                        {/* <Checkbox
                    id="user-manage-select-all-checkbox"
                    style={{ marginRight: "15px" }}
                    checked={selectAll}
                    onChange={handleSelectAll}
                  /> */}
                        Name
                      </TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Mobile Number</TableCell>
                      <TableCell>Created On</TableCell>
                      {/* <TableCell>Creator</TableCell> */}
                      <TableCell
                        style={{
                          maxWidth: "350px",
                        }}
                        colSpan={3}
                      >
                        Error Message
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          <CircularProgress size={50} sx={{ color: "#000" }} />
                        </TableCell>
                      </TableRow>
                    ) : !isLoading && failedData?.data?.length > 0 ? (
                      failedData?.data?.map((row) => (
                        <TableRow key={row?.id}>
                          <TableCell
                            sx={{ width: "180px", whiteSpace: "nowrap" }}
                          >
                            <div
                              id={`failed-lead-name-${row?.id}`}
                              className="user_name"
                              style={{
                                width: "180px",
                                gap: "10px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {/* <Checkbox
                          id={`user-manage-user-select-${index}`}
                          checked={selectedRows.includes(index)}
                          onChange={() => handleSelectRow(index)}
                        /> */}
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={row?.full_name}
                              >
                                {row?.full_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row?.email}
                          </TableCell>
                          <TableCell
                            style={{
                              whiteSpace: "nowrap",
                              maxWidth: "50px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={row?.mobile_number}
                          >
                            {row?.mobile_number}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {formatDate(row?.created_at)}
                          </TableCell>
                          {/* <TableCell
                        style={{
                          whiteSpace: "nowrap",
                          maxWidth: "50px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={`${row?.lead_owner?.first_name} ${row?.lead_owner?.last_name}`}
                      >
                        {`${row?.lead_owner?.first_name} ${row?.lead_owner?.last_name}`}
                      </TableCell> */}

                          <TableCell
                            colSpan={2}
                            style={{
                              whiteSpace: "nowrap",
                              height: "45px",
                              width: "280px",
                              maxWidth: "300px",
                            }}
                          >
                            <div
                              id={`failed-lead-error-container-${row?.id}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>{row?.failure_reason || "-"}</span>
                              <button
                                id={`failed-lead-update-btn-${row?.id}`}
                                variant="contained"
                                size="small"
                                className="follow-button"
                                onClick={() => {
                                  setSelectedLead(row);
                                  handleEditClick();
                                }}
                              >
                                Update
                              </button>
                              <DeleteIcon
                                id={`failed-lead-delete-btn-${row?.id}`}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  handleActionClick("Delete", row?.id);
                                }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
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
                id="failed-leads-pagination-container"
                className="pagination-wrapper"
              >
                {/* Rounded Pagination with Next/Previous Buttons */}
                <div
                  id="failed-leads-pagination-buttons"
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
                  id="failed-leads-rows-per-page"
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

          {/* {openEditLeadModal && (
        <div className="modal-backdrop">
          <EditSingleLead
            open={openEditLeadModal}
            onClose={() => setOpenEditLeadModal(false)}
            action={selAction}
            lead={selectedLead}
            handleDataChange={handleDataChange}
          />
        </div>
      )} */}

          {isModalOpen && (
            <Modal
              isOpen={isModalOpen}
              onClose={handleModalClose}
              title={modalTitle}
              icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
              content={modalContent}
              actions={modalActions}
            />
          )}
        </>
      )}
    </>
  );
};

export default FailedLeads;
