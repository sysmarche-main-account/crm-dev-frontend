import React, { useState, useEffect } from "react";
import {
  MenuItem,
  Select,
  Chip,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from "@mui/material";
import ChevronDown from "@mui/icons-material/ExpandMore"; // Icon for the dropdown
import { DateRangePicker } from "rsuite";
import { DateRange, VerticalAlignBottom } from "@mui/icons-material";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { masterDDAction } from "@/app/actions/commonActions";
import { decryptClient } from "@/utils/decryptClient";
import { getActivityOwnersListAction } from "@/app/actions/userActions";
import EmailIcon from "@/images/email.svg";
import Social from "@/images/Socials.svg";
import TrashIcon from "@/images/trash.svg";
import PhoneIcon from "@/images/phone-call-01.svg";
import OutPhoneIcon from "@/images/outPhone.svg";
import InPhoneIcon from "@/images/inPhone.svg";
import CancelPhoneIcon from "@/images/cancelPhone.svg";
import UnanswerePhoneIcon from "@/images/unansweredPhone.svg";
import UserIcon from "@/images/user-profile-star.svg";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import RightArrow from "@/images/right-arrow.svg";
import MessageIcon from "@/images/message-chat-01.svg";
import {
  getAllLeadStatusAction,
  singleLeadActivityDetailsAction,
} from "@/app/actions/leadActions";
import FollowUpDirectModal from "../FollowUps/FollowUpDirectModal";
import { getToken } from "@/utils/getToken";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { handleCallAction } from "@/app/actions/communicationAction";
import VoiceNotePlayer from "@/components/VoiceNote/VoiceNotePlayer";
import VoiceNoteDuration from "@/components/VoiceNote/VoiceNoteDuration";

const ActivityTimeline = ({ data, header = true }) => {
  // console.log("data of activity", data);

  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const [loading, setLoading] = useState({
    data: false,
    activity: false,
    owner: false,
    stages: false,
  });

  const [LeadActivityData, setLeadActivityData] = useState(null);

  const [activitiesList, setActivitiesList] = useState(null);

  const [ownersList, setOwnersList] = useState(null);

  const [stageOptions, setStageOptions] = useState(null);
  const [subStageOptions, setSubStageOptions] = useState(null);

  const [ownerSelect, setOwnerSelect] = useState("");
  const [selActivity, setSelActivity] = useState("");

  const [dateRangeValue, setDateRangeValue] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [uniqDates, setUniqDates] = useState(null);
  const [selectedFollowUpMode, setSelectedFollowUpMode] = useState("");

  const [selFollowupId, setSelFollowupId] = useState("");

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
      follow_up_id: selFollowupId?.id, //optional
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
    // console.log(mode, "follow_up_mode");
    if (mode?.toLowerCase() === "call") {
      handleCall();
    } else {
      setSelectedFollowUpMode(mode);
    }
  };

  const closeModal = () => {
    setSelectedFollowUpMode(null); // Reset the follow-up mode to close the modal
  };

  const getModalConfig = (follow_up_mode) => {
    switch (follow_up_mode) {
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

  const getActivityOptionsList = async () => {
    setLoading((prev) => ({ ...prev, activity: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["activity", "sub_activity"],
      // "parent_id": "0" // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final activity options", decrypted);

        setActivitiesList(decrypted);
        setLoading((prev) => ({ ...prev, activity: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, activity: false }));
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
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  };

  const getLeadOwnerList = async () => {
    setLoading((prev) => ({ ...prev, owner: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: data?.id,
    };
    try {
      const result = await getActivityOwnersListAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setOwnersList(decrypted);
        setLoading((prev) => ({ ...prev, owner: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, owner: false }));
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
      setLoading((prev) => ({ ...prev, owner: false }));
    }
  };

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

  const getLeadActivityData = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: data?.id,
      filter: {
        owner: ownerSelect,
        date_filters: [
          {
            field: "created_at",
            from: startDate,
            to: endDate,
          },
        ],
        field_filters: [
          {
            field: "activity_id",
            value: selActivity, //from master
          },
        ],
      },
    };
    try {
      const result = await singleLeadActivityDetailsAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final activity", decrypted);

        setLeadActivityData(decrypted);
        setLoading((prev) => ({ ...prev, data: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, data: false }));
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
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  // console.log("data", data);

  useEffect(() => {
    getActivityOptionsList();
    getLeadOwnerList();
    getAllStagesOptions();
  }, []);

  useEffect(() => {
    getLeadActivityData();
  }, [ownerSelect, startDate, endDate, selActivity]);

  useEffect(() => {
    if (LeadActivityData && LeadActivityData.length > 0) {
      const allUniqueDates = [
        ...new Set(
          LeadActivityData.map((item) => item.created_at.split(" ")[0]) // Extract only the date part (YYYY-MM-DD)
        ),
      ].sort((a, b) => new Date(b) - new Date(a));
      if (allUniqueDates.length > 0) {
        setUniqDates(allUniqueDates);
      } else {
        setUniqDates([]);
      }
    }
  }, [LeadActivityData]);

  useEffect(() => {
    if (dateRangeValue && dateRangeValue.length > 1) {
      const formattedStartdate = new Date(dateRangeValue[0]).toLocaleDateString(
        "en-CA"
      );
      const formattedEnddate = new Date(dateRangeValue[1]).toLocaleDateString(
        "en-CA"
      );
      setStartDate(formattedStartdate);
      setEndDate(formattedEnddate);
    }
  }, [dateRangeValue]);

  const ActivityIcon = ({ item }) => {
    let actid = item?.activity?.id;
    if (actid === 118) {
      return <TrashIcon />;
    } else if (
      actid === 120 &&
      (item?.activity_details?.message === "from_leg_unanswered" ||
        item?.activity_details?.message === "to_leg_unanswered")
    ) {
      return <UnanswerePhoneIcon />;
    } else if (
      actid === 120 &&
      (item?.activity_details?.message === "from_leg_cancelled" ||
        item?.activity_details?.message === "to_leg_cancelled")
    ) {
      return <CancelPhoneIcon />;
    } else if (
      actid === 120 &&
      item?.activity_details?.type === "outbound" &&
      item?.activity_details?.recordings
    ) {
      return <OutPhoneIcon />;
    } else if (
      actid === 120 &&
      item?.activity_details?.type === "inbound" &&
      item?.activity_details?.recordings
    ) {
      return <InPhoneIcon />;
    } else if (
      actid === 120 ||
      (actid === 2896 && item?.activity_details?.follow_up_mode?.id === 120) ||
      (actid === 2897 && item?.activity_details?.follow_up_mode?.id === 120) ||
      (actid === 2898 && item?.activity_details?.follow_up_mode?.id === 120)
    ) {
      return <PhoneIcon />;
    } else if (
      actid === 121 ||
      (actid === 2896 && item?.activity_details?.follow_up_mode?.id === 121) ||
      (actid === 2897 && item?.activity_details?.follow_up_mode?.id === 121) ||
      (actid === 2898 && item?.activity_details?.follow_up_mode?.id === 120)
    ) {
      return <EmailIcon />;
    } else if (
      actid === 122 ||
      (actid === 2896 && item?.activity_details?.follow_up_mode?.id === 122) ||
      (actid === 2897 && item?.activity_details?.follow_up_mode?.id === 122) ||
      (actid === 2898 && item?.activity_details?.follow_up_mode?.id === 120)
    ) {
      return <MessageIcon />;
    } else if (
      actid === 123 ||
      (actid === 2896 && item?.activity_details?.follow_up_mode?.id === 123) ||
      (actid === 2897 && item?.activity_details?.follow_up_mode?.id === 123) ||
      (actid === 2898 && item?.activity_details?.follow_up_mode?.id === 120)
    ) {
      return <Social />;
    } else if (
      actid === 2896 ||
      actid === 2897 ||
      actid === 114 ||
      actid === 115 ||
      actid === 116 ||
      actid === 117 ||
      actid === 2898
    ) {
      return <UserIcon />;
    } else return null;
  };

  const ActivityContent = ({ item }) => {
    const formatDate = (date) => {
      if (typeof date !== "string") return "";

      const formattedDate = new Date(date.replace(" ", "T"));
      return (
        formattedDate.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) +
        " - " +
        formattedDate.toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      );
    };

    let actid = item?.activity?.id;

    if (actid === 118) {
      return (
        <p className="timeline-details" id="activity-timeline-lead-deleted">
          {t("leads.at_lead_deleted_by")}{" "}
          <strong style={{ color: "#000" }}>
            {item?.updated_by?.first_name} {item?.updated_by?.last_name}
          </strong>{" "}
          <span style={{ marginLeft: "20px" }}>
            {formatDate(item?.activity_details?.created_at)}
          </span>{" "}
        </p>
      );
    } else if (actid === 2898) {
      return (
        <p
          className="timeline-details"
          id="activity-timeline-followup-completed"
        >
          {/* {t("leads.at_followup_completed")}{" "} */}
          Follow-up completed by{" "}
          <strong style={{ color: "#000" }}>
            {item?.updated_by?.first_name} {item?.updated_by?.last_name}
          </strong>{" "}
          <span style={{ marginLeft: "20px" }}>
            {formatDate(item?.activity_details?.created_at)}
          </span>{" "}
        </p>
      );
    } else if (actid === 2896) {
      return (
        <>
          <p
            className="timeline-details"
            id="activity-timeline-followup-created"
          >
            {t("leads.at_follup_creted_by")}{" "}
            <strong style={{ color: "#000" }}>
              {item?.updated_by?.first_name} {item?.updated_by?.last_name}
            </strong>{" "}
            <span style={{ marginLeft: "20px" }}>
              {formatDate(item?.created_at)}
            </span>{" "}
          </p>
          <Card
            className="timeline-card"
            id="activity-timeline-followup-created-card"
          >
            <CardContent
              className="card-wrapper"
              id="activity-timeline-followup-created-card-content"
            >
              <div
                className="card-content"
                id="activity-timeline-followup-created-card-main"
              >
                <p>{item?.activity_details?.title}</p>
                <div
                  className="card-description"
                  id="activity-timeline-followup-created-description"
                >
                  <p>{item?.activity_details.details}</p>
                </div>
                <div id="activity-timeline-followup-created-details">
                  <div
                    style={{ display: "flex", gap: "60px" }}
                    id="activity-timeline-followup-created-time-date"
                  >
                    <div
                      className="card-section"
                      id="activity-timeline-followup-created-time"
                    >
                      <p>{t("followup.fupm_fmu_time_lab")}</p>
                      <p className="card-time-details">
                        {item?.activity_details?.time}
                      </p>
                    </div>
                    <div
                      className="card-section"
                      id="activity-timeline-followup-created-date"
                    >
                      <p>{t("followup.fupm_fmu_date_value")}</p>
                      <p className="card-time-details">
                        {item?.activity_details?.follow_up_date_time
                          ?.split("-")
                          ?.reverse()
                          ?.join("-")}
                      </p>
                    </div>
                  </div>

                  <div
                    className="card-section"
                    style={{ justifyContent: "space-between" }}
                    id="activity-timeline-followup-created-footer"
                  >
                    <div id="activity-timeline-followup-created-footer-left">
                      <div
                        className="card-section"
                        id="activity-timeline-followup-created-reminder"
                      >
                        <p style={{ color: "#7d7d7d" }}>
                          {t("followup.fupm_reminder_time_lab")}
                        </p>
                        <p>{item?.activity_details?.reminder?.name}</p>
                      </div>
                      <div
                        className="card-section"
                        id="activity-timeline-followup-created-creator"
                      >
                        <p style={{ color: "#7d7d7d" }}>
                          {t("followup.fupm_created_by_lab")}
                        </p>
                        <p>
                          {item?.updated_by?.first_name}{" "}
                          {item?.updated_by?.last_name}
                        </p>
                      </div>
                    </div>
                    {/* <div>
                      <button
                        id="activity-timeline-created-followup-btn"
                        className="activity-follow-button"
                        onClick={() => {
                          openModal(
                            item?.activity_details?.follow_up_mode?.name?.toLowerCase()
                          );
                          setSelFollowupId(item?.follow_up_id);
                        }}
                      >
                        {t("followup.fupdm_title")}
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else if (actid === 2897) {
      return (
        <>
          <p
            className="timeline-details"
            id="activity-timeline-followup-updated"
          >
            {t("leads.at_followup_updated")}{" "}
            <strong style={{ color: "#000" }}>
              {item?.updated_by?.first_name} {item?.updated_by?.last_name}
            </strong>{" "}
            <span style={{ marginLeft: "20px" }}>
              {formatDate(item?.created_at)}
            </span>{" "}
          </p>
          <Card
            className="timeline-card"
            id="activity-timeline-followup-updated-card"
          >
            <CardContent
              className="card-wrapper"
              id="activity-timeline-followup-updated-card-content"
            >
              <div
                className="card-content"
                id="activity-timeline-followup-updated-card-main"
              >
                <p>{item?.activity_details?.title}</p>
                <div
                  className="card-description"
                  id="activity-timeline-followup-updated-description"
                >
                  <p>{item?.activity_details.details}</p>
                </div>
                <div id="activity-timeline-followup-updated-details">
                  <div
                    style={{ display: "flex", gap: "60px" }}
                    id="activity-timeline-followup-updated-time-date"
                  >
                    <div
                      className="card-section"
                      id="activity-timeline-followup-updated-time"
                    >
                      <p>{t("followup.fupm_fmu_time_lab")}</p>
                      <p className="card-time-details">
                        {item?.activity_details?.time}
                      </p>
                    </div>
                    <div
                      className="card-section"
                      id="activity-timeline-followup-updated-date"
                    >
                      <p>{t("followup.fupm_fmu_date_value")}</p>
                      <p className="card-time-details">
                        {item?.activity_details?.follow_up_date_time
                          ?.split("-")
                          ?.reverse()
                          ?.join("-")}
                      </p>
                    </div>
                  </div>

                  <div
                    className="card-section"
                    style={{ justifyContent: "space-between" }}
                    id="activity-timeline-followup-updated-footer"
                  >
                    <div id="activity-timeline-followup-updated-footer-left">
                      <div
                        className="card-section"
                        id="activity-timeline-followup-updated-reminder"
                      >
                        <p style={{ color: "#7d7d7d" }}>
                          {t("followup.fupm_reminder_time_lab")}
                        </p>
                        <p>{item?.activity_details?.reminder?.name}</p>
                      </div>
                      <div
                        className="card-section"
                        id="activity-timeline-followup-updated-creator"
                      >
                        <p style={{ color: "#7d7d7d" }}>
                          {t("followup.fupm_created_by_lab")}
                        </p>
                        <p>
                          {item?.updated_by?.first_name}{" "}
                          {item?.updated_by?.last_name}
                        </p>
                      </div>
                    </div>
                    {/* <div>
                      <button
                        id="activity-timeline-updated-followup-btn"
                        className="activity-follow-button"
                        onClick={() => {
                          openModal(
                            item?.activity_details?.follow_up_mode?.name?.toLowerCase()
                          );
                          setSelFollowupId(item?.follow_up_id);
                        }}
                      >
                        {t("followup.fupdm_title")}
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else if (actid === 120) {
      return (
        <>
          {item?.activity_details?.recordings &&
            item?.activity_details?.status === "success" && (
              <>
                <p
                  className="timeline-details"
                  id="activity-timeline-call-made"
                >
                  {item?.activity_details?.type === "inbound"
                    ? t("leads.at_call_made")
                    : "Outbound call made by"}{" "}
                  <strong style={{ color: "#000" }}>
                    {item?.activity_details?.type === "inbound"
                      ? data?.full_name
                      : `${item?.activity_details?.from?.first_name} ${item?.activity_details?.from?.last_name}`}
                  </strong>{" "}
                  <span style={{ marginLeft: "20px" }}>
                    {formatDate(item?.created_at)}
                  </span>{" "}
                </p>
                <Card
                  className="timeline-card-call"
                  id="activity-timeline-call-recording-card"
                >
                  <CardContent
                    className="card-wrapper"
                    id="activity-timeline-call-recording-content"
                  >
                    <div id="activity-timeline-call-recording-main">
                      <div
                        className="heading"
                        id="activity-timeline-call-recording-header"
                      >
                        <strong style={{ color: "#000" }}>
                          Call Recording
                        </strong>
                        <VerticalAlignBottom
                          style={{ color: "7D7D7D", cursor: "pointer" }}
                          id="activity-timeline-download-audio-btn"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = item?.activity_details?.recordings;
                            // link.href =
                            //   "https://d1qpww3oyasfhy.cloudfront.net/call_details/sample.mp3";
                            link.setAttribute("download", "audio.mp3"); // Ensures the download attribute is set
                            link.setAttribute("target", "_blank"); // Opens in a new tab if needed
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        />
                      </div>
                      <VoiceNotePlayer
                        key={item?.id}
                        src={item?.activity_details?.recordings}
                        // src={
                        //   "https://recordings.exotel.com/exotelrecordings/schoolguru/70002accca674f077fe8ad7c96d1192p.mp3"
                        // }
                      />
                      {/* <VoiceNotePlayer src="https://d1qpww3oyasfhy.cloudfront.net/call_details/sample.mp3" /> */}
                      <div
                        className="heading"
                        id="activity-timeline-call-recording-footer"
                      >
                        <div
                          className="time"
                          id="activity-timeline-call-recording-duration"
                        >
                          <VoiceNoteDuration
                            src={item?.activity_details?.recordings}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "active" && (
              <p
                className="timeline-details"
                id="activity-timeline-call-active"
              >
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.from?.first_name}{" "}
                  {item?.activity_details?.from?.last_name}
                </strong>{" "}
                currently in call with{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.to?.full_name}
                </strong>
              </p>
            )}
          {/* Outbound call unanswered by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "from_leg_unanswered" &&
            item?.activity_details?.type === "outbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-outbound-unanswered-from"
              >
                Outbound call unanswered by{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.from?.first_name}{" "}
                  {item?.activity_details?.from?.last_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {/* Inbound call unanswered by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "from_leg_unanswered" &&
            item?.activity_details?.type === "inbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-inbound-unanswered-from"
              >
                Inbound call unanswered by Lead{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.from?.full_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {/* Outbound call cancelled by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "from_leg_cancelled" &&
            item?.activity_details?.type === "outbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-outbound-cancelled-from"
              >
                Outbound call cancelled by{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.from?.first_name}{" "}
                  {item?.activity_details?.from?.last_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {/* Inbound call cancelled by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "from_leg_cancelled" &&
            item?.activity_details?.type === "inbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-inbound-cancelled-from"
              >
                Inbound call cancelled by Lead{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.from?.full_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {/* Outbound call unanswered by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "to_leg_unanswered" &&
            item?.activity_details?.type === "outbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-outbound-unanswered-to"
              >
                Outbound call unanswered by{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.to?.full_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {/* Inbound call unanswered by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "to_leg_unanswered" &&
            item?.activity_details?.type === "inbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-inbound-unanswered-to"
              >
                Inbound call unanswered by{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.to?.first_name}{" "}
                  {item?.activity_details?.to?.last_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {/* Outbound call cancelled by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "to_leg_cancelled" &&
            item?.activity_details?.type === "outbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-outbound-cancelled-to"
              >
                Outbound call cancelled by{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.to?.full_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {/* Inbound call cancelled by */}
          {!item?.activity_details?.recordings &&
            item?.activity_details?.message === "to_leg_cancelled" &&
            item?.activity_details?.type === "inbound" && (
              <p
                className="timeline-details"
                id="activity-timeline-inbound-cancelled-to"
              >
                Inbound call cancelled by{" "}
                <strong style={{ color: "#000" }}>
                  {item?.activity_details?.to?.first_name}{" "}
                  {item?.activity_details?.to?.last_name}
                </strong>{" "}
                <span style={{ marginLeft: "20px" }}>
                  {formatDate(item?.created_at)}
                </span>{" "}
              </p>
            )}
          {item?.activity_details?.status === "failure" && (
            <p className="timeline-details" id="activity-timeline-call-failure">
              {item?.activity_details?.message}{" "}
              <span style={{ marginLeft: "20px" }}>
                {formatDate(item?.created_at)}
              </span>{" "}
            </p>
          )}
        </>
      );
    } else if (actid === 121) {
      return (
        <>
          <p className="timeline-details" id="activity-timeline-email-sent">
            {t("leads.at_email_sent")}{" "}
            <strong style={{ color: "#000" }}>
              {item?.updated_by?.first_name} {item?.updated_by?.last_name}
            </strong>{" "}
            <span style={{ marginLeft: "20px" }}>
              {formatDate(item?.created_at)}
            </span>{" "}
          </p>
          <Card className="timeline-card" id="activity-timeline-email-card">
            <CardContent
              className="card-wrapper"
              id="activity-timeline-email-card-content"
            >
              <div
                className="card-content"
                id="activity-timeline-email-card-main"
              >
                <p>{item?.activity_details?.subject}</p>
                {/* <p>Email Template No.2 </p> */}
                <div
                  className="card-description"
                  id="activity-timeline-email-description"
                >
                  <p
                    dangerouslySetInnerHTML={{
                      __html: item?.activity_details?.body,
                    }}
                  />
                  {/* <p>
                    Dear Ishita,
                    <br />
                    Greetings from the Indian Institute of Technology (IIT)
                    Bhilai! Complete Your MTech in Data Science & Data Analytics
                    IIT Bhilai offers a specialized eMasters program in Data
                    Science & Data Analytics designed to help you excel in
                    today's data-driven world. This program provides practical
                    skills in data analysis, interpretation, and decision-making
                    that you can apply directly to your job.
                  </p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else if (actid === 123) {
      return (
        <>
          <p className="timeline-details" id="activity-timeline-whatsapp-sent">
            {t("leads.at_whatsapp_sent")}{" "}
            <strong style={{ color: "#000" }}>
              {item?.updated_by?.first_name} {item?.updated_by?.last_name}
            </strong>{" "}
            <span style={{ marginLeft: "20px" }}>
              {formatDate(item?.created_at)}
            </span>{" "}
          </p>
          <Card className="timeline-card" id="activity-timeline-whatsapp-card">
            <CardContent
              className="card-wrapper"
              id="activity-timeline-whatsapp-card-content"
            >
              <div
                className="card-content"
                id="activity-timeline-whatsapp-card-main"
              >
                <p>{item?.activity_details?.template_name}</p>
                {/* <p>Whatsapp Message Template No.2 </p> */}
                <div
                  className="card-description"
                  id="activity-timeline-whatsapp-description"
                >
                  <p
                    dangerouslySetInnerHTML={{
                      __html: item?.activity_details?.message,
                    }}
                  />
                  {/* <p>
                    Dear Ishita,
                    <br />
                    Greetings from the Indian Institute of Technology (IIT)
                    Bhilai! Complete Your MTech in Data Science & Data Analytics
                    IIT Bhilai offers a specialized eMasters program in Data
                    Science & Data Analytics designed to help you excel in
                    today's data-driven world. This program provides practical
                    skills in data analysis, interpretation, and decision-making
                    that you can apply directly to your job.
                  </p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else if (actid === 116) {
      return (
        <p
          className="timeline-details"
          id="activity-timeline-ownership-changed"
        >
          {" "}
          {t("leads.at_ownership_to")}{" "}
          <strong style={{ color: "#000" }}>
            {item?.activity_details?.old_owner?.first_name}{" "}
            {item?.activity_details?.old_owner?.last_name}
          </strong>{" "}
          {t("leads.at_ownership_from")}{" "}
          <strong style={{ color: "#000" }}>
            {item?.activity_details?.new_owner?.first_name}{" "}
            {item?.activity_details?.new_owner?.last_name}
          </strong>{" "}
          <span style={{ marginLeft: "20px" }}>
            {formatDate(item?.created_at)}
          </span>{" "}
        </p>
      );
    } else if (actid === 117) {
      return (
        <>
          <div id="activity-timeline-status-updated-header">
            <p className="timeline-details"> {t("leads.at_status_updated")}</p>
          </div>

          <div
            className="time-duaration-chips"
            id="activity-timeline-status-chips"
          >
            <Chip
              label={item?.activity_details?.old_stage?.name}
              variant="filled"
              size="small"
              sx={{
                color:
                  stageOptions?.find(
                    (stage) =>
                      stage.id === item?.activity_details?.old_stage?.id
                  )?.txt_color || "#000",
                backgroundColor:
                  stageOptions?.find(
                    (stage) =>
                      stage.id === item?.activity_details?.old_stage?.id
                  )?.bg_color || "#fff",
                fontWeight: 400,
                overflow: "visible",
              }}
              id="activity-timeline-old-status-chip"
            />
            <RightArrow id="activity-timeline-status-arrow" />
            <Chip
              label={item?.activity_details?.new_stage?.name}
              variant="filled"
              size="small"
              sx={{
                color:
                  stageOptions?.find(
                    (stage) =>
                      stage.id === item?.activity_details?.new_stage?.id
                  )?.txt_color || "#000",
                backgroundColor:
                  stageOptions?.find(
                    (stage) =>
                      stage.id === item?.activity_details?.new_stage?.id
                  )?.bg_color || "#fff",
                fontWeight: 400,
                overflow: "visible",
              }}
              id="activity-timeline-new-status-chip"
            />
          </div>
          <div
            className="time-duaration-chips"
            id="activity-timeline-status-date"
          >
            <span style={{ marginLeft: "20px", color: "#7d7d7d" }}>
              {formatDate(item?.created_at)}
            </span>
          </div>
        </>
      );
    } else if (actid === 115) {
      return (
        <p className="timeline-details" id="activity-timeline-details-updated">
          {t("leads.at_details_updated")}{" "}
          <strong style={{ color: "#000" }}>
            {item?.updated_by?.first_name} {item?.updated_by?.last_name}
          </strong>{" "}
          <span style={{ marginLeft: "20px" }}>
            {formatDate(item?.created_at)}
          </span>{" "}
        </p>
      );
    } else if (actid === 122) {
      return (
        <>
          <p className="timeline-details" id="activity-timeline-sms-sent">
            {t("leads.at_sms_sent")}{" "}
            <strong style={{ color: "#000" }}>
              {item?.updated_by?.first_name} {item?.updated_by?.last_name}
            </strong>{" "}
            <span style={{ marginLeft: "20px" }}>
              {formatDate(item?.created_at)}
            </span>{" "}
          </p>
          <Card className="timeline-card" id="activity-timeline-sms-card">
            <CardContent
              className="card-wrapper"
              id="activity-timeline-sms-card-content"
            >
              <div
                className="card-content"
                id="activity-timeline-sms-card-main"
              >
                <p>{item?.activity_details?.template_name}</p>
                {/* <p>SMS Template No.2 </p> */}
                <div
                  className="card-description"
                  id="activity-timeline-sms-description"
                >
                  <p
                    dangerouslySetInnerHTML={{
                      __html: item?.activity_details?.message,
                    }}
                  />
                  {/* <p>
                    Dear Ishita,
                    <br />
                    Greetings from the Indian Institute of Technology (IIT)
                    Bhilai! Complete Your MTech in Data Science & Data Analytics
                    IIT Bhilai offers a specialized eMasters program in Data
                    Science & Data Analytics designed to help you excel in
                    today's data-driven world. This program provides practical
                    skills in data analysis, interpretation, and decision-making
                    that you can apply directly to your job.
                  </p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    } else if (actid === 114) {
      return (
        <p className="timeline-details" id="activity-timeline-lead-created">
          {" "}
          {t("leads.at_created_by")}{" "}
          <strong style={{ color: "#000" }}>
            {item?.updated_by?.first_name} {item?.updated_by?.last_name}
          </strong>{" "}
          <span style={{ marginLeft: "20px" }}>
            {formatDate(item?.created_at)}
          </span>{" "}
        </p>
      );
    }
  };

  const IconColorStyles = (actid, item) => {
    if (actid === 118) {
      return {
        padding: "8px",
        backgroundColor: "transparent",
        border: "1px solid #F5554A",
      };
    } else if (actid === 120) {
      return {
        padding: "8px",
        backgroundColor: "#F3FFFD",
        border: "1px solid #9CD6CD",
      };
    } else if (
      (actid === 2896 || actid === 2898) &&
      item?.activity_details?.follow_up_mode?.id === 120
    ) {
      return {
        padding: "8px",
        backgroundColor: "#FEF3FF",
        border: "1px solid #CF9FD3",
      };
    } else if (
      actid === 2897 &&
      item?.activity_details?.follow_up_mode?.id === 120
    ) {
      return {
        padding: "8px",
        backgroundColor: "#FEF3FF",
        border: "1px solid #CF9FD3",
      };
    } else if (
      actid === 121 ||
      (actid === 2896 && item?.activity_details?.follow_up_mode?.id === 121) ||
      (actid === 2897 && item?.activity_details?.follow_up_mode?.id === 121)
    ) {
      return {
        padding: "8px",
        backgroundColor: "#F3FFFD",
        border: "1px solid #9CD6CD",
      };
    } else if (
      actid === 122 ||
      (actid === 2896 && item?.activity_details?.follow_up_mode?.id === 122) ||
      (actid === 2897 && item?.activity_details?.follow_up_mode?.id === 122)
    ) {
      return {
        padding: "8px",
        backgroundColor: "#F3FFFD",
        border: "1px solid #9CD6CD",
      };
    } else if (
      actid === 123 ||
      (actid === 2896 && item?.activity_details?.follow_up_mode?.id === 123) ||
      (actid === 2897 && item?.activity_details?.follow_up_mode?.id === 123)
    ) {
      return {
        padding: "8px",
        backgroundColor: "#F3FFFD",
        border: "1px solid #9CD6CD",
      };
    } else if (
      actid === 114 ||
      actid === 115 ||
      actid === 116 ||
      actid === 117
    ) {
      return {
        backgroundColor: "#FFFCF3",
        border: "1px solid #E4D8B2",
      };
    } else
      return {
        padding: "5px",
        backgroundColor: "#fff",
        border: "1px solid #000",
      };
  };

  return (
    <>
      <div className="activity-timeline" id="activity-timeline-main-container">
        {/* Header with Select and DateRangePicker */}
        <div className="activity-wrapper" id="activity-timeline-header-wrapper">
          {header && (
            <h1 id="activity-timeline-title">
              {t("leads.at_activitytimeline")}
            </h1>
          )}
          <div
            className="activity-timeline__header"
            style={{ marginTop: !header && "0" }}
            id="activity-timeline-header-controls"
          >
            <div
              className="form-group"
              id="activity-timeline-activity-type-container"
            >
              <Select
                id="activity-timeline-activity-type"
                value={loading?.activity ? "loading" : selActivity}
                onChange={(e) => setSelActivity(e.target.value)}
                displayEmpty
                IconComponent={ChevronDown}
                fullWidth
                style={{
                  width: "152px",
                  height: "32px",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <MenuItem value="">
                  {t("followup.fup_act_select_activity")}
                </MenuItem>
                {loading?.activity ? (
                  <MenuItem disabled value="loading">
                    <Box
                      display="flex"
                      alignItems="center"
                      id="activity-timeline-loading-activity"
                    >
                      <CircularProgress
                        size={20}
                        color="#000"
                        sx={{ marginRight: 1 }}
                        id="activity-timeline-loading-activity-spinner"
                      />
                      {t("editusermodal.loading")}
                    </Box>
                  </MenuItem>
                ) : activitiesList?.length === 0 || !activitiesList ? (
                  <MenuItem disabled id="activity-timeline-no-activities">
                    {t("followup.fup_act_no_activity_available")}
                  </MenuItem>
                ) : (
                  activitiesList?.length > 0 &&
                  activitiesList?.map((act) => (
                    <MenuItem
                      key={act?.id}
                      value={act?.id}
                      id={`activity-timeline-activity-option-${act?.id}`}
                    >
                      {act?.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </div>
            <div className="form-group" id="activity-timeline-owner-container">
              <Select
                id="activity-timeline-owner"
                value={loading?.owner ? "loading" : ownerSelect}
                onChange={(e) => setOwnerSelect(e.target.value)}
                displayEmpty
                IconComponent={ChevronDown}
                fullWidth
                style={{
                  width: "152px",
                  height: "32px",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <MenuItem value="">
                  {t("followup.fup_act_select_owner")}
                </MenuItem>
                {loading?.owner ? (
                  <MenuItem disabled value="loading">
                    <Box
                      display="flex"
                      alignItems="center"
                      id="activity-timeline-loading-owner"
                    >
                      <CircularProgress
                        size={20}
                        color="#000"
                        sx={{ marginRight: 1 }}
                        id="activity-timeline-loading-owner-spinner"
                      />
                      {t("editusermodal.loading")}
                    </Box>
                  </MenuItem>
                ) : ownersList?.length === 0 || !ownersList ? (
                  <MenuItem disabled id="activity-timeline-no-owners">
                    {t("leads.cl_no_owners")}
                  </MenuItem>
                ) : (
                  ownersList?.length > 0 &&
                  ownersList?.map((own) => (
                    <MenuItem
                      key={own?.uuid}
                      value={own?.uuid}
                      id={`activity-timeline-owner-option-${own?.uuid}`}
                    >
                      {own?.first_name} {own?.last_name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </div>
            <div
              className="date-range-picker-follow-ups"
              id="activity-timeline-date-picker-container"
            >
              <DateRangePicker
                id="activity-timeline-date"
                appearance="subtle"
                value={dateRangeValue}
                onChange={setDateRangeValue}
                placement="bottomEnd"
                showHeader={false}
                ranges={[]}
                placeholder="dd-mm-yy - dd-mm-yy"
                format="dd/MM/yy"
                character=" – "
                onOk={(val) => console.log("val", val)}
                onClean={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                caretAs={DateRange}
                locale={{ ok: "Done" }}
              />
            </div>
          </div>
        </div>
        {/* Activity Timeline - Stepper */}
        {loading.data ? (
          <div
            style={{
              height: "600px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            id="activity-timeline-loading-container"
          >
            <CircularProgress
              size={85}
              color="#000"
              id="activity-timeline-main-loading-spinner"
            />
          </div>
        ) : LeadActivityData?.length === 0 ? (
          <div
            style={{
              height: "100px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            id="activity-timeline-no-activities-container"
          >
            <span id="activity-timeline-no-activities-message">
              {t("followup.fup_act_no_activity")}!
            </span>
          </div>
        ) : (
          <div id="activity-timeline-content-container">
            <Timeline
              sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  padding: 0,
                },
              }}
              id="activity-timeline-list"
            >
              {uniqDates?.map((udate) => {
                const today = new Date().toISOString().split("T")[0];
                const yesterday = new Date(
                  new Date().setDate(new Date().getDate() - 1)
                )
                  .toISOString()
                  .split("T")[0];
                return (
                  <div key={udate} id={`activity-timeline-date-group-${udate}`}>
                    {LeadActivityData?.filter(
                      (acvt) => acvt.created_at?.split(" ")[0] === udate
                    )?.length > 0 ? (
                      <>
                        <p
                          className="date-section"
                          id={`activity-timeline-date-header-${udate}`}
                        >
                          {today === udate
                            ? "Today"
                            : yesterday === udate
                            ? "Yesterday"
                            : new Date(udate).toLocaleDateString("en-GB")}
                        </p>
                        {LeadActivityData?.filter(
                          (acvt) => acvt?.created_at?.split(" ")[0] === udate
                        )?.map((item, index) => {
                          const lastIndex =
                            LeadActivityData?.filter(
                              (acvt) =>
                                acvt?.created_at?.split(" ")[0] === udate
                            ).length - 1;
                          return (
                            <TimelineItem
                              key={item.id}
                              id={`activity-timeline-item-${item.id}`}
                            >
                              <TimelineSeparator
                                id={`activity-timeline-separator-${item.id}`}
                              >
                                <TimelineDot
                                  sx={IconColorStyles(item?.activity?.id, item)}
                                  id={`activity-timeline-dot-${item.id}`}
                                >
                                  <ActivityIcon
                                    item={item}
                                    id={`activity-timeline-icon-${item.id}`}
                                  />
                                </TimelineDot>
                                {index !== lastIndex && (
                                  <TimelineConnector
                                    sx={{
                                      borderLeftStyle: "dotted",
                                      borderLeftWidth: "2px",
                                      borderColor: "#e0e0e0",
                                      backgroundColor: "transparent",
                                      height: "20px",
                                    }}
                                    id={`activity-timeline-connector-${item.id}`}
                                  />
                                )}
                              </TimelineSeparator>
                              <TimelineContent
                                sx={{
                                  marginTop: "5px",
                                  ...(item?.activity?.id === 117 && {
                                    display: "flex",
                                  }),
                                  ...(item?.activity?.id === 117 && {
                                    alignItems: "center",
                                  }),
                                  ...(item?.activity?.id === 117 && {
                                    gap: "15px",
                                  }),
                                }}
                                id={`activity-timeline-content-${item.id}`}
                              >
                                <ActivityContent
                                  item={item}
                                  id={`activity-timeline-item-content-${item.id}`}
                                />
                              </TimelineContent>
                            </TimelineItem>
                          );
                        })}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </Timeline>
          </div>
        )}
      </div>
      {selectedFollowUpMode && (
        <div className="modal-backdrop" id="activity-timeline-modal-backdrop">
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
            followupId={selFollowupId}
            id="activity-timeline-followup-modal"
          />
        </div>
      )}
    </>
  );
};

export default ActivityTimeline;
