"use client";
import React, { useEffect, useState } from "react";
import {
  ActiveComponentProvider,
  useActiveComponent,
} from "../(context)/ActiveComponentProvider";
import GlobalSpinner from "@/components/GlobalSpinner";
import HeaderNew from "@/components/Header/HeaderNew";
import { useSelector } from "react-redux";
import { reportsMap } from "@/utils/iconsAndComponents";
import SideNavBar from "@/components/SideNavBar/SideNavBar";

const Layout = ({ children }) => {
  const { permissions } = useSelector((state) => state.user);
  const { activeIndex, handleMenuClick } = useActiveComponent();

  const data = permissions?.reportSideNav?.map((nav) => {
    const mappedValues = reportsMap[nav.id];

    if (mappedValues) {
      return { ...nav, ...mappedValues };
    }

    return nav; // If no match is found, return the original nav object
  });

  console.log(data, "data");

  useEffect(() => {
    if (data?.length >= 0 && activeIndex === 0) {
      console.log(data, "40");
      handleMenuClick(data[0]?.component, 0);
    }
  }, [activeIndex]);

  return (
    <>
      <div className="app-container">
        <HeaderNew />
        <div className="main-content">
          <SideNavBar
            heading="Reports"
            data={data || []}
            onMenuClick={handleMenuClick}
            activeIndex={activeIndex}
          />
          <div className="content-area">{children}</div>
        </div>
      </div>
    </>
  );
};

const ReportsLayout = ({ children }) => {
  return (
    <>
      <ActiveComponentProvider>
        <GlobalSpinner />
        <Layout>{children}</Layout>
      </ActiveComponentProvider>
    </>
  );
};

export default ReportsLayout;
