"use client";
import React, { useState } from "react";
import EmailTemplates from "./Email/EmailTemplates";
import SmsTemplate from "./SMS/SmsTemplates";
import WhatsappTemplates from "./Whatsapp/WhatsappTemplates";
import CreateSmsModal from "./SMS/CreateSmsModal";
import CreateWhatsaapModal from "./Whatsapp/CreateWhatsaapModal";
import CreateEmailTemplate from "./Email/CreateEmailTemplate";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import EditEmailTemplate from "./Email/EditEmailTemplate";

const ManageTemplates = () => {
  const t = useTranslations();

  const { permissions } = useSelector((state) => state.user);

  const [selectedTab, setSelectedTab] = useState(0);

  const [isSmsModal, setIsSmsModal] = useState(false);

  const [isWhatsaapModal, setIsWhatsaapModal] = useState(false);

  const [isEmailModal, setIsEmailModal] = useState(false);
  const [isEmailEditModal, setIsEmailEditModal] = useState(false);

  const [selEmailTemp, setSelEmailTemp] = useState(null);

  const [bigLoading, setBigLoading] = useState(true);

  const [dataChange, setDataChange] = useState(false);

  const handleDataChange = () => setDataChange(!dataChange);

  const handleTabClick = (index) => {
    setSelectedTab(index);
  };

  const openSmsModal = () => {
    setIsSmsModal(true); // Open SMS modal
  };

  const closeSmsModal = () => {
    setIsSmsModal(false); // Close SMS modal
  };

  const openWhatsaapModal = () => {
    setIsWhatsaapModal(true); // Open WhatsApp modal
  };

  const closeWhatsaapModal = () => {
    setIsWhatsaapModal(false); // Close WhatsApp modal
  };

  const openEmailModal = () => {
    setIsEmailModal(true); // Open Email modal
  };

  const closeEmailModal = () => {
    setIsEmailModal(false); // Close Email modal
  };

  const openEmailEditModal = () => {
    if (selEmailTemp) {
      setIsEmailEditModal(true);
    }
  };
  const closeEmailEditModal = () => {
    setIsEmailEditModal(false);
    setSelEmailTemp(null);
  };

  const emailTemplatesSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 9 &&
        set.parent === 59 &&
        set.details === "single_action"
    );

  const smsTemplatesSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 9 &&
        set.parent === 60 &&
        set.details === "single_action"
    );

  const whatsappTemplatesSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 9 &&
        set.parent === 61 &&
        set.details === "single_action"
    );

  return (
    <div
      id="manage-roles-container"
      className="manage-roles-container email-templates"
    >
      {!isEmailModal && !isEmailEditModal ? (
        <>
          {/* Main ManageTemplates Content */}
          <div id="manager-roles-headers" className="manager-roles-headers">
            <div id="role-description" className="role-description">
              <h1 id="template-manage-title">
                {t("manage_template.mt_title")}
              </h1>
              <p id="template-manage-description">
                {t("manage_template.mt_despr")}
              </p>
            </div>
            {!bigLoading && (
              <div id="template-action-buttons" className="action-buttons">
                {emailTemplatesSingleActions?.length > 0 &&
                  emailTemplatesSingleActions?.some((act) => act.id === 62) &&
                  selectedTab === 0 && (
                    <button
                      id="template-manage-create-btn-email"
                      className="create-role-button"
                      onClick={openEmailModal}
                    >
                      {t("manage_template.mt_create_template_btn")}
                    </button>
                  )}
                {smsTemplatesSingleActions?.length > 0 &&
                  smsTemplatesSingleActions?.some((act) => act.id === 65) &&
                  selectedTab === 1 && (
                    <button
                      id="template-manage-create-btn-sms"
                      className="create-role-button"
                      onClick={openSmsModal}
                    >
                      {t("manage_template.mt_create_template_btn")}
                    </button>
                  )}
                {whatsappTemplatesSingleActions?.length > 0 &&
                  whatsappTemplatesSingleActions?.some(
                    (act) => act.id === 68
                  ) &&
                  selectedTab === 2 && (
                    <button
                      id="template-manage-create-btn-whatsapp"
                      className="create-role-button"
                      onClick={openWhatsaapModal}
                    >
                      {t("manage_template.mt_create_template_btn")}
                    </button>
                  )}
              </div>
            )}
          </div>

          <div id="template-tabs" className="template_tabs">
            {emailTemplatesSingleActions?.length > 0 && (
              <button
                id="template-manage-email-tab"
                className={selectedTab === 0 ? "active-tab" : ""}
                onClick={() => handleTabClick(0)}
              >
                {t("manage_template.mt_tabs_email")}
              </button>
            )}

            {smsTemplatesSingleActions?.length > 0 && (
              <button
                id="template-manage-sms-tab"
                className={selectedTab === 1 ? "active-tab" : ""}
                onClick={() => handleTabClick(1)}
              >
                {t("manage_template.mt_tabs_sms")}
              </button>
            )}

            {whatsappTemplatesSingleActions?.length > 0 && (
              <button
                id="template-manage-whatsapp-tab"
                className={selectedTab === 2 ? "active-tab" : ""}
                onClick={() => handleTabClick(2)}
              >
                {t("manage_template.mt_tabs_whatsapp")}
              </button>
            )}
          </div>

          {selectedTab === 0 && (
            <EmailTemplates
              bigLoading={bigLoading}
              setBigLoading={setBigLoading}
              dataChange={dataChange}
              handleDataChange={handleDataChange}
              openEmailEditModal={openEmailEditModal}
              setSelEmailTemp={setSelEmailTemp}
            />
          )}
          {selectedTab === 1 && (
            <SmsTemplate
              bigLoading={bigLoading}
              setBigLoading={setBigLoading}
              dataChange={dataChange}
              handleDataChange={handleDataChange}
            />
          )}
          {selectedTab === 2 && (
            <WhatsappTemplates
              bigLoading={bigLoading}
              setBigLoading={setBigLoading}
              dataChange={dataChange}
              handleDataChange={handleDataChange}
            />
          )}

          {/* Create SMS Modal */}
          {isSmsModal && (
            <div id="create-sms-modal-backdrop" className="modal-backdrop">
              <CreateSmsModal
                open={isSmsModal}
                onClose={closeSmsModal}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {/* Create WhatsApp Modal */}
          {isWhatsaapModal && (
            <div id="create-whatsapp-modal-backdrop" className="modal-backdrop">
              <CreateWhatsaapModal
                open={isWhatsaapModal}
                onClose={closeWhatsaapModal}
                handleDataChange={handleDataChange}
              />
            </div>
          )}
        </>
      ) : isEmailEditModal && !isEmailModal ? (
        <EditEmailTemplate
          open={isEmailEditModal}
          onClose={closeEmailEditModal}
          handleDataChange={handleDataChange}
          selectedTemplate={selEmailTemp}
        />
      ) : (
        // CreateEmailTemplate Modal Content
        <CreateEmailTemplate
          open={isEmailModal}
          onClose={closeEmailModal}
          handleDataChange={handleDataChange}
        />
      )}
    </div>
  );
};

export default ManageTemplates;
