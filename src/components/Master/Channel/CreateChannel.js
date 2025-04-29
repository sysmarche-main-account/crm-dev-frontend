"use client";

import React, { useRef, useState } from "react";
import { Button, FormControl, CircularProgress } from "@mui/material";
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

const CreateChannel = ({ onClose, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  // ✅ Validation Schema
  const formikRef = useRef();
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(100)
      .required("Channel name is required")
      .trim()
      .transform((value) => value?.trim()),
    shortName: Yup.string()
      .max(100)
      // .required(t("name_required"))
      .trim()
      .transform((value) => value?.trim()),
    description: Yup.string()
      .max(100)
      // .required(t("description_required"))
      .trim()
      .transform((value) => value?.trim()),
    order: Yup.number().min(0),
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // ✅ Handle Save
  const handleSave = async (values) => {
    setSubmitLoading(true);
    const csrfToken = await getCsrfToken();
    const reqBody = {
      identifier: "channel",
      name: values.name,
      short_name: values.shortName,
      description: values.description,
      sorting_order: values.order,
    };
    console.log("📤 Request Payload:", reqBody);

    try {
      // Call API
      const result = await createMasterDataAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("✅ API Response:", decrypted);

        // ✅ Snackbar Success Message
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
      console.error("Unexpected error:", error);
      setSubmitLoading(false);
    }
  };

  return (
    <div className="modal-container-master" style={{ padding: "0 20px" }}>
      <div className="modal-master">
        {/* Header */}
        <div className="modal-header">
          <h2>Create Channel</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <Formik
            innerRef={formikRef}
            initialValues={{
              name: "",
              description: "",
              status: "Enabled", // Default status
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ touched, errors }) => (
              <Form style={{ width: "100%" }}>
                {/* Name Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="name">
                    Channel Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder="Enter channel name"
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
                    type="text"
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

export default CreateChannel;
