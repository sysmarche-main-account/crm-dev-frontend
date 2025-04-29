"use client";
import React, { useEffect, useRef, useState } from "react";
import AlertIcon from "@/images/alert-circle.svg";
import ComponentIcon from "@/images/component.svg";
import CloseIcon from "@/images/close-icon.svg";
import UploadIcon from "@/images/upload.svg";
import DownloadIcon from "@/images/download.svg";
import CheckIcon from "@/images/check-contained.svg"; // Add your check icon
import ExcelIcon from "@/images/execel.svg";
import {
  CircularProgress,
  Button,
  Box,
  Chip,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Checkbox,
} from "@mui/material";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { ErrorMessage, Form, Formik } from "formik";
import ChevronDown from "@/images/chevron-down.svg";
import AlertError from "@/images/alertError.svg";
import ErrorIcon from "@/images/error.svg";
import { useSelector } from "react-redux";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { masterDDAction } from "@/app/actions/commonActions";
import { decryptClient } from "@/utils/decryptClient";
import { getUniUserListAction } from "@/app/actions/userActions";
import {
  bulkLeadUploadAction,
  downloadSampleLeadAction,
  getAllLeadStatusAction,
} from "@/app/actions/leadActions";

const ImportLeads = ({ open, onClose, handleDataChange }) => {
  if (!open) return null; // Hide modal if `open` is false

  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const scrollRef = useRef(null);
  const formikRefLeadUpload = useRef();
  const fileInputRef = useRef(null);

  const uploadLeadValidationSchema = Yup.object({
    stage: Yup.number().required(t("leads.400349")),
    subStage: Yup.number().required(t("leads.400352")),
    university: Yup.number().required(t("leads.400353")),
    // program: Yup.number().required(t("leads.400354")),
    course: Yup.number().required(t("leads.400346")),
    leadSource: Yup.number().required(t("leads.400347")),
    sourceMedium: Yup.number().required(t("leads.400357")),
    owner: Yup.array()
      .of(Yup.string().typeError("Selected Counsellor value is incorrect"))
      .min(1, "At least one counsellor must be selected")
      .test(
        "is-required",
        "This field is required",
        (value) => value && value.length > 0
      ),
  });

  const [loading, setLoading] = useState({
    download: false,
    err_download: false,
    stages: false,
    subStage: false,
    uni: false,
    program: false,
    course: false,
    channel: false,
    medium: false,
    owner: false,
    submit: false,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [file, setFile] = useState(null);

  const [error, setError] = useState(null);

  const [stageOptions, setStageOptions] = useState(null);
  const [subStageOptions, setSubStageOptions] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState(null);
  const [courses, setCourses] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const [mediumList, setMediumList] = useState(null);
  const [leadOwners, setLeadOwners] = useState(null);

  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedPrgm, setSelectedPrgm] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [response, setResponse] = useState(null);

  const getStagesOptions = async () => {
    setLoading((prev) => ({ ...prev, stages: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: 1,
    };
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("stages DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final stages", decrypted);

        setStageOptions(decrypted);
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
  const getSubStageOptions = async () => {
    setLoading((prev) => ({ ...prev, subStage: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedStage,
    };
    // console.log("reqbody sub", reqbody);
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("subStage DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final subStage", decrypted);

        setSubStageOptions(decrypted[0]?.children);
        setLoading((prev) => ({ ...prev, subStage: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, subStage: false }));
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
      setLoading((prev) => ({ ...prev, subStage: false }));
    }
  };
  const getChannelList = async () => {
    setLoading((prev) => ({ ...prev, channel: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["channel"], // mandatory input will be an array
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
        setChannelList(decrypted);
        setLoading((prev) => ({ ...prev, channel: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, channel: false }));
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
      setLoading((prev) => ({ ...prev, channel: false }));
    }
  };
  const getMediumList = async () => {
    setLoading((prev) => ({ ...prev, medium: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["medium"], // mandatory input will be an array
      parent_id: selectedChannel, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setMediumList(decrypted);
        setLoading((prev) => ({ ...prev, medium: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, medium: false }));
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
      setLoading((prev) => ({ ...prev, medium: false }));
    }
  };
  const getProgramList = async () => {
    setLoading((prev) => ({ ...prev, program: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // status: "1", // optional input will be integer
      identifier: ["program"], // mandatory input will be an array
      parent_id: selectedUni, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setPrograms(decrypted);
        setLoading((prev) => ({ ...prev, program: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, program: false }));
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
      setLoading((prev) => ({ ...prev, program: false }));
    }
  };
  const getCoursesList = async () => {
    setLoading((prev) => ({ ...prev, course: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // status: "1", // optional input will be integer
      identifier: ["course"], // mandatory input will be an array
      parent_id: selectedUni, // if passed
      // parent_id: selectedPrgm, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setCourses(decrypted);
        setLoading((prev) => ({ ...prev, course: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, course: false }));
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
      setLoading((prev) => ({ ...prev, course: false }));
    }
  };
  const getLeadOwnerList = async () => {
    setLoading((prev) => ({ ...prev, owner: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedUni,
      status: "Active",
    };
    try {
      const result = await getUniUserListAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setLeadOwners(decrypted);
        setLoading((prev) => ({ ...prev, owner: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, owner: false }));
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
      setLoading((prev) => ({ ...prev, owner: false }));
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
        //here all active universities will be fetched by default don't need to pass user specific leads
        setUniversities(decrypted);
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
    getChannelList();
    getStagesOptions();
  }, []);

  useEffect(() => {
    if (selectedStage) {
      getSubStageOptions();
    }
  }, [selectedStage]);

  useEffect(() => {
    if (selectedUni) {
      getLeadOwnerList();
      // getProgramList();
      getCoursesList();
    }
  }, [selectedUni]);

  // useEffect(() => {
  //   if (selectedPrgm) {
  //     getCoursesList();
  //   }
  // }, [selectedPrgm]);

  useEffect(() => {
    if (selectedChannel) {
      getMediumList();
    }
  }, [selectedChannel]);

  const handleFileUpload = (e) => {
    const fileuploaded = e.target.files[0];

    if (fileuploaded) {
      setFile(fileuploaded);
      // Check for PDF file type
      if (fileuploaded.type !== "text/csv") {
        setError(t("leads.400359"));
        // Clear the input value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        return;
      }

      setError(null);
      setUploading(true);
      setUploadProgress(0);
      setFile(fileuploaded);

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            setUploading(false);
            setUploadedFile(fileuploaded.name);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
  };

  const handleCancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setFile(null);
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSampleCsv = async () => {
    setLoading((prev) => ({ ...prev, download: true }));
    const csrfToken = await getCsrfToken();
    try {
      const result = await downloadSampleLeadAction(csrfToken);

      if (result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final download", decrypted);

        // Create a Blob from the CSV data
        const blob = new Blob([decrypted], { type: "text/csv" });

        // Create a link element to download the Blob as a CSV file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Lead_Template.csv";

        // Programmatically click the link to trigger the download
        link.click();

        setLoading((prev) => ({ ...prev, download: false }));
      } else {
        setLoading((prev) => ({ ...prev, download: false }));
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
      setLoading((prev) => ({ ...prev, download: false }));
      console.error("Unexpected error:", error);
    }
  };

  const handleUploadLeads = async (values) => {
    console.log("values", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();

    const formData = new FormData();
    formData.append("university_interested", values?.university);
    // formData.append("program_interested", values?.program);
    formData.append("course", values?.course);
    formData.append("lead_source", values?.leadSource);
    // formData.append("lead_channel", values?.leadSource);
    formData.append("source_medium", values?.sourceMedium);

    values.owner?.forEach((own, index) => {
      formData.append(`lead_owner[${index}]`, own);
    });

    formData.append("lead_status", values?.stage);
    formData.append("lead_sub_status", values?.subStage);

    formData.append(`lead_list`, file);

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const result = await bulkLeadUploadAction(csrfToken, formData);

      if (result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final bulk submit", decrypted);

        // setResponse(decrypted);
        if (decrypted?.success) {
          setResponse(decrypted);
          showSnackbar({
            message: `${decrypted.message}`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
          scrollToTop();
          onClose();
        }

        setLoading((prev) => ({ ...prev, submit: false }));

        handleDataChange();
      } else {
        setLoading((prev) => ({ ...prev, submit: false }));
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
      setLoading((prev) => ({ ...prev, submit: false }));
      console.error("Unexpected error:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth", // Optional: for smooth scrolling
      });
    }
  };

  return (
    <div
      className="import-user-modal map-roles-modal-user"
      id="import-user-modal"
    >
      <div className="modal-header-roles" id="modal-header-roles">
        <h2>{t("leads.led_import_leads")}</h2>
        <div
          id="leads-import-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div className="modal-body" id="modal-body">
        {/* Upload CSV Section */}
        <div
          className="upload-section leadUpload"
          ref={scrollRef}
          id="upload-section"
        >
          {/* disclamer section */}
          <div className="disclaimer_section" id="disclaimer-section">
            <div className="title-section" id="title-section">
              <AlertIcon />
              <h2 className="disclaimer_title">{t("leads.led_follow_inst")}</h2>
            </div>
            <div id="disclaimer-content">
              <ComponentIcon />
              <p className="disclaimer_descr">
                {t("leads.led_csv_limit_error")}
              </p>
            </div>
            {/* <div>
            <ComponentIcon />
            <p className="file_size_section">
              You cannot upload more than 5 files at the same time.
            </p>
          </div>
          <a className="know_more">Know more</a> */}
          </div>

          {/* Sample Format Section */}
          <div
            className="sample-format import_leads"
            id="sample-format-section"
          >
            <div className="sample-content" id="sample-content">
              <span className="sample-icon">
                <ExcelIcon />
                {t("imortusermodal.impu_sample_format_label")}
              </span>
              <p style={{ width: "450px" }}>
                {t("imortusermodal.impu_sample_format_description")}
              </p>
            </div>
            <button
              id="leads-import-download-btn"
              className="download-btn"
              onClick={() => handleSampleCsv()}
            >
              {loading?.download ? (
                <CircularProgress size={25} color="#000" />
              ) : (
                <DownloadIcon />
              )}
            </button>
          </div>

          <div
            className={`upload-box ${error && "error-upload-box"} ${
              response?.success && "report"
            }`}
            id="upload-box"
          >
            <input
              disabled={response?.success}
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileUpload}
              ref={fileInputRef}
            />

            {!uploading && (!uploadedFile || error) && (
              <div className="upload-content" id="upload-content">
                <span className={`upload-icon ${error && "error"}`}>
                  {error ? <ErrorIcon /> : <UploadIcon />}
                </span>
                {error ? (
                  <p className={`upload-description ${error && "error"}`}>
                    {file?.name}
                    <span>
                      <button
                        className="change-btn"
                        onClick={() =>
                          document.getElementById("fileInput").click()
                        }
                      >
                        {t("imortusermodal.impu_import_change")}
                      </button>
                    </span>
                  </p>
                ) : (
                  <p className="upload-description">
                    {t("imortusermodal.impu_upload_section_drag_and_drop")}
                    <span
                      className="upload-link"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    >
                      {t("imortusermodal.impu_upload_section_click_to_upload")}{" "}
                    </span>
                  </p>
                )}
              </div>
            )}

            {uploading && (
              <div
                className="upload-progress-circle"
                id="upload-progress-circle"
              >
                <CircularProgress
                  variant="determinate"
                  value={uploadProgress}
                  size={80}
                  thickness={4}
                />
                {/* <div className="progress-text">
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    {`${uploadProgress}%`}
                  </Typography>
                </div> */}
                <p>
                  {t("imortusermodal.impu_import")} {uploadProgress}%
                </p>
                <button
                  id="leads-import-cancel-upload-btn"
                  className="cancel-btn"
                  onClick={handleCancelUpload}
                >
                  {t("imortusermodal.impu_buttons_cancel")}
                </button>
              </div>
            )}

            {uploadedFile && !uploading && !error && !response?.success && (
              <div className="upload-success" id="upload-success">
                <div className="check-circle" id="check-circle">
                  <CheckIcon />
                </div>
                <h3>{t("leads.led_success")}/</h3>
                <div id="upload-success-content">
                  <span>{t("leads.led_csv_uploaded")}</span>
                  <div className="file_change" id="file-change">
                    <span>{uploadedFile}</span>
                    <button
                      id="leads-import-change-file-btn"
                      className="change-btn"
                      onClick={() => {
                        // document.getElementById("fileInput").click()
                        const fileInput = document.getElementById("fileInput");
                        if (fileInput) {
                          fileInput.value = ""; // Reset the value to trigger change
                        }
                        fileInput.click();
                      }}
                    >
                      {t("imortusermodal.impu_import_change")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {file && response?.success && !uploading && (
              <div id="upload_success" className="upload-success-report">
                <div className="file-name-size" id="file-name-size">
                  <ExcelIcon />
                  <div className="file_text" id="file-text">
                    <h4>{file?.name}</h4>
                    <span>{formatFileSize(file?.size)}</span>
                  </div>
                </div>
                <div className="total_and_duplicate" id="total-and-duplicate">
                  <div style={{ textAlign: "left" }} id="total-records">
                    <p>{t("leads.led_leads_in_file")}</p>
                    <h2>{response?.total_records || 0}</h2>
                  </div>
                  <div style={{ textAlign: "left" }} id="duplicate-count">
                    <p>{t("leads.led_duplicate_leads")}</p>
                    <h2>{response?.duplicate_count || 0}</h2>
                  </div>
                </div>
                <div className="total_errors" id="total-errors">
                  <div
                    style={{
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 10,
                    }}
                    id="errors-container"
                  >
                    <div id="failure-count">
                      <p>{t("leads.led_file_errors")}</p>
                      <h2>{response?.failure_count || 0}</h2>
                    </div>

                    {(response?.failure_count > 0 ||
                      response?.duplicate_count > 0) && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                        }}
                        id="download-failed-container"
                      >
                        {loading?.err_download && (
                          <CircularProgress size={17} color="#000" />
                        )}
                        <IconButton
                          sx={{
                            "&:hover": {
                              backgroundColor: "transparent",
                              boxShadow: "none",
                            },
                            width: 40,
                            height: 20,
                            padding: 0,
                          }}
                        >
                          <DownloadIcon
                            id="leads-import-download-failed-file-btn"
                            fontSize="small"
                            onClick={() => {
                              setLoading((prev) => ({
                                ...prev,
                                err_download: true,
                              }));

                              window.open(
                                `${response?.failed_records_file}`,
                                "_blank"
                              );

                              setTimeout(() => {
                                setLoading((prev) => ({
                                  ...prev,
                                  err_download: false,
                                }));
                              }, 3000);
                            }}
                          />{" "}
                        </IconButton>
                        <span>{t("leads.led_dwnd_fail_leads")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                margin: "8px 0px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              id="error-message-container"
            >
              <Alert
                id="leads-import-error-alert"
                style={{
                  width: "100%",
                  borderRadius: 8,
                }}
                icon={<AlertError />}
                severity="error"
                onClose={() => {
                  handleCancelUpload();
                  // setError(null);
                  // setUploadedFile(null);
                }}
              >
                {error}
              </Alert>
            </div>
          )}

          <div className="file_size_section" id="file-size-section">
            <p>{t("leads.led_supported_file")}</p>
            {/* <p>{t("imortusermodal.imp_user_maxsize")}</p> */}
          </div>

          <div id="map-fields-section">
            <h2 className="import_leads_title">{t("leads.led_map_fields")}</h2>
            <Formik
              innerRef={formikRefLeadUpload}
              initialValues={{
                stage: "",
                subStage: "",
                university: "",
                // program: "",
                course: "",
                leadSource: "",
                sourceMedium: "",
                owner: [],
              }}
              validationSchema={uploadLeadValidationSchema}
              onSubmit={(values) => {
                if (file) {
                  handleUploadLeads(values);
                } else {
                  showSnackbar({
                    message: `${t("leads.led_upld_alrt")}`,
                    severity: "error",
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                }
              }}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form
                  className="leads_form_section"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "16px", // Spacing between grid items
                    alignItems: "start",
                  }}
                  id="leads-form"
                >
                  {/* University */}
                  <div className="form-group" id="university-form-group">
                    <label className="role-label" htmlFor="university">
                      {t("leads.csl_univ_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-import-university"
                      value={loading?.uni ? "loading" : values.university}
                      onChange={(e) => {
                        setFieldValue("university", e.target.value);
                        setSelectedUni(e.target.value);
                        setFieldValue("program", "");
                        setFieldValue("course", "");
                        setFieldValue("owner", "");
                      }}
                      disabled={response?.success}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.university && errors.university
                          ? "input-error"
                          : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.csl_univ_phldr")}
                      </MenuItem>
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
                          <MenuItem key={uni.id} value={uni.id}>
                            {uni.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="university"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Course  */}
                  <div className="form-group" id="course-form-group">
                    <label className="role-label" htmlFor="course">
                      {t("leads.csl_course_intrested")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-import-course-interesetd"
                      value={loading?.course ? "loading" : values.course}
                      disabled={!Boolean(selectedUni) || response?.success}
                      onChange={(e) => setFieldValue("course", e.target.value)}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.course && errors.course ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.csl_sel_course")}
                      </MenuItem>
                      {loading?.course ? (
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
                      ) : courses?.length === 0 || !courses ? (
                        <MenuItem disabled>{t("leads.cl_no_courses")}</MenuItem>
                      ) : (
                        courses?.length > 0 &&
                        courses?.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="course"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Source  */}
                  <div className="form-group" id="source-form-group">
                    <label className="role-label" htmlFor="leadSource">
                      {t("leads.csl_leadsource_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-import-source"
                      value={loading?.channel ? "loading" : values.leadSource}
                      onChange={(e) => {
                        setFieldValue("leadSource", e.target.value);
                        setSelectedChannel(e.target.value);
                      }}
                      disabled={response?.success}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.leadSource && errors.leadSource
                          ? "input-error"
                          : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.csl_leadsource_phldr")}
                      </MenuItem>
                      {loading?.channel ? (
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
                      ) : channelList?.length === 0 || !channelList ? (
                        <MenuItem disabled>
                          {t("leads.cl_no_lead_sources")}
                        </MenuItem>
                      ) : (
                        channelList?.length > 0 &&
                        channelList?.map((ch) => (
                          <MenuItem key={ch.id} value={ch.id}>
                            {ch.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="leadSource"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Medium  */}
                  <div className="form-group" id="medium-form-group">
                    <label className="role-label" htmlFor="sourceMedium">
                      {t("leads.csl_sourcemedium_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-import-medium"
                      value={loading?.medium ? "loading" : values.sourceMedium}
                      disabled={!Boolean(selectedChannel) || response?.success}
                      onChange={(e) =>
                        setFieldValue("sourceMedium", e.target.value)
                      }
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.sourceMedium && errors.sourceMedium
                          ? "input-error"
                          : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.csl_sourcemedium_phldr")}
                      </MenuItem>
                      {loading?.medium ? (
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
                      ) : mediumList?.length === 0 || !mediumList ? (
                        <MenuItem disabled>{t("leads.cl_no_mediums")}</MenuItem>
                      ) : (
                        mediumList?.length > 0 &&
                        mediumList?.map((md) => (
                          <MenuItem key={md.id} value={md.id}>
                            {md.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="sourceMedium"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Stage  */}
                  <div className="form-group" id="stage-form-group">
                    <label className="role-label" htmlFor="stage">
                      {t("leads.esl_lead_stage")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-import-stage"
                      value={loading?.stages ? "loading" : values.stage}
                      onChange={(e) => {
                        setFieldValue("stage", e.target.value);
                        setFieldValue("subStage", "");
                        setSelectedStage(e.target.value);
                      }}
                      disabled={response?.success}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.stage && errors.stage ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.el_select_stage")}
                      </MenuItem>
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
                        stageOptions?.length > 0 &&
                        stageOptions?.map((stage) => (
                          <MenuItem key={stage?.id} value={stage?.id}>
                            <Chip
                              label={stage?.name}
                              variant="filled"
                              size="small"
                              sx={{
                                color: stage?.txt_color,
                                backgroundColor: stage?.bg_color,
                                fontWeight: 400,
                              }}
                            />
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="stage"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Sub-Stage  */}
                  <div className="form-group" id="sub-stage-form-group">
                    <label className="role-label" htmlFor="subStage">
                      {t("leads.esl_lead_sub_stage")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-import-sub-stage"
                      value={loading?.subStage ? "loading" : values.subStage}
                      onChange={(e) => {
                        setFieldValue("subStage", e.target.value);
                      }}
                      disabled={!Boolean(selectedStage) || response?.success}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.subStage && errors.subStage ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.el_select_sub_stage")}
                      </MenuItem>
                      {loading?.subStage ? (
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
                      ) : subStageOptions?.length === 0 || !subStageOptions ? (
                        <MenuItem disabled>
                          {t("leads.el_no_sub_stages")}
                        </MenuItem>
                      ) : (
                        subStageOptions?.length > 0 &&
                        subStageOptions?.map((subStage) => (
                          <MenuItem key={subStage?.id} value={subStage?.id}>
                            <Chip
                              label={subStage?.name}
                              variant="filled"
                              size="small"
                              avatar={
                                <div
                                  style={{
                                    backgroundColor: subStage?.txt_color, // Color of the dot
                                    width: 8, // Size of the dot
                                    height: 8, // Size of the dot
                                    borderRadius: "50%", // Circular shape
                                  }}
                                />
                              }
                              sx={{
                                // color: subStage?.txt_color,
                                backgroundColor: subStage?.bg_color,
                                fontWeight: 400,
                              }}
                            />
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="subStage"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Owner  */}
                  <div className="form-group" id="owner-form-group">
                    <label className="role-label" htmlFor="owner">
                      {t("leads.csl_owner_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>

                    {/* new logic */}
                    <Select
                      id="bulk-leads-owner"
                      displayEmpty
                      renderValue={(selected) => {
                        if (loading.owner) {
                          return (
                            <Box display="flex" alignItems="center">
                              <CircularProgress
                                size={20}
                                color="#000"
                                sx={{ marginRight: 1 }}
                              />
                              {t("editusermodal.loading")}
                            </Box>
                          );
                        }

                        const selectedArray = Array.isArray(selected)
                          ? selected
                          : [];

                        return (
                          <span
                            style={{
                              color:
                                selectedArray.length === 0 ? "#aaa" : "inherit",
                            }}
                          >
                            {selectedArray.length === 0
                              ? t("manage_template.mt_selec_counsellors")
                              : selectedArray
                                  .map(
                                    (id) =>
                                      leadOwners?.find(
                                        (item) => item.uuid === id
                                      )?.first_name
                                  )
                                  .join(", ")}
                          </span>

                          // <span
                          //   style={{
                          //     color:
                          //       selected?.length === 0 ? "#aaa" : "inherit",
                          //   }}
                          // >
                          //   {selected && selected?.length === 0
                          //     ? `${t("manage_template.mt_selec_counsellors")}`
                          //     : selected
                          //         ?.map(
                          //           (id) =>
                          //             leadOwners?.find(
                          //               (item) => item.uuid === id
                          //             )?.first_name
                          //         )
                          //         .join(", ")}
                          // </span>
                        );
                      }}
                      // value={loading.owner ? [] : values.owner}
                      value={Array.isArray(values.owner) ? values.owner : []}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes("all")) {
                          // If "Select All" is selected, either select all or deselect all
                          setFieldValue(
                            "owner",
                            values?.owner?.length === leadOwners?.length
                              ? []
                              : leadOwners.map((item) => item.uuid)
                          );
                        } else {
                          setFieldValue("owner", value);
                        }
                      }}
                      multiple
                      IconComponent={ChevronDown}
                      fullWidth
                      disabled={response?.success}
                      className={
                        touched.owner && errors.owner ? "input-error" : ""
                      }
                      style={{ height: "40px", width: "340px" }}
                    >
                      {/* Placeholder item, will only show when nothing is selected */}
                      <MenuItem disabled value="">
                        <span style={{ color: "#aaa" }}>
                          {t("manage_template.mt_selec_counsellors")}
                        </span>
                      </MenuItem>
                      {/* "Select All" option */}
                      {leadOwners?.length > 1 && (
                        <MenuItem value="all">
                          <Checkbox
                            id="manage-rules-all"
                            checked={
                              values.owner?.length === leadOwners?.length
                            }
                            // indeterminate={
                            //   values.user_id?.length > 0 &&
                            //   values.user_id?.length < counsellors?.length
                            // }
                          />
                          <span>{t("buttons.buttons_all")}</span>
                        </MenuItem>
                      )}

                      {loading.owner ? (
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
                      ) : leadOwners?.length === 0 || !leadOwners ? (
                        <MenuItem disabled>
                          {t("rules.rule_no_consoll_avaliable")}
                        </MenuItem>
                      ) : (
                        leadOwners?.length > 0 &&
                        leadOwners.map((item) => {
                          return (
                            <MenuItem key={item.uuid} value={item.uuid}>
                              <Checkbox
                                id={`manage-rules-${item?.uuid}`}
                                checked={values?.owner?.includes(item.uuid)}
                              />
                              <span className="map-role-item">
                                {item?.first_name} {item?.last_name}
                              </span>
                            </MenuItem>
                          );
                        })
                      )}
                    </Select>

                    <ErrorMessage
                      name="owner"
                      component="div"
                      className="error-message"
                    />
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="modal-footer" id="modal-footer">
        <Button
          id="leads-import-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("imortusermodal.impu_buttons_cancel")}
        </Button>
        <Button
          id="leads-import-submit-btn"
          variant="contained"
          color="success"
          className="map-button"
          onClick={() => formikRefLeadUpload.current.submitForm()}
          disabled={response?.success || uploading}
          style={{ marginRight: "20px" }}
        >
          {loading?.submit ? (
            <CircularProgress size={25} color="#000" />
          ) : (
            t("imortusermodal.impu_buttons_save")
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImportLeads;
