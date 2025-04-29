import React, { useEffect, useState } from "react";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import CancelIcon from "@/images/cancel-right.svg";
import ArrowIcon from "@/images/arrow-switch-horizontal.svg";
import SearchIcon from "@/images/search.svg";
import WarningIcon from "@/images/alert-circle.svg";
import { useTranslations } from "next-intl";
import "@/styles/TransferLeadsModal.scss";
import {
  Button,
  Avatar,
  CircularProgress,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import ChangeReports from "./ChangeReports";
import Modal from "@/components/common/Modal/Modal";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import LeadTransferModalConfirmation from "./LeadTranferModal";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  updateSingleLeadAction,
  userLeadListDDAction,
} from "@/app/actions/leadActions";
import {
  getUsersDDAction,
  handleEditUserAction,
} from "@/app/actions/userActions";
import { decryptClient } from "@/utils/decryptClient";
import { getToken } from "@/utils/getToken";

const TransferLeads = ({ onClose, singleUserData, handleDataChangeMain }) => {
  console.log("single", singleUserData);
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [loading, setLoading] = useState({
    lead: false,
    counselors: false,
    transfer: false,
  });

  const [reportingUsers] = useState(singleUserData?.reporting_user_count);

  const [allLeads, setAllLeads] = useState(null);
  const [leads, setLeads] = useState(null);

  const [allCounselors, setAllCounselors] = useState([]);
  const [counselors, setCounselors] = useState(null);

  const [uniList, setUniList] = useState(null);

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedCounselors, setSelectedCounselors] = useState([]);
  const [selectedUni, setSelectedUni] = useState("");

  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [counselorSearchTerm, setCounselorSearchTerm] = useState("");

  const [debouncedLeadSearchTerm, setDebouncedLeadSearchTerm] = useState("");
  const [debouncedCounselorSearchTerm, setDebouncedCounselorSearchTerm] =
    useState("");

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [isDeactivateModalOpenLead, setIsDeactivateModalOpenLead] =
    useState(false);

  const [isChangeReportsModalOpen, setIsChangeReportsModalOpen] =
    useState(false);

  const [selectAllLeads, setSelectAllLeads] = useState(false);

  const [dataChange, setDataChange] = useState(false);

  const handleDataChangeLeads = () => setDataChange(true);

  const getCounsellorsList = async () => {
    setLoading((prev) => ({ ...prev, counselors: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: singleUserData?.uuid,
      universities: singleUserData?.universities?.map((uni) => uni.id),
      search: counselorSearchTerm,
      status: "Active",
    };
    console.log("reqBody Counsellors", reqbody);

    try {
      const result = await getUsersDDAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final Counsellors", decrypted);

        // setCounselors(decrypted);
        setAllCounselors(decrypted);
        setLoading((prev) => ({ ...prev, counselors: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, counselors: false }));
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
      setLoading((prev) => ({ ...prev, counselors: false }));
    }
  };

  const getUsersActiveLeads = async () => {
    setLoading((prev) => ({ ...prev, lead: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: [singleUserData?.uuid],
      search_term: leadSearchTerm,
    };

    try {
      const result = await userLeadListDDAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final users active leads", decrypted);

        // setLeads(decrypted);
        setAllLeads(decrypted);
        if (
          decrypted.length === 0 &&
          singleUserData?.reporting_user_count > 0
        ) {
          setIsChangeReportsModalOpen(true);
        }
        setLoading((prev) => ({ ...prev, lead: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, lead: false }));
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
      setLoading((prev) => ({ ...prev, lead: false }));
    }
  };

  useEffect(() => {
    getUsersActiveLeads();
    getCounsellorsList();
  }, []);

  useEffect(() => {
    getCounsellorsList();
  }, [debouncedCounselorSearchTerm]);

  useEffect(() => {
    getUsersActiveLeads();
  }, [debouncedLeadSearchTerm]);

  useEffect(() => {
    // if (dataChange) {
    getUsersActiveLeads();
    // }
  }, [dataChange]);

  // Debounce effect for leadSearchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLeadSearchTerm(leadSearchTerm);
    }, 550); // Adjust debounce delay as needed

    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [leadSearchTerm]);

  // Debounce effect for counselorSearchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCounselorSearchTerm(counselorSearchTerm);
    }, 550); // Adjust debounce delay as needed

    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [counselorSearchTerm]);

  useEffect(() => {
    // Filter leads and counselors when selectedUni, allLeads, or allCounselors change
    const filteredLeads = allLeads?.filter(
      (lead) => lead?.university_interested?.id === selectedUni
    );
    setLeads(filteredLeads);

    const filteredCounselors = allCounselors?.filter((user) =>
      user?.university?.some((uni) => uni?.id === selectedUni)
    );
    setCounselors(filteredCounselors);
  }, [selectedUni, allLeads, allCounselors]);

  useEffect(() => {
    if (
      // (leads?.length === 0 && allLeads?.length === 0 && reportingUsers > 0) ||
      singleUserData?.active_lead_count === 0 &&
      reportingUsers > 0
      // (allLeads?.length === 0  && reportingUsers > 0)
    ) {
      setIsChangeReportsModalOpen(true);
    } else if (allLeads?.length === 0 && reportingUsers === 0) {
      setIsDeactivateModalOpenLead(true);
    }
  }, [singleUserData, leads, reportingUsers, allLeads]);

  useEffect(() => {
    if (allLeads?.length > 0) {
      const uniqueUniversities = Array.from(
        new Map(
          allLeads.map((lead) => [
            lead.university_interested.id,
            lead.university_interested,
          ])
        ).values()
      );
      setUniList(uniqueUniversities);
      setSelectedUni(uniqueUniversities[0]?.id);
      // setSelectedUni(uniqueUniversities[0]?.id);
    }
  }, [allLeads]);

  const handleLeadSelect = (index) => {
    const isSelected = selectedLeads?.includes(index);
    setSelectedLeads((prevSelected) =>
      isSelected
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    );
  };

  const handleCounselorSelect = (index) => {
    setSelectedCounselors([index]);
    // const isSelected = selectedCounselors.includes(index);
    // setSelectedCounselors((prevSelected) =>
    //   isSelected
    //     ? prevSelected.filter((i) => i !== index)
    //     : [...prevSelected, index]
    // );
  };

  const handleSelectAllLeads = () => {
    if (selectAllLeads) {
      setSelectedLeads([]); // Deselect all leads
    } else {
      setSelectedLeads(leads?.map((item) => item?.id)); // Select all filtered leads
    }
    setSelectAllLeads(!selectAllLeads);
  };

  const changeLeadOwner = async (lead, counselor) => {
    console.log("lead", lead);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      lead_id: lead?.id,
      full_name: lead?.full_name,
      mobile_number: lead?.mobile_number,
      dob: lead?.dob,
      email: lead?.email,
      alternate_email: lead?.alternate_email,
      university_interested: lead?.university_interested?.id, //from master table
      program_interested: lead?.program_interested?.id, //from master table
      lead_channel: lead?.channel?.id, // from master table
      source_medium: lead?.source_medium?.id, //from master table
      lead_owner: counselor, // from user tabel
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
        console.log("final lead owner change", decrypted);
      } else {
        console.error(result.error);
        throw new Error(result.error || "Error in changing lead owner");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      throw { error, lead };
    }
  };

  const handleTransfer = async () => {
    setLoading((prev) => ({ ...prev, transfer: true }));
    if (selectedLeads.length === 0 && selectedCounselors.length === 0) {
      showSnackbar({
        message: `${t("manage_user.mu_disble_seleclead_conselor")}!`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
      return;
    }

    if (selectedLeads.length === 0) {
      showSnackbar({
        message: `${t("manage_user.mu_transferlead_selec_led")}!`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
      return;
    }

    if (selectedCounselors.length === 0) {
      showSnackbar({
        message: `${t("manage_user.mu_transferlead_selec_conslor")}!`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
      return;
    }

    const selectedLeadsFull = leads?.filter((item) =>
      selectedLeads.includes(item?.id)
    );
    console.log("final", selectedLeadsFull);

    try {
      for (const lead of selectedLeadsFull) {
        await changeLeadOwner(lead, selectedCounselors[0]);
      }
      console.log("Done processing all leads.");
      setSelectedLeads([]);
      setSelectedCounselors([]);
      setLoading((prev) => ({ ...prev, transfer: false }));

      // Show the LeadTranferModal
      setIsConfirmationModalOpen(true);
      setDataChange(false);
    } catch (error) {
      console.error(
        `Error occurred while processing lead: ${error.lead?.id || "unknown"}`,
        error.error
      );

      // Notify user about the error
      showSnackbar({
        message: `An error occurred while processing lead: ${
          error.lead?.full_name || "unknown"
        }. Operation stopped.`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      setLoading((prev) => ({ ...prev, transfer: false }));
    }
  };

  const handleDeactivateCancel = () => {
    handleDataChangeMain();
    onClose();
  };

  const handleConfirmDisable = () => async () => {
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
        setIsDeactivateModalOpenLead(false);
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
    <div className="transfer-modal-section">
      <div className="change-details">
        <div>
          <h2>{t("change_owners.co_change_owners")}</h2>
          <h4>{t("manage_user.mu_transferlead_content")}</h4>
          <div className="infoText">
            <span>
              <WarningIcon />
            </span>
            <p>
              Select a university from the dropdown. Leads can only be assigned
              to users with access to the chosen university.
            </p>
          </div>
        </div>
        <button
          id="user-transfer-leads-close-btn"
          className="close-btn"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="modal-body">
        <div className="university_dd_container">
          {/* <FormControl fullWidth> */}
          <label className="role-label" htmlFor="university">
            {t("leads.csl_univ_lab")}
            <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            id="leads-create-lead-university"
            value={loading?.lead ? "loading" : selectedUni}
            onChange={(e) => {
              setSelectedUni(e.target.value);
            }}
            displayEmpty
            IconComponent={ChevronDown}
            fullWidth
            // className={
            //   touched.university && errors.university ? "input-error" : ""
            // }
            style={{ height: "40px", marginBottom: "20px" }}
            sx={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <MenuItem disabled value="">
              {t("leads.csl_univ_phldr")}
            </MenuItem>
            {loading?.lead ? (
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
            ) : uniList?.length === 0 || !uniList ? (
              <MenuItem disabled>{t("leads.cl_no_unives")}</MenuItem>
            ) : (
              uniList?.length > 0 &&
              uniList?.map((uni) => (
                <MenuItem key={uni.id} value={uni.id}>
                  {uni.name}
                </MenuItem>
              ))
            )}
          </Select>

          {/* <ErrorMessage
            name="university"
            component="div"
            className="error-message"
          /> */}
          {/* </FormControl> */}
        </div>
        <div className="lists-container">
          <div className="list">
            <h3>{t("manage_user.mu_transferlead_list")}</h3>

            <div className="search-box">
              <input
                id="user-transfer-leads-search"
                style={{ width: "80%" }}
                type="text"
                placeholder={t("changereports.chgrep_search")}
                value={leadSearchTerm}
                onChange={(e) => setLeadSearchTerm(e.target.value)}
              />
              <div className="search-icon">
                <SearchIcon />
                {leads?.length > 0 && (
                  <input
                    id="user-transfer-leads-all-select-leads"
                    type="checkbox"
                    checked={selectAllLeads}
                    onChange={handleSelectAllLeads}
                  />
                )}
              </div>
            </div>
            {loading.lead ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress size={30} color="#000" />
              </div>
            ) : (
              <>
                <ul>
                  {leads?.length === 0 ? (
                    <li>{t("manage_user.mu_transferlead_nolead")}</li>
                  ) : (
                    leads?.map((lead) => (
                      <li key={lead?.id}>
                        <label>
                          {lead?.full_name}
                          <input
                            id={`user-transfer-leads-single-checkbox-${lead?.id}`}
                            type="checkbox"
                            checked={selectedLeads.includes(lead?.id)}
                            onChange={() => handleLeadSelect(lead?.id)}
                          />
                        </label>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>
          <div className="arrow">
            <span>
              <ArrowIcon />
            </span>
          </div>
          <div className="list">
            <h3>{t("manage_user.mu_transferled_list_consulor")}</h3>

            <div className="search-box">
              <input
                id="user-transfer-leads-counsellor-search"
                style={{ width: "100%" }}
                type="text"
                placeholder={t("changereports.chgrep_search")}
                value={counselorSearchTerm}
                onChange={(e) => setCounselorSearchTerm(e.target.value)}
              />
              <div className="search-icon">
                <SearchIcon />
              </div>
            </div>
            {loading.counselors ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress size={30} color="#000" />
              </div>
            ) : (
              <>
                <ul>
                  {counselors?.length === 0 ? (
                    <li>{t("manage_user.mu_nocousellor_found")}.</li>
                  ) : (
                    counselors?.map((counselor) => (
                      <li key={counselor?.uuid}>
                        <label>
                          <div className="detail-section">
                            {/* <span className="counselor-initials">
                          {counselor.initials}
                        </span>
                        <span> {counselor.name}</span> */}
                            <Avatar
                              className="user-avatar"
                              style={{ marginRight: "5px" }}
                              src={counselor?.profile_img}
                              alt={`${counselor?.first_name} ${counselor?.last_name}`}
                            >
                              {!counselor?.profile_img &&
                              counselor?.first_name &&
                              counselor?.last_name
                                ? `${counselor?.first_name[0].toUpperCase()}${counselor?.last_name[0].toUpperCase()}`
                                : null}
                            </Avatar>
                            <span>
                              {counselor?.first_name} {counselor?.last_name}
                            </span>
                          </div>
                          <input
                            id={`user-transfer-leads-single-checkbox-${counselor?.uuid}`}
                            type="checkbox"
                            checked={selectedCounselors.includes(
                              counselor?.uuid
                            )}
                            onChange={() =>
                              handleCounselorSelect(counselor?.uuid)
                            }
                          />
                        </label>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <Button
          id="user-transfer-leads-cancel-btn"
          className="cancel-button"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
        >
          {t("editusermodal.cancel")}
        </Button>
        <Button
          id="user-transfer-leads-submit-btn"
          className="save-btn"
          onClick={handleTransfer}
          style={{ marginRight: "20px" }}
          // disabled={
          //   selectedLeads?.length === 0 || selectedCounselors.length === 0
          // }
        >
          {loading?.transfer ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            "Transfer"
          )}
        </Button>
      </div>

      {isConfirmationModalOpen && (
        <div className="modal-backdrop">
          <LeadTransferModalConfirmation
            type="lead"
            open={isConfirmationModalOpen}
            onClose={() => {
              setIsConfirmationModalOpen(false);
              if (
                (leads?.length === 0 && reportingUsers > 0) ||
                (allLeads?.length === 0 && reportingUsers > 0)
              ) {
                setIsChangeReportsModalOpen(true);
              } else if (
                (leads?.length === 0 && reportingUsers === 0) ||
                (allLeads?.length === 0 && reportingUsers === 0)
              ) {
                setIsDeactivateModalOpenLead(true);
              }
            }}
            handleDataChange={handleDataChangeLeads}
          />
        </div>
      )}

      {isChangeReportsModalOpen && (
        <ChangeReports
          singleUserData={singleUserData}
          onClose={() => {
            setIsChangeReportsModalOpen(false);
            onClose();
          }}
          handleDataChangeMain={handleDataChangeMain}
        />
      )}

      {isDeactivateModalOpenLead && (
        <Modal
          isOpen={isDeactivateModalOpenLead}
          onClose={() => setIsDeactivateModalOpenLead(false)}
          title={t("manage_user.mu_deactivate_title")}
          subtitle={`${t("manage_user.mu_transferlead_sure_content")}?`}
          icon={CancelIcon}
          content={`${t("manage_user.mu_deactivate_content")}.`}
          actions={[
            {
              label: t("manage_user.mu_eum_btn_cancel"),
              className: "cancel-button",
              onClick: handleDeactivateCancel,
            },
            {
              label: t("manage_user.mu_confirm_btn"),
              className: "confirm-button",
              onClick: handleConfirmDisable,
            },
          ]}
        />
      )}
    </div>
  );
};

export default TransferLeads;
