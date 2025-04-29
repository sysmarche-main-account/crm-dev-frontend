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
  Chip,
  Pagination,
  Select,
  MenuItem,
  Button,
  Menu,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import SearchIcon from "@/images/search.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import { IOSSwitch } from "@/components/Utils";
import SettingIcon from "@/images/settings.svg";
import { useTranslations } from "next-intl";
import "@/styles/RoleTable.scss";
import { useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  deleteTemplateAction,
  getAllTemplateListAction,
  updateTemplateAction,
} from "@/app/actions/templateActions";
import { decryptClient } from "@/utils/decryptClient";
import Modal from "@/components/common/Modal/Modal";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";

const EmailTemplates = ({
  bigLoading,
  setBigLoading,
  dataChange,
  handleDataChange,
  openEmailEditModal,
  setSelEmailTemp,
}) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { permissions } = useSelector((state) => state.user);

  const [loading, setLoading] = useState({
    data: false,
    visible: false,
  });
  const [emailTemplateData, setEmailTemplateData] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedEmailTemp, setSelectedEmailTemp] = useState(null);

  const [filter, setFilter] = useState("All");
  const [filterArray, setFilterArray] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const getAllEmailTemplateData = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_cat: "email",
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      filter: {
        search_term: searchTerm,
        field_filters: filterArray,
      },
      sorting: [
        {
          field: "created_at",
          order: "desc",
        },
        // {
        //   field: "template_name",
        //   order: "asc",
        // },
      ],
      // "req_time": "2024-06-17 12:00:00"
    };
    console.log("body", reqbody);

    try {
      const result = await getAllTemplateListAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final email templates", decrypted);

        setEmailTemplateData(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setLoading((prev) => ({ ...prev, data: false }));
        setBigLoading(false);
      } else {
        console.error(result);
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
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  useEffect(() => {
    getAllEmailTemplateData();
  }, [page, rowsPerPage, debouncedInput, filter]);

  useEffect(() => {
    if (dataChange) {
      getAllEmailTemplateData();
      handleDataChange();
    }
  }, [dataChange]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "All") {
      const filteredFilters = filterArray?.filter(
        (item) => item.field !== "template_status"
      );
      setFilterArray(filteredFilters);
    } else if (newFilter === "Published") {
      if (filterArray?.some((item) => item.field === "template_status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "template_status" ? { ...item, value: 1 } : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [
          ...prev,
          { field: "template_status", value: 1 },
        ]);
      }
    } else if (newFilter === "Draft") {
      if (filterArray?.some((item) => item.field === "template_status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "template_status" ? { ...item, value: 0 } : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [
          ...prev,
          { field: "template_status", value: 0 },
        ]);
      }
    }
  };

  const handlePageChange = (event, page) => setPage(page);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to the first page when rows per page changes
  };

  const handleVisibilityChange = async (row) => {
    setLoading((prev) => ({ ...prev, visible: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_ref_id: row?.template_ref_id, //Mandatory field
      status: row?.status ? 0 : 1,
    };
    console.log("body", reqbody);

    try {
      const result = await updateTemplateAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final email template visibiltiy", decrypted);

        setLoading((prev) => ({ ...prev, visible: false }));
        handleDataChange();
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, visible: false }));
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
      setLoading((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleConfirmDeleteTemplate = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_ref_id: selectedEmailTemp?.template_ref_id, //Mandatory field
    };
    console.log("body", reqbody);

    try {
      const result = await deleteTemplateAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final email template delete", decrypted);

        handleModalClose();
        let errValues = Object.values(decrypted.message);
        if (errValues.length > 0) {
          errValues.map((errmsg) =>
            showSnackbar({
              message: `${errmsg}`,
              severity: "success",
              anchorOrigin: { vertical: "top", horizontal: "center" },
            })
          );
        }
        handleDataChange();
      } else {
        console.error(result);
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
    }
  };

  const handleMenuClick = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setSelectedEmailTemp(row);
    setSelEmailTemp(row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(false);
  };

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`${t("manage_template.mt_et_del_mdl_title")}?`);
      setModalContent(t("manage_template.mt_et_del_mdl_content"));
      setModalActions([
        {
          label: t("manage_template.cwam_cancel_btn"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_user.mu_confirm_btn"),
          className: "confirm-button",
          onClick: handleConfirmDeleteTemplate,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Edit") {
      openEmailEditModal();
    }
    handleMenuClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const emailTemplatesSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 9 &&
        set.parent === 59 &&
        set.details === "single_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
          id="big-loading-container"
          style={{
            overflow: "hidden",
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={80} color="#000" />
        </div>
      ) : emailTemplateData?.length === 0 &&
        emailTemplateData?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={t("manage_template.mt_et_nocontent_title")}
          subtitle={t("manage_template.mt_et_nocontent_subtitle")}
        />
      ) : (
        <div
          id="email-template-table-container"
          className="table-container"
          style={{ width: "100%", border: "none" }}
        >
          {/* Filter Buttons */}
          <div id="role-table-parent" className="role-table-parent">
            <div id="filter-buttons-container" className="filter-buttons">
              <button
                id="template-email-manage-filter-all"
                onClick={() => handleFilterChange("All")}
                className={`all-button ${filter === "All" ? "active" : ""}`}
              >
                {t("manage_template.et_all_btn")}{" "}
                <span>({pagesData?.total_record || 0})</span>
              </button>
              <button
                id="template-email-manage-filter-publish"
                onClick={() => handleFilterChange("Published")}
                className={`enable-button ${
                  filter === "Published" ? "active" : ""
                }`}
              >
                {t("manage_template.et_published_btn")}{" "}
                <span>({pagesData?.total_publish || 0})</span>
              </button>
              <button
                id="template-email-manage-filter-draft"
                onClick={() => handleFilterChange("Draft")}
                className={`disabled-button ${
                  filter === "Draft" ? "active" : ""
                }`}
              >
                {t("manage_template.et_draft_btn")}
                <span>({pagesData?.total_draft || 0})</span>
              </button>
            </div>

            {/* Search Box */}
            <div id="role-search-container" className="role-search">
              <div id="search-box-wrapper" className="search-box">
                <input
                  id="template-email-manage-main-search"
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button id="search-icon-button" className="search-icon">
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
                  <TableCell
                    sx={{ whiteSpace: "nowrap", gap: "10px", width: "180px" }}
                  >
                    {/* <Checkbox style={{ marginRight: "15px" }} /> */}
                    {t("manage_template.et_template_name")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {" "}
                    {t("manage_template.et_subject")}{" "}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {" "}
                    {t("manage_template.et_status")}{" "}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {" "}
                    {t("manage_template.et_visibility")}{" "}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {" "}
                    <SettingIcon />
                  </TableCell>
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
                ) : emailTemplateData?.data?.length > 0 ? (
                  emailTemplateData?.data?.map((row) => (
                    <TableRow key={row?.template_ref_id}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {/* <Checkbox style={{ marginRight: "15px" }} /> */}
                        {row?.template_name}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row?.subject}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          label={row?.template_status ? "Published" : "Draft"}
                          sx={{
                            color: row?.template_status ? "#23A047" : "#F00",
                            backgroundColor: row?.template_status
                              ? "#EAFBEF"
                              : "#FBEFEE",
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          id={`visibility-toggle-container-${row?.template_ref_id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: 5,
                          }}
                        >
                          <IOSSwitch
                            id={`template-email-manage-checkbox-${row?.template_ref_id}`}
                            checked={row?.status}
                            color="primary"
                            onChange={() => {
                              handleVisibilityChange(row);
                              setSelectedEmailTemp(row);
                            }}
                          />
                          {loading?.visible && selectedEmailTemp === row && (
                            <CircularProgress size={23} color="#000" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        sx={{ whiteSpace: "nowrap", textAlign: "center" }}
                      >
                        <IconButton
                          id={`template-email-manage-list-${row?.template_ref_id}`}
                          onClick={(e) => handleMenuClick(e, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      style={{
                        padding: "30px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                      }}
                    >
                      {t("manage_template.et_no_results")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div id="pagination-wrapper" className="pagination-wrapper">
            <div
              id="pagination-buttons-container"
              className="pagination-buttons"
            >
              <Button
                id="template-email-manage-page-back"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outlined"
                sx={{ marginRight: 2, textTransform: "capitalize" }}
              >
                {t("leads.lm_pagination_back")}
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
                id="template-email-manage-page-next"
                onClick={() => setPage(page + 1)}
                disabled={page === pagesData?.total_pages}
                variant="outlined"
                sx={{ marginLeft: 2, textTransform: "capitalize" }}
              >
                {t("leads.lm_pagination_next")}
              </Button>
            </div>
            {/* Results per page */}
            <div id="form-group-pagination" className="form-group-pagination">
              <label>{t("leads.lm_results_per_page")}:</label>
              <Select
                id="template-email-manage-page-noofpages"
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

          {/* single_action */}
          <Menu
            id="template-email-manage-single-action-list"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            sx={{
              style: {
                maxHeight: 200,
                width: "20ch",
              },
            }}
          >
            {emailTemplatesSingleActions?.length > 0 ? (
              <span>
                {emailTemplatesSingleActions &&
                  emailTemplatesSingleActions?.some((act) => act.id === 63) && (
                    <MenuItem
                      id="template-email-manage-edit-btn"
                      onClick={() => handleActionClick("Edit")}
                    >
                      {t("followup.fuptc_edit")}
                    </MenuItem>
                  )}
                {emailTemplatesSingleActions &&
                  emailTemplatesSingleActions?.some((act) => act.id === 64) && (
                    <MenuItem
                      id="template-email-manage-delete-btn"
                      onClick={() => handleActionClick("Delete")}
                    >
                      {t("followup.fuptc_del")}
                    </MenuItem>
                  )}
              </span>
            ) : (
              <MenuItem>{t("buttons.btn_no_action_allowed")}</MenuItem>
            )}
          </Menu>

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
        </div>
      )}
    </>
  );
};

export default EmailTemplates;
