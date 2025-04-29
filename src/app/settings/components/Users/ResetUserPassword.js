import React, { useRef, useState } from "react";
import CloseIcon from "@/images/close-icon.svg";
import CallIcon from "@/images/phone-call-01.svg";
import EmailIcon from "@/images/email.svg";
import { InfoOutlined, VisibilityOff } from "@mui/icons-material";
import VisibilityIcon from "@/images/visibility.svg";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { handleChangePasswordAction } from "@/app/actions/profileActions";
import { handleForgetPasswordAction } from "@/app/actions/authActions";
import { decryptClient } from "@/utils/decryptClient";
import { CircularProgress } from "@mui/material";
import { getToken } from "@/utils/getToken";
import PasswordStrengthChecker from "@/components/PasswordStrengthChecker";

const ResetUserPassword = ({ onClose, data, handleDataChange }) => {
  // console.log("data", data);
  const t = useTranslations();
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState({
    link: false,
    resetPass: false,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const formikRefForceResetPass = useRef();

  const resetPasswordValidationSchema = Yup.object({
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

  const handleResetPasswordLinkSubmit = async () => {
    setLoading((prev) => ({ ...prev, link: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = { email: data?.email };
    try {
      const result = await handleForgetPasswordAction(csrfToken, reqbody);
      console.log("ForgotPassword result:", result);

      if (result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);
        setLoading((prev) => ({ ...prev, link: false }));
        showSnackbar({
          message: `${t("manage_user.mu_passwordreset_submit")}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        onClose();
      } else {
        setLoading((prev) => ({ ...prev, link: false }));
        console.error(result);
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
      setLoading((prev) => ({ ...prev, link: false }));
    }
  };

  const handleForceChangePasswordSubmit = async (values) => {
    console.log("values", values);
    setLoading((prev) => ({ ...prev, resetPass: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      email: data?.email,
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
        formikRefForceResetPass.current.resetForm();
        handleDataChange();
        setLoading((prev) => ({ ...prev, resetPass: false }));
        onClose();
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
        setLoading((prev) => ({ ...prev, resetPass: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, resetPass: false }));
    }
  };

  return (
    <div className="map-roles-modal-reset-paassword">
      <div className="modal">
        <div className="modal-header-reset-password">
          <h2>{t("manage_user.mu_reset_pswd")}</h2>
          <div
            id="user-reset-password-close-btn"
            className="close-button"
            onClick={onClose}
          >
            <CloseIcon />
          </div>
        </div>
        <div className="modal-body-reset-password">
          {/* Tabs */}
          <div className="tabs">
            <button
              id="user-reset-password-reset-tab"
              className={`tab ${activeTab === 0 ? "active" : ""}`}
              onClick={() => handleTabChange(0)}
            >
              {t("manage_user.mu_passwordreset_resetlink")}
            </button>
            <button
              id="user-reset-password-set-tab"
              className={`tab ${activeTab === 1 ? "active" : ""}`}
              onClick={() => handleTabChange(1)}
            >
              {t("login.set_pswd")}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <div className="tab-content">
              <p className="tab-title">
                <strong>
                  {t("manage_user.mu_tbl_user_name")} - {data?.first_name}{" "}
                  {data?.last_name}
                </strong>
              </p>
              <p>
                <CallIcon /> {data?.mobile_number}
              </p>
              <p>
                <EmailIcon /> {data?.email}
              </p>
            </div>
          )}

          {activeTab === 1 && (
            <div className="tab-content">
              <Formik
                innerRef={formikRefForceResetPass}
                initialValues={{ newPassword: "", confirmNewPassword: "" }}
                validationSchema={resetPasswordValidationSchema}
                onSubmit={handleForceChangePasswordSubmit}
              >
                {({ errors, touched, values }) => (
                  <Form>
                    <div className="reset-password-form">
                      {/* password */}
                      <div className="form-group input-with-icon">
                        <label htmlFor="newPassword">
                          {t("login.new_pswd_lab")}
                        </label>
                        <div
                          className={`input-container-reset-password ${
                            touched.newPassword && errors.newPassword
                              ? "has-error"
                              : ""
                          }`}
                        >
                          <Field
                            id="user-reset-password-field"
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder={t("login.new_pswd_phldr")}
                            className={
                              touched.newPassword && errors.newPassword
                                ? "input-error"
                                : ""
                            }
                          />
                          {/* {touched.newPassword && errors.newPassword && (
                          <span className="error-icon password">
                            <ErrorIcon />
                          </span>
                        )} */}
                          <span
                            onClick={togglePasswordVisibility}
                            // className="eye-icon-confirm"
                            className="toggle-password-visibility"
                          >
                            {showPassword ? (
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

                      {/* new_password */}
                      <div className="form-group input-with-icon">
                        <label htmlFor="confirmNewPassword">
                          {t("login.confirm_new_pswd_lab")}
                        </label>
                        <div
                          className={`input-container-reset-password ${
                            touched.newPassword && errors.newPassword
                              ? "has-error"
                              : ""
                          }`}
                        >
                          <Field
                            id="user-reset-password-new-field"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmNewPassword"
                            placeholder={t("login.confirm_new_pswd_phldr")}
                            className={
                              touched.confirmNewPassword &&
                              errors.confirmNewPassword
                                ? "input-error"
                                : ""
                            }
                            onPaste={(e) => e.preventDefault()}
                          />
                          {/* {touched.confirmNewPassword &&
                          errors.confirmNewPassword && (
                            <span className="error-icon password">
                              <ErrorIcon />
                            </span>
                          )} */}
                          <span
                            id="user-reset-password-visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            // className="eye-icon"
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

                    <div>
                      <div className="info-container-start">
                        <InfoOutlined sx={{ color: "#757575" }} />
                        <div>
                          <span
                            style={{
                              color: "#757575",
                              textAlign: "start",
                              fontSize: 12,
                            }}
                          >
                            <span
                              style={{
                                margin: 0,
                              }}
                            >
                              {" "}
                              {t("profile.profile_change_password")}
                            </span>
                          </span>
                        </div>
                      </div>
                      {(values.newPassword.length > 0 ||
                        values.confirmNewPassword.length > 0) && (
                        <div style={{ justifyContent: "flex-end" }}>
                          <PasswordStrengthChecker
                            password={values.newPassword}
                          />
                        </div>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </div>
        <div className="modal-footer-reset-password">
          <button
            id="user-reset-password-cancel-btn"
            className="button cancel-button"
            onClick={onClose}
          >
            {t("profile.cancel_btn")}
          </button>
          <button
            id="user-reset-password-submit-btn"
            className="button save-btn"
            onClick={() => {
              activeTab === 0
                ? handleResetPasswordLinkSubmit()
                : formikRefForceResetPass.current.submitForm();
            }}
          >
            {loading.resetPass || loading.link ? (
              <CircularProgress size={20} color="#000" />
            ) : (
              t("manage_user.mu_passreset_btn")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetUserPassword;
