"use client";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { masterDDAction } from "@/app/actions/commonActions";
import { handleCallAction } from "@/app/actions/communicationAction";
import { getAllFollowupsAction } from "@/app/actions/followupActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { singleLeadDetailsAction } from "@/app/actions/leadActions";
import useLogout from "@/app/hooks/useLogout";
import {
  setComm_modal_display,
  setConfig,
  setLead_details,
  setLead_id,
  setMode,
} from "@/lib/slices/followupSlice";
import { decryptClient } from "@/utils/decryptClient";
import {
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Social from "@/images/Socials.svg";
import CallIcon from "@/images/phone-call-01.svg";
import EmailIcon from "@/images/email.svg";
import MessageIcon from "@/images/message-chat-01.svg";

const UpcomingFollowups = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const dispatch = useDispatch();
  const { details, permissions } = useSelector((state) => state.user);
  const { comm_modal_display } = useSelector((state) => state.followup);
  const { reporting, start, end } = useSelector((state) => state.dashboard);

  const [loading, setLoading] = useState({
    data: false,
    call: false,
  });
  const [data, setData] = useState(null);
  const [selFollowup, setSelFollowup] = useState("");
  const [selMode, setSelMode] = useState("");
  const [leadDetails, setLeadDetails] = useState(null);
  const [isCallReady, setIsCallReady] = useState(false);

  const startDate = new Date().toLocaleDateString("en-CA");
  // new Date().setDate(
  //   new Date().getDate() -
  //     new Date().getDay() +
  //     (new Date().getDay() === 0 ? -6 : 1)
  // )

  const endDate = new Date().toLocaleDateString("en-CA");
  // new Date().setDate(new Date().getDate() + 365)

  const getFollowupList = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // pagination: {
      //   page: page,
      //   per_page: rowsPerPage,
      // },
      filter: {
        // action_status: filter,
        // owner: reporting,
        action_status: "todo",
        date_filters: [
          {
            field: "follow_up_date_time",
            from: startDate,
            to: endDate,
          },
        ],
      },
      sorting: [
        {
          field: "time",
          order: "ASC",
        },
      ],
    };
    console.log("followup table body", reqbody);

    try {
      const result = await getAllFollowupsAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("finalFollowup", decrypted);

        setData(decrypted?.data);
        // const { data, ...pageData } = decrypted;
        // setPagesData(pageData);
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

  const getLeadDetails = async () => {
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selFollowup?.lead_id,
    };
    try {
      const result = await singleLeadDetailsAction(csrfToken, reqbody);
      // console.log("reporting user DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("lead details", decrypted);

        setLeadDetails(decrypted);
        dispatch(setLead_details(decrypted));
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

  const closeModal = () => {
    setSelMode(null); // Reset the follow-up mode to close the modal
    setSelFollowup(null);
    setLeadDetails(null);
  };

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
      leadDetails?.university_interested?.id
    );
    const reqbody = {
      // provider_id: "q2e7fc61-0fac-5b26-84eb-e0f0d3d676bd", // optional
      user_id: details?.uuid,
      from: details?.mobile_number, // mandatory
      // to: [selectedLead?.mobile_number], // mandatory
      to: [`${leadDetails?.mobile_number}`], // mandatory
      virtual_number: virtualNumber[0]?.name, // mandatory
      lead_id: selFollowup?.lead_id, //mandatory
      follow_up_id: selFollowup?.id, //optional
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
    } finally {
      setLoading((prev) => ({ ...prev, call: false }));
      closeModal();
    }
  };

  const getModalConfig = (followUpMode) => {
    let followUpData = {};
    switch (followUpMode) {
      case "whatsapp":
        followUpData = {
          title: `${t("followup.fuptc_follow_up_action")} (WhatsApp)`,
          radioOptions: [
            {
              value: `${leadDetails?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${leadDetails?.alternate_mobile_number}`,
              label: "Alternate Number",
              color: "green",
            },
          ],
        };
        break;
      case "email":
        followUpData = {
          title: `${t("followup.fuptc_follow_up_action")} (Email)`,
          radioOptions: [
            {
              value: `${leadDetails?.email}`,
              label: t("followup.fup_tbl_mdlconf_chekbox"),
              color: "green",
            },
            {
              value: `${leadDetails?.alternate_email}`,
              label: t("followup.fup_tbl_chekbox"),
              color: "#7d7d7d",
            },
          ],
        };
        break;
      case "sms":
        followUpData = {
          title: `${t("followup.fuptc_follow_up_action")} (SMS)`,
          radioOptions: [
            {
              value: `${leadDetails?.mobile_number}`,
              label: t("followup.fup_tbl_chkbox"),
              color: "green",
            },
            {
              value: `${leadDetails?.alternate_mobile_number}`,
              label: "Alternate Number",
              color: "green",
            },
          ],
        };
        break;
      default:
        followUpData = {};
    }

    dispatch(setConfig(followUpData));
    dispatch(setComm_modal_display());
    setLoading((prev) => ({
      ...prev,
      call: false,
    }));
    // return followUpData;
  };

  useEffect(() => {
    getFollowupList();
  }, []);

  useEffect(() => {
    if (selFollowup) {
      getLeadDetails();
    }
  }, [selFollowup]);

  useEffect(() => {
    if (leadDetails) {
      setIsCallReady(true);
      if (selMode !== "call") {
        getModalConfig(selMode);
      }
    }
  }, [leadDetails, selMode]);

  useEffect(() => {
    if (isCallReady && selFollowup && selMode === "call") {
      handleCall();
      setIsCallReady(false);
    }
  }, [isCallReady, selFollowup, selMode]);

  useEffect(() => {
    if (!comm_modal_display) {
      closeModal();
    }
  }, [comm_modal_display]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
      .replace(/^(\w+), (\d{2}) (\w{3})$/, (_, w, d, m) => `${w}, ${d} ${m}`);
  };

  const leadListActions =
    permissions?.leadActions &&
    permissions?.leadActions?.filter(
      (set) => set.parent === 38 && set.details === "list_action"
    );

  return (
    <>
      <div className="upcomingContainer">
        <div className="heading">
          <h3>Today's Upcoming Follow-ups</h3>
        </div>
        <div className="followupsList">
          {loading.data && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <CircularProgress size={50} sx={{ color: "#30327b" }} />
            </div>
          )}
          {!loading.data && (
            <List dense={true} sx={{ width: "100%", bgcolor: "#FFF" }}>
              {data?.length === 0 ? (
                <>
                  <ListItem alignItems="center">
                    No Upcoming Followups.
                  </ListItem>
                </>
              ) : (
                data?.length > 0 &&
                data?.map((follow) => (
                  <React.Fragment key={follow?.id}>
                    <ListItem alignItems="flex-start">
                      <div className="followup-timestamp">
                        <p
                          className="date"
                          title={
                            follow?.follow_up_date_time
                              ? new Date(
                                  follow.follow_up_date_time
                                ).toLocaleDateString("en-GB")
                              : ""
                          }
                        >
                          {formatDate(follow?.follow_up_date_time)}
                        </p>
                        <h3 className="time">{follow?.time || "-"}</h3>
                      </div>
                      <ListItemText
                        // title={follow?.title || "-"}
                        title={follow?.details || "-"}
                        // primary={follow?.title || "-"}
                        primary={follow?.details || "-"}
                        primaryTypographyProps={{
                          component: "h6",
                          variant: "h6",
                          sx: {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block",
                          },
                        }}
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              alignItems: "center",
                              color: "#A8A8A8",
                            }}
                          >
                            Lead name:
                            <Typography
                              component="span"
                              variant="body2"
                              title={follow?.lead_name?.full_name || "-"}
                              sx={{
                                color: "text.primary",
                                display: "inline",
                                marginLeft: 1,
                              }}
                            >
                              {follow?.lead_name?.full_name || "-"}
                            </Typography>
                          </Typography>
                        }
                      />
                      <div className="followup-btn">
                        {leadListActions?.length > 0 &&
                          leadListActions?.some((lead) => lead.id === 58) && (
                            <button
                              variant="contained"
                              size="small"
                              className="follow-button"
                              style={{
                                fontSize: "0.68rem",
                              }}
                              onClick={() => {
                                setSelFollowup(follow);
                                setSelMode(
                                  follow?.follow_up_mode?.name?.toLowerCase()
                                );
                                setLoading((prev) => ({
                                  ...prev,
                                  call: true,
                                }));

                                if (
                                  follow?.follow_up_mode?.name?.toLowerCase() !==
                                  "call"
                                ) {
                                  dispatch(
                                    setMode(
                                      follow?.follow_up_mode?.name?.toLowerCase()
                                    )
                                  );
                                  dispatch(setLead_id(follow?.lead_id));
                                  // dispatch(setComm_modal_display());
                                }
                              }}
                            >
                              {loading?.call &&
                              selFollowup?.id === follow?.id ? (
                                <CircularProgress
                                  size={20}
                                  sx={{ color: "#30327b" }}
                                />
                              ) : (
                                "Follow-up"
                              )}
                              {follow?.follow_up_mode?.name?.toLowerCase() ===
                              "whatsapp" ? (
                                <Social />
                              ) : follow?.follow_up_mode?.name?.toLowerCase() ===
                                "sms" ? (
                                <MessageIcon />
                              ) : follow?.follow_up_mode?.name?.toLowerCase() ===
                                "email" ? (
                                <EmailIcon />
                              ) : (
                                <CallIcon />
                              )}
                            </button>
                          )}
                      </div>
                    </ListItem>
                    <Divider variant="fullWidth" component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </div>
      </div>
    </>
  );
};

export default UpcomingFollowups;
