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
  Menu,
  MenuItem,
  Select,
  Button,
  Pagination,
  Chip,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import SearchIcon from "@/images/search.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import Modal from "@/components/common/Modal/Modal";
import { useTranslations } from "next-intl";
import CreateRoleModalNew from "./CreateRoleModalNew";
import EditRoleModal from "./EditRoleModal";
import SettingIcon from "@/images/settings.svg";
import NoContent from "@/components/NoContent";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  getAllRolesListAction,
  getTemplateDataAction,
  handleBulkDisableRoleAction,
  handleDeleteRoleAction,
  handleDisableRoleAction,
} from "@/app/actions/rolesActions";
import { decryptClient } from "@/utils/decryptClient";
import { useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import ChangeRoles from "./ChangeRoles";

export default function RoleTable({
  isModalOpenCreate,
  closeModal,
  bulkDisable,
  bulkEnable,
  bulkDelete,
  setBulkDisable,
  setBulkEnable,
  setBulkDelete,
  openModal,
}) {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  if (!openModal) {
    return null;
  }

  const { permissions } = useSelector((state) => state.user);

  const t = useTranslations();

  const [bigLoading, setBigLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState(null);
  const [templateData, setTemplateData] = useState(null);

  const [debouncedInput, setDebouncedInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterArray, setFilterArray] = useState([]);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubTitle, setModalSubTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For MapRolesModal

  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page state
  const [pagesData, setPagesData] = useState(null);

  const [allSelected, setAllSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [disableOpen, setDisableOpen] = useState(false);

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const getTemplateData = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    try {
      const result = await getTemplateDataAction(csrfToken, reqbody);
      // console.log("user template data result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final template", decrypted);
        setTemplateData(decrypted);
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
        setTemplateData([]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setTemplateData([]);
    }
  };

  useEffect(() => {
    getTemplateData();
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  const getAllRoleList = async () => {
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
      const result = await getAllRolesListAction(csrfToken, reqbody);
      // console.log("all role list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        setRows(decrypted);
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
      getAllRoleList();
      handleDataChange();
    }
  }, [dataChanged]);

  useEffect(() => {
    getAllRoleList();
  }, [page, rowsPerPage, debouncedInput, filter]);

  useEffect(() => {
    if (bulkDisable) {
      if (selectedRows.length === 0) {
        showSnackbar({
          message: t("followup.fup_list_action_alert"),
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
      } else {
        handleActionClick("Bulk Disable");
      }
    }
  }, [bulkDisable]);

  useEffect(() => {
    if (bulkEnable) {
      if (selectedRows.length === 0) {
        showSnackbar({
          message: t("followup.fup_list_action_alert"),
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
      } else {
        handleActionClick("Bulk Enable");
      }
    }
  }, [bulkEnable]);

  useEffect(() => {
    if (bulkDelete) {
      if (selectedRows.length === 0) {
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

  const handleMenuClick = (event, row) => {
    setMenuAnchor(event.currentTarget);
    setSelectedRow(row?.id);
    setSelectedRowDetails(row);
    console.log("row", row);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedRow(null);
  };

  const handleActionClick = (action) => {
    if (action === "Disable") {
      setModalTitle(t("manage_roles.mr_disable_role_title"));
      setModalSubTitle(t("manage_roles.mr_disable_role_subtitle"));
      // setModalContent(t("manage_roles.mr_tbl_disable_content"));
      setModalActions([
        {
          label: t("manage_roles.mr_tbl_btn_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_roles.mr_tbl_btn_disable"),
          className: "confirm-button",
          onClick: handleConfirmDisable,
        },
      ]);
    } else if (action === "Enable") {
      setModalTitle(t("manage_roles.mr_rt_enable_title"));
      setModalSubTitle(t("manage_roles.mr_rtbl_subtitle"));
      setModalContent(t("manage_roles.mr_rtbl_content"));
      setModalActions([
        {
          label: t("manage_roles.mr_tbl_btn_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: "Confirm Enable",
          className: "confirm-button",
          onClick: handleConfirmEnable,
        },
      ]);
    } else if (action === "Bulk Disable") {
      setModalTitle(t("manage_roles.mr_bulk_disable_role"));
      setModalSubTitle(`${t("manage_roles.mr_bulk_diable_subtitle")}?`);
      // setModalContent(t("manage_roles.mr_bulk_diable_content"));
      setModalActions([
        {
          label: t("manage_roles.mr_tbl_btn_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_roles.mr_tbl_btn_disable"),
          className: "confirm-button",
          onClick: handleConfirmbulkDisable,
        },
      ]);
    } else if (action === "Bulk Enable") {
      setModalTitle(t("manage_roles.mr_tbl_bulkenb_title"));
      setModalSubTitle(`${t("manage_roles.mr_tbl_bulkenb_subtitle")}?`);
      setModalContent(t("manage_roles.mr_tbl_bulkenb_content"));
      setModalActions([
        {
          label: t("manage_roles.mr_tbl_btn_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_roles.mr_tbl_enable"),
          className: "confirm-button",
          onClick: handleConfirmbulkEnable,
        },
      ]);
    } else if (action === "Delete") {
      setModalTitle(t("manage_roles.mr_tbl_del_role"));
      setModalSubTitle(t("manage_roles.mr_tbl_del_role_subtitle"));
      setModalContent(t("manage_roles.mr_tbl_del_role_content"));
      setModalActions([
        {
          label: t("manage_roles.mr_tbl_btn_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_roles.mr_tbl_btn_confirm_del"),
          className: "confirm-button",
          onClick: handleConfirmDelete,
        },
      ]);
    } else if (action === "Bulk Delete") {
      setModalTitle(t("manage_roles.mr_tbl_del_role"));
      setModalSubTitle(t("manage_roles.mr_tbl_del_role_subtitle"));
      setModalContent(t("manage_roles.mr_tbl_del_role_content"));
      setModalActions([
        {
          label: t("manage_roles.mr_tbl_btn_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("manage_roles.mr_tbl_btn_confirm_del"),
          className: "confirm-button",
          onClick: handleConfirmbulkDelete,
        },
      ]);
    } else if (action === "Edit") {
      setIsEditModalOpen(true); // Open MapRolesModal for Edit action
    } else {
      console.log(`${action} clicked for row:`, selectedRow);
    }

    // Open the modal for Disable or Delete or Bulk Disable actions
    if (
      (action === "Disable" && selectedRowDetails?.users?.length === 0) ||
      action === "Delete" ||
      action === "Bulk Delete" ||
      action === "Bulk Disable" ||
      action === "Bulk Enable" ||
      action === "Enable"
    ) {
      setIsModalOpen(true);
    } else if (action === "Disable" && selectedRowDetails?.users?.length > 0) {
      setDisableOpen(true);
    }
    setMenuAnchor(null);
    // handleMenuClose();
  };

  const handleModalClose = () => {
    if (bulkDisable) {
      setBulkDisable(!bulkDisable);
    } else if (bulkEnable) {
      setBulkEnable(!bulkEnable);
    } else if (bulkDelete) {
      setBulkDelete(!bulkDelete);
    }
    setIsModalOpen(false);
  };

  const handleConfirmEnable = async () => {
    // console.log("Role disabled:", selectedRow);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: 1,
      id: [selectedRow],
    };

    //Logic to disable role
    try {
      const result = await handleDisableRoleAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        showSnackbar({
          message: `<strong>${decrypted[0].name}</strong> ${t(
            "manage_roles.mr_tbl_enable_alert"
          )}`,
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

  const handleConfirmDisable = async () => {
    // console.log("Role disabled:", selectedRow);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: [selectedRow],
    };

    //Logic to disable role
    try {
      const result = await handleDisableRoleAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        showSnackbar({
          message: `<strong>${decrypted[0].name}</strong> ${t(
            "manage_roles.mr_tbl_disable_alert"
          )}`,
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

  const handleConfirmbulkEnable = async () => {
    // console.log("Role disabled:", selectedRow);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: 1,
      id: selectedRows,
    };

    //Logic to disable role
    try {
      const result = await handleBulkDisableRoleAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        showSnackbar({
          message: `<strong>${decrypted.length}</strong> ${t(
            "manage_roles.mr_tbl_bulk_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        setBulkEnable(!bulkEnable);
        setSelectedRows([]);
        handleDataChange();
        setIsModalOpen(false);
      } else {
        console.error(result.error);
        setBulkEnable(!bulkEnable);
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
      setBulkEnable(!bulkEnable);
      setIsModalOpen(false);
    }
  };

  const handleConfirmbulkDisable = async () => {
    // console.log("Role disabled:", selectedRow);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedRows,
    };

    //Logic to disable role
    try {
      const result = await handleBulkDisableRoleAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        showSnackbar({
          message: `<strong>${decrypted.length}</strong> ${t(
            "manage_roles.mr_tbl_bulkdiable_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        setBulkDisable(!bulkDisable);
        setSelectedRows([]);
        handleDataChange();
        setIsModalOpen(false);
      } else {
        console.error(result.error);
        setBulkDisable(!bulkDisable);
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
      setBulkDisable(!bulkDisable);
      setIsModalOpen(false);
    }
  };

  const handleConfirmbulkDelete = async () => {
    console.log("Role disabled:", selectedRow);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_id: selectedRows,
    };

    console.log("reqbody", reqbody);

    //Logic to disable role
    try {
      const result = await handleDeleteRoleAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final delete", decrypted);

        showSnackbar({
          message: `<strong>${selectedRows?.length}</strong> ${t(
            "manage_roles.mr_bulkdel_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        setSelectedRows([]);
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

  const handleEditModalClose = () => setIsEditModalOpen(false);

  const handleConfirmDelete = async () => {
    // console.log("Role disabled:", selectedRow);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_id: [selectedRow],
    };

    console.log("reqbody", reqbody);

    //Logic to disable role
    try {
      const result = await handleDeleteRoleAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final delete", decrypted);

        showSnackbar({
          message: t("manage_roles.mr_tbl_dele_alert"),
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        setSelectedRows([]);
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

  const handleCreateModalClose = () => setCreateModalOpen(false);

  const handlePageChange = (event, value) => setPage(value);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };

  // Handle the header "Select All" checkbox
  const handleSelectAllClick = () => {
    setAllSelected(!allSelected);
    if (!allSelected) {
      // If selecting all, add all row indexes to selectedRows
      setSelectedRows(rows?.data?.map((role) => role.id));
    } else {
      // If deselecting all, clear selectedRows
      setSelectedRows([]);
    }
  };

  // Handle individual row selection
  const handleRowSelect = (index) => {
    const isSelected = selectedRows.includes(index);
    const newSelectedRows = isSelected
      ? selectedRows.filter((rowIndex) => rowIndex !== index)
      : [...selectedRows, index];

    setSelectedRows(newSelectedRows);
    setAllSelected(newSelectedRows.length === rows?.data?.length);
  };

  const manageRoleListActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 8 && set.parent === 16 && set.details === "list_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
          id="roles-manage-role-table-loading-container"
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
      ) : rows?.length === 0 && rows?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={t("sidebar.no_role_title")}
          subtitle={t("manage_roles.mr_tbl_noncontent")}
        />
      ) : (
        <div
          id="roles-manage-role-table-main-container"
          className="table-container"
          style={{ width: "100%", border: "none" }}
        >
          {/* Buttons for All, Enabled, Disabled */}
          <div
            id="roles-manage-role-table-parent"
            className="role-table-parent"
          >
            <div
              id="roles-manage-role-table-filter-buttons"
              className="filter-buttons"
            >
              <button
                id="roles-manage-role-table-all-filter"
                onClick={() => handleFilterChange("All")}
                className={`all-button ${filter === "All" ? "active" : ""}`}
              >
                {t("manage_roles.mr_tbl_btn")}{" "}
                <span>({pagesData?.total_record})</span>
              </button>
              <button
                id="roles-manage-role-table-active-filter"
                onClick={() => handleFilterChange("Enabled")}
                className={`enable-button ${
                  filter === "Enabled" ? "active" : ""
                }`}
              >
                {t("manage_roles.mr_tbl_btn_enabled")}{" "}
                <span>({pagesData?.total_active}</span>)
              </button>
              <button
                id="roles-manage-role-table-disabled"
                onClick={() => handleFilterChange("Disabled")}
                className={`disabled-button ${
                  filter === "Disabled" ? "active" : ""
                }`}
              >
                {t("manage_roles.mr_tbl_btn_disabled")}
                <span>({pagesData?.total_inactive})</span>
              </button>
            </div>

            {/* Search and Filter section */}
            <div
              id="roles-manage-role-table-search-container"
              className="role-search"
            >
              <div
                id="roles-manage-role-table-search-box"
                className="search-box"
              >
                <input
                  id="roles-manage-role-table-main-search"
                  type="text"
                  placeholder={t("manage_roles.mr_mu_search_phlsr")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  id="roles-manage-role-table-search-button"
                  className="search-icon"
                >
                  <SearchIcon />
                </button>
              </div>
            </div>
          </div>
          {/* Table */}
          <TableContainer
            id="roles-manage-role-table-container"
            className="user-table-container"
            style={{ maxHeight: "360px", overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ gap: "10px", width: "200px", whiteSpace: "nowrap" }}
                  >
                    {/* <Checkbox
                      id="roles-manage-role-table-all-checkbox"
                      checked={allSelected}
                      onChange={handleSelectAllClick}
                      style={{ marginRight: "15px" }}
                    /> */}
                    {t("manage_roles.mr_role_name")}
                  </TableCell>
                  <TableCell>{t("manage_roles.mr_tbl_despr")}</TableCell>
                  <TableCell>{t("manage_roles.mr_tbl_status")}</TableCell>
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
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      <CircularProgress size={50} sx={{ color: "#000" }} />
                    </TableCell>
                  </TableRow>
                ) : !isLoading && rows?.data?.length > 0 ? (
                  rows?.data?.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell
                        style={{
                          gap: "10px",
                          whiteSpace: "nowrap",
                          maxWidth: "145px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {/* <Checkbox
                          id={`roles-manage-role-table-${row?.id}`}
                          style={{ marginRight: "15px" }}
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleRowSelect(row.id)}
                        /> */}
                        <span title={row?.name}>{row.name}</span>
                      </TableCell>
                      <TableCell
                        style={{
                          whiteSpace: "nowrap",
                          maxWidth: "500px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span title={row.description ?? "Not available"}>
                          {row.description ?? "Not available"}
                        </span>
                      </TableCell>
                      <TableCell
                        style={{ whiteSpace: "nowrap", maxWidth: 100 }}
                      >
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
                      <TableCell
                        style={{ textAlign: "center", whiteSpace: "nowrap" }}
                      >
                        <IconButton
                          id={`roles-manage-role-table-list-${row?.id}`}
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
            id="roles-manage-role-table-pagination-wrapper"
            className="pagination-wrapper"
          >
            {/* Rounded Pagination with Next/Previous Buttons */}
            <div
              id="roles-manage-role-table-pagination-buttons"
              className="pagination-buttons"
            >
              <Button
                id="roles-manage-role-table-page-back"
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
                id="roles-manage-role-table-page-next"
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
              id="roles-manage-role-table-pagination-form-group"
              className="form-group-pagination"
            >
              <label>{t("leads.lm_results_per_page")}</label>
              <Select
                id="roles-manage-role-table-page-noofpages"
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
            id="roles-manage-role-table-list-actions"
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
            {manageRoleListActions?.length > 0 ? (
              <div id="roles-manage-role-table-actions-container">
                {manageRoleListActions?.some((act) => act.id === 29) && (
                  <MenuItem
                    id="roles-manage-role-table-edit-btn"
                    onClick={() => handleActionClick("Edit")}
                  >
                    {t("manage_roles.mr_tbl_edit")}
                  </MenuItem>
                )}
                {manageRoleListActions?.some((act) => act.id === 30) && (
                  <MenuItem
                    id="roles-manage-role-table-status-change-btn"
                    onClick={() => {
                      selectedRowDetails?.status
                        ? handleActionClick("Disable")
                        : handleActionClick("Enable");
                    }}
                  >
                    {selectedRowDetails?.status
                      ? t("manage_roles.mr_tbl_disable")
                      : t("manage_roles.mr_tbl_enable")}
                  </MenuItem>
                )}
                {/* {manageRoleListActions?.some((act) => act.id === 31) && (
                  <MenuItem onClick={() => handleActionClick("Delete")}>
                    {t("manage_roles.mr_tbl_del")}
                  </MenuItem>
                )} */}
              </div>
            ) : (
              <MenuItem>{t("manage_roles.mr_assigntbl_no_action")}</MenuItem>
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
          subtitle={modalSubTitle}
          icon={modalTitle === "Delete role?" ? DeleteIcon : CancelIcon}
          content={modalContent}
          actions={modalActions}
        />
      )}

      {isModalOpenCreate && templateData && (
        <CreateRoleModalNew
          open={isModalOpenCreate}
          onClose={closeModal}
          templateData={templateData}
          handleDataChange={handleDataChange}
        />
      )}

      {/* Create Role Modal for Editing */}
      {isEditModalOpen && templateData && (
        <EditRoleModal
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          templateData={templateData}
          selectedRow={selectedRow}
          handleDataChange={handleDataChange}
        />
      )}

      {disableOpen && (
        <ChangeRoles
          isOpen={disableOpen}
          onClose={() => setDisableOpen(false)}
          data={selectedRowDetails}
          handleDataChange={handleDataChange}
          DisableModalOpen={() => setIsModalOpen(true)}
        />
      )}
    </>
  );
}
