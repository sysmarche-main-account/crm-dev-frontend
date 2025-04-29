import React, { useState } from "react";
import CloseIcon from "@/images/close-icon.svg";
import UploadIcon from "@/images/upload.svg";
import DownloadIcon from "@/images/download.svg";
import CheckIcon from "@/images/check-contained.svg"; // Add your check icon
import ExcelIcon from "@/images/execel.svg";
import { CircularProgress, Typography, Button } from "@mui/material";
import { useTranslations } from "next-intl";

const imortusermodal = ({ open, onClose, handleDataChange }) => {
  const t = useTranslations();
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check for PDF file type
      if (file.type !== "application/pdf") {
        setError(t("leads.400359"));
        return;
      }

      setError(null);
      setUploading(true);
      setUploadProgress(0);
      setFile(file);

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            setUploading(false);
            setUploadedFile(file.name);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      handleDataChange();
    }
  };

  const handleCancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setFile(null);
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="import-user-modal" id="roles-import-user-wrapper">
      <div className="modal-header" id="roles-import-user-header">
        <h2>{t("imortusermodal.impu_modal_title")}</h2>
        <button
          id="roles-import-user-close-btn"
          className="close-btn"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Tabs for switching between Upload CSV and Fields Mapping */}
      <div className="modal-tabs" id="roles-import-user-tabs">
        <button
          id="roles-import-user-upload-btn"
          className={activeTab === "upload" ? "active" : ""}
          onClick={() => handleTabClick("upload")}
        >
          {t("imortusermodal.impu_tabs_upload_csv")}
        </button>
      </div>

      {/* Upload CSV Section */}
      {activeTab === "upload" && (
        <div className="upload-section" id="roles-import-user-upload-section">
          <div className="upload-box" id="roles-import-user-upload-box">
            {/* Error message */}
            {error && <p className="error-message">{error}</p>}

            {!uploading && !uploadedFile && (
              <div
                className="upload-content"
                id="roles-import-user-upload-content"
              >
                <span
                  className="upload-icon"
                  id="roles-import-user-upload-icon"
                >
                  <UploadIcon />
                </span>
                <p
                  className="upload-description"
                  id="roles-import-user-upload-description"
                >
                  {t("imortusermodal.impu_upload_section_drag_and_drop")}
                  <span
                    id="roles-import-user-reupload-btn"
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
                  />
                </p>
              </div>
            )}

            {uploading && (
              <div
                className="upload-progress-circle"
                id="roles-import-user-upload-progress"
              >
                <CircularProgress
                  variant="determinate"
                  value={uploadProgress}
                  size={80}
                  thickness={4}
                />
                <div
                  className="progress-text"
                  id="roles-import-user-progress-text"
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    {`${uploadProgress}%`}
                  </Typography>
                </div>
                <p>
                  {t("imortusermodal.impu_import")} {uploadProgress}%
                </p>
                <button
                  className="cancel-btn"
                  id="roles-import-user-cancel-upload-btn"
                  onClick={handleCancelUpload}
                >
                  {t("imortusermodal.impu_import_change")}
                </button>
              </div>
            )}

            {uploadedFile && !uploading && (
              <div
                className="upload-success"
                id="roles-import-user-upload-success"
              >
                <div
                  className="check-circle"
                  id="roles-import-user-check-circle"
                >
                  <CheckIcon />
                </div>
                <p>
                  Your CSV {uploadedFile} successfully uploaded{" "}
                  <span>
                    <button
                      id="roles-import-user-change-file-btn"
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

          <div
            className="file_size_section"
            id="roles-import-user-file-size-info"
          >
            <p>{t("leads.led_supported_file")}</p>
            <p>{t("imortusermodal.imp_user_maxsize")}</p>
          </div>

          {/* Sample Format Section */}
          <div className="sample-format" id="roles-import-user-sample-format">
            <div
              className="sample-content"
              id="roles-import-user-sample-content"
            >
              <span className="sample-icon" id="roles-import-user-sample-icon">
                <ExcelIcon />
                {t("imortusermodal.impu_sample_format_label")}
              </span>
              <p style={{ width: "450px" }}>
                {t("imortusermodal.impu_sample_format_description")}
              </p>
            </div>
            <button
              id="roles-import-user-donwload-file-btn"
              className="download-btn"
            >
              <DownloadIcon />
            </button>
          </div>
        </div>
      )}

      {/* Modal Actions */}
      <div className="modal-footer" id="roles-import-user-footer">
        <Button
          id="roles-import-user-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("imortusermodal.impu_buttons_cancel")}
        </Button>
        <Button
          id="roles-import-user-submit-btn"
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

export default imortusermodal;
