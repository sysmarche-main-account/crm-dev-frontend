"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import * as Yup from "yup";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import SearchIcon from "@/images/search.svg";
import { useTranslations } from "next-intl";
import { ErrorMessage, Form, Formik } from "formik";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import {
  getRoleListDDAction,
  handleSingleCreateUserMappingAction,
  handleSingleRoleDetailsAction,
} from "@/app/actions/rolesActions";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";

const AssignNewRolesModal = ({
  open,
  onClose,
  data,
  handleDataChangeMain,
  DisableModalOpen,
}) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  if (!open) {
    return null; // Don't render if modal is not open
  }
  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(false);

  const [roleList, setRoleList] = useState(null);
  const [userList, setUserList] = useState(null);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [debouncedInput, setDebouncedInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [roleListLoading, setRoleListLoading] = useState(false);
  const [userListLoading, setUserListLoading] = useState(false);

  const [refresh, setRefresh] = useState(false);

  const getRoleDetails = async () => {
    setUserListLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: data?.id,
    };
    try {
      const result = await handleSingleRoleDetailsAction(csrfToken, reqbody);
      // console.log("single role details result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final role details", decrypted);

        setUserList(decrypted?.users);
        setUserListLoading(false);
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
        setUserListLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setUserListLoading(false);
    }
  };

  const getRoleList = async () => {
    setRoleListLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    try {
      const result = await getRoleListDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final roles", decrypted);

        if (decrypted?.length > 0) {
          const filteredRoles = decrypted?.filter(
            (role) => role?.id !== data?.id
          );
          setRoleList(filteredRoles);
        } else {
          setRoleList(decrypted);
        }
        setRoleListLoading(false);
      } else {
        console.error(result.error);
        setRoleListLoading(false);
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
      setRoleListLoading(false);
    }
  };

  useEffect(() => {
    getRoleList();
    getRoleDetails();
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(searchTerm); // Update debounced value after a delay
    }, 550); // Adjust debounce delay as needed (e.g., 500ms)
    return () => clearTimeout(timer); // Cleanup timer on input change
  }, [searchTerm]);

  useEffect(() => {
    getRoleDetails();
  }, [debouncedInput, refresh]);

  useEffect(() => {
    if (userList?.length === 0) {
      onClose();
      DisableModalOpen();
    }
  }, [userList]);

  const formikRef = useRef();

  const mapRoleModalNewValidationSchema = Yup.object({
    role: Yup.number().required(t("profile.400017")),
  });

  const handleUserSelect = (event, user) => {
    const isChecked = event.target.checked; // Get the checked state from the event
    if (isChecked) {
      const isPresent = selectedUsers.some((u) => u.uuid === user.uudi);
      // If checked, add the user to selectedUsers
      if (!isPresent) {
        setSelectedUsers((prevSelected) => [...prevSelected, user]);
      }
    } else {
      // If unchecked, remove the user from selectedUsers
      setSelectedUsers((prevSelected) =>
        prevSelected.filter((u) => u !== user)
      );
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(userList.map((user) => user));
    }
  };

  const handleSubmit = async (values) => {
    // console.log(values);
    setIsLoading(true);
    const csrfToken = await getCsrfToken();
    const allSelectedIds = selectedUsers.map((user) => user.uuid);
    const reqbody = {
      role_id: values.role,
      user_id: allSelectedIds,
    };
    console.log("body", reqbody);
    try {
      const result = await handleSingleCreateUserMappingAction(
        csrfToken,
        reqbody
      );
      // console.log("create user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        formikRef.current.resetForm();
        setIsLoading(false);
        showSnackbar({
          message: `<strong>${decrypted[0]?.user_role?.name}</strong> ${t(
            "manage_roles.mr_maprole_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        handleDataChangeMain();
        setSelectedUsers([]);
        setRefresh(!refresh);
      } else {
        console.error(result.error);
        setIsLoading(false);
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
      setIsLoading(false);
    }

    // const assign_users = users
    //   .filter((user) => selectedUsers.includes(user.id)) // Filter to get only selected users
    //   .map((user) => user.name);

    // const newMapRole = {
    //   id: data.length + 1,
    //   university: data.university,
    //   role: values.role,
    //   assignedUsers: assign_users,
    // };
    // console.log("final", newMapRole);
    // setData([...data, newMapRole]);
    // onClose();
  };

  return (
    <div className="map-roles-modal-wrapper" id="map-roles-modal-wrapper">
      <div className="modal-header-roles" id="modal-header-roles">
        <h2>{t("manage_roles.mr_deactivate_asignrole")}</h2>
        <div
          id="roles-manage-role-close-btn"
          className="close-button"
          onClick={() => {
            onClose();
          }}
        >
          <CloseIcon />
        </div>
      </div>
      <div className="modal-body" id="modal-body">
        <div className="modal-body-content" id="modal-body-content">
          <Formik
            innerRef={formikRef}
            initialValues={{
              role: "",
            }}
            validationSchema={mapRoleModalNewValidationSchema}
            onSubmit={(values) => {
              if (selectedUsers.length === 0) {
                showSnackbar({
                  message: `${t("manage_roles.mr_deactive_assign_selecrole")}`,
                  severity: "error",
                  anchorOrigin: { vertical: "top", horizontal: "right" },
                });
              } else {
                handleSubmit(values);
              }
            }}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <div
                  className="edit-map-modal-content"
                  id="edit-map-modal-content"
                >
                  {/* Select role */}
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="reportingTo">
                      {t("manage_roles.mr_em_select_role")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="roles-manage-role-DD"
                      value={roleListLoading ? "loading" : values.role}
                      onChange={(e) => setFieldValue("role", e.target.value)}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      style={{ height: "40px" }}
                      className={
                        touched.reportingTo && errors.reportingTo
                          ? "input-error"
                          : ""
                      }
                    >
                      <MenuItem disabled value="">
                        <span className="map-role-item">
                          {t("manage_roles.mr_mu_role_phldr")}
                        </span>
                      </MenuItem>
                      {roleListLoading ? (
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
                      ) : roleList?.length === 0 || !roleList ? (
                        <MenuItem disabled>
                          {t("manage_roles.mr_deactive_assign_no_role")}
                        </MenuItem>
                      ) : (
                        roleList?.length > 0 &&
                        roleList?.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className="user-selection" id="user-selection">
          <label className="role-label" htmlFor="users">
            {t("manage_roles.mr_deacti_assignrole_select")}
          </label>
          <div className="search-select-all" id="search-select-all"></div>
          <div className="user-selection-content" id="user-selection-content">
            <div className="user-list" id="user-list">
              <div
                className="search-box"
                id="search-box"
                style={{ margin: "0" }}
              >
                <input
                  id="roles-manage-role-main-search"
                  style={{ width: "100%" }}
                  type="text"
                  placeholder={t("manage_roles.mr_mu_search_phlsr")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="search-icon" id="search-icon">
                  <SearchIcon />
                </div>
              </div>
              <FormGroup className="user-item-wrapper" id="user-item-wrapper">
                {userListLoading ? (
                  <div
                    id="user-list-loading"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={50} color="#000" />
                  </div>
                ) : userList?.length > 0 ? (
                  userList?.map((user) => (
                    <div
                      key={user.uuid}
                      className="user-item"
                      id={`user-item-${user.uuid}`}
                    >
                      <span>
                        {user.first_name} {user.last_name}
                      </span>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id={`roles-manage-role-checkbox-${user?.uuid}`}
                            checked={selectedUsers.some(
                              (selectedUser) => selectedUser.uuid === user.uuid
                            )}
                            onChange={(event) => handleUserSelect(event, user)} // Handle checkbox change
                          />
                        }
                      />
                    </div>
                  ))
                ) : (
                  <div
                    id="no-user-found"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <span>{t("manage_roles.mr_no_user_found")}</span>
                  </div>
                )}
              </FormGroup>
            </div>

            <div
              className={`selected-user-list ${
                selectedUsers.length === 0 ? "bg-empty" : ""
              }`}
              id="selected-user-list"
            >
              <div className="selected-user-header" id="selected-user-header">
                <h4>{t("manage_roles.mr_mu_selected_users")}</h4>
                <Button
                  id="roles-manage-role-select-btn"
                  disabled={userListLoading}
                  onClick={handleSelectAll}
                  className="selection-button-roles"
                >
                  {selectedUsers.length > 0
                    ? t("manage_roles.mr_mu_unselect_all")
                    : t("manage_roles.mr_mu_select_all")}
                </Button>
              </div>
              <FormGroup
                className="user-item-wrapper-listing"
                id="user-item-wrapper-listing"
              >
                {selectedUsers.map((user) => {
                  return (
                    <div
                      key={user.uuid}
                      className="user-item"
                      id={`selected-user-item-${user.uuid}`}
                    >
                      <span>
                        {user.first_name} {user.last_name}
                      </span>
                      <FormControlLabel
                        control={
                          <Checkbox
                            id="roles-manage-role-selection-checkbox"
                            checked={true} // Always checked since it's in the selectedUsers array
                            onChange={(event) => handleUserSelect(event, user)} // Unselect if unchecked
                          />
                        }
                      />
                    </div>
                  );
                })}
              </FormGroup>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer" id="modal-footer">
        <Button
          id="roles-manage-role-cancel-btn"
          variant="outlined"
          onClick={() => {
            onClose();
          }}
          style={{ marginLeft: "25px" }}
        >
          {t("manage_roles.mr_mu_btn_cancel")}
        </Button>
        <Button
          id="roles-manage-role-submit-btn"
          variant="contained"
          color="success"
          className="map-role-button"
          onClick={() => formikRef.current.submitForm()}
          style={{ marginRight: "25px" }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("manage_roles.mr_mu_map")
          )}
        </Button>
      </div>
    </div>
  );
};

export default AssignNewRolesModal;
