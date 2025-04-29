"use client";
import React, { useState } from "react";
import SettingIcon from "@/images/settings.svg";
import RoleTable from "./ManageRolesTab/RoleTable";
import ImportUserModal from "./ImportUserModal";
import { useTranslations } from "next-intl";
import { Menu, MenuItem } from "@mui/material";
import { useSelector } from "react-redux";
import AssignedRolesTable from "./RoleMappingTab/AssignedRolesTable";

const ManageRoles = () => {
  const t = useTranslations();

  const { permissions } = useSelector((state) => state.user);

  const [selectedTab, setSelectedTab] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [importModal, setImportModal] = useState(false);

  const [isMapRolesOpen, setIsMapRolesOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const [bulkDisable, setBulkDisable] = useState(false);
  const [bulkEnable, setBulkEnable] = useState(false);
  const [bulkDelete, setBulkDelete] = useState(false);

  const handleTabClick = (index) => {
    setSelectedTab(index);
    setBulkDisable(false);
    setBulkEnable(false);
    setBulkDelete(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const openImportModal = () => {
    setImportModal(true); // Set importModal to true to open the ImportUserModal component
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeImportModal = () => {
    setImportModal(false); // Set importModal to false to close the ImportUserModal component
  };

  const openMapRoles = () => {
    setIsMapRolesOpen(true);
  };

  const closeMapRoles = () => {
    setIsMapRolesOpen(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action) => {
    handleMenuClose();
    if (action === "import") {
      openImportModal(); // Open the ImportUserModal modal when "import" is clicked
    }
  };

  const manageRoleSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 8 &&
        set.parent === 16 &&
        set.details === "single_action"
    );

  const manageRoleBulkActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 8 && set.parent === 16 && set.details === "bulk_action"
    );

  const manageRoleMapSingleActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 8 &&
        set.parent === 17 &&
        set.details === "single_action"
    );

  const manageRoleMapBulkActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter(
      (set) =>
        set.gparent === 8 && set.parent === 17 && set.details === "bulk_action"
    );

  return (
    <div className="manage-roles-container" id="manage-roles-container">
      <div className="manager-roles-headers" id="manage-roles-headers">
        <div className="role-description" id="manage-roles-role-description">
          <h1>{t("manage_roles.title")}</h1>
          <p>{t("manage_roles.descr")}</p>
        </div>
        <div className="action-buttons" id="manage-roles-action-buttons">
          {/* {((manageRoleBulkActions?.length > 0 && selectedTab === 0) ||
        (manageRoleMapBulkActions?.length > 0 && selectedTab === 1)) && (
        <button className="action-button" onClick={handleMenuClick}>
          <SettingIcon />
          {t("manage_roles.action_btn")}
        </button>
      )} */}
          {manageRoleMapBulkActions?.length > 0 && selectedTab === 1 && (
            <button
              id="manage-roles-bulk-actions"
              className="action-button"
              onClick={handleMenuClick}
            >
              <SettingIcon />
              {t("manage_roles.action_btn")}
            </button>
          )}

          {/* Bulk Menu */}
          <Menu
            id="manage-roles-bulk-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {/* {manageRoleBulkActions?.length > 0 && selectedTab === 0 && (
          <div>
            {manageRoleBulkActions?.some((act) => act.id === 32) && (
              <MenuItem
                onClick={() => {
                  setBulkDisable(!bulkDisable);
                  handleMenuClose();
                }}
              >
                {t("manage_roles.mr_deactive_disable")}
              </MenuItem>
            )}
            {manageRoleBulkActions?.some((act) => act.id === 54) && (
              <MenuItem
                onClick={() => {
                  setBulkEnable(!bulkEnable);
                  handleMenuClose();
                }}
              >
                Enable Role 
              </MenuItem>
            )}
            {manageRoleBulkActions?.some((act) => act.id === 33) && (
              <MenuItem
                onClick={() => {
                  setBulkDelete(!bulkDelete);
                  handleMenuClose();
                }}
              >
                Delete Role
              </MenuItem>
            )}
          </div>
        )} */}

            {manageRoleMapBulkActions?.length > 0 && selectedTab === 1 && (
              <div id="manage-roles-map-bulk-menu-options">
                {manageRoleMapBulkActions?.some((act) => act.id === 37) && (
                  <MenuItem
                    id="manage-roles-bulk-delete"
                    onClick={() => {
                      setBulkDelete(!bulkDelete);
                      handleMenuClose();
                    }}
                  >
                    {t("manage_roles.mr_assign_tbl_delmdl_title")}
                  </MenuItem>
                )}
              </div>
            )}
          </Menu>

          {/* Conditionally render the buttons based on selected tab */}
          {manageRoleSingleActions?.length > 0 &&
            manageRoleSingleActions?.some((act) => act.id === 28) &&
            selectedTab === 0 && (
              <button
                id="manage-roles-single-tab"
                className="create-role-button"
                onClick={openModal}
              >
                {t("manage_roles.mr_new_role_btn")}
              </button>
            )}
          {manageRoleMapSingleActions?.length > 0 &&
            manageRoleMapSingleActions?.some((act) => act.id === 34) &&
            selectedTab === 1 && (
              <button
                id="manage-roles-mapping-single-tab"
                className="create-role-button"
                onClick={openMapRoles}
              >
                {t("manage_roles.mr_map_roles")}
              </button>
            )}
        </div>
      </div>

      <div className="tabs" id="manage-roles-tabs">
        {manageRoleSingleActions?.length > 0 && (
          <button
            id="manage-roles-action-tab"
            className={selectedTab === 0 ? "active-tab" : ""}
            onClick={() => handleTabClick(0)}
          >
            {t("manage_roles.mr_1_tab")}
          </button>
        )}

        {manageRoleMapSingleActions?.length > 0 && (
          <button
            id="manage-roles-mapping-tab"
            className={selectedTab === 1 ? "active-tab" : ""}
            onClick={() => handleTabClick(1)}
          >
            {t("manage_roles.mr_2_tab")}
          </button>
        )}
      </div>

      {selectedTab === 0 && (
        <div id="manage-roles-role-table-wrapper">
          <RoleTable
            isModalOpenCreate={isModalOpen}
            closeModal={closeModal}
            alert={alert}
            openModal={openModal}
            bulkDisable={bulkDisable}
            bulkEnable={bulkEnable}
            bulkDelete={bulkDelete}
            setBulkDisable={setBulkDisable}
            setBulkEnable={setBulkEnable}
            setBulkDelete={setBulkDelete}
          />
        </div>
      )}
      {selectedTab === 1 && (
        <div id="manage-roles-assigned-role-table-wrapper">
          <AssignedRolesTable
            open={isMapRolesOpen}
            onClose={closeMapRoles}
            bulkDelete={bulkDelete}
            setBulkDelete={setBulkDelete}
          />
        </div>
      )}

      {/* Render ImportUserModal modal when importModal is true */}
      {importModal && (
        <div className="modal-backdrop" id="manage-roles-import-modal-backdrop">
          <ImportUserModal open={importModal} onClose={closeImportModal} />
        </div>
      )}
    </div>
  );
};

export default ManageRoles;
