import React, { useState } from "react";
import Alerticon from "@/images/alert-circle.svg";
import { useTranslations } from "next-intl";
import AssignNewRolesModal from "./AssignNewRolesModal";
// import "@/styles/ChangeOwners.scss";

const ChangeRoles = ({
  isOpen,
  onClose,
  data,
  handleDataChange,
  DisableModalOpen,
}) => {
  if (!isOpen) return null;

  const t = useTranslations();

  const [isAssisgnRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);

  const handleAssignRoles = () => {
    setIsAssignRoleModalOpen(true);
  };

  const handleTransferModalClose = () => {
    setIsAssignRoleModalOpen(false);
    onClose();
  };

  return (
    <>
      {!isAssisgnRoleModalOpen && (
        <div
          className="modal-overlay-change-owners"
          id="modal-overlay-change-owners"
        >
          <div className="modal-content" id="modal-content">
            <button
              id="roles-manage-change-role-close-btn"
              className="close-button"
              onClick={onClose}
            >
              &times;
            </button>
            <div className="modal-header" id="modal-header">
              <div className="icon-title" id="icon-title">
                <div className="icon-container" id="icon-container">
                  <span className="exclamation-icon" id="exclamation-icon">
                    <Alerticon />
                  </span>
                </div>
                <div className="message" id="modal-message">
                  <h3>{t("manage_roles.mr_deactive_disable")}</h3>
                  <p>{t("manage_roles.mr_deactive_change_role")}</p>
                  {/* {data?.active_lead_count > 0 && (
                <h4> {t("change_owners.leads_assigned")}</h4>
              )}
              {data?.reporting_user_count > 0 && (
                <h4> {t("change_owners.users_reporting")}</h4>
              )} */}

                  {/* <p className="subtitle">
                {t("change_owners.leads_assigned")}
              </p> */}
                </div>
              </div>
              <div id="modal-description-list">
                <ol>
                  {data?.users?.length > 0 ? (
                    <li>
                      {/* There are{" "} */}
                      <strong>{data?.users?.length}</strong>{" "}
                      {t("manage_roles.mr_deacti_changerole_descr")}
                    </li>
                  ) : null}
                </ol>
              </div>
            </div>
            <div className="modal-buttons" id="modal-buttons">
              <button
                id="roles-manage-change-role-cancel-btn"
                className="cancel-button"
                onClick={onClose}
              >
                {t("change_owners.cancel_button")}
              </button>
              <button
                id="roles-manage-change-role-submit-btn"
                className="assign-button"
                onClick={handleAssignRoles}
              >
                {t("manage_roles.mr_deactive_assign_btn")}
              </button>
            </div>
          </div>
        </div>
      )}
      {isAssisgnRoleModalOpen && (
        <AssignNewRolesModal
          open={isAssisgnRoleModalOpen}
          onClose={() => handleTransferModalClose()}
          data={data}
          handleDataChangeMain={handleDataChange}
          DisableModalOpen={DisableModalOpen}
        />
      )}
    </>
  );
};

export default ChangeRoles;
