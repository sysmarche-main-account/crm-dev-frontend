import React, { useState, useEffect } from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import useLogout from "@/app/hooks/useLogout";
import { useTranslations } from "next-intl";
import { Button, CircularProgress } from "@mui/material";
import CloseIcon from "@/images/close-icon.svg";
import SearchIcon from "@/images/search.svg";
import { getUsersDDAction } from "@/app/actions/userActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import { updateSingleLeadAction } from "@/app/actions/leadActions";

const BulkChangeOwnerModal = ({ open, onClose, leads, handleDataChange }) => {
  console.log("leads", leads);
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  if (!open) {
    return null;
  }

  const [loading, setLoading] = useState({
    users: false,
    submit: false,
  });

  const [users, setUsers] = useState(null);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedUserSearchTerm, setDebouncedUserSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState("");

  const getUsersList = async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      role_type: ["Counsellor"],
      universities: [leads[0]?.university_interested?.id],
      search: userSearchTerm,
      status: "Active",
    };
    console.log("reqBody counsellors", reqbody);

    try {
      const result = await getUsersDDAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final counsellors", decrypted);

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
            anchorOrigin: { vertical: "top", horizontal: "right" },
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
                anchorOrigin: { vertical: "top", horizontal: "right" },
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

  useEffect(() => {
    getUsersList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearchTerm(userSearchTerm);
    }, 550); // Adjust debounce delay as needed

    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [userSearchTerm]);

  useEffect(() => {
    getUsersList();
  }, [debouncedUserSearchTerm]);

  const handleSelecteUser = (id) => {
    if (selectedUser === id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(id);
    }
  };

  const handleUpdateLead = async (lead, user) => {
    console.log("lead", lead, user);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: lead?.id,
      full_name: lead?.full_name,
      mobile_number: lead?.mobile_number,
      dob: lead?.dob,
      email: lead?.email,
      alternate_email: lead?.alternate_email,
      university_interested: lead?.university?.id, //from master table
      program_interested: lead?.program_interested?.id, //from master table
      lead_channel: lead?.channel?.id, // from master table
      source_medium: lead?.source_medium?.id, //from master table
      lead_owner: user, // from user tabel
      pref_time_contact: lead?.pref_time_contact?.id, //from master table
      first_line_add: lead?.first_line_add,
      lead_status: lead?.lead_status?.id,
      lead_sub_status: lead?.lead_sub_status?.id,
      gender: lead?.gender,
      course: lead?.course?.id,
      country: lead?.country?.id, // master tabel
      state: lead?.state?.id, // master table
      city: lead?.city?.id, // master tabel
      pincode: lead?.pincode,
    };
    console.log("body submit", reqbody);

    try {
      const result = await updateSingleLeadAction(csrfToken, reqbody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
      } else {
        console.error(result.error);
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
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
                anchorOrigin: { vertical: "top", horizontal: "right" },
              })
            );
          }
        }
        setLoading((prev) => ({ ...prev, submit: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleBulkChangeOwners = async () => {
    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      for (const lead of leads) {
        try {
          // Attempt to update the lead owner
          await handleUpdateLead(lead, selectedUser);
        } catch (error) {
          console.error(`Error updating lead ${lead?.id || "unknown"}:`, error);

          // Notify user about the error for this specific lead
          showSnackbar({
            message: `${t("change_owners.co_failed_update")} ${
              lead?.id || "unknown"
            }: ${error.message || "Unknown error"}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
          });
        }
      }

      // If all leads have been processed, close modal and refresh data
      onClose();
      handleDataChange();
      showSnackbar({
        message: `${t("change_owners.co_operation_completed")}`,
        severity: "success",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
    } catch (globalError) {
      console.error(
        `Unexpected error during bulk owner change: ${
          globalError.message || "unknown"
        }`,
        globalError
      );

      // Notify user about the global error
      showSnackbar({
        message: `${t("change_owners.co_bulk_error")} ${
          globalError.message || "unknown"
        }`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  return (
    <div className="map-roles-modal-user" id="leads-bulk-change-owners-modal">
      <div
        className="modal-header-roles"
        id="leads-bulk-change-owners-modal-header"
      >
        <h2 id="leads-bulk-change-owners-modal-title">
          {t("change_owners.co_change_owners")}
        </h2>
        <div
          id="leads-bulk-change-owners-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon id="leads-bulk-change-owners-close-icon" />
        </div>
      </div>
      <div
        className="modal-body"
        style={{ overflowY: "scroll" }}
        id="leads-bulk-change-owners-modal-body"
      >
        <div
          className="modal-content-user-section"
          id="leads-bulk-change-owners-description"
        >
          <p id="leads-bulk-change-owners-description-text">
            {t("change_owners.co_edit_multiple_owners")}
          </p>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
          id="leads-bulk-change-owners-content-container"
        >
          <label id="leads-bulk-change-owners-select-label">
            {t("leads.at_selectowners")}
          </label>
          <div
            className="search-box"
            id="leads-bulk-change-owners-search-container"
          >
            <input
              id="leads-bulk-change-owners-main-search"
              style={{ width: "100%", maxWidth: "100%" }}
              type="text"
              placeholder={t("change_owners.co_search_placeholder")}
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
            <div
              className="search-icon"
              id="leads-bulk-change-owners-search-icon"
            >
              <SearchIcon id="leads-bulk-change-owners-search-icon-svg" />
            </div>
          </div>

          <div
            style={{ overflow: "auto" }}
            id="leads-bulk-change-owners-users-list-container"
          >
            {loading.users ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: 400,
                }}
                id="leads-bulk-change-owners-loading-container"
              >
                <CircularProgress
                  size={50}
                  color="#000"
                  id="leads-bulk-change-owners-loading-spinner"
                />
              </div>
            ) : users?.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: 400,
                }}
                id="leads-bulk-change-owners-no-users-container"
              >
                <h3 id="leads-bulk-change-owners-no-users-message">
                  {t("change_owners.co_no_users_found")}
                </h3>
              </div>
            ) : (
              <>
                {users?.map((user) => (
                  <div
                    key={user?.uuid}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 10,
                    }}
                    id={`leads-bulk-change-owners-user-row-${user?.uuid}`}
                  >
                    <input
                      id={`leads-bulk-change-owners-checkbox-${user?.uuid}`}
                      style={{ height: 20, width: 20 }}
                      type="checkbox"
                      value={user?.uuid}
                      checked={selectedUser === user?.uuid}
                      onChange={() => handleSelecteUser(user?.uuid)}
                    />
                    <h3
                      style={{ fontWeight: "normal" }}
                      id={`leads-bulk-change-owners-user-name-${user?.uuid}`}
                    >
                      {user?.first_name} {user?.last_name}
                    </h3>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="modal-footer" id="leads-bulk-change-owners-modal-footer">
        <Button
          id="leads-bulk-change-owners-cancel-btn"
          variant="outlined"
          onClick={onClose}
          className="cancel-button"
          style={{ marginLeft: "20px" }}
        >
          {t("change_owners.co_cancel")}
        </Button>

        <Button
          id="leads-bulk-change-owners-submit-btn"
          variant="contained"
          color="success"
          //   onClick={() => formikRefFollowUpModal.current.submitForm()}
          onClick={() => handleBulkChangeOwners()}
          className="map-role-button"
          disabled={selectedUser?.length === 0}
          style={{ marginRight: "20px" }}
        >
          {loading?.submit ? (
            <CircularProgress
              size={20}
              color="#000"
              id="leads-bulk-change-owners-submit-spinner"
            />
          ) : (
            t("change_owners.co_save")
          )}
        </Button>
      </div>
    </div>
  );
};

export default BulkChangeOwnerModal;
