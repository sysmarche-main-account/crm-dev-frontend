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

const CreateWhatsaapModal = ({ onClose, open, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  if (!open) return null; // Return null if the modal is not open

  const { details } = useSelector((state) => state.user);

  const formikCreateWhatsappTemplatedRef = useRef();

  const createWhatsappTemplateValidationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(200)
      .required(t("manage_template.400253"))
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

  const handleCreateWhatsappTemplate = async (values) => {
    console.log("values", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_cat: "whatsapp", //email|sms|whatsapp| Notifications // pass by default within form body
      // subject: values?.subject, //Optional if identfier is email then manditory
      // dlt_template_id: values?.dltID, //Optional if identfier is SMS then manditory
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
        formikCreateWhatsappTemplatedRef.current.resetForm();
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
    <div className="map-roles-modal-user" id="template-whatsapp-create-modal">
      <div className="modal-header-roles" id="template-whatsapp-create-header">
        <h2 id="template-whatsapp-create-heading">
          {t("manage_template.csmst_heading")}
        </h2>
        <div
          id="template-whatsapp-create-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div className="modal-body" id="template-whatsapp-create-body">
        <div
          className="modal-content-user-section"
          id="template-whatsapp-create-content"
        >
          <Formik
            innerRef={formikCreateWhatsappTemplatedRef}
            initialValues={{ name: "", counsellors: [], body: "" }}
            validationSchema={createWhatsappTemplateValidationSchema}
            onSubmit={handleCreateWhatsappTemplate}
          >
            {({ setFieldValue, touched, errors, values }) => (
              <>
                <Form
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                  id="template-whatsapp-create-form"
                >
                  {/* name */}
                  <FormControl
                    fullWidth
                    id="template-whatsapp-create-name-field"
                  >
                    <label
                      className="role-label"
                      htmlFor="name"
                      id="template-whatsapp-create-name-label"
                    >
                      {t("manage_template.csmst_name_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="template-whatsapp-create-name"
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

                  {/* counsellor */}
                  <FormControl
                    fullWidth
                    id="template-whatsapp-create-counsellor-field"
                  >
                    <label
                      className="role-label"
                      htmlFor="counsellors"
                      id="template-whatsapp-create-counsellor-label"
                    >
                      {t("manage_template.csmst_visible_for_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="template-whatsapp-create-counsellor"
                      displayEmpty
                      renderValue={(selected) => {
                        if (loading.counsellors) {
                          return (
                            <Box
                              display="flex"
                              alignItems="center"
                              id="template-whatsapp-create-counsellor-loading"
                            >
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
                        const newValue = e.target.value;
                        const allIds = counsellors.map((item) => item.uuid);

                        let toggledValue;
                        if (newValue.length > values.counsellors.length) {
                          toggledValue = newValue.find(
                            (item) => !values.counsellors.includes(item)
                          );
                        } else {
                          toggledValue = values.counsellors.find(
                            (item) => !newValue.includes(item)
                          );
                        }

                        if (toggledValue === "all") {
                          if (values.counsellors.includes("all")) {
                            setFieldValue("counsellors", []);
                          } else {
                            setFieldValue("counsellors", ["all"]);
                          }
                        } else {
                          if (values.counsellors.includes("all")) {
                            const updatedSelection = allIds.filter(
                              (id) => id !== toggledValue
                            );
                            setFieldValue("counsellors", updatedSelection);
                          } else {
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
                      {/* Placeholder item */}
                      <MenuItem
                        disabled
                        value=""
                        id="template-whatsapp-create-counsellor-placeholder"
                      >
                        <span style={{ color: "#aaa" }}>
                          {t("manage_template.mt_selec_counsellors")}
                        </span>
                      </MenuItem>

                      {/* "Select All" option */}
                      {counsellors?.length > 1 && (
                        <MenuItem
                          value="all"
                          id="template-whatsapp-create-counsellor-select-all"
                        >
                          <Checkbox
                            checked={
                              values.counsellors?.length ===
                                counsellors?.length ||
                              values.counsellors.includes("all")
                            }
                          />
                          <span>{t("manage_template.et_all_btn")}</span>
                        </MenuItem>
                      )}

                      {loading.counsellors ? (
                        <MenuItem
                          disabled
                          value="loading"
                          id="template-whatsapp-create-counsellor-loading-option"
                        >
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
                        <MenuItem
                          disabled
                          id="template-whatsapp-create-counsellor-none-available"
                        >
                          {t("rules.rule_no_consoll_avaliable")}
                        </MenuItem>
                      ) : (
                        counsellors?.length > 0 &&
                        counsellors.map((item) => {
                          return (
                            <MenuItem
                              key={item.uuid}
                              value={item.uuid}
                              id={`template-whatsapp-create-counsellor-item-${item.uuid}`}
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
                  </FormControl>

                  {/* variable */}
                  <FormControl
                    fullWidth
                    style={{ gridColumn: "span 2" }}
                    id="template-whatsapp-create-variable-field"
                  >
                    <label
                      className="role-label"
                      id="template-whatsapp-create-variable-label"
                    >
                      {t("manage_template.csmst_variable_lab")}
                    </label>
                    <Select
                      id="template-whatsapp-create-variable"
                      name="variable"
                      value={loading?.variables ? "loading" : ""}
                      onChange={(e) => {
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
                      <MenuItem
                        disabled
                        value=""
                        id="template-whatsapp-create-variable-placeholder"
                      >
                        <span style={{ color: "#aaa" }}>
                          {t("manage_template.mt_selc_variable")}
                        </span>
                      </MenuItem>
                      {loading?.variables ? (
                        <MenuItem
                          disabled
                          value="loading"
                          id="template-whatsapp-create-variable-loading-option"
                        >
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
                        <MenuItem
                          disabled
                          id="template-whatsapp-create-variable-none-available"
                        >
                          {t("manage_template.mt_no_variables")}
                        </MenuItem>
                      ) : (
                        variables?.length > 0 &&
                        variables?.map((variable) => (
                          <MenuItem
                            key={variable?.id}
                            value={variable?.var_name}
                            id={`template-whatsapp-create-variable-item-${variable?.id}`}
                          >
                            {variable?.var_title}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Form>

                {/* message */}
                <div id="template-whatsapp-create-message-field">
                  <label
                    htmlFor="body"
                    className="role-label"
                    id="template-whatsapp-create-message-label"
                  >
                    {t("followup.fupdm_message_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>
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

      <div className="modal-footer" id="template-whatsapp-create-footer">
        <Button
          id="template-whatsapp-create-cancel-btn"
          variant="outlined"
          onClick={onClose}
          className="cancel-button"
          style={{ marginLeft: "20px" }}
        >
          {t("manage_template.csmst_cancel_btn")}
        </Button>

        <Button
          id="template-whatsapp-create-submit-btn"
          variant="contained"
          color="success"
          onClick={() => formikCreateWhatsappTemplatedRef.current.submitForm()}
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

export default CreateWhatsaapModal;
