import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import CloseIcon from "@/images/close-icon.svg";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import "@/styles/EditMaster.scss";
import ChevronDown from "@/images/chevron-down.svg";
import { useTranslations } from "next-intl";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  createMasterDataAction,
  getMasterDDAction,
} from "@/app/actions/masterAction";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";

const CreateSourceMedium = ({ onClose, handleDataChange }) => {
  const logout = useLogout();
  const t = useTranslations();
  const { showSnackbar } = useSnackbar();

  // Validation Schema
  const formikRef = useRef();
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(100)
      .required("Medium name is required")
      .trim()
      .transform((value) => value?.trim()),
    shortName: Yup.string()
      .max(100)
      // .required(t("name_required"))
      .trim()
      .transform((value) => value?.trim()),
    channel: Yup.number().required(t("leads.400156")),
    description: Yup.string()
      .max(100)
      // .required(t("description_required"))
      .trim()
      .transform((value) => value?.trim()),
    order: Yup.number().min(0),
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [channelOptions, setChannelOptions] = useState([]); // Lead channel options state
  const [channelLoading, setChannelLoading] = useState(false); // Loading state

  // Fetch Lead Channel Options
  const fetchChannelOptions = async () => {
    setChannelLoading(true);
    try {
      const csrfToken = await getCsrfToken();
      const reqBody = { identifier: ["channel"] }; // Use the channel identifier

      const result = await getMasterDDAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        setChannelOptions(decrypted); // Update state with fetched channels
        setChannelLoading(false);
      } else {
        console.error(result.error);
        setChannelLoading(false);
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
      console.error("Error fetching channel options:", error);
      setChannelLoading(false);
    }
  };

  // Fetch lead channels on component mount
  useEffect(() => {
    fetchChannelOptions();
  }, []);

  // Handle Save
  const handleSave = async (values) => {
    setSubmitLoading(true);
    const csrfToken = await getCsrfToken();
    const reqBody = {
      identifier: "medium",
      name: values.name,
      short_name: values.shortName,
      description: values.description,
      parent_id: values.channel,
      sorting_order: values.order,
    };
    console.log("📤 Request Payload:", reqBody);

    // Call API
    try {
      const result = await createMasterDataAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("✅ API Response:", decrypted);

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
    <div className="modal-container-master" style={{ padding: "0 20px" }}>
      <div className="modal-master">
        <div className="modal-header">
          <h2>Create Medium</h2>
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
              channel: "",
              description: "",
              order: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form style={{ width: "100%" }}>
                {/* Select Channel */}
                <div style={{ marginBottom: "24px" }}>
                  <FormControl fullWidth>
                    <label htmlFor="channel">
                      Select Channel <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      displayEmpty
                      name="channel"
                      value={channelLoading ? "loading" : values.channel}
                      onChange={(e) => setFieldValue("channel", e.target.value)}
                      IconComponent={ChevronDown}
                      style={{ maxWidth: "100%", height: "40px" }}
                    >
                      <MenuItem value="" disabled>
                        {t("leads.csl_leadsource_phldr")}
                      </MenuItem>
                      {channelLoading ? (
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
                      ) : channelOptions?.length === 0 || !channelOptions ? (
                        <MenuItem disabled>
                          {t("leads.cl_no_lead_sources")}
                        </MenuItem>
                      ) : (
                        channelOptions?.length > 0 &&
                        channelOptions?.map((ch) => (
                          <MenuItem key={ch.id} value={ch.id}>
                            {ch.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <ErrorMessage
                      name="channel"
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
                    type="text"
                    name="name"
                    placeholder="Enter medium name"
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

export default CreateSourceMedium;
