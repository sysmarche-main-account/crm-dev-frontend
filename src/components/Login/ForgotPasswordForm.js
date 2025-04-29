"use client";
import React, { useState } from "react";
import { handleForgetPasswordAction } from "@/app/actions/authActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { Alert, CircularProgress } from "@mui/material";
import ErrorIcon from "@/images/error.svg";
import { decryptClient } from "@/utils/decryptClient";
import { getToken } from "@/utils/getToken";

const ForgetPasswordForm = ({ setIsForgotPassword }) => {
  const t = useTranslations();
  const router = useRouter();

  const [forgotEmailError, setForgotEmailError] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState(false);
  // Validation Schema for Reset Password Form
  const resetPasswordValidationSchema = Yup.object({
    email: Yup.string()
      .max(300)
      .email(t("login.email_error"))
      .required(t("login.400001")),
  });

  // Function to handle Forgot password request
  const handleForgotPasswordSubmit = async (values) => {
    // router.push("/newpassword");
    setForgotLoading(true);
    setForgotEmailError(null);
    const csrfToken = await getCsrfToken();
    const reqbody = { email: values.email };
    try {
      const result = await handleForgetPasswordAction(csrfToken, reqbody);
      console.log("ForgotPassword result:", result);

      if (result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);
        setEmailConfirm(true);
        setForgotLoading(false);
      } else {
        // Handle forgot password error
        console.error(result.error);
        // setForgotEmailError(result.error.message.message);
        setForgotLoading(false);
        if (result.error.message.error_code === 500) {
          router.replace("/unauthorized");
        } else if (typeof result.error.message === "string") {
          setForgotEmailError(result.error.message);
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          }
          setForgotEmailError(errValues[0]);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setForgotLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: "" }}
      validationSchema={resetPasswordValidationSchema}
      onSubmit={(values) => {
        handleForgotPasswordSubmit(values);
        console.log("New Password:", values.email);
      }}
    >
      {({ errors, touched }) => (
        <Form>
          {forgotEmailError && !emailConfirm && (
            <div
              style={{
                marginBottom: 10,
              }}
            >
              <Alert style={{ width: "fit-content" }} severity="error">
                {forgotEmailError}
              </Alert>
            </div>
          )}
          {emailConfirm && !forgotEmailError && (
            <div
              style={{
                marginBottom: 10,
              }}
            >
              <Alert style={{ width: "fit-content" }} severity="success">
                {t("login.login_forgotpassword_sent")}
              </Alert>
            </div>
          )}
          <div className="form-group input-with-icon">
            <label htmlFor="email">{t("profile.prf_email_lab")}</label>
            <div className="input-container">
              <Field
                id="forgot-password-form-email"
                type="text"
                name="email"
                placeholder={t("login.email_phldr")}
                className={touched.email && errors.email ? "input-error" : ""}
              />
              {touched.email && errors.email && (
                <span className="error-icon password">
                  <ErrorIcon />
                </span>
              )}
            </div>
            <ErrorMessage
              name="email"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <a
              id="forgot-password-form-back-to-login-btn"
              href="#"
              style={{ color: "#7D7D7D" }}
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPassword(false);
              }}
            >
              {t("login.login_forgotpassword_back")}
            </a>
          </div>

          <button
            id="forgot-password-form-submit-btn"
            type="submit"
            className="login-button"
          >
            {forgotLoading ? (
              <CircularProgress size={20} sx={{ color: "#000" }} />
            ) : (
              t("login.submit_pswd_btn")
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ForgetPasswordForm;
