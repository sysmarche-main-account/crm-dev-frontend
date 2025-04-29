"use client";
import React, { useEffect, useState } from "react";
import Social from "@/images/Socials.svg";
import CallIcon from "@/images/phone-call-01.svg";
import EmailIcon from "@/images/email.svg";
import MessageIcon from "@/images/message-chat-01.svg";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { deepPurple } from "@mui/material/colors";
import { Box, Chip } from "@mui/material";
import FollowUpDirectModal from "../FollowUps/FollowUpDirectModal";
import { useTranslations } from "next-intl";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { handleCallAction } from "@/app/actions/communicationAction";
import { useSelector } from "react-redux";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import useLogout from "@/app/hooks/useLogout";
import { decryptClient } from "@/utils/decryptClient";
import { masterDDAction } from "@/app/actions/commonActions";

const LeadDetailsView = ({ data, stageOptions, subStageOptions }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  console.log("data", data);

  const { details } = useSelector((state) => state.user);
  // console.log("data", data);
  const [selectedFollowUpMode, setSelectedFollowUpMode] = useState("");

  const [dataChanged, setDataChanged] = useState(false);
  const handleDataChange = () => setDataChanged(!dataChanged);

  const getVirtualNumber = async (uniId) => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["virtual_number"], // mandatory input will be an array
      parent_id: uniId, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final virtual", decrypted);

        return decrypted;
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
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleCall = async () => {
    const csrfToken = await getCsrfToken();
    const virtualNumber = await getVirtualNumber(
      data?.university_interested?.id
    );
    const reqbody = {
      // provider_id: "q2e7fc61-0fac-5b26-84eb-e0f0d3d676bd", // optional
      user_id: details?.uuid,
      from: details?.mobile_number, // mandatory
      // to: [selectedLead?.mobile_number], // mandatory
      to: [`${data?.mobile_number}`], // mandatory
      virtual_number: virtualNumber[0]?.name, // mandatory
      lead_id: data?.id, //mandatory
      // follow_up_id: 90, //optional
      // custom_field: "bilbo_test_call", // optional
    };
    console.log("call", reqbody);

    try {
      const result = await handleCallAction(csrfToken, reqbody);
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final call", decrypted);

        if (!decrypted?.error && decrypted?.transaction_id) {
          showSnackbar({
            message: "Call Initated, please check your phone!",
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

  const openModal = (mode) => {
    // console.log(mode, "followUpMode");
    if (mode?.toLowerCase() === "call") {
      handleCall();
    } else {
      setSelectedFollowUpMode(mode);
    }
  };

  const closeModal = () => {
    setSelectedFollowUpMode(null); // Reset the follow-up mode to close the modal
  };

  const getModalConfig = (followUpMode) => {
    switch (followUpMode) {
      case "whatsapp":
        return {
          title: `${t("followup.fuptc_follow_up_action")} (WhatsApp)`,
          radioOptions: [
            {
              value: `${data?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${data?.alternate_mobile_number}`,
              label: "Alternate Number",
              color: "green",
            },
          ],
        };
      case "email":
        return {
          title: `${t("followup.fuptc_follow_up_action")} (Email)`,
          radioOptions: [
            {
              value: `${data?.email}`,
              label: t("followup.fup_tbl_mdlconf_chekbox"),
              color: "green",
            },
            {
              value: `${data?.alternate_email}`,
              label: t("followup.fup_tbl_chekbox"),
              color: "#7d7d7d",
            },
          ],
        };
      case "sms":
        return {
          title: `${t("followup.fuptc_follow_up_action")} (SMS)`,
          radioOptions: [
            {
              value: `${data?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${data?.alternate_mobile_number}`,
              label: "Alternate Number",
              color: "green",
            },
          ],
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div className="lead-details" id="lead-details-main">
        {/* Lead Information */}
        <div className="lead-details__info" id="lead-details-info">
          <div
            className="lead-details__overview"
            id="lead-details-overview"
            // style={{ display: "flex", alignItems: "center" }}
          >
            <div className="lead-details__avatar" id="lead-details-avatar">
              <div id="avatar-container">
                <Stack direction="row" spacing={2}>
                  <Avatar
                    sx={{ bgcolor: deepPurple[500], width: 80, height: 80 }}
                  >
                    {`${data?.full_name
                      ?.charAt(0)
                      .toUpperCase()}${data?.full_name
                      .charAt(data?.full_name.length - 1)
                      .toUpperCase()}`}
                  </Avatar>
                </Stack>
              </div>
              <div
                id="lead-name-container"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  {data?.full_name}
                </h2>
                <p
                  style={{
                    margin: 0,
                  }}
                >
                  {data?.city && `${data?.city}, `}
                  {data?.state && `${data?.state}, `}
                  {data?.country && `${data?.country}`}
                </p>
              </div>
            </div>

            <div className="lead-details__icons" id="lead-details-icons">
              <button
                id="leads-details-view-call-btn"
                className="icon-btn"
                onClick={() => openModal("call")}
                title={data?.mobile_number}
              >
                <CallIcon />
              </button>
              <button
                id="leads-details-view-email-btn"
                className="icon-btn"
                onClick={() => openModal("email")}
                title={data?.email}
              >
                <EmailIcon />
              </button>
              <button
                id="leads-details-view-sms-btn"
                className="icon-btn"
                onClick={() => openModal("sms")}
                title={data?.mobile_number}
              >
                <MessageIcon />
              </button>
              {/* <button
                id="leads-details-view-whatsapp-btn"
                className="icon-btn"
                onClick={() => openModal("whatsapp")}
                title={data?.mobile_number}
              >
                <Social />
              </button> */}
            </div>
          </div>

          <div
            className="lead-details__personal-details"
            id="lead-preference-details"
          >
            <h3>{t("leads.ldv_lead_preference_title")}</h3>
            <div
              id="preference-details-container"
              style={{
                width: "100%",
                display: "flex",
                gap: "20px",
                justifyContent: "space-between",
                // flexWrap: "wrap",
              }}
            >
              <div
                className="prefernce_titles_container"
                id="course-preference-container"
              >
                <p>
                  <span style={{ color: "#7D7D7D" }}>
                    {t("rules.rules_create_course")}:
                  </span>{" "}
                  <br />
                  {data?.course?.name || "-"}
                </p>
              </div>
              <div
                className="prefernce_titles_container"
                id="university-preference-container"
              >
                <p>
                  <span style={{ color: "#7D7D7D" }}>
                    {t("leads.ldv_lead_preference_univ")}:
                  </span>
                  <br />
                  {data?.university_interested?.name || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Details Side Info */}
        <div className="lead_details_section" id="lead-details-section">
          <div className="lead-details__side-info" id="lead-details-side-info">
            <div className="lead_details_h3" id="lead-details-title">
              <h3>{t("leads.ld_lead_details_container")}</h3>
            </div>
            <div
              className="leads_details_columns_container"
              id="lead-details-columns-container"
            >
              <div className="lead_details_column" id="lead-details-column-1">
                <p className="content">
                  <span>{t("leads.ldv_lead_owner_lab")}:</span>
                  {data?.owner?.first_name} {data?.owner?.last_name}
                </p>
                <p className="content">
                  <span>{t("leads.ldv_lead_stage_lab")}:</span>
                  <Chip
                    label={data?.lead_status?.name}
                    variant="filled"
                    size="small"
                    sx={{
                      color:
                        stageOptions?.find(
                          (stage) => stage.id === data?.lead_status?.id
                        )?.txt_color || "#000",
                      backgroundColor:
                        stageOptions?.find(
                          (stage) => stage.id === data?.lead_status?.id
                        )?.bg_color || "#fff",
                      fontWeight: 400,
                    }}
                  />
                </p>
                <p className="content">
                  <span>{t("leads.esl_leadsource")}:</span>
                  {data?.channel?.name || "-"}
                </p>
                <p className="content">
                  {/* <span>{t("leads.esl_timetocontact")}:</span> */}
                  <span>Best time to call:</span>
                  {data?.best_time_to_call || "-"}
                </p>
              </div>
              <div className="lead_details_column" id="lead-details-column-2">
                <p className="content">
                  <span>{t("leads.ldv_lead_created_on_lab")}:</span>
                  {new Date(data?.created_at).toLocaleDateString("en-GB")}
                </p>
                <p className="content">
                  <span>{t("leads.esl_lead_sub_stage")}:</span>
                  <Chip
                    label={data?.lead_sub_status?.name}
                    variant="filled"
                    size="small"
                    avatar={
                      <Box
                        sx={{
                          backgroundColor:
                            subStageOptions?.find(
                              (stage) => stage?.id === data?.lead_sub_status?.id
                            )?.txt_color || "#000",
                          width: "8px !important",
                          height: "8px !important",
                          borderRadius: "50%",
                        }}
                      />
                    }
                    sx={{
                      backgroundColor:
                        subStageOptions?.find(
                          (stage) => stage.id === data?.lead_sub_status?.id
                        )?.bg_color || "#fff",
                    }}
                  />
                </p>
                <p className="content">
                  <span>{t("leads.esl_sourcemedium")}:</span>
                  {data?.source_medium?.name || "-"}
                </p>
              </div>
              <div className="lead_details_column" id="lead-details-column-3">
                <p className="content">
                  <span>{t("leads.ldv_lead_age_lab")}:</span>
                  {Math.floor(
                    (new Date() - new Date(data?.created_at?.split(" ")[0])) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  {t("leads.led_days")}
                </p>
                <p className="content">
                  <span>{t("leads.ldv_lead_modified_on_lab")}:</span>
                  {new Date(data?.updated_at).toLocaleDateString("en-GB")}
                </p>
                <p className="content">
                  <span>Next follow-up:</span>
                  {data?.last_followup_info?.follow_up_date_time
                    ? new Date(data?.last_followup_info?.follow_up_date_time)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-")
                    : "-"}
                </p>
              </div>
              <div className="lead_details_column" id="lead-details-column-4">
                <p className="content">
                  <span>Campaign name:</span>
                  {data?.campaign_name || "-"}
                </p>
                <p className="content">
                  <span>{t("leads.ldv_lead_modified_age_lab")}: </span>
                  {Math.floor(
                    (new Date() - new Date(data?.updated_at?.split(" ")[0])) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  {t("leads.led_days")}
                </p>
                <p className="content">
                  <span>Follow-up comment:</span>
                  {data?.last_followup_info?.details || "-"}
                </p>
              </div>
            </div>

            <div className="lead_details_h3" id="lead-remarks-section">
              <span>Remark:</span>
              {data?.remark?.length > 0 ? (
                <div id="remarks-container">
                  {data?.remark?.length < 2 && (
                    <p>{data?.remark[0]?.comment}</p>
                  )}
                  {data?.remark?.length >= 2 && (
                    <div id="multiple-remarks-container">
                      <p>{data?.remark[0]?.comment}</p>

                      <div
                        className="commentContainer"
                        id="last-remark-container"
                      >
                        <div className="secondLastRemark" id="last-remark-meta">
                          Last remark by {data?.updated_by?.first_name}{" "}
                          {data?.updated_by?.last_name} &middot;{" "}
                          {data?.updated_at
                            ?.split(" ")[0]
                            .split("-")
                            .reverse()
                            .join("-")}
                        </div>
                        <p>{data?.remark[1]?.comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>

        <div className="lead_details_section" id="personal-details-section">
          <div
            className="lead-details__side-info"
            id="personal-details-side-info"
          >
            <div className="lead_details_h3" id="personal-details-title">
              <h3>{t("leads.ldv_lead_personal_details")}</h3>
            </div>
            <div
              className="leads_details_columns_container_personal_details"
              id="personal-details-columns-container"
            >
              <div className="first_half" id="personal-details-first-half">
                <div
                  className="lead_details_column"
                  id="personal-details-column-1"
                >
                  <p className="content">
                    <span>{t("leads.ldv_lead_contact_lab")}:</span>
                    {data?.mobile_number || "-"}
                  </p>
                  <p className="content">
                    <span>Alternate Contact:</span>
                    {data?.alternate_mobile_number || "-"}
                  </p>

                  <p className="content">
                    <span>{t("leads.esl_dob")}:</span>
                    {data?.dob || "-"}
                  </p>
                </div>
                <div
                  className="lead_details_column"
                  id="personal-details-column-2"
                >
                  <p className="content">
                    <span>{t("leads.esl_email_lab")}:</span>
                    {data?.email || "-"}
                  </p>
                  <p className="content">
                    <span>{t("followup.fup_tbl_chekbox")}:</span>
                    {data?.alternate_email || "-"}
                  </p>
                  <p className="content">
                    <span>{t("leads.csl_gender_lab")}:</span>
                    {data?.gender === "m"
                      ? "Male"
                      : data?.gender === "f"
                      ? "Female"
                      : data?.gender === "o"
                      ? "Other"
                      : "-"}
                  </p>
                  {/* <p className="content">
                    <span>{t("leads.esl_pincode")}:</span>
                    {data?.pincode || "-"}
                  </p> */}
                </div>
              </div>
              <div
                className="lead_details_column last_column"
                id="personal-details-last-column"
              >
                <p className="content">
                  <span>{t("leads.esl_firstLineaddress")}:</span>
                  {data?.first_line_add || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedFollowUpMode && (
        <div className="modal-backdrop" id="followup-modal-backdrop">
          <FollowUpDirectModal
            {...getModalConfig(selectedFollowUpMode)}
            type={selectedFollowUpMode}
            onSubmit={(values) => {
              console.log("Form values:", values);
              handleDataChange();
            }}
            onClose={closeModal}
            lead={data?.id}
            leadDetails={data}
          />
        </div>
      )}
    </>
  );
};

export default LeadDetailsView;
