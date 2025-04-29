"use client";
import React, { useState } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { handleSingleRoleDetailsAction } from "@/app/actions/rolesActions";
import { decryptClient } from "@/utils/decryptClient";
import { setDetails, setPermissions } from "@/lib/slices/userSlice";
import { handleLoginAction } from "@/app/actions/authActions";
import * as Yup from "yup";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { VisibilityOff } from "@mui/icons-material";
import VisibilityIcon from "@/images/visibility.svg";

import { Alert, CircularProgress } from "@mui/material";
import ErrorIcon from "@/images/error.svg";
import { getToken } from "@/utils/getToken";
import { routeIds } from "@/utils/routeIds";

const LoginForm = ({ setIsForgotPassword }) => {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Validation Schema for Login Form
  const loginValidationSchema = Yup.object({
    email: Yup.string()
      .max(254, "Email should be less than 254 characters")
      .email(t("login.400003"))
      .required(t("login.400001"))
      .trim()
      .transform((value) => value?.trim()),
    password: Yup.string()
      // .min(8, t("login.pswd_descr"))
      // .max(16, "Password cannot be longer than 16 characters")
      .required(t("login.400002"))
      .trim()
      .transform((value) => value?.trim()),
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
          let reportSideNav = [];
          let settingsActions = [];
          let leadActions = [];
          let marketSideNav = [];
          let marketActions = [];
          let analysisSideNav = [];
          let analysisActions = [];
          let reportsActions = [];

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

          console.log("decrypted", decrypted);

          // Process Analysis side navigation for permission id 72
          if (decrypted.permissions.some((perm) => perm.id === 97)) {
            analysisSideNav = processPermission(decrypted, 97);
            if (analysisSideNav.length > 0) {
              analysisActions = processPermissionActions(decrypted, 97);
            }
          }

          if (decrypted.permissions.some((perm) => perm.id === 4)) {
            reportSideNav = processPermission(decrypted, 4);
            if (reportSideNav.length > 0) {
              reportsActions = processPermissionActions(decrypted, 4);
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
            analysisSideNav,
            analysisActions,
            reportSideNav,
            reportsActions,
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

  // Function to handle Login request
  const handleLoginSubmit = async (values) => {
    setLoginLoading(true);
    setLoginError(null);
    const csrfToken = await getCsrfToken();
    const reqbody = { email: values.email, password: values.password };
    try {
      const result = await handleLoginAction(csrfToken, reqbody);
      console.log("Login result:", result);

      if (result.success) {
        // Handle successful login
        if (result.status === 200) {
          const { iv, encryptedData } = result?.data;
          const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
          const decrypted = decryptClient(iv, encryptedData, key);
          // console.log("final login", decrypted);

          if (decrypted?.hasOwnProperty("first_name")) {
            if (!decrypted?.role && !decrypted?.role?.id) {
              setLoginError(
                "Incorrect user configuration, Kindly contact administrator!"
              );
              setLoginLoading(false);
              return;
            }
            dispatch(setDetails(decrypted));
            // document.cookie = `sessionToken=${
            //   result?.data?.session_token
            // }; path=/; max-age=${60 * 60 * 1}; secure; samesite=strict;`;

            let rids = await getPermissionsforUser(decrypted.role.id);
            // console.log("gg", rids);
            // router.push("/dashboard");
            if (rids?.length > 0 && rids?.includes(1)) {
              // Use await with router.push to ensure loader continues until navigation
              await new Promise((resolve) => {
                router.push("/dashboard", { scroll: false });
                resolve();
              });
            } else {
              // console.log("hit");
              let routeTosend = routeIds[rids[0]];
              // console.log("hit1", routeTosend);
              await new Promise((resolve) => {
                router.push(`${routeTosend}`, { scroll: false });
                resolve();
              });
            }
          } else {
            dispatch(setDetails({ email: values.email, ...decrypted }));
            // router.push("/newpassword");
            // Use await with router.push to ensure loader continues until navigation
            await new Promise((resolve) => {
              router.push("/newpassword", { scroll: false });
              resolve();
            });
          }
        }
      } else {
        // Handle login error
        console.error(result.error);
        // setLoginError(result.error.message.message);

        if (typeof result.error.message === "string") {
          setLoginError(result.error.message);
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          }
          setLoginError(errValues[0]);
        }
        setLoginLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoginLoading(false);
    }

    // console.log("values", values);

    // const cookieData =
    //   "iA5hP5HNNB7uWTbQAQDfC8NLpl6PV861bjV6j46jIt18QXyawPp8r0dpj3Ed";
    // localStorage.setItem("sessionToken", cookieData);
    // document.cookie = `sessionToken=${cookieData}; path=/; max-age=${
    //   60 * 60 * 24
    // }; samesite=strict;`;
    // // document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; secure; samesite=strict;`;
    // router.push("/dashboard");
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginValidationSchema}
      onSubmit={(values) => {
        handleLoginSubmit(values);
        // console.log("Email:", values.email);
        // console.log("Password:", values.password);
      }}
    >
      {({ errors, touched }) => (
        <Form onFocus={() => (loginError != null ? setLoginError(null) : "")}>
          {loginError && (
            <div
              style={{
                marginBottom: 10,
              }}
            >
              <Alert style={{ width: "fit-content" }} severity="error">
                {loginError}
              </Alert>
            </div>
          )}
          <div className="form-group input-with-icon">
            <label htmlFor="email">{t("login.email_lab")}</label>
            <div className="input-container">
              <Field
                id="login-form-email"
                type="email"
                name="email"
                placeholder={t("login.email_phldr")}
                className={touched.email && errors.email ? "input-error" : ""}
              />
              {touched.email && errors.email && (
                <span className="error-icon">
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

          <div className="form-group input-with-icon">
            <label htmlFor="password">{t("login.pswd_lab")}</label>
            <div className="input-container">
              <Field
                id="login-form-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("login.pswd_phldr")}
                className={
                  touched.password && errors.password ? "input-error" : ""
                }
              />
              {touched.password && errors.password && (
                <span className="error-icon password">
                  <ErrorIcon />
                </span>
              )}
              <span
                id="login-form-visibiltiy-btn"
                onClick={togglePasswordVisibility}
                className="toggle-password-visibility"
                // className="eye-icon"
              >
                {showPassword ? (
                  <VisibilityOff sx={{ color: "#C1C1C1" }} />
                ) : (
                  <VisibilityIcon />
                )}
              </span>
            </div>
            <ErrorMessage
              name="password"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <a
              id="login-form-forget-password-btn"
              href="#"
              style={{ color: "#7D7D7D" }}
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPassword(true);
              }}
            >
              {t("login.forgot_pswd")}
            </a>
          </div>
          <button
            id="login-form-submit-btn"
            type="submit"
            disabled={loginLoading}
            className="login-button"
          >
            {loginLoading ? (
              <CircularProgress size={20} sx={{ color: "#000" }} />
            ) : (
              t("login.submit_btn")
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
