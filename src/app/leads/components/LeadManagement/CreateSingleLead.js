"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  TextField,
} from "@mui/material";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import "@/styles/CreateUserModal.scss";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { masterDDAction } from "@/app/actions/commonActions";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { createSingleLeadAction } from "@/app/actions/leadActions";
import { useSelector } from "react-redux";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getUniUserListAction } from "@/app/actions/userActions";
import { getToken } from "@/utils/getToken";

const CreateSingleLead = ({ onClose, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const formikRefLead = useRef();
  const { details } = useSelector((state) => state.user);

  const createLeadValidationSchema = Yup.object({
    fullName: Yup.string()
      .min(1)
      .max(100)
      // .matches(/^[A-Za-z ]+$/, t("leads.400344"))
      .required(t("leads.400151"))
      .trim()
      .transform((value) => value?.trim()),
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
    // dob: Yup.date().required(t("leads.400152")),
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
    owner: Yup.string()
      .required(t("leads.400158"))
      .trim()
      .transform((value) => value?.trim()),
    timeToContact: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    // timeToContact: Yup.number(),
    // timeToContact: Yup.number().required(t("leads.400159")),
    // campaignName: Yup.number(),
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
    // city: Yup.number().required(t("leads.400163")),
    city: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    state: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    // state: Yup.number().required(t("leads.400162")),
    // country: Yup.number().required(t("leads.400161")),
    // country: Yup.number(),
    country: Yup.string()
      .max(100)
      .trim()
      .transform((value) => value?.trim()),
    // pincode: Yup.string()
    //   .matches(/^[1-9][0-9]{5}$/, t("leads.400348"))
    //   .required(t("leads.400164"))
    //   .trim()
    //   .transform((value) => value?.trim()),
  });

  const [reset, setReset] = useState(false);

  const [loading, setLoading] = useState({
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

  const [universities, setUniversities] = useState([]);
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
  const [selectedPrgm, setSelectedPrgm] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [selCountry, setSelCountry] = useState(null);
  const [selState, setSelState] = useState(null);

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

  //**Region Option fetcher functions */
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
      parent_id: selCountry, // if passed
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
      parent_id: selState, // if passed
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

  useEffect(() => {
    getUniversitiesList();
    getChannelList();
    // getCountriesList();
    // getSlotList();
    // getCampaignList();
  }, []);

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

  // useEffect(() => {
  //   if (selCountry) {
  //     getStatesList();
  //   }
  // }, [selCountry]);

  // useEffect(() => {
  //   if (selState) {
  //     getCitiesList();
  //   }
  // }, [selState]);

  useEffect(() => {
    if (selectedChannel) {
      getMediumList();
    }
  }, [selectedChannel]);

  const handleSubmit = async (values) => {
    console.log("lead", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      full_name: values.fullName,
      mobile_number: values.mobileNo,
      alternate_mobile_number: values.alt_mobileNo,
      dob: values.dob,
      email: values.email,
      gender: values.gender,
      alternate_email: values.alternateEmail,
      // program_interested: values.program, //from master table
      course: values.course,
      university_interested: values.university, //from master table
      lead_channel: values.leadSource, // from master table
      source_medium: values.sourceMedium, //from master table
      lead_owner: values.owner, // from user tabel
      // pref_time_contact: values.timeToContact, //from master table
      best_time_to_call: values.timeToContact, //from master table
      campaign_name: values.campaignName,
      company_name: values.companyName,
      ctc_annual_package: values.ctc,
      experience: values.experience,
      remark: values.remarks,
      first_line_add: values.address,
      country: values.country, // master tabel
      state: values.state, // master table
      city: values.city, // master tabel
      // pincode: values.pincode,
    };
    console.log("body", reqbody);

    try {
      const result = await createSingleLeadAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        handleDataChange();
        if (!reset) {
          onClose();
          setLoading((prev) => ({ ...prev, submit: false }));
          showSnackbar({
            message: `<strong>${decrypted.full_name}</strong> ${t(
              "leads.led_created_alert"
            )}`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
        setReset(!reset);
        formikRefLead.current.resetForm();
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

    // setLeads([
    //   ...leads,
    //   {
    //     ...values,
    //     id: leads.length + 1,
    //     name: values.fullName,
    //     mobile: values.mobileNo,
    //     dateOfBirth: values.dob,
    //     creator: values.owner,
    //     leadStage: "Untouched",
    //     created: new Date().toLocaleDateString("en-CA"),
    //     modified: new Date().toLocaleDateString("en-CA"),
    //     communication: ["call", "email", "message"],
    //   },
    // ]);
    // if (!reset) {
    //   onClose();
    // }
    // setReset(!reset);
    // formikRefLead.current.resetForm();
  };

  return (
    <div className="map-roles-modal-user" id="leads-create-lead-modal">
      <div className="modal-header-roles" id="leads-create-lead-modal-header">
        <h2 id="leads-create-lead-modal-title">{t("leads.csl_createlead")}</h2>
        <div
          id="leads-create-lead-cancel-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon id="leads-create-lead-close-icon" />
        </div>
      </div>
      <div
        className="modal-body"
        style={{ overflowY: "scroll" }}
        id="leads-create-lead-modal-body"
      >
        <div
          className="modal-content-user-section"
          id="leads-create-lead-form-container"
        >
          <Formik
            innerRef={formikRefLead}
            initialValues={{
              fullName: "",
              mobileNo: "",
              alt_mobileNo: "",
              dob: "",
              gender: "",
              email: "",
              alternateEmail: "",
              // program: "",
              course: "",
              university: "",
              leadSource: "",
              sourceMedium: "",
              owner: "",
              timeToContact: "",
              campaignName: "",
              companyName: "",
              ctc: "",
              experience: "",
              remarks: "",
              address: "",
              city: "",
              state: "",
              country: "",
              // pincode: "",
            }}
            validationSchema={createLeadValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form id="leads-create-lead-form">
                <p id="leads-create-lead-details-title">
                  {t("leads.csl_leaddetails")}
                </p>

                {/* Name */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-name-container"
                >
                  <label
                    htmlFor="fullName"
                    className="role-label"
                    id="leads-create-lead-name-label"
                  >
                    {t("leads.csl_fn_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  <Field
                    id="leads-create-lead-full-name"
                    type="text"
                    name="fullName"
                    placeholder={t("leads.csl_fn_phldr")}
                    className={
                      touched.fullName && errors.fullName ? "input-error" : ""
                    }
                  />

                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="error-message"
                    id="leads-create-lead-name-error"
                  />
                </div>

                {/* mobile number */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-mobile-container"
                >
                  <label
                    htmlFor="mobileNo"
                    className="role-label"
                    id="leads-create-lead-mobile-label"
                  >
                    {t("leads.csl_mn_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  <Field
                    id="leads-create-lead-mobile-no"
                    type="number"
                    name="mobileNo"
                    placeholder={t("leads.csl_mn_phldr")}
                    className={
                      touched.mobileNo && errors.mobileNo ? "input-error" : ""
                    }
                  />

                  <ErrorMessage
                    name="mobileNo"
                    component="div"
                    className="error-message"
                    id="leads-create-lead-mobile-error"
                  />
                </div>

                {/*Alt mobile number */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-alt-mobile-container"
                >
                  <label
                    htmlFor="alt_mobileNo"
                    className="role-label"
                    id="leads-create-lead-alt-mobile-label"
                  >
                    Alternate Mobile number
                  </label>
                  <Field
                    id="leads-create-lead-alternate-mobile-no"
                    type="number"
                    name="alt_mobileNo"
                    placeholder="Enter your alternate mobile number"
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
                    id="leads-create-lead-alt-mobile-error"
                  />
                </div>

                {/* DOB */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-dob-container"
                >
                  <label
                    htmlFor="dob"
                    className="role-label"
                    id="leads-create-lead-dob-label"
                  >
                    {t("leads.csl_dob_lab")}
                  </label>
                  <Field
                    id="leads-create-lead-dob"
                    type="date"
                    name="dob"
                    placeholder={t("leads.csl_dob_phldr")}
                    className={touched.dob && errors.dob ? "input-error" : ""}
                  />

                  <ErrorMessage
                    name="dob"
                    component="div"
                    className="error-message"
                    id="leads-create-lead-dob-error"
                  />
                </div>

                {/* gender */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-gender-container"
                >
                  <label
                    htmlFor="gender"
                    className="role-label"
                    id="leads-create-lead-gender-label"
                  >
                    {t("leads.csl_gender_lab")}{" "}
                  </label>

                  <div
                    role="group"
                    aria-labelledby="gender"
                    className="lead-modal-gender"
                    id="leads-create-lead-gender-options"
                  >
                    <label
                      className="lead-modal-gender-prisect"
                      htmlFor="male"
                      id="leads-create-lead-gender-male-label"
                    >
                      <Field
                        id="leads-create-lead-gender-m"
                        type="radio"
                        name="gender"
                        value="m"
                      />{" "}
                      {t("leads.csl_genderMale")}
                    </label>
                    <label
                      className="lead-modal-gender-prisect"
                      htmlFor="female"
                      id="leads-create-lead-gender-female-label"
                    >
                      <Field
                        id="leads-create-lead-gender-f"
                        type="radio"
                        name="gender"
                        value="f"
                      />
                      {t("leads.csl_genderfemale")}
                    </label>
                    <label
                      className="lead-modal-gender-prisect"
                      htmlFor="other"
                      id="leads-create-lead-gender-other-label"
                    >
                      <Field
                        id="leads-create-lead-gender-o"
                        type="radio"
                        name="gender"
                        value="o"
                      />
                      {t("leads.csl_genderOther")}
                    </label>
                  </div>

                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="error-message"
                    id="leads-create-lead-gender-error"
                  />
                </div>

                {/* email */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-email-container"
                >
                  <label
                    htmlFor="email"
                    className="role-label"
                    id="leads-create-lead-email-label"
                  >
                    {t("leads.csl_email_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  <Field
                    id="leads-create-lead-email"
                    type="email"
                    name="email"
                    placeholder={t("leads.csl_email_phldr")}
                    className={
                      touched.email && errors.email ? "input-error" : ""
                    }
                  />

                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-message"
                    id="leads-create-lead-email-error"
                  />
                </div>

                {/* alternate_email */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-alt-email-container"
                >
                  <label
                    htmlFor="alternateEmail"
                    className="role-label"
                    id="leads-create-lead-alt-email-label"
                  >
                    {t("leads.csl_alternateemail_lab")}
                  </label>
                  <Field
                    id="leads-create-lead-alternate-email"
                    type="alternateEmail"
                    name="alternateEmail"
                    placeholder={t("leads.csl_alternateemail_phldr")}
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
                    id="leads-create-lead-alt-email-error"
                  />
                </div>

                {/* university */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-university-container"
                >
                  <FormControl fullWidth>
                    <label
                      className="role-label"
                      htmlFor="university"
                      id="leads-create-lead-university-label"
                    >
                      {t("leads.csl_univ_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-create-lead-university"
                      value={loading?.uni ? "loading" : values.university}
                      onChange={(e) => {
                        setFieldValue("university", e.target.value);
                        setSelectedUni(e.target.value);
                        // setFieldValue("program", "");
                        setFieldValue("course", "");
                        setFieldValue("owner", "");
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.university && errors.university
                          ? "input-error"
                          : ""
                      }
                      style={{ height: "40px" }}
                      sx={{
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <MenuItem
                        disabled
                        value=""
                        id="leads-create-lead-university-placeholder"
                      >
                        {t("leads.csl_univ_phldr")}
                      </MenuItem>
                      {loading?.uni ? (
                        <MenuItem
                          disabled
                          value="loading"
                          id="leads-create-lead-university-loading"
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            id="leads-create-lead-university-loading-container"
                          >
                            <CircularProgress
                              size={20}
                              color="#000"
                              sx={{ marginRight: 1 }}
                              id="leads-create-lead-university-loading-spinner"
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        </MenuItem>
                      ) : universities?.length === 0 || !universities ? (
                        <MenuItem
                          disabled
                          id="leads-create-lead-university-no-options"
                        >
                          {t("leads.cl_no_unives")}
                        </MenuItem>
                      ) : (
                        universities?.length > 0 &&
                        universities?.map((uni) => (
                          <MenuItem
                            key={uni.id}
                            value={uni.id}
                            id={`leads-create-lead-university-option-${uni.id}`}
                          >
                            {uni.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="university"
                      component="div"
                      className="error-message"
                      id="leads-create-lead-university-error"
                    />
                  </FormControl>
                </div>

                {/* course */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-course-container"
                >
                  <FormControl fullWidth>
                    <label
                      className="role-label"
                      htmlFor="course"
                      id="leads-create-lead-course-label"
                    >
                      {t("leads.csl_course_intrested")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-create-lead-course-interested"
                      value={loading?.course ? "loading" : values.course}
                      disabled={!Boolean(selectedUni)}
                      onChange={(e) => setFieldValue("course", e.target.value)}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.course && errors.course ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem
                        disabled
                        value=""
                        id="leads-create-lead-course-placeholder"
                      >
                        {t("leads.csl_sel_course")}
                      </MenuItem>
                      {loading?.course ? (
                        <MenuItem
                          disabled
                          value="loading"
                          id="leads-create-lead-course-loading"
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            id="leads-create-lead-course-loading-container"
                          >
                            <CircularProgress
                              size={20}
                              color="#000"
                              sx={{ marginRight: 1 }}
                              id="leads-create-lead-course-loading-spinner"
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        </MenuItem>
                      ) : courses?.length === 0 || !courses ? (
                        <MenuItem
                          disabled
                          id="leads-create-lead-course-no-options"
                        >
                          {t("leads.cl_no_courses")}
                        </MenuItem>
                      ) : (
                        courses?.length > 0 &&
                        courses?.map((course) => (
                          <MenuItem
                            key={course.id}
                            value={course.id}
                            id={`leads-create-lead-course-option-${course.id}`}
                          >
                            {course.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="course"
                      component="div"
                      className="error-message"
                      id="leads-create-lead-course-error"
                    />
                  </FormControl>
                </div>

                {/* lead Source */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-source-container"
                >
                  <FormControl fullWidth>
                    <label
                      className="role-label"
                      htmlFor="leadSource"
                      id="leads-create-lead-source-label"
                    >
                      {t("leads.csl_leadsource_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-create-lead-source"
                      value={loading?.channel ? "loading" : values.leadSource}
                      onChange={(e) => {
                        setFieldValue("leadSource", e.target.value);
                        setSelectedChannel(e.target.value);
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
                      <MenuItem
                        disabled
                        value=""
                        id="leads-create-lead-source-placeholder"
                      >
                        {t("leads.csl_leadsource_phldr")}
                      </MenuItem>
                      {loading?.channel ? (
                        <MenuItem
                          disabled
                          value="loading"
                          id="leads-create-lead-source-loading"
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            id="leads-create-lead-source-loading-container"
                          >
                            <CircularProgress
                              size={20}
                              color="#000"
                              sx={{ marginRight: 1 }}
                              id="leads-create-lead-source-loading-spinner"
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        </MenuItem>
                      ) : channelList?.length === 0 || !channelList ? (
                        <MenuItem
                          disabled
                          id="leads-create-lead-source-no-options"
                        >
                          {t("leads.cl_no_lead_sources")}
                        </MenuItem>
                      ) : (
                        channelList?.length > 0 &&
                        channelList?.map((ch) => (
                          <MenuItem
                            key={ch.id}
                            value={ch.id}
                            id={`leads-create-lead-source-option-${ch.id}`}
                          >
                            {ch.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="leadSource"
                      component="div"
                      className="error-message"
                      id="leads-create-lead-source-error"
                    />
                  </FormControl>
                </div>

                {/* source medium */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-medium-container"
                >
                  <FormControl fullWidth>
                    <label
                      className="role-label"
                      htmlFor="sourceMedium"
                      id="leads-create-lead-medium-label"
                    >
                      {t("leads.csl_sourcemedium_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-create-lead-medium"
                      value={loading?.medium ? "loading" : values.sourceMedium}
                      disabled={!Boolean(selectedChannel)}
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
                      <MenuItem
                        disabled
                        value=""
                        id="leads-create-lead-medium-placeholder"
                      >
                        {t("leads.csl_sourcemedium_phldr")}
                      </MenuItem>
                      {loading?.medium ? (
                        <MenuItem
                          disabled
                          value="loading"
                          id="leads-create-lead-medium-loading"
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            id="leads-create-lead-medium-loading-container"
                          >
                            <CircularProgress
                              size={20}
                              color="#000"
                              sx={{ marginRight: 1 }}
                              id="leads-create-lead-medium-loading-spinner"
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        </MenuItem>
                      ) : mediumList?.length === 0 || !mediumList ? (
                        <MenuItem
                          disabled
                          id="leads-create-lead-medium-no-options"
                        >
                          {t("leads.cl_no_mediums")}
                        </MenuItem>
                      ) : (
                        mediumList?.length > 0 &&
                        mediumList?.map((md) => (
                          <MenuItem
                            key={md.id}
                            value={md.id}
                            id={`leads-create-lead-medium-option-${md.id}`}
                          >
                            {md.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="sourceMedium"
                      component="div"
                      className="error-message"
                      id="leads-create-lead-medium-error"
                    />
                  </FormControl>
                </div>

                {/* lead owner */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-owner-container"
                >
                  <FormControl fullWidth>
                    <label
                      className="role-label"
                      htmlFor="owner"
                      id="leads-create-lead-owner-label"
                    >
                      {t("leads.csl_owner_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-create-lead-owner"
                      value={loading?.owner ? "loading" : values.owner}
                      disabled={!Boolean(selectedUni)}
                      onChange={(e) => setFieldValue("owner", e.target.value)}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.owner && errors.owner ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem
                        disabled
                        value=""
                        id="leads-create-lead-owner-placeholder"
                      >
                        {t("leads.csl_owner_phldr")}
                      </MenuItem>
                      {loading?.owner ? (
                        <MenuItem
                          disabled
                          value="loading"
                          id="leads-create-lead-owner-loading"
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            id="leads-create-lead-owner-loading-container"
                          >
                            <CircularProgress
                              size={20}
                              color="#000"
                              sx={{ marginRight: 1 }}
                              id="leads-create-lead-owner-loading-spinner"
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        </MenuItem>
                      ) : leadOwners?.length === 0 || !leadOwners ? (
                        <MenuItem
                          disabled
                          id="leads-create-lead-owner-no-options"
                        >
                          {t("leads.cl_no_owners")}
                        </MenuItem>
                      ) : (
                        leadOwners?.length > 0 &&
                        leadOwners?.map((owner) => (
                          <MenuItem
                            key={owner?.uuid}
                            value={owner?.uuid}
                            id={`leads-create-lead-owner-option-${owner?.uuid}`}
                          >
                            {owner?.first_name} {owner?.last_name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="owner"
                      component="div"
                      className="error-message"
                      id="leads-create-lead-owner-error"
                    />
                  </FormControl>
                </div>

                {/* time to connect */}
                {/* Best time to call */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-time-container"
                >
                  <FormControl fullWidth>
                    <label
                      className="role-label"
                      htmlFor="timeToContact"
                      id="leads-create-lead-time-label"
                    >
                      Best time to call
                      {/* {t("leads.csl_timetocontact_lab")} */}
                    </label>
                    <Field
                      id="leads-create-lead-time-to-connect"
                      type="text"
                      name="timeToContact"
                      placeholder="Enter time to call"
                      className={
                        touched.timeToContact && errors.timeToContact
                          ? "input-error"
                          : ""
                      }
                    />
                    {/* <Select
                  id="leads-create-lead-time-to-connect"
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
                    {t("leads.csl_timetocontact_phldr")}
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
                      id="leads-create-lead-time-error"
                    />
                  </FormControl>
                </div>

                {/* Campaign Name */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-campaign-container"
                >
                  <FormControl fullWidth>
                    <label
                      className="role-label"
                      htmlFor="campaignName"
                      id="leads-create-lead-campaign-label"
                    >
                      Campaign name
                    </label>
                    <Field
                      id="leads-create-lead-campaign-name"
                      type="text"
                      name="campaignName"
                      placeholder="Enter campaign name"
                      className={
                        touched.campaignName && errors.campaignName
                          ? "input-error"
                          : ""
                      }
                    />
                    {/* <Select
                  id="leads-create-lead-campaign-name"
                  value={
                    loading?.campaign ? "loading" : values.campaignName
                  }
                  onChange={(e) =>
                    setFieldValue("campaignName", e.target.value)
                  }
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
                      id="leads-create-lead-campaign-error"
                    />
                  </FormControl>
                </div>

                {/* Company Name */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-company-container"
                >
                  <label
                    className="role-label"
                    htmlFor="companyName"
                    id="leads-create-lead-company-label"
                  >
                    Company Name / Industry Name
                  </label>
                  <Field
                    id="leads-create-lead-company-name"
                    type="text"
                    name="companyName"
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
                    id="leads-create-lead-company-error"
                  />
                </div>

                {/* CTC */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-ctc-container"
                >
                  <label
                    className="role-label"
                    htmlFor="ctc"
                    id="leads-create-lead-ctc-label"
                  >
                    CTC / Annual package
                  </label>
                  <Field
                    id="leads-create-lead-ctc"
                    type="text"
                    name="ctc"
                    placeholder="Enter CTC/Annual package"
                    className={touched.ctc && errors.ctc ? "input-error" : ""}
                  />

                  <ErrorMessage
                    name="ctc"
                    component="div"
                    className="error-message"
                    id="leads-create-lead-ctc-error"
                  />
                </div>

                {/* Experience */}
                <div
                  className="form-group-user"
                  id="leads-create-lead-experience-container"
                >
                  <label
                    className="role-label"
                    htmlFor="experience"
                    id="leads-create-lead-experience-label"
                  >
                    Experience
                  </label>
                  <Field
                    id="leads-create-lead-experience"
                    type="text"
                    name="experience"
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
                    id="leads-create-lead-experience-error"
                  />
                </div>

                {/* Remarks */}
                {/* <div className="form-group-user"> */}
                <div
                  className="form-group full-width-field"
                  id="leads-create-lead-remarks-container"
                >
                  <label
                    className="role-label"
                    htmlFor="remarks"
                    id="leads-create-lead-remarks-label"
                  >
                    Remarks
                  </label>
                  <Field
                    id="leads-create-lead-remarks"
                    style={{ width: "100%" }}
                    as={TextField}
                    multiline
                    rows={3.4}
                    name="remarks"
                    placeholder="Enter remarks"
                    className={
                      touched.remarks && errors.remarks ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="remarks"
                    component="div"
                    className="error-message"
                    id="leads-create-lead-remarks-error"
                  />
                </div>

                <p id="leads-create-lead-address-title">
                  {t("leads.esl_addressDetails")}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    gap: 5,
                  }}
                  id="leads-create-lead-address-fields-container"
                >
                  {/* address */}
                  <div
                    className="form-group-user"
                    id="leads-create-lead-address-container"
                  >
                    <label
                      htmlFor="address"
                      className="role-label"
                      id="leads-create-lead-address-label"
                    >
                      {t("leads.csl_address_lab")}
                    </label>
                    <Field
                      id="leads-create-lead-address"
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
                      id="leads-create-lead-address-error"
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    gap: 5,
                  }}
                  id="leads-create-lead-location-fields-container"
                >
                  {/* pincode */}
                  {/* <div className="form-group-user">
                <FormControl fullWidth>
                  <label className="role-label" htmlFor="pincode">
                    {t("leads.csl_pincode_lab")}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    id="leads-create-lead-pincode"
                    type="text"
                    name="pincode"
                    placeholder={t("leads.esl_pincode_phldr")}
                    className={
                      touched.pincode && errors.pincode ? "input-error" : ""
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
                    id="leads-create-lead-country-container"
                  >
                    <FormControl fullWidth>
                      <label
                        className="role-label"
                        htmlFor="country"
                        id="leads-create-lead-country-label"
                      >
                        {t("leads.csl_country_lab")}
                      </label>
                      <Field
                        id="leads-create-lead-country"
                        type="text"
                        name="country"
                        placeholder="Enter country name"
                        className={
                          touched.country && errors.country ? "input-error" : ""
                        }
                      />
                      {/* <Select
                    id="leads-create-lead-country"
                    value={loading?.country ? "loading" : values.country}
                    onChange={(e) => {
                      setFieldValue("country", e.target.value);
                      setFieldValue("state", "");
                      setFieldValue("city", "");
                      setSelCountry(e.target.value);
                    }}
                    displayEmpty
                    IconComponent={ChevronDown}
                    fullWidth
                    className={
                      touched.country && errors.country ? "input-error" : ""
                    }
                    style={{ height: "40px" }}
                  >
                    <MenuItem disabled value="">
                      {t("leads.csl_country_phldr")}
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
                        id="leads-create-lead-country-error"
                      />
                    </FormControl>
                  </div>

                  {/* States */}
                  <div
                    className="form-group-user"
                    id="leads-create-lead-state-container"
                  >
                    <FormControl fullWidth>
                      <label
                        className="role-label"
                        htmlFor="state"
                        id="leads-create-lead-state-label"
                      >
                        {t("leads.csl_state_lab")}
                      </label>
                      <Field
                        id="leads-create-lead-state"
                        type="text"
                        name="state"
                        placeholder="Enter state name"
                        className={
                          touched.state && errors.state ? "input-error" : ""
                        }
                      />
                      {/* <Select
                    id="leads-create-lead-state"
                    value={loading?.state ? "loading" : values.state}
                    disabled={!Boolean(selCountry)}
                    onChange={(e) => {
                      setFieldValue("state", e.target.value);
                      setFieldValue("city", "");
                      setSelState(e.target.value);
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
                      {t("leads.csl_state_phldr")}
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
                        id="leads-create-lead-state-error"
                      />
                    </FormControl>
                  </div>

                  {/* cities */}
                  <div
                    className="form-group-user"
                    id="leads-create-lead-city-container"
                  >
                    <FormControl fullWidth>
                      <label
                        className="role-label"
                        htmlFor="city"
                        id="leads-create-lead-city-label"
                      >
                        {t("leads.csl_city_lab")}
                      </label>
                      <Field
                        id="leads-create-lead-city"
                        type="text"
                        name="city"
                        placeholder="Enter city name"
                        className={
                          touched.city && errors.city ? "input-error" : ""
                        }
                      />
                      {/* <Select
                    id="leads-create-lead-city"
                    value={loading?.city ? "loading" : values.city}
                    disabled={!Boolean(selState)}
                    onChange={(e) => {
                      setFieldValue("city", e.target.value);
                    }}
                    displayEmpty
                    IconComponent={ChevronDown}
                    fullWidth
                    className={
                      touched.city && errors.city ? "input-error" : ""
                    }
                    style={{ height: "40px" }}
                  >
                    <MenuItem disabled value="">
                      {t("leads.csl_city_phldr")}
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
                        id="leads-create-lead-city-error"
                      />
                    </FormControl>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <div className="modal-footer" id="leads-create-lead-modal-footer">
        <Button
          id="leads-create-lead-cancel-btn"
          variant="outlined"
          style={{ marginLeft: "20px" }}
          className="cancel-button"
          onClick={onClose}
        >
          {t("leads.csl_cancel_btn")}
        </Button>
        <div style={{ display: "flex" }}>
          <Button
            id="leads-create-lead-submit-new-btn"
            variant="outlined"
            style={{ marginRight: "20px" }}
            className="save-create-btn"
            onClick={() => {
              setReset(true);
              formikRefLead.current.submitForm();
            }}
          >
            {loading?.submit && reset ? (
              <CircularProgress size={30} />
            ) : (
              t("leads.csl_saveaddnew_btn")
            )}
          </Button>
          <Button
            id="leads-create-lead-submit-btn"
            variant="contained"
            color="success"
            className="map-role-button"
            onClick={() => formikRefLead.current.submitForm()}
            style={{ marginRight: "20px" }}
          >
            {loading?.submit ? (
              <CircularProgress size={20} color="#000" />
            ) : (
              t("leads.csl_save_btn")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSingleLead;
