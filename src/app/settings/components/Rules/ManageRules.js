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
  Paper,
  MenuItem,
  Pagination,
  Select,
  Button,
  Chip,
  Avatar,
  Stack,
  Menu,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  Divider,
  ListItemText,
  Box,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import SearchIcon from "@/images/search.svg";
import SettingIcon from "@/images/settings.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import CreateRules from "./CreateRules";
import EditRules from "./EditRules";
import useLogout from "@/app/hooks/useLogout";
import { useTranslations } from "next-intl";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useSelector } from "react-redux";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  deleteSingleRuleAction,
  editSingleRuleAction,
  getAllRulesListAction,
} from "@/app/actions/ruleActions";
import { decryptClient } from "@/utils/decryptClient";
import NoContent from "@/components/NoContent";
import Modal from "@/components/common/Modal/Modal";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";

const ManageRules = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const { permissions } = useSelector((state) => state.user);

  const [bigLoading, setBigLoading] = useState(true);
  const [loading, setLoading] = useState({
    data: false,
  });

  const [ruleData, setRuleData] = useState(null);

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filter, setFilter] = useState("All");
  const [filterArray, setFilterArray] = useState([]);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [debouncedInput, setDebouncedInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalRuleOpen, setIsModalRuleOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);

  const [selectedRule, setSelectedRule] = useState(null);

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const [dataChange, setDataChange] = useState(false);

  const handleDataChange = () => setDataChange(!dataChange);

  const getAllRulesData = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
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
          order: "DESC",
        },
      ],
    };
    console.log("body", reqbody);

    try {
      const result = await getAllRulesListAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final rules", decrypted);

        setRuleData(decrypted);
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
    getAllRulesData();
  }, [page, rowsPerPage, debouncedInput, filter]);

  useEffect(() => {
    if (dataChange) {
      getAllRulesData();
      handleDataChange();
    }
  }, [dataChange]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "All") {
      const filteredFilters = filterArray?.filter(
        (item) => item.field !== "status"
      );
      setFilterArray(filteredFilters);
    } else if (newFilter === "Enabled") {
      if (filterArray?.some((item) => item.field === "status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "status" ? { ...item, value: 1 } : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [...prev, { field: "status", value: 1 }]);
      }
    } else if (newFilter === "Disabled") {
      if (filterArray?.some((item) => item.field === "status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "status" ? { ...item, value: 0 } : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [...prev, { field: "status", value: 0 }]);
      }
    }
  };

  const handlePageChange = (event, value) => setPage(value);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };

  const handleMenuClick = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRule(row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(false);
  };

  const handleOpenModal = () => setIsModalRuleOpen(true);
  const editOpenModal = () => setIsEditModal(true);

  const handleActionEditClick = () => {
    setIsEditModal(true);
    setMenuAnchor(false);
  };

  const closeEditModal = () => {
    setIsEditModal(false);
  };

  const handleConfirmDeleteRule = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedRule?.id,
    };

    try {
      const result = await deleteSingleRuleAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setIsModalOpen(false);
        showSnackbar({
          message: `<strong>${selectedRule?.rule_name}</strong> ${t(
            "rules.rule_managerule_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
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

  const handleConfirmDisableEnable = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedRule?.id,
      rule_name: selectedRule?.rule_name,
      university: selectedRule?.university?.id, //refer from master
      program: selectedRule?.program?.id, //refer from master
      source: selectedRule?.source?.id, // refer from master
      course: selectedRule?.course?.id, //refer from master
      start_time: selectedRule?.start_time,
      end_time: selectedRule?.end_time,
      counsellor:
        selectedRule?.counsellor?.map((counsel) => counsel?.uuid) || [], //refer from users
      day: selectedRule?.day?.map((day) => day?.id) || [], //refer from master
      agent: selectedRule?.agent,
      sorting_order: selectedRule?.order,
      status: selectedRule?.status ? 0 : 1,
    };

    console.log("body", reqbody);

    try {
      const result = await editSingleRuleAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setIsModalOpen(false);
        showSnackbar({
          message: `<strong>${decrypted.rule_name}</strong> rule ${
            decrypted?.status ? "enabled" : "disabled"
          } successfully`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
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
        setLoading((prev) => ({ ...prev, submit: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`${t("rules.rule_delete_rule")}?`);
      setModalContent(t("rules.rule_managerule_content"));
      setModalActions([
        {
          label: t("followup.ef_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_user.mu_confirm_btn"),
          className: "confirm-button",
          onClick: handleConfirmDeleteRule,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Disable") {
      setActionType("Disable");
      setModalTitle(`${t("rules.rule_diabalemodel")}?`);
      setModalContent(t("rules.rule_diabalemodel_content"));
      setModalActions([
        {
          label: t("followup.ef_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_user.mu_confirm_btn"),
          className: "confirm-button",
          onClick: handleConfirmDisableEnable,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Disable action
    } else if (action === "Enable") {
      setActionType("Enable");
      setModalTitle(`${t("rules.rule_enable_rule")}?`);
      setModalContent(t("rules.rule_enable_rule_content"));
      setModalActions([
        {
          label: t("followup.ef_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_user.mu_confirm_btn"),
          className: "confirm-button",
          onClick: handleConfirmDisableEnable,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Disable action
    }
    handleMenuClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const manageRulesSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 79 && set.details === "single_action"
    );

  const manageRuleListActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 79 && set.details === "list_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
          id="loading-container"
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
      ) : ruleData?.data?.length === 0 && ruleData?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={"No rules created yet"}
          subtitle={"Create rules to assign leads"}
          buttonText={
            manageRulesSingleActions?.length > 0 &&
            manageRulesSingleActions?.some((act) => act.id === 80) &&
            t("rules.rule_managerule_btn")
          }
          onButtonClick={() => {
            if (
              manageRulesSingleActions?.length > 0 &&
              manageRulesSingleActions?.some((act) => act.id === 80)
            ) {
              handleOpenModal();
            }
          }}
        />
      ) : (
        <div
          id="main-table-container"
          className="table-container"
          style={{ border: "1px solid #ccc" }}
        >
          <div
            id="manager-roles-headers"
            className="manager-roles-headers-roles"
          >
            <div id="role-description" className="role-description-user">
              <h1>{t("rules.rule_managerule_leadassign")}</h1>
              <p>{t("rules.rule_managerule_subheading")}</p>
            </div>
            {manageRulesSingleActions?.length > 0 &&
              manageRulesSingleActions?.some((act) => act.id === 80) && (
                <div id="action-buttons-container" className="action-buttons">
                  <button
                    id="manage-rules-main-create-btn"
                    className="create-role-button"
                    onClick={handleOpenModal}
                  >
                    {t("rules.rule_managerule_btn")}
                  </button>
                </div>
              )}
          </div>
          <div
            id="inner-table-container"
            className="table-container"
            style={{ width: "100%", border: "none" }}
          >
            {/* Filter Buttons */}
            <div id="role-table-parent" className="role-table-parent">
              <div id="filter-buttons-container" className="filter-buttons">
                <button
                  id="manage-rules-filter-alll"
                  onClick={() => handleFilterChange("All")}
                  className={`all-button ${filter === "All" ? "active" : ""}`}
                >
                  {t("manage_roles.mr_tbl_btn")}
                  <span>({pagesData?.total_record})</span>
                </button>
                <button
                  id="manage-rules-filter-enable"
                  onClick={() => handleFilterChange("Enabled")}
                  className={`enable-button ${
                    filter === "Enabled" ? "active" : ""
                  }`}
                >
                  {t("manage_roles.mr_tbl_btn_enabled")}{" "}
                  <span>({pagesData?.total_active})</span>
                </button>
                <button
                  id="manage-rules-disable"
                  onClick={() => handleFilterChange("Disabled")}
                  className={`disabled-button ${
                    filter === "Disabled" ? "active" : ""
                  }`}
                >
                  {t("manage_roles.mr_tbl_btn_disabled")}{" "}
                  <span>({pagesData?.total_inactive})</span>
                </button>
              </div>

              {/* Search Box */}
              <div id="role-search-container" className="role-search">
                <div id="search-box-container" className="search-box">
                  <input
                    id="manage-rules-create-main-search"
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
              style={{ maxHeight: "395px", overflowY: "auto" }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", gap: "10px", width: "180px" }}
                    >
                      {/* <Checkbox style={{ marginRight: "15px" }} /> */}
                      {t("rules.rule_managerule_assignrule")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {" "}
                      {t("rules.rule_university")}{" "}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {" "}
                      {t("rules.rule_managerule_source")}{" "}
                    </TableCell>
                    {/* <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {" "}
                      {t("rules.rule_managerule_progm")}{" "}
                    </TableCell> */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {" "}
                      {t("rules.rules_create_course")}{" "}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {" "}
                      {t("rules.rule_managerule_assignconsulor")}{" "}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {" "}
                      {t("rules.rule_managerule_satus")}{" "}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {" "}
                      <SettingIcon />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading?.data ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        <CircularProgress size={50} sx={{ color: "#000" }} />
                      </TableCell>
                    </TableRow>
                  ) : ruleData?.data.length > 0 ? (
                    ruleData?.data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell
                          style={{
                            whiteSpace: "nowrap",
                            maxWidth: "100px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={row?.rule_name}
                        >
                          {/* <Checkbox style={{ marginRight: "15px" }} /> */}
                          {row?.rule_name}
                        </TableCell>
                        <TableCell
                          style={{
                            whiteSpace: "nowrap",
                            maxWidth: "140px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <span title={row?.university?.name}>
                            {row?.university?.name}
                          </span>
                          {/* <span title={row?.university?.name}>
                            {row?.university?.short_name}
                          </span> */}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {/* {row?.source?.name} */}
                          {row?.source?.length === 0 ? (
                            "-"
                          ) : row?.source?.length === 1 ? (
                            row?.source[0]?.name
                          ) : row?.source?.length > 1 ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              {row?.source[0]?.name}
                              <Tooltip
                                // title={row?.source
                                //   .slice(1) // Get remaining source names
                                //   .map((source) => source.name)
                                //   .join(", ")} // Join names with a comma
                                title={
                                  <div
                                    id={`source-tooltip-${index}`}
                                    className="tooltip-scrollable"
                                  >
                                    {row?.source?.length > 1
                                      ? row?.source
                                          ?.slice(1)
                                          .map((u, index) => (
                                            <List key={u.id}>
                                              <ListItem button disablePadding>
                                                <ListItemText
                                                  primary={u.name}
                                                />
                                              </ListItem>
                                              {index !==
                                                row?.source?.length - 1 && (
                                                <Divider
                                                  sx={{
                                                    borderColor: "#FFFFFF1A",
                                                  }}
                                                  component="li"
                                                />
                                              )}
                                            </List>
                                          ))
                                      : null}
                                  </div>
                                }
                                arrow
                              >
                                <Chip
                                  size="small"
                                  label={`+${row?.source?.length - 1} more`}
                                  sx={{
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    color: "#29339B",
                                    backgroundColor: "#EBEDFF",
                                  }}
                                />
                              </Tooltip>
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        {/* <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.program?.name}
                        </TableCell> */}
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {row?.course?.length === 0 ? (
                            "-"
                          ) : row?.course?.length === 1 ? (
                            row?.course[0]?.name
                          ) : row?.course?.length > 1 ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              {row?.course[0]?.name}
                              <Tooltip
                                // title={row?.course
                                //   .slice(1) // Get remaining course names
                                //   .map((course) => course.name)
                                //   .join(", ")} // Join names with a comma
                                title={
                                  <div
                                    id={`course-tooltip-${index}`}
                                    className="tooltip-scrollable"
                                  >
                                    {row?.course?.length > 1
                                      ? row?.course
                                          ?.slice(1)
                                          .map((u, index) => (
                                            <List key={u.id}>
                                              <ListItem button disablePadding>
                                                <ListItemText
                                                  primary={u.name}
                                                />
                                              </ListItem>
                                              {index !==
                                                row?.course?.length - 1 && (
                                                <Divider
                                                  sx={{
                                                    borderColor: "#FFFFFF1A",
                                                  }}
                                                  component="li"
                                                />
                                              )}
                                            </List>
                                          ))
                                      : null}
                                  </div>
                                }
                                arrow
                              >
                                <Chip
                                  size="small"
                                  label={`+${row?.course?.length - 1} more`}
                                  sx={{
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    color: "#29339B",
                                    backgroundColor: "#EBEDFF",
                                  }}
                                />
                              </Tooltip>
                              {/* {row?.course?.length - 1 > 0 && (
                                
                              )} */}
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ gap: "5px" }}
                          >
                            {row?.counsellor?.length > 0 &&
                            row?.counsellor?.length <= 2
                              ? row?.counsellor?.map((u) => (
                                  <Tooltip
                                    key={u?.uuid}
                                    title={`${u?.name}`}
                                    arrow
                                  >
                                    <Avatar
                                      className="user-avatar"
                                      alt={u.name}
                                      sx={{
                                        bgcolor: "#FAEA7D",
                                        color: "#A18F11",
                                        width: "30px",
                                        height: "30px",
                                        fontSize: "14px",
                                        fontWeight: "400",
                                        gap: "10px",
                                      }}
                                    >
                                      {u.name[0].toUpperCase()}
                                    </Avatar>
                                  </Tooltip>
                                ))
                              : row?.counsellor?.length > 2
                              ? row?.counsellor?.slice(0, 2).map((u) => (
                                  <Tooltip
                                    key={u.uuid}
                                    title={`${u.name}`}
                                    arrow
                                  >
                                    <Avatar
                                      className="user-avatar"
                                      alt={u.name}
                                      sx={{
                                        bgcolor: "#FAEA7D",
                                        color: "#A18F11",
                                        width: "30px",
                                        height: "30px",
                                        fontSize: "14px",
                                        fontWeight: "400",
                                        gap: "10px",
                                      }}
                                    >
                                      {u.name[0].toUpperCase()}
                                    </Avatar>
                                  </Tooltip>
                                ))
                              : "-"}
                            <Tooltip
                              title={
                                <div
                                  id={`counsellor-tooltip-${index}`}
                                  className="tooltip-scrollable"
                                >
                                  {row?.counsellor?.length > 2
                                    ? row?.counsellor
                                        ?.slice(2)
                                        .map((u, index) => (
                                          <List key={u.uuid}>
                                            <ListItem button disablePadding>
                                              <Avatar
                                                className="user-avatar"
                                                style={{ marginRight: "5px" }}
                                                alt={u.name}
                                                sx={{
                                                  bgcolor: "#FAEA7D",
                                                  color: "#A18F11",
                                                  width: "30px",
                                                  height: "30px",
                                                  fontSize: "14px",
                                                  fontWeight: "400",
                                                  gap: "10px",
                                                }}
                                              >
                                                {u?.name[0]?.toUpperCase()}
                                              </Avatar>
                                              <ListItemText primary={u.name} />
                                            </ListItem>
                                            {index !==
                                              row?.counsellor?.length - 1 && (
                                              <Divider
                                                sx={{
                                                  borderColor: "#FFFFFF1A",
                                                }}
                                                component="li"
                                              />
                                            )}
                                          </List>
                                        ))
                                    : null}
                                </div>
                              }
                              arrow
                            >
                              {row?.counsellor?.length > 2 && (
                                <span
                                  id={`more-users-${index}`}
                                  className="more-users"
                                >
                                  <Chip
                                    size="small"
                                    label={`+${
                                      row?.counsellor?.length - 2
                                    } more`}
                                    sx={{
                                      borderRadius: "6px",
                                      fontWeight: 600,
                                      color: "#29339B",
                                      backgroundColor: "#EBEDFF",
                                    }}
                                  />
                                  {/* +{row?.counsellor?.length - 2} more */}
                                </span>
                              )}
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Chip
                            label={row.status ? "Enabled" : "Disabled"}
                            sx={{
                              color: row.status ? "#23A047" : "#F00",
                              backgroundColor: row.status
                                ? "#EAFBEF"
                                : "#FBEFEE",
                              fontWeight: 500,
                              fontSize: 14,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <IconButton
                            id={`manage-rules-list-${row?.name}`}
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
                        colSpan={7}
                        align="center"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                          whiteSpace: "nowrap",
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
                  id="manage-rules-list-back"
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
                  id="manage-rules-list-next"
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
                <label>{t("followup.fuptc_pgn_results")}</label>
                <Select
                  id="manage-rules-list-noofpages"
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

          {/* list actions */}
          <Menu
            id="manage-rules-list-actions-menu"
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
            {manageRuleListActions?.length > 0
              ? [
                  manageRuleListActions &&
                    manageRuleListActions?.some((act) => act.id === 81) && (
                      <MenuItem
                        key="edit"
                        id="manage-rules-list-edit-btn"
                        onClick={() => handleActionEditClick("Edit")}
                      >
                        {" "}
                        {t("manage_roles.mr_tbl_edit")}
                      </MenuItem>
                    ),
                  manageRuleListActions &&
                    manageRuleListActions?.some((act) => act.id === 82) && (
                      <MenuItem
                        key="delete"
                        id="manage-rules-list-delete-btn"
                        onClick={() => handleActionClick("Delete")}
                      >
                        {t("manage_roles.mr_tbl_del")}
                      </MenuItem>
                    ),
                  manageRuleListActions &&
                    manageRuleListActions?.some((act) => act.id === 83) &&
                    (selectedRule && selectedRule?.status ? (
                      <MenuItem
                        key="disable"
                        id="manage-rules-disable-btn"
                        onClick={() => handleActionClick("Disable")}
                      >
                        {t("manage_roles.mr_tbl_disable")}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key="enable"
                        id="manage-rules-enable-btn"
                        onClick={() => handleActionClick("Enable")}
                      >
                        {t("manage_roles.mr_tbl_enable")}
                      </MenuItem>
                    )),
                ].filter(Boolean)
              : [
                  <MenuItem key="no-action">
                    {t("buttons.btn_no_action_allowed")}
                  </MenuItem>,
                ]}
          </Menu>
        </div>
      )}

      {isModalRuleOpen && (
        <div id="modal-backdrop" className="modal-backdrop">
          <CreateRules
            onClose={() => {
              setIsModalRuleOpen(false);
            }}
            open={isModalRuleOpen}
            handleDataChange={handleDataChange}
          />
        </div>
      )}

      {isEditModal && (
        <div id="edit-modal-backdrop" className="modal-backdrop">
          <EditRules
            open={editOpenModal}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
            rule={selectedRule}
          />
        </div>
      )}

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
  );
};

export default ManageRules;
