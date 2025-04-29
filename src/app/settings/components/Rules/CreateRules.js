"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import CloseIcon from "@/images/close-icon.svg";
import ChevronDown from "@/images/chevron-down.svg";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
  Box,
  Checkbox,
  Chip,
} from "@mui/material";
import * as Yup from "yup";
import { Form, Formik, Field, ErrorMessage } from "formik";
import AlertIcon from "@/images/alert-circle.svg";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { masterDDAction } from "@/app/actions/commonActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import { getUsersDDAction } from "@/app/actions/userActions";
import { createSingleRuleAction } from "@/app/actions/ruleActions";
import { getToken } from "@/utils/getToken";

const CreateRules = ({ onClose, open, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const formikCreateRuledRef = useRef();

  const createLeadRuleValidationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(200)
      .required(t("rules.400362"))
      .trim()
      .transform((value) => value?.trim()),
    university: Yup.number().required(t("leads.400353")),
    // program: Yup.number().required(t("leads.400354")),
    // Change source from a number to an array
    source: Yup.array()
      .of(Yup.number().typeError("Selected Source value is incorrect"))
      .min(1, "Select at least one Source")
      .required(t("rules.400365")),
    course: Yup.array()
      .of(Yup.number().typeError("Selected Course value is incorrect"))
      .min(1, "Select at least one Course")
      .required(t("rules.400355")),
    start: Yup.string()
      .required(t("rules.400367"))
      .test(
        "start-before-end",
        "Start time cannot be after end time!",
        function (value) {
          const { end } = this.parent;
          if (!value || !end) return true; // Skip validation if either is empty
          return value <= end;
        }
      ),
    end: Yup.string()
      .required(t("rules.400368"))
      .test(
        "end-after-start",
        "End time cannot be before start time!",
        function (value) {
          const { start } = this.parent;
          if (!value || !start) return true;
          return value >= start;
        }
      ),
    user_id: Yup.array()
      .of(Yup.string().typeError("Selected Counsellor value is incorrect"))
      .when("agent", {
        is: 1, // The condition: when agent equals 2
        then: (schema) =>
          schema
            .min(1, "Select at least one Counsellor")
            .required(t("rules.400369")),
        otherwise: (schema) => schema.notRequired(), // Make user_id optional if agent is not 2
      }),
    day: Yup.array()
      .of(Yup.number().typeError("Selected Day value is incorrect"))
      .min(1, "Select at least one Day")
      .required(t("rules.400370")),
    agent: Yup.number().required(t("rules.400371")),
    order: Yup.number(),
  });

  const [loading, setLoading] = useState({
    uni: false,
    program: false,
    course: false,
    channel: false,
    days: false,
    counsellors: false,
    submit: false,
  });

  const [universities, setUniversities] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const [programs, setPrograms] = useState(null);
  const [courses, setCourses] = useState(null);
  const [days, setDays] = useState(null);

  const [counsellors, setCounsellors] = useState(null);

  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedPrgm, setSelectedPrgm] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [reset, setReset] = useState(false);

  const getUniversityList = async () => {
    setLoading((prev) => ({ ...prev, uni: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
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
          } else if (errValues?.length > 0) {
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
          } else if (errValues?.length > 0) {
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
          } else if (errValues?.length > 0) {
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
          } else if (errValues?.length > 0) {
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
  const getDaysList = async () => {
    setLoading((prev) => ({ ...prev, days: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // status: "1", // optional input will be integer
      identifier: ["day"], // mandatory input will be an array
      parent_id: selectedPrgm, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setDays(decrypted);
        setLoading((prev) => ({ ...prev, days: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, days: false }));
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
          } else if (errValues?.length > 0) {
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
      setLoading((prev) => ({ ...prev, days: false }));
    }
  };
  const getCounsellorsList = async () => {
    setLoading((prev) => ({ ...prev, counsellors: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_type: ["Counsellor"],
      universities: [selectedUni],
      status: "Active",
    };
    // console.log("reqBody Counsellors", reqbody);

    try {
      const result = await getUsersDDAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final Counsellors", decrypted);

        setCounsellors(decrypted);
        setLoading((prev) => ({ ...prev, counsellors: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, counsellors: false }));
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
          } else if (errValues?.length > 0) {
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
      setLoading((prev) => ({ ...prev, counsellors: false }));
    }
  };

  useEffect(() => {
    getUniversityList();
    getChannelList();
    getDaysList();
  }, []);

  useEffect(() => {
    if (selectedUni) {
      getCoursesList();
      // getProgramList();
      getCounsellorsList();
    }
  }, [selectedUni]);

  // useEffect(() => {
  //   if (selectedPrgm) {
  //     getCoursesList();
  //   }
  // }, [selectedPrgm]);

  const handleRuleSubmit = async (values) => {
    console.log("values", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      rule_name: values.name,
      university: values.university, //refer from master
      // program: values.program, //refer from master
      source: values.source, // refer from master
      course: values.course, //refer from master
      start_time: values.start,
      end_time: values.end,
      counsellor: values.user_id, //refer from users
      day: values.day, //refer from master
      agent: values.agent,
      sorting_order: values.order,
    };

    console.log("body", reqbody);

    try {
      const result = await createSingleRuleAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        if (!reset) {
          onClose();
          setLoading((prev) => ({ ...prev, submit: false }));
          showSnackbar({
            message: `<strong>${decrypted.rule_name}</strong> ${t(
              "rules.rule_create_alert"
            )}`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
        setReset(!reset);
        handleDataChange();
        formikCreateRuledRef.current.resetForm();
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
    <div id="map-roles-modal-user-container" className="map-roles-modal-user">
      <div id="modal-header-roles-container" className="modal-header-roles">
        <h2>{t("rules.rules_createform_title")}</h2>
        <div
          id="manage-rules-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div id="modal-body-container" className="modal-body">
        <p>{t("rules.rules_createform_subtitle")}</p>
        <div
          id="modal-content-user-section-container"
          className="modal-content-user-section"
        >
          <Formik
            innerRef={formikCreateRuledRef}
            initialValues={{
              name: "",
              university: "",
              // program: "",
              course: [],
              source: [],
              start: "",
              end: "",
              user_id: [],
              day: [],
              agent: "",
              order: "",
            }}
            validationSchema={createLeadRuleValidationSchema}
            onSubmit={handleRuleSubmit}
          >
            {({ setFieldValue, touched, errors, values }) => (
              <>
                <Form
                  id="rules-create-form"
                  style={{ gridTemplateColumns: "1fr 1fr", gap: "10px" }}
                >
                  {/* name */}
                  <FormControl id="name-form-control" fullWidth>
                    <label className="role-label" htmlFor="name">
                      {t("rules.rules_createform_rulename")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="manage-rules-name"
                      type="text"
                      name="name"
                      // maxLength={200}
                      placeholder={t("rules.rules_createform_rulename_phldr")}
                      className={
                        touched.name && errors.name ? "input-error" : ""
                      }
                    />

                    <ErrorMessage
                      name="name"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>

                  {/* university */}
                  <FormControl id="university-form-control" fullWidth>
                    <label className="role-label" htmlFor="univesity">
                      {t("manage_user.mu_eum_assigne_univ")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="manage-rules-university"
                      value={loading?.uni ? "loading" : values.university}
                      onChange={(e) => {
                        setFieldValue("university", e.target.value);
                        setSelectedUni(e.target.value);
                        // setFieldValue("program", "");
                        setFieldValue("course", "");
                        setFieldValue("user_id", []);
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
                          {t("editusermodal.nouniversities_available")}
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

                  {/* course */}

                  {/* old */}
                  {/* <FormControl fullWidth>
                    <label className="role-label" htmlFor="course">
                      {t("rules.rules_create_course")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="manage-rules-course"
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
                      <MenuItem disabled value="">
                        {t("rules.400355")}
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
                  </FormControl> */}

                  <FormControl id="course-form-control" fullWidth>
                    <label className="role-label" htmlFor="course">
                      {t("rules.rules_create_course")}
                      <span style={{ color: "red" }}>*</span>
                    </label>

                    <Select
                      id="manage-rules-course"
                      multiple
                      value={Array.isArray(values.course) ? values.course : []}
                      disabled={!Boolean(selectedUni)}
                      onChange={(e) => {
                        const selectedValues = e.target.value;
                        if (selectedValues.includes("all")) {
                          // If "Select All" is chosen, set to [0]
                          setFieldValue(
                            "course",
                            values.course?.length === courses?.length ||
                              values.course?.includes(0)
                              ? []
                              : [0]
                          );
                        } else {
                          // If a regular item is selected and we currently have [0], change to all individual IDs
                          if (values.course.includes(0)) {
                            setFieldValue(
                              "course",
                              courses
                                .map((c) => c.id)
                                .filter((id) => selectedValues.includes(id))
                            );
                          } else {
                            // Regular selection behavior
                            setFieldValue("course", selectedValues);
                          }
                        }
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.course && errors.course ? "input-error" : ""
                      }
                      style={{ height: "40px", width: "340px" }}
                      renderValue={(selected) => {
                        if (loading.course) {
                          return (
                            <Box display="flex" alignItems="center">
                              <CircularProgress
                                size={20}
                                sx={{ marginRight: 1, color: "#000" }}
                              />
                              {t("editusermodal.loading")}
                            </Box>
                          );
                        }

                        if (!selected || selected.length === 0) {
                          return (
                            <span style={{ color: "#aaa" }}>
                              {t("rules.400355")}
                            </span>
                          );
                        }

                        // Special handling for value [0]
                        if (selected.includes(0)) {
                          return "All Courses";
                        }

                        // Get selected course names
                        const selectedNames = selected
                          ?.map((id) => courses?.find((c) => c.id === id)?.name)
                          .filter(Boolean); // Remove undefined values

                        // For single selection, display the full name
                        if (selectedNames.length === 1) {
                          return selectedNames[0];
                        }

                        // For multiple selections, show the first item and a chip
                        const displayedNames = selectedNames.slice(0, 1);
                        const moreCount = selectedNames.length - 1;

                        return (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                maxWidth: "200px", // Adjust this value as needed
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {displayedNames[0]}
                            </Box>
                            {moreCount > 0 && (
                              <Chip
                                size="small"
                                label={`+${moreCount} more`}
                                sx={{
                                  borderRadius: "6px",
                                  fontWeight: 600,
                                  color: "#29339B",
                                  backgroundColor: "#EBEDFF",
                                }}
                              />
                            )}
                          </Box>
                        );
                      }}
                    >
                      {/* Placeholder when nothing is selected */}
                      <MenuItem disabled value="">
                        <span style={{ color: "#aaa" }}>
                          {t("rules.400355")}
                        </span>
                      </MenuItem>

                      {/* "Select All" option */}
                      {courses?.length > 1 && (
                        <MenuItem value="all">
                          <Checkbox
                            id="manage-rules-all-courses"
                            checked={
                              values.course?.includes(0) ||
                              values.course?.length === courses?.length
                            }
                          />
                          <span>{t("manage_roles.mr_tbl_btn")}</span>
                        </MenuItem>
                      )}

                      {/* Loading state */}
                      {loading.course ? (
                        <MenuItem disabled value="loading">
                          <Box display="flex" alignItems="center">
                            <CircularProgress
                              size={20}
                              sx={{ marginRight: 1, color: "#000" }}
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        </MenuItem>
                      ) : courses?.length === 0 || !courses ? (
                        <MenuItem disabled>{t("leads.cl_no_courses")}</MenuItem>
                      ) : (
                        courses?.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            <Checkbox
                              id={`manage-rules-course-${course.id}`}
                              checked={
                                values.course.includes(0) ||
                                values.course.includes(course.id)
                              }
                            />
                            <span>{course.name}</span>
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

                  {/* Source */}

                  <FormControl id="source-form-control" fullWidth>
                    <label className="role-label" htmlFor="source">
                      {t("rules.rule_managerule_source")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="manage-rules-source"
                      multiple
                      value={Array.isArray(values.source) ? values.source : []}
                      onChange={(e) => {
                        const selectedValues = e.target.value;
                        if (selectedValues.includes("all")) {
                          // If "Select All" is chosen, set to [0]
                          setFieldValue(
                            "source",
                            values.source?.length === channelList?.length ||
                              values.source?.includes(0)
                              ? []
                              : [0]
                          );
                        } else {
                          // If a regular item is selected and we currently have [0], change to all individual IDs
                          if (values.source.includes(0)) {
                            setFieldValue(
                              "source",
                              channelList
                                .map((ch) => ch.id)
                                .filter((id) => selectedValues.includes(id))
                            );
                          } else {
                            // Regular selection behavior
                            setFieldValue("source", selectedValues);
                          }
                        }
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.source && errors.source ? "input-error" : ""
                      }
                      style={{ height: "40px", width: "340px" }}
                      renderValue={(selected) => {
                        if (loading.channel) {
                          return (
                            <Box display="flex" alignItems="center">
                              <CircularProgress
                                size={20}
                                sx={{ marginRight: 1, color: "#000" }}
                              />
                              {t("editusermodal.loading")}
                            </Box>
                          );
                        }

                        if (!selected || selected.length === 0) {
                          return (
                            <span style={{ color: "#aaa" }}>
                              {t("rules.400365")}
                            </span>
                          );
                        }

                        // Special handling for value [0]
                        if (selected.includes(0)) {
                          return "All Sources";
                        }

                        // Get selected source names
                        const selectedNames = selected
                          ?.map(
                            (id) =>
                              channelList?.find((ch) => ch.id === id)?.name
                          )
                          .filter(Boolean); // Remove undefined values

                        // For single selection, display the full name
                        if (selectedNames.length === 1) {
                          return selectedNames[0];
                        }

                        // For multiple selections, show the first item and a chip
                        const displayedNames = selectedNames.slice(0, 1);
                        const moreCount = selectedNames.length - 1;

                        return (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                maxWidth: "200px", // Adjust this value as needed
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {displayedNames[0]}
                            </Box>
                            {moreCount > 0 && (
                              <Chip
                                size="small"
                                label={`+${moreCount} more`}
                                sx={{
                                  borderRadius: "6px",
                                  fontWeight: 600,
                                  color: "#29339B",
                                  backgroundColor: "#EBEDFF",
                                }}
                              />
                            )}
                          </Box>
                        );
                      }}
                    >
                      {/* Placeholder when nothing is selected */}
                      <MenuItem disabled value="">
                        <span style={{ color: "#aaa" }}>
                          {t("rules.400365")}
                        </span>
                      </MenuItem>

                      {/* "Select All" option */}
                      {channelList?.length > 1 && (
                        <MenuItem value="all">
                          <Checkbox
                            id="manage-rules-all-sources"
                            checked={
                              values.source?.includes(0) ||
                              values.source?.length === channelList?.length
                            }
                          />
                          <span>{t("manage_roles.mr_tbl_btn")}</span>
                        </MenuItem>
                      )}

                      {/* Loading state */}
                      {loading.channel ? (
                        <MenuItem disabled value="loading">
                          <Box display="flex" alignItems="center">
                            <CircularProgress
                              size={20}
                              sx={{ marginRight: 1, color: "#000" }}
                            />
                            {t("editusermodal.loading")}
                          </Box>
                        </MenuItem>
                      ) : channelList?.length === 0 || !channelList ? (
                        <MenuItem disabled>
                          {t("rules.rules_create_nosource")}
                        </MenuItem>
                      ) : (
                        channelList?.map((ch) => (
                          <MenuItem key={ch.id} value={ch.id}>
                            <Checkbox
                              id={`manage-rules-source-${ch.id}`}
                              checked={
                                values.source.includes(0) ||
                                values.source.includes(ch.id)
                              }
                            />
                            <span>{ch.name}</span>
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="source"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>

                  {/* time */}
                  <p id="time-selection-title">
                    {t("rules.rules_create_daytime_select")}
                  </p>
                  <FormControl id="time-form-control" fullWidth>
                    <div
                      id="time-selection-container"
                      style={{ display: "flex", gap: "10px" }}
                    >
                      {/* Start Time */}
                      <div id="start-time-container" style={{ width: "50%" }}>
                        <label className="role-label" htmlFor="start">
                          {t("rules.rule_create_starttime")}{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <Field
                          id="manage-rules-start-time"
                          type="time"
                          name="start"
                        />

                        <ErrorMessage
                          name="start"
                          component="div"
                          className="error-message"
                        />
                      </div>

                      {/* End Time */}
                      <div id="end-time-container" style={{ width: "50%" }}>
                        <label className="role-label" htmlFor="end">
                          {t("rules.rule_create_end_time")}{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <Field type="time" name="end" />

                        <ErrorMessage
                          id="manage-rules-end-time"
                          name="end"
                          component="div"
                          className="error-message"
                        />
                      </div>
                    </div>
                  </FormControl>

                  {/* days */}
                  <FormControl id="days-form-control" fullWidth>
                    <label className="role-label" htmlFor="university">
                      {t("rules.rule_create_selecday")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="manage-rules-days-select"
                      displayEmpty
                      // renderValue={(selected) => {
                      //   if (loading.days) {
                      //     return (
                      //       <Box display="flex" alignItems="center">
                      //         <CircularProgress
                      //           size={20}
                      //           color="#000"
                      //           sx={{ marginRight: 1 }}
                      //         />
                      //         {t("editusermodal.loading")}
                      //       </Box>
                      //     );
                      //   }
                      //   return (
                      //     <span
                      //       style={{
                      //         color:
                      //           selected?.length === 0 ? "#aaa" : "inherit",
                      //       }}
                      //     >
                      //       {selected && selected?.length === 0
                      //         ? `${t("rules.rule_create_selecday")}'s`
                      //         : selected
                      //             .map(
                      //               (id) =>
                      //                 days.find((day) => day.id === id)?.name
                      //             )
                      //             .join(", ")}
                      //     </span>
                      //   );
                      // }}
                      renderValue={(selected) => {
                        if (loading.days) {
                          return (
                            <Box display="flex" alignItems="center">
                              <CircularProgress
                                size={20}
                                sx={{ marginRight: 1, color: "#000" }}
                              />
                              {t("editusermodal.loading")}
                            </Box>
                          );
                        }

                        if (!selected || selected.length === 0) {
                          return (
                            <span style={{ color: "#aaa" }}>
                              {t("rules.rule_create_selecday")}'s
                            </span>
                          );
                        }

                        // Find the selected day names
                        const selectedNames = selected
                          .map((id) => days.find((day) => day.id === id)?.name)
                          .filter(Boolean); // Remove undefined values

                        // Show first 3 names and a chip if more exist
                        const displayedNames = selectedNames.slice(0, 3);
                        const moreCount = selectedNames.length - 3;

                        return (
                          <Box display="flex" alignItems="center" gap={1}>
                            {displayedNames.join(", ")}
                            {moreCount > 0 && (
                              <Chip
                                size="small"
                                label={`+${moreCount} more`}
                                sx={{
                                  borderRadius: "6px",
                                  fontWeight: 600,
                                  color: "#29339B",
                                  backgroundColor: "#EBEDFF",
                                }}
                              />
                            )}
                          </Box>
                        );
                      }}
                      value={loading.days ? [] : values.day}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.includes("all")) {
                          // If "Select All" is selected, either select all or deselect all
                          setFieldValue(
                            "day",
                            values.day?.length === days?.length
                              ? []
                              : days.map((day) => day.id)
                          );
                        } else {
                          setFieldValue("day", value);
                        }
                      }}
                      multiple
                      IconComponent={ChevronDown}
                      fullWidth
                      className={touched.day && errors.day ? "input-error" : ""}
                      style={{ height: "40px", width: "340px" }}
                    >
                      {/* Placeholder item, will only show when nothing is selected */}
                      <MenuItem disabled value="">
                        <span style={{ color: "#aaa" }}>
                          {t("rules.rule_create_selecday")}'s
                        </span>
                      </MenuItem>
                      {/* "Select All" option */}
                      <MenuItem value="all">
                        <Checkbox
                          checked={values.day?.length === days?.length}
                          // indeterminate={
                          //   values.day?.length > 0 &&
                          //   values.day?.length < days?.length
                          // }
                        />
                        <span>{t("manage_roles.mr_tbl_btn")}</span>
                      </MenuItem>
                      {loading.days ? (
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
                      ) : days?.length === 0 || !days ? (
                        <MenuItem disabled>
                          {t("rules.rule_create_nodays")}
                        </MenuItem>
                      ) : (
                        days?.length > 0 &&
                        days.map((day) => {
                          return (
                            <MenuItem key={day.id} value={day.id}>
                              <Checkbox checked={values.day.includes(day.id)} />
                              <span className="map-role-item">{day.name}</span>
                            </MenuItem>
                          );
                        })
                      )}
                    </Select>
                    <ErrorMessage
                      name="day"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>

                  {/* Assignees (Agent) */}
                  <p id="assign-to-title">{t("rules.rule_create_assignto")}</p>
                  <FormControl id="agent-form-control" fullWidth>
                    <label className="role-label">
                      {t("rules.rule_create_agent")}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <RadioGroup
                      id="agent-radio-group"
                      row
                      aria-labelledby="demo-radio-buttons-group-label"
                      name="radio-buttons-group"
                      value={values.agent}
                      onChange={(e) => {
                        setFieldValue("agent", Number(e.target.value));
                        setSelectedAgent(Number(e.target.value));
                      }}
                    >
                      <FormControlLabel
                        value={2}
                        control={
                          <Radio
                            id="manage-rules-digital-agent"
                            sx={{
                              color: "#D9D9D9",
                              "&.Mui-checked": {
                                color: "#007143",
                              },
                            }}
                          />
                        }
                        label="Digital Agent"
                      />
                      <FormControlLabel
                        value={1}
                        control={
                          <Radio
                            id="manage-rules-human-agent"
                            sx={{
                              color: "#D9D9D9",
                              "&.Mui-checked": {
                                color: "#007143",
                              },
                            }}
                          />
                        }
                        label="Human Agent"
                      />
                    </RadioGroup>

                    <ErrorMessage
                      name="agent"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>

                  {selectedAgent === 1 && (
                    <FormControl id="counsellors-form-control" fullWidth>
                      <label className="role-label" htmlFor="user_id">
                        {t("rules.rule_create_selec_consull")}
                        <span style={{ color: "red" }}>*</span>
                      </label>

                      <Select
                        id="manage-rules-counsellors"
                        displayEmpty
                        // renderValue={(selected) => {
                        //   if (loading.counsellors) {
                        //     return (
                        //       <Box display="flex" alignItems="center">
                        //         <CircularProgress
                        //           size={20}
                        //           color="#000"
                        //           sx={{ marginRight: 1 }}
                        //         />
                        //         {t("editusermodal.loading")}
                        //       </Box>
                        //     );
                        //   }
                        //   return (
                        //     <span
                        //       style={{
                        //         color:
                        //           selected?.length === 0 ? "#aaa" : "inherit",
                        //       }}
                        //     >
                        //       {selected && selected?.length === 0
                        //         ? `${t("manage_template.mt_selec_counsellors")}`
                        //         : selected
                        //             ?.map(
                        //               (id) =>
                        //                 counsellors?.find(
                        //                   (item) => item.uuid === id
                        //                 )?.first_name
                        //             )
                        //             .join(", ")}
                        //     </span>
                        //   );
                        // }}
                        renderValue={(selected) => {
                          if (loading.counsellors) {
                            return (
                              <Box display="flex" alignItems="center">
                                <CircularProgress
                                  size={20}
                                  sx={{ marginRight: 1, color: "#000" }}
                                />
                                {t("editusermodal.loading")}
                              </Box>
                            );
                          }

                          if (!selected || selected.length === 0) {
                            return (
                              <span style={{ color: "#aaa" }}>
                                {t("manage_template.mt_selec_counsellors")}
                              </span>
                            );
                          }

                          // Find the selected counsellors' first names
                          const selectedNames = selected
                            ?.map(
                              (id) =>
                                counsellors?.find((item) => item.uuid === id)
                                  ?.first_name
                            )
                            .filter(Boolean); // Remove undefined values

                          // Show first 3 names and a chip if more exist
                          const displayedNames = selectedNames.slice(0, 2);
                          const moreCount = selectedNames.length - 2;

                          return (
                            <Box display="flex" alignItems="center" gap={1}>
                              {/* {displayedNames.join(", ")} */}
                              <Box
                                sx={{
                                  maxWidth: "200px", // Adjust this value as needed
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {displayedNames.join(", ")}
                              </Box>
                              {moreCount > 0 && (
                                <Chip
                                  size="small"
                                  label={`+${moreCount} more`}
                                  sx={{
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    color: "#29339B",
                                    backgroundColor: "#EBEDFF",
                                  }}
                                />
                              )}
                            </Box>
                          );
                        }}
                        value={loading.counsellors ? [] : values.user_id}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.includes("all")) {
                            // If "Select All" is selected, either select all or deselect all
                            setFieldValue(
                              "user_id",
                              values.user_id?.length === counsellors?.length
                                ? []
                                : counsellors.map((item) => item.uuid)
                            );
                          } else {
                            setFieldValue("user_id", value);
                          }
                        }}
                        multiple
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.user_id && errors.user_id ? "input-error" : ""
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
                        {counsellors?.length > 1 && (
                          <MenuItem value="all">
                            <Checkbox
                              id="manage-rules-all"
                              checked={
                                values.user_id?.length === counsellors?.length
                              }
                              // indeterminate={
                              //   values.user_id?.length > 0 &&
                              //   values.user_id?.length < counsellors?.length
                              // }
                            />
                            <span>{t("manage_roles.mr_tbl_btn")}</span>
                          </MenuItem>
                        )}

                        {loading.counsellors ? (
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
                        ) : counsellors?.length === 0 || !counsellors ? (
                          <MenuItem disabled>
                            {t("rules.rule_no_consoll_avaliable")}
                          </MenuItem>
                        ) : (
                          counsellors?.length > 0 &&
                          counsellors.map((item) => {
                            return (
                              <MenuItem key={item.uuid} value={item.uuid}>
                                <Checkbox
                                  id={`manage-rules-${item?.uuid}`}
                                  checked={values.user_id.includes(item.uuid)}
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
                        name="user_id"
                        component="div"
                        className="error-message"
                      />
                    </FormControl>
                  )}

                  {/* Rule order */}
                  <div id="rule-order-container">
                    <FormControl id="order-form-control" fullWidth>
                      <label className="role-label" htmlFor="order">
                        {t("rules.rule_create_edit_order")}
                      </label>
                      <Field
                        id="manage-rules-rule-order"
                        type="number"
                        name="order"
                        min={1}
                        max={999}
                        placeholder="Enter rule order here"
                        className={
                          touched.order && errors.order ? "input-error" : ""
                        }
                        value={values.order}
                      />

                      <ErrorMessage
                        name="order"
                        component="div"
                        className="error-message"
                      />
                    </FormControl>
                  </div>
                </Form>
                <div
                  id="create-rule-alert-container"
                  className="create_rule_alert_text"
                >
                  <p style={{ width: "8%" }}>
                    <AlertIcon />
                  </p>
                  <h4>{t("rules.rule_create_heading_roundrobin")}</h4>
                </div>
              </>
            )}
          </Formik>
        </div>
      </div>

      <div id="modal-footer-container" className="modal-footer">
        <Button
          id="manage-rules-cancel-button"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("followup.ef_cancel")}
        </Button>
        <div id="modal-footer-buttons-container" style={{ display: "flex" }}>
          <Button
            id="manage-rules-save&new-btn"
            variant="outlined"
            style={{ marginRight: "10px" }}
            className="save-create-btn"
            onClick={() => {
              setReset(true);
              formikCreateRuledRef.current.submitForm();
            }}
          >
            {loading.submit && reset ? (
              <CircularProgress size={20} color="#000" />
            ) : (
              t("leads.csl_saveaddnew_btn")
            )}
          </Button>
          <Button
            id="manage-rules-submit-btn"
            variant="contained"
            color="success"
            className="map-role-button"
            onClick={() => formikCreateRuledRef.current.submitForm()}
            style={{ marginRight: "20px" }}
          >
            {loading.submit ? (
              <CircularProgress size={20} color="#000" s />
            ) : (
              t("followup.cf_save")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRules;
