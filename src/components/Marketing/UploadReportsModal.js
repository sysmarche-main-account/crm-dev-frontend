"use client";
import React, { useState } from "react";
import CloseIcon from "@/images/close-icon.svg";
import UploadIcon from "@/images/upload.svg";
import DownloadIcon from "@/images/download.svg";
import CheckIcon from "@/images/check-contained.svg"; // Add your check icon
import ExcelIcon from "@/images/execel.svg";
import { CircularProgress, Typography, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  downloadSampleAction,
  uploadMarketingCsvAction,
} from "@/app/actions/marketingActions";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { useSelector } from "react-redux";
import { decryptClient } from "@/utils/decryptClient";

const UploadReportsModal = ({ open, onClose, handleDataChange }) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { details } = useSelector((state) => state.user);

  const [loading, setLoading] = useState({
    download: false,
  });

  const [activeTab, setActiveTab] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  if (!open) return null; // Hide modal if `open` is false

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check for PDF file type
      if (file.type !== "text/csv") {
        setError(t("marketing.400359"));
        return;
      }

      setError(null);
      setUploading(true);
      setUploadProgress(0);

      const csrfToken = await getCsrfToken();
      const formData = new FormData();
      formData.append("uuid", details?.uuid);
      formData.append("file_upload", file);
      try {
        // Simulate progressive upload
        const uploadInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(uploadInterval); // Stop incrementing when close to 100%
              return prev;
            }
            return prev + 5; // Increment progress
          });
        }, 100); // Update progress every 100ms

        const result = await uploadMarketingCsvAction(csrfToken, formData);
        // console.log("password change result:", result);

        clearInterval(uploadInterval); // Clear the interval after the upload completes

        if (result.status === 200) {
          setUploadProgress(100); // Ensure progress is set to 100%
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 500ms

          const { iv, encryptedData } = result?.data;
          const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
          const decrypted = decryptClient(iv, encryptedData, key);
          console.log("final upload", decrypted);

          if (decrypted?.success) {
            setUploading(false);
            setUploadedFile(file.name);
            onClose();
            showSnackbar({
              message: `${decrypted.message}`,
              severity: "success",
              anchorOrigin: { vertical: "top", horizontal: "center" },
            });
            handleDataChange();
          }
        } else {
          setUploading(false);
          console.error(result.error);
          if (result.error.status === 500) {
            await logout();
          } else if (typeof result.error.message === "string") {
            showSnackbar({
              message: `${result.error.message}`,
              severity: "error",
              anchorOrigin: { vertical: "top", horizontal: "center" },
            });
            onClose();
            handleDataChange();
          } else if (
            typeof result.error.message === "object" &&
            result.error.message !== null
          ) {
            let errValues = Object.values(result.error.message);
            if (errValues.includes("Token expired")) {
              window.location.reload();
              getToken();
            } else if (errValues.length > 0) {
              errValues.map((errmsg) =>
                showSnackbar({
                  message: `${errmsg}`,
                  severity: "error",
                  anchorOrigin: { vertical: "top", horizontal: "center" },
                })
              );
              onClose();
              handleDataChange();
            }
          }
        }
      } catch (error) {
        setUploading(false);
        console.error("Unexpected error:", error);
      }

      // Simulate file upload progress
      // const uploadInterval = setInterval(() => {
      //   setUploadProgress((prev) => {
      //     if (prev >= 100) {
      //       clearInterval(uploadInterval);
      //       setUploading(false);
      //       setUploadedFile(file.name);
      //       return 100;
      //     }
      //     return prev + 10;
      //   });
      // }, 300);

      // handleDataChange();
    }
  };

  const handleCancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setFile(null);
    setUploadedFile(null);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleSampleCsv = async () => {
    setLoading((prev) => ({ ...prev, download: true }));
    const csrfToken = await getCsrfToken();
    try {
      const result = await downloadSampleAction(csrfToken);

      if (result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final download", decrypted);

        // Create a Blob from the CSV data
        const blob = new Blob([decrypted], { type: "text/csv" });

        // Create a link element to download the Blob as a CSV file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Marketing_Template.csv";

        // Programmatically click the link to trigger the download
        link.click();

        setLoading((prev) => ({ ...prev, download: false }));
      } else {
        setLoading((prev) => ({ ...prev, download: false }));
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
      setLoading((prev) => ({ ...prev, download: false }));
      console.error("Unexpected error:", error);
    }
  };

  return (
    <div className="import-user-modal">
      <div className="modal-header">
        <h2>{t("marketing.mktg_ur_upload_reports")}</h2>
        <button
          id="marketing-upload-modal-close-btn"
          className="close-btn"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tabs for switching between Upload CSV and Fields Mapping */}
      <div className="modal-tabs">
        <button
          id="marketing-upload-modal-upload-csv-btn"
          className={activeTab === "upload" ? "active" : ""}
          onClick={() => handleTabClick("upload")}
        >
          {t("imortusermodal.impu_tabs_upload_csv")}
        </button>
      </div>

      {/* Upload CSV Section */}
      {activeTab === "upload" && (
        <div className="upload-section">
          <div
            id="marketing-upload-modal-drag&drop"
            className="upload-box"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Error message */}
            {error && <p className="error-message">{error}</p>}

            {!uploading && !uploadedFile && (
              <div className="upload-content">
                <span className="upload-icon">
                  <UploadIcon />
                </span>
                <p className="upload-description">
                  {t("imortusermodal.impu_upload_section_drag_and_drop")}
                  <span
                    className="upload-link"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    {t("imortusermodal.impu_upload_section_click_to_upload")}{" "}
                  </span>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    // accept=".csv"
                  />
                </p>
              </div>
            )}

            {uploading && (
              <div className="upload-progress-circle">
                <CircularProgress
                  variant="determinate"
                  color="success"
                  value={uploadProgress}
                  size={80}
                  thickness={4}
                />
                <div className="progress-text">
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    {`${uploadProgress}%`}
                  </Typography>
                </div>
                {/* <p>
                  {t("imortusermodal.impu_import")} {uploadProgress}%
                </p> */}
                <button
                  id="marketing-upload-modal-cancel-upload-btn"
                  className="cancel-btn"
                  onClick={handleCancelUpload}
                >
                  {t("imortusermodal.impu_buttons_cancel")}
                </button>
              </div>
            )}

            {uploadedFile && !uploading && (
              <div className="upload-success">
                <div className="check-circle">
                  <CheckIcon />
                </div>
                <p>
                  Your CSV {uploadedFile} successfully uploaded{" "}
                  <span>
                    <button
                      id="marketing-upload-modal-upload-new-file"
                      className="change-btn"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    >
                      {t("imortusermodal.impu_import_change")}
                    </button>
                  </span>
                </p>
              </div>
            )}
          </div>
          <div className="file_size_section">
            <p>{t("leads.led_supported_file")}</p>
            {/* <p>{t("imortusermodal.imp_user_maxsize")}</p> */}
          </div>

          {/* Sample Format Section */}
          <div className="sample-format">
            <div className="sample-content">
              <span className="sample-icon">
                <ExcelIcon />
                {t("imortusermodal.impu_sample_format_label")}
              </span>
              <p style={{ width: "450px" }}>
                {t("imortusermodal.impu_sample_format_description")}
              </p>
            </div>
            {console.log(loading.download)}
            <button
              id="marketing-upload-modal-download-sample-btn"
              className="download-btn"
              onClick={() => handleSampleCsv()}
            >
              {loading?.download ? (
                <CircularProgress size={25} color="#000" />
              ) : (
                <DownloadIcon />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modal Actions */}
      <div className="modal-footer">
        <Button
          id="marketing-upload-modal-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("imortusermodal.impu_buttons_cancel")}
        </Button>
        <Button
          id="marketing-upload-modal-submit-btn"
          variant="contained"
          color="success"
          className="map-button"
          onClick={() => formikRef.current.submitForm()}
          style={{ marginRight: "20px" }}
        >
          {t("imortusermodal.impu_buttons_save")}
        </Button>
      </div>
    </div>
  );
};

export default UploadReportsModal;
