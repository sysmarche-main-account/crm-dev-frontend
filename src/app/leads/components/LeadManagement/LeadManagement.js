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
  MenuItem,
  Select,
  Menu,
  Snackbar,
  Alert,
  Pagination,
  Button,
  Chip,
  Box,
  Collapse,
  Typography,
  CircularProgress,
  Popover,
} from "@mui/material";
import MoreVertIcon from "@/images/more_icon.svg";
import SettingIcon from "@/images/settings.svg";
import SearchIcon from "@/images/search.svg";
import ChevronDown from "@/images/chevron-down.svg";
import ChevronDownUpdate from "@/images/chevron-down-update.svg";
import Social from "@/images/Socials.svg";
import CallIcon from "@/images/phone-call-01.svg";
import EmailIcon from "@/images/email.svg";
import MessageIcon from "@/images/message-chat-01.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import AddIcon from "@/images/add-square.svg";
import RemoveIcon from "@/images/remove-square.svg";
import EmptyRoles from "@/images/empty-roles.svg";
import ActivityClock from "@/images/activityClock.svg";
// import "@/styles/LeadManagement.scss";
// import "@/styles/ManageRoles.scss";
import { useTranslations } from "next-intl";
import CreateSingleLead from "./CreateSingleLead";
import { DateRangePicker } from "rsuite";
import { DateRange, Refresh, Sync } from "@mui/icons-material";
import EditSingleLead from "./EditSingleLead";
import LeadDetails from "./LeadDetails";
import { useActiveComponent } from "@/app/(context)/ActiveComponentProvider";
import { setLead, setSingleLeadDisplay } from "@/lib/slices/leadSlice";
import Modal from "@/components/common/Modal/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLeadsAction,
  getAllLeadStatusAction,
  getLeadDetailsforLeadCount,
  singleLeadDeleteAction,
} from "@/app/actions/leadActions";
import { decryptClient } from "@/utils/decryptClient";
import CreateFollow from "../FollowUps/CreateFollow";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getReportingUserListAction } from "@/app/actions/userActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import NoContent from "@/components/NoContent";
import ImportLeads from "@/app/leads/components/LeadManagement/ImportLeads";
import FollowUpDirectModal from "../FollowUps/FollowUpDirectModal";
import { getToken } from "@/utils/getToken";
import { rowsPerPageOptions } from "@/utils/rowsPerPageOptions";
import BulkChangeOwnerModal from "./BulkChangeOwnerModal";
import { handleCallAction } from "@/app/actions/communicationAction";
import { masterDDAction } from "@/app/actions/commonActions";
import ActivityModal from "./ActivityModal";
import DraggableList from "@/components/DraggableList";
import { setUserFull } from "@/lib/slices/columnSlice";
import StageChangeModal from "./StageChangeModal";
import SingleChangeOwnerModal from "./SingleChangeOwnerModal";
import { useSearchParams, useRouter } from "next/navigation";
import { resetDash } from "@/lib/slices/dashboardSlice";

const LeadManagement = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const router = useRouter();

  const dates = [
    { name: "Created date", value: "created_at" },
    { name: "Modified date", value: "updated_at" },
  ];

  const closedStatus = [
    "Enrolled",
    // "Enrollment from lead",
    // "Enrollment from walk-in",
    // "Enrollment from reference",
  ];

  const { permissions, details } = useSelector((state) => state.user);
  const { singleLeadDisplay } = useSelector((state) => state.lead);
  const { defaultSet, userSet } = useSelector((state) => state.column);
  const { stage, reporting, start, end } = useSelector(
    (state) => state.dashboard
  );

  console.log("slice", stage, reporting, start, end);

  const { handleMenuClick } = useActiveComponent();
  const dispatch = useDispatch();

  const [bigLoading, setBigLoading] = useState(true);

  const [expandedRows, setExpandedRows] = useState({});

  const [anchorEl, setAnchorEl] = useState(null); // State for Menu anchor element

  const [columnAnchorEl, setColumnAnchorEl] = useState(null); // Customize column

  const [loading, setLoading] = useState({
    uni: false,
    alleads: false,
    leadHistory: false,
    stages: false,
    reporting: false,
  });
  const [universities, setUniversities] = useState([]);
  const [leads, setLeads] = useState(null);
  const [oldLeads, setOldLeads] = useState(null);
  const [stageOptions, setStageOptions] = useState(null);
  const [subStageOptions, setSubStageOptions] = useState(null);
  const [reportingList, setReportingList] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterArray, setFilterArray] = useState([]);

  const [viewLead, setViewLead] = useState(null);

  const [dateType, setDateType] = useState("created_at");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [leadAnchor, setLeadAnchor] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // *state to handle create followup modal.

  const [openLeadModal, setOpenLeadModal] = useState(false);

  const [openEditLeadModal, setOpenEditLeadModal] = useState(false);

  const [openImportLeadsModal, setOpenImportLeadsModal] = useState(false);

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [placement, setPlacement] = useState("bottomEnd");

  const [pagesData, setPagesData] = useState(null);
  const [page, setPage] = useState(1); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedLead, setSelectedLead] = useState(null);
  const [selected, setSelected] = useState([]); // State to track selected rows

  const [selStage, setSelStage] = useState([]);
  const [selReported, setSelReported] = useState([]);
  const [selUni, setSelUni] = useState("");

  const [singleChangeOwnerModal, setSingleChangeOwnerModal] = useState(false);
  const [bulkChangeOwnerModal, setBulkChangeOwnerModal] = useState(false);

  const [selectedFollowUpMode, setSelectedFollowUpMode] = useState("");

  const [selAction, setSelAction] = useState("");

  const [refresh, setRefresh] = useState(false);

  const [activityModal, setActivityModal] = useState(false);

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const [leadColumns, setLeadColumns] = useState(null);

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
        if (details?.university?.includes(0)) {
          setUniversities(decrypted);
        } else {
          const filtered = decrypted?.filter((uni) =>
            details?.university?.some((d) => d.id === uni?.id)
          );
          setUniversities(filtered);
        }
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

  const getAllLeadsData = async () => {
    setLoading((prev) => ({ ...prev, alleads: true }));
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
            field: "updated_at",
            from: startDate,
            to: endDate,
          },
        ],
        field_filters: [
          // {
          //   field: "owner",
          //   value: selReported,
          // },
          {
            field: "lead_status",
            value: selStage,
          },
          {
            field: "university_interested",
            value: selUni,
          },
        ],
      },

      // sorting: [
      //   {
      //     field: "created_at",
      //     order: "DESC",
      //   },
      // ],
    };
    console.log("body allLeads", reqbody);

    try {
      const result = await getAllLeadsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final allLeads", decrypted);

        setLeads(decrypted);
        const { data, ...pageData } = decrypted;
        setPagesData(pageData);
        setLoading((prev) => ({ ...prev, alleads: false }));
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
        setLoading((prev) => ({ ...prev, alleads: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, alleads: false }));
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

  const getAllStagesOptions = async () => {
    setLoading((prev) => ({ ...prev, stages: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("stages DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final stages", decrypted);
        // console.log(
        //   "final substages",
        //   decrypted.flatMap((stage) => stage.children || [])
        // );

        setStageOptions(decrypted);
        setSubStageOptions(decrypted?.flatMap((stage) => stage.children));
        setLoading((prev) => ({ ...prev, stages: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, stages: false }));
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
      setLoading((prev) => ({ ...prev, stages: false }));
    }
  };

  const handleLeadDetailsforLeadCount = async (contactId) => {
    setLoading((prev) => ({ ...prev, leadHistory: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: contactId,
    };
    try {
      const result = await getLeadDetailsforLeadCount(csrfToken, reqbody);
      // console.log("reporting user DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final old", decrypted);

        setOldLeads((prev) => {
          const existingIds = prev
            ? new Set(prev?.map((lead) => lead.id))
            : new Set();
          const uniqueDecrypted = decrypted?.filter(
            (lead) => !existingIds.has(lead.id)
          );
          return prev ? [...prev, ...uniqueDecrypted] : uniqueDecrypted;
        });
        setLoading((prev) => ({ ...prev, leadHistory: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, leadHistory: false }));
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
      setLoading((prev) => ({ ...prev, leadHistory: false }));
    }
  };

  useEffect(() => {
    if (userSet === null) {
      dispatch(setUserFull());
      setLeadColumns(defaultSet?.leads);
    } else {
      setLeadColumns(userSet?.leads);
    }
  }, []);

  useEffect(() => {
    const handleResize = () =>
      setPlacement(window.innerWidth <= 1300 ? "bottomStart" : "bottomEnd");
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getUniversitiesList();
    getAllReportingUsers();
    getAllStagesOptions();
  }, [from]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  useEffect(() => {
    if (dataChanged) {
      getAllLeadsData();
      handleDataChange();
      setOldLeads(null);
      setExpandedRows({});
    }
  }, [dataChanged]);

  useEffect(() => {
    getAllLeadsData();
    handleDataChange();
    setOldLeads(null);
    setExpandedRows({});
  }, [refresh]);

  useEffect(() => {
    getAllLeadsData();
  }, [
    page,
    rowsPerPage,
    selReported,
    selStage,
    selUni,
    debouncedInput,
    // dateType,
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

  useEffect(() => {
    if (!singleLeadDisplay) {
      setViewLead(null);
    }
  }, [singleLeadDisplay]);

  useEffect(() => {
    if (stage) {
      setSelStage(stage);
    }
    if (reporting) {
      setSelReported(reporting);
    }
    if (start && from) {
      console.log("hit");
      setStartDate(start);
    }
    if (end && from) {
      console.log("hit");
      setEndDate(end);
    }

    if (start && end && from) {
      setDateRangeValue([new Date(start), new Date(end)]);
    }

    if (from) {
      router.replace("/leads");
    }
  }, [stage, reporting, start, end, from]);

  useEffect(() => {
    return () => {
      dispatch(resetDash());
    };
  }, []);

  const handleRowMenuClick = (event, lead) => {
    setMenuAnchor(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleLeadClick = (event) => {
    setLeadAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(false);
    setAnchorEl(false);
  };

  const handleLeadClose = () => setLeadAnchor(null);

  const openCreateFollowModal = () => {
    setIsCreateModalOpen(true);
    handleMenuClose();
  };

  const closeCreateFollowModal = () => setIsCreateModalOpen(false); // function to close create followup

  const handleOpenLeadModal = () => {
    setOpenLeadModal(true);
    handleMenuClose();
    handleLeadClose();
  };

  const handleEditClick = () => {
    setOpenEditLeadModal(true);
    handleMenuClose();
  };

  const handleImportLeadsClick = () => {
    setOpenImportLeadsModal(true);
    handleMenuClose();
    handleLeadClose();
  };

  const handleImportLeadCloseModal = () => {
    setOpenImportLeadsModal(false);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");

  const handlePageChange = (event, value) => setPage(value);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to page 1 after changing rows per page
  };

  const handleSelectAllClick = () => {
    if (allSelected) {
      setSelected([]); // Deselect all
    } else {
      setSelected(leads?.data?.map((lead) => lead)); // Select all
    }
  };

  // Toggle individual row checkbox
  const handleRowClick = (lead) => {
    setSelected(
      (prevSelected) =>
        prevSelected.includes(lead)
          ? prevSelected?.filter((i) => i?.id !== lead?.id) // Deselect if already selected
          : [...prevSelected, lead] // Add to selected list
    );
  };

  const handleActionClick = (action) => {
    setSelAction(action);
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`${t("leads.led_del_title")}?`);
      setModalContent(t("leads.led_del_content"));
      setModalActions([
        {
          label: t("leads.esl_cancel"),
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
    } else if (action === "Bulk Delete") {
      setActionType("Bulk Delete");
      setModalTitle(`${t("leads.led_del_title")}?`);
      setModalContent(t("leads.led_del_content"));
      setModalActions([
        {
          label: t("leads.esl_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("leads.led_del_btn"),
          className: "confirm-button",
          onClick: handleConfirmBulkDelete,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "edit") {
      handleEditClick();
    } else if (action === "owner") {
      setSingleChangeOwnerModal(true);
    } else if (action === "state") {
      handleEditClick();
    }
    handleMenuClose();
  };

  const handleModalClose = () => setIsModalOpen(false);

  const handleConfirmDelete = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: [selectedLead?.id],
    };
    console.log("body", reqbody);
    try {
      const result = await singleLeadDeleteAction(csrfToken, reqbody);
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

  const handleConfirmBulkDelete = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: selected.map((lead) => lead.id),
    };
    console.log("body", reqbody);
    try {
      const result = await singleLeadDeleteAction(csrfToken, reqbody);
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
          setSelected([]);
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

  const handleMenuClickModal = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const allSelected =
    selected?.length === leads?.data?.length && leads?.data?.length > 0;

  const handleExpandClick = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle expanded state for the row
    }));
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

  const handleCall = async (lead) => {
    console.log("lead", lead);
    const csrfToken = await getCsrfToken();
    const virtualNumber = await getVirtualNumber(
      lead?.university_interested?.id
    );

    const reqbody = {
      // provider_id: "q2e7fc61-0fac-5b26-84eb-e0f0d3d676bd", // optional
      user_id: details?.uuid,
      from: details?.mobile_number, // mandatory
      to: [lead?.mobile_number], // mandatory
      // to: ["8390141248"], // mandatory
      virtual_number: virtualNumber[0]?.name, // mandatory
      lead_id: lead?.id, //mandatory
      // follow_up_id: 90, //optional
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

  const closeModal = () => {
    setSelectedFollowUpMode(null); // Reset the follow-up mode to close the modal
  };

  const getModalConfig = (followUpMode) => {
    switch (followUpMode) {
      case "whatsapp":
        return {
          title: `${t("followup.fuptc_follow_up_action")} (WhatsApp)`,
          radioOptions: [
            {
              value: `${selectedLead?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${selectedLead?.alternate_mobile_number}`,
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
              value: `${selectedLead?.email}`,
              label: t("followup.fup_tbl_mdlconf_chekbox"),
              color: "green",
            },
            {
              value: `${selectedLead?.alternate_email}`,
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
              value: `${selectedLead?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${selectedLead?.alternate_mobile_number}`,
              label: "Alternate Number",
              color: "green",
            },
          ],
        };
      default:
        return {};
    }
  };

  const handleBulkChangeOwners = () => {
    if (selected?.length == 0) {
      showSnackbar({
        message: `${t("leads.led_sel_first")}`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } else if (selected?.length > 0) {
      const filteredData = leads?.data?.filter((item) =>
        selected?.includes(item)
      );

      const allSameUniversity = filteredData.every(
        (item, _, arr) =>
          item.university_interested?.id === arr[0].university_interested?.id
      );

      if (allSameUniversity) {
        setBulkChangeOwnerModal(true);
      } else {
        showSnackbar({
          message: `To perform this operation, leads with the same university only needs to be selected!`,
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
      }
    }
  };

  const handleColumnOpen = (event) => {
    // setColumnAnchorEl(event.currentTarget);
    setColumnAnchorEl(event.currentTarget);
  };

  const handleColumnClose = () => {
    setColumnAnchorEl(null);
  };

  const leadBulkActions =
    permissions?.leadActions &&
    permissions?.leadActions?.filter(
      (set) => set.parent === 38 && set.details === "bulk_action"
    );

  const leadSingleActions =
    permissions?.leadActions &&
    permissions?.leadActions?.filter(
      (set) => set.parent === 38 && set.details === "single_action"
    );

  const leadListActions =
    permissions?.leadActions &&
    permissions?.leadActions?.filter(
      (set) => set.parent === 38 && set.details === "list_action"
    );

  const renderHeadCell = (column) => {
    switch (column.id) {
      case 1:
        return (
          <TableCell
            id="headcell-name"
            sx={{
              whiteSpace: "nowrap",
              width: "180px",
            }}
          >
            <Checkbox
              id="leads-manage-all-select"
              checked={allSelected}
              onChange={handleSelectAllClick}
              style={{
                marginRight: "15px",
              }}
            />
            {t("leads.lm_name_column")}
          </TableCell>
        );
      case 2:
        return (
          <TableCell
            id="headcell-lead-stage"
            sx={{
              whiteSpace: "nowrap",
              width: "120px",
            }}
          >
            {t("leads.lm_lead_stage_column")}
          </TableCell>
        );
      // return (
      //   <TableCell id="headcell-mobile" sx={{ whiteSpace: "nowrap", width: "100px" }}>
      //     {t("leads.lm_mobile_column")}
      //   </TableCell>
      // );
      case 3:
        return (
          <TableCell
            id="headcell-course"
            sx={{
              whiteSpace: "nowrap",
              width: "200px",
            }}
          >
            {/* {t("leads.ldv_lead_preference_program")} */}
            {t("rules.rules_create_course")}
          </TableCell>
        );
      case 4:
        return (
          <TableCell
            id="headcell-university"
            sx={{
              whiteSpace: "nowrap",
              width: "200px",
            }}
          >
            {t("leads.ldv_lead_preference_univ")}
          </TableCell>
        );
      case 5:
        return (
          <TableCell
            id="headcell-owner"
            sx={{
              whiteSpace: "nowrap",
              width: "200px",
            }}
          >
            {t("leads.lm_owner_column")}
          </TableCell>
        );
      case 6:
        return (
          <TableCell
            id="headcell-modified-on"
            sx={{
              whiteSpace: "nowrap",
              width: "200px",
            }}
          >
            {t("leads.lm_modified_on_column")}
          </TableCell>
        );
      case 7:
        return (
          <TableCell
            id="headcell-lead-stage-duplicate"
            sx={{
              whiteSpace: "nowrap",
              width: "120px",
            }}
          >
            {t("leads.lm_lead_stage_column")}
          </TableCell>
        );
      case 8:
        return (
          <TableCell
            id="headcell-contact"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Contact
          </TableCell>
        );
      case 9:
        return (
          <TableCell
            id="headcell-email"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Email
          </TableCell>
        );
      case 10:
        return (
          <TableCell
            id="headcell-sub-stage"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Sub-stage
          </TableCell>
        );
      case 11:
        return (
          <TableCell
            id="headcell-source"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Source
          </TableCell>
        );
      case 12:
        return (
          <TableCell
            id="headcell-medium"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Medium
          </TableCell>
        );
      case 13:
        return (
          <TableCell
            id="headcell-created-on"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Created On
          </TableCell>
        );
      case 14:
        return (
          <TableCell
            id="headcell-lead-age"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Lead Age
          </TableCell>
        );
      case 15:
        return (
          <TableCell
            id="headcell-modified-age"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Modified Age
          </TableCell>
        );
      case 16:
        return (
          <TableCell
            id="headcell-next-follow-up"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Next follow up
          </TableCell>
        );
      case 17:
        return (
          <TableCell
            id="headcell-best-time-to-call"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Best time to call
          </TableCell>
        );
      case 18:
        return (
          <TableCell
            id="headcell-remark"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Remark
          </TableCell>
        );
      default:
        return null;
    }
  };

  const renderBodyCell = (lead, column) => {
    switch (column.id) {
      case 1:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-1`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "150px",
            }}
          >
            <div
              id={`lead-${lead?.id}-details`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Box
                className="collapse_box"
                id={`collapse-box-lead-${lead?.id}`}
              >
                <Checkbox
                  id={`leads-manage-checkbox-${lead?.id}`}
                  checked={selected.includes(lead)}
                  onChange={() => handleRowClick(lead)}
                  style={{ marginRight: "10px" }}
                />
                <span
                  id={`lead-name-${lead?.id}`}
                  style={{
                    whiteSpace: "nowrap",
                    maxWidth: "112px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setViewLead(lead?.id);
                    dispatch(setSingleLeadDisplay(true));
                  }}
                  title={lead?.full_name}
                >
                  {lead?.full_name}
                </span>
              </Box>
              <div id={`lead-expand-button-${lead?.id}`}>
                {lead?.lead_count > 1 && (
                  <IconButton
                    id="leads-manage-get-old-leads-btn"
                    onClick={() => {
                      handleExpandClick(lead?.id);
                      if (
                        !expandedRows[lead?.id] &&
                        !oldLeads?.some(
                          (olead) => olead?.contact_id === lead?.contact_id
                        )
                      ) {
                        handleLeadDetailsforLeadCount(lead?.contact_id);
                      }
                    }}
                    style={{ marginTop: "-4px" }}
                  >
                    {expandedRows[lead?.id] ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                )}
              </div>
            </div>
          </TableCell>
        );
      case 2:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-2`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Box
              className="collapse_box"
              title={lead?.lead_status?.name}
              id={`lead-status-box-${lead?.id}`}
            >
              <Chip
                label={lead?.lead_status?.name}
                variant="filled"
                size="small"
                sx={{
                  color:
                    stageOptions?.find(
                      (stage) => stage.id === lead?.lead_status?.id
                    )?.txt_color || "#000",
                  backgroundColor:
                    stageOptions?.find(
                      (stage) => stage.id === lead?.lead_status?.id
                    )?.bg_color || "#fff",
                }}
              />
            </Box>
          </TableCell>
        );
      case 3:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-3`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "130px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={lead?.course?.name}>{lead?.course?.name}</span>
          </TableCell>
        );
      case 4:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-4`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "140px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={lead?.university_interested?.name}>
              {lead?.university_interested?.short_name || "-"}
            </span>
          </TableCell>
        );
      case 5:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-5`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span
              title={`${lead?.lead_owner?.first_name} ${lead?.lead_owner?.last_name}`}
            >
              {lead?.lead_owner?.first_name} {lead?.lead_owner?.last_name}
            </span>
          </TableCell>
        );
      case 6:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-6`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={formatDate(lead?.updated_at)}>
              {formatDate(lead?.updated_at)}
            </span>
          </TableCell>
        );
      case 7:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-7`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Box
              className="collapse_box"
              title={lead?.lead_status?.name}
              id={`lead-status-box-7-${lead?.id}`}
            >
              <Chip
                label={lead?.lead_status?.name}
                variant="filled"
                size="small"
                sx={{
                  color:
                    stageOptions?.find(
                      (stage) => stage.id === lead?.lead_status?.id
                    )?.txt_color || "#000",
                  backgroundColor:
                    stageOptions?.find(
                      (stage) => stage.id === lead?.lead_status?.id
                    )?.bg_color || "#fff",
                }}
              />
            </Box>
          </TableCell>
        );
      case 8:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-8`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={lead?.mobile_number}>{lead?.mobile_number}</span>
          </TableCell>
        );
      case 9:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-9`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={lead?.email}>{lead?.email}</span>
          </TableCell>
        );
      case 10:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-10`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Box
              className="collapse_box"
              title={lead?.lead_sub_status?.name}
              id={`lead-sub-status-box-${lead?.id}`}
            >
              <Chip
                label={lead?.lead_sub_status?.name}
                variant="filled"
                size="small"
                avatar={
                  <div
                    style={{
                      backgroundColor:
                        subStageOptions?.find(
                          (stage) => stage.id === lead?.lead_sub_status?.id
                        )?.txt_color || "#000",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                    }}
                  />
                }
                sx={{
                  backgroundColor:
                    subStageOptions?.find(
                      (stage) => stage.id === lead?.lead_sub_status?.id
                    )?.bg_color || "#fff",
                  fontWeight: 400,
                }}
              />
            </Box>
          </TableCell>
        );
      case 11:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-11`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={lead?.channel?.name}>{lead?.channel?.name}</span>
          </TableCell>
        );
      case 12:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-12`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={lead?.source_medium?.name}>
              {lead?.source_medium?.name}
            </span>
          </TableCell>
        );
      case 13:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-13`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={formatDate(lead?.created_at)}>
              {formatDate(lead?.created_at)}
            </span>
          </TableCell>
        );
      case 14:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-14`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span
              title={Math.floor(
                (new Date() - new Date(lead?.created_at?.split(" ")[0])) /
                  (1000 * 60 * 60 * 24)
              )}
            >
              {Math.floor(
                (new Date() - new Date(lead?.created_at?.split(" ")[0])) /
                  (1000 * 60 * 60 * 24)
              )}
            </span>
          </TableCell>
        );
      case 15:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-15`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span
              title={new Date(lead?.updated_at).toLocaleDateString("en-GB")}
            >
              {new Date(lead?.updated_at).toLocaleDateString("en-GB")}
            </span>
          </TableCell>
        );
      case 16:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-16`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title="-">-</span>
          </TableCell>
        );
      case 17:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-17`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={lead?.best_time_to_call}>
              {lead?.best_time_to_call}
            </span>
          </TableCell>
        );
      case 18:
        return (
          <TableCell
            id={`table-cell-lead-${lead?.id}-column-18`}
            style={{
              whiteSpace: "nowrap",
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span title={(lead?.remark && lead?.remark[0]?.comment) || "-"}>
              {(lead?.remark && lead?.remark[0]?.comment) || "-"}
            </span>
          </TableCell>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* {singleLeadDisplay === false && ( */}
      {!viewLead && (
        <>
          {bigLoading ? (
            <div
              id="big-loading-container"
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
          ) : leads?.data?.length === 0 && leads?.total_record === 0 ? (
            <NoContent
              illustration={EmptyRoles}
              title={t("leads.led_no_title")}
              subtitle={t("leads.led_no_subtitle")}
              buttonText={
                leadSingleActions?.length > 0 &&
                leadSingleActions?.some((lead) => lead.id === 40) &&
                t("leads.led_create")
              }
              onButtonClick={() => {
                if (
                  leadSingleActions?.length > 0 &&
                  leadSingleActions?.some((lead) => lead.id === 40)
                ) {
                  handleOpenLeadModal();
                }
              }}
              buttonText2={
                leadBulkActions?.length > 0 &&
                leadBulkActions?.some((lead) => lead.id === 44) &&
                t("leads.led_bulk")
              }
              onButtonClick2={() => {
                if (
                  leadBulkActions?.length > 0 &&
                  leadBulkActions?.some((lead) => lead.id === 44)
                ) {
                  handleImportLeadsClick();
                }
              }}
            />
          ) : (
            <div
              className="table-container manage-roles-container"
              id="leads-management-container"
            >
              <div
                className="manager-roles-headers-roles"
                id="leads-management-header"
              >
                <div
                  className="role-description-user"
                  id="leads-management-title"
                >
                  <h1>{t("leads.lm_title")}</h1>
                  <p>{t("leads.lm_manage_user_descr")}</p>
                </div>

                <div className="action-buttons" id="leads-management-actions">
                  {leadBulkActions && leadBulkActions?.length > 0 && (
                    <button
                      id="leads-manage-settings-btn"
                      className="action-button"
                      onClick={handleMenuClickModal}
                    >
                      <SettingIcon />
                      {t("leads.lm_action_btn")}
                    </button>
                  )}

                  {leadSingleActions && leadSingleActions?.length > 0 && (
                    <button
                      id="leads-manage-add-leads"
                      className="create-role-button"
                      onClick={(e) => handleLeadClick(e)}
                    >
                      {t("leads.lm_add_lead_btn")} <span>|</span>{" "}
                      <ChevronDownUpdate />
                    </button>
                  )}
                </div>
              </div>
              <div className="table-lead-parent" id="leads-table-parent">
                <div
                  className="role-table-parent-lead"
                  id="leads-filters-container"
                >
                  {/* status */}
                  <div className="form-group" id="stage-filter-container">
                    <Select
                      id="leads-manage-filter-stage"
                      multiple
                      value={loading?.stages ? ["loading"] : selStage}
                      onChange={(e) => {
                        const selected = e.target.value;
                        // Clear all if "all_stages" is selected
                        if (selected?.includes("")) {
                          setSelStage([]);
                        } else {
                          setSelStage(selected);
                        }
                      }}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected.length === 0) return t("leads.all_stages");
                        if (selected.includes("loading"))
                          return t("editusermodal.loading");

                        // Display selected stage names
                        return selected
                          .map(
                            (id) =>
                              stageOptions?.find((s) => s.id === id)?.name || id
                          )
                          .join(", ");
                      }}
                      IconComponent={ChevronDown}
                      fullWidth
                      style={{
                        width: "132px",
                        height: "32px",
                        fontSize: "14px",
                      }}
                    >
                      <MenuItem value="">{t("leads.all_stages")}</MenuItem>
                      {loading?.stages ? (
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
                      ) : stageOptions?.length === 0 || !stageOptions ? (
                        <MenuItem disabled>{t("leads.el_no_stages")}</MenuItem>
                      ) : (
                        stageOptions?.map((stage) => (
                          <MenuItem key={stage?.id} value={stage?.id}>
                            <Checkbox checked={selStage?.includes(stage?.id)} />
                            {stage?.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>

                  {/* reporting user */}
                  <div
                    className="form-group"
                    id="reporting-user-filter-container"
                  >
                    <Select
                      multiple
                      value={loading?.reporting ? ["loading"] : selReported}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value.includes("")) {
                          setSelReported([]);
                        } else {
                          setSelReported(value);
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
                              checked={selReported.includes(reporting?.uuid)}
                            />
                            {reporting?.first_name} {reporting?.last_name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>

                  {/* university */}
                  <div className="form-group" id="university-filter-container">
                    <Select
                      id="leads-manage-filter-university"
                      value={loading?.uni ? "loading" : selUni}
                      onChange={(e) => setSelUni(e.target.value)}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      style={{
                        width: "132px",
                        height: "32px",
                        fontSize: "14px",
                      }}
                    >
                      <MenuItem value="">{t("leads.csl_univ_phldr")}</MenuItem>
                      {loading?.uni ? (
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
                      ) : universities?.length === 0 || !universities ? (
                        <MenuItem disabled>{t("leads.cl_no_unives")}</MenuItem>
                      ) : (
                        universities?.length > 0 &&
                        universities?.map((uni) => (
                          <MenuItem key={uni?.id} value={uni?.id}>
                            {uni?.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>

                  {/* search */}
                  <div
                    className="role-search"
                    id="leads-search-container"
                    style={{ marginBottom: "40px" }}
                  >
                    <div className="search-box" id="leads-search-box">
                      <input
                        id="leads-manage-main-search"
                        type="text"
                        placeholder={t("leads.lm_search_phldr")}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button
                        id="leads-manage-search-main-btn"
                        className="search-icon"
                      >
                        <SearchIcon />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" id="refresh-button-container">
                    <IconButton
                      id="leads-manage-refresh-leads-btn"
                      size="small"
                      style={{
                        border: "1px solid #e1e1e1",
                        borderRadius: "6px",
                      }}
                      onClick={() => setRefresh(!refresh)}
                    >
                      <Refresh color="success" size={15} />
                    </IconButton>
                  </div>
                </div>
                <div
                  className="date-range-selector"
                  id="date-range-selector-container"
                >
                  {/* Date type */}
                  <div
                    className="date-range-picker"
                    id="date-range-picker-container"
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
              <TableContainer
                id="leads-table-container"
                className="user-table-container"
                style={{ maxHeight: "390px", overflowY: "auto" }}
              >
                <Table
                  id="leads-main-table"
                  stickyHeader
                  aria-label="Leads Table"
                  className="user-table-content"
                >
                  <TableHead>
                    <TableRow>
                      {leadColumns?.map((column) => {
                        return (
                          <React.Fragment key={column?.id}>
                            {column?.checked && renderHeadCell(column)}
                          </React.Fragment>
                        );
                      })}
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          width: "150px",
                          textAlign: "center",
                        }}
                      >
                        -
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          width: "50px",
                          textAlign: "center",
                        }}
                      >
                        <SettingIcon
                          style={{ cursor: "pointer" }}
                          // onClick={handleColumnOpen}
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading?.alleads ? (
                      <TableRow>
                        <TableCell
                          // colSpan={8}
                          colSpan={leadColumns?.length + 2}
                          align="center"
                          style={{ padding: "20px", textAlign: "center" }}
                        >
                          <CircularProgress size={50} sx={{ color: "#000" }} />
                        </TableCell>
                      </TableRow>
                    ) : leads?.data?.length > 0 ? (
                      leads?.data?.map((lead) => (
                        <React.Fragment key={lead?.id}>
                          <TableRow>
                            {leadColumns?.map((column) => {
                              return (
                                <React.Fragment key={column?.id}>
                                  {column?.checked &&
                                    renderBodyCell(lead, column)}
                                </React.Fragment>
                              );
                            })}

                            {/* <TableCell
                              sx={{ whiteSpace: "nowrap", width: "200px" }}
                            >
                              {lead?.created_by?.first_name}{" "}
                              {lead?.created_by?.last_name}
                            </TableCell> */}
                            <TableCell
                              sx={{
                                whiteSpace: "nowrap",
                                width: "170px",
                                textAlign: "center",
                              }}
                            >
                              <IconButton
                                id="leads-manage-call-btn"
                                title={lead?.mobile_number}
                                onClick={() => {
                                  setSelectedLead(lead);
                                  handleCall(lead);
                                }}
                              >
                                <CallIcon />
                              </IconButton>
                              <IconButton
                                id="leads-manage-email-btn"
                                title={lead?.email}
                                onClick={() => {
                                  setSelectedLead(lead);
                                  openModal("email");
                                }}
                              >
                                <EmailIcon />
                              </IconButton>
                              <IconButton
                                id="leads-manage-sms-btn"
                                title={lead?.mobile_number}
                                onClick={() => {
                                  setSelectedLead(lead);
                                  openModal("sms");
                                }}
                              >
                                <MessageIcon />
                              </IconButton>
                              {/* <IconButton
                                id="leads-manage-whatsapp-btn"
                                title={lead?.mobile_number}
                                onClick={() => {
                                  setSelectedLead(lead);
                                  openModal("whatsapp");
                                }}
                              >
                                <Social />
                              </IconButton> */}
                              <IconButton
                                id="leads-manage-activity-btn"
                                style={{
                                  border: "1px solid #e1e1e1",
                                  borderRadius: "6px",
                                }}
                                onClick={() => {
                                  setActivityModal(true);
                                  setSelectedLead(lead);
                                }}
                              >
                                <ActivityClock />
                              </IconButton>
                            </TableCell>
                            <TableCell
                              sx={{ whiteSpace: "nowrap", width: "50px" }}
                            >
                              <IconButton
                                disabled={closedStatus.includes(
                                  lead?.lead_status?.name
                                )}
                                id="leads-manage-list-edit-menu-btn"
                                onClick={(e) => {
                                  if (
                                    !closedStatus.includes(
                                      lead?.lead_status?.name
                                    )
                                  ) {
                                    handleRowMenuClick(e, lead);
                                  }
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>

                          {expandedRows[lead?.id] && (
                            <>
                              {/* <TableCell colSpan={13} style={{ padding: 0 }}>
                            <Collapse
                              in={expandedRows[lead?.id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Table size="small" aria-label="collapse table">
                                <TableBody> */}
                              {loading.leadHistory && expandedRows[lead?.id] ? (
                                // <TableRow>
                                <TableCell
                                  colSpan={leadColumns?.length + 2}
                                  align="center"
                                  style={{
                                    padding: "20px",
                                    textAlign: "center",
                                  }}
                                >
                                  <CircularProgress
                                    size={50}
                                    sx={{ color: "#000" }}
                                  />
                                </TableCell>
                              ) : (
                                // </TableRow>
                                oldLeads
                                  ?.filter(
                                    (olead) =>
                                      olead?.contact_id === lead?.contact_id &&
                                      olead?.id !== lead?.id
                                  )
                                  .map((olead) => (
                                    <TableRow
                                      key={olead?.id}
                                      style={{ background: "#EDEEFC" }}
                                    >
                                      {leadColumns.map(
                                        (column) =>
                                          column?.checked &&
                                          renderBodyCell(olead, column)
                                      )}
                                      <TableCell
                                        sx={{
                                          whiteSpace: "nowrap",
                                          width: "150px",
                                        }}
                                      >
                                        <IconButton
                                          id="leads-manage-oleads-call-btn"
                                          title={olead?.mobile_number}
                                          onClick={() => {
                                            setSelectedLead(olead);
                                            handleCall(olead);
                                          }}
                                        >
                                          <CallIcon />
                                        </IconButton>
                                        <IconButton
                                          id="leads-manage-oleads-email-btn"
                                          title={olead?.email}
                                          onClick={() => {
                                            setSelectedLead(olead);
                                            openModal("email");
                                          }}
                                        >
                                          <EmailIcon />
                                        </IconButton>
                                        <IconButton
                                          id="leads-manage-oleads-sms-btn"
                                          title={olead?.mobile_number}
                                          onClick={() => {
                                            setSelectedLead(olead);
                                            openModal("sms");
                                          }}
                                        >
                                          <MessageIcon />
                                        </IconButton>
                                        {/* <IconButton
                                          id="leads-manage-oleads-whatsapp-btn"
                                          title={olead?.mobile_number}
                                          onClick={() => {
                                            setSelectedLead(olead);
                                            openModal("whatsapp");
                                          }}
                                        >
                                          <Social />
                                        </IconButton> */}
                                        <IconButton
                                          id="leads-manage-oleads-activity-btn"
                                          style={{
                                            border: "1px solid #e1e1e1",
                                            borderRadius: "6px",
                                          }}
                                          onClick={() => {
                                            setActivityModal(true);
                                            setSelectedLead(olead);
                                          }}
                                        >
                                          <ActivityClock />
                                        </IconButton>
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          whiteSpace: "nowrap",
                                          width: "50px",
                                        }}
                                      >
                                        <IconButton
                                          id="leads-manage-oleads-list-edit-btn"
                                          disabled={closedStatus.includes(
                                            olead?.lead_status?.name
                                          )}
                                          onClick={(e) => {
                                            if (
                                              !closedStatus.includes(
                                                olead?.lead_status?.name
                                              )
                                            ) {
                                              handleRowMenuClick(e, olead);
                                            }
                                          }}
                                        >
                                          <MoreVertIcon />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))
                              )}
                              {/* </TableBody>
                              </Table>
                            </Collapse>
                          </TableCell> */}
                            </>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          // colSpan={leadColumns?.length}
                          style={{ padding: "20px", textAlign: "center" }}
                        >
                          {t("leads.lm_no_results")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination and Rows Per Page */}
              <div className="pagination-wrapper" id="pagination-wrapper">
                {/* Rounded Pagination with Next/Previous Buttons */}
                <div className="pagination-buttons" id="pagination-buttons">
                  <Button
                    id="leads-manage-page-back"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    variant="outlined"
                    sx={{ marginRight: 2, textTransform: "capitalize" }}
                  >
                    {t("leads.lm_pagination_back")}
                  </Button>

                  <Pagination
                    id="leads-manage-pagination"
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
                    id="leads-manage-page-next"
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
                  className="form-group-pagination"
                  id="rows-per-page-container"
                >
                  <label>{t("leads.lm_results_per_page")}</label>
                  <Select
                    id="leads-manage-page-nofopages"
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

              {/* list Menu */}
              <Menu
                id="leads-manage-list-menu"
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
                {leadListActions?.some((lead) => lead.id === 41) && (
                  <MenuItem
                    id="leads-manage-list-edit-btn"
                    onClick={() => handleActionClick("edit")}
                  >
                    {t("leads.lm_menu_edit")}
                  </MenuItem>
                )}
                {leadListActions?.some((lead) => lead.id === 56) && (
                  <MenuItem
                    id="leads-manage-list-change-owner-btn"
                    onClick={() => handleActionClick("owner")}
                  >
                    {t("leads.lm_menu_change_owner")}
                  </MenuItem>
                )}
                {leadListActions?.some((lead) => lead.id === 57) && (
                  <MenuItem
                    id="leads-manage-change-state-btn"
                    onClick={() => handleActionClick("state")}
                  >
                    {t("leads.lm_menu_change_state")}
                  </MenuItem>
                )}
                {/* {leadListActions?.some((lead) => lead.id === 45) && (
              <MenuItem onClick={handleEditClick}>
                {t("leads.lm_menu_transfer_lead")}
              </MenuItem>
            )} */}
                {leadListActions?.some((lead) => lead.id === 58) && (
                  <MenuItem
                    id="leads-manage-create-followup-btn"
                    onClick={openCreateFollowModal}
                  >
                    {t("leads.lm_menu_follow_up")}
                  </MenuItem>
                )}
                {leadListActions?.some((lead) => lead.id === 42) && (
                  <MenuItem
                    id="leads-manage-list-delete-btn"
                    onClick={() => handleActionClick("Delete")}
                  >
                    {t("leads.lm_menu_del")}
                  </MenuItem>
                )}
              </Menu>

              {/* Create Menu */}
              <Menu
                id="leads-manage-create-menu"
                anchorEl={leadAnchor}
                open={Boolean(leadAnchor)}
                onClose={handleLeadClose}
                PaperProps={{
                  style: {
                    maxHeight: 100,
                    width: "20ch",
                  },
                }}
              >
                {leadSingleActions?.some((lead) => lead.id === 40) && (
                  <MenuItem
                    id="leads-manage-add-single-lead-btn"
                    onClick={handleOpenLeadModal}
                  >
                    {t("leads.lm_lead_menu_add_single")}
                  </MenuItem>
                )}

                {leadBulkActions?.some((lead) => lead.id === 44) && (
                  <MenuItem
                    id="leads-manage-bulk-upload-btn"
                    onClick={handleImportLeadsClick}
                  >
                    {t("leads.lm_lead_menu_upload_lead")}
                  </MenuItem>
                )}
              </Menu>

              {/* Bulk Menu */}
              <Menu
                id="leads-manage-bulk-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {leadBulkActions?.some((act) => act.id === 43) && (
                  <MenuItem onClick={() => "export"}>Export</MenuItem>
                )}
                {/* {leadBulkActions?.some((act) => act.id === 44) && (
              <MenuItem onClick={() => "upload"}>Upload</MenuItem>
            )} */}
                {leadBulkActions?.some((act) => act.id === 46) && (
                  <MenuItem
                    id="leads-manage-bulk-change-owner-btn"
                    onClick={() => {
                      handleBulkChangeOwners();
                      handleMenuClose();
                    }}
                  >
                    {t("leads.lm_menu_change_owner")}
                  </MenuItem>
                )}
                {/* {leadBulkActions?.some((act) => act.id === 47) && (
              <MenuItem onClick={() => "export"}>
                {t("leads.lm_menu_change_state")}
              </MenuItem>
            )} */}
                {/* {leadBulkActions?.some((act) => act.id === 48) && (
              <MenuItem onClick={() => "update"}>
                {t("leads.lm_menu_transfer_lead")}
              </MenuItem>
            )} */}
                {leadBulkActions?.some((act) => act.id === 49) && (
                  <MenuItem
                    id="leads-manage-bulk-lead-delete-btn"
                    onClick={() => {
                      if (selected.length === 0) {
                        showSnackbar({
                          message: `${t("leads.led_sel_first")}`,
                          severity: "error",
                          anchorOrigin: {
                            vertical: "top",
                            horizontal: "center",
                          },
                        });
                      } else {
                        handleActionClick("Bulk Delete");
                      }
                    }}
                  >
                    {t("leads.lm_menu_del")}
                  </MenuItem>
                )}
              </Menu>

              {/* Custom Table Columns */}
              <Popover
                id="column-customization-popover"
                open={Boolean(columnAnchorEl)}
                anchorEl={columnAnchorEl}
                onClose={handleColumnClose}
                sx={{
                  borderRadius: "5px",
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                PopperProps={{
                  modifiers: [
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "window",
                        padding: 8,
                      },
                    },
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: ["right", "left", "top", "bottom"], // Allow flipping in both directions
                      },
                    },
                  ],
                }}
              >
                <DraggableList
                  defaultData={defaultSet?.leads}
                  data={leadColumns}
                  setData={setLeadColumns}
                  tableName={"leads"}
                  // onSave={(items) => {
                  //   // onSave(items);
                  //   setLeadColumns(items);
                  //   console.log("Saved data:", items);
                  //   handleColumnClose();
                  // }}
                  onClose={handleColumnClose}
                />
              </Popover>
            </div>
          )}
          {isModalOpen && (
            <Modal
              id="action-confirmation-modal"
              isOpen={isModalOpen}
              onClose={handleModalClose}
              title={modalTitle}
              icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
              content={modalContent}
              actions={modalActions}
            />
          )}

          {openLeadModal && (
            <div className="modal-backdrop" id="create-lead-modal-backdrop">
              <CreateSingleLead
                open={openLeadModal}
                onClose={() => setOpenLeadModal(false)}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {openEditLeadModal &&
            (selAction === "edit" || selAction === null) && (
              <div className="modal-backdrop" id="edit-lead-modal-backdrop">
                <EditSingleLead
                  open={openEditLeadModal}
                  onClose={() => setOpenEditLeadModal(false)}
                  action={selAction}
                  lead={selectedLead}
                  handleDataChange={handleDataChange}
                />
              </div>
            )}

          {openEditLeadModal && selAction === "state" && (
            <div className="modal-backdrop" id="stage-change-modal-backdrop">
              <StageChangeModal
                open={openEditLeadModal}
                onClose={() => setOpenEditLeadModal(false)}
                lead={selectedLead}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {isCreateModalOpen && (
            <div className="modal-backdrop" id="create-followup-modal-backdrop">
              <CreateFollow
                onClose={closeCreateFollowModal}
                selectedLead={selectedLead}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {selectedFollowUpMode && (
            <div className="modal-backdrop" id="followup-direct-modal-backdrop">
              <FollowUpDirectModal
                {...getModalConfig(selectedFollowUpMode)}
                type={selectedFollowUpMode}
                lead={selectedLead?.id}
                leadDetails={selectedLead}
                followupId=""
                onClose={closeModal}
              />
            </div>
          )}

          {singleChangeOwnerModal && (
            <div
              className="modal-backdrop"
              id="single-owner-change-modal-backdrop"
            >
              <SingleChangeOwnerModal
                open={singleChangeOwnerModal}
                onClose={() => setSingleChangeOwnerModal(false)}
                lead={selectedLead}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {bulkChangeOwnerModal && (
            <div
              className="modal-backdrop"
              id="bulk-owner-change-modal-backdrop"
            >
              <BulkChangeOwnerModal
                open={bulkChangeOwnerModal}
                onClose={() => setBulkChangeOwnerModal(false)}
                leads={selected}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {/* Render ImportUserModal modal when importModal is true */}
          {openImportLeadsModal && (
            <div className="modal-backdrop" id="import-leads-modal-backdrop">
              <ImportLeads
                open={openImportLeadsModal}
                onClose={handleImportLeadCloseModal}
                handleDataChange={handleDataChange}
              />
            </div>
          )}
        </>
      )}
      {viewLead && (
        <LeadDetails
          handleDataChange={handleDataChange}
          lead={viewLead}
          setViewLead={setViewLead}
        />
      )}

      {activityModal && (
        <div className="modal-backdrop" id="activity-modal-backdrop">
          <ActivityModal
            open={activityModal}
            onClose={() => {
              setActivityModal(false);
            }}
            lead={selectedLead}
          />
        </div>
      )}
    </>
  );
};

export default LeadManagement;
