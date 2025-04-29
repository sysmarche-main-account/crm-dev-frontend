"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import MainLogo from "@/images/logoMain.svg";
import ForgetPasswordForm from "./ForgotPasswordForm";
import LoginForm from "./LoginForm";
import { Main } from "next/document";
// import CheckIcon from "@/images/check-contained.svg";
// import { setCookie } from "cookies-next";
// import Grid from "@mui/material/Grid2";
// import { CircularProgress, TextField } from "@mui/material";
// import { HighlightOff } from "@mui/icons-material";
// import "@/styles/Login.scss";

const Login = () => {
  const t = useTranslations();
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // const changeLocale = (newLocale) => {
  //   setCookie("locale", newLocale); // Store the selected locale in a cookie
  //   router.refresh(); // Reload the page to apply the new locale
  // };

  return (
    <>
      <div className="login-container">
        <div className="login-side-content">
          <div className="login-side-card">
            <img
              // src="/images/login_screen.png"
              src="/images/login_screen_new.png"
              alt="Login Template"
              style={{
                width: "700px",
                height: "700px",
                padding: "15px 20px",
              }}
            />
          </div>
        </div>
        <div className="login-card">
          <div className="login-header">
            <MainLogo />
            {/* <div>
            <button onClick={() => changeLocale("en")}>English</button>
            <button onClick={() => changeLocale("hn")}>Hindi</button>
          </div> */}
            <h1>
              {isForgotPassword
                ? t("login.forgot_pswd")
                : t("login.welcome_msg")}
            </h1>
            <p style={{ color: "#7D7D7D" }}>
              {isForgotPassword
                ? t("login.forgot_pswd_descr")
                : t("login.login_descr")}
            </p>
          </div>
          {isForgotPassword ? (
            <ForgetPasswordForm setIsForgotPassword={setIsForgotPassword} />
          ) : (
            <LoginForm setIsForgotPassword={setIsForgotPassword} />
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
