"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  getAllLeadStatusAction,
  singleLeadDetailsAction,
} from "@/app/actions/leadActions";
import useLogout from "@/app/hooks/useLogout";
import { decryptClient } from "@/utils/decryptClient";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Box,
  TextField,
} from "@mui/material";
import { updateSingleLeadAction } from "@/app/actions/leadActions";
import { createSingleFollowupAction } from "@/app/actions/followupActions";
import { ErrorMessage, Field, Form, Formik } from "formik";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import { getToken } from "@/utils/getToken";
import { masterDDAction } from "@/app/actions/commonActions";

const StageChangeModal = ({ onClose, lead, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);
  const [modeList, setModeList] = useState(null);

  const getModeList = async () => {
    setLoading((prev) => ({ ...prev, mode: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["sub_activity"], // mandatory input will be an array
      // parent_id: 119, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setModeList(decrypted);
        setLoading((prev) => ({ ...prev, mode: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, mode: false }));
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
      setLoading((prev) => ({ ...prev, mode: false }));
    }
  };

  useEffect(() => {
    getModeList();
  }, []);

  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const formikRefChangeStateLead = useRef();

  const changeStateLeadValidationSchema = Yup.object().shape({
    stage: Yup.number().required(t("leads.400349")),
    subStage: Yup.number().required(t("leads.400352")),
    ...(![34, 36, 51, 55, 106, 108, 110, 112].includes(
      formikRefChangeStateLead.current?.values?.stage
    )
      ? {
          nextDate: Yup.date()
            .required(t("followup.cf_date_required"))
            .test(
              "is-valid-datetime",
              "The selected date and time must not be in the past.",
              function (value) {
                const { nextTime } = this.parent;
                if (!value || !nextTime) return false;

                const currentDate = new Date();
                const selectedDateTime = new Date(
                  value.getFullYear(),
                  value.getMonth(),
                  value.getDate(),
                  ...nextTime.split(":").map(Number)
                );

                // Check if the selected datetime is greater than or equal to current datetime
                return selectedDateTime >= currentDate;
              }
            ),
          nextTime: Yup.string()
            .required(t("followup.cf_time_required"))
            .test(
              "is-valid-time",
              "The selected time must not be earlier than the current time.",
              function (value) {
                const { nextDate } = this.parent;
                if (!nextDate || !value) return false;

                const currentDate = new Date();
                const selectedDate = new Date(nextDate);

                // If selected date is today, time must be future
                if (
                  selectedDate.getFullYear() === currentDate.getFullYear() &&
                  selectedDate.getMonth() === currentDate.getMonth() &&
                  selectedDate.getDate() === currentDate.getDate()
                ) {
                  const [hours, minutes] = value.split(":").map(Number);
                  return (
                    hours > currentDate.getHours() ||
                    (hours === currentDate.getHours() &&
                      minutes > currentDate.getMinutes())
                  );
                }

                return true;
              }
            ),
          followComment: Yup.string()
            .max(500)
            .trim()
            .transform((value) => value?.trim())
            .required(t("followup.cf_description_required"))
            .test(
              "is-empty",
              "Comment cannot be empty",
              (value) => value.trim().length > 0
            ),
          mode: Yup.number().required(t("followup.cf_mode_required")),
        }
      : {}),
  });

  const [loading, setLoading] = useState({
    lead: false,
    stages: false,
    subStage: false,
    submit: false,
    mode: false,
  });

  const [leadData, setLeadData] = useState(null);
  const [stageOptions, setStageOptions] = useState(null);
  const [subStageOptions, setSubStageOptions] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);

  const getStagesOptions = async () => {
    setLoading((prev) => ({ ...prev, stages: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: 1,
    };
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("stages DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final stages", decrypted);

        setStageOptions(decrypted);
        setLoading((prev) => ({ ...prev, stages: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, stages: false }));
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
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, stages: false }));
    }
  };
  const getSubStageOptions = async () => {
    setLoading((prev) => ({ ...prev, subStage: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedStage,
    };
    // console.log("reqbody sub", reqbody);
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("subStage DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final subStage", decrypted);

        setSubStageOptions(decrypted[0]?.children);
        setLoading((prev) => ({ ...prev, subStage: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, subStage: false }));
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
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, subStage: false }));
    }
  };
  const getLeadData = async (lid) => {
    setLoading((prev) => ({ ...prev, lead: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: lid,
    };
    // console.log("body", reqbody);
    try {
      const result = await singleLeadDetailsAction(csrfToken, reqbody);
      // console.log("single lead result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final single lead", decrypted);

        setLeadData(decrypted);
        setSelectedStage(decrypted?.lead_status?.id);
        setLoading((prev) => ({ ...prev, lead: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, lead: false }));
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
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, lead: false }));
    }
  };

  useEffect(() => {
    getStagesOptions();
  }, []);

  useEffect(() => {
    getLeadData(lead);
  }, [lead]);

  useEffect(() => {
    if (selectedStage) {
      getSubStageOptions();
    }
  }, [selectedStage]);

  const handleFormSubmit = async (values) => {
    console.log("values", values);

    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    console.log(lead);

    const reqbody = {
      lead_id: lead.id,
      lead_status: values.stage,
      lead_sub_status: values.subStage,
      full_name: lead?.full_name,
      mobile_number: lead?.mobile_number,
      alternate_mobile_number: lead?.alternate_mobile_number,
      dob: lead?.dob,
      email: lead?.email,
      alternate_email: lead?.alternate_email,
      university_interested: lead?.university_interested,
      lead_channel: lead?.lead_channel,
      source_medium: lead?.source_medium,
      lead_owner: lead?.lead_owner?.uuid,
      best_time_to_call: lead?.best_time_to_call,
      campaign_name: lead?.campaign_name,
      company_name: lead?.company_name,
      ctc_annual_package: lead?.ctc_annual_package,
      experience: lead?.experience,
      remark: lead?.remark,
      first_line_add: lead?.first_line_add,
      gender: lead?.gender,
      course: lead?.course?.id,
      country: lead?.country,
      state: lead?.state,
      city: lead?.city,
    };

    try {
      console.log("reqbody", reqbody);

      const result = await updateSingleLeadAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        if (![34, 36, 51, 55, 106, 108, 110, 112].includes(values?.stage)) {
          const reqbody2 = {
            lead_id: lead.id,
            details: values.followComment,
            follow_up_mode: values?.mode,
            follow_up_date_time: values.nextDate,
            time: values.nextTime,
            activity_id: 119,
          };

          const result = await createSingleFollowupAction(csrfToken, reqbody2);
          // debugger;
          if (result.success && result.status === 200) {
            const { iv, encryptedData } = result?.data;
            const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
            const decrypted = decryptClient(iv, encryptedData, key);
            console.log("final 2", decrypted);
          } else {
            console.error(result.error);
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
              }
            }
            setLoading((prev) => ({ ...prev, submit: false }));
          }
          showSnackbar({
            message: `${t("followup.fup_sussful_alert")}`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }

        onClose();
        handleDataChange();
        setLoading((prev) => ({ ...prev, submit: false }));
        showSnackbar({
          message: `<strong>${decrypted.full_name}</strong> lead updated successfully`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        formikRefChangeStateLead.current.resetForm();
      } else {
        console.error(result.error);
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
    <div id="map-roles-modal-user" className="map-roles-modal-user stageChange">
      <div id="modal-header-roles" className="modal-header-roles">
        <h2>{t("leads.lm_menu_change_state")}</h2>
        <div
          id="leads-create-lead-cancel-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div
        id="modal-body"
        className="modal-body"
        style={{ overflowY: "scroll" }}
      >
        <div
          id="modal-content-user-section"
          className="modal-content-user-section"
        >
          <Formik
            innerRef={formikRefChangeStateLead}
            enableReinitialize={true}
            initialValues={{
              stage: leadData?.lead_status?.id || "",
              subStage: leadData?.lead_sub_status?.id || "",
              nextDate: "",
              nextTime: "",
              followComment: "",
              mode: "",
            }}
            validationSchema={changeStateLeadValidationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <p>Edit stages of a lead and add next action date</p>

                {/* stage */}
                <div id="form-group-user-stage" className="form-group-user">
                  <FormControl fullWidth margin="none">
                    <label htmlFor="stage" className="role-label">
                      {t("leads.esl_lead_stage")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-edit-lead-stage"
                      value={loading?.stages ? "loading" : values.stage}
                      onChange={(e) => {
                        setFieldValue("stage", e.target.value);
                        setFieldValue("subStage", "");
                        setSelectedStage(e.target.value);
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.stage && errors.stage ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.el_select_stage")}
                      </MenuItem>
                      {loading?.stages ? (
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
                      ) : stageOptions?.length === 0 || !stageOptions ? (
                        <MenuItem disabled>{t("leads.el_no_stages")}</MenuItem>
                      ) : (
                        stageOptions?.length > 0 &&
                        stageOptions?.map((stage) => (
                          <MenuItem key={stage?.id} value={stage?.id}>
                            <Chip
                              label={stage?.name}
                              variant="filled"
                              size="small"
                              sx={{
                                color: stage?.txt_color,
                                backgroundColor: stage?.bg_color,
                                fontWeight: 400,
                              }}
                            />
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="stage"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* substage */}
                <div id="form-group-user-substage" className="form-group-user">
                  <FormControl fullWidth margin="none">
                    <label htmlFor="subStage" className="role-label">
                      {t("leads.esl_lead_sub_stage")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="leads-edit-lead-sub-stage"
                      disabled={!selectedStage}
                      value={loading?.subStage ? "loading" : values.subStage}
                      onChange={(e) => {
                        setFieldValue("subStage", e.target.value);
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.subStage && errors.subStage ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.el_select_sub_stage")}
                      </MenuItem>
                      {loading?.subStage ? (
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
                      ) : subStageOptions?.length === 0 || !subStageOptions ? (
                        <MenuItem disabled>
                          {t("leads.el_no_sub_stages")}
                        </MenuItem>
                      ) : (
                        subStageOptions?.length > 0 &&
                        subStageOptions?.map((subStage) => (
                          <MenuItem key={subStage?.id} value={subStage?.id}>
                            <Chip
                              label={subStage?.name}
                              variant="filled"
                              size="small"
                              avatar={
                                <div
                                  style={{
                                    backgroundColor: subStage?.txt_color,
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                  }}
                                />
                              }
                              sx={{
                                backgroundColor: subStage?.bg_color,
                                fontWeight: 400,
                              }}
                            />
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="subStage"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {![34, 36, 51, 55, 112].includes(values?.stage) && (
                  <>
                    <div id="form-group-user-mode" className="form-group-user">
                      <FormControl fullWidth margin="none">
                        <label className="role-label" htmlFor="mode">
                          {t("followup.cf_mode_lab")}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <Select
                          value={loading?.mode ? "loading" : values.mode}
                          onChange={(e) =>
                            setFieldValue("mode", e.target.value)
                          }
                          displayEmpty
                          IconComponent={ChevronDown}
                          fullWidth
                          className={
                            touched.mode && errors.mode ? "input-error" : ""
                          }
                          style={{ height: "40px" }}
                        >
                          <MenuItem disabled value="">
                            {t("followup.cf_mode_phldr")}
                          </MenuItem>
                          {loading?.mode ? (
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
                          ) : modeList?.length === 0 || !modeList ? (
                            <MenuItem disabled>
                              {t("followup.fup_create_dd")}
                            </MenuItem>
                          ) : (
                            modeList?.length > 0 &&
                            modeList?.map((mode) => (
                              <MenuItem key={mode.id} value={mode.id}>
                                {mode.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        <ErrorMessage
                          name="mode"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div>

                    {/* Date */}
                    <div id="form-group-user-date" className="form-group-user">
                      <FormControl fullWidth>
                        <label className="role-label" htmlFor="nextDate">
                          Next action date
                          <span style={{ color: "#F00" }}>*</span>
                        </label>
                        <Field
                          type="date"
                          name="nextDate"
                          min={new Date().toISOString().split("T")[0]}
                          className={
                            touched.nextDate && errors.nextDate
                              ? "input-error"
                              : ""
                          }
                        />
                        <ErrorMessage
                          name="nextDate"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div>

                    {/* time */}
                    <div id="form-group-user-time" className="form-group-user">
                      <FormControl fullWidth>
                        <label className="role-label" htmlFor="nextTime">
                          Next action time
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <Field
                          type="time"
                          name="nextTime"
                          min={getCurrentTime()}
                          onChange={(e) => {
                            setFieldValue("nextTime", e.target.value);
                          }}
                          className={
                            touched.nextTime && errors.nextTime
                              ? "input-error"
                              : ""
                          }
                        />

                        <ErrorMessage
                          name="nextTime"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div>

                    {/* description */}
                    <div
                      id="form-group-user-comment"
                      className="full-width-field"
                    >
                      <label className="role-label" htmlFor="followComment">
                        Follow up Comment
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Field
                        name="followComment"
                        as={TextField}
                        multiline
                        rows={4}
                        placeholder="Enter comment"
                        style={{ width: "100%" }}
                        className={
                          touched.followComment && errors.followComment
                            ? "input-error"
                            : ""
                        }
                      />
                      <ErrorMessage
                        name="followComment"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <div id="modal-footer" className="modal-footer">
        <Button
          id="leads-create-lead-cancel-btn"
          variant="outlined"
          style={{ marginLeft: "20px" }}
          className="cancel-button"
          onClick={onClose}
        >
          {t("leads.csl_cancel_btn")}
        </Button>

        <Button
          id="leads-create-lead-submit-btn"
          variant="contained"
          color="success"
          className="map-role-button"
          onClick={() => formikRefChangeStateLead.current.submitForm()}
          style={{ marginRight: "20px" }}
        >
          {loading?.submit ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("leads.csl_save_btn")
          )}
        </Button>
      </div>
    </div>
  );
};

export default StageChangeModal;
