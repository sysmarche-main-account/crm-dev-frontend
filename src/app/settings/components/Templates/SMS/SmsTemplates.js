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
  Menu,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import SearchIcon from "@/images/search.svg";
import CancelIcon from "@/images/cancel-right.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import { IOSSwitch } from "@/components/Utils";
import SettingIcon from "@/images/settings.svg";
import { useTranslations } from "next-intl";
import "@/styles/RoleTable.scss";
import { useSelector } from "react-redux";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
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
import EditSmsModal from "./EditSmsModal";

const SmsTemplates = ({
  bigLoading,
  setBigLoading,
  dataChange,
  handleDataChange,
}) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { permissions } = useSelector((state) => state.user);

  const [loading, setLoading] = useState({
    data: false,
    visible: false,
  });

  const [smsTemplateData, setSmsTemplateData] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedSmsTemp, setSelectedSmsTemp] = useState(null);

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

  const [editOpen, setEditOpen] = useState(false);

  const getAllSmsTemplateData = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_cat: "sms",
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      filter: {
        search_term: searchTerm,
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

        setSmsTemplateData(decrypted);
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
      setBigLoading(false);
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
    getAllSmsTemplateData();
  }, [page, rowsPerPage, debouncedInput]);

  useEffect(() => {
    if (dataChange) {
      getAllSmsTemplateData();
      handleDataChange();
    }
  }, [dataChange]);

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
      template_ref_id: selectedSmsTemp?.template_ref_id, //Mandatory field
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
    setSelectedSmsTemp(row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(false);
  };

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`${t("manage_template.mt_sms_del_title")}?`);
      setModalContent(t("manage_template.mt_sms_del_mdl_content"));
      setModalActions([
        {
          label: t("followup.cf_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("followup.fup_del_btn"),
          className: "confirm-button",
          onClick: handleConfirmDeleteTemplate,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Edit") {
      setEditOpen(true);
    }
    handleMenuClose();
  };

  const closeEdit = () => setEditOpen(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const smsTemplatesSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 9 &&
        set.parent === 60 &&
        set.details === "single_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
          id="template-sms-edit-loading-container"
          style={{
            overflow: "hidden",
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress
            id="template-sms-edit-loading-spinner"
            size={80}
            color="#000"
          />
        </div>
      ) : smsTemplateData?.data?.length === 0 &&
        smsTemplateData?.data?.total_record === 0 ? (
        <NoContent
          id="template-sms-edit-no-content"
          illustration={EmptyRoles}
          title={t("manage_template.mt_sms_nocontent_title")}
          subtitle={t("manage_template.mt_sms_nocontent_subtitle")}
        />
      ) : (
        <div
          id="template-sms-edit-main-container"
          className="table-container"
          style={{ width: "100%", border: "none" }}
        >
          {/* Search Section */}
          <div
            id="template-sms-edit-search-wrapper"
            className="role-table-parent"
          >
            <div className="role-search">
              <div className="search-box">
                <input
                  id="template-sms-edit-main-search"
                  type="text"
                  placeholder={t("manage_roles.mr_mu_search_phlsr")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  id="template-sms-edit-main-search-btn"
                  className="search-icon"
                >
                  <SearchIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <TableContainer
            id="template-sms-edit-table-container"
            component={Paper}
            className="user-table-container"
            style={{ maxHeight: "360px", overflowY: "auto" }}
          >
            <Table stickyHeader id="template-sms-edit-table">
              <TableHead>
                <TableRow>
                  <TableCell
                    id="template-sms-edit-header-template-name"
                    sx={{ gap: "10px", width: "200px", whiteSpace: "nowrap" }}
                  >
                    {/* <Checkbox style={{ marginRight: "15px" }} />{" "} */}
                    {t("manage_template.smst_tbl_template_name")}
                  </TableCell>
                  <TableCell
                    id="template-sms-edit-header-sms-body"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {" "}
                    {t("manage_template.smst_tbl_sms_body")}
                  </TableCell>
                  <TableCell
                    id="template-sms-edit-header-visibility"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {" "}
                    {t("manage_template.smst_tbl_visibility")}
                  </TableCell>
                  <TableCell
                    id="template-sms-edit-header-settings"
                    sx={{ textAlign: "center" }}
                  >
                    {" "}
                    <SettingIcon />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading.data ? (
                  <TableRow id="template-sms-edit-table-loading-row">
                    <TableCell
                      colSpan={5}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      <CircularProgress
                        id="template-sms-edit-table-loading-spinner"
                        size={50}
                        sx={{ color: "#000" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : smsTemplateData?.data?.length > 0 ? (
                  smsTemplateData?.data?.map((row, index) => (
                    <TableRow key={index} id={`template-sms-edit-row-${index}`}>
                      <TableCell style={{ gap: "10px", whiteSpace: "nowrap" }}>
                        {/* <Checkbox style={{ marginRight: "15px" }} /> */}
                        {row?.template_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row?.body_content}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", width: 100 }}>
                        <div
                          id={`template-sms-edit-visibility-wrapper-${row?.template_name}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: 5,
                          }}
                        >
                          <IOSSwitch
                            id={`template-sms-edit-switch-${row?.template_name}`}
                            checked={row?.status}
                            color="primary"
                            onChange={() => {
                              handleVisibilityChange(row);
                              setSelectedSmsTemp(row);
                            }}
                          />
                          {loading?.visible && selectedSmsTemp === row && (
                            <CircularProgress size={23} color="#000" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        style={{ textAlign: "center", whiteSpace: "nowrap" }}
                      >
                        <IconButton
                          id={`template-sms-edit-list-${row?.template_name}`}
                          onClick={(e) => handleMenuClick(e, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow id="template-sms-edit-no-results-row">
                    <TableCell
                      colSpan={4}
                      align="center"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("manage_template.smst_no_results_found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div
            id="template-sms-edit-pagination-wrapper"
            className="pagination-wrapper"
          >
            <div className="pagination-buttons">
              <Button
                id="template-sms-edit-page-back"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outlined"
                sx={{ marginRight: 2, textTransform: "capitalize" }}
              >
                {t("leads.lm_pagination_back")}
              </Button>
              <Pagination
                id="template-sms-edit-pagination"
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
                id="template-sms-edit-page-next"
                onClick={() => setPage(page + 1)}
                disabled={page === pagesData?.total_pages}
                variant="outlined"
                sx={{ marginLeft: 2, textTransform: "capitalize" }}
              >
                {t("leads.lm_pagination_next")}
              </Button>
            </div>
            {/* Results per page */}
            <div
              id="template-sms-edit-results-per-page"
              className="form-group-pagination"
            >
              <label>{t("leads.lm_results_per_page")}:</label>
              <Select
                id="template-sms-edit-noofpages"
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
            id="template-sms-edit-single-actions-menu"
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
            {smsTemplatesSingleActions?.length > 0 ? (
              <span>
                {smsTemplatesSingleActions &&
                  smsTemplatesSingleActions?.some((act) => act.id === 66) && (
                    <MenuItem
                      id="template-sms-edit-list-edit-btn"
                      onClick={() => handleActionClick("Edit")}
                    >
                      {t("leads.lm_menu_edit")}
                    </MenuItem>
                  )}
                {smsTemplatesSingleActions &&
                  smsTemplatesSingleActions?.some((act) => act.id === 67) && (
                    <MenuItem
                      id="template-sms-edit-delete-btn"
                      onClick={() => handleActionClick("Delete")}
                    >
                      {t("leads.lm_menu_del")}
                    </MenuItem>
                  )}
              </span>
            ) : (
              <MenuItem>{t("buttons.btn_no_action_allowed")}</MenuItem>
            )}
          </Menu>

          {isModalOpen && (
            <Modal
              id="template-sms-edit-modal"
              isOpen={isModalOpen}
              onClose={handleModalClose}
              title={modalTitle}
              icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
              content={modalContent}
              actions={modalActions}
            />
          )}

          {editOpen && (
            <EditSmsModal
              id="template-sms-edit-edit-modal"
              open={editOpen}
              onClose={closeEdit}
              selectedTemp={selectedSmsTemp}
              handleDataChange={handleDataChange}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SmsTemplates;
