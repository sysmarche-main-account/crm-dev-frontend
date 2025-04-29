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

const SingleChangeOwnerModal = ({ open, onClose, lead, handleDataChange }) => {
  console.log("leads", lead);
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
      universities: [lead?.university_interested?.id],
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

  const handleUpdateLead = async () => {
    console.log("lead", lead, selectedUser);
    setLoading((prev) => ({ ...prev, submit: true }));
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
      lead_owner: selectedUser, // from user tabel
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
        onClose();
        handleDataChange();
        showSnackbar({
          message: `${decrypted?.full_name} ${t(
            "change_owners.co_operation_completed"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
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

  return (
    <div id="map-roles-modal-user" className="map-roles-modal-user">
      <div id="modal-header-roles" className="modal-header-roles">
        <h2>Change Owner</h2>
        <div
          id="leads-bulk-change-owners-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div
        id="modal-body-scrollable"
        className="modal-body"
        style={{ overflowY: "scroll" }}
      >
        <div
          id="modal-content-user-section"
          className="modal-content-user-section"
        >
          <p>Change owner of lead here</p>
        </div>

        <div
          id="owner-selection-wrapper"
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <label>{t("followup.fuptc_select_owner")}</label>
          <div id="owner-search-box" className="search-box">
            <input
              id="leads-bulk-change-owners-main-search"
              style={{ width: "100%", maxWidth: "100%" }}
              type="text"
              placeholder={t("change_owners.co_search_placeholder")}
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
            />
            <div id="owner-search-icon" className="search-icon">
              <SearchIcon />
            </div>
          </div>

          <div id="user-list-scrollable" style={{ overflow: "auto" }}>
            {loading.users ? (
              <div
                id="loading-users-spinner"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: 400,
                }}
              >
                <CircularProgress size={50} color="#000" />
              </div>
            ) : users?.length === 0 ? (
              <div
                id="no-users-found-message"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: 400,
                }}
              >
                <h3>{t("change_owners.co_no_users_found")}</h3>
              </div>
            ) : (
              <>
                {users?.map((user) => (
                  <div
                    id={`user-entry-${user?.uuid}`}
                    key={user?.uuid}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <input
                      id={`leads-bulk-change-owners-checkbox-${user?.uuid}`}
                      style={{ height: 20, width: 20 }}
                      type="checkbox"
                      value={user?.uuid}
                      checked={selectedUser === user?.uuid}
                      onChange={() => handleSelecteUser(user?.uuid)}
                    />
                    <h3 style={{ fontWeight: "normal" }}>
                      {user?.first_name} {user?.last_name}
                    </h3>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div id="modal-footer-buttons" className="modal-footer">
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
          //   onClick={() => handleBulkChangeOwners()}
          onClick={() => handleUpdateLead()}
          className="map-role-button"
          disabled={selectedUser?.length === 0}
          style={{ marginRight: "20px" }}
        >
          {loading?.submit ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("change_owners.co_save")
          )}
        </Button>
      </div>
    </div>
  );
};

export default SingleChangeOwnerModal;
