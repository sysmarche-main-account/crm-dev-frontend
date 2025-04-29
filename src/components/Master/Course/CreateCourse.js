"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import CloseIcon from "@/images/close-icon.svg";
import ChevronDown from "@/images/chevron-down.svg";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import "@/styles/EditMaster.scss";
import { useTranslations } from "next-intl";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import {
  createMasterDataAction,
  getMasterDDAction,
} from "@/app/actions/masterAction";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";

const CreateCourse = ({ onClose, handleDataChange }) => {
  const logout = useLogout();
  const t = useTranslations();
  const { showSnackbar } = useSnackbar();

  // Validation Schema
  const formikRef = useRef();
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(100)
      .required("Course name is required.")
      .trim()
      .transform((value) => value?.trim()),
    shortName: Yup.string()
      .max(100)
      // .required(t("name_required"))
      .trim()
      .transform((value) => value?.trim()),
    description: Yup.string()
      .max(100)
      // .required("Description is required.")
      .trim()
      .transform((value) => value?.trim()),
    university: Yup.number().required("University is required."),
    order: Yup.number().min(0),
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [universityOptions, setUniversityOptions] = useState([]);
  const [uniLodaing, setUniLoading] = useState(false); // Loading state

  // Fetch University Options
  const fetchUniversityOptions = async () => {
    setUniLoading(true);
    const csrfToken = await getCsrfToken();
    const reqBody = { identifier: ["university"] };

    try {
      const result = await getMasterDDAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        setUniversityOptions(decrypted); // Update state with fetched universities
        setUniLoading(false);
      } else {
        console.error(result.error);
        setUniLoading(false);
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
          } else {
            showSnackbar({
              message: `Error response empty`,
              severity: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching university options:", error);
      setUniLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversityOptions();
  }, []);

  const handleSave = async (values, { resetForm }) => {
    try {
      setSubmitLoading(true);
      const csrfToken = await getCsrfToken();
      if (!csrfToken) throw new Error("Failed to fetch CSRF token");

      const reqBody = {
        identifier: "course",
        name: values.name,
        short_name: values.shortName,
        description: values.description,
        parent_id: values.universityName,
        sorting_order: values.order,
      };

      const result = await createMasterDataAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        showSnackbar({
          message: `<strong>${decrypted.name}</strong> added successfully.`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });

        onClose();
        handleDataChange();
      } else {
        console.error(result.error);
        setSubmitLoading(false);
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
          } else {
            showSnackbar({
              message: `Error response empty`,
              severity: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          }
        }
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      setSubmitLoading(false);
    }
  };

  return (
    <div className="modal-container-master">
      <div className="modal-master">
        <div className="modal-header">
          <h2>Create Course</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <Formik
            innerRef={formikRef}
            initialValues={{
              name: "",
              shortName: "",
              university: "",
              description: "",
              order: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form style={{ width: "100%" }}>
                {/* University List */}
                <div style={{ marginBottom: "24px" }}>
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="university">
                      University
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="master-create-lead-university"
                      value={uniLodaing ? "loading" : values.university}
                      onChange={(e) => {
                        setFieldValue("university", e.target.value);
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
                      <MenuItem disabled value="">
                        {t("leads.csl_univ_phldr")}
                      </MenuItem>
                      {uniLodaing ? (
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
                      ) : universityOptions?.length === 0 ||
                        !universityOptions ? (
                        <MenuItem disabled>{t("leads.cl_no_unives")}</MenuItem>
                      ) : (
                        universityOptions?.length > 0 &&
                        universityOptions?.map((uni) => (
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

                {/* Name Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="name">
                    Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Enter course name"
                    style={{ maxWidth: "100%" }}
                    className={touched.name && errors.name ? "input-error" : ""}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Short Name Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="shortName">Short Name</label>
                  <Field
                    name="shortName"
                    type="text"
                    placeholder="Enter Short name "
                    style={{ maxWidth: "100%" }}
                    className={
                      touched.shortName && errors.shortName ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="shortName"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Description Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="description">Description</label>
                  <Field
                    as="input"
                    name="description"
                    placeholder="Enter description"
                    style={{ maxWidth: "100%" }}
                    className={
                      touched.description && errors.description
                        ? "input-error"
                        : ""
                    }
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Order Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="order">Sort Order</label>
                  <Field
                    name="order"
                    type="number"
                    placeholder="Enter sort order"
                    style={{ maxWidth: "100%" }}
                    className={
                      touched.order && errors.order ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="order"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Buttons */}
                <div
                  className="modal-footer"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    className="cancel-button"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitLoading}
                    className="save-button"
                  >
                    {submitLoading ? (
                      <CircularProgress size={20} color="#000" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
