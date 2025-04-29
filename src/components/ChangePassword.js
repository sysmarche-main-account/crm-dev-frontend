"use client";
import React, { useEffect, useRef, useState } from "react";
import VisibilityIcon from "@/images/visibility.svg";
import ErrorIcon from "@/images/error.svg";
import { useTranslations } from "next-intl";
import { ErrorMessage, Field, Formik } from "formik";
import * as Yup from "yup";
import { TaskAlt, VisibilityOff, InfoOutlined } from "@mui/icons-material";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { Alert, CircularProgress } from "@mui/material";
import { handleChangePasswordAction } from "@/app/actions/profileActions";
import { useSelector } from "react-redux";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";
import PasswordStrengthChecker from "./PasswordStrengthChecker";
// import "@/styles/ChangePassword.scss";

const ChangePassword = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const formikChangePasswordRef = useRef();
  const { details, permissions } = useSelector((state) => state.user);

  const [isResetPass, setIsResetPass] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const changePasswordValidationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, t("login.pswd_descr"))
      .matches(/[A-Z]/, t("profile.400384"))
      .matches(/[a-z]/, t("profile.400385"))
      .matches(/[0-9]/, t("profile.400386"))
      .matches(/[@$!%*?&]/, t("profile.400387"))
      .required(t("login.400009"))
      .trim()
      .transform((value) => value?.trim()),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], t("login.400013"))
      .required(t("login.400010"))
      .trim()
      .transform((value) => value?.trim()),
  });

  const handleChangePasswordSubmit = async (values) => {
    // Handle password reset logic here
    // console.log(values);
    setLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      email: details?.email,
      new_password: values.newPassword,
    };
    try {
      const result = await handleChangePasswordAction(csrfToken, reqbody);
      // console.log("password change result:", result);

      if (result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        showSnackbar({
          message: `${decrypted.message}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        setIsResetPass(false);
        formikChangePasswordRef.current.resetForm();
        setLoading(false);
      } else {
        // Handle forgot password error
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
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
    }
  };

  const changePasswordActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter((set) => set.parent === 6);

  return (
    <div className="reset-password-container">
      <div className="password-section">
        <div className="reset-password-header">
          <h2>{t("change_password.cp_header")}</h2>
          <p>{t("change_password.cp_descpr")}</p>
        </div>
        <div>
          {changePasswordActions &&
          changePasswordActions.some((act) => act.id === 19) &&
          !isResetPass ? (
            <button
              id="change-password-reset-btn"
              className="reset-password-btn"
              onClick={() => setIsResetPass(true)}
            >
              {loading ? (
                <CircularProgress size={20} color="#000" />
              ) : (
                t("change_password.cp_reset_btn")
              )}
            </button>
          ) : null}
        </div>
      </div>

      <Formik
        innerRef={formikChangePasswordRef}
        initialValues={{ newPassword: "", confirmNewPassword: "" }}
        validationSchema={changePasswordValidationSchema}
        // validateOnBlur={false} //**will display error only on submit function run, not on touch or blue or interacted with */
        onSubmit={(values) => {
          handleChangePasswordSubmit(values);
        }}
      >
        {({ errors, touched, values }) => (
          <>
            <div className="password-fields">
              <div className="password-field">
                <label htmlFor="newPassword">
                  {" "}
                  {t("change_password.cp_new_pswd_lab")}
                </label>
                <div className="input-container">
                  <Field
                    id="change-password-pass-field"
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder={t("change_password.cp_phldr_pswd")}
                    disabled={!isResetPass}
                    autoComplete="off"
                    className={
                      touched.newPassword && errors.newPassword
                        ? "input-error"
                        : ""
                    }
                  />
                  <span
                    id="change-password-pass-visibility"
                    onClick={toggleNewPasswordVisibility}
                    className="toggle-password-visibility" // Uncommented and added className
                  >
                    {showNewPassword ? (
                      <VisibilityOff sx={{ color: "#C1C1C1" }} />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </span>
                </div>
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="password-field">
                <label htmlFor="confirmPassword">
                  {t("change_password.cp_confirm_pswd_lab")}
                </label>
                <div className="input-container">
                  <Field
                    id="change-password-confirm-pass-field"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    placeholder={t("change_password.cp_phldr_pswd")}
                    disabled={!isResetPass}
                    autoComplete="off"
                    className={
                      touched.confirmNewPassword && errors.confirmNewPassword
                        ? "input-error"
                        : ""
                    }
                    onPaste={(e) => e.preventDefault()}
                  />
                  <span
                    id="change-password-confirm-pass-visibility"
                    onClick={toggleConfirmPasswordVisibility}
                    className="toggle-password-visibility"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOff sx={{ color: "#C1C1C1" }} />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </span>
                </div>
                <ErrorMessage
                  name="confirmNewPassword"
                  component="div"
                  className="error-message"
                />
              </div>
            </div>

            <div className="password-section">
              <div className="info-container-start">
                <InfoOutlined sx={{ color: "#757575" }} />
                <div style={{ width: "60%" }}>
                  <span style={{ color: "#757575", fontSize: 12 }}>
                    <p style={{ margin: 0 }}>
                      {t("profile.profile_change_password")}
                    </p>
                  </span>
                </div>
              </div>
              {(values.newPassword.length > 0 ||
                values.confirmNewPassword.length > 0) && (
                <div style={{ justifyContent: "flex-end" }}>
                  <PasswordStrengthChecker password={values.newPassword} />
                </div>
              )}
            </div>

            {isResetPass && (
              <div className="password-fields">
                <div className="action-btns">
                  <button
                    id="change-password-cancel-btn"
                    className="cancel-button"
                    onClick={() => {
                      setIsResetPass(false);
                      formikChangePasswordRef.current.resetForm();
                    }}
                  >
                    {t("profile.cancel_btn")}
                  </button>
                  <button
                    id="change-password-submit-btn"
                    style={{ width: "fit-content" }}
                    className="confirm-button"
                    type="submit"
                    onClick={() => formikChangePasswordRef.current.submitForm()}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="#000" />
                    ) : (
                      t("change_password.cp_reset_btn")
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Formik>
    </div>
  );
};

export default ChangePassword;
