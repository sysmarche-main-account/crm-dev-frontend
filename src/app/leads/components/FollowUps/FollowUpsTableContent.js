import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  MenuItem,
  Select,
  Pagination,
  Button,
  Menu,
  IconButton,
  Chip,
  CircularProgress,
  Box,
} from "@mui/material";
import SettingIcon from "@/images/settings.svg";
import SearchIcon from "@/images/search.svg";
import ChevronDown from "@/images/chevron-down.svg";
import MoreVertIcon from "@/images/more_icon.svg";
import ArrarySortIcon from "@/images/arrow-sort.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import EditFollow from "./EditFollow";
import FollowUpsModalForMultipleUsers from "./FollowUpsModalForMultipleUsers";
import { useTranslations } from "next-intl";
import { DateRangePicker } from "rsuite";
import FollowUpDirectModal from "./FollowUpDirectModal";
import { DateRange } from "@mui/icons-material";
import Modal from "@/components/common/Modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  deletFollowupAction,
  getAllFollowupsAction,
} from "@/app/actions/followupActions";
import { masterDDAction } from "@/app/actions/commonActions";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import NoContent from "@/components/NoContent";
import { getReportingUserListAction } from "@/app/actions/userActions";
import CreateFollow from "./CreateFollow";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import { singleLeadDetailsAction } from "@/app/actions/leadActions";
import { handleCallAction } from "@/app/actions/communicationAction";
import FollowUpActionModal from "./FollowUpActionModal";
import { useSearchParams, useRouter } from "next/navigation";
import { resetDash } from "@/lib/slices/dashboardSlice";

const FollowUpsTableContent = ({ setShowSelectOption }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const router = useRouter();
  const dispatch = useDispatch();

  const { permissions, details } = useSelector((state) => state.user);
  const { reporting, start, end } = useSelector((state) => state.dashboard);

  const dates = ["Created date", "Follow-up date"];

  const [bigLoading, setBigLoading] = useState(true);

  const [loading, setLoading] = useState({
    data: false,
    modeList: false,
    reporting: false,
  });
  const [followups, setFollowups] = useState(null);
  const [modeList, setModeList] = useState(null);
  const [reportingList, setReportingList] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [debouncedInput, setDebouncedInput] = useState("");
  const [filter, setFilter] = useState("All"); // State to track the filter
  const [filterArray, setFilterArray] = useState([]);
  const [selectedFollowUpMode, setSelectedFollowUpMode] = useState("");
  const [ownerSelect, setOwnerSelect] = useState([]);
  const [modeSelect, setModeSelect] = useState("");

  const [anchorEl, setAnchorEl] = useState(null); // State for Menu anchor element
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [actionAnchor, setActionAnchor] = useState(null);

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isFollowUpsModalOpen, setIsFollowUpsModalOpen] = useState(false);

  const [selectedFollowup, setSelectedFollowup] = useState("");

  const [dateType, setDateType] = useState("Created date");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRangeValue, setDateRangeValue] = useState([]);

  const [sortConfig, setSortConfig] = useState([
    {
      field: "created_at",
      order: "DESC",
    },
  ]);
  const [sortedRows, setSortedRows] = useState([]);

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const [leadDetails, setLeadDetails] = useState(null);

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const getModeList = async () => {
    setLoading((prev) => ({ ...prev, modeList: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["sub_activity"], // mandatory input will be an array
      // parent_id: 119, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setModeList(decrypted);
        setLoading((prev) => ({ ...prev, modeList: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, modeList: false }));
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
          if (errValues?.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues?.length > 0) {
            errValues?.map((errmsg) =>
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
      setLoading((prev) => ({ ...prev, modeList: false }));
    }
  };

  const getFollowupList = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        page: page,
        per_page: rowsPerPage,
      },
      filter: {
        search_term: searchTerm,
        owner: ownerSelect ? ownerSelect : "",
        action_status: filter,
        date_filters: [
          {
            field:
              dateType === "Created date"
                ? "created_at"
                : "follow_up_date_time",
            from: startDate,
            to: endDate,
          },
        ],
        field_filters: [
          // ...(filterArray.length > 0 ? filterArray : []),
          ...(modeSelect
            ? [{ field: "follow_up_mode", value: modeSelect }]
            : []),
        ],
      },
      sorting: sortConfig,
      // sorting: [
      //   {
      //     field: "created_at",
      //     order: "DESC",
      //   },
      // ],
    };
    console.log("followup table body", reqbody);

    try {
      const result = await getAllFollowupsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("finalFollowup", decrypted);

        setFollowups(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setLoading((prev) => ({ ...prev, data: false }));
        setBigLoading(false);
        if (decrypted?.data?.length > 0 && decrypted?.total_record > 0) {
          setShowSelectOption(true);
        }
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
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, data: false }));
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
      setLoading((prev) => ({ ...prev, reporting: false }));
    }
  };

  const getLeadDetails = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedFollowup?.lead_id,
    };
    try {
      const result = await singleLeadDetailsAction(csrfToken, reqbody);
      // console.log("reporting user DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("lead details", decrypted);

        setLeadDetails(decrypted);
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

  useEffect(() => {
    getAllReportingUsers();
    getModeList();
  }, [from]);

  useEffect(() => {
    if (dataChanged) {
      getFollowupList();
      handleDataChange();
    }
  }, [dataChanged]);

  useEffect(() => {
    getFollowupList();
  }, [
    debouncedInput,
    page,
    rowsPerPage,
    filter,
    modeSelect,
    ownerSelect,
    startDate,
    endDate,
    dateType,
    sortConfig,
  ]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  useEffect(() => {
    if (selectedFollowup) {
      getLeadDetails();
    }
  }, [selectedFollowup]);

  useEffect(() => {
    if (selectedFollowup && selectedFollowUpMode === "call" && leadDetails) {
      handleCall();
    }
  }, [selectedFollowup, selectedFollowUpMode, leadDetails]);

  // Handle dashboardFollowup context
  useEffect(() => {
    if (reporting) {
      setOwnerSelect(reporting);
    }

    if (from === "dashboardFollowup") {
      if (start) setStartDate(start);
      if (end) setEndDate(end);
      if (start && end) {
        setDateRangeValue([new Date(start), new Date(end)]);
      }
      setFilter("delayed");
      setFilterArray({ field: "action_status", value: "delayed" });
    }
  }, [from, reporting, start, end]);

  // Navigation on from change
  useEffect(() => {
    if (from) {
      router.replace("/leads");
    }
  }, [from]);

  useEffect(() => {
    return () => {
      dispatch(resetDash());
    };
  }, []);

  const handleSort = (field) => {
    const existingSort = sortConfig?.find((config) => config.field === field);
    console.log("existingSort", existingSort);
    if (existingSort) {
      if (existingSort.order === "DESC") {
        existingSort.order = "ASC";
      } else {
        existingSort.order = "DESC";
      }
      setSortConfig([existingSort]);
    } else {
      setSortConfig((prev) => [...prev, { field: field, order: "DESC" }]);
    }

    setPage(1); // Reset to the first page after sorting
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter.toLowerCase()); // Set the filter based on clicked button

    if (newFilter === "All") {
      const filteredFilters = filterArray?.filter(
        (item) => item.field !== "action_status"
      );
      setFilterArray(filteredFilters);
    } else if (newFilter.toLowerCase() === "to-do") {
      if (filterArray?.some((item) => item.field === "action_status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "action_status" ? { ...item, value: "todo" } : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [
          ...prev,
          { field: "action_status", value: "todo" },
        ]);
      }
    } else if (newFilter.toLowerCase() === "delayed") {
      console.log("test", filterArray);
      if (filterArray?.some((item) => item.field === "action_status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "action_status" ? { ...item, value: "delayed" } : item
        );
        console.log("test", updateFilter);
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [
          ...prev,
          { field: "action_status", value: "delayed" },
        ]);
      }
    } else if (newFilter.toLowerCase() === "completed") {
      if (filterArray?.some((item) => item.field === "action_status")) {
        const updateFilter = filterArray?.map((item) =>
          item.field === "action_status"
            ? { ...item, value: "completed" }
            : item
        );
        setFilterArray(updateFilter);
      } else {
        setFilterArray((prev) => [
          ...prev,
          { field: "action_status", value: "completed" },
        ]);
      }
    }
  };

  // Filter the leads based on the current filter and search term
  // const filteredfollowups = followups.filter((item) => {
  //   const matchesFilter =
  //     filter === "All" ||
  //     item.status === filter ||
  //     (modeSelect !== "Follow-up mode" &&
  //       item.followUpMode.toLowerCase() === filter);
  //   const matchesSearch = item.name
  //     .toLowerCase()
  //     .includes(searchTerm.toLowerCase());
  //   return matchesFilter && matchesSearch;
  // });

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleMenuClose = () => {
    setMenuAnchor(false);
  };

  const handleAnchorMenuClose = () => {
    setAnchorEl(false);
  };

  const handleMenuClick = (event, followup) => {
    setMenuAnchor(event.currentTarget);
    setSelectedFollowup(followup);
  };

  const openEditFollowModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditFollowModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditFollowup = () => {
    openEditFollowModal();
    handleMenuClose();
  };

  const openFollowUpsModal = () => {
    setIsFollowUpsModalOpen(true);
  };

  const closeFollowUpsModal = () => {
    setIsFollowUpsModalOpen(false);
  };

  // const handleFollowups = () => {
  //   openFollowUpsModal();
  //   handleMenuClose();
  // };

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`${t("followup.fup_del_title")}?`);
      setModalContent(t("followup.fup_del_content"));
      setModalActions([
        {
          label: t("profile.cancel_btn"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("followup.fup_del_btn"),
          className: "confirm-button",
          onClick: handleConfirmDelete,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "Bulk Delete") {
      console.log("selected Rows", selectedRows);
      if (selectedRows.length === 0) {
        showSnackbar({
          message: "Select follow-ups first",
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        return;
      }
      setActionType("Delete");
      setModalTitle(`${t("followup.fup_del_title")}?`);
      setModalContent(t("followup.fup_del_content"));
      setModalActions([
        {
          label: t("profile.cancel_btn"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("followup.fup_del_btn"),
          className: "confirm-button",
          onClick: handleConfirmBulkDelete,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Bulk Delete action
    }
    handleMenuClose();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    // const newFollowupArr = followups?.filter(
    //   (row) => row?.id !== selectedFollowup?.id
    // );
    // setFollowups(newFollowupArr);
    // setIsModalOpen(false);
    // handleDataChange();
    const csrfToken = await getCsrfToken();
    const reqbody = {
      follow_up_id: [selectedFollowup?.id],
    };
    console.log("body", reqbody);
    try {
      const result = await deletFollowupAction(csrfToken, reqbody);
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final followup delete", decrypted);

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

  const handleConfirmBulkDelete = async () => {
    // const newFollowupArr = followups?.filter(
    //   (row) => row?.id !== selectedFollowup?.id
    // );
    // setFollowups(newFollowupArr);
    // setIsModalOpen(false);
    // handleDataChange();

    const csrfToken = await getCsrfToken();
    const reqbody = {
      follow_up_id: selectedRows,
    };
    console.log("body", reqbody);
    try {
      const result = await deletFollowupAction(csrfToken, reqbody);
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final followup delete", decrypted);

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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");

  useEffect(() => {
    if (dateRangeValue && dateRangeValue?.length > 1) {
      const formattedStartdate = new Date(
        dateRangeValue[0]
      )?.toLocaleDateString("en-CA");
      const formattedEnddate = new Date(dateRangeValue[1])?.toLocaleDateString(
        "en-CA"
      );
      setStartDate(formattedStartdate);
      setEndDate(formattedEnddate);
    }
  }, [dateRangeValue]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows(followups?.data?.map((user) => user?.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Toggle individual row selection
  const handleRowSelect = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };
  const allSelected =
    followups?.data?.length > 0 &&
    selectedRows?.length === followups?.data?.length;

  // Function to close the modal
  const closeModal = () => {
    setSelectedFollowUpMode(null); // Reset the follow-up mode to close the modal
  };

  const getVirtualNumber = async (uniId) => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["virtual_number"], // mandatory input will be an array
      parent_id: uniId, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final virtual", decrypted);

        return decrypted;
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
      console.error("Unexpected error:", error);
    }
  };

  const handleCall = async () => {
    if (!leadDetails?.mobile_number) {
      showSnackbar({
        message: "Mobile number not available",
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    }
    const csrfToken = await getCsrfToken();
    const virtualNumber = await getVirtualNumber(
      leadDetails?.university_interested?.id
    );
    const reqbody = {
      // provider_id: "q2e7fc61-0fac-5b26-84eb-e0f0d3d676bd", // optional
      user_id: details?.uuid,
      from: details?.mobile_number, // mandatory
      // to: [selectedLead?.mobile_number], // mandatory
      to: [`${leadDetails?.mobile_number}`], // mandatory
      virtual_number: virtualNumber[0]?.name, // mandatory
      lead_id: selectedFollowup?.lead_id, //mandatory
      follow_up_id: selectedFollowup?.id, //optional
      // custom_field: "bilbo_test_call", // optional
    };
    console.log("call", reqbody);

    try {
      const result = await handleCallAction(csrfToken, reqbody);
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final call", decrypted);

        if (!decrypted?.error && decrypted?.transaction_id) {
          showSnackbar({
            message: "Call Initated, please check your phone!",
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
        setLeadDetails(null);
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

  const openModal = (mode) => {
    // console.log(mode, "followUpMode");
    // if (mode?.toLowerCase() === "call") {
    //   handleCall();
    // } else {
    //   setSelectedFollowUpMode(mode);
    // }
    setSelectedFollowUpMode(mode);
  };

  const getModalConfig = (followUpMode) => {
    switch (followUpMode) {
      case "whatsapp":
        return {
          title: `${t("followup.fuptc_follow_up_action")} (WhatsApp)`,
          radioOptions: [
            {
              value: `${leadDetails?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${leadDetails?.alternate_mobile_number}`,
              label: "Alternate Number",
              color: "green",
            },
          ],
        };
      case "email":
        return {
          title: `${t("followup.fuptc_follow_up_action")} (Email)`,
          radioOptions: [
            {
              value: `${leadDetails?.email}`,
              label: t("followup.fup_tbl_mdlconf_chekbox"),
              color: "green",
            },
            {
              value: `${leadDetails?.alternate_email}`,
              label: t("followup.fup_tbl_chekbox"),
              color: "#7d7d7d",
            },
          ],
        };
      case "sms":
        return {
          title: `${t("followup.fuptc_follow_up_action")} (SMS)`,
          radioOptions: [
            {
              value: `${leadDetails?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${leadDetails?.alternate_mobile_number}`,
              label: "Alternate Number",
              color: "green",
            },
          ],
        };
      default:
        return {};
    }
  };

  const handleMenuClickModal = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const openFollowActionModal = () => {
    setActionAnchor(true);
  };
  const closeFollowActionModal = () => {
    setActionAnchor(null);
    setSelectedFollowup(null);
  };

  const followupBulkActions =
    permissions?.leadActions &&
    permissions?.leadActions.filter(
      (set) => set.parent === 39 && set.details === "bulk_action"
    );

  const followupListActions =
    permissions?.leadActions &&
    permissions?.leadActions.filter(
      (set) => set.parent === 39 && set.details === "list_action"
    );

  return (
    <>
      {bigLoading ? (
        <div
          id="followup-table-loading-container"
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
      ) : followups?.data?.length === 0 && followups?.total_record === 0 ? (
        <NoContent
          illustration={EmptyRoles}
          title={"No Follow ups created yet!"}
          subtitle={"Create followups for a lead."}
          // buttonText={"Create new User"}
          // onButtonClick={handleOpenModal}
        />
      ) : (
        <div
          id="followup-table-main-container"
          className="toggle-view__content"
        >
          <div
            id="followup-table-inner-container"
            className="table-container manage-roles-container"
          >
            <div
              id="followup-table-header-container"
              className="manager-roles-headers-roles"
              style={{ padding: "10px 0 0 20px" }}
            >
              <div
                id="followup-table-title-container"
                className="role-description-user"
              >
                <h1>{t("followup.fupcal_title")}</h1>
                <p>{t("followup.fupcal_descr")}</p>
              </div>
              <div
                id="followup-table-action-buttons"
                className="action-buttons"
              >
                {followupBulkActions && followupBulkActions?.length > 0 && (
                  <button
                    id="followup-table-settings-btn"
                    className="action-button"
                    onClick={handleMenuClickModal}
                  >
                    <SettingIcon />
                    {t("leads.lm_action_btn")}
                  </button>
                )}
                {/* {followupSingleActions &&
              followupSingleActions?.length > 0 &&
              followupSingleActions?.some((act) => act.id === 50) && (
                <button
                  className="create-role-button"
                  onClick={openCreateFollowModal}
                >
                  {t("followup.fupcal_create_btn")}
                </button>
              )} */}
              </div>
            </div>
            <div id="followup-table-lead-parent" className="table-lead-parent">
              <div
                id="followup-table-role-parent"
                className="role-table-parent"
                style={{ width: "100%" }}
              >
                <div
                  id="followup-table-search-container"
                  className="role-search"
                >
                  <div id="followup-table-search-box" className="search-box">
                    <input
                      id="followup-table-main-search"
                      type="text"
                      placeholder={t("followup.fupcal_search_phldr")}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      id="followup-table-search-btn"
                      className="search-icon"
                    >
                      <SearchIcon />
                    </button>
                  </div>
                </div>
                <div
                  id="followup-table-selection-container"
                  className="follow-up-selection"
                >
                  {/* followup modes */}
                  <div
                    id="followup-table-modes-container"
                    className="form-group"
                    style={{ marginBottom: "0" }}
                  >
                    <Select
                      id="followup-table-modes"
                      value={loading?.modeList ? "loading" : modeSelect}
                      onChange={(e) => {
                        setModeSelect(e.target.value);
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      style={{
                        width: "152px",
                        height: "32px",
                        fontSize: "14px",
                      }}
                    >
                      <MenuItem value="">{t("followup.fup_cal_dd")}</MenuItem>
                      {loading?.modeList ? (
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
                      ) : modeList?.length === 0 || !modeList ? (
                        <MenuItem disabled>
                          {t("followup.fup_create_dd")}
                        </MenuItem>
                      ) : (
                        modeList?.length > 0 &&
                        modeList?.map((mode) => (
                          <MenuItem key={mode.id} value={mode.id}>
                            {mode.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                  {/* Reporting user */}
                  <div
                    id="followup-table-reporting-container"
                    className="form-group"
                    style={{ marginBottom: "0" }}
                  >
                    {/* <Select
                  id="followup-table-reporting-user"
                  value={loading?.reporting ? "loading" : ownerSelect}
                  onChange={(e) => setOwnerSelect(e.target.value)}
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
                      <MenuItem
                        key={reporting?.uuid}
                        value={reporting?.uuid}
                      >
                        {reporting?.first_name} {reporting?.last_name}
                      </MenuItem>
                    ))
                  )}
                </Select> */}
                    <Select
                      multiple
                      value={loading?.reporting ? ["loading"] : ownerSelect}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value.includes("")) {
                          setOwnerSelect([]);
                        } else {
                          setOwnerSelect(value);
                        }
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      style={{
                        width: "132px",
                        height: "32px",
                        fontSize: "14px",
                      }}
                      renderValue={(selected) =>
                        selected.length === 0 ? (
                          t("leads.select_reporting_user")
                        ) : selected.includes("loading") ? (
                          <Box display="flex" alignItems="center">
                            <CircularProgress
                              size={20}
                              color="#000"
                              sx={{ marginRight: 1 }}
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        ) : (
                          reportingList
                            ?.filter((rep) => selected.includes(rep?.uuid))
                            .map(
                              (rep) => `${rep?.first_name} ${rep?.last_name}`
                            )
                            .join(", ")
                        )
                      }
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
                          <MenuItem
                            key={reporting?.uuid}
                            value={reporting?.uuid}
                          >
                            <Checkbox
                              // checked={selReported.indexOf(reporting?.uuid) > -1}
                              checked={ownerSelect.includes(reporting?.uuid)}
                            />
                            {reporting?.first_name} {reporting?.last_name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="followup-table-filter-container"
              className="date-range-selector-follow-ups"
            >
              <div
                id="followup-table-filter-buttons"
                className="filter-buttons-follow-ups"
              >
                <button
                  id="followup-table-filter-all"
                  onClick={() => handleFilterChange("All")}
                  className={`filter-button-follow-up-module ${
                    filter === "All" ? "active" : ""
                  }`}
                >
                  {t("followup.fuptc_all")}
                  <span>({followups?.filter_count || 0})</span>
                </button>
                <button
                  id="followup-table-filter-todo"
                  onClick={() => handleFilterChange("todo")}
                  className={`filter-button-follow-up-module ${
                    filter === "todo" ? "active" : ""
                  }`}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("followup.fuptc_todo")}
                  <span>({followups?.todo_count || 0})</span>
                </button>
                <button
                  id="followup-table-filter-delayed"
                  onClick={() => handleFilterChange("delayed")}
                  className={`filter-button-follow-up-module ${
                    filter === "delayed" ? "active" : ""
                  }`}
                >
                  {t("followup.fuptc_delayed")}
                  <span>({followups?.delayed_count || 0})</span>
                </button>
                <button
                  id="followup-table-filter-completed"
                  onClick={() => handleFilterChange("completed")}
                  className={`filter-button-follow-up-module ${
                    filter === "completed" ? "active" : ""
                  }`}
                >
                  {t("followup.fuptc_completed")}
                  <span>({followups?.completed_count || 0})</span>
                </button>
              </div>
              <div
                id="followup-table-date-range-container"
                className="date-range-picker-follow-ups"
              >
                <Select
                  id="followup-table-date-type"
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value)}
                  displayEmpty
                  IconComponent={ChevronDown}
                  fullWidth
                  style={{ width: "132px", height: "32px", fontSize: "14px" }}
                >
                  {dates.map((date, index) => (
                    <MenuItem
                      key={index}
                      value={date}
                      style={{ fontSize: "14px" }}
                    >
                      {date}
                    </MenuItem>
                  ))}
                </Select>
                <DateRangePicker
                  id="followup-table-date-calendar"
                  appearance="subtle"
                  value={dateRangeValue}
                  onChange={setDateRangeValue}
                  placement="bottomEnd"
                  showHeader={false}
                  ranges={[]}
                  placeholder="dd-mm-yy - dd-mm-yy"
                  format="dd/MM/yy"
                  character=" – "
                  onOk={(val) => console.log("val", val)}
                  onClean={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  caretAs={DateRange}
                  locale={{ ok: "Done" }}
                />
              </div>
            </div>
            {/* Fixed height for the table container */}
            <TableContainer
              id="followup-table-container"
              className="user-table-container"
              style={{ maxHeight: "360px", overflowY: "auto" }}
            >
              <Table
                id="followup-table-main"
                aria-label="Follow ups Table"
                className="user-table-content"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Checkbox
                        id="followup-table-header-checkbox"
                        style={{ marginRight: "15px" }}
                        checked={allSelected}
                        onChange={handleSelectAll}
                      />{" "}
                      {t("followup.cf_lead_lab")}
                      <span
                        id="followup-table-name-sort"
                        className="follow-up-move"
                        onClick={() => handleSort("full_name")}
                      >
                        <ArrarySortIcon />
                      </span>{" "}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("followup.create_followup_createdate")}
                      <span
                        className="follow-up-move"
                        onClick={() => {
                          console.log("hit");
                          handleSort("created_at");
                          id = "followup-table-created-date-sort";
                        }}
                      >
                        <ArrarySortIcon />
                      </span>{" "}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("followup.cf_mode_lab")}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {t("followup.cf_description_lab")}
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "nowrap", width: "400px" }}
                      colSpan={5}
                    >
                      {t("followup.create_followup_date")}
                      <span
                        id="followup-table-followup-date-sort"
                        className="follow-up-move"
                        onClick={() => handleSort("follow_up_date_time")}
                      >
                        <ArrarySortIcon />{" "}
                      </span>{" "}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading?.data ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        <CircularProgress size={50} sx={{ color: "#000" }} />
                      </TableCell>
                    </TableRow>
                  ) : followups?.data?.length > 0 ? (
                    followups?.data?.map((fol) => (
                      <TableRow key={fol?.id}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <div
                            id={`followup-table-row-${fol?.id}-lead`}
                            className="user_name"
                            style={{ gap: "10px", justifyContent: "left" }}
                          >
                            <div
                              id={`followup-table-row-${fol?.id}-status`}
                              // className={`status-${fol?.follow_status?.toLowerCase()}`}
                              className={`followup-status-border-table`}
                              style={{
                                borderLeft: `5px solid ${
                                  fol?.action_status.toLowerCase() === "todo"
                                    ? "#29339B" // Blue
                                    : fol?.action_status.toLowerCase() ===
                                      "completed"
                                    ? "#008000" // Green
                                    : fol?.action_status.toLowerCase() ===
                                      "delayed"
                                    ? "#ff0000" // Red
                                    : "#000" // Default fallback
                                }`,
                              }}
                            />
                            <Checkbox
                              id={`followup-table-followup-check-${fol?.id}`}
                              style={{ marginLeft: "-4px" }}
                              checked={selectedRows.includes(fol?.id)}
                              onChange={() => handleRowSelect(fol?.id)}
                            />{" "}
                            {fol?.lead_name?.full_name}
                          </div>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(fol?.created_at)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Chip
                            id={`followup-table-row-${fol?.id}-mode`}
                            label={fol?.follow_up_mode?.name}
                            sx={{
                              backgroundColor: "#EBFFF7",
                              color: "#009358",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell
                          id={`followup-table-row-${fol?.id}-description`}
                          style={{
                            whiteSpace: "nowrap",
                            maxWidth: "250px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <span title={fol?.details}>{fol?.details}</span>
                        </TableCell>
                        <TableCell
                          id={`followup-table-row-${fol?.id}-date`}
                          sx={{
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderLeft: "0 !important",
                            borderRight: "0 !important",
                            borderTop: "0 !important",
                            height: "42px",
                          }}
                          colSpan={5}
                        >
                          <span>{formatDate(fol?.follow_up_date_time)}</span>

                          {fol?.action_status.toLowerCase() !== "completed" ? (
                            <div
                              id={`followup-table-row-${fol?.id}-actions`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              {/* <button
                            color="success"
                            variant="contained"
                            size="small"
                            className="follow-button"
                            style={{
                              background:
                                "linear-gradient(180deg, #00BC70 0%, #06C175 79.91%, #20D48B 100%)",
                              boxShadow:
                                "0px -2px 2px 0.5px #009056 inset, 0px 0px 2px 1.5px #FFFFFF1A inset",
                            }}
                            onClick={() => {
                              setSelectedFollowup(fol);
                              openModal(
                                fol?.follow_up_mode?.name?.toLowerCase()
                              );
                            }}
                          >
                            {fol?.follow_up_mode?.name?.toLowerCase() ===
                              "call" && <CallIcon />}
                            {fol?.follow_up_mode?.name?.toLowerCase() ===
                              "sms" && <MessageIcon />}
                            {fol?.follow_up_mode?.name?.toLowerCase() ===
                              "email" && <EmailIcon />}
                            {fol?.follow_up_mode?.name?.toLowerCase() ===
                              "whatsapp" && <Social />}
                          </button> */}
                              <button
                                id={`followup-table-followup-actual-btn-${fol?.id}`}
                                variant="contained"
                                size="small"
                                className="follow-button"
                                onClick={() => {
                                  setSelectedFollowup(fol);
                                  openModal(
                                    fol?.follow_up_mode?.name?.toLowerCase()
                                  );
                                }}
                                // onClick={() => {
                                //   openFollowActionModal();
                                //   setSelectedFollowup(fol);
                                // }}
                              >
                                {t("manage_user.mu_action_btn")}
                                {/* {t("followup.follow_up_btn")} */}
                              </button>
                            </div>
                          ) : (
                            <></>
                          )}

                          {fol?.action_status.toLowerCase() !== "completed" && (
                            <IconButton
                              id={`followup-table-followup-menu-btn-${fol?.id}`}
                              onClick={(e) => handleMenuClick(e, fol)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        id="followup-table-no-results"
                        colSpan={5}
                        align="center"
                        style={{ textAlign: "center", padding: "30px" }}
                      >
                        {t("followup.fuptc_no_results")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination Component */}
            <div
              id="followup-table-pagination-container"
              className="pagination-wrapper"
            >
              {/* Rounded Pagination with Next/Previous Buttons */}
              <div
                id="followup-table-pagination-buttons"
                className="pagination-buttons"
              >
                <Button
                  id="followup-table-followup-pagination-back"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outlined"
                  sx={{ marginRight: 2, textTransform: "capitalize" }}
                >
                  {t("followup.fuptc_back")}
                </Button>
                <Pagination
                  id="followup-table-pagination-main"
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
                  id="followup-table-followup-pagination-next"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagesData?.total_pages}
                  variant="outlined"
                  sx={{ marginLeft: 2, textTransform: "capitalize" }}
                >
                  {t("followup.fuptc_next")}
                </Button>
              </div>
              {/* Results per page */}
              <div
                id="followup-table-pagination-perpage"
                className="form-group-pagination"
              >
                <label>{t("followup.fuptc_pgn_results")} </label>
                <Select
                  id="followup-table-followup-pagination-records"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  label={t("followup.fuptc_pgn_results")}
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

            {/* List action Menu */}
            <Menu
              id="followup-table-action-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  maxHeight: 400,
                  width: "20ch",
                },
              }}
            >
              {followupListActions?.length > 0 ? (
                <div id="followup-table-action-menu-items">
                  {followupListActions?.some((act) => act.id === 51) && (
                    <MenuItem
                      id="followup-table-followup-edit"
                      onClick={handleEditFollowup}
                    >
                      {t("followup.fuptc_edit")}
                    </MenuItem>
                  )}
                  {followupListActions?.some((act) => act.id === 106) && (
                    <MenuItem
                      id="followup-table-followup-edit"
                      onClick={() => {
                        handleMenuClose();
                        openFollowActionModal();
                      }}
                    >
                      {t("followup.fupdm_title")}
                    </MenuItem>
                  )}
                  {followupListActions?.some((act) => act.id === 52) && (
                    <MenuItem
                      id="followup-table-followup-delete"
                      onClick={() => handleActionClick("Delete")}
                    >
                      {t("followup.fuptc_del")}
                    </MenuItem>
                  )}
                </div>
              ) : (
                <MenuItem>{t("buttons.btn_no_action_allowed")}</MenuItem>
              )}
              {/* <MenuItem onClick={handleFollowups}>Follow-ups</MenuItem> */}
            </Menu>

            {/* Bulk Action Menu */}
            <Menu
              id="followup-table-bulk-action-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleAnchorMenuClose}
            >
              {followupBulkActions?.some((act) => act.id === 53) && (
                <MenuItem
                  id="followup-table-followup-bulk-delete"
                  onClick={() => {
                    handleAnchorMenuClose();
                    handleActionClick("Bulk Delete");
                  }}
                >
                  {t("followup.fup_tbl_bulkactn")}
                </MenuItem>
              )}
            </Menu>

            {/* Modals */}
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
            {isEditModalOpen && (
              <div id="followup-table-edit-modal" className="modal-backdrop">
                <EditFollow
                  onClose={closeEditFollowModal}
                  data={selectedFollowup}
                  handleDataChange={handleDataChange}
                />
              </div>
            )}
            {isFollowUpsModalOpen && (
              <div
                id="followup-table-multi-user-modal"
                className="modal-backdrop"
              >
                <FollowUpsModalForMultipleUsers
                  onClose={closeFollowUpsModal}
                  data={selectedFollowup}
                  followups={followups}
                  setFollowups={setFollowups}
                />
              </div>
            )}
            {selectedFollowUpMode && selectedFollowUpMode !== "call" && (
              <div id="followup-table-direct-modal" className="modal-backdrop">
                <FollowUpDirectModal
                  {...getModalConfig(selectedFollowUpMode)}
                  type={selectedFollowUpMode}
                  lead={selectedFollowup?.lead_id}
                  leadDetails={leadDetails}
                  followupId={selectedFollowup?.id}
                  onClose={closeModal}
                />
              </div>
            )}
            {actionAnchor && (
              <div id="followup-table-action-modal" className="modal-backdrop">
                <FollowUpActionModal
                  onClose={closeFollowActionModal}
                  lead={selectedFollowup?.lead_id}
                  data={selectedFollowup}
                  handleDataChange={handleDataChange}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FollowUpsTableContent;
