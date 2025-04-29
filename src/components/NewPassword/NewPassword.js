"use client";
import React, { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as Yup from "yup";
import VisibilityIcon from "@/images/visibility.svg";
import ErrorIcon from "@/images/error.svg";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { InfoOutlined, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { Alert, CircularProgress } from "@mui/material";
import { setDetails, setPermissions } from "@/lib/slices/userSlice";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  handleResetPassword,
  validatePassToken,
} from "@/app/actions/newPasswordActions";
import { decryptClient } from "@/utils/decryptClient";
import { handleSingleRoleDetailsAction } from "@/app/actions/rolesActions";
import { getToken } from "@/utils/getToken";
import PasswordStrengthChecker from "../PasswordStrengthChecker";
import { routeIds } from "@/utils/routeIds";
// import "@/styles/Login.scss";

const NewPassword = () => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passError, setPassError] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  const { details } = useSelector((state) => state.user);

  const token = searchParams.get("token");
  // console.log("user", details, token);

  const getEmailFromToken = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = { password_token: token };
    try {
      const result = await validatePassToken(csrfToken, reqbody);
      // console.log("Validate Token result:", result);
      if (result.success) {
        if (result?.status === 200) {
          const { iv, encryptedData } = result?.data;
          const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
          const decrypted = decryptClient(iv, encryptedData, key);
          // console.log("final", decrypted);
          setEmail(decrypted.email);
        }
      } else {
        setLoading(false);
        // Handle login error
        console.error("Validate Token error:", result.error);
        if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          }
        } else if (result.error.message.error_code === 500) {
          router.replace("/unauthorized");
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!details && token && !email) {
      setLoading(true);
      getEmailFromToken();
    }
  }, [token, details]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validation Schema for Reset Password Form
  const resetPasswordValidationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, t("login.pswd_descr"))
      .matches(/[A-Z]/, t("profile.400384"))
      .matches(/[a-z]/, t("profile.400385"))
      .matches(/[0-9]/, t("profile.400386"))
      .matches(/[@$!%*?&]/, t("profile.400387"))
      .required(t("login.400002"))
      .trim()
      .transform((value) => value?.trim()),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], t("login.400013"))
      .required(t("login.400002"))
      .trim()
      .transform((value) => value?.trim()),
  });

  const getPermissionsforUser = async (role_id) => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: role_id,
    };
    try {
      const result = await handleSingleRoleDetailsAction(csrfToken, reqbody);
      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final Permissions", decrypted);

        const processPermission = (decrypted, permissionId) => {
          // Find the permission based on the id
          const permission = decrypted.permissions.find(
            (perm) => perm.id === permissionId
          );

          // If permission exists and has children, return the children
          if (
            permission &&
            permission.children &&
            permission.children.length > 0
          ) {
            return permission.children.map((item) => ({
              id: item.id,
              label: item.name,
            }));
          }
          return [];
        };

        const processPermissionActions = (decrypted, permissionId) => {
          // Find the permission based on the id
          const permission = decrypted.permissions.find(
            (perm) => perm.id === permissionId
          );

          // If permission exists and has children, process the children
          if (
            permission &&
            permission.children &&
            permission.children.length > 0
          ) {
            return permission.children.flatMap((item) => {
              // Check if the current item has children
              if (item.children && item.children.length > 0) {
                return item.children.flatMap((action) => {
                  // Special case: if action.id is 16 or 17, map their children
                  if (
                    action.id === 16 ||
                    action.id === 17 ||
                    action.id === 59 ||
                    action.id === 60 ||
                    action.id === 61
                  ) {
                    return action.children && action.children.length > 0
                      ? action.children.map((childAction) => ({
                          id: childAction.id,
                          parent: childAction.parent_id,
                          gparent: item.id,
                          name: childAction.name,
                          details: childAction.details,
                        }))
                      : [];
                  }
                  // Default case: map the current action
                  return {
                    id: action.id,
                    parent: action.parent_id,
                    name: action.name,
                    details: action.details,
                  };
                });
              }
              return [];
            });
          }

          // Return an empty array if no permission or children exist
          return [];
        };

        if (decrypted?.permissions?.length > 0) {
          let userPermissions;
          let settingsSideNav = [];
          let leadSideNav = [];
          let settingsActions = [];
          let leadActions = [];
          let marketSideNav = [];
          let marketActions = [];

          let pages = decrypted?.permissions?.map((page) => ({
            id: page.id,
            name: page.name,
          }));

          // Process settings side navigation for permission id 2
          if (decrypted.permissions.some((perm) => perm.id === 2)) {
            settingsSideNav = processPermission(decrypted, 2);
            if (settingsSideNav.length > 0) {
              settingsActions = processPermissionActions(decrypted, 2);
            }
          }

          // Process leads side navigation for permission id 3
          if (decrypted.permissions.some((perm) => perm.id === 3)) {
            leadSideNav = processPermission(decrypted, 3);
            if (leadSideNav.length > 0) {
              leadActions = processPermissionActions(decrypted, 3);
            }
          }

          // Process Market reports side navigation for permission id 71
          if (decrypted.permissions.some((perm) => perm.id === 71)) {
            marketSideNav = processPermission(decrypted, 71);
            if (marketSideNav.length > 0) {
              marketActions = processPermissionActions(decrypted, 71);
            }
          }

          userPermissions = {
            pages,
            settingsSideNav,
            leadSideNav,
            settingsActions,
            leadActions,
            marketSideNav,
            marketActions,
          };
          dispatch(setPermissions(userPermissions));
          const pgids = decrypted?.permissions?.map((pg) => pg.id);
          // console.log("pgid", pgids);
          document.cookie = `pgperm=${pgids}; path=/; secure; samesite=strict;`;
          return pgids;
        } else {
          dispatch(setPermissions({}));
          document.cookie = `pgperm=""; path=/; secure; samesite=strict;`;
        }
      }
    } catch (error) {
      console.log("Unable to get permissions");
      console.error("Unexpected error:", error);
    }
  };

  const handleForgotPasswordSubmit = async (values) => {
    // console.log("values", values);
    setPassLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      email: details?.email ? details?.email : email,
      new_password: values.newPassword,
      password_token: details?.password_token ? details?.password_token : token,
    };
    try {
      const result = await handleResetPassword(csrfToken, reqbody);
      // console.log("Reset password result:", result);

      if (result.success) {
        if (result?.status === 200) {
          const { iv, encryptedData } = result?.data;
          const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
          const decrypted = decryptClient(iv, encryptedData, key);
          // console.log("final", decrypted);
          dispatch(setDetails(decrypted));

          // document.cookie = `sessionToken=${
          //   result?.data?.user?.session_token
          // }; path=/; max-age=${60 * 60 * 1}; samesite=strict;`;

          let rids = await getPermissionsforUser(decrypted.role.id);
          console.log("gg", rids);
          // router.push("/dashboard");
          if (rids.length > 0 && rids.includes(1)) {
            // Use await with router.push to ensure loader continues until navigation
            await new Promise((resolve) => {
              router.push("/dashboard", { scroll: false });
              resolve();
            });
          } else {
            console.log("hit");
            let routeTosend = routeIds[rids[0]];
            console.log("hit1", routeTosend);
            await new Promise((resolve) => {
              router.push(`${routeTosend}`, { scroll: false });
              resolve();
            });
          }
        }
      } else {
        // Handle login error
        console.error("Validate Token error:", result.error);
        setPassLoading(false);
        if (result.error.message.error_code === 500) {
          router.replace("/unauthorized");
        } else if (typeof result.error.message === "string") {
          setPassError(result.error.message);
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          }
          setPassError(errValues[0]);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setPassLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-side-content">
        <div className="login-side-card">
          <img
            src="/images/login_screen.png"
            alt="Login Template"
            style={{ width: "700px", height: "700px", padding: "15px 20px" }}
          />
        </div>
      </div>
      <div className="login-card">
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <CircularProgress size={50} sx={{ color: "#000" }} />
          </div>
        ) : (
          <>
            <div className="login-header">
              <h1>{t("login.set_pswd")}</h1>
              <p style={{ color: "#7D7D7D" }}>{t("login.pswd_descr")}</p>
              {passError && (
                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <Alert style={{ width: "fit-content" }} severity="error">
                    {passError}
                  </Alert>
                </div>
              )}
            </div>
            <Formik
              initialValues={{ newPassword: "", confirmNewPassword: "" }}
              validationSchema={resetPasswordValidationSchema}
              onSubmit={(values) => {
                handleForgotPasswordSubmit(values);
              }}
            >
              {({ errors, touched, values }) => (
                <Form
                  onFocus={() => (passError != null ? setPassError(null) : "")}
                >
                  <div className="form-group input-with-icon">
                    <label htmlFor="newPassword">
                      {t("login.new_pswd_lab")}
                    </label>
                    <div
                      className={`input-container ${
                        touched.newPassword && errors.newPassword
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <Field
                        id="new-password-pass-field"
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder={t("login.new_pswd_phldr")}
                        className={
                          touched.newPassword && errors.newPassword
                            ? "input-error"
                            : ""
                        }
                      />
                      {touched.newPassword && errors.newPassword && (
                        <span className="error-icon password">
                          <ErrorIcon />
                        </span>
                      )}
                      <span
                        id="new-password-visibility"
                        onClick={togglePasswordVisibility}
                        // className="eye-icon"
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

                  <div
                    className="form-group input-with-icon"
                    style={{ marginBottom: 20 }}
                  >
                    <label htmlFor="confirmNewPassword">
                      {t("login.confirm_new_pswd_lab")}
                    </label>
                    <div
                      className={`input-container ${
                        touched.newPassword && errors.newPassword
                          ? "has-error"
                          : ""
                      }`}
                    >
                      <Field
                        id="new-password-confirm-password"
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
                      {touched.confirmNewPassword &&
                        errors.confirmNewPassword && (
                          <span className="error-icon password">
                            <ErrorIcon />
                          </span>
                        )}
                      <span
                        id="new-password-confirm-visibility"
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

                  <div className="password-info">
                    <div className="info-container">
                      <InfoOutlined sx={{ color: "#757575" }} />
                      <div style={{ width: "100%" }}>
                        <span style={{ color: "#757575", fontSize: 12 }}>
                          <p style={{ margin: 0, maxWidth: 310 }}>
                            {t("profile.profile_change_password")}
                          </p>
                        </span>
                      </div>
                    </div>
                    {(values.newPassword.length > 0 ||
                      values.confirmNewPassword.length > 0) && (
                      <div className="pass-checker-container">
                        <PasswordStrengthChecker
                          password={values.newPassword}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    id="new-password-submit-btn"
                    type="submit"
                    className="login-button"
                  >
                    {passLoading ? (
                      <CircularProgress size={20} sx={{ color: "#000" }} />
                    ) : (
                      t("login.submit_pswd_btn")
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </>
        )}
      </div>
    </div>
  );
};

export default NewPassword;
