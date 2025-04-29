"use client";
import { useEffect } from "react";
import GlobalSpinner from "@/components/GlobalSpinner";
import {
  ActiveComponentProvider,
  useActiveComponent,
} from "../(context)/ActiveComponentProvider";
import { useSelector } from "react-redux";
import SideNavBar from "@/components/SideNavBar/SideNavBar";
import { analyticsMap } from "@/utils/iconsAndComponents";
import HeaderNew from "@/components/Header/HeaderNew";

const Layout = ({ children }) => {
  const { permissions } = useSelector((state) => state.user);

  // console.log(permissions);

  const data = permissions?.analysisSideNav?.map((nav) => {
    const mappedValues = analyticsMap[nav.id];

    if (mappedValues) {
      return { ...nav, ...mappedValues };
    }

    return nav; // If no match is found, return the original nav object
  });

  const { activeIndex, handleMenuClick } = useActiveComponent();

  useEffect(() => {
    if (data?.length >= 0 && activeIndex === 0) {
      handleMenuClick(data[0]?.component, 0);
    }
  }, [activeIndex]);

  return (
    <div className="app-container">
      <HeaderNew />
      <div className="main-content">
        <SideNavBar
          heading="Analytics"
          data={data || []}
          onMenuClick={handleMenuClick}
          activeIndex={activeIndex}
        />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
};

const AnalyticsLayout = ({ children }) => {
  return (
    <>
      <ActiveComponentProvider>
        <GlobalSpinner />
        <Layout>{children}</Layout>
      </ActiveComponentProvider>
    </>
  );
};

export default AnalyticsLayout;
