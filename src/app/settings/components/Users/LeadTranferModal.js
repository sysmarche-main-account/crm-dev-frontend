import React from "react";
import Alerticon from "@/images/check-contained.svg";
import "@/styles/ChangeOwners.scss";
import { useTranslations } from "next-intl";

const LeadTransferModalConfirmation = ({
  type,
  open,
  onClose,
  handleDataChange,
}) => {
  // const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const t = useTranslations();

  const handleOkClick = () => {
    // setIsTransferModalOpen(false);
    onClose(); // This will close the LeadTranferModal
    handleDataChange();
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="modal-overlay-change-owners">
        <div className="modal-content">
          {/* <button className="close-button" onClick={onClose}>
            &times;
          </button> */}
          <div className="modal-header">
            <div className="icon-title">
              <div className="icon-container">
                <span
                  className="exclamation-icon"
                  style={{ backgroundColor: "#B1E4BF" }}
                >
                  <Alerticon />
                </span>
              </div>
              <div className="message">
                <h4>
                  {" "}
                  {type === "lead"
                    ? t("leadtransfermodal.leadsTransferred_Successfully")
                    : t("manage_user.mu_lead_transfer_success")}
                </h4>
                <p className="subtitle">
                  {t("leadtransfermodal.clickNextToContinue")}
                </p>
              </div>
            </div>
          </div>
          <div
            className="modal-buttons"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <button
              id="user-lead-transfer-ok-btn"
              className="assign-button"
              onClick={handleOkClick}
            >
              {t("leadtransfermodal.ok")}
            </button>
          </div>
        </div>
      </div>
      {/* {isTransferModalOpen && (
        <div className="transfer-leads-modal">
          <TransferLeads onClose={handleOkClick} />
        </div>
      )} */}
    </>
  );
};

export default LeadTransferModalConfirmation;
