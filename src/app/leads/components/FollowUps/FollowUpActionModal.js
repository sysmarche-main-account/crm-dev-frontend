"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import useLogout from "@/app/hooks/useLogout";
import { decryptClient } from "@/utils/decryptClient";
import { useTranslations } from "next-intl";
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

const FollowUpActionModal = ({ onClose, lead, data, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const formikRefFollowUpAction = useRef();

  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const followUpActionValidationSchema = Yup.object({
    mode: Yup.number().required(t("followup.cf_mode_required")),
    nextDate: Yup.date().required(t("followup.cf_date_required")),
    nextTime: Yup.string()
      .required(t("followup.cf_time_required"))
      .test(
        "is-valid-time",
        "The selected time must not be earlier than the current time.",
        function (value) {
          if (!value) return false;

          const { nextDate } = this.parent;
          if (!nextDate) return false; // Handled by nextDate's required validation

          const currentDate = new Date();
          const currentTime = getCurrentTime();

          // Check if nextDate is the same day as currentDate
          const isSameDay =
            nextDate.getFullYear() === currentDate.getFullYear() &&
            nextDate.getMonth() === currentDate.getMonth() &&
            nextDate.getDate() === currentDate.getDate();

          // Validate time only if it's the same day
          return isSameDay ? value >= currentTime : true;
        }
      ),
    followComment: Yup.string()
      .max(500)
      .trim()
      .transform((value) => value?.trim())
      .required("Comment is required"),
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
      lead_id: lead,
      details: values.followComment,
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
    <div id="next-followup-modal" className="map-roles-modal-user stageChange">
      <div id="next-followup-modal-header" className="modal-header-roles">
        <h2>Next follow up action</h2>
        <div
          id="next-followup-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div
        id="next-followup-modal-body"
        className="modal-body"
        style={{ overflowY: "scroll" }}
      >
        <div
          id="next-followup-modal-content"
          className="modal-content-user-section"
        >
          <Formik
            innerRef={formikRefFollowUpAction}
            enableReinitialize={true}
            initialValues={{
              mode: "",
              nextDate: "",
              nextTime: "",
              followComment: "",
            }}
            validationSchema={followUpActionValidationSchema}
            onSubmit={handleFollowupSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form
                id="next-followup-form"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <p id="next-followup-instruction-text">
                  Fill in below fields to mark follow complete
                </p>

                {/* followup mode */}
                <div
                  id="next-followup-mode-container"
                  className="form-group-user"
                >
                  <FormControl fullWidth margin="none">
                    <label className="role-label" htmlFor="mode">
                      {t("followup.cf_mode_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="next-followup-mode-select"
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
                <div
                  id="next-followup-date-container"
                  className="form-group-user"
                >
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="nextDate">
                      Next action date
                      <span style={{ color: "#F00" }}>*</span>
                    </label>
                    <Field
                      id="next-followup-date-input"
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
                <div
                  id="next-followup-time-container"
                  className="form-group-user"
                >
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="nextTime">
                      Next action time
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="next-followup-time-input"
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
                  id="next-followup-comment-container"
                  className="full-width-field"
                >
                  <label className="role-label" htmlFor="followComment">
                    Follow up Comment
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    id="next-followup-comment-input"
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
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <div id="next-followup-modal-footer" className="modal-footer">
        <Button
          id="next-followup-cancel-btn"
          variant="outlined"
          style={{ marginLeft: "20px" }}
          className="cancel-button"
          onClick={onClose}
        >
          {t("leads.csl_cancel_btn")}
        </Button>

        <Button
          id="next-followup-submit-btn"
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

export default FollowUpActionModal;
