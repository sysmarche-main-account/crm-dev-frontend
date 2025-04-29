import React from "react";
import ActivityTimeline from "./ActivityTimeline";
import CloseIcon from "@/images/close-icon.svg";
import { useTranslations } from "next-intl";

const ActivityModal = ({ open, onClose, lead }) => {
  const t = useTranslations();
  if (!open) {
    return null;
  }

  return (
    <div
      className="activity-modal-container"
      id="activity-modal-container" // Unique id for the outer modal container
    >
      <div
        className="modal-header-roles"
        id="activity-modal-header" // Unique id for the modal header section
      >
        <h2>{t("leads.at_activitytimeline")}</h2>
        <div
          id="leads-create-lead-cancel-btn" // Existing id, unchanged
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div
        className="activity-modal-body activity-modal"
        id="activity-modal-body" // Unique id for the modal body section
        style={{ overflowY: "scroll" }}
      >
        <ActivityTimeline data={lead} header={false} />
      </div>
    </div>
  );
};

export default ActivityModal;
