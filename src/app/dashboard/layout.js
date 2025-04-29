"use client";
import GlobalSpinner from "@/components/GlobalSpinner";
import { ActiveComponentProvider } from "../(context)/ActiveComponentProvider";
import HeaderNew from "@/components/Header/HeaderNew";

const DashboardLayout = ({ children }) => {
  return (
    <ActiveComponentProvider>
      <GlobalSpinner />
      <div className="app-container">
        <HeaderNew />
        <div className="content-area" style={{ padding: 0 }}>
          {children}
        </div>
      </div>
    </ActiveComponentProvider>
  );
};

export default DashboardLayout;
