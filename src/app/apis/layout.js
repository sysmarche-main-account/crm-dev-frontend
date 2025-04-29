"use client";
import React from "react";
import GlobalSpinner from "@/components/GlobalSpinner";
import { ActiveComponentProvider } from "../(context)/ActiveComponentProvider";
import HeaderNew from "@/components/Header/HeaderNew";

const Layout = ({ children }) => {
  return (
    <>
      <ActiveComponentProvider>
        <GlobalSpinner />
        <div className="app-container">
          <HeaderNew />
          <div className="main-content">
            <div className="content-area">{children}</div>
          </div>
        </div>
      </ActiveComponentProvider>
    </>
  );
};

export default Layout;
