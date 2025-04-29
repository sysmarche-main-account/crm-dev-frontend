"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Box,
  TextField,
} from "@mui/material";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useSelector } from "react-redux";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { masterDDAction } from "@/app/actions/commonActions";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import {
  getAllLeadStatusAction,
  singleLeadDetailsAction,
  updateSingleLeadAction,
} from "@/app/actions/leadActions";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getUniUserListAction } from "@/app/actions/userActions";
import { getToken } from "@/utils/getToken";

const EditSingleLead = ({ onClose, lead, action, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const formikRefEditLead = useRef();

  const editLeadValidationSchema = Yup.object({
    fullName: Yup.string()
      .min(1)
      // .matches(/^[A-Za-z ]+$/, t("leads.400344"))
      .required(t("leads.400151"))
      .trim()
      .transform((value) => value?.trim()),
    stage: Yup.number().required(t("leads.400349")),
    subStage: Yup.number().required(t("leads.400352")),
    mobileNo: Yup.string()
      .matches(/^\d{10}$/, t("leads.400345"))
      .required(t("leads.400016"))
      .trim()
      .transform((value) => value?.trim()),
    alt_mobileNo: Yup.string()
      .matches(/^\d{10}$/, t("leads.400345"))
      // .required(t("leads.400016"))
      .trim()
      .transform((value) => value?.trim()),
    dob: Yup.date(),
    gender: Yup.string(),
    // gender: Yup.string().required(t("leads.400165")),
    email: Yup.string()
      .email()
      .required(t("leads.400153"))
      .trim()
      .transform((value) => value?.trim()),
    alternateEmail: Yup.string()
      .email()
      // .required(t("leads.400153"))
      .trim()
      .transform((value) => value?.trim()),
    // program: Yup.number().required(t("leads.400154")),
    university: Yup.number().required(t("leads.400155")),
    course: Yup.number().required(t("leads.400346")),
    leadSource: Yup.number().required(t("leads.400156")),
    sourceMedium: Yup.number().required(t("leads.400157")),
    owner: Yup.string().required(t("leads.400158")),
    timeToContact: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    // timeToContact: Yup.number(),
    // timeToContact: Yup.number().required(t("leads.400159")),
    campaignName: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    companyName: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    ctc: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    experience: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    remarks: Yup.string()
      .max(500)
      .trim()
      .transform((value) => value?.trim()),
    address: Yup.string()
      // .required(t("leads.400160"))
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    city: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    state: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    country: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    // city: Yup.number().required(t("leads.400163")),
    // state: Yup.number().required(t("leads.400162")),
    // country: Yup.number(),
    // pincode: Yup.string()
    //   .matches(/^[1-9][0-9]{5}$/, t("leads.400348"))
    //   .required(t("leads.400164"))
    //   .trim()
    //   .transform((value) => value?.trim()),
  });

  const [loading, setLoading] = useState({
    lead: false,
    stages: false,
    subStage: false,
    uni: false,
    program: false,
    course: false,
    channel: false,
    medium: false,
    owner: false,
    country: false,
    state: false,
    city: false,
    slot: false,
    campaign: false,
    submit: false,
  });
  const [leadData, setLeadData] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [stageOptions, setStageOptions] = useState(null);
  const [subStageOptions, setSubStageOptions] = useState(null);
  const [programs, setPrograms] = useState(null);
  const [courses, setCourses] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const [mediumList, setMediumList] = useState(null);
  const [leadOwners, setLeadOwners] = useState(null);
  const [slotList, setSlotList] = useState(null);
  const [countries, setCountries] = useState(null);
  const [states, setStates] = useState(null);
  const [cities, setCities] = useState(null);
  const [campaignList, setCampaignList] = useState(null);

  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  // const [selOwner, setSelOwner] = useState(leadData?.owner?.uuid);

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
      parent_id: leadData?.channel?.id, // if passed
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
  const getSlotList = async () => {
    setLoading((prev) => ({ ...prev, slot: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["slot"], // mandatory input will be an array
      // parent_id: "0", // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setSlotList(decrypted);
        setLoading((prev) => ({ ...prev, slot: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, slot: false }));
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
      setLoading((prev) => ({ ...prev, slot: false }));
    }
  };
  const getProgramList = async () => {
    setLoading((prev) => ({ ...prev, program: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // status: "1", // optional input will be integer
      identifier: ["program"], // mandatory input will be an array
      parent_id: leadData?.university_interested?.id, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final program", decrypted);

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
      parent_id: leadData?.university_interested?.id, // if passed
      // parent_id: leadData?.program_interested?.id, // if passed
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
      id: leadData?.university_interested?.id,
      status: "Active",
    };
    // console.log("body", reqbody);
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
  const getCampaignList = async () => {
    setLoading((prev) => ({ ...prev, campaign: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // status: "1", // optional input will be integer
      identifier: ["campaign_name"], // mandatory input will be an array
      // parent_id: selectedUni, // if passed
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
        setCampaignList(decrypted);
        setLoading((prev) => ({ ...prev, campaign: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, campaign: false }));
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
      setLoading((prev) => ({ ...prev, campaign: false }));
    }
  };
  const getStagesOptions = async () => {
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

  //**Region Options fetcher functions */
  const getCountriesList = async () => {
    setLoading((prev) => ({ ...prev, country: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["country"], // mandatory input will be an array
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
        setCountries(decrypted);
        setLoading((prev) => ({ ...prev, country: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, country: false }));
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
      setLoading((prev) => ({ ...prev, country: false }));
    }
  };
  const getStatesList = async () => {
    setLoading((prev) => ({ ...prev, state: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["state"], // mandatory input will be an array
      parent_id: selectedCountry, // if passed
      // parent_id: lead?.country, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setStates(decrypted);
        setLoading((prev) => ({ ...prev, state: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, state: false }));
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
      setLoading((prev) => ({ ...prev, state: false }));
    }
  };
  const getCitiesList = async () => {
    setLoading((prev) => ({ ...prev, city: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["city"], // mandatory input will be an array
      parent_id: selectedState, // if passed
      // parent_id: lead?.state, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setCities(decrypted);
        setLoading((prev) => ({ ...prev, city: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, city: false }));
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
      setLoading((prev) => ({ ...prev, city: false }));
    }
  };

  const getLeadData = async (lid) => {
    setLoading((prev) => ({ ...prev, lead: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: lid,
    };
    // console.log("body", reqbody);
    try {
      const result = await singleLeadDetailsAction(csrfToken, reqbody);
      // console.log("single lead result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final single lead", decrypted);

        setLeadData(decrypted);
        setLoading((prev) => ({ ...prev, lead: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, lead: false }));
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
      setLoading((prev) => ({ ...prev, lead: false }));
    }
  };

  useEffect(() => {
    getLeadData(lead);
  }, [lead]);

  useEffect(() => {
    if (leadData) {
      setSelectedStage(leadData?.lead_status?.id);
      // setSelectedCountry(leadData?.country?.id);
      // setSelectedState(leadData?.state?.id);
    }
  }, [leadData]);

  useEffect(() => {
    getUniversitiesList();
    getChannelList();
    getStagesOptions();
    // getCountriesList();
    // getSlotList();
    // getCampaignList();
  }, []);

  useEffect(() => {
    if (leadData?.university_interested?.id) {
      getLeadOwnerList();
      // getProgramList();
      getCoursesList();
    }
  }, [leadData?.university_interested]);

  // useEffect(() => {
  //   if (leadData?.program_interested?.id) {
  //     getCoursesList();
  //   }
  // }, [leadData?.program_interested]);

  useEffect(() => {
    if (selectedStage) {
      getSubStageOptions();
    }
  }, [selectedStage]);

  // useEffect(() => {
  //   if (selectedCountry) {
  //     getStatesList();
  //   }
  // }, [selectedCountry]);

  // useEffect(() => {
  //   if (selectedState) {
  //     getCitiesList();
  //   }
  // }, [selectedState]);

  useEffect(() => {
    if (leadData?.channel?.id) {
      getMediumList();
    }
  }, [leadData?.channel]);

  const handleEditSubmit = async (values) => {
    console.log("lead", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: lead?.id,
      full_name: values.fullName,
      mobile_number: values.mobileNo,
      alternate_mobile_number: values.alt_mobileNo,
      dob: values.dob,
      email: values.email,
      alternate_email: values.alternateEmail,
      university_interested: values.university, //from master table
      // program_interested: values.program, //from master table
      lead_channel: values.leadSource, // from master table
      source_medium: values.sourceMedium, //from master table
      lead_owner: values.owner, // from user tabel
      best_time_to_call: values.timeToContact, //from master table
      // pref_time_contact: values.timeToContact, //from master table
      campaign_name: values.campaignName,
      company_name: values.companyName,
      ctc_annual_package: values.ctc,
      experience: values.experience,
      remark: values.remarks,
      first_line_add: values.address,
      lead_status: values.stage,
      lead_sub_status: values.subStage,
      gender: values.gender,
      course: values.course,
      country: values.country, // master tabel
      state: values.state, // master table
      city: values.city, // master tabel
      // pincode: values.pincode,
    };
    console.log("body submit", reqbody);

    try {
      const result = await updateSingleLeadAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        onClose();
        handleDataChange();
        setLoading((prev) => ({ ...prev, submit: false }));
        showSnackbar({
          message: `<strong>${decrypted.full_name}</strong> ${t(
            "leads.led_update_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        formikRefEditLead.current.resetForm();
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

  return (
    <div className="map-roles-modal-user" id="leads-edit-lead-modal-container">
      <div className="modal-header-roles" id="leads-edit-lead-modal-header">
        <h2>{t("leads.esl_editLead")}</h2>
        <div
          id="leads-edit-lead-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      {loading?.lead ? (
        <div
          id="leads-edit-lead-loading-spinner"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress size={50} color="#000" />
        </div>
      ) : (
        <div
          className="modal-body"
          style={{ overflowY: "scroll" }}
          id="leads-edit-lead-modal-body"
        >
          <div
            className="modal-content-user-section"
            id="leads-edit-lead-modal-content"
          >
            <Formik
              debug
              innerRef={formikRefEditLead}
              initialValues={{
                fullName: leadData?.full_name || "",
                stage: leadData?.lead_status?.id || "",
                subStage: leadData?.lead_sub_status?.id || "",
                mobileNo: leadData?.mobile_number || "",
                alt_mobileNo: leadData?.alternate_mobile_number || "",
                dob: leadData?.dob || "",
                gender: leadData?.gender || "",
                email: leadData?.email || "",
                alternateEmail: leadData?.alternate_email || "",
                // program: leadData?.program_interested?.id || "",
                university: leadData?.university_interested?.id || "",
                course: leadData?.course?.id || "",
                leadSource: leadData?.channel?.id || "",
                sourceMedium: leadData?.source_medium?.id || "",
                owner: leadData?.owner?.uuid || "",
                timeToContact: leadData?.best_time_to_call || "",
                // timeToContact: leadData?.pref_time_contact?.id || "",
                campaignName: leadData?.campaign_name || "",
                companyName: leadData?.company_name || "",
                ctc: leadData?.ctc_annual_package || "",
                experience: leadData?.experience || "",
                remarks: leadData?.remark[0]?.comment || "",
                address: leadData?.first_line_add || "",
                city: leadData?.city || "",
                state: leadData?.state || "",
                country: leadData?.country || "",
                // pincode: leadData?.pincode || "",
              }}
              validationSchema={editLeadValidationSchema}
              onSubmit={(values) => handleEditSubmit(values)}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form id="leads-edit-lead-form">
                  <p id="leads-edit-lead-details-title">
                    {t("leads.esl_leadDetails")}
                  </p>

                  {/* full_name */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-full-name-container"
                  >
                    <label htmlFor="fullName" className="role-label">
                      {t("leads.esl_fn")}
                      <span style={{ color: "#F00" }}>*</span>
                    </label>
                    <Field
                      id="leads-edit-lead-full-name"
                      type="text"
                      name="fullName"
                      disabled={["owner", "state"].includes(action)}
                      placeholder={t("leads.esl_fn_phldr")}
                      className={
                        touched.fullName && errors.fullName ? "input-error" : ""
                      }
                    />

                    <ErrorMessage
                      name="fullName"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* stage */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-stage-container"
                  >
                    <FormControl fullWidth margin="none">
                      <label htmlFor="stage" className="role-label">
                        {t("leads.esl_lead_stage")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="leads-edit-lead-stage"
                        disabled={["owner"].includes(action) || true}
                        value={loading?.stages ? "loading" : values.stage}
                        onChange={(e) => {
                          setFieldValue("stage", e.target.value);
                          setFieldValue("subStage", "");
                          setSelectedStage(e.target.value);
                        }}
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
                          <MenuItem disabled>
                            {t("leads.el_no_stages")}
                          </MenuItem>
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
                    </FormControl>
                  </div>

                  {/* substage */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-sub-stage-container"
                  >
                    <FormControl fullWidth margin="none">
                      <label htmlFor="subStage" className="role-label">
                        {t("leads.esl_lead_sub_stage")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="leads-edit-lead-sub-stage"
                        disabled={["owner"].includes(action) || true}
                        value={loading?.subStage ? "loading" : values.subStage}
                        onChange={(e) => {
                          setFieldValue("subStage", e.target.value);
                        }}
                        displayEmpty
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.subStage && errors.subStage
                            ? "input-error"
                            : ""
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
                        ) : subStageOptions?.length === 0 ||
                          !subStageOptions ? (
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
                    </FormControl>
                  </div>

                  {/* mobile no */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-mobile-no-container"
                  >
                    <label htmlFor="mobileNo" className="role-label">
                      {t("leads.esl_mn")}
                      <span style={{ color: "#F00" }}>*</span>
                    </label>
                    <Field
                      id="leads-edit-lead-mobile-no"
                      disabled
                      type="number"
                      name="mobileNo"
                      placeholder={t("leads.esl_mn_")}
                      className={
                        touched.mobileNo && errors.mobileNo ? "input-error" : ""
                      }
                    />

                    <ErrorMessage
                      name="mobileNo"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/*Alt mobile number */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-alt-mobile-no-container"
                  >
                    <label htmlFor="alt_mobileNo" className="role-label">
                      Alternate Mobile number
                    </label>
                    <Field
                      id="leads-create-lead-alternate-mobile-no"
                      type="number"
                      name="alt_mobileNo"
                      placeholder="Enter your alternate mobile number"
                      disabled={["owner", "state"].includes(action)}
                      className={
                        touched.alt_mobileNo && errors.alt_mobileNo
                          ? "input-error"
                          : ""
                      }
                    />

                    <ErrorMessage
                      name="alt_mobileNo"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* dob */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-dob-container"
                  >
                    <label htmlFor="dob" className="role-label">
                      {t("leads.esl_dob")}
                    </label>
                    <Field
                      id="leads-edit-lead-dob"
                      type="date"
                      name="dob"
                      disabled={["owner", "state"].includes(action)}
                      placeholder={t("leads.esl_dob_phldr")}
                      className={touched.dob && errors.dob ? "input-error" : ""}
                    />

                    <ErrorMessage
                      name="dob"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* gender */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-gender-container"
                  >
                    <label htmlFor="gender" className="role-label">
                      {t("leads.esl_gender")}{" "}
                      <span style={{ color: "#F00" }}>*</span>
                    </label>

                    <div
                      role="group"
                      aria-labelledby="gender"
                      className="lead-modal-gender"
                      id="leads-edit-lead-gender-group"
                    >
                      <label
                        className="lead-modal-gender-prisect"
                        htmlFor="male"
                      >
                        <Field
                          id="leads-edit-lead-gender-m"
                          type="radio"
                          name="gender"
                          value="m"
                          disabled={["owner", "state"].includes(action)}
                        />
                        {t("leads.esl_male")}
                      </label>
                      <label
                        className="lead-modal-gender-prisect"
                        htmlFor="female"
                      >
                        <Field
                          id="leads-edit-lead-gender-f"
                          type="radio"
                          name="gender"
                          value="f"
                          disabled={["owner", "state"].includes(action)}
                        />
                        {t("leads.esl_female")}
                      </label>
                      <label
                        className="lead-modal-gender-prisect"
                        htmlFor="other"
                      >
                        <Field
                          id="leads-edit-lead-gender-o"
                          type="radio"
                          name="gender"
                          value="o"
                          disabled={["owner", "state"].includes(action)}
                        />
                        {t("leads.esl_other")}
                      </label>
                    </div>
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* email */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-email-container"
                  >
                    <label htmlFor="email" className="role-label">
                      {t("leads.esl_email_lab")}
                      <span style={{ color: "#F00" }}>*</span>
                    </label>
                    <Field
                      id="leads-edit-lead-email"
                      type="email"
                      name="email"
                      disabled={["owner", "state"].includes(action)}
                      placeholder={t("leads.esl_email_phldr")}
                      className={
                        touched.email && errors.email ? "input-error" : ""
                      }
                    />

                    <ErrorMessage
                      name="email"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* alternate_email */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-alternate-email-container"
                  >
                    <label htmlFor="alternateEmail" className="role-label">
                      {t("leads.esl_alternate_email")}
                    </label>
                    <Field
                      id="leads-edit-lead-alternate-email"
                      type="alternateEmail"
                      name="alternateEmail"
                      disabled={["owner", "state"].includes(action)}
                      placeholder={t("leads.esl_alternateemail_phldr")}
                      className={
                        touched.alternateEmail && errors.alternateEmail
                          ? "input-error"
                          : ""
                      }
                    />

                    <ErrorMessage
                      name="alternateEmail"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* university */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-university-container"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="university">
                        {t("leads.esl_univ_interested")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="leads-edit-lead-university"
                        value={loading?.uni ? "loading" : values.university}
                        disabled
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
                          {t("leads.esl_select_univ")}
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
                          <MenuItem disabled>
                            {t("leads.cl_no_unives")}
                          </MenuItem>
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
                    </FormControl>
                  </div>

                  {/* course */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-course-container"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="course">
                        {t("leads.csl_course_intrested")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="leads-edit-lead-course"
                        disabled
                        value={loading?.course ? "loading" : values.course}
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
                          <MenuItem disabled>
                            {t("leads.cl_no_courses")}
                          </MenuItem>
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
                    </FormControl>
                  </div>

                  {/* lead source */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-source-container"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="leadSource">
                        {t("leads.esl_leadsource")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="leads-edit-lead-source"
                        disabled
                        value={loading?.channel ? "loading" : values.leadSource}
                        onChange={(e) => {
                          setFieldValue("leadSource", e.target.value);
                        }}
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
                          {t("leads.esl_selecteadsource")}
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
                          <MenuItem disabled>No Channels available</MenuItem>
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
                    </FormControl>
                  </div>

                  {/* medium */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-medium-container"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="sourceMedium">
                        {t("leads.esl_sourcemedium")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="leads-edit-lead-medium"
                        disabled
                        value={
                          loading?.medium ? "loading" : values.sourceMedium
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
                          {t("leads.esl_selectsourceMedium")}
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
                          <MenuItem disabled>
                            {t("leads.cl_no_mediums")}
                          </MenuItem>
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
                    </FormControl>
                  </div>

                  {/* lead owner */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-owner-container"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="owner">
                        {t("leads.esl_leadowner")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="leads-edit-lead-owner"
                        disabled={["state"].includes(action)}
                        value={loading?.owner ? "loading" : values.owner}
                        onChange={(e) => {
                          setFieldValue("owner", e.target.value);
                        }}
                        displayEmpty
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.owner && errors.owner ? "input-error" : ""
                        }
                        style={{ height: "40px" }}
                      >
                        <MenuItem disabled value="">
                          {t("leads.esl_selectleadowner")}
                        </MenuItem>
                        {loading?.owner ? (
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
                            {t("leads.cl_no_owners")}
                          </MenuItem>
                        ) : (
                          leadOwners?.length > 0 &&
                          leadOwners?.map((owner) => (
                            <MenuItem key={owner?.uuid} value={owner?.uuid}>
                              {owner?.first_name} {owner?.last_name}
                            </MenuItem>
                          ))
                        )}
                      </Select>

                      <ErrorMessage
                        name="owner"
                        component="div"
                        className="error-message"
                      />
                    </FormControl>
                  </div>

                  {/* time to contact */}
                  {/* Best time to call */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-time-to-contact-container"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="timeToContact">
                        Best time to call
                        {/* {t("leads.esl_timetocontact")} */}
                      </label>
                      <Field
                        id="leads-edit-lead-time-to-connect"
                        type="text"
                        name="timeToContact"
                        placeholder="Enter time to call"
                        disabled={["owner", "state"].includes(action)}
                        className={
                          touched.timeToContact && errors.timeToContact
                            ? "input-error"
                            : ""
                        }
                      />
                      {/* <Select
                        id="leads-edit-lead-time-to-connect"
                        disabled={["owner", "state"].includes(action)}
                        value={loading?.slot ? "loading" : values.timeToContact}
                        onChange={(e) =>
                          setFieldValue("timeToContact", e.target.value)
                        }
                        displayEmpty
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.timeToContact && errors.timeToContact
                            ? "input-error"
                            : ""
                        }
                        style={{ height: "40px" }}
                      >
                        <MenuItem disabled value="">
                          {t("leads.esl_selecttimetocontact")}
                        </MenuItem>
                        {loading?.slot ? (
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
                        ) : slotList?.length === 0 || !slotList ? (
                          <MenuItem disabled>
                            {t("leads.cl_no_time_slots")}
                          </MenuItem>
                        ) : (
                          slotList?.length > 0 &&
                          slotList?.map((sl) => (
                            <MenuItem key={sl.id} value={sl.id}>
                              {sl.name}
                            </MenuItem>
                          ))
                        )}
                      </Select> */}

                      <ErrorMessage
                        name="timeToContact"
                        component="div"
                        className="error-message"
                      />
                    </FormControl>
                  </div>

                  {/* Campaign Name */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-campaign-container"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="campaignName">
                        Campaign name
                      </label>
                      <Field
                        id="leads-create-lead-campaign-name"
                        type="text"
                        name="campaignName"
                        placeholder="Enter campaign name"
                        disabled={["owner", "state"].includes(action)}
                        className={
                          touched.campaignName && errors.campaignName
                            ? "input-error"
                            : ""
                        }
                      />
                      {/* <Select
                        id="leads-edit-lead-campaign-name"
                        value={
                          loading?.campaign ? "loading" : values.campaignName
                        }
                        onChange={(e) =>
                          setFieldValue("campaignName", e.target.value)
                        }
                        disabled={["owner", "state"].includes(action)}
                        displayEmpty
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.campaignName && errors.campaignName
                            ? "input-error"
                            : ""
                        }
                        style={{ height: "40px" }}
                      >
                        <MenuItem disabled value="">
                          Select a Campaign Name
                        </MenuItem>
                        {loading?.campaign ? (
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
                        ) : campaignList?.length === 0 || !campaignList ? (
                          <MenuItem disabled>No Campaign Names</MenuItem>
                        ) : (
                          campaignList?.length > 0 &&
                          campaignList?.map((camp) => (
                            <MenuItem key={camp.id} value={camp.id}>
                              {camp.name}
                            </MenuItem>
                          ))
                        )}
                      </Select> */}

                      <ErrorMessage
                        name="campaignName"
                        component="div"
                        className="error-message"
                      />
                    </FormControl>
                  </div>

                  {/* Company Name */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-company-container"
                  >
                    <label className="role-label" htmlFor="companyName">
                      Company Name / Industry Name
                    </label>
                    <Field
                      id="leads-edit-lead-company-name"
                      type="text"
                      name="companyName"
                      disabled={["owner", "state"].includes(action)}
                      placeholder="Enter Company/Industry name"
                      className={
                        touched.companyName && errors.companyName
                          ? "input-error"
                          : ""
                      }
                    />

                    <ErrorMessage
                      name="companyName"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* CTC */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-ctc-container"
                  >
                    <label className="role-label" htmlFor="ctc">
                      CTC / Annual package
                    </label>
                    <Field
                      id="leads-edit-lead-ctc"
                      type="text"
                      name="ctc"
                      disabled={["owner", "state"].includes(action)}
                      placeholder="Enter CTC/Annual package"
                      className={touched.ctc && errors.ctc ? "input-error" : ""}
                    />

                    <ErrorMessage
                      name="ctc"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Experience */}
                  <div
                    className="form-group-user"
                    id="leads-edit-lead-experience-container"
                  >
                    <label className="role-label" htmlFor="experience">
                      Experience
                    </label>
                    <Field
                      id="leads-edit-lead-full-name"
                      type="text"
                      name="experience"
                      disabled={["owner", "state"].includes(action)}
                      placeholder="Enter Experience"
                      className={
                        touched.experience && errors.experience
                          ? "input-error"
                          : ""
                      }
                    />

                    <ErrorMessage
                      name="experience"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  {/* Remarks */}
                  {/* <div className="form-group-user"> */}
                  <div
                    className="form-group full-width-field"
                    id="leads-edit-lead-remarks-container"
                  >
                    <label className="role-label" htmlFor="remarks">
                      Remarks
                    </label>
                    <Field
                      id="leads-edit-lead-remarks"
                      style={{ width: "100%" }}
                      disabled={["owner", "state"].includes(action)}
                      as={TextField}
                      multiline
                      rows={3.4}
                      name="remarks"
                      placeholder="Enter remarks here"
                      className={
                        touched.remarks && errors.remarks ? "input-error" : ""
                      }
                    />
                    <ErrorMessage
                      name="remarks"
                      component="div"
                      className="error-message"
                    />
                  </div>

                  <p id="leads-edit-lead-address-title">
                    {t("leads.esl_addressDetails")}
                  </p>

                  <div
                    id="leads-edit-lead-address-section"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      gap: 5,
                    }}
                  >
                    {/* address */}
                    <div
                      className="form-group-user"
                      id="leads-edit-lead-address-field-container"
                    >
                      <label htmlFor="address" className="role-label">
                        {t("leads.esl_firstLineaddress")}
                      </label>
                      <Field
                        id="leads-edit-lead-address"
                        disabled={["owner", "state"].includes(action)}
                        style={{ width: "100%" }}
                        as={TextField}
                        multiline
                        rows={6.5}
                        name="address"
                        placeholder={t("leads.esl_address_phldr")}
                        className={
                          touched.address && errors.address ? "input-error" : ""
                        }
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </div>

                  <div
                    id="leads-edit-lead-location-fields-container"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      gap: 5,
                    }}
                  >
                    {/* pincode */}
                    {/* <div className="form-group-user">
                      <FormControl fullWidth>
                        <label className="role-label" htmlFor="pincode">
                          {t("leads.esl_pincode")}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <Field
                          id="leads-edit-lead-pincode"
                          type="text"
                          name="pincode"
                          disabled={["owner", "state"].includes(action)}
                          placeholder={t("leads.esl_pincode_phldr")}
                          className={
                            touched.pincode && errors.pincode
                              ? "input-error"
                              : ""
                          }
                        />

                        <ErrorMessage
                          name="pincode"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div> */}

                    {/* country */}
                    <div
                      className="form-group-user"
                      id="leads-edit-lead-country-container"
                    >
                      <FormControl fullWidth>
                        <label className="role-label" htmlFor="country">
                          {t("leads.esl_country")}
                        </label>
                        <Field
                          id="leads-create-lead-country"
                          type="text"
                          name="country"
                          placeholder="Enter country name"
                          disabled={["owner", "state"].includes(action)}
                          className={
                            touched.country && errors.country
                              ? "input-error"
                              : ""
                          }
                        />
                        {/* <Select
                          id="leads-edit-lead-country"
                          disabled={["owner", "state"].includes(action)}
                          value={loading?.country ? "loading" : values.country}
                          onChange={(e) => {
                            const countryId = e.target.value;
                            setSelectedCountry(countryId);
                            if (countryId === leadData?.country?.id) {
                              setFieldValue("country", e.target.value);
                              setFieldValue("state", leadData?.state?.id);
                              setFieldValue("city", leadData?.city?.id);
                            } else {
                              setFieldValue("country", e.target.value);
                              setFieldValue("state", "");
                              setFieldValue("city", "");
                            }
                          }}
                          displayEmpty
                          IconComponent={ChevronDown}
                          fullWidth
                          className={
                            touched.country && errors.country
                              ? "input-error"
                              : ""
                          }
                          style={{ height: "40px" }}
                        >
                          <MenuItem disabled value="">
                            {t("leads.esl_selectcountry")}
                          </MenuItem>
                          {loading?.country ? (
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
                          ) : countries?.length === 0 || !countries ? (
                            <MenuItem disabled>
                              {t("leads.cl_no_countries")}
                            </MenuItem>
                          ) : (
                            countries?.length > 0 &&
                            countries?.map((cty) => (
                              <MenuItem key={cty.id} value={cty.id}>
                                {cty.name}
                              </MenuItem>
                            ))
                          )}
                        </Select> */}

                        <ErrorMessage
                          name="country"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div>

                    {/* state */}
                    <div
                      className="form-group-user"
                      id="leads-edit-lead-state-container"
                    >
                      <FormControl fullWidth>
                        <label className="role-label" htmlFor="state">
                          {t("leads.esl_state")}
                        </label>
                        <Field
                          id="leads-create-lead-state"
                          type="text"
                          name="state"
                          placeholder="Enter state name"
                          disabled={["owner", "state"].includes(action)}
                          className={
                            touched.state && errors.state ? "input-error" : ""
                          }
                        />
                        {/* <Select
                          id="leads-edit-lead-state"
                          disabled={["owner", "state"].includes(action)}
                          value={loading?.state ? "loading" : values.state}
                          onChange={(e) => {
                            const stateId = e.target.value;
                            setSelectedState(stateId);
                            if (stateId === leadData?.state?.id) {
                              setFieldValue("state", e.target.value);
                              setFieldValue("city", leadData?.city?.id);
                            } else {
                              setFieldValue("state", e.target.value);
                              setFieldValue("city", "");
                            }
                          }}
                          displayEmpty
                          IconComponent={ChevronDown}
                          fullWidth
                          className={
                            touched.state && errors.state ? "input-error" : ""
                          }
                          style={{ height: "40px" }}
                        >
                          <MenuItem disabled value="">
                            {t("leads.esl_selectstate")}
                          </MenuItem>
                          {loading?.state ? (
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
                          ) : states?.length === 0 || !states ? (
                            <MenuItem disabled>
                              {t("leads.cl_no_states")}
                            </MenuItem>
                          ) : (
                            states?.length > 0 &&
                            states?.map((state) => (
                              <MenuItem key={state.id} value={state.id}>
                                {state.name}
                              </MenuItem>
                            ))
                          )}
                        </Select> */}

                        <ErrorMessage
                          name="state"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div>

                    {/* city */}
                    <div
                      className="form-group-user"
                      id="leads-edit-lead-city-container"
                    >
                      <FormControl fullWidth>
                        <label className="role-label" htmlFor="city">
                          {t("leads.esl_city")}
                        </label>
                        <Field
                          id="leads-create-lead-city"
                          type="text"
                          name="city"
                          placeholder="Enter city name"
                          disabled={["owner", "state"].includes(action)}
                          className={
                            touched.city && errors.city ? "input-error" : ""
                          }
                        />
                        {/* <Select
                          id="leads-edit-lead-city"
                          disabled={["owner", "state"].includes(action)}
                          value={loading?.city ? "loading" : values.city}
                          onChange={(e) =>
                            setFieldValue("city", e.target.value)
                          }
                          displayEmpty
                          IconComponent={ChevronDown}
                          fullWidth
                          className={
                            touched.city && errors.city ? "input-error" : ""
                          }
                          style={{ height: "40px" }}
                        >
                          <MenuItem disabled value="">
                            {t("leads.esl_selectcity")}
                          </MenuItem>
                          {loading?.city ? (
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
                          ) : cities?.length === 0 || !cities ? (
                            <MenuItem disabled>
                              {t("leads.cl_no_cities")}
                            </MenuItem>
                          ) : (
                            cities?.length > 0 &&
                            cities?.map((city) => (
                              <MenuItem key={city.id} value={city.id}>
                                {city.name}
                              </MenuItem>
                            ))
                          )}
                        </Select> */}

                        <ErrorMessage
                          name="city"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      <div className="modal-footer" id="leads-edit-lead-modal-footer">
        <Button
          id="leads-edit-lead-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("leads.esl_cancel")}
        </Button>
        <div id="leads-edit-lead-submit-button-container">
          <Button
            id="leads-edit-lead-submit-btn"
            variant="contained"
            color="success"
            className="map-role-button"
            onClick={() => formikRefEditLead.current.submitForm()}
            style={{ marginRight: "20px" }}
          >
            {loading?.submit ? (
              <CircularProgress size={20} color="#000" />
            ) : (
              t("leads.esl_save")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditSingleLead;
