"use client";

import React, { useRef, useState } from "react";
import { Button, FormControl, CircularProgress } from "@mui/material";
import CloseIcon from "@/images/close-icon.svg";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import "@/styles/EditMaster.scss";
import { useTranslations } from "next-intl";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { updateMasterDataAction } from "@/app/actions/masterAction";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import PropTypes from "prop-types";

const EditStatus = ({ data, onClose, onSave }) => {
  const t = useTranslations("edit_course");
  const formikRef = useRef();
  const { showSnackbar } = useSnackbar();
  const [submitLoading, setSubmitLoading] = useState(false);

  // ✅ Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string().required(t("name_required")).trim(),
    description: Yup.string().required(t("description_required")).trim(),
    status: Yup.string().required(t("status_required")),
  });

  // ✅ Handle Submit
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);
      setSubmitLoading(true);
      console.log("🔄 Submitting Form Data:", values);

      const csrfToken = await getCsrfToken();
      const reqBody = {
        id: data?.id,
        name: values.name,
        description: values.description,
        status: values.status,
      };

      console.log("📤 Request Payload:", reqBody);

      const result = await updateMasterDataAction(csrfToken, reqBody);

      console.log("✅ API Response:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        if (typeof onSave === "function") {
          onSave({ ...data, ...values });
        }

        showSnackbar({
          message: `<strong>${decrypted.name}</strong> updated successfully.`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });

        onClose();
      } else {
        handleApiError(result.error, "Edit Status");
      }
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
      handleApiError(error, "Edit Status");
    } finally {
      setSubmitLoading(false);
      setSubmitting(false);
    }
  };

  const handleApiError = (error, context) => {
    if (error.status === 500) {
      console.error("❌ Server Error:", error);
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
        {/* Header */}
        <div className="modal-header">
          <h2>Edit Stage</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <Formik
            innerRef={formikRef}
            initialValues={{
              name: data?.name || "",
              description: data?.description || "",
              status: data?.status || "Enabled",
            }}
            validationSchema={Yup.object({
              name: Yup.string().required(t("name_required")).trim(),
              description: Yup.string()
                .required(t("description_required"))
                .trim(),
              status: Yup.string().required(t("status_required")),
            })}
            onSubmit={handleSubmit}
          >
            {({ touched, errors }) => (
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
                      placeholder="Enter status name"
                      style={{
                        width: "730px",
                        maxWidth: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "16px",
                        boxSizing: "border-box",
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)", // Consistent Box Shadow
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
                      placeholder="Enter status description"
                      style={{
                        width: "730px",
                        maxWidth: "100%",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "16px",
                        boxSizing: "border-box",
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)", // Consistent Box Shadow
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
                    marginTop: "20px",
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
                    className="save-button"
                  >
                    Save
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

export default EditStatus;
