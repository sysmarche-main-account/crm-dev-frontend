"use client";
import React, { useEffect, useState } from "react";
import { CircularProgress, Menu, MenuItem } from "@mui/material";
import { useTranslations } from "next-intl";
import MoreVertIcon from "@/images/more_icon.svg";
import GobackIcon from "@/images/chevron-left.svg";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import ActivityTimeline from "./ActivityTimeline";
import LeadDetailsView from "./LeadDetailsView";
import "@/styles/LeadDetails.scss";
import { useDispatch, useSelector } from "react-redux";
// import { useDispatch } from "@/lib/hooks";
import { setSingleLeadDisplay } from "@/lib/slices/leadSlice";
import EditSingleLead from "./EditSingleLead";
import Modal from "@/components/common/Modal/Modal";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  getAllLeadStatusAction,
  singleLeadDeleteAction,
  singleLeadDetailsAction,
} from "@/app/actions/leadActions";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import CreateFollow from "../FollowUps/CreateFollow";
import { getToken } from "@/utils/getToken";
import { useActiveComponent } from "@/app/(context)/ActiveComponentProvider";
import SingleChangeOwnerModal from "./SingleChangeOwnerModal";
import StageChangeModal from "./StageChangeModal";

const LeadDetails = ({ handleDataChange, lead, setViewLead }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { permissions } = useSelector((state) => state.user);
  // const { lead } = useSelector((state) => state.lead);

  const closedStatus = [
    "Enrolled",
    // "Enrollment from lead",
    // "Enrollment from walk-in",
    // "Enrollment from reference",
  ];

  if (!lead) {
    return null;
  }

  const t = useTranslations();
  const [dataLoading, setDataLoading] = useState(false);

  const [loading, setLoading] = useState({
    stages: false,
  });

  const [stageOptions, setStageOptions] = useState(null);
  const [subStageOptions, setSubStageOptions] = useState(null);

  const [leadData, setLeadData] = useState(null);

  const [selectedTab, setSelectedTab] = useState(0);

  const [menuAnchor, setMenuAnchor] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // *state to handle create followup modal.

  const [openEditLeadModal, setOpenEditLeadModal] = useState(false);

  const [singleChangeOwnerModal, setSingleChangeOwnerModal] = useState(false);

  const [selAction, setSelAction] = useState("");

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const getAllStagesOptions = async () => {
    setLoading((prev) => ({ ...prev, stages: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("stages DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final stages", decrypted);
        // console.log(
        //   "final substages",
        //   decrypted.flatMap((stage) => stage.children || [])
        // );

        setStageOptions(decrypted);
        setSubStageOptions(decrypted?.flatMap((stage) => stage.children));
        setLoading((prev) => ({ ...prev, stages: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, stages: false }));
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
      setLoading((prev) => ({ ...prev, stages: false }));
    }
  };

  useEffect(() => {
    getAllStagesOptions();
  }, []);

  const getSingleLeadDetails = async () => {
    setDataLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: lead,
    };
    try {
      const result = await singleLeadDetailsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        setLeadData(decrypted);
        setDataLoading(false);
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
        setDataLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (lead) {
      getSingleLeadDetails();
    }
  }, [lead]);

  const handleMenuClose = () => setMenuAnchor(null);

  const openCreateFollowModal = () => {
    setIsCreateModalOpen(true);
    handleMenuClose();
  };

  const closeCreateFollowModal = () => setIsCreateModalOpen(false); // function to close create followup

  const handleTabClick = (index) => {
    setSelectedTab(index);
  };

  const handleMenuBtnClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleEditClick = () => {
    setOpenEditLeadModal(true);
    handleMenuClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);

    // dispatch(setLead(null));
    // dispatch(setSingleLeadDisplay(false));
  };

  const handleConfirmDelete = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: [leadData?.id],
    };
    console.log("body", reqbody);
    try {
      const result = await singleLeadDeleteAction(csrfToken, reqbody);
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        if (!decrypted?.error) {
          handleModalClose();
          setViewLead(null);
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
    setSelAction(action);
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(t("leads.led_del_title"));
      setModalContent(t("leads.led_del_content"));
      setModalActions([
        {
          label: t("leads.csl_cancel_btn"),
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("leads.led_del_btn"),
          className: "confirm-button",
          onClick: handleConfirmDelete,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    } else if (action === "edit") {
      handleEditClick();
    } else if (action === "owner") {
      setSingleChangeOwnerModal(true);
    } else if (action === "state") {
      handleEditClick();
    }
    handleMenuClose();
  };

  const leadListActions =
    permissions?.leadActions &&
    permissions?.leadActions.filter(
      (set) => set.parent === 38 && set.details === "list_action"
    );

  return (
    <div className="lead-details-container" id="lead-details-container">
      {dataLoading || loading.stages ? (
        <div
          style={{
            height: "600px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          id="loading-container"
        >
          <CircularProgress size={85} color="#000" />
        </div>
      ) : (
        <>
          <div className="lead-details-header" id="lead-details-header">
            {/* <div className="lead-details-header-title">
              <Breadcrumbs aria-label="breadcrumb" className="bread-crums-details">
            <Link color="inherit" href="/leads">
              Leads
            </Link>
            <Link color="inherit" href="/leads">
              Manage leads
            </Link>
            <Typography color="text.primary" className="detailed-view">
              Detailed view
            </Typography>
          </Breadcrumbs>
            </div> */}
            <div className="go-back-section" id="go-back-section">
              <div
                id="leads-details-go-back-btn"
                className="go-back-icon"
                onClick={() => {
                  setViewLead(null);
                  // dispatch(setLead(null));
                  dispatch(setSingleLeadDisplay(false));
                  // handleMenuClick(<LeadManagement />, 0);
                }}
              >
                <GobackIcon />
              </div>
              <p>{t("leads.ld_go_back_section")}</p>
            </div>
            <div className="action-buttons" id="action-buttons">
              <button
                id="leads-details-menu-btn"
                className="icon-button"
                disabled={closedStatus.includes(leadData?.lead_status?.name)}
                onClick={(e) => {
                  if (!closedStatus.includes(leadData?.lead_status?.name)) {
                    handleMenuBtnClick(e);
                  }
                }}
              >
                <MoreVertIcon />
              </button>
            </div>
          </div>

          <div className="tabs" id="tabs-container">
            <button
              id="leads-details-overview-tab"
              className={selectedTab === 0 ? "active-tab" : ""}
              onClick={() => handleTabClick(0)}
            >
              {t("leads.ld_tabs_overview")}
            </button>
            <button
              id="leads-details-activity-tab"
              className={selectedTab === 1 ? "active-tab" : ""}
              onClick={() => handleTabClick(1)}
            >
              {t("leads.ld_tabs_activity")}
            </button>
          </div>

          {selectedTab === 0 && leadData && (
            <LeadDetailsView
              data={leadData}
              stageOptions={stageOptions}
              subStageOptions={subStageOptions}
            />
          )}
          {selectedTab === 1 && leadData && (
            <ActivityTimeline data={leadData} />
          )}

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            MenuListProps={{
              sx: {
                maxHeight: 400,
                width: "20ch",
              },
            }}
            id="action-menu"
          >
            {leadListActions?.some((lead) => lead.id === 41) && (
              <MenuItem
                id="leads-details-edit-btn"
                onClick={() => handleActionClick("edit")}
              >
                {t("leads.lm_menu_edit")}
              </MenuItem>
            )}
            {leadListActions?.some((lead) => lead.id === 56) && (
              <MenuItem
                id="leads-details-change-owner-btn"
                onClick={() => handleActionClick("owner")}
              >
                {t("leads.lm_menu_change_owner")}
              </MenuItem>
            )}
            {leadListActions?.some((lead) => lead.id === 57) && (
              <MenuItem
                id="leads-details-change-state-btn"
                onClick={() => handleActionClick("state")}
              >
                {t("leads.lm_menu_change_state")}
              </MenuItem>
            )}
            {/* {leadListActions?.some((lead) => lead.id === 45) && (
              <MenuItem onClick={handleEditClick}>
                {t("leads.lm_menu_transfer_lead")}
              </MenuItem>
            )} */}
            {leadListActions?.some((lead) => lead.id === 58) && (
              <MenuItem
                id="leads-details-followup-btn"
                onClick={openCreateFollowModal}
              >
                {t("leads.lm_menu_follow_up")}
              </MenuItem>
            )}
            {leadListActions?.some((lead) => lead.id === 42) && (
              <MenuItem
                id="leads-details-delete-btn"
                onClick={() => handleActionClick("Delete")}
              >
                {t("leads.lm_menu_del")}
              </MenuItem>
            )}
            {/* <MenuItem onClick={handleEditClick}>
              {t("leads.ld_lead_edit_btn")}
            </MenuItem>
            <MenuItem onClick={handleEditClick}>
              {t("leads.lm_menu_change_owner")}
            </MenuItem>
            <MenuItem onClick={handleEditClick}>
              {" "}
              {t("leads.ld_change_stage")}
            </MenuItem>
            <MenuItem onClick={() => {}}>
              {t("leads.lm_menu_transfer_lead")}
            </MenuItem>
            <MenuItem onClick={() => {}}>
              {t("leads.lm_menu_follow_up")}
            </MenuItem>
            <MenuItem onClick={() => handleActionClick("Delete")}>
              {t("leads.lm_menu_del")}
            </MenuItem> */}
          </Menu>

          {isModalOpen && (
            <Modal
              isOpen={isModalOpen}
              onClose={handleModalClose}
              title={modalTitle}
              icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
              content={modalContent}
              actions={modalActions}
              id="action-modal"
            />
          )}

          {isCreateModalOpen && (
            <div className="modal-backdrop" id="followup-modal-backdrop">
              <CreateFollow
                onClose={() => {
                  closeCreateFollowModal();
                  // setViewLead(null);
                  // dispatch(setLead(null));
                  // dispatch(setSingleLeadDisplay(false));
                  // handleMenuClick(<LeadManagement />, 0);
                }}
                selectedLead={leadData}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {/* {openEditLeadModal && (
            <div id="edit-lead-modal-container">
              <EditSingleLead
                open={openEditLeadModal}
                onClose={() => {
                  setOpenEditLeadModal(false);
                  // setViewLead(null);
                  // dispatch(setLead(null));
                  // dispatch(setSingleLeadDisplay(false));
                  // handleMenuClick(<LeadManagement />, 0);
                }}
                lead={leadData}
                action={selAction}
                handleDataChange={handleDataChange}
              />
            </div>
          )} */}

          {openEditLeadModal &&
            (selAction === "edit" || selAction === null) && (
              <div className="modal-backdrop" id="edit-lead-modal-backdrop">
                <EditSingleLead
                  open={openEditLeadModal}
                  onClose={() => setOpenEditLeadModal(false)}
                  action={selAction}
                  lead={leadData}
                  handleDataChange={handleDataChange}
                />
              </div>
            )}

          {openEditLeadModal && selAction === "state" && (
            <div className="modal-backdrop" id="stage-change-modal-backdrop">
              <StageChangeModal
                open={openEditLeadModal}
                onClose={() => setOpenEditLeadModal(false)}
                lead={leadData}
                handleDataChange={handleDataChange}
              />
            </div>
          )}

          {singleChangeOwnerModal && (
            <div
              className="modal-backdrop"
              id="single-owner-change-modal-backdrop"
            >
              <SingleChangeOwnerModal
                open={singleChangeOwnerModal}
                onClose={() => setSingleChangeOwnerModal(false)}
                lead={leadData}
                handleDataChange={handleDataChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeadDetails;
