"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Box,
  Checkbox,
  Chip,
} from "@mui/material";
import * as Yup from "yup";
import GobackIcon from "@/images/chevron-left.svg";
import ChevronDown from "@/images/chevron-down.svg";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import {
  updateTemplateAction,
  variableListDDACtion,
} from "@/app/actions/templateActions";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { getUsersDDAction } from "@/app/actions/userActions";
import { getToken } from "@/utils/getToken";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useSelector } from "react-redux";
import TestTemplateModal from "./TestTemplateModal";
import DeleteIcon from "@mui/icons-material/Delete";

const SummerNoteEditor = dynamic(() => import("../SummerNoteEditor"), {
  loading: () => <CircularProgress color="#000" />,
  ssr: false,
});

const EditEmailTemplate = ({
  open,
  onClose,
  handleDataChange,
  selectedTemplate,
}) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  if (!open) return null; // Return null if the modal is not open

  const formikEditTemplatedRef = useRef();
  const fileInputRef = useRef(null);

  const stripHtml = (html) => html.replace(/<[^>]*>/g, "").trim();

  const editEmailTemplateValidationSchema = Yup.object({
    title: Yup.string()
      .min(3)
      .max(200)
      .required(t("followup.400201"))
      .trim()
      .transform((value) => value?.trim()),
    subject: Yup.string()
      .min(3)
      .max(200)
      .required(t("manage_template.400372"))
      .trim()
      .transform((value) => value?.trim()),
    counsellors: Yup.array()
      .of(Yup.string().typeError("Selected Counsellor value is incorrect"))
      .min(1, "Select at least one Counsellor")
      .required(t("rules.400369")),
    body: Yup.string()
      .required(t("manage_template.400373"))
      .test(
        "has-meaningful-text",
        "Content must include meaningful text",
        (value) => {
          const plainText = stripHtml(value);
          return plainText.length > 0;
        }
      ),
    // .test(
    //   "has-p-tag",
    //   "Content must include at least one paragraph",
    //   (value) => {
    //     return /<p>.*?<\/p>/.test(value);
    //   }
    // ),
  });

  const [loading, setLoading] = useState({
    variables: false,
    counsellors: false,
    save: false,
    submit: false,
  });

  const [template, setTemplate] = useState(null);

  const [value, setValue] = useState("");

  const [variables, setVariables] = useState(null);
  const [counsellors, setCounsellors] = useState(null);

  const [selectedVar, setSelectedVar] = useState(null);

  const [openTestModal, setOpenTestModal] = useState(false);

  const [files, setFiles] = useState([]);

  const getVariableList = async () => {
    setLoading((prev) => ({ ...prev, variables: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    // console.log("reqBody Counsellors", reqbody);

    try {
      const result = await variableListDDACtion(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final variables", decrypted);

        setVariables(decrypted);
        setLoading((prev) => ({ ...prev, variables: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, variables: false }));
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
      setLoading((prev) => ({ ...prev, variables: false }));
    }
  };

  const getCounsellorsList = async () => {
    setLoading((prev) => ({ ...prev, counsellors: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_type: ["Counsellor", "Marketing Manager", "Sales Manager"],
      reporting_manager: details?.uuid,
      status: "Active",
      // universities: details?.university?.map((item) => item?.id),
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
    console.log("sel", selectedTemplate);
    if (selectedTemplate) {
      setTemplate(selectedTemplate);
      setValue(selectedTemplate?.body_content);
      setFiles(selectedTemplate?.attachments);
    }
  }, []);

  useEffect(() => {
    getVariableList();
    getCounsellorsList();
  }, []);

  const handleUpdateTemplate = async (values) => {
    console.log("values save", values);
    setLoading((prev) => ({ ...prev, save: true }));
    const csrfToken = await getCsrfToken();
    const formData = new FormData();
    formData.append("template_ref_id", selectedTemplate?.template_ref_id);
    formData.append("template_cat", "email");
    formData.append("subject", values?.subject);
    formData.append("template_name", values?.title);
    values?.counsellors?.forEach((counselor) => {
      formData.append("visible_for[]", counselor);
    });

    formData.append("body_content", values?.body);
    formData.append("template_status", selectedTemplate?.template_status);
    formData.append(
      "existing_files[]",
      files.filter((file) => file?.id).map((file) => file.id)
    );
    // formData.append("attachments[]", files);

    // Append each file under the same key
    files?.forEach((file) => {
      formData.append("attachments[]", file);
    });
    // const reqbody = {
    //   template_ref_id: selectedTemplate?.template_ref_id,
    //   template_cat: "email", //email|sms|whatsapp| Notifications // pass by default within form body
    //   subject: values?.subject, //Optional if identfier is email then manditory
    //   // dlt_template_id: "21334536565", //Optional if identfier is SMS then manditory
    //   template_name: values?.title, //Mandatory
    //   visible_for: values?.counsellors, // 0 - All counsellor 0
    //   body_content: values?.body, //String value and mandatory
    //   template_status: values?.template_status,
    // };

    // console.log("body", reqbody);
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const result = await updateTemplateAction(csrfToken, formData);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setLoading((prev) => ({ ...prev, save: false }));
        setTemplate(decrypted);
        showSnackbar({
          message: `<strong>${decrypted?.template_name}</strong> ${t(
            "manage_template.mt_create_edit_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
      } else {
        console.error(result.error);
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
          console.log("errValues", errValues);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) =>
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              })
            );
          }
        }
        setLoading((prev) => ({ ...prev, save: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleEditTemplate = async (values) => {
    console.log("values publish", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const formData = new FormData();
    formData.append("template_ref_id", selectedTemplate?.template_ref_id);
    formData.append("template_cat", "email");
    formData.append("subject", values?.subject);
    formData.append("template_name", values?.title);
    values?.counsellors?.forEach((counselor) => {
      formData.append("visible_for[]", counselor);
    });
    formData.append("body_content", values?.body);
    formData.append("template_status", 1);
    formData.append(
      "existing_files[]",
      files.filter((file) => file?.id).map((file) => file.id)
    );
    // formData.append("attachments[]", files);

    // Append each file under the same key
    files?.forEach((file) => {
      formData.append("attachments[]", file);
    });
    // const reqbody = {
    //   template_ref_id: selectedTemplate?.template_ref_id,
    //   template_cat: "email", //email|sms|whatsapp| Notifications // pass by default within form body
    //   subject: values?.subject, //Optional if identfier is email then manditory
    //   // dlt_template_id: "21334536565", //Optional if identfier is SMS then manditory
    //   template_name: values?.title, //Mandatory
    //   visible_for: values?.counsellors, // 0 - All counsellor 0
    //   body_content: values?.body, //String value and mandatory
    //   template_status: 1,
    // };

    // console.log("body", reqbody);
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const result = await updateTemplateAction(csrfToken, formData);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        onClose();
        setLoading((prev) => ({ ...prev, submit: false }));
        showSnackbar({
          message: `<strong>${decrypted?.template_name}</strong> ${t(
            "manage_template.mt_create_submit_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
        formikEditTemplatedRef.current.resetForm();
      } else {
        console.error(result.error);
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
          console.log("errValues", errValues);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) =>
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
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

  const handleFileChange = (event) => {
    const filesUploaded = Array.from(event.target.files); // Get selected files
    console.log("files", filesUploaded);
    if (filesUploaded?.length > 0) {
      setFiles((prev) => {
        // Filter out files that already exist in the state
        const newFiles = filesUploaded?.filter(
          (file) =>
            !prev?.some(
              (existingFile) =>
                existingFile.name === file.name &&
                existingFile.size === file.size
            )
        );
        return [...prev, ...newFiles];
      });
    }
    event.target.value = ""; // Reset the input so the same file can be selected again if needed
  };

  const handleDownload = (file) => {
    if (file?.path && file?.display_name) {
      const a = document.createElement("a");
      a.href = file?.path;
      a.download = file?.display_name; // Set the filename
      document.body.appendChild(a); // Append the anchor to the DOM
      a.target = "_blank"; // Open the file in a new tab
      a.click(); // Programmatically click the anchor
      document.body.removeChild(a); // Clean up by removing the anchor
    } else {
      const url = URL.createObjectURL(file); // Create object URL for the file
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name; // Set the filename
      a.click();
      URL.revokeObjectURL(url); // Clean up
    }
  };

  const handleDelete = (file) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file)); // Remove the file from the array
  };

  useEffect(() => {
    const ids = files.filter((file) => file?.id).map((file) => file.id);
    console.log(ids, "iddd", files);
  }, [files]);

  return (
    <>
      <div id="email-template-modal" className="email-template-modal">
        <div id="go-back-section" className="go-back-section">
          <div
            id="template-email-edit-go-back-btn"
            className="go-back-icon"
            onClick={onClose}
          >
            <GobackIcon />
          </div>
          <p>{t("leads.ld_go_back_section")}</p>
        </div>
        <div id="modal-header" className="modal-header">
          <h2>{t("manage_template.mt_edit_temp")}</h2>
        </div>
        <div
          id="modal-content-email-template"
          className="modal-content-email-template"
        >
          <Formik
            innerRef={formikEditTemplatedRef}
            initialValues={{
              title: selectedTemplate?.template_name,
              subject: selectedTemplate?.subject,
              counsellors: selectedTemplate?.visibile_for?.map((item) =>
                item?.uuid ? item.uuid : item
              ),
              body: selectedTemplate?.body_content,
            }}
            validationSchema={editEmailTemplateValidationSchema}
            onSubmit={(values) => {
              if (values.action === "save") {
                handleUpdateTemplate(values);
              } else if (values?.action === "publish") {
                handleEditTemplate(values);
              }
            }}
          >
            {({ setFieldValue, touched, errors, values }) => (
              <>
                <Form>
                  <div
                    id="form-grid-container"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    {/* title */}
                    <div id="title-form-group" className="form-group">
                      <label className="role-label" htmlFor="title">
                        {t("manage_template.mt_title_label")}{" "}
                        <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                      <Field
                        id="template-email-edit-title"
                        type="text"
                        name="title"
                        placeholder={t("manage_template.mt_title_phldr")}
                        className={
                          touched.title && errors.title ? "input-error" : ""
                        }
                      />

                      <ErrorMessage
                        name="title"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    {/* subject */}
                    <div id="subject-form-group" className="form-group">
                      <label className="role-label" htmlFor="subject">
                        {t("manage_template.et_subject")}{" "}
                        <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                      <Field
                        id="template-email-edit-subject"
                        type="text"
                        name="subject"
                        placeholder={t("manage_template.mt_subject_phldr")}
                        className={
                          touched.subject && errors.subject ? "input-error" : ""
                        }
                      />

                      <ErrorMessage
                        name="subject"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    {/* variable */}
                    <div id="variable-form-group" className="form-group">
                      <label className="role-label">
                        {t("manage_template.csmst_variable_lab")}
                      </label>
                      <Select
                        id="template-email-edit-variable"
                        name="variable"
                        value={loading?.variables ? "loading" : ""}
                        onChange={(e) => setSelectedVar(`%${e.target.value}%`)}
                        displayEmpty
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.variable && errors.variable
                            ? "input-error"
                            : ""
                        }
                        style={{ height: "40px" }}
                      >
                        <MenuItem disabled value="">
                          <span style={{ color: "#aaa" }}>
                            {t("manage_template.mt_selc_variable")}
                          </span>
                        </MenuItem>
                        {loading?.variables ? (
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
                        ) : variables?.length === 0 || !variables ? (
                          <MenuItem disabled>
                            {t("manage_template.mt_no_variables")}
                          </MenuItem>
                        ) : (
                          variables?.length > 0 &&
                          variables?.map((variable) => (
                            <MenuItem
                              key={variable?.id}
                              value={variable?.var_name}
                            >
                              {variable?.var_title}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </div>

                    {/* visibile_for */}
                    <div id="counsellors-form-group" className="form-group">
                      <label className="role-label" htmlFor="counsellors">
                        {t("manage_template.cwam_visible_for")}{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="template-email-edit-visible-for"
                        displayEmpty
                        renderValue={(selected) => {
                          if (loading.counsellors) {
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

                          if (
                            selected?.includes("all") ||
                            selected?.length === counsellors?.length
                          ) {
                            return "All";
                          }

                          const selectedCounsellors = selected
                            ?.map(
                              (id) =>
                                counsellors?.find((item) => item.uuid === id)
                                  ?.first_name
                            )
                            .filter(Boolean) // Ensures only valid names are included
                            .join(", ");

                          return (
                            <span
                              style={{
                                color: selectedCounsellors ? "inherit" : "#aaa",
                              }}
                            >
                              {selectedCounsellors ||
                                t("manage_template.mt_selec_counsellors")}
                            </span>
                          );

                          // return (
                          //   <span
                          //     style={{
                          //       color:
                          //         selected?.length === 0 ? "#aaa" : "inherit",
                          //     }}
                          //   >
                          //     {selected && selected.length === 0
                          //       ? `${t("manage_template.mt_selec_counsellors")}`
                          //       : selected
                          //           ?.map(
                          //             (id) =>
                          //               counsellors?.find(
                          //                 (item) => item.uuid === id
                          //               )?.first_name
                          //           )
                          //           .join(", ")}
                          //   </span>
                          // );
                        }}
                        value={loading.counsellors ? [] : values.counsellors}
                        onChange={(e) => {
                          const newValue = e.target.value; // the new selection array
                          const allIds = counsellors.map((item) => item.uuid); // array of all individual IDs

                          // Determine which option was toggled by comparing newValue with the previous state.
                          let toggledValue;
                          if (newValue.length > values.counsellors.length) {
                            // An option was added.
                            toggledValue = newValue.find(
                              (item) => !values.counsellors.includes(item)
                            );
                          } else {
                            // An option was removed.
                            toggledValue = values.counsellors.find(
                              (item) => !newValue.includes(item)
                            );
                          }

                          // Handle the toggled value.
                          if (toggledValue === "all") {
                            // User clicked the "all" option.
                            if (values.counsellors.includes("all")) {
                              // "all" was already selected – toggle it off.
                              setFieldValue("counsellors", []);
                            } else {
                              // "all" was not selected – select it.
                              setFieldValue("counsellors", ["all"]);
                            }
                          } else {
                            // An individual option was toggled.
                            if (values.counsellors.includes("all")) {
                              // Previously, all were selected. Now, the user toggled one off.
                              // Update the state to contain all IDs except the toggled one.
                              const updatedSelection = allIds.filter(
                                (id) => id !== toggledValue
                              );
                              setFieldValue("counsellors", updatedSelection);
                            } else {
                              // Normal individual toggle.
                              // newValue already reflects the addition or removal.
                              // However, if the user has now selected all individual options, collapse it to ["all"].
                              const filtered = newValue.filter(
                                (v) => v !== "all"
                              );
                              if (filtered.length === allIds.length) {
                                setFieldValue("counsellors", ["all"]);
                              } else {
                                setFieldValue("counsellors", filtered);
                              }
                            }
                          }
                        }}
                        multiple
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.day && errors.day ? "input-error" : ""
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
                              checked={
                                values.counsellors?.length ===
                                  counsellors?.length ||
                                values.counsellors.includes("all")
                              }
                              // indeterminate={
                              //   values.counsellors?.length > 0 &&
                              //   values.counsellors?.length <
                              //     counsellors?.length &&
                              //   !values.counsellors.includes("all")
                              // }
                            />
                            <span>{t("buttons.buttons_all")}</span>
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
                              <MenuItem
                                key={item.uuid}
                                value={item.uuid}
                                // disabled={values.counsellors.includes("all")}
                              >
                                <Checkbox
                                  checked={
                                    values.counsellors.includes(item.uuid) ||
                                    values.counsellors.includes("all")
                                  }
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
                        name="counsellors"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </div>

                  {/* body */}
                  <div id="body-form-group" className="form-group">
                    <label htmlFor="body">
                      {t("manage_template.mt_compose_email")}{" "}
                      <span style={{ color: "red" }}>*</span>{" "}
                    </label>
                    <SummerNoteEditor
                      id="template-email-edit-body"
                      value={value}
                      onChange={(newContent) => {
                        console.log("content", newContent);
                        setValue(newContent);
                        setFieldValue("body", newContent);
                      }}
                      height={200}
                      selectedVar={selectedVar}
                      setSelectedVar={setSelectedVar}
                    />
                    {/* <div dangerouslySetInnerHTML={{ __html: value }} /> */}
                  </div>

                  <div
                    id="modal-footer-email-template"
                    className="modal-footer-email-template"
                  >
                    <div
                      id="file-attachment-container"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Button
                        id="template-email-edit-file-btn"
                        variant="outlined"
                        onClick={() => fileInputRef.current.click()}
                        className="save-create-btn"
                      >
                        {loading.file ? (
                          <CircularProgress size={20} color="#000" />
                        ) : (
                          "Attach file"
                        )}
                      </Button>
                      <input
                        id="template-email-edit-file-input"
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        multiple // Allow selecting multiple files
                        onChange={handleFileChange}
                      />
                      <div id="files-container" className="filesDiv">
                        {files?.length > 0 &&
                          files?.map((file, index) => (
                            <Chip
                              key={index}
                              label={file?.name || file?.display_name}
                              color="success"
                              onDelete={() => handleDelete(file)}
                              onClick={() => handleDownload(file)}
                              deleteIcon={
                                <DeleteIcon
                                  onClick={() => handleDelete(file)}
                                />
                              }
                              style={{ margin: 1 }}
                            />
                          ))}
                      </div>
                    </div>
                    <div
                      id="submit-buttons-container"
                      className="submitBtnsDiv"
                    >
                      <Button
                        id="template-email-edit-test-modal"
                        variant="contained"
                        color="primary"
                        className="save-create-btn"
                        onClick={() => setOpenTestModal(true)}
                      >
                        {t("manage_template.mt_btn_test_temp")}
                      </Button>
                      <Button
                        id="template-email-edit-test-modal-submit"
                        type="submit"
                        variant="contained"
                        color="primary"
                        className="save-create-btn"
                        onClick={() => setFieldValue("action", "save")}
                      >
                        {loading.save ? (
                          <CircularProgress size={20} color="#000" />
                        ) : (
                          t("manage_template.cwam_save_btn")
                        )}
                      </Button>
                      <Button
                        id="template-email-edit-publish"
                        type="submit"
                        variant="contained"
                        color="primary"
                        className="save-btn"
                        onClick={() => setFieldValue("action", "publish")}
                      >
                        {loading.submit ? (
                          <CircularProgress size={20} color="#000" />
                        ) : (
                          t("manage_template.mt_btn_publish")
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </>
            )}
          </Formik>
        </div>
      </div>

      {openTestModal && (
        <TestTemplateModal
          open={openTestModal}
          onClose={() => setOpenTestModal(false)}
          data={template}
        />
      )}
    </>
  );
};

export default EditEmailTemplate;
