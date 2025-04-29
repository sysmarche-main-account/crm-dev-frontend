import React, { useState } from "react";
import TransferLeads from "./TransferLeads";
import Alerticon from "@/images/alert-circle.svg";
import { useTranslations } from "next-intl";
// import "@/styles/ChangeOwners.scss";

const ChangeOwners = ({
  isOpen,
  onClose,
  singleUserData,
  handleDataChange,
}) => {
  if (!isOpen) return null;
  console.log("single", singleUserData);

  const t = useTranslations();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleAssignLeads = () => {
    setIsTransferModalOpen(true);
    // onClose(); // Close the ChangeOwners modal when opening TransferLeads
  };

  const handleTransferModalClose = () => {
    setIsTransferModalOpen(false);
    onClose();
  };

  return (
    <>
      {!isTransferModalOpen && (
        <div
          id="user-change-owners-modal-overlay"
          className="modal-overlay-change-owners"
        >
          <div id="user-change-owners-modal-content" className="modal-content">
            <button
              id="user-change-owners-close-btn"
              className="close-button"
              onClick={onClose}
            >
              &times;
            </button>
            <div id="user-change-owners-modal-header" className="modal-header">
              <div id="user-change-owners-icon-title" className="icon-title">
                <div
                  id="user-change-owners-icon-container"
                  className="icon-container"
                >
                  <span
                    id="user-change-owners-exclamation-icon"
                    className="exclamation-icon"
                  >
                    <Alerticon />
                  </span>
                </div>
                <div id="user-change-owners-message" className="message">
                  <h3>{t("change_owners.deactivate_user")}</h3>
                  <p>{t("manage_roles.mr_deactive_change_role")}</p>
                  {/* {singleUserData?.active_lead_count > 0 && (
                  <h4> {t("change_owners.leads_assigned")}</h4>
                )}
                {singleUserData?.reporting_user_count > 0 && (
                  <h4> {t("change_owners.users_reporting")}</h4>
                )} */}

                  {/* <p className="subtitle">
                  {t("change_owners.leads_assigned")}
                </p> */}
                </div>
              </div>
              <div id="user-change-owners-lead-counts">
                <ol id="user-change-owners-count-list">
                  {singleUserData?.active_lead_count > 0 ? (
                    <li id="user-change-owners-active-leads">
                      {/* There are{" "} */}
                      <strong>{singleUserData?.active_lead_count} </strong>
                      {t("change_owners.leads_assigned")}
                    </li>
                  ) : null}
                  {singleUserData?.reporting_user_count > 0 ? (
                    <li id="user-change-owners-reporting-users">
                      <strong>{singleUserData?.reporting_user_count} </strong>
                      {t("change_owners.users_reporting")}
                    </li>
                  ) : null}
                </ol>
              </div>
            </div>
            <div
              id="user-change-owners-modal-buttons"
              className="modal-buttons"
            >
              <button
                id="user-change-owners-cancel-btn"
                className="cancel-button"
                onClick={onClose}
              >
                {t("change_owners.cancel_button")}
              </button>
              <button
                id="user-change-owners-assign-leads"
                className="assign-button"
                onClick={handleAssignLeads}
              >
                {singleUserData?.active_lead_count > 0 &&
                singleUserData?.reporting_user_count <= 0
                  ? t("change_owners.assign_button")
                  : singleUserData?.active_lead_count <= 0 &&
                    singleUserData?.reporting_user_count > 0
                  ? t("change_owners.co_assign_mgnr_btn")
                  : t("change_owners.co_assign_btn")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isTransferModalOpen && (
        <div id="user-change-owners-transfer-modal" className="modal-backdrop">
          <TransferLeads
            onClose={handleTransferModalClose}
            singleUserData={singleUserData}
            isTransferModalOpen={isTransferModalOpen}
            setIsTransferModalOpen={setIsTransferModalOpen}
            handleDataChangeMain={handleDataChange}
          />
        </div>
      )}
    </>
  );
};

export default ChangeOwners;
