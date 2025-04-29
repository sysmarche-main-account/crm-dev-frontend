"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Avatar,
  Checkbox,
  IconButton,
  Tooltip,
  List,
  ListItem,
  Divider,
  ListItemText,
  Select,
  Button,
  Pagination,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import SearchIcon from "@/images/search.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import Modal from "@/components/common/Modal/Modal";
import { useTranslations } from "next-intl";
import MapRolesModalNew from "./MapRolesModalNew";
import EditMapRolesModal from "./EditMapRolesModal";
import SettingIcon from "@/images/settings.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import NoContent from "@/components/NoContent";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  getAllRolesListAction,
  handleSingleCreateUserMappingAction,
} from "@/app/actions/rolesActions";
import { decryptClient } from "@/utils/decryptClient";
import { useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";

const AssignedRolesTable = ({ open, onClose, bulkDelete, setBulkDelete }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const { permissions } = useSelector((state) => state.user);

  const t = useTranslations();

  const [bigLoading, setBigLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [roleMapData, setRoleMapData] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [debouncedInput, setDebouncedInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For MapRolesModal

  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);

  const [page, setPage] = useState(1); // Current page state
  const [modalSubTitle, setModalSubTitle] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagesData, setPagesData] = useState(null);

  const [actionType, setActionType] = useState("");

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  const getRoleList = async () => {
    setIsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      filter: {
        search_term: searchTerm,
        field_filters: [
          // {
          //   field: "first_name",
          //   value: "",
          // },
          // {
          //   field: "status",
          //   value: 2,
          // },
          // {
          //   field: "reporting_manager",
          //   value: "",
          // },
        ],
      },

      sorting: [
        {
          field: "created_at",
          order: "DESC",
        },
      ],
    };
    try {
      const result = await getAllRolesListAction(csrfToken, reqbody);
      // console.log("all role list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setRoleMapData(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setIsLoading(false);
        setBigLoading(false);
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

  useEffect(() => {
    if (dataChanged) {
      getRoleList();
      handleDataChange();
    }
  }, [dataChanged]);

  useEffect(() => {
    getRoleList();
  }, [page, rowsPerPage, debouncedInput]);

  useEffect(() => {
    if (bulkDelete) {
      if (selectedRows.length === 0) {
        setBulkDelete(!bulkDelete);
        showSnackbar({
          message: t("followup.fup_list_action_alert"),
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
      } else {
        handleActionClick("Bulk Delete");
      }
    }
  }, [bulkDelete]);

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(t("manage_roles.mr_assign_tbl_delmdl_title"));
      if (selectedRowDetails?.users?.length > 0) {
        setModalSubTitle(t("manage_roles.mr_assign_tbl_delmdl_subtitle"));
      } else {
        setModalSubTitle(t("manage_roles.role_assignedrole_delete_subtitle"));
      }
      if (selectedRowDetails?.users?.length > 0) {
        setModalContent(t("manage_roles.mr_assign_tbl_del_mdl_content"));
      } else {
        setModalContent(null);
      }

      if (selectedRowDetails?.users?.length > 0) {
        setModalActions([
          {
            label: t("manage_roles.mr_em_btn_cancel"),
            className: "cancel-button",
            onClick: handleModalClose,
          },
          {
            label: t("manage_roles.mr_tbl_btn_confirm_del"),
            className: "confirm-button",
            onClick: handleConfirmDelete,
          },
        ]);
      } else {
        setModalActions([
          {
            label: t("manage_roles.mr_em_btn_cancel"),
            className: "cancel-button",
            onClick: handleModalClose,
          },
        ]);
      }

      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Bulk Delete") {
      setActionType("Delete");
      setModalTitle(t("manage_roles.mr_assign_tbl_bulkdel_mdl_title"));
      setModalSubTitle(t("manage_roles.mr_assign_tbl_bulkdel_mdl_subtitle"));
      setModalContent(t("manage_roles.mr_assign_tbl_bulkdel_mdl_content"));
      setModalActions([
        {
          label: t("manage_roles.mr_em_btn_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_roles.mr_tbl_btn_confirm_del"),
          className: "confirm-button",
          onClick: handleConfirmBulkDelete,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Edit") {
      setIsEditModalOpen(true); // Open MapRolesModal for Edit action
    }

    handleMenuClose();
  };

  const handleModalClose = () => {
    if (bulkDelete) {
      setBulkDelete(!bulkDelete);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    // console.log(values);
    setIsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_id: selectedRow,
      user_id: [],
    };
    console.log("body", reqbody);
    try {
      const result = await handleSingleCreateUserMappingAction(
        csrfToken,
        reqbody
      );
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setIsLoading(false);
        if (!decrypted?.error) {
          handleModalClose();
          showSnackbar({
            message: `<strong>${selectedRowDetails?.name}</strong> ${t(
              "manage_roles.mr_assign_alert"
            )}`,
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
        setIsLoading(false);
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

  const handleConfirmBulkDelete = async () => {
    // console.log(values);
    setIsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_id: selectedRows,
      user_id: [],
    };
    console.log("body", reqbody);
    try {
      const result = await handleSingleCreateUserMappingAction(
        csrfToken,
        reqbody
      );
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setIsLoading(false);
        showSnackbar({
          message: `<strong>${decrypted.name}</strong> ${t(
            "manage_roles.mr_assign_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
        onClose();
      } else {
        console.error(result.error);
        setIsLoading(false);
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

  const handleMenuClick = (event, role) => {
    setMenuAnchor(event.currentTarget);
    // console.log("gg", role);
    setSelectedRow(role.id);
    setSelectedRowDetails(role);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update searchTerm state on input change
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };

  // Toggle all rows when header checkbox is clicked
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(roleMapData?.data?.map((item) => item?.id)); // Select all
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

  const manageRoleMapListActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 8 && set.parent === 17 && set.details === "list_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
          id="roles-mapping-loading-container"
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
      ) : roleMapData?.data?.length === 0 && roleMapData?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={t("manage_roles.mr_assign_tbl_noncontent")}
          subtitle={t("manage_roles.mr_assign_tbl_noncontent_subtitle")}
        />
      ) : (
        <div
          id="roles-mapping-main-container"
          className="assigned-roles-table"
          style={{ overflow: "hidden", width: "100%" }}
        >
          <div id="roles-mapping-table-header" className="table-header">
            <div id="roles-mapping-search-container" className="search-box">
              <input
                id="roles-mapping-main-search"
                type="text"
                placeholder={t("manage_roles.mr_mu_search_phlsr")}
                value={searchTerm}
                onChange={handleSearchChange} // Handle the search input change
              />
              <button
                id="roles-mapping-main-search-btn"
                className="search-icon"
              >
                <SearchIcon />
              </button>
            </div>
            {/* <button className="filter-button">
              <FilterIcon /> {t("assignedRolesTable.filter_button")}
            </button> */}
          </div>

          <TableContainer
            id="roles-mapping-table-container"
            className="user-table-container"
            style={{ maxHeight: "360px", overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {/* <TableCell style={{ gap: "10px" }}>
                    <Checkbox
                      checked={allSelected}
                      onChange={handleSelectAllClick}
                      style={{ marginRight: "15px" }}
                    />
                    {t("manage_roles.table.columns.university_name")}
                  </TableCell> */}
                  <TableCell style={{ gap: "10px", whiteSpace: "nowrap" }}>
                    <Checkbox
                      id="roles-mapping-select-all-checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      style={{ marginRight: "15px" }}
                    />
                    {t("manage_roles.mr_rm_tbl_col2")}
                    {/* {t("manage_roles.table.columns.university_name")} */}
                  </TableCell>
                  <TableCell>{t("manage_roles.mr_rm_tbl_col3")}</TableCell>
                  {/* <TableCell>
                {t("manage_roles.table.columns.assigned_role")}
              </TableCell> */}
                  <TableCell style={{ textAlign: "center" }}>
                    <SettingIcon />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <CircularProgress size={50} sx={{ color: "#000" }} />
                    </TableCell>
                  </TableRow>
                ) : roleMapData?.data?.length > 0 ? (
                  roleMapData?.data?.map((role, index) => (
                    <TableRow key={role.id}>
                      <TableCell style={{ gap: "10px", whiteSpace: "nowrap" }}>
                        <Checkbox
                          id={`roles-mapping-checkbox-${role?.id}`}
                          style={{ marginRight: "15px" }}
                          checked={selectedRows.includes(role?.id)}
                          onChange={() => handleSelectRow(role?.id)}
                        />
                        {role.name}
                        {/* {role.university} */}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <div
                          id={`roles-mapping-users-container-${role?.id}`}
                          className="assigned-users"
                        >
                          {role?.users?.length > 0 && role?.users?.length <= 5
                            ? role?.users?.map((u) => (
                                <Tooltip
                                  key={u.uuid}
                                  title={`${u.first_name} ${u.last_name}`}
                                  arrow
                                >
                                  <Avatar
                                    className="user-avatar"
                                    src={u.profile_img}
                                    alt={`${u.first_name} ${u.last_name}`}
                                  >
                                    {!u.profile_img &&
                                    u.first_name &&
                                    u.last_name
                                      ? `${u.first_name[0].toUpperCase()}${u.last_name[0].toUpperCase()}`
                                      : null}
                                  </Avatar>
                                </Tooltip>
                              ))
                            : role?.users?.length > 5
                            ? role?.users?.slice(0, 5).map((u) => (
                                <Tooltip
                                  key={u.uuid}
                                  title={`${u.first_name} ${u.last_name}`}
                                  arrow
                                >
                                  <Avatar
                                    className="user-avatar"
                                    src={u.profile_img}
                                    alt={`${u.first_name} ${u.last_name}`}
                                  >
                                    {!u.profile_img &&
                                    u.first_name &&
                                    u.last_name
                                      ? `${u.first_name[0].toUpperCase()}${u.last_name[0].toUpperCase()}`
                                      : null}
                                  </Avatar>
                                </Tooltip>
                              ))
                            : "No users assigned to this role."}
                          <Tooltip
                            title={
                              <div className="tooltip-scrollable">
                                {role?.users?.length > 5
                                  ? role?.users.slice(5).map((u, index) => (
                                      <List key={u.uuid}>
                                        <ListItem button disablePadding>
                                          <Avatar
                                            className="user-avatar"
                                            style={{ marginRight: "5px" }}
                                            src={u.profile_img}
                                            alt={`${u.first_name} ${u.last_name}`}
                                          >
                                            {!u.profile_img &&
                                            u.first_name &&
                                            u.last_name
                                              ? `${u.first_name[0].toUpperCase()}${u.last_name[0].toUpperCase()}`
                                              : null}
                                          </Avatar>
                                          <ListItemText
                                            primary={`${u.first_name} ${u.last_name}`}
                                          />
                                        </ListItem>
                                        {index !== role?.users?.length - 1 && (
                                          <Divider
                                            sx={{ borderColor: "#FFFFFF1A" }}
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
                            {role.users?.length > 5 && (
                              <span className="more-users">
                                +{role?.users?.length - 5} more
                              </span>
                            )}
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell
                        style={{ textAlign: "center", whiteSpace: "nowrap" }}
                      >
                        <IconButton
                          id={`roles-mapping-list-${role?.id}`}
                          onClick={(e) => handleMenuClick(e, role)}
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
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      {t("manage_roles.mr_tbl_no_results")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Pagination and Rows Per Page */}
          <div
            id="roles-mapping-pagination-wrapper"
            className="pagination-wrapper"
          >
            {/* Rounded Pagination with Next/Previous Buttons */}
            <div
              id="roles-mapping-pagination-buttons"
              className="pagination-buttons"
            >
              <Button
                id="roles-mapping-page-back"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outlined"
                className="pagination-button"
                sx={{ marginRight: 2, textTransform: "capitalize" }}
              >
                {t("leads.lm_pagination_back")}
              </Button>

              <Pagination
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
                id="roles-mapping-next"
                onClick={() => setPage(page + 1)}
                disabled={page === pagesData?.total_pages}
                variant="outlined"
                className="pagination-button"
                sx={{ marginLeft: 2, textTransform: "capitalize" }}
              >
                {t("leads.lm_pagination_next")}
              </Button>
            </div>
            {/* Results per page */}
            <div
              id="roles-mapping-pagination-form-group"
              className="form-group-pagination"
            >
              <label>{t("leads.lm_results_per_page")}</label>
              <Select
                id="roles-mapping-noofpages"
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

          {/* Dropdown Menu for Actions */}
          <Menu
            id="roles-mapping-list-actions-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            PaperProps={{
              style: {
                maxHeight: 200,
                width: "20ch",
              },
            }}
          >
            {manageRoleMapListActions?.length > 0 ? (
              <div id="roles-mapping-actions-container">
                {manageRoleMapListActions?.some((act) => act.id === 35) && (
                  <MenuItem
                    id="roles-mapping-edit-btn"
                    onClick={() => handleActionClick("Edit")}
                  >
                    {t("manage_roles.mr_tbl_edit")}
                  </MenuItem>
                )}
                {manageRoleMapListActions?.some((act) => act.id === 36) && (
                  <MenuItem
                    id="roles-mapping-delete-btn"
                    onClick={() => handleActionClick("Delete")}
                  >
                    {t("manage_roles.mr_tbl_del")}
                  </MenuItem>
                )}
              </div>
            ) : (
              <MenuItem>{t("manage_roles.mr_assigntbl_no_action")}</MenuItem>
            )}
          </Menu>
        </div>
      )}
      {/* Modal for Delete Action */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={modalTitle}
          subtitle={modalSubTitle}
          icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
          content={modalContent}
          actions={modalActions}
        />
      )}
      {open && (
        <div id="roles-mapping-modal-backdrop" className="modal-backdrop">
          <MapRolesModalNew
            open={open}
            onClose={onClose}
            handleDataChange={handleDataChange}
          />
        </div>
      )}
      {isEditModalOpen && (
        <div id="roles-mapping-edit-modal-backdrop" className="modal-backdrop">
          <EditMapRolesModal
            open={isEditModalOpen}
            onClose={handleEditModalClose}
            selectedRow={selectedRow} // Pass the selected row data to the modal
            handleDataChange={handleDataChange}
          />
        </div>
      )}
    </>
  );
};

export default AssignedRolesTable;
