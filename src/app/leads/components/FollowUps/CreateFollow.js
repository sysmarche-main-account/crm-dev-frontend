"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
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
  CircularProgress,
  Box,
  TextField,
} from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import { getToken } from "@/utils/getToken";
import { masterDDAction } from "@/app/actions/commonActions";
import { createSingleFollowupAction } from "@/app/actions/followupActions";

const CreateFollow = ({ onClose, selectedLead, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const formikRefFollowUpAction = useRef();

  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  // const followUpActionValidationSchema = Yup.object().shape({
  //   nextDate: Yup.date()
  //     .required(t("followup.cf_date_required"))
  //     .test(
  //       "is-valid-datetime",
  //       "The selected date and time must not be in the past.",
  //       function (value) {
  //         const { nextTime } = this.parent;
  //         if (!value || !nextTime) return false;

  //         const currentDate = new Date();
  //         const selectedDateTime = new Date(
  //           value.getFullYear(),
  //           value.getMonth(),
  //           value.getDate(),
  //           ...nextTime.split(":").map(Number)
  //         );

  //         // Check if the selected datetime is greater than or equal to current datetime
  //         return selectedDateTime >= currentDate;
  //       }
  //     ),
  //   nextTime: Yup.string()
  //     .required(t("followup.cf_time_required"))
  //     .test(
  //       "is-valid-time",
  //       "The selected time must not be earlier than the current time.",
  //       function (value) {
  //         const { nextDate } = this.parent;
  //         if (!nextDate || !value) return false;

  //         const currentDate = new Date();
  //         const selectedDate = new Date(nextDate);

  //         // If selected date is today, time must be future
  //         if (
  //           selectedDate.getFullYear() === currentDate.getFullYear() &&
  //           selectedDate.getMonth() === currentDate.getMonth() &&
  //           selectedDate.getDate() === currentDate.getDate()
  //         ) {
  //           const [hours, minutes] = value.split(":").map(Number);
  //           return (
  //             hours > currentDate.getHours() ||
  //             (hours === currentDate.getHours() &&
  //               minutes > currentDate.getMinutes())
  //           );
  //         }

  //         return true;
  //       }
  //     ),
  //   comment: Yup.string()
  //     .max(500)
  //     .trim()
  //     .transform((value) => value?.trim())
  //     .required("Comment is required"),

  //   mode: Yup.number().required(t("followup.cf_mode_required")),
  // });

  const followUpActionValidationSchema = Yup.object().shape({
    nextDate: Yup.date().required(t("followup.cf_date_required")),
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

          // Check if selected date is today
          const isSameDay =
            selectedDate.getFullYear() === currentDate.getFullYear() &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getDate() === currentDate.getDate();

          // Validate time only if selected date is today
          return isSameDay ? value >= getCurrentTime() : true;
        }
      ),
    comment: Yup.string()
      .max(500)
      .trim()
      .transform((value) => value?.trim())
      .required("Comment is required"),
    mode: Yup.number().required(t("followup.cf_mode_required")),
  });

  const [loading, setLoading] = useState({
    mode: false,
    submit: false,
  });

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

  const handleFollowupSubmit = async (values) => {
    console.log("followup", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: selectedLead.id,
      details: values.comment,
      follow_up_mode: values?.mode,
      follow_up_date_time: values.nextDate,
      time: values.nextTime,
      // reminder: values.reminder,
      activity_id: 119,
    };
    try {
      const result = await createSingleFollowupAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setLoading((prev) => ({ ...prev, submit: false }));
        showSnackbar({
          message: `${t("followup.fup_sussful_alert")}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
        onClose();
        formikRefFollowUpAction.current.resetForm();
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
    <div
      id="followup-action-modal"
      className="map-roles-modal-user stageChange"
    >
      <div id="followup-action-modal-header" className="modal-header-roles">
        <h2>{t("followup.cf_modal_header")}</h2>
        <div
          id="leads-create-lead-cancel-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div
        id="followup-action-modal-body"
        className="modal-body"
        style={{ overflowY: "scroll" }}
      >
        <div
          id="followup-action-modal-content"
          className="modal-content-user-section"
        >
          <Formik
            innerRef={formikRefFollowUpAction}
            enableReinitialize={true}
            initialValues={{
              mode: "",
              nextDate: "",
              nextTime: "",
              description: "",
            }}
            validationSchema={followUpActionValidationSchema}
            onSubmit={handleFollowupSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form
                id="followup-action-form"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* <p>Fill in below fields to mark follow complete</p> */}

                {/* followup mode */}
                <div id="followup-mode-container" className="form-group-user">
                  <FormControl fullWidth margin="none">
                    <label className="role-label" htmlFor="mode">
                      {t("followup.cf_mode_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="followup-mode-select"
                      value={loading?.mode ? "loading" : values.mode}
                      onChange={(e) => setFieldValue("mode", e.target.value)}
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
                <div id="followup-date-container" className="form-group-user">
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="nextDate">
                      Next action date
                      <span style={{ color: "#F00" }}>*</span>
                    </label>
                    <Field
                      id="followup-date-input"
                      type="date"
                      name="nextDate"
                      min={new Date().toISOString().split("T")[0]}
                      className={
                        touched.nextDate && errors.nextDate ? "input-error" : ""
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
                <div id="followup-time-container" className="form-group-user">
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="nextTime">
                      Next action time
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="followup-time-input"
                      type="time"
                      name="nextTime"
                      min={getCurrentTime()}
                      onChange={(e) => {
                        setFieldValue("nextTime", e.target.value);
                      }}
                      className={
                        touched.nextTime && errors.nextTime ? "input-error" : ""
                      }
                    />

                    <ErrorMessage
                      name="nextTime"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* comment */}
                <div
                  id="followup-comment-container"
                  className="full-width-field"
                >
                  <label className="role-label" htmlFor="comment">
                    Follow up Comment
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    id="followup-comment-input"
                    name="comment"
                    as={TextField}
                    multiline
                    rows={4}
                    placeholder="Enter comment"
                    style={{ width: "100%" }}
                    className={
                      touched.comment && errors.comment ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="comment"
                    component="div"
                    className="error-message"
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <div id="followup-action-modal-footer" className="modal-footer">
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
          onClick={() => formikRefFollowUpAction.current.submitForm()}
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

export default CreateFollow;
