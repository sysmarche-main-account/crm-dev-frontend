"use client";
import React, { use, useEffect, useRef, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Checkbox,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  getUsersDDAction,
  handleCreateUserAction,
} from "@/app/actions/userActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { getRoleListDDAction } from "@/app/actions/rolesActions";
import { decryptClient } from "@/utils/decryptClient";
import { masterDDAction } from "@/app/actions/commonActions";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";

const CreateUserModal = ({ onClose, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [reportingToOptionsLoading, setReportingToOptionsLoading] =
    useState(false);
  const [roleOptionsLoading, setRoleOptionsLoading] = useState(false);
  const [uniOptionsLoading, setUniOptionsLoading] = useState(false);
  const [reportingToUserList, setReportingToUserList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [universities, setUniversities] = useState([]);

  const [reset, setReset] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const formikRef = useRef();
  const createUserValidationSchema = Yup.object({
    firstName: Yup.string()
      .min(3)
      .max(200)
      .matches(/^[A-Za-z ]+$/, t("manage_user.400344"))
      .required(t("manage_user.400014"))
      .trim()
      .transform((value) => value?.trim()),
    lastName: Yup.string()
      .min(3)
      .max(200)
      .matches(/^[A-Za-z ]+$/, t("manage_user.400344"))
      .required(t("manage_user.400015"))
      .trim()
      .transform((value) => value?.trim()),
    email: Yup.string()
      .email()
      .required(t("manage_user.400001"))
      .trim()
      .transform((value) => value?.trim()),
    mobileNo: Yup.string()
      .matches(/^\d{10}$/, t("leads.400345"))
      .required(t("manage_user.400016"))
      .trim()
      .transform((value) => value?.trim()),
    reportingTo: Yup.string()
      .required(t("manage_user.400051"))
      .trim()
      .transform((value) => value?.trim()),
    role: Yup.number().required(t("profile.400017")),
    university: Yup.array()
      .of(Yup.number().typeError("Each selected university value is incorrect"))
      .min(1, "Select at least one university")
      .required(t("manage_user.400376")),
  });

  const handleSubmit = async (values) => {
    // console.log(values);
    setSubmitLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      mobile_number: values.mobileNo,
      reporting_manager: values.reportingTo,
      role_id: values.role,
      universities: values.university,
    };
    console.log("reqbody", reqbody);

    try {
      const result = await handleCreateUserAction(csrfToken, reqbody);
      console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        handleDataChange();
        if (!reset) {
          onClose();
          setSubmitLoading(false);
          showSnackbar({
            message: `<strong>${decrypted.first_name} ${
              decrypted.last_name
            }</strong> ${t("manage_user.mu_creatuser_sumbit_alert")}`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
        setReset(!reset);
        formikRef.current.resetForm();
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
        setSubmitLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setSubmitLoading(false);
    }
  };

  const getReportingToList = async () => {
    setReportingToOptionsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: "Active",
    };
    try {
      const result = await getUsersDDAction(csrfToken, reqbody);
      // console.log("user list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setReportingToUserList(decrypted);
        setReportingToOptionsLoading(false);
      } else {
        console.error(result.error);
        setReportingToOptionsLoading(false);
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
      setReportingToOptionsLoading(false);
    }
  };

  const getRoleList = async () => {
    setRoleOptionsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: 1,
    };
    try {
      const result = await getRoleListDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setRoleList(decrypted);
        setRoleOptionsLoading(false);
      } else {
        console.error(result.error);
        setRoleOptionsLoading(false);
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
      setRoleOptionsLoading(false);
    }
  };

  const getUniversitiesList = async () => {
    setUniOptionsLoading(true);
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
        setUniversities(decrypted);
        setUniOptionsLoading(false);
      } else {
        console.error(result.error);
        setUniOptionsLoading(false);
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
      setUniOptionsLoading(false);
    }
  };

  useEffect(() => {
    getReportingToList();
    getRoleList();
    getUniversitiesList();
  }, []);

  return (
    <div className="map-roles-modal-user">
      <div className="modal-header-roles">
        <h2>{t("manage_user.mu_cumd_header")}</h2>
        <div
          id="user-create-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>

      <div className="modal-body">
        <p>{t("manage_user.mu_cumd_basic_details")}</p>
        <div className="modal-content-user-section">
          <Formik
            innerRef={formikRef}
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              mobileNo: "",
              role: "",
              reportingTo: "",
              createdBy: "Jatin Khedikar",
              status: "Active",
              university: [],
            }}
            validationSchema={createUserValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                {/* first_name */}
                <div className="form-group-user">
                  <label className="role-label" htmlFor="firstName">
                    {t("manage_user.mu_cumd_form_fn_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  <Field
                    id="user-create-first-name"
                    type="text"
                    name="firstName"
                    placeholder={t("manage_user.mu_cumd_form_fn_phldr")}
                    className={
                      touched.firstName && errors.firstName ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* last_name */}
                <div className="form-group-user">
                  <label className="role-label" htmlFor="lastName">
                    {/* {t("manage_user.first_name_label")} */}
                    {t("manage_user.mu_cumd_form_ln_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  <Field
                    id="user-create-last-name"
                    type="text"
                    name="lastName"
                    // placeholder={t("manage_user.first_name_placeholder")}
                    placeholder={t("manage_user.mu_cumd_form_ln_phldr")}
                    className={
                      touched.lastName && errors.lastName ? "input-error" : ""
                    }
                  />
                  {/* {touched.lastName && errors.lastName && (
                    <span className="error-icon">
                      <ErrorIcon />
                    </span>
                  )} */}
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* email */}
                <div className="form-group-user">
                  <label className="role-label" htmlFor="email">
                    {t("manage_user.mu_cumd_form_email_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  <Field
                    id="user-create-email"
                    type="email"
                    name="email"
                    placeholder={t("manage_user.mu_cumd_form_email_phldr")}
                    className={
                      touched.email && errors.email ? "input-error" : ""
                    }
                  />
                  {/* {touched.email && errors.email && (
                    <span className="error-icon">
                      <ErrorIcon />
                    </span>
                  )} */}
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* mobile_number */}
                <div className="form-group-user">
                  <label className="role-label" htmlFor="mobileNo">
                    {t("manage_user.mu_cumd_form_mn_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  <Field
                    id="user-create-mobile-number"
                    type="text"
                    name="mobileNo"
                    placeholder={t("manage_user.mu_cumd_form_mn_phldr")}
                    className={
                      touched.mobileNo && errors.mobileNo ? "input-error" : ""
                    }
                  />
                  {/* {touched.mobileNo && errors.mobileNo && (
                    <span className="error-icon">
                      <ErrorIcon />
                    </span>
                  )} */}
                  <ErrorMessage
                    name="mobileNo"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* reportingTo */}
                <div className="form-group-user">
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="reportingTo">
                      {t("manage_user.mu_tbl_reporting_to")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="user-create-reporting-to"
                      value={
                        reportingToOptionsLoading
                          ? "loading"
                          : values.reportingTo
                      }
                      onChange={(e) =>
                        setFieldValue("reportingTo", e.target.value)
                      }
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.reportingTo && errors.reportingTo
                          ? "input-error"
                          : ""
                      }
                      style={{ height: "40px", width: "auto" }}
                    >
                      <MenuItem disabled value="">
                        <span style={{ color: "#aaa" }}>
                          {t("editusermodal.select_reportingmanager")}
                        </span>
                      </MenuItem>
                      {reportingToOptionsLoading ? (
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
                      ) : reportingToUserList.length === 0 ||
                        !reportingToUserList ? (
                        <MenuItem disabled>
                          {t("manage_roles.mr_deactive_assign_no_role")}
                        </MenuItem>
                      ) : (
                        reportingToUserList.length > 0 &&
                        reportingToUserList.map((mgr) => (
                          <MenuItem key={mgr.uuid} value={mgr.uuid}>
                            {mgr.first_name} {mgr.last_name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <ErrorMessage
                      name="reportingTo"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* Role */}
                <div className="form-group-user">
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="role">
                      {t("editusermodal.role")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="user-create-role"
                      value={roleOptionsLoading ? "loading" : values.role}
                      onChange={(e) => setFieldValue("role", e.target.value)}
                      IconComponent={ChevronDown}
                      fullWidth
                      displayEmpty
                      className={
                        touched.role && errors.role ? "input-error" : ""
                      }
                      style={{ height: "40px", width: "auto" }}
                    >
                      <MenuItem disabled value="">
                        <span style={{ color: "#aaa" }}>
                          {t("editusermodal.selectrole")}
                        </span>
                      </MenuItem>
                      {roleOptionsLoading ? (
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
                      ) : roleList.length === 0 || !roleList ? (
                        <MenuItem disabled>
                          {t("editusermodal.no_rolesavailable")}
                        </MenuItem>
                      ) : (
                        roleList.length > 0 &&
                        roleList.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* university */}
                <div className="form-group-user">
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="university">
                      {t("editusermodal.select_university")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="user-create-university"
                      displayEmpty
                      renderValue={(selected) => {
                        if (uniOptionsLoading) {
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

                        const isAllSelected = selected.includes(0);

                        const names = isAllSelected
                          ? universities.map((u) => u.name).join(", ")
                          : selected
                              .map(
                                (id) =>
                                  universities.find((u) => u.id === id)?.name
                              )
                              .filter(Boolean)
                              .join(", ");

                        return (
                          <span
                            style={{
                              color: names.length === 0 ? "#aaa" : "inherit",
                            }}
                          >
                            {names || t("editusermodal.select_university")}
                          </span>
                        );
                      }}
                      // renderValue={(selected) => {
                      //   if (uniOptionsLoading) {
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
                      //         ? t("editusermodal.select_university")
                      //         : selected
                      //             ?.map(
                      //               (id) =>
                      //                 universities.find(
                      //                   (university) => university.id === id
                      //                 )?.name
                      //             )
                      //             .join(", ")}
                      //     </span>
                      //   );
                      // }}
                      value={uniOptionsLoading ? [] : values.university}
                      onChange={(e) => {
                        const value = e.target.value;
                        const isSelectAllClicked = value.includes("all");

                        if (isSelectAllClicked) {
                          const isAllSelected = values.university.includes(0);
                          setFieldValue("university", isAllSelected ? [] : [0]);
                        } else {
                          const lastClicked = value[value.length - 1];

                          if (values.university.includes(0)) {
                            // Was "select all", now user deselected one
                            setFieldValue(
                              "university",
                              universities
                                .map((u) => u.id)
                                .filter((id) => id !== lastClicked)
                            );
                          } else {
                            // setFieldValue("university", value);
                            const allUniversityIds = universities.map(
                              (u) => u.id
                            );
                            const isAllSelectedNow = allUniversityIds.every(
                              (id) => value.includes(id)
                            );

                            if (isAllSelectedNow) {
                              setFieldValue("university", [0]);
                            } else {
                              setFieldValue("university", value);
                            }
                          }
                        }
                      }}
                      // onChange={(e) => {
                      //   const value = e.target.value;
                      //   if (value.includes("all")) {
                      //     // If "Select All" is selected, either select all or deselect all
                      //     setFieldValue(
                      //       "university",
                      //       values.university.length === universities.length
                      //         ? []
                      //         : universities.map((uni) => uni.id)
                      //     );
                      //   } else {
                      //     setFieldValue("university", value);
                      //   }
                      // }}
                      multiple
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.university && errors.university
                          ? "input-error"
                          : ""
                      }
                      style={{ height: "40px", width: "340px" }}
                    >
                      {/* Placeholder item, will only show when nothing is selected */}
                      <MenuItem disabled value="">
                        <span style={{ color: "#aaa" }}>
                          {t("editusermodal.select_university")}
                        </span>
                      </MenuItem>
                      {/* "Select All" option */}
                      <MenuItem value="all">
                        <Checkbox
                          checked={
                            values.university.includes(0) ||
                            values.university.length === universities.length
                          }
                          // checked={
                          //   values.university.length === universities.length
                          // }
                          // indeterminate={
                          //   values.university.length > 0 &&
                          //   values.university.length < universities.length
                          // }
                        />
                        <span>{t("editusermodal.selectall")}</span>
                      </MenuItem>
                      {uniOptionsLoading ? (
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
                      ) : universities.length === 0 || !universities ? (
                        <MenuItem disabled>
                          {t("editusermodal.nouniversities_available")}
                        </MenuItem>
                      ) : (
                        universities.length > 0 &&
                        universities.map((uni) => {
                          return (
                            <MenuItem key={uni.id} value={uni.id}>
                              <Checkbox
                                checked={
                                  values.university.includes(0) ||
                                  values.university.includes(uni.id)
                                }
                                // checked={values.university.includes(uni.id)}
                              />
                              <span className="map-role-item">{uni.name}</span>
                            </MenuItem>
                          );
                        })
                      )}
                    </Select>
                    <ErrorMessage
                      name="university"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* university display */}
                <div
                  className={`selected-university-list ${
                    values.university.length < 1 ? "bg-empty" : ""
                  }`}
                >
                  <h3>{t("editusermodal.selected_universities")}</h3>
                  {/* {values.university.length > 0 ? (
                    <ol>
                      {values.university.map((id) => {
                        const uni = universities.find((uni) => uni.id === id);
                        return uni ? <li key={id}>{uni.name}</li> : null;
                      })}
                    </ol>
                  ) : (
                    <p>{t("editusermodal.nouniversities_selected")}</p>
                  )} */}

                  {!values.university.length > 0 && (
                    <p>{t("editusermodal.nouniversities_selected")}</p>
                  )}

                  {(values.university.includes(0)
                    ? universities
                    : universities.filter((uni) =>
                        values.university.includes(uni.id)
                      )
                  )
                    .slice(0, 5)
                    .map((uni) => (
                      <Chip
                        key={uni.id}
                        label={uni.name}
                        variant="filled"
                        color="success"
                        sx={{
                          color: "#000",
                          border: "1px solid #00BC70",
                          background: "#ebfaf3",
                          margin: 1,
                        }}
                      />
                    ))}

                  <Tooltip
                    placement="right-start"
                    title={
                      <div className="tooltip-scrollable">
                        {(values.university.includes(0)
                          ? universities
                          : universities.filter((uni) =>
                              values.university.includes(uni.id)
                            )
                        )
                          .slice(5)
                          .map((uni, index, arr) => (
                            <List key={uni.id}>
                              <ListItem button disablePadding>
                                <ListItemText primary={uni.name} />
                              </ListItem>
                              {index !== arr.length - 1 && (
                                <Divider
                                  sx={{ borderColor: "#FFFFFF1A" }}
                                  component="li"
                                />
                              )}
                            </List>
                          ))}
                      </div>
                    }
                    arrow
                  >
                    {(values.university.includes(0)
                      ? universities
                      : universities.filter((uni) =>
                          values.university.includes(uni.id)
                        )
                    ).length > 5 && (
                      <span className="uni-chips">
                        +
                        {(values.university.includes(0)
                          ? universities
                          : universities.filter((uni) =>
                              values.university.includes(uni.id)
                            )
                        ).length - 5}{" "}
                        more
                      </span>
                    )}
                  </Tooltip>

                  {/* <div>
                    {values?.university &&
                    values?.university?.length > 0 &&
                    values?.university?.length <= 1 ? (
                      values?.university.map((id) => {
                        const uni = universities.find((uni) => uni.id === id);
                        return uni ? (
                          <Chip
                            key={uni?.id}
                            label={uni?.name}
                            variant="filled"
                            color="success"
                            sx={{
                              color: "#000",
                              border: "1px solid #00BC70",
                              background: "#ebfaf3",
                              margin: 1,
                            }}
                          />
                        ) : null;
                      })
                    ) : values?.university?.length > 1 ? (
                      values?.university?.slice(0, 5).map((id) => {
                        const uni = universities.find((uni) => uni.id === id);
                        return uni ? (
                          <Chip
                            key={uni?.id}
                            label={uni?.name}
                            variant="filled"
                            color="success"
                            sx={{
                              color: "#000",
                              border: "1px solid #00BC70",
                              background: "#ebfaf3",
                              margin: 1,
                            }}
                          />
                        ) : null;
                      })
                    ) : (
                      <p>{t("editusermodal.nouniversities_selected")}</p>
                    )}
                    <Tooltip
                      placement="right-start"
                      title={
                        <div className="tooltip-scrollable">
                          {values?.university?.length > 5
                            ? values?.university?.slice(5).map((id, index) => {
                                const uni = universities.find(
                                  (uni) => uni.id === id
                                );
                                return uni ? (
                                  <List key={uni?.id}>
                                    <ListItem button disablePadding>
                                      <ListItemText primary={uni?.name} />
                                    </ListItem>
                                    {index !==
                                      values?.university?.length - 1 && (
                                      <Divider
                                        sx={{ borderColor: "#FFFFFF1A" }}
                                        component="li"
                                      />
                                    )}
                                  </List>
                                ) : null;
                              })
                            : null}
                        </div>
                      }
                      arrow
                    >
                      {values?.university?.length > 5 && (
                        <span className="uni-chips">
                          +{values?.university?.length - 5} more
                        </span>
                      )}
                    </Tooltip>
                  </div> */}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <div className="modal-footer">
        <Button
          id="user-create-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("manage_user.mu_cumd_btn_cancel")}
        </Button>
        <div style={{ display: "flex" }}>
          <Button
            id="user-create-submit-new"
            variant="outlined"
            style={{ marginRight: "10px" }}
            className="save-create-btn"
            onClick={() => {
              setReset(true);
              formikRef.current.submitForm();
            }}
          >
            {reset && submitLoading ? (
              <CircularProgress size={20} color="#000" />
            ) : (
              t("manage_user.mu_cumd_btn_save_add_new")
            )}
          </Button>
          <Button
            id="user-create-submit"
            variant="contained"
            color="success"
            className="map-role-button"
            onClick={() => formikRef.current.submitForm()}
            style={{ marginRight: "20px" }}
          >
            {!reset && submitLoading ? (
              <CircularProgress size={20} color="#000" />
            ) : (
              t("manage_user.mu_cumd_btn_save")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
