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
import DeleteIcon from "@/images/delete-icon.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import SettingIcon from "@/images/settings.svg";
import "@/styles/RoleTable.scss";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import {
  deleteTemplateAction,
  getAllTemplateListAction,
} from "@/app/actions/templateActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import EditWhatsapppModal from "./EditWhatsappModal";
import Modal from "@/components/common/Modal/Modal";

const WhatsappTemplates = ({
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
  });

  const [whatsappTemplateData, setWhatsappSmsTemplateData] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedWhatsappTemp, setSelectedWhatsappTemp] = useState(null);

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

  const [editOpenWhatsapp, setEditOpenWhatsapp] = useState(false);

  const getAllWhatsappTemplateData = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_cat: "whatsapp",
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

        setWhatsappSmsTemplateData(decrypted);
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
    getAllWhatsappTemplateData();
  }, [page, rowsPerPage, debouncedInput]);

  useEffect(() => {
    if (dataChange) {
      getAllWhatsappTemplateData();
      handleDataChange();
    }
  }, [dataChange]);

  const handlePageChange = (event, page) => setPage(page);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to the first page when rows per page changes
  };

  const handleMenuClick = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setSelectedWhatsappTemp(row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(false);
  };

  const handleConfirmDeleteTemplate = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_ref_id: selectedWhatsappTemp?.template_ref_id, //Mandatory field
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

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`${t("manage_template.mt_whats_del_mdl_title")}?`);
      setModalContent(t("manage_template.mt_whats_del_mdl_content"));
      setModalActions([
        {
          label: t("followup.cf_cancel"),
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
      setEditOpenWhatsapp(true);
    }
    handleMenuClose();
  };

  const closeEdit = () => setEditOpenWhatsapp(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const whatsappTemplatesSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 9 &&
        set.parent === 61 &&
        set.details === "single_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
          id="template-whatsapp-manage-loading-wrapper"
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
      ) : whatsappTemplateData?.data?.length === 0 &&
        whatsappTemplateData?.data?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={t("manage_template.mt_whats_nocontent_title")}
          subtitle={t("manage_template.mt_whats_nocontent_subtitle")}
        />
      ) : (
        <div
          id="template-whatsapp-manage-table-wrapper"
          className="table-container"
          style={{ width: "100%", border: "none" }}
        >
          {/* Search and Filter section */}
          <div
            id="template-whatsapp-manage-search-wrapper"
            className="role-table-parent"
          >
            {/* Search and Filter section */}
            <div
              id="template-whatsapp-manage-search-input-wrapper"
              className="role-search"
            >
              <div className="search-box">
                <input
                  id="template-whatsapp-manage-main-search"
                  type="text"
                  placeholder={t("sidebar.search_phldr")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  id="template-whatsapp-manage-main-search-btn"
                  className="search-icon"
                >
                  <SearchIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <TableContainer
            id="template-whatsapp-manage-table-container"
            component={Paper}
            className="user-table-container"
            style={{ maxHeight: "360px", overflowY: "auto" }}
          >
            <Table stickyHeader id="template-whatsapp-manage-table">
              <TableHead id="template-whatsapp-manage-table-head">
                <TableRow id="template-whatsapp-manage-table-header-row">
                  <TableCell
                    id="template-whatsapp-manage-header-template-name"
                    sx={{ gap: "10px", width: "200px", whiteSpace: "nowrap" }}
                  >
                    {t("manage_template.wat_tbl_template_name")}
                  </TableCell>
                  <TableCell
                    id="template-whatsapp-manage-header-sms-body"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {t("manage_template.wat_tbl_sms_body")}
                  </TableCell>
                  <TableCell
                    id="template-whatsapp-manage-header-settings"
                    sx={{ textAlign: "center" }}
                  >
                    <SettingIcon />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="template-whatsapp-manage-table-body">
                {loading.data ? (
                  <TableRow id="template-whatsapp-manage-loading-row">
                    <TableCell
                      colSpan={5}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      <CircularProgress size={50} sx={{ color: "#000" }} />
                    </TableCell>
                  </TableRow>
                ) : whatsappTemplateData?.data?.length > 0 ? (
                  whatsappTemplateData?.data?.map((row, index) => (
                    <TableRow
                      key={index}
                      id={`template-whatsapp-manage-row-${index}`}
                    >
                      <TableCell
                        id={`template-whatsapp-manage-row-template-name-${index}`}
                        style={{ gap: "10px", whiteSpace: "nowrap" }}
                      >
                        {row.template_name}
                      </TableCell>
                      <TableCell
                        id={`template-whatsapp-manage-row-body-content-${index}`}
                        sx={{
                          whiteSpace: "nowrap",
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.body_content}
                      </TableCell>
                      <TableCell
                        id={`template-whatsapp-manage-row-actions-${index}`}
                        style={{ textAlign: "center", whiteSpace: "nowrap" }}
                      >
                        <IconButton
                          id={`template-whatsapp-manage-list-btn-${row?.template_name}`}
                          onClick={(e) => handleMenuClick(e, row)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow id="template-whatsapp-manage-no-results-row">
                    <TableCell
                      colSpan={5}
                      align="center"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("manage_template.wat_no_results_found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div
            id="template-whatsapp-manage-pagination-wrapper"
            className="pagination-wrapper"
          >
            <div
              id="template-whatsapp-manage-pagination-buttons"
              className="pagination-buttons"
            >
              <Button
                id="template-whatsapp-manage-page-back"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outlined"
                sx={{ marginRight: 2, textTransform: "capitalize" }}
              >
                {t("leads.lm_pagination_back")}
              </Button>
              <Pagination
                id="template-whatsapp-manage-pagination-component"
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
                id="template-whatsapp-manage-page-next"
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
              id="template-whatsapp-manage-results-per-page"
              className="form-group-pagination"
            >
              <label id="template-whatsapp-manage-results-per-page-label">
                {t("leads.lm_results_per_page")}:
              </label>
              <Select
                id="template-whatsapp-manage-page-noofpages"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                sx={{ width: 65, height: 30 }}
              >
                {rowsPerPageOptions.map((opt) => (
                  <MenuItem
                    id={`template-whatsapp-manage-rows-option-${opt}`}
                    value={opt}
                    key={opt}
                  >
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          {/* single_action */}
          <Menu
            id="template-whatsapp-manage-single-action-menu"
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
            {whatsappTemplatesSingleActions?.length > 0 ? (
              <span id="template-whatsapp-manage-single-action-menu-items">
                {whatsappTemplatesSingleActions &&
                  whatsappTemplatesSingleActions?.some(
                    (act) => act.id === 69
                  ) && (
                    <MenuItem
                      id="template-whatsapp-manage-edit-btn"
                      onClick={() => handleActionClick("Edit")}
                    >
                      {t("leads.lm_menu_edit")}
                    </MenuItem>
                  )}
                {whatsappTemplatesSingleActions &&
                  whatsappTemplatesSingleActions?.some(
                    (act) => act.id === 70
                  ) && (
                    <MenuItem
                      id="template-whatsapp-manage-delete-btn"
                      onClick={() => handleActionClick("Delete")}
                    >
                      {t("leads.lm_menu_del")}
                    </MenuItem>
                  )}
              </span>
            ) : (
              <MenuItem id="template-whatsapp-manage-no-action">
                {t("buttons.btn_no_action_allowed")}
              </MenuItem>
            )}
          </Menu>

          {isModalOpen && (
            <Modal
              id="template-whatsapp-manage-modal"
              isOpen={isModalOpen}
              onClose={handleModalClose}
              title={modalTitle}
              icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
              content={modalContent}
              actions={modalActions}
            />
          )}

          {editOpenWhatsapp && (
            <EditWhatsapppModal
              id="template-whatsapp-manage-edit-modal"
              open={editOpenWhatsapp}
              onClose={closeEdit}
              selectedTemp={selectedWhatsappTemp}
              handleDataChange={handleDataChange}
            />
          )}
        </div>
      )}
    </>
  );
};

export default WhatsappTemplates;
