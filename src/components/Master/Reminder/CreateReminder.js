"use client";

import React, { useRef, useState } from "react";
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
import useLogout from "@/app/hooks/useLogout";

const CreateReminder = ({ onClose, handleDataChange }) => {
  const logout = useLogout();
  const t = useTranslations(); // Hook for translations
  const { showSnackbar } = useSnackbar();

  // ✅ Validation Schema
  const formikRef = useRef();
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(100)
      .required("Reminder name is required")
      .trim()
      .transform((value) => value?.trim()),
    duration: Yup.number().min(1).required("Duration is requried"),
    description: Yup.string()
      .max(100)
      // .required(t("description_required"))
      .trim()
      .transform((value) => value?.trim()),
    order: Yup.number().min(0),
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Handle Save
  const handleSave = async (values) => {
    setSubmitLoading(true);
    const csrfToken = await getCsrfToken();
    const reqBody = {
      identifier: "reminder",
      name: values.name,
      short_name: values.duration,
      description: values.description,
      sorting_order: values.order,
    };
    console.log("📤 Request Payload:", reqBody);

    try {
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
      console.error("Error during form submission:", error);
      setSubmitLoading(false);
    }
  };

  return (
    <div className="modal-container-master" style={{ padding: "0 20px" }}>
      <div className="modal-master">
        {/* ✅ Modal Header */}
        <div className="modal-header">
          <h2>Create Reminder</h2>
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
              shortName: "",
              description: "",
              order: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form style={{ width: "100%" }}>
                {/* Name Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="name">
                    Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Enter reminder name"
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
                  <label htmlFor="duration">
                    Enter duration (in seconds){" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    name="duration"
                    type="number"
                    placeholder="Enter duration"
                    style={{ maxWidth: "100%" }}
                    className={
                      touched.duration && errors.duration ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="duration"
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
                    placeholder="Enter Description"
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
export default CreateReminder;
