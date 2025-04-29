"use client";
import {
  ActiveComponentProvider,
  useActiveComponent,
} from "../(context)/ActiveComponentProvider";
import { useTranslations } from "next-intl";
import SideNavBar from "@/components/SideNavBar/SideNavBar";
import { useEffect } from "react";
import GlobalSpinner from "@/components/GlobalSpinner";
import { useSelector } from "react-redux";
import { leadsMap } from "@/utils/iconsAndComponents";
import HeaderNew from "@/components/Header/HeaderNew";
import { useSearchParams, useRouter } from "next/navigation";

const Layout = ({ children }) => {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const router = useRouter();

  const t = useTranslations();
  const { permissions } = useSelector((state) => state.user);

  const data = permissions?.leadSideNav?.map((nav) => {
    const mappedValues = leadsMap[nav.id];

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

  useEffect(() => {
    if (from === "dashboardFollowup") {
      const followupNavObj = data?.find((item) => item.id === 39);
      if (followupNavObj) {
        handleMenuClick(followupNavObj?.component, 1);
      }
    }
  }, [from]);

  return (
    <div className="app-container">
      <HeaderNew />
      <div className="main-content">
        <SideNavBar
          heading={t("sidebar.leads")}
          data={data || []}
          onMenuClick={handleMenuClick}
          activeIndex={activeIndex}
        />
        <div className="content-area" style={{ height: "94vh" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const LeadLayout = ({ children }) => {
  return (
    <>
      <ActiveComponentProvider>
        <GlobalSpinner />
        <Layout>{children}</Layout>
      </ActiveComponentProvider>
    </>
  );
};

export default LeadLayout;
