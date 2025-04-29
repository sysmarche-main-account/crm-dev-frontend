"use client";
import React, { useState } from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import useLogout from "@/app/hooks/useLogout";
import { Box, Chip, CircularProgress, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import CloseIcon from "@/images/close-icon.svg";
import { useSelector } from "react-redux";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { handleEmailSendAction } from "@/app/actions/communicationAction";
import { decryptClient } from "@/utils/decryptClient";

const TestTemplateModal = ({ open, onClose, data }) => {
  // console.log("data", data);
  const t = useTranslations();
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();

  const { details } = useSelector((state) => state.user);

  if (!open) {
    return null;
  }

  const [loading, setLoading] = useState({
    submit: false,
  });

  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);

  const handleAddEmail = (e) => {
    if (e.key === "Enter" && emailInput.trim()) {
      if (isValidEmail(emailInput)) {
        setEmails([...emails, emailInput.trim()]);
        setEmailInput("");
      } else {
        // alert("Please enter a valid email address");
        showSnackbar({
          message: t("manage_template.400374"),
          severity: "error",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
      }
    }
  };

  const isValidEmail = (email) => {
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleDeleteEmail = (emailToDelete) => {
    setEmails(emails.filter((email) => email !== emailToDelete));
  };

  const handleSendEmail = async () => {
    setLoading((prev) => ({ ...prev, submit: true }));

    if (emails.length === 0) {
      showSnackbar({
        message: `Enter emails first!`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      setLoading((prev) => ({ ...prev, submit: false }));
      return;
    }

    const csrfToken = await getCsrfToken();
    const formData = new FormData();
    // formData.append("lead_id", "");
    // formData.append("followup_id", "");
    formData.append("template_id", data?.template_ref_id);
    formData.append(
      "from_email[name]",
      `${details?.first_name} ${details?.last_name}`
    );
    formData.append("from_email[email]", `${details?.email}`);

    emails?.forEach((email, index) => {
      formData.append(`to_emails[${index}][name]`, email);
      formData.append(`to_emails[${index}][email]`, email);
    });
    // formData.append("to_emails[0][name]", `${leadDetails?.full_name}`);
    // formData.append("to_emails[0][email]", `${selOption}`);

    // formData.append(`reply_to[0][name]`, replyEmail);
    // formData.append(`reply_to[0][email]`, replyEmail);

    formData.append("subject", data?.subject);
    formData.append("body", data?.body_content);

    data?.attachments?.forEach((urls, index) => {
      formData.append(`attachment_urls[${index}]`, urls?.path);
    });

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const result = await handleEmailSendAction(csrfToken, formData);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("email send final", decrypted);

        // setTemplateList(decrypted);
        setLoading((prev) => ({ ...prev, submit: false }));
        if (decrypted.error) {
          showSnackbar({
            message: `${decrypted?.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (!decrypted.error && decrypted?.transaction_id) {
          onClose();
          showSnackbar({
            message: `Email sending initiated successfully!`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, submit: false }));
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
          } else if (errValues?.length > 0) {
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
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <div id="modal-backdrop" className="modal-backdrop">
      <div
        id="map-roles-modal-test-template"
        className="map-roles-modal-test-template"
      >
        <div id="modal-container" className="modal">
          <div
            id="modal-header-reset-password"
            className="modal-header-reset-password"
            style={{ padding: "10px 15px" }}
          >
            <h2 style={{ marginBottom: 1 }}>
              {t("manage_template.mt_test_email_temp")}
            </h2>
            <span id="subtitle-text" style={{ color: "#A1A1A1" }}>
              {t("manage_template.mt_test_multi_users")}
            </span>
            <div
              id="template-email-test-close-btn"
              className="close-button"
              onClick={onClose}
            >
              <CloseIcon />
            </div>
          </div>

          <div
            id="modal-body-test-template"
            className="modal-body-test-template"
          >
            {/* Input for emails */}
            <div
              id="email-input-container"
              style={{ textAlign: "center", marginBottom: 5 }}
            >
              <input
                id="template-email-test-email-input"
                style={{ width: "100%" }}
                variant="outlined"
                value={emailInput}
                type="email"
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleAddEmail}
                placeholder="Add emails here.."
              />
            </div>

            {/* Display the chips */}
            <Box id="email-chips-container" className="box-scroll">
              {emails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() => handleDeleteEmail(email)}
                  color="success"
                />
              ))}
            </Box>
          </div>

          <div
            id="modal-footer-test-template"
            className="modal-footer-test-template"
          >
            <button
              id="template-email-test-cancel-btn"
              className="button cancel-button"
              onClick={onClose}
            >
              {t("profile.cancel_btn")}
            </button>
            <button
              id="template-email-test-submit-btn"
              className="button save-btn"
              onClick={() => handleSendEmail()}
            >
              {loading.submit ? (
                <CircularProgress size={20} color="#000" />
              ) : (
                t("manage_template.mt_btn_send")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTemplateModal;
