"use client";
import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@/images/close-icon.svg";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslations } from "next-intl";
import { Form, Formik, Field, ErrorMessage } from "formik";
import ChevronDown from "@/images/chevron-down.svg";
import {
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useSelector } from "react-redux";
import {
  exportRecordsAction,
  getAllConditionListAction,
  getAllCriteriaListAction,
  getCountAction,
} from "@/app/actions/marketingActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import * as Yup from "yup";

const DownloadReportsModal = ({ open, onClose, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const initialValues = {
    batchCount: "",
    partialCount: "",
  };

  const formikDownloadReportRef = useRef();

  if (!open) return null; // Hide modal if `open` is false

  const [loading, setLoading] = useState({
    criteria: false,
    condition: false,
    count: false,
    submit: false,
  });

  const [criteriaList, setCriteriaList] = useState(null);
  const [conditionList, setConditionList] = useState(null);

  const [isGetCountClicked, setIsGetCountClicked] = useState(false);

  const [recordsCount, setRecordsCount] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);

  const [invalidFields, setInvalidFields] = useState([]);

  const [showCloseIcon, setShowCloseIcon] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);

  const [isDisabled, setIsDisabled] = useState(false);

  const [fieldSets, setFieldSets] = useState([
    { header: "", condition: "", value: "" },
  ]);

  const getValidationSchema = (selectedOption) => {
    if (selectedOption === "partial") {
      return Yup.object({
        partialCount: Yup.number()
          .min(1, t("marketing.400378"))
          .required(t("marketing.400377"))
          .test(
            "max-record-count",
            `${t("marketing.400379")} (${recordsCount})`,
            (value) => value <= recordsCount
          ),
        batchCount: Yup.number().notRequired(), // Batch count is not required
      });
    } else if (selectedOption === "split") {
      return Yup.object({
        batchCount: Yup.number()
          .min(2, t("marketing.400381"))
          .required(t("marketing.400380")),
        partialCount: Yup.number().notRequired(), // Partial count is not required
      });
    }
    return Yup.object({
      partialCount: Yup.number().notRequired(),
      batchCount: Yup.number().notRequired(),
    });
  };

  const getCriteriaDDlist = async () => {
    setLoading((prev) => ({ ...prev, criteria: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    // console.log("reqBody criteria list", reqbody);

    try {
      const result = await getAllCriteriaListAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final criteria list", decrypted);

        setCriteriaList(decrypted);
        setLoading((prev) => ({ ...prev, criteria: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, criteria: false }));
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
      setLoading((prev) => ({ ...prev, criteria: false }));
    }
  };

  const getConditionDDlist = async () => {
    setLoading((prev) => ({ ...prev, condition: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    // console.log("reqBody condition list", reqbody);

    try {
      const result = await getAllConditionListAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final condition list", decrypted);

        setConditionList(decrypted);
        setLoading((prev) => ({ ...prev, condition: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, condition: false }));
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
      setLoading((prev) => ({ ...prev, condition: false }));
    }
  };

  useEffect(() => {
    getCriteriaDDlist();
    getConditionDDlist();
  }, []);

  const handleAddFieldSet = () => {
    setFieldSets([...fieldSets, { header: "", condition: "", value: "" }]);
    setShowCloseIcon(true); // Show the close icon on adding fields
  };

  const handleFieldChange = (index, field, value) => {
    const updatedFieldSets = [...fieldSets];
    updatedFieldSets[index][field] = value;
    setFieldSets(updatedFieldSets);
  };

  const handleRemoveFieldSet = (index) => {
    const updatedFieldSets = fieldSets.filter((_, i) => i !== index);
    setFieldSets(updatedFieldSets);
  };

  const handleValidation = () => {
    const invalidIndexes = fieldSets.reduce((acc, fieldSet, index) => {
      const selectedCriteria = fieldSet?.header;
      const selectedCriteriaObject = criteriaList?.find(
        (criteria) => criteria?.criteria === selectedCriteria
      );
      const selectedInputType = selectedCriteriaObject?.search_input;

      // Validate common fields
      if (!fieldSet?.header?.trim() || !fieldSet?.condition?.trim()) {
        acc.push(index);
        return acc;
      }

      // Validate 'between' condition
      if (fieldSet?.condition === "between") {
        if (selectedInputType === "number") {
          const startValue = Number(fieldSet?.startValue);
          const endValue = Number(fieldSet?.endValue);

          if (
            isNaN(startValue) ||
            isNaN(endValue) ||
            startValue === "" ||
            endValue === ""
          ) {
            acc.push(index);
          } else if (startValue > endValue) {
            acc.push(index); // Min is greater than Max
          }
        } else if (
          selectedInputType === "text" &&
          (!fieldSet?.startValue?.trim() || !fieldSet?.endValue?.trim())
        ) {
          acc.push(index);
        }
        return acc;
      }

      // Validate single input value
      if (
        selectedInputType === "number" &&
        (isNaN(Number(fieldSet?.value)) || fieldSet?.value === "")
      ) {
        acc.push(index);
      } else if (selectedInputType === "text" && !fieldSet?.value?.trim()) {
        acc.push(index);
      }

      return acc;
    }, []);

    setInvalidFields(invalidIndexes);

    if (invalidIndexes.length > 0) {
      showSnackbar({
        message: `${t("marketing.mktg_drm_submit_fill_fields")}`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return false;
    }
    return true;
  };

  const handleGetCount = async () => {
    setLoading((prev) => ({ ...prev, count: true }));
    setIsDisabled(true);
    setIsGetCountClicked(true);

    const csrfToken = await getCsrfToken();
    const reqbody = {
      filters: fieldSets,
    };
    console.log("reqBody getCount", reqbody);

    try {
      const result = await getCountAction(csrfToken, reqbody);
      console.log("count:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final  count", decrypted);

        if (decrypted?.count <= 0) {
          showSnackbar({
            message: `${t("marketing.mktg_drm_no_records")}!`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }

        setRecordsCount(decrypted?.count);
        setShowResetButton(true);
        setLoading((prev) => ({ ...prev, count: false }));
      } else {
        console.error(result);
        setIsDisabled(false);
        setShowResetButton(false);
        setIsGetCountClicked(false);
        setLoading((prev) => ({ ...prev, count: false }));
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
      setIsDisabled(false);
      setShowResetButton(false);
      setIsGetCountClicked(false);
      setLoading((prev) => ({ ...prev, count: false }));
    }
  };

  const handleDownload = async (values) => {
    console.log("values", values);
    setLoading((prev) => ({ ...prev, submit: true }));

    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: details?.uuid,
      filters: fieldSets,
      download_type: selectedOption,
      ...(selectedOption === "partial" && {
        limit: values?.partialCount,
      }),
      ...(selectedOption === "split" && {
        batch: values?.batchCount,
      }),
    };
    console.log("reqBody download", reqbody);

    try {
      const result = await exportRecordsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final  download", decrypted);

        setLoading((prev) => ({ ...prev, submit: false }));
        onClose();
        showSnackbar({
          message: `${decrypted.message}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, submit: false }));
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
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleReset = () => {
    setIsDisabled(false);
    setShowResetButton(false);
    setIsGetCountClicked(false);
    setSelectedOption(null);
    setRecordsCount(0);
  };

  return (
    <div className="import-user-modal">
      <div className="modal-header">
        <h2>{t("marketing.mktg_drm_download")}</h2>
        <button
          id="marketing-downloads-modal-close-btn"
          className="close-btn"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="download-section-reports">
        <Formik
          innerRef={formikDownloadReportRef}
          validationSchema={getValidationSchema(selectedOption)}
          initialValues={initialValues}
          onSubmit={handleDownload}
        >
          {({ setFieldValue, errors, touched }) => (
            <Form
              className="leads_form_section"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "10px",
              }}
            >
              <div className="report_parents_form">
                {fieldSets.map((fieldSet, index) => {
                  const selectedCriteria = fieldSet?.header;
                  const selectedCriteriaObject = criteriaList?.find(
                    (criteria) => criteria?.criteria === selectedCriteria
                  );
                  const applicableConditions = selectedCriteriaObject
                    ? selectedCriteriaObject.applicable_conditions
                    : [];

                  const selectedInputType =
                    selectedCriteriaObject?.search_input;

                  const handleBetweenChange = (index, key, value) => {
                    // Update the corresponding value (start or end)
                    handleFieldChange(index, key, value);

                    // Combine start and end values into a single string with a comma
                    if (fieldSet.condition === "between") {
                      const startValue = fieldSet.startValue || "";
                      const endValue = fieldSet.endValue || "";
                      handleFieldChange(
                        index,
                        "value",
                        `${startValue}, ${endValue}`
                      );
                    }
                  };

                  return (
                    <div key={index} className="report-form-section">
                      {console.log("field", fieldSet)}
                      <div className="form-group">
                        <label
                          className="role-label"
                          htmlFor={`criteria-${index}`}
                        >
                          {t("marketing.mktg_drm_criteria_label")}{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <Select
                          id={`marketing-downloads-modal-select-${fieldSet?.header}`}
                          className={
                            invalidFields.includes(index) && !fieldSet.header
                              ? "input-error"
                              : ""
                          }
                          value={
                            loading?.criteria ? "loading" : fieldSet?.header
                          }
                          onChange={(e) => {
                            // handleFieldChange(index, "header", e.target.value)
                            handleFieldChange(index, "header", e.target.value);
                            handleFieldChange(index, "condition", ""); // Reset condition
                            handleFieldChange(index, "value", ""); // Reset value
                            handleFieldChange(index, "startValue", ""); // Reset start value
                            handleFieldChange(index, "endValue", ""); // Reset end value
                          }}
                          displayEmpty
                          IconComponent={ChevronDown}
                          fullWidth
                          disabled={isDisabled}
                          style={{
                            height: "40px",
                            fontSize: "12px",
                            maxWidth: 215,
                          }}
                        >
                          <MenuItem value="" disabled>
                            {t("marketing.mktg_drm_criteria_select")}
                          </MenuItem>
                          {loading?.criteria ? (
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
                          ) : criteriaList?.length === 0 || !criteriaList ? (
                            <MenuItem disabled>
                              {t("marketing.mktg_drm_criteria_none")}
                            </MenuItem>
                          ) : (
                            criteriaList?.length > 0 &&
                            criteriaList?.map((criteria) => (
                              <MenuItem
                                key={criteria?.criteria}
                                value={criteria?.criteria}
                              >
                                {criteria?.criteria}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </div>

                      <div className="form-group">
                        <label
                          className="role-label"
                          htmlFor={`condition-${index}`}
                        >
                          {t("marketing.mktg_drm_condition_label")}{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <Select
                          id={`marketing-downloads-modal-select-${fieldSet?.condition}`}
                          className={
                            invalidFields.includes(index) && !fieldSet.condition
                              ? "input-error"
                              : ""
                          }
                          value={
                            loading?.condition ? "loading" : fieldSet?.condition
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "condition",
                              e.target.value
                            )
                          }
                          displayEmpty
                          IconComponent={ChevronDown}
                          fullWidth
                          disabled={isDisabled}
                          style={{
                            height: "40px",
                            fontSize: "12px",
                            maxWidth: 215,
                          }}
                        >
                          <MenuItem value="" disabled>
                            {t("marketing.mktg_drm_condition_select")}
                          </MenuItem>
                          {loading?.condition ? (
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
                          ) : applicableConditions?.length === 0 ||
                            !applicableConditions ? (
                            <MenuItem disabled>
                              {t("marketing.mktg_drm_condition_none")}
                            </MenuItem>
                          ) : (
                            applicableConditions?.length > 0 &&
                            applicableConditions?.map((condition) => (
                              <MenuItem key={condition} value={condition}>
                                {condition}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </div>

                      <div className="form-group">
                        {fieldSet.condition === "between" ? (
                          <div className="form-group">
                            <label
                              className="role-label"
                              htmlFor={`search-start-${index}`}
                            >
                              {t("manage_roles.mr_mu_search_phlsr")}
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <Field
                                id={`marketing-downloads-modal-select-${fieldSet?.startValue}`}
                                style={{ maxWidth: 107.5 }}
                                className={
                                  invalidFields.includes(index) &&
                                  !fieldSet.startValue
                                    ? "input-error"
                                    : ""
                                }
                                type={selectedInputType}
                                name={`search-start-${index}`}
                                placeholder={t("marketing.mktg_drm_min_phldr")}
                                min={0}
                                value={fieldSet.startValue}
                                onChange={(e) =>
                                  handleBetweenChange(
                                    index,
                                    "startValue",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={isDisabled}
                              />
                              <Field
                                id={`marketing-downloads-modal-select-${fieldSet?.endValue}`}
                                style={{ maxWidth: 107.5 }}
                                className={
                                  invalidFields.includes(index) &&
                                  !fieldSet.endValue
                                    ? "input-error"
                                    : ""
                                }
                                type={selectedInputType}
                                name={`search-end-${index}`}
                                placeholder={t("marketing.mktg_drm_max_phldr")}
                                min={0}
                                value={fieldSet.endValue}
                                onChange={(e) =>
                                  handleBetweenChange(
                                    index,
                                    "endValue",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={isDisabled}
                              />
                            </div>
                            {invalidFields.includes(index) &&
                              fieldSet.startValue &&
                              fieldSet.endValue &&
                              parseFloat(fieldSet.startValue) >
                                parseFloat(fieldSet.endValue) && (
                                <span
                                  className="validation-error"
                                  style={{ color: "red", fontSize: "12px" }}
                                >
                                  {t("marketing.400382")}
                                </span>
                              )}
                          </div>
                        ) : (
                          <div className="form-group">
                            <label
                              className="role-label"
                              htmlFor={`search-${index}`}
                            >
                              {t("manage_roles.mr_mu_search_phlsr")}{" "}
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <Field
                              id={`marketing-downloads-modal-select-${fieldSet?.value}`}
                              style={{ maxWidth: 215 }}
                              className={
                                invalidFields.includes(index) && !fieldSet.value
                                  ? "input-error"
                                  : ""
                              }
                              type={selectedInputType}
                              name={`search-${index}`}
                              placeholder={t("manage_roles.mr_mu_search_phlsr")}
                              value={fieldSet.value}
                              min={
                                selectedInputType === "number" ? 0 : undefined
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              fullWidth
                              disabled={isDisabled}
                            />
                          </div>
                        )}
                      </div>

                      {showCloseIcon && fieldSets.length > 1 && (
                        <Button
                          id="marketing-downloads-modal-clear-btn"
                          className="close-btn"
                          onClick={() => handleRemoveFieldSet(index)}
                          disabled={isDisabled}
                          style={{ marginTop: "18px", color: "#000" }}
                        >
                          <CloseRoundedIcon />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                className="report-button-section"
                style={{ margin: "10px 10px" }}
              >
                {!showResetButton && (
                  <Button
                    id="marketing-downloads-modal-add-field-btn"
                    variant="outlined"
                    onClick={handleAddFieldSet}
                    disabled={isDisabled}
                    className="add_reports_button"
                  >
                    {t("marketing.mktg_drm_btn_add")}
                  </Button>
                )}
                <Button
                  id="marketing-downloads-modal-get-count-btn"
                  variant="contained"
                  onClick={() => {
                    if (handleValidation()) {
                      handleGetCount(); // Proceed with your logic here
                    }
                    // const allFieldsFilled = fieldSets.every(
                    //   (fieldSet) =>
                    // fieldSet?.header?.trim().transform((value) => value?.trim()) !== "" &&
                    // fieldSet?.condition?.trim().transform((value) => value?.trim()) !== "" &&
                    // fieldSet?.value?.trim().transform((value) => value?.trim()) !== ""
                    // );
                    // if (!allFieldsFilled) {
                    //   showSnackbar({
                    //     message: `Please fill all fields before proceeding.`,
                    //     severity: "error",
                    //     anchorOrigin: { vertical: "top", horizontal: "center" },
                    //   });
                    // } else {
                    //   // Proceed with your logic here
                    //   handleGetCount();
                    // }
                  }}
                  className="add_reports_button"
                >
                  {loading.count ? (
                    <CircularProgress size={20} color="#000" />
                  ) : (
                    t("marketing.mktg_drm_btn_get_count")
                  )}
                </Button>
                {showResetButton && (
                  <Button
                    id="marketing-downloads-modal-reset-btn"
                    variant="contained"
                    onClick={handleReset}
                    className="cancel-button-reports"
                  >
                    {t("marketing.mktg_drm_btn_reset")}
                  </Button>
                )}
              </div>
              {isGetCountClicked && recordsCount > 0 && (
                <div className="download-section">
                  <div
                    className="form-section"
                    style={{ borderTop: "1px solid #ccc" }}
                  >
                    <div className="downloadHeader">
                      <h4>{t("marketing.mktg_drm_dwnld_options")}</h4>
                      <h4>
                        {t("marketing.mktg_drm_count_records")}: {recordsCount}
                      </h4>
                    </div>
                    <div className="options">
                      {/* Full Download Checkbox */}
                      <div
                        className="form-group"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Checkbox
                          id="marketing-downloads-modal-full"
                          checked={selectedOption === "full"}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setSelectedOption(null);
                              setFieldValue("full", false);
                            } else {
                              setSelectedOption("full");
                              setFieldValue("full", true);
                            }
                          }}
                          disabled={!isGetCountClicked}
                        />
                        <label>{t("marketing.mktg_drm_full_dwnld")}</label>
                      </div>

                      {/* Partial Download Checkbox */}
                      <div
                        className="form-group"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label>
                          {" "}
                          <Checkbox
                            id="marketing-downloads-modal-partial"
                            checked={selectedOption === "partial"}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                setSelectedOption(null);
                                setFieldValue("partial", false);
                              } else {
                                setSelectedOption("partial");
                                setFieldValue("partial", true);
                              }
                            }}
                            disabled={!isGetCountClicked}
                          />
                          {t("marketing.mktg_drm_partial_dwnld")}
                        </label>
                        {selectedOption === "partial" && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              justifyContent: "center",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <label>
                                {t("marketing.mktg_drm_partial_dwnld_count")}
                              </label>
                              <Field
                                id="marketing-downloads-modal-partial-count"
                                type="number"
                                name="partialCount"
                                placeholder={t(
                                  "marketing.mktg_download_enter_records"
                                )}
                                className={
                                  touched.partialCount && errors.partialCount
                                    ? "input-error"
                                    : ""
                                }
                              />
                            </div>
                            <ErrorMessage
                              name="partialCount"
                              component="div"
                              className="error-message"
                            />
                          </div>
                        )}
                      </div>

                      {/* Split into Number of Batches Checkbox */}
                      <div
                        className="form-group"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label>
                          <Checkbox
                            id="marketing-downloads-modal-split"
                            checked={selectedOption === "split"}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                setSelectedOption(null);
                                setFieldValue("split", false);
                              } else {
                                setSelectedOption("split");
                                setFieldValue("split", true);
                              }
                            }}
                            disabled={!isGetCountClicked}
                          />{" "}
                          {t("marketing.mktg_drm_split_batches")}
                        </label>
                        {selectedOption === "split" && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              justifyContent: "center",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <label>
                                {t("marketing.mktg_drm_batch_count")}
                              </label>
                              <Field
                                id="marketing-downloads-modal-batch-count"
                                type="number"
                                name="batchCount"
                                placeholder={t(
                                  "marketing.mktg_download_enter_batches"
                                )}
                                className={
                                  touched.batchCount && errors.batchCount
                                    ? "input-error"
                                    : ""
                                }
                              />
                            </div>
                            <ErrorMessage
                              name="batchCount"
                              component="div"
                              className="error-message"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      <div className="modal-footer">
        <Button
          id="marketing-downloads-modal-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("profile.cancel_btn")}
        </Button>
        <Button
          id="marketing-downloads-modal-submit-btn"
          variant="contained"
          color="success"
          className="map-button"
          style={{ marginRight: "20px" }}
          onClick={() => {
            if (!selectedOption) {
              showSnackbar({
                message: t("marketing.mktg_drm_select_dwnld_optn"),
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              });
            } else {
              formikDownloadReportRef.current.submitForm();
            }
          }}
          disabled={recordsCount === 0 || !isGetCountClicked || loading.submit}
        >
          {loading.submit ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("marketing.mktg_drm_btn_dwnld")
          )}
        </Button>
      </div>
    </div>
  );
};

export default DownloadReportsModal;
