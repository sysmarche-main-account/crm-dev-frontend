"use client";
import GlobalSpinner from "@/components/GlobalSpinner";
import { ActiveComponentProvider } from "../(context)/ActiveComponentProvider";
import HeaderNew from "@/components/Header/HeaderNew";

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <HeaderNew />
      <div className="main-content">
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
};

const AllNotificationLayout = ({ children }) => {
  return (
    <>
      <ActiveComponentProvider>
        <GlobalSpinner />
        <Layout>{children}</Layout>
      </ActiveComponentProvider>
    </>
  );
};

export default AllNotificationLayout;
