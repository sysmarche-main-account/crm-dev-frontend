import React from "react";
import CloseIcon from "@/images/close-icon.svg";
import { useTranslations } from "next-intl";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const CriteriaDetailsModal = ({ open, onClose, data }) => {
  const t = useTranslations();
  console.log("data", data);

  if (!open) return null;

  return (
    <div className="import-user-modal downloadCriteria">
      <div className="modal-header">
        <h2>{t("marketing.mktg_drm_download")}</h2>
        <button
          id="marketing-criteria-details-close-btn"
          className="close-btn"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="download-section-reports">
        <div className="Content">
          <TableContainer
            className="custom-scrollbar"
            component={Paper}
            style={{ maxHeight: 400, overflow: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>{t("marketing.mktg_criteria_header")}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{t("marketing.mktg_drm_condition_label")}</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{t("marketing.mktg_criteria_value")}</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.search_criteria_full &&
                data?.search_criteria_full?.length > 0 ? (
                  data?.search_criteria_full?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.header}</TableCell>
                      <TableCell>{row.condition}</TableCell>
                      {row.value && <TableCell>{row.value}</TableCell>}
                      {/* {row.startValue && (
                        <TableCell>{row.startValue}</TableCell>
                      )}
                      {row.endValue && <TableCell>{row.endValue}</TableCell>} */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      {t("marketing.mktg_criteria_no_criteria")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <div className="modal-footer">
        <Button
          id="marketing-criteria-details-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "20px" }}
          className="cancel-button"
        >
          {t("profile.cancel_btn")}
        </Button>
      </div>
    </div>
  );
};

export default CriteriaDetailsModal;
