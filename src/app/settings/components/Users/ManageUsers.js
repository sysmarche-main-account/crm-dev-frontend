"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Select,
  Button,
  Pagination,
  CircularProgress,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import Alerticon from "@/images/alert-circle.svg";
import SearchIcon from "@/images/search.svg";
import SettingIcon from "@/images/settings.svg";
import CancelIcon from "@/images/cancel-right.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import CreateUserModal from "./CreateUserModal";
import ChangeOwners from "./ChangeOwners";
import Modal from "@/components/common/Modal/Modal";
import ImportUserModal from "@/app/settings/components/Roles/ImportUserModal";
import EditUserModal from "./EditUserModal";
import { useTranslations } from "next-intl";
import NoContent from "@/components/NoContent";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  getAllUsersListAction,
  handleEditUserAction,
} from "@/app/actions/userActions";
import { decryptClient } from "@/utils/decryptClient";
import { useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import ResetUserPassword from "./ResetUserPassword";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import { masterDDAction } from "@/app/actions/commonActions";

const ManageUsers = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const { permissions } = useSelector((state) => state.user);

  const [loading, setLoading] = useState({
    uni: false,
  });

  const [bigLoading, setBigLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [universities, setUniversities] = useState([]);

  const [userData, setUserData] = useState(null);

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activate, setActivate] = useState(false);
  const [debouncedInput, setDebouncedInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterArray, setFilterArray] = useState([]);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalUserOpen, setIsModalUserOpen] = useState(false);

  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // State for Menu anchor element

  const [importModal, setImportModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [isConfirmDisableModalOpen, setIsConfirmDisableModalOpen] =
    useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const handleResetUser = () => {
    setIsResetPasswordModalOpen(true); // Open the ResetUserPassword component
    setMenuAnchor(false);
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false); // Close the ResetUserPassword component
  };

  const getAllUsersData = async () => {
    setIsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      filter: {
        search_term: searchTerm,
        field_filters: filterArray,
        // field_filters: [
        //   // {
        //   //   field: "first_name",
        //   //   value: "",
        //   // },
        //   // {
        //   //   field: "status",
        //   //   value: 2,
        //   // },
        //   // {
        //   //   field: "reporting_manager",
        //   //   value: "",
        //   // },
        // ],
      },

      sorting: [
        {
          field: "created_at",
          order: "DESC",
        },
      ],
    };

    try {
      const result = await getAllUsersListAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final user data", decrypted);

        setUserData(decrypted);
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

  const getUniversitiesList = async () => {
    setLoading((prev) => ({ ...prev, uni: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: "1", // optional input will be integer
      identifier: ["university"], // mandatory input will be an array
      // "parent_id": "0" // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setUniversities(decrypted);
        // if (details?.university?.includes(0)) {
        // } else {
        //   const filtered = decrypted?.filter((uni) =>
        //     details?.university?.some((d) => d.id === uni?.id)
        //   );
        //   setUniversities(filtered);
        // }
        setLoading((prev) => ({ ...prev, uni: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, uni: false }));
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
      setLoading((prev) => ({ ...prev, uni: false }));
    }
  };

  useEffect(() => {
    getUniversitiesList();
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
      getAllUsersData();
      handleDataChange();
    }
  }, [dataChanged]);

  useEffect(() => {
    getAllUsersData();
  }, [page, rowsPerPage, debouncedInput, filter, activate]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "All") {
      const filteredFilters = filterArray?.filter(
        (item) => item.field !== "status"
      );
      setFilterArray(filteredFilters);
    } else if (newFilter === "Active") {
      if (filterArray?.some((item) => item.field === "status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "status" ? { ...item, value: "Active" } : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [
          ...prev,
          { field: "status", value: "Active" },
        ]);
      }
    } else if (newFilter === "Inactive") {
      if (filterArray?.some((item) => item.field === "status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "status" ? { ...item, value: "Inactive" } : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [
          ...prev,
          { field: "status", value: "Inactive" },
        ]);
      }
    }
  };

  const handleMenuClick = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRow(row.uuid);
    setSelectedRowDetails(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(false);
    setMenuAnchor(null);
    setSelectedRow(null);
    setSelectedRowDetails(null);
  };

  const handleActionClick = (action) => {
    if (
      action === "Deactive" &&
      selectedRowDetails?.active_lead_count === 0 &&
      selectedRowDetails?.reporting_user_count === 0
    ) {
      setModalTitle(t("changereports.chgrep_modal_deactivate_title"));
      setModalContent(t("changereports.chgrep_modal_deactivate_subtitle"));
      setModalActions([
        {
          label: t("manage_user.mu_deactivate_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_user.mu_deactivate_confirm"),
          className: "confirm-button",
          onClick: handleConfirmDisable,
        },
      ]);
    } else if (action === "Activate") {
      handleConfirmEnable();
      // setModalTitle(t("manage_user.mu_activate_title"));
      // setModalContent(t("manage_user.mu_activate_content"));
      // setModalActions([
      //   {
      //     label: t("manage_user.mu_cancel_btn"),
      //     className: "cancel-button",
      //     onClick: handleModalClose,
      //   },
      //   {
      //     label: t("manage_user.mu_confirm_btn"),
      //     className: "confirm-button",
      //     onClick: handleConfirmEnable,
      //   },
      // ]);
    } else if (action === "Reset") {
      setModalTitle(t("manage_user.mu_reset_title"));
      setModalContent(t("manage_user.mu_reset_content"));
      setModalActions([
        {
          label: t("manage_user.mu_cancel_btn"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_user.mu_confirm_btn"),
          className: "confirm-button",
          onClick: handleConfirmDelete,
        },
      ]);
    } else {
      console.log(`${action} clicked for row:`, selectedRow);
      setIsConfirmDisableModalOpen(true);
    }

    // Open the modal for Disable or Delete actions
    if (
      action === "Reset" ||
      (action === "Deactive" &&
        selectedRowDetails?.active_lead_count === 0 &&
        selectedRowDetails?.reporting_user_count === 0)
    ) {
      setIsModalOpen(true);
    }
    setMenuAnchor(false);
    // handleMenuClose();
  };

  const handleActionEditClick = () => {
    setEditModal(true);
    setMenuAnchor(false);
  };

  const handleModalClose = () => setIsModalOpen(false);

  const handleConfirmDisable = async () => {
    console.log("User disabled:", selectedRowDetails);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: selectedRowDetails?.uuid,
      status: "Inactive",
    };
    // console.log("reqbody", reqbody);

    //Logic to disable user
    try {
      const result = await handleEditUserAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        showSnackbar({
          message: `<strong>${decrypted.first_name} ${
            decrypted.last_name
          }</strong> ${t("manage_user.mu_chngrep_mu_trnsferlead_alert")}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
        setIsModalOpen(false);
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
            errValues.map((errmsg) => {
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              });
            });
          }
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsModalOpen(false);
    }
  };

  const handleConfirmEnable = async () => {
    // console.log("Role disabled:", selectedRowDetails);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: selectedRowDetails?.uuid,
      status: "Active",
    };
    // console.log("body", reqbody);

    //Logic to activate user
    try {
      const result = await handleEditUserAction(csrfToken, reqbody);
      // console.log("activate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setActivate(!activate);
        showSnackbar({
          message: `<strong>${decrypted.first_name} ${
            decrypted.last_name
          }</strong> ${t("manage_user.mu_activemdl_alert")}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
        setIsModalOpen(false);
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
            errValues.map((errmsg) => {
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              });
            });
          }
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    handleDataChange();
    setIsModalOpen(false);
  };

  const handleOpenModal = () => setIsModalUserOpen(true);

  const openImportModal = () => setImportModal(true); // Set importModal to true to open the ImportUserModal component
  const editOpenModal = () => setEditModal(true);

  const closeEditModal = () => {
    setEditModal(false);
    setSelectedRow(null);
    setSelectedRowDetails(null);
  };

  const closeImportModal = () => setImportModal(false); // Set importModal to false to close the ImportUserModal component

  const handlePageChange = (event, value) => setPage(value);

  const handleMenuClickModal = (event) => setAnchorEl(event.currentTarget);

  const handleConfirmDisableModalClose = () =>
    setIsConfirmDisableModalOpen(false);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };

  const handleImportActionClick = (action) => {
    handleMenuClose();
    if (action === "import") {
      openImportModal(); // Open the ImportUserModal modal when "import" is clicked
    }
  };

  // Toggle all rows when header checkbox is clicked
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(userData?.data?.map((_, index) => index)); // Select all
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

  const manageUserSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 7 && set.details === "single_action"
    );

  const manageUserListActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 7 && set.details === "list_action"
    );

  const manageUserBulkActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 7 && set.details === "bulk_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
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
      ) : userData?.data?.length === 0 && userData?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={t("manage_user.mu_nocontent_tile")}
          subtitle={t("manage_user.mu_nocontent_subtitle")}
          buttonText={t("manage_user.mu_nocontent_btn")}
          onButtonClick={handleOpenModal}
        />
      ) : (
        <div
          className="table-container manage-roles-container"
          style={{ border: "1px solid #c9ced3" }}
        >
          <div className="manager-roles-headers-roles">
            <div className="role-description-user">
              <h1>{t("manage_user.mu_title")}</h1>
              <p>{t("manage_user.mu_descr")}</p>
            </div>
            <div className="action-buttons">
              {manageUserBulkActions?.length > 0 && (
                <button
                  id="user-manage-bulk-action-btn"
                  className="action-button"
                  onClick={handleMenuClickModal}
                >
                  <SettingIcon />
                  {t("manage_user.mu_action_btn")}
                </button>
              )}
              {manageUserSingleActions &&
              manageUserSingleActions?.some((act) => act.id === 22) ? (
                <button
                  id="user-manage-create-user-btn"
                  className="create-role-button"
                  onClick={handleOpenModal}
                >
                  {t("manage_user.mu_newuser_btn")}
                </button>
              ) : null}
            </div>
          </div>

          {/* Fixed height for the table container */}
          <div className="table-scroll-container">
            {/* Keep the header section fixed */}
            <div className="role-table-parent">
              <div className="filter-buttons">
                <button
                  id="user-manage-filter-all"
                  onClick={() => handleFilterChange("All")}
                  className={`all-button ${filter === "All" ? "active" : ""}`}
                >
                  {t("buttons.buttons_all")}{" "}
                  <span>({userData?.total_record ?? 0})</span>
                </button>
                <button
                  id="user-manage-filter-active"
                  onClick={() => handleFilterChange("Active")}
                  className={`enable-button ${
                    filter === "Active" ? "active" : ""
                  }`}
                >
                  {t("buttons.buttons_active")}{" "}
                  <span>({userData?.total_active ?? 0})</span>
                </button>
                <button
                  id="user-manage-filter-inactive"
                  onClick={() => handleFilterChange("Inactive")}
                  className={`disabled-button ${
                    filter === "Inactive" ? "active" : ""
                  }`}
                >
                  {t("buttons.buttons_inactive")}{" "}
                  <span>({userData?.total_inactive ?? 0})</span>
                </button>
              </div>

              {/* Search and Filter section */}
              <div className="role-search">
                <div className="search-box">
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
            </div>

            {/* Scrollable table content */}
            <TableContainer
              className="table-container"
              style={{ maxHeight: "395px", overflowY: "auto", borderRadius: 0 }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ gap: "10px", width: "180px" }}>
                      <Checkbox
                        id="user-manage-select-all-checkbox"
                        style={{ marginRight: "15px" }}
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      {t("manage_user.mu_tbl_user_name")}
                    </TableCell>
                    <TableCell>{t("manage_user.mu_tbl_email")}</TableCell>
                    <TableCell>{t("manage_user.mu_tbl_mn")}</TableCell>
                    <TableCell>{t("manage_user.mu_tbl_role")}</TableCell>
                    <TableCell>
                      {t("manage_user.mu_tbl_reporting_to")}
                    </TableCell>
                    <TableCell sx={{ width: "350px" }}>
                      {t("manage_user.mu_tbl_univ_name")}
                    </TableCell>
                    <TableCell>{t("manage_user.mu_tbl_created_by")}</TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <SettingIcon />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        <CircularProgress size={50} sx={{ color: "#000" }} />
                      </TableCell>
                    </TableRow>
                  ) : !isLoading && userData?.data?.length > 0 ? (
                    userData?.data?.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell
                          sx={{ width: "180px", whiteSpace: "nowrap" }}
                        >
                          <div
                            className="user_name"
                            style={{
                              width: "180px",
                              gap: "10px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Checkbox
                              id={`user-manage-user-select-${index}`}
                              checked={selectedRows.includes(index)}
                              onChange={() => handleSelectRow(index)}
                            />
                            <span
                              style={{
                                maxWidth: "100px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={`${row?.first_name} ${row?.last_name}`}
                            >
                              {row?.first_name} {row?.last_name}
                            </span>
                            <span className="status_badge">
                              <Badge
                                sx={{
                                  "& .MuiBadge-dot": {
                                    backgroundColor:
                                      row.login_status === 1
                                        ? "#1DBF73"
                                        : "#EC2E2E",
                                  },
                                }}
                                variant="dot"
                              />
                            </span>
                          </div>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.email}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.mobile_number}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: "nowrap",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={
                            (row?.role && row?.role?.name) ?? "Not available"
                          }
                        >
                          {(row?.role && row?.role?.name) ?? "Not available"}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: "nowrap",
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={
                            row?.reporting_manager
                              ? `${row.reporting_manager.first_name} ${row.reporting_manager.last_name}`
                              : "Not available"
                          }
                        >
                          {row?.reporting_manager
                            ? `${row.reporting_manager.first_name} ${row.reporting_manager.last_name}`
                            : "Not available"}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {/* {row?.universities &&
                          row?.universities?.length > 0 ? (
                            <div
                              className="university-cell"
                              style={{
                                whiteSpace: "nowrap",
                                width: "200px",
                                overflow: "hidden",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  flexGrow: 1, // Allow the Typography to grow and take available space
                                }}
                                noWrap
                                title={
                                  row?.universities &&
                                  row?.universities[0]?.name
                                }
                              >
                                {row?.universities &&
                                  row?.universities[0]?.name}
                              </Typography>
                              {row?.universities &&
                                row?.universities?.length > 1 && (
                                  <Tooltip
                                    title={
                                      <div className="tooltip-scrollable">
                                        {row?.universities
                                          ?.slice(1)
                                          .map((uni, index) => (
                                            <List
                                              key={index}
                                              style={{
                                                maxHeight: "100%",
                                              }}
                                            >
                                              <ListItem button disablePadding>
                                                <ListItemText
                                                  primary={uni?.name}
                                                />
                                              </ListItem>
                                              {index !==
                                                row?.university?.length - 1 && (
                                                <Divider
                                                  sx={{
                                                    borderColor: "#FFFFFF1A",
                                                  }}
                                                  component="li"
                                                />
                                              )}
                                            </List>
                                          ))}
                                      </div>
                                    }
                                    arrow
                                  >
                                    {row?.universities &&
                                      row?.universities.length > 1 && (
                                        <Chip
                                          size="small"
                                          label={`+${
                                            row?.universities.length - 1
                                          } more`}
                                          sx={{
                                            borderRadius: "6px",
                                            fontWeight: 600,
                                            color: "#29339B",
                                            backgroundColor: "#EBEDFF",
                                          }}
                                        />
                                      )}
                                  </Tooltip>
                                )}
                            </div>
                          ) : (
                            "Not available"
                          )} */}
                          {row?.universities && row?.universities.length > 0 ? (
                            <div
                              className="university-cell"
                              style={{
                                whiteSpace: "nowrap",
                                width: "200px",
                                overflow: "hidden",
                              }}
                            >
                              {row.universities.length === 1 &&
                              row.universities[0] === 0 ? (
                                // Show ALL universities
                                <>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      flexGrow: 1,
                                    }}
                                    noWrap
                                    title={universities[0]?.name}
                                  >
                                    {universities[0]?.name}
                                  </Typography>
                                  {universities.length > 1 && (
                                    <Tooltip
                                      title={
                                        <div className="tooltip-scrollable">
                                          {universities
                                            .slice(1)
                                            .map((uni, index) => (
                                              <List
                                                key={index}
                                                style={{ maxHeight: "100%" }}
                                              >
                                                <ListItem button disablePadding>
                                                  <ListItemText
                                                    primary={uni?.name}
                                                  />
                                                </ListItem>
                                                {index !==
                                                  universities.length - 2 && (
                                                  <Divider
                                                    sx={{
                                                      borderColor: "#FFFFFF1A",
                                                    }}
                                                    component="li"
                                                  />
                                                )}
                                              </List>
                                            ))}
                                        </div>
                                      }
                                      arrow
                                    >
                                      <Chip
                                        size="small"
                                        label={`+${
                                          universities.length - 1
                                        } more`}
                                        sx={{
                                          borderRadius: "6px",
                                          fontWeight: 600,
                                          color: "#29339B",
                                          backgroundColor: "#EBEDFF",
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                // Filter universities
                                (() => {
                                  const filtered = universities.filter((uni) =>
                                    row?.universities?.some(
                                      (d) => d.id === uni?.id
                                    )
                                  );
                                  return (
                                    <>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          flexGrow: 1,
                                        }}
                                        noWrap
                                        title={filtered[0]?.name}
                                      >
                                        {filtered[0]?.name}
                                      </Typography>
                                      {filtered.length > 1 && (
                                        <Tooltip
                                          title={
                                            <div className="tooltip-scrollable">
                                              {filtered
                                                .slice(1)
                                                .map((uni, index) => (
                                                  <List
                                                    key={index}
                                                    style={{
                                                      maxHeight: "100%",
                                                    }}
                                                  >
                                                    <ListItem
                                                      button
                                                      disablePadding
                                                    >
                                                      <ListItemText
                                                        primary={uni?.name}
                                                      />
                                                    </ListItem>
                                                    {index !==
                                                      filtered.length - 2 && (
                                                      <Divider
                                                        sx={{
                                                          borderColor:
                                                            "#FFFFFF1A",
                                                        }}
                                                        component="li"
                                                      />
                                                    )}
                                                  </List>
                                                ))}
                                            </div>
                                          }
                                          arrow
                                        >
                                          <Chip
                                            size="small"
                                            label={`+${
                                              filtered.length - 1
                                            } more`}
                                            sx={{
                                              borderRadius: "6px",
                                              fontWeight: 600,
                                              color: "#29339B",
                                              backgroundColor: "#EBEDFF",
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                    </>
                                  );
                                })()
                              )}
                            </div>
                          ) : (
                            "Not available"
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.created_by?.first_name}{" "}
                          {row?.created_by?.last_name}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            id={`user-manage-list-menu-${index}`}
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
                        colSpan={9}
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
            <div className="pagination-wrapper">
              {/* Rounded Pagination with Next/Previous Buttons */}
              <div className="pagination-buttons">
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
              <div className="form-group-pagination">
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

          {/* Dropdown Menu for Actions */}
          <Menu
            id="user-manage-list-actions"
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
            {manageUserListActions?.length > 0 ? (
              <div>
                {manageUserListActions?.some((lact) => lact.id === 23) && (
                  <MenuItem
                    id="user-manage-edit-btn"
                    onClick={() => handleActionEditClick("Edit")}
                  >
                    {t("profile.edit_btn")}
                  </MenuItem>
                )}
                {manageUserListActions?.some((lact) => lact.id === 24) && (
                  <MenuItem
                    id="user-manage-reset-password-btn"
                    onClick={() => handleResetUser()}
                  >
                    {t("manage_user.mu_reset_pswd")}
                  </MenuItem>
                )}
                {manageUserListActions?.some((lact) => lact.id === 25) && (
                  <MenuItem
                    id="user-manage-status-change-btn"
                    onClick={() => {
                      if (selectedRowDetails?.status === "Active") {
                        handleActionClick("Deactive");
                        // window.alert("Api Peniding!");
                      } else {
                        handleActionClick("Activate");
                      }
                    }}
                  >
                    {selectedRowDetails?.status === "Active"
                      ? t("manage_user.mu_deactive_user")
                      : "Activate user"}
                  </MenuItem>
                )}
              </div>
            ) : (
              <MenuItem>{t("buttons.btn_no_action_allowed")}</MenuItem>
            )}
          </Menu>

          {/* Material-UI Menu */}
          <Menu
            id="user-manage-bulk-action-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {manageUserBulkActions?.some((bact) => bact.id === 26) && (
              <MenuItem
                id="user-manage-import-users"
                onClick={() => handleImportActionClick("import")}
              >
                {t("importuser.importuser_import_users")}
              </MenuItem>
            )}
            {manageUserBulkActions?.some((bact) => bact.id === 27) && (
              <MenuItem id="user-manage-export-users" onClick={() => "export"}>
                {t("importuser.importuser_export_users")}
              </MenuItem>
            )}
          </Menu>
        </div>
      )}

      {/* Modal for Disable or Delete Action */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={modalTitle}
          icon={modalTitle === "Activate" ? Alerticon : CancelIcon}
          content={modalContent}
          actions={modalActions}
        />
      )}

      {isConfirmDisableModalOpen && (
        <ChangeOwners
          isOpen={isConfirmDisableModalOpen}
          onClose={handleConfirmDisableModalClose}
          singleUserData={selectedRowDetails}
          handleDataChange={handleDataChange}
        />
      )}

      {/* Create New User Modal rendering */}
      {isModalUserOpen && (
        <div className="modal-backdrop">
          <CreateUserModal
            onClose={() => {
              setIsModalUserOpen(false);
              setSelectedRow(null);
              setSelectedRowDetails(null);
            }}
            open={isModalUserOpen}
            handleDataChange={handleDataChange}
          />
        </div>
      )}
      {/* Render ImportUserModal modal when importModal is true */}
      {importModal && (
        <div className="modal-backdrop">
          <ImportUserModal
            open={importModal}
            onClose={closeImportModal}
            handleDataChange={handleDataChange}
          />
        </div>
      )}
      {/* Render Editusermodal modal  is true */}
      {editModal && (
        <div className="modal-backdrop">
          <EditUserModal
            open={editOpenModal}
            onClose={closeEditModal}
            selectedUser={selectedRow}
            handleDataChange={handleDataChange}
          />
        </div>
      )}

      {/* ResetUserPassword Component */}
      {isResetPasswordModalOpen && (
        <div className="modal-backdrop">
          <ResetUserPassword
            onClose={closeResetPasswordModal}
            data={selectedRowDetails}
            handleDataChange={handleDataChange}
          />
        </div>
      )}
    </>
  );
};

export default ManageUsers;
