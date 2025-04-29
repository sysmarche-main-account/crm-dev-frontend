import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DateRange } from "@mui/icons-material";
import { DateRangePicker } from "rsuite";
import WarningIconSmall from "@/images/warningSmall.svg";
import AlertError from "@/images/alertError.svg";
import ErrorIcon from "@/images/error.svg";
import UploadIcon from "@/images/upload.svg";
import CheckIcon from "@/images/check-contained.svg";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  getLeadReportAction,
  uploadLeadReportAction,
} from "@/app/actions/analyticsActions";
import { decryptClient } from "@/utils/decryptClient";
import { Alert, CircularProgress } from "@mui/material";

const DataUpdateCenter = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState({
    download: false,
    upload: false,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [placement, setPlacement] = useState("bottomEnd");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [file, setFile] = useState(null);

  const [error, setError] = useState(null);

  const [response, setResponse] = useState(null);

  useEffect(() => {
    const handleResize = () =>
      setPlacement(window.innerWidth <= 1300 ? "bottomStart" : "bottomEnd");
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleDownloadData = async () => {
    console.log("dates", startDate, endDate);
    if (!startDate || !endDate) {
      showSnackbar({
        message: `Please select the Start and End date`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    } else {
      setLoading((prev) => ({ ...prev, download: true }));
      const csrfToken = await getCsrfToken();
      const reqbody = {
        start_date: startDate,
        end_date: endDate,
      };

      try {
        const result = await getLeadReportAction(csrfToken, reqbody);

        if (result.success && result.status === 200) {
          const { iv, encryptedData } = result?.data;
          const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
          const decrypted = decryptClient(iv, encryptedData, key);
          console.log("final download file", decrypted);

          const blob = new Blob([decrypted], { type: "text/csv" });

          // Create a link element to download the Blob as a CSV file
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "Report_file.csv";

          // Programmatically click the link to trigger the download
          link.click();

          setLoading((prev) => ({ ...prev, download: false }));
          showSnackbar({
            message: `File downloaded successfully`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else {
          console.error(result.error);
          setLoading((prev) => ({ ...prev, download: false }));
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
    }
  };

  const handleFileUpload = (e) => {
    const fileuploaded = e.target.files[0];

    if (fileuploaded) {
      setFile(fileuploaded);
      // Check for PDF file type
      if (fileuploaded.type !== "text/csv") {
        setError(t("leads.400359"));
        // Clear the input value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        return;
      }

      setError(null);
      setUploading(true);
      setUploadProgress(0);
      setFile(fileuploaded);

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            setUploading(false);
            setUploadedFile(fileuploaded.name);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
  };

  const handleCancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setFile(null);
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleUploadData = async () => {
    if (!file) {
      showSnackbar({
        message: `Please upload a file first.`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    } else {
      setLoading((prev) => ({ ...prev, upload: true }));
      const csrfToken = await getCsrfToken();
      const formData = new FormData();
      formData.append(`report_file`, file);

      try {
        const result = await uploadLeadReportAction(csrfToken, formData);

        if (result.status === 200) {
          const { iv, encryptedData } = result?.data;
          const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
          const decrypted = decryptClient(iv, encryptedData, key);
          console.log("final upload data", decrypted);

          // setResponse(decrypted);
          if (decrypted?.success) {
            setResponse(decrypted);
            showSnackbar({
              message: `${decrypted.message}`,
              severity: "success",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          }

          handleCancelUpload();

          setLoading((prev) => ({ ...prev, upload: false }));
        } else {
          setLoading((prev) => ({ ...prev, upload: false }));
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
        setLoading((prev) => ({ ...prev, upload: false }));
        console.error("Unexpected error:", error);
      }
    }
  };

  return (
    <div
      className="table-container manage-roles-container data-update-center"
      style={{ minHeight: "99%" }}
    >
      <div className="manager-roles-headers-roles">
        <div className="role-description-user">
          <h1>Data update center</h1>
          <p>Download, upload & update data in this space</p>
        </div>
      </div>
      <div
        className="manager-roles-headers-roles date-range-container"
        style={{ paddingTop: "0" }}
      >
        <h4>
          <span style={{ color: "#00BC70" }}>Step 1:</span> Select date range
        </h4>
        <div className="date-range-div">
          <DateRangePicker
            // appearance="subtle"
            value={dateRangeValue}
            onChange={setDateRangeValue}
            placement={placement}
            showHeader={false}
            ranges={[]}
            placeholder="dd-mm-yy - dd-mm-yy"
            format="dd/MM/yy"
            character=" – "
            // onOk={(val) => console.log("val", val)}
            onClean={() => {
              setStartDate("");
              setEndDate("");
            }}
            caretAs={DateRange}
            locale={{ ok: "Done" }}
            style={{
              maxWidth: placement === "bottomStart" ? 250 : "100%",
              height: 40,
            }}
          />
          <button
            variant="contained"
            color="success"
            className="down-button"
            disabled={loading?.upload}
            onClick={() => handleDownloadData()}
            style={{ marginRight: "20px" }}
          >
            {loading?.download ? (
              <CircularProgress size={20} color="#000" />
            ) : (
              "Download file"
            )}
          </button>
        </div>
        <div className="role-description-user">
          <span className="warning-icon-description">
            <WarningIconSmall />
            <p>Download file with entries missing required fields.</p>
          </span>
        </div>
      </div>
      <div className="line"></div>
      <div className="manager-roles-headers-roles" style={{ paddingTop: "0" }}>
        <h4>
          <span style={{ color: "#00BC70" }}>Step 2:</span> Fill the missing
          fields
        </h4>
      </div>
      <div className="line"></div>
      <div
        className="manager-roles-headers-roles date-range-container"
        style={{ paddingTop: "0" }}
      >
        <h4>
          <span style={{ color: "#00BC70" }}>Step 3:</span> Re-upload the
          updated file fields
        </h4>
        <div
          className={`upload-box ${error && "error-upload-box"} ${
            response?.success && "report"
          }`}
        >
          <input
            disabled={response?.success || loading?.download}
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            ref={fileInputRef}
          />

          {!uploading && (!uploadedFile || error) && (
            <div className="upload-content">
              <span className={`upload-icon ${error && "error"}`}>
                {error ? <ErrorIcon /> : <UploadIcon />}
              </span>
              {error ? (
                <p className={`upload-description ${error && "error"}`}>
                  {file?.name}
                  <span>
                    <button
                      className="change-btn"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                    >
                      {t("imortusermodal.impu_import_change")}
                    </button>
                  </span>
                </p>
              ) : (
                <p className="upload-description">
                  {t("imortusermodal.impu_upload_section_drag_and_drop")}
                  <span
                    className="upload-link"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    {t("imortusermodal.impu_upload_section_click_to_upload")}{" "}
                  </span>
                </p>
              )}
            </div>
          )}

          {uploading && (
            <div className="upload-progress-circle">
              <CircularProgress
                variant="determinate"
                value={uploadProgress}
                size={80}
                thickness={4}
              />
              {/* <div className="progress-text">
                  <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                  >
                    {`${uploadProgress}%`}
                  </Typography>
                </div> */}
              <p>
                {t("imortusermodal.impu_import")} {uploadProgress}%
              </p>
              <button
                id="leads-import-cancel-upload-btn"
                className="cancel-btn"
                onClick={handleCancelUpload}
                disabled={loading?.download}
              >
                {t("imortusermodal.impu_buttons_cancel")}
              </button>
            </div>
          )}

          {uploadedFile && !uploading && !error && !response?.success && (
            <div className="upload-success">
              <div className="check-circle">
                <CheckIcon />
              </div>
              <h3>{t("leads.led_success")}/</h3>
              <div>
                <span>{t("leads.led_csv_uploaded")}</span>
                <div className="file_change">
                  <span>{uploadedFile}</span>
                  <button
                    id="leads-import-change-file-btn"
                    className="change-btn"
                    onClick={() => {
                      // document.getElementById("fileInput").click()
                      const fileInput = document.getElementById("fileInput");
                      if (fileInput) {
                        fileInput.value = ""; // Reset the value to trigger change
                      }
                      fileInput.click();
                    }}
                  >
                    {t("imortusermodal.impu_import_change")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {error && (
          <div
            style={{
              margin: "8px 0px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Alert
              id="leads-import-error-alert"
              style={{
                width: "100%",
                borderRadius: 8,
              }}
              icon={<AlertError />}
              severity="error"
              disabled={loading?.download}
              onClose={() => {
                handleCancelUpload();
                // setError(null);
                // setUploadedFile(null);
              }}
            >
              {error}
            </Alert>
          </div>
        )}

        <div className="file_size_type_section">
          <p>{t("leads.led_supported_file")}</p>
          <p>{t("imortusermodal.imp_user_maxsize")}</p>
        </div>
      </div>
      <div className="manager-roles-headers-roles update-data-btn">
        <button
          variant="contained"
          color="success"
          className="down-button"
          disabled={loading?.download || error}
          onClick={() => handleUploadData()}
          style={{ marginRight: "20px", width: "100%" }}
        >
          {loading?.upload ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            "Update data"
          )}
        </button>
      </div>
    </div>
  );
  e;
};

export default DataUpdateCenter;
