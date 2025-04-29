import React, { useEffect, useState } from "react";
import CloseIcon from "@/images/close-icon.svg";
import CancelIcon from "@/images/cancel-right.svg";
import ArrowIcon from "@/images/arrow-switch-horizontal.svg";
import SearchIcon from "@/images/search.svg";
import { useTranslations } from "next-intl";
import { Button, CircularProgress, Avatar } from "@mui/material";
import Modal from "@/components/common/Modal/Modal";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import LeadTransferModalConfirmation from "./LeadTranferModal";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import {
  getReportingUsersListAction,
  getUsersDDAction,
  handleEditUserAction,
} from "@/app/actions/userActions";
import { getToken } from "@/utils/getToken";

const ChangeReports = ({ singleUserData, onClose, handleDataChangeMain }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [loading, setLoading] = useState({
    users: false,
    managers: false,
    transfer: false,
  });

  const [users, setUsers] = useState(null);
  const [managers, setManagers] = useState(null);
  // const [managers, setManagers] = useState([
  //   { initials: "PP", name: "Piyush Pullarwar" },
  //   { initials: "AB", name: "Atharva Bhoir" },
  //   { initials: "VS", name: "Vaibhav Sharma" },
  //   { initials: "IM", name: "Ishita Mankar" },
  //   { initials: "PP", name: "Priya Pullarwar" },
  //   { initials: "PP", name: "Atharva Bhoir" },
  //   { initials: "PP", name: "Ishita Mohite" },
  //   { initials: "PP", name: "Piyush Pullarwar" },
  // ]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedManger, setSelectedManager] = useState([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");

  const [debouncedUserSearchTerm, setDebouncedUserSearchTerm] = useState("");
  const [debouncedManagerSearchTerm, setDebouncedManagerSearchTerm] =
    useState("");

  const [selectAllUsers, setSelectAllUsers] = useState(false);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const [dataChange, setDataChange] = useState(false);

  const handleDataChangeUser = () => setDataChange(true);

  const getReportingUsersList = async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: [singleUserData?.uuid],
      search: userSearchTerm,
    };

    try {
      const result = await getReportingUsersListAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("Reporting users list", decrypted);

        setUsers(decrypted);
        setLoading((prev) => ({ ...prev, users: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, users: false }));
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) =>
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              })
            );
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const getManagersList = async () => {
    setLoading((prev) => ({ ...prev, managers: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_type: ["Sales Manager"],
      universities: singleUserData?.universities?.map((uni) => uni.id),
      search: managerSearchTerm,
      status: "Active",
    };
    console.log("reqBody managers", reqbody);

    try {
      const result = await getUsersDDAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final Managers", decrypted);

        setManagers(decrypted);
        setLoading((prev) => ({ ...prev, managers: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, managers: false }));
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) =>
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              })
            );
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, managers: false }));
    }
  };

  useEffect(() => {
    getReportingUsersList();
    getManagersList();
  }, []);

  useEffect(() => {
    if (dataChange) {
      getReportingUsersList();
    }
  }, [dataChange]);

  useEffect(() => {
    getReportingUsersList();
  }, [debouncedUserSearchTerm]);

  useEffect(() => {
    getManagersList();
  }, [debouncedManagerSearchTerm]);

  // Debounce effect for userSearchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearchTerm(userSearchTerm);
    }, 550); // Adjust debounce delay as needed

    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [userSearchTerm]);

  // Debounce effect for managerSearchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedManagerSearchTerm(managerSearchTerm);
    }, 550); // Adjust debounce delay as needed

    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [managerSearchTerm]);

  useEffect(() => {
    if (users?.length === 0 || singleUserData?.reporting_user_count === 0) {
      setIsDeactivateModalOpen(true);
    }
  }, [singleUserData, users]);

  const handleUserSelect = (index) => {
    const isSelected = selectedUsers?.includes(index);
    setSelectedUsers((prevSelected) =>
      isSelected
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    );
  };

  const handleManagerSelect = (index) => {
    setSelectedManager([index]);
    // const isSelected = selectedManger.includes(index);
    // setSelectedManager((prevSelected) =>
    //   isSelected
    //     ? prevSelected.filter((i) => i !== index)
    //     : [...prevSelected, index]
    // );
  };

  const handleSelectAllUsers = () => {
    if (selectAllUsers) {
      setSelectedUsers([]); // Deselect all leads
    } else {
      setSelectedUsers(users.map((user) => user?.uuid)); // Select all filtered leads
    }
    setSelectAllUsers(!selectAllUsers);
  };

  const changeReportingManager = async (user, manager) => {
    console.log("user", user);
    setLoading((prev) => ({ ...prev, transfer: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: user?.uuid,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      mobile_number: user?.mobile_number,
      reporting_manager: manager,
      role_id: user?.role?.id,
      universities: user?.university?.map((uni) => uni?.id),
    };
    console.log("body submit", reqbody);

    try {
      const result = await handleEditUserAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final user reporting change", decrypted);
      } else {
        console.error(result.error);
        throw new Error(result.error || "Error in changing reporting manager");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      throw { error, user };
    }
  };

  const handleChangeReports = async () => {
    setLoading((prev) => ({ ...prev, transfer: true }));
    if (selectedUsers.length === 0 && selectedManger.length === 0) {
      showSnackbar({
        message: t("changereports.chgrep_alertmessages"),
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
      return;
    }

    if (selectedUsers.length === 0) {
      showSnackbar({
        message: t("changereports.chgrep_alertmessages_selectusers"),
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
      return;
    }

    if (selectedManger.length === 0) {
      showSnackbar({
        message: t("changereports.chgrep_alertmessages_selectmanager"),
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
      return;
    }

    const selectedUsersFull = users?.filter((item) =>
      selectedUsers.includes(item?.uuid)
    );
    console.log("final", selectedUsersFull);

    try {
      for (const user of selectedUsersFull) {
        await changeReportingManager(user, selectedManger[0]);
      }

      console.log("Done processing all leads.");
      setSelectedUsers([]);
      setSelectedManager([]);
      setLoading((prev) => ({ ...prev, transfer: false }));

      // Show the LeadTranferModal
      setIsConfirmationModalOpen(true);
      setDataChange(false);
    } catch (error) {
      console.error(
        `Error occurred while processing user: ${
          error.user?.uuid || "unknown"
        }`,
        error.error
      );

      // Notify user about the error
      showSnackbar({
        message: `An error occurred while processing user: ${
          error.user?.first_name || "unknown"
        }. Operation stopped.`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
    }
  };

  const handleDeactivateCancel = () => {
    onClose();
  };

  const handleConfirmDisable = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: singleUserData?.uuid,
      status: "Inactive",
    };

    //Logic to disable user
    try {
      const result = await handleEditUserAction(csrfToken, reqbody);
      // console.log("deactivate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        showSnackbar({
          message: `<strong>${decrypted.first_name} ${
            decrypted.last_name
          }</strong> ${t("manage_user.mu_chngrep_mu_trnsferlead_alert")}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        setIsDeactivateModalOpen(false);
        onClose();
        handleDataChangeMain();
      } else {
        console.error(result.error);
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) => {
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              });
            });
          }
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsModalOpen(false);
    }
  };

  return (
    <div
      className="transfer-modal-section"
      id="user-change-reports-transfer-modal-section"
    >
      <div className="change-details" id="user-change-reports-change-details">
        <div id="user-change-reports-header-texts">
          <h2 id="user-change-reports-header-title">
            {t("changereports.chgrep_header_title")}
          </h2>
          <h4 id="user-change-reports-header-subtitle">
            {t("changereports.chgrep_header_subtitle")}
          </h4>
        </div>
        <button
          id="user-change-reports-close-btn"
          className="close-btn"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="lists-container" id="user-change-reports-lists-container">
        <div className="list" id="user-change-reports-user-list">
          <h3 id="user-change-reports-user-list-title">
            {t("changereports.chgrep_list_usersyttle")}
          </h3>

          <div className="search-box" id="user-change-reports-user-search-box">
            <input
              id="user-change-reports-main-search"
              style={{ width: "80%" }}
              type="text"
              placeholder={t("changereports.chgrep_search")}
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
            <div
              className="search-icon"
              id="user-change-reports-user-search-icon"
            >
              <SearchIcon />
            </div>

            {users?.length > 0 && (
              <input
                id="user-change-reports-checkbox-all"
                type="checkbox"
                checked={selectAllUsers}
                onChange={handleSelectAllUsers}
              />
            )}
          </div>

          {loading.users ? (
            <div
              id="user-change-reports-user-loading"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress size={30} color="#000" />
            </div>
          ) : users?.length === 0 ? (
            <span id="user-change-reports-no-users-found">
              {t("change_owners.co_no_users_found")}
            </span>
          ) : (
            <ul id="user-change-reports-user-ul">
              {users?.map((user) => (
                <li
                  key={user?.uuid}
                  id={`user-change-reports-user-li-${user?.uuid}`}
                >
                  <label id={`user-change-reports-user-label-${user?.uuid}`}>
                    <div
                      className="detail-section"
                      id={`user-change-reports-user-detail-section-${user?.uuid}`}
                    >
                      {/* <span className="user-initials">
                      {user.initials}
                    </span>
                    <span> {user.name}</span> */}
                      <Avatar
                        className="user-avatar"
                        style={{ marginRight: "5px" }}
                        src={user?.profile_img}
                        alt={`${user?.first_name} ${user?.last_name}`}
                        id={`user-change-reports-user-avatar-${user?.uuid}`}
                      >
                        {!user?.profile_img &&
                        user?.first_name &&
                        user?.last_name
                          ? `${user?.first_name[0].toUpperCase()}${user?.last_name[0].toUpperCase()}`
                          : null}
                      </Avatar>
                      <span id={`user-change-reports-user-name-${user?.uuid}`}>
                        {user?.first_name} {user?.last_name}
                      </span>
                    </div>
                    <input
                      id={`user-change-reports-checkbox-${user?.uuid}`}
                      type="checkbox"
                      checked={selectedUsers?.includes(user?.uuid)}
                      onChange={() => handleUserSelect(user?.uuid)}
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="arrow reports" id="user-change-reports-arrow-icon">
          <span id="user-change-reports-arrow-span">
            <ArrowIcon />
          </span>
        </div>

        <div className="list" id="user-change-reports-manager-list">
          <h3 id="user-change-reports-manager-list-title">
            {t("changereports.chgrep_list_managerstitle")}
          </h3>

          <div
            className="search-box"
            id="user-change-reports-manager-search-box"
          >
            <input
              id="user-change-reports-manager-search"
              style={{ width: "100%" }}
              type="text"
              placeholder={t("changereports.chgrep_search")}
              value={managerSearchTerm}
              onChange={(e) => setManagerSearchTerm(e.target.value)}
            />
            <div
              className="search-icon"
              id="user-change-reports-manager-search-icon"
            >
              <SearchIcon />
            </div>
          </div>

          {loading.managers ? (
            <div
              id="user-change-reports-manager-loading"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress size={30} color="#000" />
            </div>
          ) : managers?.length === 0 ? (
            <span id="user-change-reports-no-managers-found">
              No Managers found.
            </span>
          ) : (
            <ul id="user-change-reports-manager-ul">
              {managers?.map((manager) => (
                <li
                  key={manager?.uuid}
                  id={`user-change-reports-manager-li-${manager?.uuid}`}
                >
                  <label
                    id={`user-change-reports-manager-label-${manager?.uuid}`}
                  >
                    <div
                      className="detail-section"
                      id={`user-change-reports-manager-detail-section-${manager?.uuid}`}
                    >
                      {/* <span className="manager-initials">
                      {manager.initials}
                    </span>
                    <span> {manager.name}</span> */}
                      <Avatar
                        className="user-avatar"
                        style={{ marginRight: "5px" }}
                        src={manager?.profile_img}
                        alt={`${manager?.first_name} ${manager?.last_name}`}
                        id={`user-change-reports-manager-avatar-${manager?.uuid}`}
                      >
                        {!manager?.profile_img &&
                        manager?.first_name &&
                        manager?.last_name
                          ? `${manager?.first_name[0].toUpperCase()}${manager?.last_name[0].toUpperCase()}`
                          : null}
                      </Avatar>
                      <span
                        id={`user-change-reports-manager-name-${manager?.uuid}`}
                      >
                        {manager?.first_name} {manager?.last_name}
                      </span>
                    </div>
                    <input
                      id={`user-change-reports-checkbox-${manager?.uuid}`}
                      type="checkbox"
                      checked={selectedManger?.includes(manager?.uuid)}
                      onChange={() => handleManagerSelect(manager?.uuid)}
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="modal-footer" id="user-change-reports-modal-footer">
        <Button
          id="user-change-reports-cancel-btn"
          className="cancel-button"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
        >
          {t("changereports.chgrep_btn_cancel")}
        </Button>
        <Button
          id="user-change-reports-submit-btn"
          className="save-btn"
          onClick={handleChangeReports}
          style={{ marginRight: "20px" }}
        >
          {loading.transfer ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("changereports.chgrep_btn_save")
          )}
        </Button>
      </div>

      {isConfirmationModalOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: "0 !important" }}
          id="user-change-reports-confirmation-modal-backdrop"
        >
          <LeadTransferModalConfirmation
            type="user"
            open={isConfirmationModalOpen}
            onClose={() => {
              setIsConfirmationModalOpen(false);
              if (users.length === 0) {
                setIsDeactivateModalOpen(true);
              }
            }}
            handleDataChange={handleDataChangeUser}
          />
        </div>
      )}

      {isDeactivateModalOpen && (
        <Modal
          isOpen={isDeactivateModalOpen}
          onClose={() => setIsDeactivateModalOpen(false)}
          title={t("changereports.chgrep_modal_deactivate_title")}
          subtitle={t("changereports.chgrep_modal_deactivate_subtitle")}
          icon={CancelIcon}
          content={t("changereports.chgrep_modal_deactivate_subtitle")}
          actions={[
            {
              label: t("changereports.chgrep_modal_deactivate_actions_cancel"),
              className: "cancel-button",
              onClick: handleDeactivateCancel,
            },
            {
              label: t("changereports.chgrep_modal_deactivate_actions_confirm"),
              className: "confirm-button",
              onClick: handleConfirmDisable,
            },
          ]}
        />
      )}
    </div>
  );
};

export default ChangeReports;
