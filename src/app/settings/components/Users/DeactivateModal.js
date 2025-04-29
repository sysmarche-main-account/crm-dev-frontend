import React, { useState } from "react";
import TransferLeads from "./TransferLeads";
import CancelIcon from "@/images/cancel-right.svg";
import { useTranslations } from "next-intl";
// import "@/styles/ChangeOwners.scss";

const DeactivateModal = ({ onClose }) => {
  const t = useTranslations();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleAssignLeads = () => {
    setIsTransferModalOpen(true);
    onClose(); // Close the ChangeOwners modal when opening TransferLeads
  };

  const handleTransferModalClose = () => {
    setIsTransferModalOpen(false);
  };

  return (
    <>
      {!isTransferModalOpen && (
        <div
          className="modal-overlay-change-owners"
          id="modal-overlay-change-owners"
        >
          <div
            className="modal-content"
            style={{ width: "500px", height: "250px" }}
            id="modal-content-deactivate"
          >
            <button
              id="user-deactivate-close-btn"
              className="close-button"
              onClick={onClose}
            >
              &times;
            </button>
            <div className="modal-header" id="modal-header-deactivate">
              <div className="icon-container" id="icon-container-deactivate">
                <span
                  className="exclamation-icon"
                  id="exclamation-icon-deactivate"
                >
                  <CancelIcon />
                </span>
              </div>
              <div className="message" id="message-deactivate">
                <strong style={{ fontSize: "16px" }} id="deactivate-title">
                  {t("manage_user.mu_deactivate_title")}
                </strong>
                <br />
                <strong id="deactivate-content-question">
                  {t("manage_user.mu_deactivate_content_question")}
                </strong>
                <br />
                <span id="deactivate-content-desc">
                  {" "}
                  {t("manage_user.mu_deactivate_content_desc")}
                </span>
              </div>
            </div>
            <div className="modal-buttons" id="modal-buttons-deactivate">
              <button
                id="user-deactivate-cancel-btn"
                className="cancel-button"
                onClick={onClose}
              >
                {t("manage_user.mu_deactivate_cancel")}
              </button>
              <button
                id="user-deactivate-assignn-leads-btn"
                className="assign-button"
                onClick={handleAssignLeads}
              >
                {t("manage_user.mu_deactivate_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isTransferModalOpen && (
        <div className="transfer-leads-modal" id="transfer-leads-modal">
          <TransferLeads
            onClose={handleTransferModalClose}
            id="transfer-leads-component"
          />
        </div>
      )}
    </>
  );
};

export default DeactivateModal;
