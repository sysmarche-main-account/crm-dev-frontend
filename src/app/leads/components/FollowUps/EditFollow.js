"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { editSingleFollowupAction } from "@/app/actions/followupActions";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { masterDDAction } from "@/app/actions/commonActions";
import { getToken } from "@/utils/getToken";

const EditFollow = ({ onClose, data, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const formikEditFollowupRef = useRef();
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);
  // const editFollowupValidationSchema = Yup.object({
  //   title: Yup.string()
  //     .min(3)
  //     .max(100)
  //     .required(t("followup.ef_title_required"))
  //     .trim()
  //     .transform((value) => value?.trim()),
  //   lead: Yup.string()
  //     .min(3)
  //     .max(2000)
  //     .required(t("followup.ef_lead_required"))
  //     .trim()
  //     .transform((value) => value?.trim()),
  //   description: Yup.string()
  //     .min(3)
  //     .required(t("followup.ef_descr_required"))
  //     .trim()
  //     .transform((value) => value?.trim()),
  //   mode: Yup.string()
  //     .min(3)
  //     .required(t("followup.ef_mode_required"))
  //     .trim()
  //     .transform((value) => value?.trim()),
  //   creator: Yup.string()
  //     .min(3)
  //     .required(t("followup.ef_creator_required"))
  //     .trim()
  //     .transform((value) => value?.trim()),
  //   date: Yup.date().required(t("followup.ef_date_required")),
  //   time: Yup.string().required(t("followup.ef_time_required")),
  //   reminder: Yup.string()
  //     .required(t("followup.ef_reminder_required"))
  //     .trim()
  //     .transform((value) => value?.trim()),
  // });

  const editFollowupValidationSchema = Yup.object().shape({
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
    // slot: false,
    data: false,
    mode: false,
    reminder: false,
    submit: false,
  });
  // const [singleFollowupData, setSingleFollowupData] = useState(null);
  const [modeList, setModeList] = useState(null);
  // const [slotList, setSlotList] = useState(null);
  // const [reminderList, setReminderList] = useState(null);

  // const getSingleFollowupData = async () => {
  //   setLoading((prev) => ({ ...prev, data: true }));
  //   const csrfToken = await getCsrfToken();
  //   const reqbody = {
  //     follow_up_id: data?.id,
  //   };
  //   console.log("reqbody", data);
  //   try {
  //     const result = await singleFollowupAction(csrfToken, reqbody);
  //     // console.log("role list DD result:", result);

  //     if (result.success && result.status === 200) {
  //       const { iv, encryptedData } = result?.data;
  //       const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  //       const decrypted = decryptClient(iv, encryptedData, key);
  //       // console.log("final", decrypted);
  //       setSingleFollowupData(decrypted);
  //       setLoading((prev) => ({ ...prev, data: false }));
  //     } else {
  //       console.error(result.error);
  //       setLoading((prev) => ({ ...prev, data: false }));
  //       if (result.error.status === 500) {
  //         await logout();
  //       } else if (typeof result.error.message === "string") {
  //         showSnackbar({
  //           message: `${result.error.message}`,
  //           severity: "error",
  //           anchorOrigin: { vertical: "top", horizontal: "right" },
  //         });
  //       } else if (
  //         typeof result.error.message === "object" &&
  //         result.error.message !== null
  //       ) {
  //         let errValues = Object.values(result.error.message);
  // if (errValues.includes("Token expired")) {
  //   window.location.reload();
  //   getToken();
  // }
  //         if (errValues.length > 0) {
  //           errValues.map((errmsg) =>
  //             showSnackbar({
  //               message: `${errmsg}`,
  //               severity: "error",
  //               anchorOrigin: { vertical: "top", horizontal: "right" },
  //             })
  //           );
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Unexpected error:", error);
  //     setLoading((prev) => ({ ...prev, data: false }));
  //   }
  // };

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
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, mode: false }));
    }
  };

  // const getSlotList = async () => {
  //   setLoading((prev) => ({ ...prev, slot: true }));
  //   const csrfToken = await getCsrfToken();
  //   const reqbody = {
  //     // "status": "1", // optional input will be integer
  //     identifier: ["slot"], // mandatory input will be an array
  //     // parent_id: "0", // if passed
  //   };
  //   try {
  //     const result = await masterDDAction(csrfToken, reqbody);
  //     // console.log("role list DD result:", result);

  //     if (result.success && result.status === 200) {
  //       const { iv, encryptedData } = result?.data;
  //       const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  //       const decrypted = decryptClient(iv, encryptedData, key);
  //       // console.log("final", decrypted);
  //       setSlotList(decrypted);
  //       setLoading((prev) => ({ ...prev, slot: false }));
  //     } else {
  //       console.error(result.error);
  //       setLoading((prev) => ({ ...prev, slot: false }));
  //       if (result.error.status === 500) {
  //         await logout();
  //       } else if (typeof result.error.message === "string") {
  //         showSnackbar({
  //           message: `${result.error.message}`,
  //           severity: "error",
  //           anchorOrigin: { vertical: "top", horizontal: "right" },
  //         });
  //       } else if (
  //         typeof result.error.message === "object" &&
  //         result.error.message !== null
  //       ) {
  //         let errValues = Object.values(result.error.message);
  // if (errValues.includes("Token expired")) {
  //   window.location.reload();
  //   getToken();
  // }
  //         if (errValues.length > 0) {
  //           errValues.map((errmsg) =>
  //             showSnackbar({
  //               message: `${errmsg}`,
  //               severity: "error",
  //               anchorOrigin: { vertical: "top", horizontal: "right" },
  //             })
  //           );
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Unexpected error:", error);
  //     setLoading((prev) => ({ ...prev, slot: false }));
  //   }
  // };

  // const getReminderList = async () => {
  //   setLoading((prev) => ({ ...prev, reminder: true }));
  //   const csrfToken = await getCsrfToken();
  //   const reqbody = {
  //     // "status": "1", // optional input will be integer
  //     identifier: ["reminder"], // mandatory input will be an array
  //     // parent_id: "0", // if passed
  //   };
  //   try {
  //     const result = await masterDDAction(csrfToken, reqbody);
  //     // console.log("role list DD result:", result);

  //     if (result.success && result.status === 200) {
  //       const { iv, encryptedData } = result?.data;
  //       const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  //       const decrypted = decryptClient(iv, encryptedData, key);
  //       // console.log("final", decrypted);
  //       setReminderList(decrypted);
  //       setLoading((prev) => ({ ...prev, reminder: false }));
  //     } else {
  //       console.error(result.error);
  //       setLoading((prev) => ({ ...prev, reminder: false }));
  //       if (result.error.status === 500) {
  //         await logout();
  //       } else if (typeof result.error.message === "string") {
  //         showSnackbar({
  //           message: `${result.error.message}`,
  //           severity: "error",
  //           anchorOrigin: { vertical: "top", horizontal: "right" },
  //         });
  //       } else if (
  //         typeof result.error.message === "object" &&
  //         result.error.message !== null
  //       ) {
  //         let errValues = Object.values(result.error.message);
  //         if (errValues.includes("Token expired")) {
  //           getToken();
  //           window.location.reload();
  //         } else if (errValues.length > 0) {
  //           errValues.map((errmsg) =>
  //             showSnackbar({
  //               message: `${errmsg}`,
  //               severity: "error",
  //               anchorOrigin: { vertical: "top", horizontal: "right" },
  //             })
  //           );
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Unexpected error:", error);
  //     setLoading((prev) => ({ ...prev, reminder: false }));
  //   }
  // };

  // useEffect(() => {
  //   if (data) {
  //     getSingleFollowupData();
  //   }
  // }, [data]);

  useEffect(() => {
    getModeList();
    // getSlotList();
    // getReminderList();
  }, []);

  const handleEditSubmit = async (values) => {
    console.log("Form Values: ", values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      follow_up_id: data?.id,
      // title: values.title,
      lead_id: data?.lead_id,
      details: values.comment,
      follow_up_mode: values?.mode,
      follow_up_date_time: values.nextDate,
      time: values.nextTime,
      // reminder: values.reminder,
    };

    try {
      const result = await editSingleFollowupAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setLoading((prev) => ({ ...prev, submit: false }));
        showSnackbar({
          message: `${t("followup.fup_update_alert")}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        onClose();
        handleDataChange();
        formikEditFollowupRef.current.resetForm();
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
    <div id="edit-followup-modal" className="map-roles-modal-user stageChange">
      <div id="edit-followup-modal-header" className="modal-header-roles">
        <h2>{t("followup.ef_modal_header")}</h2>
        <div
          id="edit-followup-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div id="edit-followup-modal-body" className="modal-body">
        <div
          id="edit-followup-modal-content"
          className="modal-content-user-section"
        >
          <Formik
            innerRef={formikEditFollowupRef}
            initialValues={{
              comment: data?.details,
              mode: data?.follow_up_mode?.id,
              nextDate: data?.follow_up_date_time?.split(" ")[0],
              nextTime: data?.time || "",
            }}
            validationSchema={editFollowupValidationSchema}
            onSubmit={handleEditSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form
                id="edit-followup-form"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* followup mode */}
                <div
                  id="edit-followup-mode-container"
                  className="form-group-user"
                >
                  <FormControl fullWidth margin="none">
                    <label className="role-label" htmlFor="mode">
                      {t("followup.cf_mode_lab")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="edit-followup-mode-select"
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
                  id="edit-followup-date-container"
                  className="form-group-user"
                >
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="nextDate">
                      Next action date
                      <span style={{ color: "#F00" }}>*</span>
                    </label>
                    <Field
                      id="edit-followup-date-input"
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
                  id="edit-followup-time-container"
                  className="form-group-user"
                >
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="nextTime">
                      Next action time
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="edit-followup-time-input"
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
                  id="edit-followup-comment-container"
                  className="full-width-field"
                >
                  <label className="role-label" htmlFor="comment">
                    Follow up Comment
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    id="edit-followup-comment-input"
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

      <div
        id="edit-followup-modal-footer"
        className="modal-footer"
        style={{ padding: "10px 0px" }}
      >
        <Button
          id="edit-followup-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("followup.ef_cancel")}
        </Button>
        <Button
          id="edit-followup-save-btn"
          variant="contained"
          color="success"
          className="map-role-button"
          onClick={() => formikEditFollowupRef.current.submitForm()}
          style={{ marginRight: "20px" }}
        >
          {loading?.submit ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("followup.ef_save")
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditFollow;
