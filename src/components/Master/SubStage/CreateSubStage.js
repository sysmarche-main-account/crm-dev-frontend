"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import CloseIcon from "@/images/close-icon.svg";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import "@/styles/EditMaster.scss";
import { useTranslations } from "next-intl";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { createMasterDataAction } from "@/app/actions/masterAction";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";

const CreateSubStatus = ({ onClose, onSave }) => {
  const t = useTranslations("create_substage");
  const [submitLoading, setSubmitLoading] = useState(false);
  const formikRef = useRef();
  const { showSnackbar } = useSnackbar();

  // Dropdown options
  const leadStageOptions = [
    { value: "New", label: "New" },
    { value: "Reference", label: "Reference" },
    { value: "Completed", label: "Completed" },
    { value: "Failed", label: "Failed" },
  ];

  const subStageOptions = [
    { value: "Untouch", label: "Untouch" },
    { value: "Reference", label: "Reference" },
  ];

  // ✅ **Validation Schema**
  const validationSchema = Yup.object({
    name: Yup.string().required(t("name_required")).trim(),
    description: Yup.string().required(t("description_required")).trim(),
    leadStage: Yup.string().required(t("lead_stage_required")),
    subStage: Yup.string().required(t("sub_stage_required")),
  });

  // Handle Save
  const handleSave = async (values, { resetForm }) => {
    try {
      setSubmitLoading(true);
      console.log("🔄 Submitting Form Data:", values);

      // Fetch CSRF Token
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error("Failed to fetch CSRF token");
      }

      const reqBody = {
        identifier: "sub stage",
        name: values.name,
        description: values.description,
        status: values.status,
      };

      console.log("📤 Request Payload:", reqBody);

      // Call API
      const result = await createMasterDataAction(csrfToken, reqBody);
      console.log("✅ API Response:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        showSnackbar({
          message: `<strong>${decrypted.name}</strong> added successfully.`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });

        resetForm();
        onSave?.(decrypted);
        onClose();
      } else {
        console.error("API call failed:", result);
        showSnackbar({
          message: "save_failed",
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      showSnackbar({
        message: t("api_error", { error: error.message }),
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApiError = (error, context) => {
    if (error.status === 500) {
      logout();
    } else if (typeof error.message === "string") {
      showSnackbar({
        message: `${context} - ${error.message}`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } else if (typeof error.message === "object" && error.message !== null) {
      let errValues = Object.values(error.message);
      if (errValues.length > 0) {
        errValues.forEach((errmsg) =>
          showSnackbar({
            message: `${context} - ${errmsg}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          })
        );
      } else {
        showSnackbar({
          message: `${context} - Error response empty`,
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      }
    } else {
      showSnackbar({
        message: `${context} - Unknown error type or null`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  return (
    <div className="modal-container-master" style={{ padding: "0 20px" }}>
      <div className="modal-master">
        {/* ✅ Modal Header */}
        <div className="modal-header">
          <h2>{t("header")}</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* ✅ Modal Body */}
        <div className="modal-body">
          <Formik
            innerRef={formikRef}
            initialValues={{
              name: "",
              description: "",
              status: "Enabled",
              leadStage: "",
              subStage: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave} // Fixed reference
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form style={{ width: "100%" }}>
                {/* Name Field */}
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <FormControl fullWidth variant="outlined">
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      as="input"
                      name="name"
                      placeholder="Enter sub-stage name"
                      style={{
                        width: "730px",
                        maxWidth: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "16px",
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      }}
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
                </div>

                {/* Lead Stage */}
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <FormControl fullWidth variant="outlined">
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      Select Lead Stage <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      displayEmpty
                      name="leadStage"
                      value={values.leadStage || ""}
                      onChange={(e) =>
                        setFieldValue("leadStage", e.target.value)
                      }
                      inputProps={{ "aria-label": "Select Lead Stage" }}
                      sx={{
                        width: "100%",
                        height: "56px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        fontSize: "16px",
                        color: values.leadStage ? "#000" : "#333", // Default text color
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)", // Box Shadow applied here
                        height: "40px",
                        "& .MuiSelect-select": {
                          padding: "12px", // Padding inside the dropdown
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ccc",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#aaa", // Hover border color
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976D2", // Focus border color
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select a lead stage
                      </MenuItem>
                      {/* Menu Items */}
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Reference">Reference</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Failed">Failed</MenuItem>
                    </Select>
                    <ErrorMessage
                      name="leadStage"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* Sub-Stage */}
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <FormControl fullWidth variant="outlined">
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      Select Sub-Stage <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      displayEmpty
                      name="subStage"
                      value={values.subStage || ""}
                      onChange={(e) =>
                        setFieldValue("subStage", e.target.value)
                      }
                      inputProps={{ "aria-label": "Select Sub-Stage" }}
                      sx={{
                        width: "100%",
                        height: "56px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        fontSize: "16px",
                        color: values.subStage ? "#000" : "#333", // Default text color
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)", // Box Shadow applied here
                        height: "40px",
                        "& .MuiSelect-select": {
                          padding: "12px", // Padding inside the dropdown
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ccc",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#aaa", // Hover border color
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976D2", // Focus border color
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select a sub-stage
                      </MenuItem>
                      {/* Menu Items */}
                      <MenuItem value="Untouch">Untouch</MenuItem>
                      <MenuItem value="Reference">Reference</MenuItem>
                    </Select>
                    <ErrorMessage
                      name="subStage"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* Description Field */}
                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <FormControl fullWidth variant="outlined">
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Description
                    </label>
                    <Field
                      as="input"
                      name="description"
                      placeholder="Enter sub-stage description"
                      style={{
                        width: "730px",
                        maxWidth: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "16px",
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      }}
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
                  </FormControl>
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
                    {submitLoading ? <CircularProgress size={20} /> : "Save"}
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

export default CreateSubStatus;
