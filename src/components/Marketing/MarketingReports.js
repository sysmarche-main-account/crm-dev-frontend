"use client";
import React, { useState } from "react";
import UploadReports from "./UploadReports";
import DownloadReports from "./DownloadReports";
import UploadReportsModal from "./UploadReportsModal";
import DownloadReportsModal from "./DownloadReportsModal";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";

const MarketingReports = () => {
  const t = useTranslations();
  const { permissions } = useSelector((state) => state.user);

  const [selectedTab, setSelectedTab] = useState(0); // Track active tab (0: Upload, 1: Download)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false); // Upload modal state
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false); // Download modal state

  const [dataChange, setDataChange] = useState(false);

  const handleDataChange = () => setDataChange(!dataChange);

  const handleTabClick = (index) => {
    setSelectedTab(index);
  };

  const openUploadModal = () => {
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const openDownloadModal = () => {
    setDownloadModalOpen(true);
  };

  const closeDownloadModal = () => {
    setDownloadModalOpen(false);
  };

  const ruleSingleActions =
    permissions?.marketActions &&
    permissions?.marketActions?.filter(
      (set) => set.parent === 72 && set.details === "single_action"
    );

  return (
    <div className="manage-roles-container">
      {/* Header Section */}
      <div className="manager-roles-headers">
        <div className="role-description">
          <h1>{t("marketing.mktg_mr_title")}</h1>
          <p>{t("marketing.mktg_mr_subtitle")}.</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {ruleSingleActions?.some((rule) => rule.id === 77) &&
            selectedTab === 0 && (
              <button
                id="marketing-manage-upload-btn"
                className="create-role-button"
                onClick={openUploadModal}
              >
                {t("marketing.mktg_mr_btn_upload")}
              </button>
            )}

          {ruleSingleActions?.some((rule) => rule.id === 78) &&
            selectedTab === 1 && (
              <button
                id="marketing-manage-download-btn"
                className="create-role-button"
                onClick={openDownloadModal}
              >
                {t("marketing.mktg_mr_btn_download")}
              </button>
            )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs">
        {ruleSingleActions?.some((rule) => rule.id === 77) && (
          <button
            id="marketing-manage-upload-tab"
            className={`tab-button ${selectedTab === 0 ? "active-tab" : ""}`}
            onClick={() => handleTabClick(0)}
          >
            {t("marketing.mktg_mr_btn_upload")}
          </button>
        )}

        {ruleSingleActions?.some((rule) => rule.id === 78) && (
          <button
            id="marketing-manage-download-tab"
            className={`tab-button ${selectedTab === 1 ? "active-tab" : ""}`}
            onClick={() => handleTabClick(1)}
          >
            {t("marketing.mktg_mr_btn_download")}
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="content-section">
        {selectedTab === 0 && (
          <div className="upload-reports-container">
            <UploadReports key={dataChange} dataChange={dataChange} />
          </div>
        )}
        {selectedTab === 1 && (
          <div className="download-reports-container">
            <DownloadReports key={dataChange} dataChange={dataChange} />
          </div>
        )}
      </div>

      {/* Modals */}
      {isUploadModalOpen && (
        <div className="modal-backdrop">
          <UploadReportsModal
            onClose={closeUploadModal}
            open={openUploadModal}
            handleDataChange={handleDataChange}
          />
        </div>
      )}
      {isDownloadModalOpen && (
        <div className="modal-backdrop">
          <DownloadReportsModal
            onClose={closeDownloadModal}
            open={openDownloadModal}
            handleDataChange={handleDataChange}
          />
        </div>
      )}
    </div>
  );
};

export default MarketingReports;
