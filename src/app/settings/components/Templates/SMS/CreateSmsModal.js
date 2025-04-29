"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import CloseIcon from "@/images/close-icon.svg";
import ChevronDown from "@/images/chevron-down.svg";
import * as Yup from "yup";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Checkbox,
  TextareaAutosize,
} from "@mui/material";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import useLogout from "@/app/hooks/useLogout";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  createTemplateAction,
  variableListDDACtion,
} from "@/app/actions/templateActions";
import { decryptClient } from "@/utils/decryptClient";
import { getUsersDDAction } from "@/app/actions/userActions";
import { useSelector } from "react-redux";

const CreateSmsModal = ({ onClose, open, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  if (!open) return null; // Return null if the modal is not open

  const { details } = useSelector((state) => state.user);

  const formikCreateSmsTemplatedRef = useRef();

  const createSmsTemplateValidationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(200)
      .required(t("manage_template.400253"))
      .trim()
      .transform((value) => value?.trim()),
    dltID: Yup.string()
      .trim()
      .transform((value) => value?.trim()),
    counsellors: Yup.array()
      .of(Yup.string().typeError("Selected Counsellor value is incorrect"))
      .min(1, "Select at least one Counsellor")
      .required(t("rules.400369")),
    body: Yup.string()
      .required(t("manage_template.400373"))
      .trim()
      .transform((value) => value?.trim()),
  });

  const [loading, setLoading] = useState({
    variables: false,
    counsellors: false,
    submit: false,
  });

  const [variables, setVariables] = useState(null);
  const [counsellors, setCounsellors] = useState(null);

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
      // universities: details?.university?.map((item) => item?.id),
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
    getVariableList();
    getCounsellorsList();
  }, []);

  const handleCreateSmsTemplate = async (values) => {
    console.log("values", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_cat: "sms", //email|sms|whatsapp| Notifications // pass by default within form body
      // subject: values?.subject, //Optional if identfier is email then manditory
      dlt_template_id: values?.dltID, //Optional if identfier is SMS then manditory
      template_name: values?.name, //Mandatory
      visible_for: values?.counsellors, // 0 - All counsellor 0
      body_content: values?.body, //String value and mandatory
      //"template_status":1 //optional pass by default 1
    };

    console.log("body", reqbody);

    try {
      const result = await createTemplateAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        onClose();
        setLoading((prev) => ({ ...prev, submit: false }));
        showSnackbar({
          message: `<strong>${decrypted?.template_name}</strong> ${t(
            "manage_template.mt_sms_dlt_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
        formikCreateSmsTemplatedRef.current.resetForm();
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

  return (
    <div id="map-roles-modal-user" className="map-roles-modal-user">
      <div id="modal-header-roles" className="modal-header-roles">
        <h2> {t("manage_template.csmst_heading")}</h2>
        <div
          id="template-sms-create-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div id="modal-body" className="modal-body">
        <div
          id="modal-content-user-section"
          className="modal-content-user-section"
        >
          <Formik
            innerRef={formikCreateSmsTemplatedRef}
            initialValues={{ name: "", dltID: "", counsellors: [], body: "" }}
            validationSchema={createSmsTemplateValidationSchema}
            onSubmit={handleCreateSmsTemplate}
          >
            {({ setFieldValue, touched, errors, values }) => (
              <>
                <Form style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {/* name */}
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="name">
                      {t("manage_template.csmst_name_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="template-sms-create-name"
                      type="text"
                      name="name"
                      placeholder={t("manage_template.csmst_name_phldr")}
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

                  {/* visible_for */}
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="counsellors">
                      {t("manage_template.csmst_visible_for_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="template-sms-create-visible-for"
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

                        return (
                          <span
                            style={{
                              color:
                                selected?.length === 0 ? "#aaa" : "inherit",
                            }}
                          >
                            {selected && selected.length === 0
                              ? `${t("manage_template.mt_selec_counsellors")}`
                              : selected
                                  ?.map(
                                    (id) =>
                                      counsellors?.find(
                                        (item) => item.uuid === id
                                      )?.first_name
                                  )
                                  .join(", ")}
                          </span>
                        );
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
                      className={touched.day && errors.day ? "input-error" : ""}
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
                          <span>{t("manage_template.et_all_btn")}</span>
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
                                id={`template-sms-create-checkbox-${item?.uuid}`}
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
                  </FormControl>

                  {/* dltID */}
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="dltID">
                      {t("manage_template.csmst_dlt_template_id_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="template-sms-create-dltid"
                      type="text"
                      name="dltID"
                      placeholder={t(
                        "manage_template.csmst_dlt_template_id_phldr"
                      )}
                      className={
                        touched.dltID && errors.dltID ? "input-error" : ""
                      }
                    />
                    <ErrorMessage
                      name="dltID"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>

                  {/* variable */}
                  <FormControl fullWidth>
                    <label className="role-label">
                      {t("manage_template.csmst_variable_lab")}
                    </label>
                    <Select
                      id="template-sms-create-variable"
                      name="variable"
                      value={loading?.variables ? "loading" : ""}
                      onChange={(e) => {
                        // setFieldValue(
                        //   "body",
                        //   values.body + `%${e.target.value}%`
                        // );
                        const variableToInsert = `%${e.target.value}%`;
                        const textarea =
                          document.getElementById("body-textarea");
                        const cursorStart = textarea.selectionStart;
                        const cursorEnd = textarea.selectionEnd;

                        const currentValue = values.body;
                        const newValue =
                          currentValue.slice(0, cursorStart) +
                          variableToInsert +
                          currentValue.slice(cursorEnd);

                        setFieldValue("body", newValue);

                        // Move the cursor position after the inserted variable
                        setTimeout(() => {
                          textarea.selectionStart = textarea.selectionEnd =
                            cursorStart + variableToInsert.length;
                        }, 0);
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.variable && errors.variable ? "input-error" : ""
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
                  </FormControl>
                </Form>

                {/* message */}
                <div id="message-container">
                  <label htmlFor="body" className="role-label">
                    {t("followup.fupdm_message_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
                  {/* <Field
                    type="text"
                    name="body"
                    className={`followUp-message ${
                      touched.dltID && errors.dltID && "input-error"
                    }`}
                    style={{ width: "100%" }}
                  /> */}
                  <Field name="body">
                    {({ field }) => (
                      <TextareaAutosize
                        {...field}
                        id="body-textarea"
                        minRows={15}
                        className={`followUp-message ${
                          touched.body && errors.body && "input-error"
                        }`}
                        style={{
                          width: "100%",
                          fontSize: "16px",
                          padding: "8px",
                          border:
                            touched.body && errors.body
                              ? "1px solid red"
                              : "1px solid #ccc",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="body"
                    component="div"
                    className="error-message"
                  />
                </div>
              </>
            )}
          </Formik>
        </div>
      </div>

      <div id="modal-footer" className="modal-footer">
        <Button
          id="template-sms-create-cancel-btn"
          variant="outlined"
          onClick={onClose}
          className="cancel-button"
          style={{ marginLeft: "20px" }}
        >
          {t("manage_template.csmst_cancel_btn")}
        </Button>

        <Button
          id="template-sms-create-submit-btn"
          variant="contained"
          color="success"
          onClick={() => formikCreateSmsTemplatedRef.current.submitForm()}
          className="map-role-button"
          style={{ marginRight: "20px" }}
        >
          {loading.submit ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("manage_template.csmst_save_btn")
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateSmsModal;
