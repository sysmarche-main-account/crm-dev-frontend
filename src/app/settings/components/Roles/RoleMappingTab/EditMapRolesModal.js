"use client";
import React, { useEffect, useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
// import "@/styles/MapRolesModal.scss";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import SearchIcon from "@/images/search.svg";
import * as Yup from "yup";
import { ErrorMessage, Form, Formik } from "formik";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  handleSingleCreateUserMappingAction,
  handleSingleRoleDetailsAction,
} from "@/app/actions/rolesActions";
import { getUsersDDAction } from "@/app/actions/userActions";
import { decryptClient } from "@/utils/decryptClient";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";

const EditMapRolesModal = ({
  open,
  onClose,
  selectedRow,
  handleDataChange,
}) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();

  if (!open) {
    return null; // Don't render if modal is not open
  }

  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [roleDetails, setRoleDetails] = useState(null);
  const [userList, setUserList] = useState(null);

  const [roleListLoading, setRoleListLoading] = useState(false);
  const [userListLoading, setUserListLoading] = useState(false);
  const [selectedUsersLoading, setSelectedUsersLoading] = useState(false);

  const [debouncedInput, setDebouncedInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const formikEditMapRoleRef = useRef();

  const mapRoleModalNewValidationSchema = Yup.object({
    role: Yup.number().required("Role is required"),
  });

  const getUserList = async () => {
    setUserListLoading(true);
    setSelectedUsersLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      search: searchTerm,
      status: "Active",
    };
    try {
      const result = await getUsersDDAction(csrfToken, reqbody);
      // console.log("user list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);

        setUserList(decrypted);
        setUserListLoading(false);
      } else {
        console.error(result.error);
        setUserListLoading(false);
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
      setUserListLoading(false);
    }
  };

  const getRoleDetails = async () => {
    setRoleListLoading(true);
    setSelectedUsersLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedRow,
    };
    try {
      const result = await handleSingleRoleDetailsAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setRoleDetails(decrypted);
        setSelectedUsers(decrypted?.users);
        setRoleListLoading(false);
        setSelectedUsersLoading(false);
      } else {
        console.error(result.error);
        setRoleListLoading(false);
        setSelectedUsersLoading(false);
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
      setSelectedUsersLoading(false);
    }
  };

  useEffect(() => {
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
    getUserList();
  }, [debouncedInput]);

  const handleUserSelect = (event, user) => {
    const isChecked = event.target.checked; // Get the checked state from the event
    if (isChecked) {
      const isPresent = selectedUsers.some((u) => u.uuid === user.uuid);
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
      setSelectedUsers(users.map((user) => user.name));
    }
  };

  const handleEditSubmit = async (values) => {
    // console.log(values);

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

        setIsLoading(false);
        showSnackbar({
          message: `<strong>${roleDetails?.name}</strong> ${t(
            "manage_roles.mr_editmaprole_alert"
          )}`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });
        handleDataChange();
        onClose();
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

    // const updatedDataMapRoles = data.map((role) => {
    //   if (role.id === selectedRow.id) {
    //     return {
    //       ...role,
    //       role: values.role,
    //       assignedUsers: selectedUsers,
    //     };
    //   }
    //   return role;
    // });
    // setData(updatedDataMapRoles);
    // handleAlert();
    // onClose();
  };

  return (
    <div id="roles-mapping-edit-wrapper" className="map-roles-modal-wrapper">
      <div id="roles-mapping-edit-header" className="modal-header-roles">
        <h2>{t("manage_roles.mr_er_header")}</h2>
        <div
          id="roles-mapping-edit-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>

      {roleListLoading ? (
        <div
          id="roles-mapping-edit-loader"
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={50} color="#000" />
        </div>
      ) : (
        <div id="roles-mapping-edit-body" className="modal-body">
          <div
            id="roles-mapping-edit-body-content"
            className="modal-body-content"
          >
            <Formik
              innerRef={formikEditMapRoleRef}
              initialValues={{
                role: roleDetails?.id || "",
              }}
              validationSchema={mapRoleModalNewValidationSchema}
              onSubmit={handleEditSubmit}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form>
                  <div
                    id="roles-mapping-edit-form-content"
                    className="edit-map-modal-content"
                  >
                    <FormControl fullWidth>
                      <label className="role-label" htmlFor="reportingTo">
                        {t("manage_roles.mr_em_select_role")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="roles-mapping-edit-role"
                        key={roleDetails?.id}
                        value={values.role || roleDetails?.id || ""}
                        // onChange={(e) => setFieldValue("role", e.target.value)}
                        disabled
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
                            {/* Select role */}
                            {t("manage_roles.mr_em_select_role")}
                          </span>
                        </MenuItem>
                        <MenuItem value={roleDetails?.id}>
                          {roleDetails?.name}
                        </MenuItem>
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

          <div
            id="roles-mapping-edit-user-selection"
            className="user-selection"
          >
            <label className="role-label" htmlFor="users">
              {t("manage_roles.mr_deacti_assignrole_select")}
            </label>
            <div
              id="roles-mapping-edit-search-select-all"
              className="search-select-all"
            ></div>
            <div
              id="roles-mapping-edit-user-selection-content"
              className="user-selection-content"
            >
              <div id="roles-mapping-edit-user-list" className="user-list">
                <div
                  id="roles-mapping-edit-search-box"
                  className="search-box"
                  style={{ margin: "0" }}
                >
                  <input
                    id="roles-mapping-edit-search-main"
                    style={{ width: "100%" }}
                    type="text"
                    placeholder={t("manage_roles.mr_em_search_phlsr")}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div
                    id="roles-mapping-edit-search-icon"
                    className="search-icon"
                  >
                    <SearchIcon />
                  </div>
                </div>
                <FormGroup className="user-item-wrapper">
                  {userListLoading ? (
                    <div
                      id="roles-mapping-edit-user-loader"
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
                        id={`roles-mapping-edit-user-${user.uuid}`}
                        className="user-item"
                      >
                        <span>
                          {user.first_name} {user.last_name}
                        </span>
                        <FormControlLabel
                          control={
                            <Checkbox
                              id={`roles-mapping-edit-checkbox-${user?.uuid}`}
                              checked={selectedUsers.some(
                                (selectedUser) =>
                                  selectedUser.uuid === user.uuid
                              )}
                              onChange={(event) =>
                                handleUserSelect(event, user)
                              } // Handle checkbox change
                            />
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <div
                      id="roles-mapping-edit-no-user"
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
                id="roles-mapping-edit-selected-user-list"
                className={`selected-user-list ${
                  selectedUsers.length === 0 && "bg-empty"
                }`}
              >
                <div
                  id="roles-mapping-edit-selected-user-header"
                  className="selected-user-header"
                >
                  <h4>{t("manage_roles.mr_em_selected_users")}</h4>
                  <Button
                    id="roles-mapping-edit-select-btn"
                    onClick={handleSelectAll}
                    className="selection-button-roles"
                  >
                    {selectedUsers.length > 0
                      ? t("manage_roles.mr_em_unselect_all")
                      : t("manage_roles.mr_em_select_all")}
                  </Button>
                </div>
                <FormGroup className="user-item-wrapper-listing">
                  {selectedUsers.map((user) => {
                    return (
                      <div
                        key={user.uuid}
                        id={`roles-mapping-edit-selected-user-${user.uuid}`}
                        className="user-item"
                      >
                        <span>
                          {user.first_name} {user.last_name}
                        </span>
                        <FormControlLabel
                          control={
                            <Checkbox
                              id={`roles-mapping-edit-checkbox-single-${user?.uuid}`}
                              checked={true} // Always checked since it's in the selectedUsers array
                              onChange={(event) =>
                                handleUserSelect(event, user)
                              } // Unselect if unchecked
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
      )}

      <div id="roles-mapping-edit-footer" className="modal-footer">
        <Button
          id="roles-mapping-edit-cancel-btn"
          variant="outlined"
          onClick={onClose}
          style={{ marginLeft: "25px" }}
        >
          {t("manage_roles.mr_em_btn_cancel")}
        </Button>
        <Button
          id="roles-mapping-edit-submit-btn"
          variant="contained"
          color="success"
          className="map-role-button"
          onClick={() => formikEditMapRoleRef.current.submitForm()}
          style={{ marginRight: "25px" }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("manage_roles.mr_em_map")
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditMapRolesModal;
