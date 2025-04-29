"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Select,
  Box,
  CircularProgress,
} from "@mui/material";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import CloseIcon from "@/images/close-icon.svg";
import MoreVertIcon from "@/images/more_icon.svg";
import ChevronDown from "@/images/chevron-down.svg";
import EditFollow from "./EditFollow";
import CallIconWhite from "@/images/phone-call-white.svg";
import WhatsappWhite from "@/images/whatsapp-white.svg";
import EmailIconWhite from "@/images/email-white.svg";
import MessageIconWhite from "@/images/sms-white.svg";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { getReportingUserListAction } from "@/app/actions/userActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { decryptClient } from "@/utils/decryptClient";
import { getAllFollowupsAction } from "@/app/actions/followupActions";
import Modal from "@/components/common/Modal/Modal";
import { getToken } from "@/utils/getToken";
import FollowUpActionModal from "./FollowUpActionModal";

const FollowUpsModalForMultipleUsers = ({ onClose, eventDate }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const { permissions, details } = useSelector((state) => state.user);
  const t = useTranslations();

  const [loading, setLoading] = useState({
    data: false,
    reporting: false,
  });

  const [data, setData] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [reportingList, setReportingList] = useState(null);

  const [ownerSelect, setOwnerSelect] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedFollowup, setSelectedFollowup] = useState(null);

  const [actionAnchor, setActionAnchor] = useState(null);

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const getAllReportingUsers = async () => {
    setLoading((prev) => ({ ...prev, reporting: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // uuid: details?.uuid,
    };
    try {
      const result = await getReportingUserListAction(csrfToken, reqbody);
      // console.log("reporting user DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        setReportingList(decrypted);
        setLoading((prev) => ({ ...prev, reporting: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, reporting: false }));
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
      setLoading((prev) => ({ ...prev, reporting: false }));
    }
  };

  const getFollowupsForDate = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      pagination: {
        // page: page,
        per_page: "all",
      },
      filter: {
        search_term: "",
        owner: ownerSelect ? ownerSelect : "",
        date_filters: [
          {
            field: "follow_up_date_time",
            from: eventDate,
            to: eventDate,
          },
        ],
        field_filters: [
          // {
          //   field: "follow_up_mode",
          //   value: modeSelect ? modeSelect : "",
          // },
        ],
      },
      sorting: [
        //   {
        //     field: "created_at",
        //     order: "DESC",
        //   },
      ],
    };
    console.log("follow cal body", reqbody);

    try {
      const result = await getAllFollowupsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final calendar", decrypted);

        setData(decrypted?.data);
        setLoading((prev) => ({ ...prev, data: false }));
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
            errValues.map((errmsg) =>
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              })
            );
          }
        }
        setLoading((prev) => ({ ...prev, data: false }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  useEffect(() => {
    getAllReportingUsers();
  }, []);

  useEffect(() => {
    if (dataChanged) {
      getFollowupsForDate();
      handleDataChange();
    }
  }, [dataChanged]);

  useEffect(() => {
    if (eventDate) {
      getFollowupsForDate();
    }
  }, [eventDate, ownerSelect]);

  const handleMenuClick = (event, follow) => {
    setMenuAnchor(event.currentTarget);
    setSelectedFollowup(follow);
  };

  const handleMenuClose = () => {
    setMenuAnchor(false);
  };

  const openEditFollowModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditFollowModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditFollowup = () => {
    openEditFollowModal();
    handleMenuClose();
  };

  const openFollowActionModal = () => {
    setActionAnchor(true);
  };
  const closeFollowActionModal = () => {
    setActionAnchor(null);
    setSelectedFollowup(null);
  };

  const handleConfirmDelete = async () => {
    // const newFollowupArr = followups?.filter(
    //   (row) => row?.id !== selectedFollowup?.id
    // );
    // setFollowups(newFollowupArr);
    // setIsModalOpen(false);
    // handleDataChange();
    const csrfToken = await getCsrfToken();
    const reqbody = {
      follow_up_id: [selectedFollowup?.id],
    };
    console.log("body", reqbody);
    try {
      const result = await deletFollowupAction(csrfToken, reqbody);
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final followup delete", decrypted);

        if (!decrypted?.error) {
          setIsModalOpen(false);
          showSnackbar({
            message: decrypted?.message,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
          handleDataChange();
        } else {
          showSnackbar({
            message: decrypted?.message,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
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
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(
        `${t("followup.fup_del_title")} ${
          selectedFollowup?.lead_name?.full_name
        }?`
      );
      setModalContent(t("followup.fup_del_content"));
      setModalActions([
        {
          label: t("followup.fuptc_follow_up_modal_actions_cancel"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("followup.fup_del_btn"),
          className: "confirm-button",
          onClick: handleConfirmDelete,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    }
    handleMenuClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const followupListActions =
    permissions?.leadActions &&
    permissions?.leadActions.filter(
      (set) => set.parent === 39 && set.details === "list_action"
    );

  return (
    <div
      className="map-roles-modal-user"
      id="followup-multi-user-modal-container"
    >
      <div
        className="modal-header-roles"
        style={{ width: "45%" }}
        id="followup-multi-user-modal-header"
      >
        <div id="followup-multi-user-modal-title-container">
          <h2 id="followup-multi-user-modal-title">
            {t("followup.fupcal_title")}
          </h2>
        </div>

        {/* Reporting */}
        <div id="followup-multi-user-reporting-select-container">
          <Select
            id="followup-modal-multi-reporting"
            value={loading?.reporting ? "loading" : ownerSelect}
            onChange={(e) => setOwnerSelect(e.target.value)}
            displayEmpty
            IconComponent={ChevronDown}
            fullWidth
            style={{ width: "132px", height: "32px", fontSize: "14px" }}
          >
            <MenuItem value="">{t("leads.select_reporting_user")}</MenuItem>
            {loading?.reporting ? (
              <MenuItem disabled value="loading">
                <Box display="flex" alignItems="center">
                  <CircularProgress
                    size={20}
                    color="#000"
                    sx={{ marginRight: 1 }}
                  />
                  {t("editusermodal.loading")}
                </Box>
              </MenuItem>
            ) : reportingList?.length === 0 || !reportingList ? (
              <MenuItem disabled>{t("followup.fup_reporting_dd")}</MenuItem>
            ) : (
              reportingList?.length > 0 &&
              reportingList?.map((reporting) => (
                <MenuItem key={reporting?.uuid} value={reporting?.uuid}>
                  {reporting?.first_name} {reporting?.last_name}
                </MenuItem>
              ))
            )}
          </Select>
        </div>

        <div
          id="followup-modal-multi-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>

      <div
        className="modal-body"
        style={{ marginBottom: "70px", height: "-webkit-fill-available" }}
        id="followup-multi-user-modal-body"
      >
        <p id="followup-multi-user-event-date">
          {new Date(eventDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        {loading?.data ? (
          <div
            id="followup-multi-user-loading-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
              height: "100%",
            }}
          >
            <CircularProgress size={50} color="#000" />
          </div>
        ) : data && data.length > 0 ? (
          <div
            className="card-container-multiple-user"
            id="followup-multi-user-card-container"
          >
            {data?.map((follow) => (
              <div
                key={follow?.id}
                className={`card ${
                  follow?.action_status?.toLowerCase() === "delayed"
                    ? `incomplete`
                    : follow?.action_status?.toLowerCase() === "completed"
                    ? `complete`
                    : ``
                }`}
                id={`followup-card-${follow?.id}`}
              >
                <div
                  className="card-header"
                  id={`followup-card-header-${follow?.id}`}
                >
                  {/* <h3>{follow?.title}</h3> */}
                  <p id={`followup-card-details-${follow?.id}`}>
                    {follow?.details}
                  </p>
                  <span
                    className={`icon ${
                      follow?.action_status?.toLowerCase() === "delayed"
                        ? `incomplete`
                        : follow?.action_status?.toLowerCase() === "completed"
                        ? `complete`
                        : ``
                    }`}
                    id={`followup-card-icon-${follow?.id}`}
                  >
                    {follow?.follow_up_mode?.name?.toLowerCase() === "call" ? (
                      <CallIconWhite />
                    ) : follow?.follow_up_mode?.name?.toLowerCase() ===
                      "sms" ? (
                      <MessageIconWhite />
                    ) : follow?.follow_up_mode?.name?.toLowerCase() ===
                      "email" ? (
                      <EmailIconWhite />
                    ) : follow?.follow_up_mode?.name?.toLowerCase() ===
                      "whatsapp" ? (
                      <WhatsappWhite />
                    ) : null}
                  </span>
                </div>
                <div
                  className="card-body"
                  id={`followup-card-body-${follow?.id}`}
                >
                  {/* <p>{follow?.details}</p> */}
                  <div
                    className="details"
                    id={`followup-card-details-container-${follow?.id}`}
                  >
                    <div id={`followup-card-time-container-${follow?.id}`}>
                      <label>{t("followup.fupm_time_lab")}</label>
                      {/* <span>{follow?.follow_up_date_time?.split(" ")[1]}</span> */}
                      <span id={`followup-card-time-${follow?.id}`}>
                        {follow?.time}
                      </span>
                    </div>
                    <div id={`followup-card-date-container-${follow?.id}`}>
                      <label> {t("followup.fupm_fmu_date_value")}</label>
                      <span id={`followup-card-date-${follow?.id}`}>
                        {follow?.follow_up_date_time?.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                  <div
                    className="reminder"
                    id={`followup-card-reminder-container-${follow?.id}`}
                  >
                    <p id={`followup-card-reminder-text-${follow?.id}`}>
                      {t("followup.fupm_fmu_reminder_time_lab")}{" "}
                      <span id={`followup-card-reminder-value-${follow?.id}`}>
                        {follow?.reminder?.name}
                      </span>{" "}
                    </p>
                    <div id={`followup-card-lead-container-${follow?.id}`}>
                      <p id={`followup-card-lead-name-${follow?.id}`}>
                        {/* {t("followup.fupm_fmu_created_by_lab")}{" "} */}
                        Lead name:{" "}
                        <span
                          id={`followup-card-lead-name-value-${follow?.id}`}
                        >
                          {follow?.lead_name?.full_name}
                          {/* {follow.created_by?.first_name}{" "}
                          {follow.created_by?.last_name} */}
                        </span>
                      </p>
                      {follow?.action_status?.toLowerCase() !== "completed" && (
                        <p
                          id={`followup-modal-multi-${follow?.id}`}
                          className="icon"
                          onClick={(e) => handleMenuClick(e, follow)}
                        >
                          <MoreVertIcon />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            id="followup-multi-user-no-data-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexGrow: 1,
              height: "100%",
            }}
          >
            {t("followup.fup_multiuser_nofata")}
          </div>
        )}
      </div>

      <div
        className="modal-footer"
        style={{ padding: "10px 0px" }}
        id="followup-multi-user-modal-footer"
      >
        <Button
          id="followup-modal-multi-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("followup.fupm_close_btn")}
        </Button>
      </div>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: "20ch",
          },
        }}
        id="followup-multi-user-action-menu"
      >
        {followupListActions?.length > 0 ? (
          <div id="followup-multi-user-action-menu-container">
            {followupListActions?.some((act) => act.id === 51) && (
              <MenuItem
                id="followup-modal-multi-edit-btn"
                onClick={handleEditFollowup}
              >
                {t("followup.fupm_fmu_menu_edit")}
              </MenuItem>
            )}
            {followupListActions?.some((act) => act.id === 106) && (
              <MenuItem
                id="followup-table-followup-edit"
                onClick={() => {
                  handleMenuClose();
                  openFollowActionModal();
                }}
              >
                {t("followup.fupdm_title")}
              </MenuItem>
            )}
            {followupListActions?.some((act) => act.id === 52) && (
              <MenuItem
                id="followup-modal-multi-delete-btn"
                onClick={() => handleActionClick("Delete")}
              >
                {t("followup.fupm_fmu_menu_delete")}
              </MenuItem>
            )}
          </div>
        ) : (
          <MenuItem id="followup-multi-user-no-actions-item">
            {t("buttons.btn_no_action_allowed")}
          </MenuItem>
        )}
      </Menu>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={modalTitle}
          icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
          content={modalContent}
          actions={modalActions}
          id="followup-multi-user-confirmation-modal"
        />
      )}

      {isEditModalOpen && (
        <div
          className="modal-backdrop"
          id="followup-multi-user-edit-modal-backdrop"
        >
          <EditFollow
            onClose={closeEditFollowModal}
            data={selectedFollowup}
            handleDataChange={handleDataChange}
            id="followup-multi-user-edit-modal"
          />
        </div>
      )}

      {actionAnchor && (
        <div
          className="modal-backdrop"
          id="followup-multi-user-action-modal-backdrop"
        >
          <FollowUpActionModal
            onClose={closeFollowActionModal}
            lead={selectedFollowup?.lead_id}
            data={selectedFollowup}
            handleDataChange={handleDataChange}
            id="followup-multi-user-action-modal"
          />
        </div>
      )}
    </div>
  );
};

export default FollowUpsModalForMultipleUsers;
