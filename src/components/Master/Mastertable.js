"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Pagination,
  Select,
  Tab,
  Tabs,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useSelector } from "react-redux";
import {
  getMasterListAction,
  updateMasterStatusAction,
} from "@/app/actions/masterAction";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import Modal from "@/components/common/Modal/Modal";
import SettingIcon from "@/images/settings.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import SearchIcon from "@/images/search.svg";
// import "@/styles/Master.scss";
import CreateUniversity from "./University/CreateUniversity";
import EditUniversity from "./University/EditUniversity";
import CreateChannel from "./Channel/CreateChannel";
import CreateSourceMedium from "./Medium/CreateSourceMedium";
import CreateRoleType from "./RoleType/CreateRoleType";
import CreateCourse from "./Course/CreateCourse";
import CreateReminder from "./Reminder/CreateReminder";
import CreateStage from "./Stage/CreateStage";
import CreateSubStage from "./SubStage/CreateSubStage";
import EditChannel from "./Channel/EditChannel";
import EditSourceMedium from "./Medium/EditSourceMedium";
import EditRoleType from "./RoleType/EditRoleType";
import EditCourse from "./Course/EditCourse";
import EditReminder from "./Reminder/EditReminder";
import EditStage from "./Stage/EditStage";
import EditSubStage from "./SubStage/EditSubStage";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import useLogout from "@/app/hooks/useLogout";
import { useTranslations } from "next-intl";
import { getAllLeadStatusAction } from "@/app/actions/leadActions";
import CreateBrochureLink from "./BrochureLink/CreateBrochureLink";
import EditBrochureLink from "./BrochureLink/EditBrochureLink";
import EditUmsLink from "./UmsLink/EditUmsLink";
import EditProgramLink from "./ProgramLink/EditProgramLink";
import CreateProgramLink from "./ProgramLink/CreateProgramLink";
import CreateUmsLink from "./UmsLink/CreateUmsLink";

const MasterTable = () => {
  const logout = useLogout();
  const t = useTranslations();

  const { showSnackbar } = useSnackbar();
  const { permissions } = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState({
    data: false,
  });

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const [selectedTab, setSelectedTab] = useState("University");
  const [tabData, setTabData] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(null);
  const [editData, setEditData] = useState(null);

  const [selAction, setSelAction] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  // **States for Delete, Enable, Disable Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubtitle, setModalSubtitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const [stageList, setStageList] = useState(null);
  const [subStageList, setSubStageList] = useState(null);

  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page state
  const [pagesData, setPagesData] = useState(null);

  const [dataChange, setDataChange] = useState(false);
  const handleDataChange = () => setDataChange(!dataChange);

  ///////////////////////////////////////////////////////////////

  const fetchMasterTabs = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    try {
      const csrfToken = await getCsrfToken();

      const reqBody = {
        identifier: [selectedTab],
        pagination: {
          page: page,
          per_page: rowsPerPage,
        },
        filter: {
          search_term: searchTerm,
          //   "field_filters": [
          //     {
          //       "field": "status",
          //       "value": "1"
          //     }

          //   ]
        },
        // "sorting": [
        //   {
        //     "field": "name",
        //     "order": "asc"
        //   },
        //   {
        //     "field": "created_at",
        //     "order": "desc"
        //   }
        // ],
      };

      console.log("Request Body:", reqBody);

      // const result = await getMasterDDAction(csrfToken, reqBody);
      const result = await getMasterListAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        setTabData(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setDataChange(false);
        console.log("Decrypted Data for Tab:", selectedTab, decrypted);
        setLoading((prev) => ({ ...prev, data: false }));
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
        setLoading((prev) => ({ ...prev, data: false }));
      }
    } catch (error) {
      console.error(`Unexpected error:`, error);
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  const fetchStageList = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    try {
      const csrfToken = await getCsrfToken();

      const reqBody = {};
      console.log("Request Body:", reqBody);

      // const result = await getMasterDDAction(csrfToken, reqBody);
      const result = await getAllLeadStatusAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        setTabData(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setDataChange(false);
        setLoading((prev) => ({ ...prev, data: false }));
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
        setLoading((prev) => ({ ...prev, data: false }));
      }
    } catch (error) {
      console.error(`Unexpected error:`, error);
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  const fetchSubStageList = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    try {
      const csrfToken = await getCsrfToken();

      const reqBody = {};
      console.log("Request Body:", reqBody);

      // const result = await getMasterDDAction(csrfToken, reqBody);
      const result = await getAllLeadStatusAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        setTabData(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setDataChange(false);
        setLoading((prev) => ({ ...prev, data: false }));
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
        setLoading((prev) => ({ ...prev, data: false }));
      }
    } catch (error) {
      console.error(`Unexpected error:`, error);
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  useEffect(() => {
    fetchMasterTabs();
  }, [selectedTab, page, rowsPerPage, debouncedInput]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  // useEffect(() => {
  //   if (selectedTab === "Stage") {
  //     fetchStageList();
  //   } else if (selectedTab === "Sub Stage") {
  //     fetchSubStageList();
  //   }
  // }, [selectedTab]);

  useEffect(() => {
    if (dataChange) {
      fetchMasterTabs();
    }
  }, [dataChange]);

  const handleTabChange = (event, newTab) => {
    setSelectedTab(newTab);
    setPage(1); // Reset pagination
    setRowsPerPage(10);
  };

  /************Pagination Functions */
  const handlePageChange = (event, value) => setPage(value);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };
  /************* */

  /************✅ Handle Menu Actions */
  const handleMenuOpen = (event, id) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuOpenId(id);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpenId(null);
  };
  /**************** */

  const getCreateButtonText = () => {
    switch (selectedTab) {
      case "University":
        return "Create University";
      case "Channel":
        return "Create Channel";
      // case "Country":
      //   return "Create Country";
      // case "State":
      //   return "Create State";
      // case "District":
      //   return "Create District";
      // case "City":
      //   return "Create City";
      case "Medium":
        return "Create Medium";
      case "Role_Type":
        return "Create Role Type";
      // case "Slot":
      //   return "Create Slot";
      case "Course":
        return "Create Course";
      case "Reminder":
        return "Create Reminder";
      case "Stage":
        return "Create Stage";
      case "Sub Stage":
        return "Create Sub Stage";
      case "Brochure_Link":
        return "Create Brochure_Link";
      case "Ums_Link":
        return "Create Ums_Link";
      case "Program_Link":
        return "Create Program_Link";
      default:
        return "Create Item";
    }
  };

  /***********✅ Handle Create Modal Open */
  const openCreateModal = () => {
    setCreateModalOpen(selectedTab);
  };
  const closeCreateModal = () => {
    setCreateModalOpen(null);
  };
  /************ */

  /***********✅ Handle Edit Modal Open */
  const handleEdit = (tabName, data) => {
    setEditModalOpen(tabName);
    setEditData({ ...data, identifier: selectedTab });
  };
  const closeEditModal = () => {
    setEditModalOpen(null);
    setEditData(null);
  };
  /************ */

  /*********Render Create & Edit Modal */
  const renderCreateModal = () => {
    switch (createModalOpen) {
      case "University":
        return (
          <CreateUniversity
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Channel":
        return (
          <CreateChannel
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Medium":
        return (
          <CreateSourceMedium
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Role_Type":
        return (
          <CreateRoleType
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Course":
        return (
          <CreateCourse
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Reminder":
        return (
          <CreateReminder
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Stage":
        return (
          <CreateStage
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Sub Stage":
        return (
          <CreateSubStage
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Brochure_Link":
        return (
          <CreateBrochureLink
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Program_Link":
        return (
          <CreateProgramLink
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Ums_Link":
        return (
          <CreateUmsLink
            onClose={closeCreateModal}
            handleDataChange={handleDataChange}
          />
        );
      default:
        return null;
    }
  };

  const renderEditModal = () => {
    // const handleSaveEditedData = (updatedData) => {
    //   const updatedTabData = tabData[selectedTab].map((item) =>
    //     item.id === updatedData.id ? updatedData : item
    //   );
    //   setTabData({ ...tabData, [selectedTab]: updatedTabData });
    //   closeEditModal();
    // };
    switch (editModalOpen) {
      case "University":
        return (
          <EditUniversity
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Channel":
        return (
          <EditChannel
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Medium":
        return (
          <EditSourceMedium
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Role_Type":
        return (
          <EditRoleType
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Course":
        return (
          <EditCourse
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Reminder":
        return (
          <EditReminder
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Stage":
        return (
          <EditStage
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Sub Stage":
        return (
          <EditSubStage
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Brochure_Link":
        return (
          <EditBrochureLink
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Program_Link":
        return (
          <EditProgramLink
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      case "Ums_Link":
        return (
          <EditUmsLink
            data={editData}
            onClose={closeEditModal}
            handleDataChange={handleDataChange}
          />
        );
      default:
        return null;
    }
  };
  /********* */

  /*********Status and delete Modals */

  //Close Modal
  const handleModalClose = () => setIsModalOpen(false);

  const confirmEnableDisable = async () => {
    const csrfToken = await getCsrfToken();
    const reqBody = {
      id: selectedItemId?.id,
      status: selectedItemId?.status === 0 ? 1 : 0,
    };
    console.log("Request Body:", reqBody, selectedItemId);

    try {
      const result = await updateMasterStatusAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        showSnackbar({
          message:
            selectedItemId?.status === 0
              ? `${selectedTab} Enabled Successfully`
              : `${selectedTab} Disabled Successfully`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });

        handleDataChange();
        handleModalClose();
        setSelectedItemId(null);
        setActionType(null);
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
      }
    } catch (error) {
      console.error(`Unexpected error:`, error);
    }
  };

  const handleConfirmDelete = () => {
    handleModalClose();
    window.alert("API pending!");
  };

  const handleActionClick = (action) => {
    setSelAction(action);
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`Delete ${selectedTab}?`);
      setModalSubtitle(`Are you sure you want to delete this master item?`);
      setModalContent(
        `The master item will be deleted immediately. Once deleted, the item will not be visible in the CRM.`
      );
      setModalActions([
        {
          label: "Cancel",
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("leads.led_del_btn"),
          className: "confirm-button",
          onClick: handleConfirmDelete,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Disable") {
      setActionType("Disable");
      setModalTitle(`Disable ${selectedTab}?`);
      setModalSubtitle(`Are you sure you want to disable this master item?`);
      setModalContent(
        `The master item will be disabled immediately. Once disabled, the item will not be visible in the CRM.`
      );
      setModalActions([
        {
          label: "Cancel",
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("leads.led_del_btn"),
          className: "confirm-button",
          onClick: confirmEnableDisable,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Enable") {
      setActionType("Enable");
      setModalTitle(`Enable ${selectedTab}?`);
      setModalSubtitle(`Are you sure you want to enable this master item?`);
      setModalContent(
        `The master item will be enabled immediately. Once enabled, the item will be visible in the CRM.`
      );
      setModalActions([
        {
          label: "Cancel",
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("leads.led_del_btn"),
          className: "confirm-button",
          onClick: confirmEnableDisable,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    }
    handleMenuClose();
  };

  /*********** */

  const masterSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 87 && set.details === "single_action"
    );

  const masterListActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 87 && set.details === "list_action"
    );

  const masterBulkActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) => set.parent === 87 && set.details === "bulk_action"
    );

  return (
    <div className="manage-roles-container" style={{ height: "100%" }}>
      <div className="manager-roles-headers">
        <div className="role-description">
          <h1>Master Table</h1>
          <p>Manage and assign masters for your users.</p>
        </div>
        <div className="action-buttons">
          {masterBulkActions?.length > 0 && (
            <button
              id="master-bulk-actions"
              className="action-button"
              onClick={handleMenuClick}
            >
              <SettingIcon />
              Action
            </button>
          )}

          {/* Bulk Menu */}
          <Menu
            id="manage-roles-bulk-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {masterBulkActions?.length > 0 &&
              masterBulkActions?.some((act) => act.id === 91) && (
                <MenuItem
                  id="manage-roles-bulk-delete"
                  onClick={() => {
                    setBulkDelete(!bulkDelete);
                    handleMenuClose();
                  }}
                >
                  Bulk Delete
                </MenuItem>
              )}
          </Menu>

          {masterSingleActions?.length > 0 &&
            masterSingleActions?.some((act) => act.id === 88) && (
              <button
                id="master-create-single-tab"
                className="create-role-button"
                onClick={openCreateModal}
              >
                {getCreateButtonText()}
              </button>
            )}
        </div>
      </div>

      {/* All tabs heads */}
      <div
        className="tabs-container"
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          height: "fit-content",
          scrollbarWidth: "thin",
          borderBottom: "1px solid #e0e0e0",
          marginBottom: "0px",
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          style={{
            minHeight: "40px",
            width: "100%",
          }}
          TabIndicatorProps={{
            style: {
              backgroundColor: "#5654d4",
              height: "3px",
            },
          }}
        >
          {[
            "Stage",
            "Sub Stage",
            "University",
            "Course",
            "Channel",
            "Medium",
            "Reminder",
            "Role_Type",
            "Brochure_Link",
            "Program_Link",
            "Ums_Link",
            // "Country",
            // "State",
            // "District",
            // "City",
            // "Slot",
          ].map((label, index) => (
            <Tab
              key={index}
              label={label}
              value={label}
              style={{
                textTransform: "none",
                fontSize: "14px",
                fontWeight: selectedTab === label ? "bold" : "normal",
                color: selectedTab === label ? "#5654d4" : "#666",
                borderRadius: "8px",
                padding: "8px 16px",
                minWidth: "fit-content",
              }}
            />
          ))}
        </Tabs>
      </div>

      {/* Table display */}
      {isLoading ? (
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
      ) : (
        <div
          className="table-container"
          style={{ width: "100%", border: "none", marginBottom: 5 }}
        >
          {/* Search and Filter section */}
          {/* <div className="role-table-parent"> */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              padding: "0px 5px",
            }}
          >
            {/* Search and Filter section */}
            <div className="role-search">
              <div className="search-box" style={{ margin: "10px 0px" }}>
                <input
                  id={`master-main-search-${selectedTab}`}
                  type="text"
                  placeholder={t("sidebar.search_phldr")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!tabData?.data?.length > 0 || loading.data}
                />
                <button className="search-icon">
                  <SearchIcon />
                </button>
              </div>
            </div>
          </div>

          <TableContainer
            className="user-table-container"
            style={{ maxHeight: "375px", overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Sorting Order</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>
                    {selectedTab === "Reminder" ? "Duration" : "Short Name"}
                  </TableCell>
                  <TableCell>Description</TableCell>
                  {/* {selectedTab === "State" && (
                    <TableCell>Country Name</TableCell>
                  )}
                  {selectedTab === "District" && (
                    <>
                      <TableCell>Country Name</TableCell>
                      <TableCell>State Name</TableCell>
                    </>
                  )}
                  {selectedTab === "City" && (
                    <>
                      <TableCell>Country Name</TableCell>
                      <TableCell>State Name</TableCell>
                      <TableCell>District Name</TableCell>
                    </>
                  )} */}
                  {selectedTab === "Course" && (
                    <>
                      <TableCell>University Short Name</TableCell>
                    </>
                  )}
                  {selectedTab === "Medium" && (
                    <>
                      <TableCell>Channel Name</TableCell>
                    </>
                  )}
                  {selectedTab === "Sub Stage" && (
                    <>
                      <TableCell>Status Name</TableCell>
                    </>
                  )}
                  <TableCell>Status</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <SettingIcon />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading?.data ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        selectedTab === "Course" ||
                        selectedTab === "Sub Stage" ||
                        selectedTab === "Medium"
                          ? 7
                          : 6
                      }
                      align="center"
                      style={{ padding: "20px", textAlign: "center" }}
                    >
                      <CircularProgress size={50} sx={{ color: "#000" }} />
                    </TableCell>
                  </TableRow>
                ) : tabData && tabData?.data?.length > 0 ? (
                  tabData?.data?.map((row, index) => (
                    <TableRow key={row.id || index}>
                      {/* <TableCell>{row.identifier}</TableCell> */}
                      <TableCell>{row.sorting_order || "-"}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.short_name || "-"}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      {/* {selectedTab === "State" && (
                        <TableCell>{row.country_name}</TableCell>
                      )}
                      {selectedTab === "District" && (
                        <>
                          <TableCell>{row.country_name}</TableCell>
                          <TableCell>{row.state_name}</TableCell>
                        </>
                      )}
                      {selectedTab === "City" && (
                        <>
                          <TableCell>{row.country_name}</TableCell>
                          <TableCell>{row.state_name}</TableCell>
                          <TableCell>{row.district_name}</TableCell>
                        </>
                      )} */}
                      {selectedTab === "Course" && (
                        <>
                          <TableCell>
                            {row?.parent?.short_name || "-"}
                          </TableCell>
                        </>
                      )}
                      {selectedTab === "Medium" && (
                        <>
                          <TableCell>{row?.parent?.name || "-"}</TableCell>
                        </>
                      )}
                      {selectedTab === "Sub Stage" && (
                        <>
                          <TableCell>{row.stage_name}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <Chip
                          label={row.status ? "Enabled" : "Disabled"}
                          // className={`status-chip ${row.status.toLowerCase()}`}
                          sx={{
                            color: row.status ? "#23A047" : "#F44336",
                            backgroundColor: row.status ? "#EAFBEF" : "#F9EFF1",
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                          size="small"
                          // variant="outlined"
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <IconButton
                          onClick={(e) => {
                            handleMenuOpen(e, row.id);
                            setSelectedItemId(row);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchorEl}
                          open={menuOpenId === row.id}
                          onClose={handleMenuClose}
                        >
                          {/* Edit Option */}
                          {masterListActions?.length > 0 &&
                            masterListActions?.some(
                              (action) => action.id === 89
                            ) && (
                              <MenuItem
                                onClick={() => {
                                  handleMenuClose();
                                  handleEdit(selectedTab, row);
                                }}
                              >
                                Edit
                              </MenuItem>
                            )}

                          {/* Dynamic Enable/Disable Option */}
                          {masterListActions?.length > 0 && row.status === 1 ? (
                            <MenuItem
                              onClick={() => {
                                handleMenuClose();
                                handleActionClick("Disable");
                              }}
                            >
                              Disable
                            </MenuItem>
                          ) : (
                            <MenuItem
                              onClick={() => {
                                handleMenuClose();
                                handleActionClick("Enable");
                              }}
                            >
                              Enable
                            </MenuItem>
                          )}

                          {/* Delete Option */}
                          {masterListActions?.length > 0 &&
                            masterListActions?.some(
                              (action) => action.id === 90
                            ) && (
                              <MenuItem
                                onClick={() => {
                                  handleMenuClose();
                                  handleActionClick("Delete");
                                }}
                              >
                                Delete
                              </MenuItem>
                            )}

                          {masterListActions?.length === 0 && (
                            <MenuItem>No actions allowed</MenuItem>
                          )}
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    {/* Dynamic colSpan to match TableHead */}
                    <TableCell
                      colSpan={
                        4 + // Identifier, Name, Description, and Status
                        // (selectedTab === "State" ? 1 : 0) + // Country Name
                        // (selectedTab === "District" ? 2 : 0) + // Country Name, State Name
                        // (selectedTab === "City" ? 3 : 0) + // Country Name, State Name, District Name
                        (selectedTab === "Course" ? 1 : 0) + // University Name
                        (selectedTab === "Sub Stage" ? 1 : 0) + // Status Name
                        (selectedTab === "Medium" ? 1 : 0) + // Medium Name
                        1 // Actions
                      }
                      style={{ textAlign: "center" }}
                    >
                      No Data Available
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
                id="roles-manage-role-table-page-back"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outlined"
                sx={{ marginRight: 2, textTransform: "capitalize" }}
              >
                Back
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
                id="roles-manage-role-table-page-next"
                onClick={() => setPage(page + 1)}
                // disabled={page === totalPages}
                disabled={page === pagesData?.total_pages}
                variant="outlined"
                sx={{ marginLeft: 2, textTransform: "capitalize" }}
              >
                Next
              </Button>
            </div>
            {/* Results per page */}
            <div className="form-group-pagination">
              <label>{t("leads.lm_results_per_page")}</label>
              <Select
                id="roles-manage-role-table-page-noofpages"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                // // label={t("leads.lm_results_per_page")}
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

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={modalTitle}
          subtitle={modalSubtitle}
          icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
          content={modalContent}
          actions={modalActions}
        />
      )}

      {/* Render Dynamic Modal */}
      {renderCreateModal()}
      {renderEditModal()}
    </div>
  );
};

export default MasterTable;
