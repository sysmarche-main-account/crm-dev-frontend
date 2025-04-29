"use client";
import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@/images/close-icon.svg";
import ChevronDown from "@/images/chevron-down.svg";
// import "@/styles/EditUserModal.scss";
import { useTranslations } from "next-intl";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import {
  FormControl,
  MenuItem,
  Select,
  Button,
  Avatar,
  Alert,
  Checkbox,
  CircularProgress,
  Box,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { getRoleListDDAction } from "@/app/actions/rolesActions";
import {
  getUsersDDAction,
  handleEditUserAction,
  handleSingleUserDetailsAction,
} from "@/app/actions/userActions";
import { decryptClient } from "@/utils/decryptClient";
import { masterDDAction } from "@/app/actions/commonActions";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useSelector } from "react-redux";
import { handleUploadImageAction } from "@/app/actions/profileActions";
import { getToken } from "@/utils/getToken";

const EditUserModal = ({ selectedUser, onClose, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);

  const [editSubmitLoading, setEditSubmitLoading] = useState(false);

  const [picLoading, setPicLoading] = useState(false);
  const [hasPic, setHasPic] = useState(null);
  const [ppic, setPpic] = useState(true);
  const [removePic, setRemovePic] = useState(false);
  const [alertPic, setAlertPic] = useState(false);

  const [userDetails, setUserDetails] = useState(null);

  const [reportingToOptionsLoading, setReportingToOptionsLoading] =
    useState(false);
  const [roleOptionsLoading, setRoleOptionsLoading] = useState(false);
  const [uniOptionsLoading, setUniOptionsLoading] = useState(false);
  const [reportingToUserList, setReportingToUserList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [universities, setUniversities] = useState([]);

  const formikRef = useRef();

  const editUserValidationSchema = Yup.object({
    firstName: Yup.string()
      .min(3)
      .max(200)
      .matches(/^[A-Za-z ]+$/, t("manage_user.400344"))
      .required(t("profile.400014"))
      .trim()
      .transform((value) => value?.trim()),
    lastName: Yup.string()
      .min(3)
      .max(200)
      .matches(/^[A-Za-z ]+$/, t("manage_user.400344"))
      .required(t("profile.400015"))
      .trim()
      .transform((value) => value?.trim()),
    email: Yup.string()
      .email()
      .required(t("profile.400001"))
      .trim()
      .transform((value) => value?.trim()),
    mobileNo: Yup.string()
      .matches(/^\d{10}$/, t("leads.400345"))
      .required(t("profile.400016"))
      .trim()
      .transform((value) => value?.trim()),
    reportingTo: Yup.string().required(t("manage_user.400051")),
    role: Yup.string()
      .required(t("profile.400017"))
      .trim()
      .transform((value) => value?.trim()),
    university: Yup.array()
      .of(Yup.number().typeError("Each selected university value is incorrect"))
      .min(1, "Select at least one university")
      .required(t("manage_user.400376")),
  });

  const handlEditSubmit = async (values) => {
    // console.log(values);
    setEditSubmitLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: selectedUser,
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      mobile_number: values.mobileNo,
      reporting_manager: values.reportingTo,
      role_id: values.role,
      universities: values.university,
    };

    console.log("rebody", reqbody);

    try {
      const result = await handleEditUserAction(csrfToken, reqbody);
      // console.log("edit user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        showSnackbar({
          message: `<strong>${decrypted.first_name} ${
            decrypted.last_name
          }</strong> ${t("manage_user.mu_edituser_alert")}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        onClose();
        handleDataChange();
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
        setEditSubmitLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setEditSubmitLoading(false);
    }
  };

  const handleRemoveProfilePic = () => setRemovePic(!removePic);

  const handleConfirmRemoveProfilepic = () => {
    handleProfilePicDelete();
  };

  const getUserDetails = async () => {
    setLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: selectedUser,
    };
    try {
      const result = await handleSingleUserDetailsAction(csrfToken, reqbody);
      // console.log("single user details result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final user", decrypted);
        setUserDetails(decrypted);
        setLoading(false);
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
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
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
        console.log("final universities", decrypted);
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

  const handleProfilePicDelete = async () => {
    setPicLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: selectedUser,
      delete_profile_img: 1,
    };
    try {
      const result = await handleUploadImageAction(csrfToken, reqbody);
      // console.log("profilepic upload result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("picture delete final", decrypted);

        const token = details?.session_token;
        setPpic(!ppic);
        setAlertPic(true);
        setPicLoading(false);
        setHasPic(false);
        await getUserDetails();
        // showSnackbar({
        //   message: `Profile Pic deleted successfully!`,
        //   severity: "success",
        //   anchorOrigin: { vertical: "top", horizontal: "right" },
        // });
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
        setPicLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setPicLoading(false);
    }
  };

  useEffect(() => {
    getUserDetails();
    getReportingToList();
    getRoleList();
    getUniversitiesList();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasPic(userDetails?.profile_img);
    img.onerror = () => setHasPic(false);
    img.src = userDetails?.profile_img || "";
  }, [userDetails?.profile_img]);

  useEffect(() => {
    if (alertPic) {
      const timer = setTimeout(() => {
        setAlertPic(false); // Change state to false after 5 seconds
      }, 5000);

      // Cleanup the timer when component unmounts or when alertPic changes
      return () => clearTimeout(timer);
    }
  }, [alertPic]);

  return (
    <div className="map-roles-modal-user">
      <div className="modal-header-roles">
        <h2>{t("manage_user.mu_eum_header")}</h2>
        <div
          id="user-edit-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      {loading ? (
        <div
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
        <div className="edit-user-modal">
          {alertPic && (
            <div className="redalert">
              <Alert
                onClose={() => setAlertPic(false)}
                severity="error"
                variant="filled"
                icon={<DeleteOutline fontSize="inherit" />}
                sx={{ width: "95%" }}
              >
                <span> {t("editusermodal.profilepicture_deleted")}</span>
              </Alert>
            </div>
          )}
          <div className="edit-profile-pic-section">
            <div className="avatar-div">
              <Avatar
                className="avatar-profile"
                src={userDetails?.profile_img}
                alt={`${userDetails?.first_name} ${userDetails?.last_name}`}
              >
                {!userDetails?.profile_img &&
                userDetails?.first_name &&
                userDetails?.last_name
                  ? `${userDetails?.first_name[0]?.toUpperCase()}${userDetails?.last_name[0]?.toUpperCase()}`
                  : null}
              </Avatar>
              <h4> {t("editusermodal.profile_picture")}</h4>
            </div>
            <div>
              {hasPic &&
                ppic &&
                (removePic ? (
                  <div className="avatar-div">
                    <button
                      id="user-edit-remove-pic-cancel-btn"
                      onClick={handleRemoveProfilePic}
                    >
                      Cancel
                    </button>
                    <button
                      id="user-edit-remove-pic-confirm-btn"
                      onClick={handleConfirmRemoveProfilepic}
                      className="avatar-confirm-button"
                    >
                      {picLoading ? (
                        <CircularProgress size={20} color="#000" />
                      ) : (
                        t("editusermodal.confirm")
                      )}
                    </button>
                  </div>
                ) : (
                  <Button
                    style={{
                      background: "#FFDADA",
                      color: "#F92A2A",
                      boxShadow: "none",
                      textTransform: "capitalize",
                      fontFamily: "Inter",
                    }}
                    id="user-edit-remove-pic-open-btn"
                    onClick={handleRemoveProfilePic}
                  >
                    {t("editusermodal.remove")}
                  </Button>
                ))}
            </div>
          </div>
          <p className="edit-header-label">
            {t("manage_user.mu_cumd_basic_details")}
          </p>
          <div className="modal-body">
            <div className="modal-content-user-section">
              <Formik
                innerRef={formikRef}
                initialValues={{
                  firstName: userDetails?.first_name,
                  lastName: userDetails?.last_name,
                  email: userDetails?.email,
                  mobileNo: userDetails?.mobile_number,
                  role: userDetails?.role?.id ?? "",
                  reportingTo: userDetails?.reporting_manager?.uuid ?? "",
                  // university:
                  //   (userDetails?.university &&
                  //     userDetails?.university.map((uni) => uni.id)) ??
                  //   [],
                  university: userDetails?.university
                    ? userDetails?.university?.length === 1 &&
                      userDetails?.university[0] === 0
                      ? [0]
                      : userDetails?.university?.map((uni) => uni.id)
                    : [],
                }}
                validationSchema={editUserValidationSchema}
                onSubmit={handlEditSubmit}
              >
                {({ values, errors, touched, setFieldValue }) => (
                  <Form>
                    <div className="form-section">
                      {/* first_name */}
                      <div className="form-group">
                        <label htmlFor="firstName">
                          {t("manage_user.mu_cumd_form_fn_lab")}{" "}
                          <span style={{ color: "#f00" }}>*</span>{" "}
                        </label>
                        <Field
                          id="user-edit-first-name"
                          type="text"
                          name="firstName"
                          value={values?.firstName}
                          className={
                            touched.firstName && errors.firstName
                              ? "input-error"
                              : ""
                          }
                        />
                        <ErrorMessage
                          name="firstName"
                          component="div"
                          className="error-message"
                        />
                      </div>

                      {/* last_name */}
                      <div className="form-group">
                        <label htmlFor="lastName">
                          {t("manage_user.mu_cumd_form_ln_lab")}{" "}
                          <span style={{ color: "#f00" }}>*</span>{" "}
                        </label>
                        <Field
                          id="user-edit-last-name"
                          type="text"
                          name="lastName"
                          value={values?.lastName}
                          className={
                            touched.lastName && errors.lastName
                              ? "input-error"
                              : ""
                          }
                        />
                        <ErrorMessage
                          name="lastName"
                          component="div"
                          className="error-message"
                        />
                      </div>

                      {/* email */}
                      <div className="form-group">
                        <label>
                          {t("manage_user.mu_cumd_form_email_lab")}{" "}
                          <span style={{ color: "#f00" }}>*</span>{" "}
                        </label>
                        <Field
                          id="user-edit-email"
                          type="email"
                          name="email"
                          value={values.email}
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

                      {/* mobile_number */}
                      <div className="form-group">
                        <label htmlFor="mobileNo">
                          {t("manage_user.mu_cumd_form_mn_lab")}{" "}
                          <span style={{ color: "#f00" }}>*</span>{" "}
                        </label>
                        <Field
                          id="user-edit-mobile-no"
                          type="text"
                          name="mobileNo"
                          value={values.mobileNo}
                          className={
                            touched.mobileNo && errors.mobileNo
                              ? "input-error"
                              : ""
                          }
                        />
                        <ErrorMessage
                          name="mobileNo"
                          component="div"
                          className="error-message"
                        />
                      </div>

                      {/* reportingTo */}
                      <div className="form-group">
                        <FormControl fullWidth>
                          <label className="role-label" htmlFor="reportingTo">
                            {t("manage_user.mu_cumd_form_reporting_to")}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id="user-edit-reporting-to"
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
                            style={{ height: "40px", width: "340px" }}
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
                                {" "}
                                {t("editusermodal.no_rolesavailable")}{" "}
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

                      {/* role */}
                      <div className="form-group">
                        <FormControl fullWidth>
                          <label htmlFor="role">
                            {t("editusermodal.role")}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id="user-edit-role"
                            value={roleOptionsLoading ? "loading" : values.role}
                            onChange={(e) =>
                              setFieldValue("role", e.target.value)
                            }
                            displayEmpty
                            IconComponent={ChevronDown}
                            fullWidth
                            className={
                              touched.role && errors.role ? "input-error" : ""
                            }
                            style={{ height: "40px", width: "340px" }}
                          >
                            <MenuItem disabled value="">
                              <span style={{ color: "#aaa" }}>
                                {" "}
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
                                {" "}
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
                      <div className="form-group">
                        <FormControl fullWidth>
                          <label className="role-label" htmlFor="university">
                            {t("editusermodal.select_university")}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id="user-edit-university"
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
                                        universities.find((u) => u.id === id)
                                          ?.name
                                    )
                                    .filter(Boolean)
                                    .join(", ");

                              return (
                                <span
                                  style={{
                                    color:
                                      names.length === 0 ? "#aaa" : "inherit",
                                  }}
                                >
                                  {names ||
                                    t("editusermodal.select_university")}
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
                            //           selected?.length === 0
                            //             ? "#aaa"
                            //             : "inherit",
                            //       }}
                            //     >
                            //       {selected?.length === 0
                            //         ? "Select universities"
                            //         : selected
                            //             ?.map(
                            //               (id) =>
                            //                 universities.find(
                            //                   (university) =>
                            //                     university.id === id
                            //                 )?.name
                            //             )
                            //             .join(", ")}
                            //     </span>
                            //   );
                            // }}
                            value={uniOptionsLoading ? [] : values?.university}
                            onChange={(e) => {
                              const value = e.target.value;
                              const isSelectAllClicked = value.includes("all");

                              if (isSelectAllClicked) {
                                const isAllSelected =
                                  values.university.includes(0);
                                setFieldValue(
                                  "university",
                                  isAllSelected ? [] : [0]
                                );
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
                                  const isAllSelectedNow =
                                    allUniversityIds.every((id) =>
                                      value.includes(id)
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
                            //       values.university.length ===
                            //         universities.length
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
                            {/* Placeholder item, will only show when nothing is selected*/}
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
                                  values.university.length ===
                                    universities.length
                                }
                                // checked={
                                //   values?.university?.length ===
                                //   universities?.length
                                // }
                                // indeterminate={
                                //   values?.university?.length > 0 &&
                                //   values?.university?.length <
                                //     universities?.length
                                // }
                              />
                              <span> {t("editusermodal.selectall")}</span>
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
                                      // checked={values?.university?.includes(
                                      //   uni.id
                                      // )}
                                    />
                                    <span className="map-role-item">
                                      {uni.name}
                                    </span>
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
                          values?.universityAssigned?.length < 1
                            ? "bg-empty"
                            : ""
                        }`}
                      >
                        <h3> {t("editusermodal.selected_universities")}</h3>
                        {/* {values?.university?.length > 0 ? (
                          <ol>
                            {values.university.map((id) => {
                              const uni = universities.find(
                                (uni) => uni.id === id
                              );
                              return uni ? <li key={id}>{uni.name}</li> : null;
                            })}
                          </ol>
                        ) : (
                          <p> {t("editusermodal.nouniversities_selected")}</p>
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
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      <div className="modal-footer">
        <Button
          id="user-edit-cancle-btn"
          className="cancel-button"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
        >
          {t("manage_user.mu_eum_btn_cancel")}
        </Button>
        <Button
          id="user-edit-submit-btn"
          className="map-role-button"
          onClick={() => formikRef.current.submitForm()}
          style={{ marginRight: "20px" }}
          disabled={loading}
        >
          {editSubmitLoading ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("manage_user.mu_eum_btn_save")
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditUserModal;
