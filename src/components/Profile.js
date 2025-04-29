"use client";
import React, { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next"; // Import useTranslation hook
import { useTranslations } from "next-intl";
import Modal from "./common/Modal/Modal";
import CancelIcon from "@/images/cancel-right.svg";
import DeleteIcon from "@/images/delete-icon.svg";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import {
  handleProfileDataUpdateAction,
  handleUploadImageAction,
} from "@/app/actions/profileActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { setDetails } from "@/lib/slices/userSlice";
import {
  Alert,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { DoDisturb, TaskAlt } from "@mui/icons-material";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";
import { masterDDAction } from "@/app/actions/commonActions";
import { get } from "jquery";
// import "@/styles/Profile.scss";

const Profile = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations(); // Initialize the translation hook
  const { details, permissions } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const formikRefProfile = useRef();
  const profileValidationSchema = Yup.object({
    fname: Yup.string()
      .min(3, "First Name should be atleast or more than 3 characters.")
      .max(100, "First name cannot be grater than 100 characters!")
      .matches(/^[A-Za-z ]+$/, t("profile.400344"))
      .required(t("profile.400014"))
      .trim()
      .transform((value) => value?.trim()),
    lname: Yup.string()
      .min(3, "Last Name should be atleast or more than 3 characters.")
      .max(100, "Last name cannot be grater than 100 characters!")
      .matches(/^[A-Za-z ]+$/, t("profile.400344"))
      .required(t("profile.400015"))
      .trim()
      .transform((value) => value?.trim()),
    email: Yup.string()
      .max(300, "Email should be less than 300 characters")
      .email(t("login.400001"))
      .required(t("profile.400001"))
      .trim()
      .transform((value) => value?.trim()),
    mobileNo: Yup.string()
      .matches(/^\d{10}$/, t("leads.400345"))
      .required(t("profile.400020"))
      .trim()
      .transform((value) => value?.trim()),
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const [picLoading, setPicLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [picFile, setPicFile] = useState(null);

  const [isEdit, setIsEdit] = useState(false);
  const [editLodaing, setEditLoading] = useState(false);

  // **States for Delete Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalActions, setModalActions] = useState([]);
  const [actionType, setActionType] = useState("");
  // **

  const [loading, setLoading] = useState({
    uni: false,
  });
  const [universities, setUniversities] = useState([]);

  const getUniversitiesList = async () => {
    setLoading((prev) => ({ ...prev, uni: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      status: "1", // optional input will be integer
      identifier: ["university"], // mandatory input will be an array
      // "parent_id": "0" // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        if (details?.university?.includes(0)) {
          setUniversities(decrypted);
        } else {
          const filtered = decrypted?.filter((uni) =>
            details?.university?.some((d) => d.id === uni?.id)
          );
          setUniversities(filtered);
        }
        setLoading((prev) => ({ ...prev, uni: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, uni: false }));
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
      setLoading((prev) => ({ ...prev, uni: false }));
    }
  };

  // Handle picture upload with resizing
  const handleUploadPicture = (event) => {
    const file = event.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      showSnackbar({
        message: `Only image files are allowed.`,
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      event.target.value = ""; // Reset the file input
      return;
    }
    setPicFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 72;
          canvas.height = 72;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, 72, 72);
          const resizedImage = canvas.toDataURL();
          setProfilePicture(resizedImage);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalClose = () => setIsModalOpen(false);

  // Handle picture deletion
  const handleDeletePicture = async () => {
    // setProfilePicture(null);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: details?.uuid,
      delete_profile_img: 1,
    };
    try {
      const result = await handleUploadImageAction(csrfToken, reqbody);
      // console.log("profilepic upload result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("picture final", decrypted);

        const token = details?.session_token;
        dispatch(setDetails({ session_token: token, ...decrypted }));
        setPicLoading(false);
        handleModalClose();
        showSnackbar({
          message: `Profile Picture deleted successfully!`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
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
        setPicLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleActionClick = (action) => {
    if (action === "Delete") {
      setActionType("Delete");
      setModalTitle(`Delete Profile Picture?`);
      setModalContent(
        "Are you sure you want to delete the current Profile Picture?"
      );
      setModalActions([
        {
          label: "Cancel",
          className: "cancel-button",
          onClick: handleModalClose,
        },
        {
          label: t("leads.led_del_btn"),
          className: "confirm-button",
          onClick: handleDeletePicture,
        },
      ]);
      setIsModalOpen(true); // Open the modal for Delete action
    }
  };

  const handleProfileDataEdit = async (values) => {
    setEditLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: details?.uuid,
      first_name: values.fname,
      last_name: values.lname,
      email: values.email,
      mobile_number: values.mobileNo,
      reporting_manager: details?.reporting_manager?.uuid,
    };
    // console.log("rebody", reqbody);
    try {
      const result = await handleProfileDataUpdateAction(csrfToken, reqbody);
      // console.log("profileData result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        const token = details?.session_token;
        dispatch(setDetails({ session_token: token, ...decrypted }));
        setEditLoading(false);
        setIsEdit(false);
        setRefreshKey((prevKey) => prevKey + 0.1);
        showSnackbar({
          message: `${t("profile.profile_submit")}!`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
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
        setEditLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setEditLoading(false);
    }
  };

  useEffect(() => {
    getUniversitiesList();
  }, []);

  useEffect(() => {
    if (picFile) {
      const handleProfilePicUpload = async () => {
        setPicLoading(true);
        const csrfToken = await getCsrfToken();
        const formData = new FormData();
        formData.append("uuid", details?.uuid);
        formData.append("profile_img", picFile);
        // formData.forEach((value, key) => {
        //   console.log(`${key}: ${value}`);
        // });
        try {
          const result = await handleUploadImageAction(csrfToken, formData);
          // console.log("profilepic upload result:", result);

          if (result.success && result.status === 200) {
            const { iv, encryptedData } = result?.data;
            const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
            const decrypted = decryptClient(iv, encryptedData, key);
            // console.log("picture final", decrypted);

            const token = details?.session_token;
            dispatch(setDetails({ session_token: token, ...decrypted }));
            setPicLoading(false);
            showSnackbar({
              message: `${t("profile.profile_picture_submit")}!`,
              severity: "success",
              anchorOrigin: { vertical: "top", horizontal: "center" },
            });
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
                window.location.reload();
                getToken();
              }
              if (errValues.length > 0) {
                errValues.map((errmsg) =>
                  showSnackbar({
                    message: `${errmsg}`,
                    severity: "error",
                    anchorOrigin: { vertical: "top", horizontal: "center" },
                  })
                );
              }
            }
            setPicLoading(false);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
          setPicLoading(false);
        }
      };
      handleProfilePicUpload();
    }
  }, [picFile]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setProfilePicture(details?.profile_img);
    img.onerror = () => setProfilePicture(false);
    img.src = details?.profile_img || "";
  }, [details?.profile_img]);

  const profileActions =
    permissions?.settingsActions &&
    permissions?.settingsActions.filter((set) => set.parent === 6);

  return (
    <div className="profile" key={refreshKey}>
      <div className="profile-header">
        <div style={{ display: "flex" }}>
          <div className="profile-pic">
            {profilePicture ? (
              // <img
              //   src={profilePicture}
              //   alt="Profile"
              //   style={{ width: "72px", height: "72px" }}
              // />
              <Avatar
                src={profilePicture}
                sx={{
                  width: "72px",
                  height: "72px",
                  bgcolor: !details?.profile_img ? "#BFFA7D" : null,
                  color: !details?.profile_img ? "#6CB11F" : null,
                  border: !details?.profile_img ? "0.8px solid #8AF611" : null,
                }}
                alt={`${details?.first_name} ${details?.last_name}`}
              />
            ) : (
              `${details?.first_name[0].toUpperCase()}${details?.last_name[0].toUpperCase()}`
            )}
          </div>
          <div className="profile-details">
            <h2> {t("profile.prf_pic")}</h2>
            <p>{t("profile.prf_pic_format")}</p>
          </div>
        </div>

        <div className="profile-actions">
          <input
            type="file"
            id="upload"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleUploadPicture}
          />
          {profileActions && profileActions.some((act) => act.id === 20) ? (
            <button
              id="profile-pic-upload-btn"
              className="btn"
              onClick={() => document.getElementById("upload").click()}
            >
              {picLoading ? (
                <div>
                  <CircularProgress size={20} color="#000" />
                </div>
              ) : (
                t("profile.upload_new_pic")
              )}
            </button>
          ) : null}
          {profileActions && profileActions.some((act) => act.id === 21) ? (
            <button
              id="profile-pic-delete-btn"
              className="btn btn-delete"
              onClick={() => handleActionClick("Delete")}
              disabled={!profilePicture}
            >
              {t("profile.del_pic")}
            </button>
          ) : null}
        </div>
      </div>
      <hr />
      <div className="personal-details">
        <div className="personal-details-content">
          <h3>{t("profile.personal_details")}</h3>
          {profileActions && profileActions.some((act) => act.id === 18)
            ? !isEdit && (
                <button
                  id="profile-edit-allow-btn"
                  className="btn-edit"
                  onClick={() => {
                    setIsEdit(true);
                  }}
                >
                  {t("profile.edit_btn")}
                </button>
              )
            : null}
        </div>
        <Formik
          innerRef={formikRefProfile}
          initialValues={{
            fname: details?.first_name ?? "",
            lname: details?.last_name ?? "",
            email: details?.email ?? "",
            mobileNo: details?.mobile_number ?? "",
          }}
          validationSchema={profileValidationSchema}
          onSubmit={(values) => {
            handleProfileDataEdit(values);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              {/* first_name */}
              <div className="form-group">
                <label htmlFor="fname">
                  {t("profile.prf_fn_lab")}
                  <span style={{ color: "#F00" }}>*</span>
                </label>
                <Field
                  id="profile-fname"
                  type="text"
                  name="fname"
                  className={touched.fname && errors.fname ? "input-error" : ""}
                  placeholder={t("profile.prf_fn_phldr")}
                  disabled={!isEdit}
                />
                <ErrorMessage
                  name="fname"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* last_name */}
              <div className="form-group">
                <label htmlFor="lanme">
                  {t("profile.prf_ln_lab")}
                  <span style={{ color: "#F00" }}>*</span>
                </label>
                <Field
                  id="profile-lname"
                  type="text"
                  name="lname"
                  className={touched.lname && errors.lname ? "input-error" : ""}
                  placeholder={t("profile.prf_ln_phldr")}
                  disabled={!isEdit}
                />
                <ErrorMessage
                  name="lname"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* email */}
              <div className="form-group">
                <label htmlFor="email">
                  {t("profile.prf_email_lab")}
                  <span style={{ color: "#F00" }}>*</span>
                </label>
                <Field
                  id="profile-email"
                  type="email"
                  name="email"
                  className={touched.email && errors.email ? "input-error" : ""}
                  placeholder={t("profile.prf_email_phldr")}
                  disabled={!isEdit}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* mobile_number */}
              <div className="form-group">
                <label htmlFor="mobileNo">
                  {t("profile.prf_mn_lab")}
                  <span style={{ color: "#F00" }}>*</span>
                </label>
                <Field
                  id="profile-mobile-no"
                  type="text"
                  name="mobileNo"
                  className={
                    touched.mobileNo && errors.mobileNo ? "input-error" : ""
                  }
                  placeholder={t("profile.prf_mn_phldr")}
                  disabled={!isEdit}
                />
                <ErrorMessage
                  name="mobileNo"
                  component="div"
                  className="error-message"
                />
              </div>

              {/* reporting_manager */}
              <div className="form-group">
                <label>{t("profile.reporting_to_phldr")}</label>
                <input
                  id="profile-reporting-to"
                  type="text"
                  disabled
                  value={
                    // details?.reporting_manager && details?.role?.id === 1
                    details?.reporting_manager
                      ? `${details?.reporting_manager?.first_name} ${details?.reporting_manager?.last_name}`
                      : // : !details?.reporting_manager && details?.role?.id !== 1
                      !details?.reporting_manager
                      ? `Connect with your Manager`
                      : "Not Applicable"
                  }
                />
              </div>

              {/* role */}
              <div className="form-group">
                <label>{t("profile.role_lab")}</label>
                <input type="text" disabled value={details?.role?.name} />
              </div>

              {/* uni_assigned */}
              {/* <div>
                <label>{t("profile.uni_assigned")}</label>
                {loading?.uni ? (
                  <>
                    <CircularProgress size={20} color="#000" />
                  </>
                ) : (
                  <div>
                    {universities &&
                    universities?.length > 0 &&
                    universities?.length <= 1
                      ? universities.map((uni) => (
                          <Chip
                            key={uni?.id}
                            label={uni?.name}
                            variant="filled"
                            color="success"
                            sx={{
                              color: "#000",
                              border: "1px solid #00BC70",
                              background: "#ebfaf3",
                              margin: 1,
                            }}
                          />
                        ))
                      : universities?.length > 1
                      ? universities?.slice(0, 1).map((uni) => (
                          <Chip
                            key={uni?.id}
                            label={uni?.name}
                            variant="filled"
                            color="success"
                            sx={{
                              color: "#000",
                              border: "1px solid #00BC70",
                              background: "#ebfaf3",
                            }}
                          />
                        ))
                      : t("profile.no_uni_assigned")}
                    <Tooltip
                      placement="right-start"
                      title={
                        <div className="tooltip-scrollable">
                          {universities?.length > 1
                            ? universities?.slice(1).map((uni, index) => (
                                <List key={uni?.id}>
                                  <ListItem button disablePadding>
                                    <ListItemText primary={uni?.name} />
                                  </ListItem>
                                  {index !== universities?.length - 1 && (
                                    <Divider
                                      sx={{ borderColor: "#FFFFFF1A" }}
                                      component="li"
                                    />
                                  )}
                                </List>
                              ))
                            : null}
                        </div>
                      }
                      arrow
                    >
                      {universities?.length > 1 && (
                        <span className="uni-chips">
                          +{universities?.length - 1} more
                        </span>
                      )}
                    </Tooltip>
                  </div>
                )}
              </div> */}
              <div>
                <label>{t("profile.uni_assigned")}</label>
                {loading?.uni ? (
                  <CircularProgress size={20} color="#000" />
                ) : (
                  <div>
                    {universities && universities.length > 0 ? (
                      universities.length === 1 ? (
                        universities.map((uni) => (
                          <Chip
                            key={uni.id}
                            label={uni.name}
                            variant="filled"
                            color="success"
                            sx={{
                              color: "#000",
                              border: "1px solid #00BC70",
                              background: "#ebfaf3",
                              margin: 1,
                            }}
                          />
                        ))
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {universities.slice(0, 1).map((uni) => (
                            <Chip
                              key={uni.id}
                              label={uni.name}
                              variant="filled"
                              color="success"
                              sx={{
                                color: "#000",
                                border: "1px solid #00BC70",
                                background: "#ebfaf3",
                              }}
                            />
                          ))}
                          {universities.length > 1 && (
                            <Tooltip
                              placement="right-start"
                              title={
                                <div className="tooltip-scrollable">
                                  <List dense>
                                    {universities.slice(1).map((uni, index) => (
                                      <React.Fragment key={uni.id}>
                                        <ListItem>
                                          <ListItemText primary={uni.name} />
                                        </ListItem>
                                        {index !==
                                          universities.slice(1).length - 1 && (
                                          <Divider
                                            sx={{ borderColor: "#FFFFFF1A" }}
                                            component="li"
                                          />
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </List>
                                </div>
                              }
                              arrow
                            >
                              <span className="uni-chips">
                                +{universities.length - 1} more
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      )
                    ) : (
                      t("profile.no_uni_assigned")
                    )}
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            title={modalTitle}
            icon={actionType === "Delete" ? DeleteIcon : CancelIcon}
            content={modalContent}
            actions={modalActions}
          />
        )}
        {isEdit && (
          <div className="action-btns">
            <button className="cancel-button" onClick={() => setIsEdit(false)}>
              {t("profile.cancel_btn")}
            </button>
            <button
              className="confirm-button"
              onClick={() => {
                formikRefProfile.current.submitForm();
              }}
            >
              {editLodaing ? (
                <CircularProgress size={20} color="#000" />
              ) : (
                t("followup.cf_save")
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
