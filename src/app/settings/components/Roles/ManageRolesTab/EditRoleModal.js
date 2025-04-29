"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  MenuItem,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Chip,
  Box,
  FormControlLabel,
  CircularProgress,
  FormControl,
  Select,
} from "@mui/material";
import ChevronDown from "@/images/chevron-down.svg";
import CloseIcon from "@/images/close-icon.svg";
import { IOSSwitch } from "@/components/Utils";
// import "@/styles/CreateRoleModal.scss";
import { useTranslations } from "next-intl";
import { ChevronRight, ExpandMore, Settings } from "@mui/icons-material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  handleEditRoleAction,
  handleSingleRoleDetailsAction,
} from "@/app/actions/rolesActions";
import { decryptClient } from "@/utils/decryptClient";
import { masterDDAction } from "@/app/actions/commonActions";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getToken } from "@/utils/getToken";

const EditRoleModal = ({
  open,
  onClose,
  templateData,
  selectedRow,
  handleDataChange,
}) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const formikEditRoleRef = useRef();

  const editRoleSchema = Yup.object({
    role: Yup.string()
      .min(3)
      .max(100)
      .matches(/^[A-Za-z ]+$/, t("manage_user.400344"))
      .required(t("manage_roles.400360"))
      .trim()
      .transform((value) => value?.trim()),
    roleType: Yup.number().required(t("manage_roles.400361")),
    description: Yup.string()
      .trim()
      .transform((value) => value?.trim()),
  });

  const [permissions] = useState(templateData);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState({});
  const [selectedChip, setSelectedChip] = useState(null);

  const [roleDetails, setRoleDetails] = useState(null);
  const [finalPerm, setFinalPerm] = useState([]);

  const [roleTypeOptions, setRoleTypeOptions] = useState([]);
  const [roleTypeOptionsLoading, setRoleTypeOptionsLoading] = useState(false);

  const [activeAcc, setActiveAcc] = useState([]);

  const [error, setError] = useState(false);

  const getRoleDetails = async () => {
    setLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedRow,
    };
    try {
      const result = await handleSingleRoleDetailsAction(csrfToken, reqbody);
      // console.log("single role details result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setRoleDetails(decrypted);
        setFinalPerm(decrypted.permissions_id);
        setSelectedChip(null);
        setActiveAcc([]); // Reset activeAcc as needed
        setPermissionTabState(); // Reset tab state
        setLoading(false);
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
        setLoading(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
    }
  };

  const getRoleTypeOptions = async () => {
    setRoleTypeOptionsLoading(true);
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["role_type"], // mandatory input will be an array
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
        setRoleTypeOptions(decrypted);
        setRoleTypeOptionsLoading(false);
      } else {
        console.error(result.error);
        setRoleTypeOptionsLoading(false);
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
      setRoleTypeOptionsLoading(false);
    }
  };

  useEffect(() => {
    getRoleTypeOptions();
  }, []);

  // Reset state when selectedRow changes
  useEffect(() => {
    if (selectedRow) {
      getRoleDetails();
    }
  }, [selectedRow]);

  const setPermissionTabState = () => {
    const topNavOptionsNumber = permissions.reduce((acc, perm) => {
      acc[perm.name] = 0;
      return acc;
    }, {});
    setSelectedTab(topNavOptionsNumber);
  };

  const handlePermission = (id, perm) => {
    const idExist = finalPerm.includes(id);
    const item = permissions.find((p) => p.id === id);

    if (idExist) {
      // Remove the ID and potentially its children
      setFinalPerm((prev) => prev.filter((permisn) => permisn !== id));
    } else {
      // Add the ID
      setFinalPerm((prev) => [...prev, id]);

      // If this is a top-level item, also add its immediate children if they exist
      if (item && item.details === "top_nav" && item.child) {
        const childIds = item.child.map((child) => child.id);
        setFinalPerm((prev) => [
          ...prev,
          ...childIds.filter((childId) => !prev.includes(childId)),
        ]);
      }
    }

    if (!activeAcc.includes(perm)) {
      setActiveAcc([...activeAcc, perm]);
    }
  };

  const handlePermissionWithParentGrandParent = (parentId, grandPID, id) => {
    const idExist = finalPerm.includes(id);
    if (idExist) {
      setFinalPerm((prev) =>
        prev.filter(
          (permisn) =>
            permisn !== id && permisn !== parentId && permisn !== grandPID
        )
      );
    } else {
      setFinalPerm([...finalPerm, id, parentId, grandPID]);
    }
  };

  const handlePermissionWithParent = (parentId, id) => {
    const idExist = finalPerm.includes(id);
    if (idExist) {
      setFinalPerm((prev) =>
        prev.filter((permisn) => permisn !== id && permisn !== parentId)
      );
    } else {
      setFinalPerm([...finalPerm, id, parentId]);
    }
  };

  const handleActiveAcc = (perm) => {
    const permExist = activeAcc.includes(perm);
    if (permExist) {
      setActiveAcc((prev) => prev.filter((permission) => permission !== perm));
    } else {
      setActiveAcc([...activeAcc, perm]);
    }
  };

  const handleTabChange = (section, newIndex) => {
    setSelectedTab((prevTabs) => ({
      ...prevTabs,
      [section]: newIndex,
    }));
  };

  // old function without the remove all if ancestor not present logic
  // function filterByLowestChildPresence(dataarr, finalarr) {
  //   // Helper function to find an item by id in dataarr
  //   const findById = (arr, id) => {
  //     for (const item of arr) {
  //       if (item.id === id) return item;
  //       const found = findById(item.child || [], id);
  //       if (found) return found;
  //     }
  //     return null;
  //   };

  //   // Recursive function to gather all intermediate parents when a lowest child is found in finalarr
  //   function collectAllAncestors(item, validIds) {
  //     if (!item) return;
  //     validIds.add(item.id);
  //     if (item.child && item.child.length > 0) {
  //       item.child.forEach((child) => {
  //         if (
  //           finalarr.includes(child.id) ||
  //           collectAnyLowestDescendant(child, finalarr)
  //         ) {
  //           collectAllAncestors(child, validIds);
  //         }
  //       });
  //     }
  //   }

  //   // Helper function to determine if any lowest descendant of an item is in finalarr
  //   function collectAnyLowestDescendant(item, finalarr) {
  //     if (!item.child || item.child.length === 0)
  //       return finalarr.includes(item.id);
  //     return item.child.some((child) =>
  //       collectAnyLowestDescendant(child, finalarr)
  //     );
  //   }

  //   // Set to store all valid IDs
  //   const validIds = new Set();

  //   dataarr.forEach((item) => {
  //     // Check if the item or any of its lowest children is in finalarr
  //     if (collectAnyLowestDescendant(item, finalarr)) {
  //       collectAllAncestors(item, validIds);
  //     }
  //   });

  //   // Filter finalarr to retain only valid IDs
  //   return Array.from(validIds).filter(
  //     (id) => finalarr.includes(id) || validIds.has(id)
  //   );
  // }

  function filterByLowestChildPresence(dataarr, finalarr) {
    // Helper function to find an item by id in dataarr
    const findById = (arr, id) => {
      for (const item of arr) {
        if (item.id === id) return item;
        const found = findById(item.child || [], id);
        if (found) return found;
      }
      return null;
    };

    // Helper function to find the parent of a node by its id
    function findParent(dataarr, childId) {
      for (const item of dataarr) {
        if (item.child && item.child.some((child) => child.id === childId)) {
          return item;
        }
        const found = findParent(item.child || [], childId);
        if (found) return found;
      }
      return null;
    }

    // Set to store all valid IDs
    const validIds = new Set();

    // First pass: Add all explicitly selected IDs and their ancestors to validIds
    finalarr.forEach((id) => {
      validIds.add(id);

      // Add all ancestors
      const item = findById(dataarr, id);
      if (item) {
        let parent = findParent(dataarr, id);
        while (parent) {
          validIds.add(parent.id);
          parent = findParent(dataarr, parent.id);
        }
      }
    });

    // Second pass: For top-level items, ensure their selected children are included
    dataarr.forEach((topItem) => {
      if (finalarr.includes(topItem.id)) {
        // Include all explicitly selected children
        if (topItem.child) {
          topItem.child.forEach((child) => {
            if (finalarr.includes(child.id)) {
              validIds.add(child.id);
            }
          });
        }
      }
    });

    // Final pass: Just return all IDs that were in the original finalPerm array
    // This ensures we don't lose any explicitly selected items
    return Array.from(validIds).filter(
      (id) =>
        finalarr.includes(id) ||
        // For items not explicitly selected, ensure their top ancestor is selected
        (findById(dataarr, id) &&
          finalarr.includes(findParent(dataarr, id)?.id))
    );
  }

  const handleEditRoleSubmit = async (values) => {
    // const arrayWithAllParentChilds = filterByLowestChildPresence(
    //   permissions,
    //   finalPerm
    // );
    // console.log("final", finalPerm);
    // console.log("final arr", arrayWithAllParentChilds);
    // console.log(values, selectedRow.id);
    setSubmitLoading(true);
    const arrayWithAllParentChilds = filterByLowestChildPresence(
      permissions,
      finalPerm
    );
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selectedRow,
      name: values.role,
      description: values.description,
      role_type: values.roleType,
      permissions: arrayWithAllParentChilds,
    };
    console.log("perms", arrayWithAllParentChilds);
    // console.log("body", reqbody);
    if (finalPerm.length === 0) {
      setError(true);
      setSubmitLoading(false);
    } else if (arrayWithAllParentChilds.length === 0) {
      setError(true);
      setSubmitLoading(false);
    } else {
      setError(false);
      try {
        const result = await handleEditRoleAction(csrfToken, reqbody);
        // console.log("edit role result:", result);

        if (result.success && result.status === 200) {
          const { iv, encryptedData } = result?.data;
          const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
          const decrypted = decryptClient(iv, encryptedData, key);
          // console.log("final", decrypted);

          formikEditRoleRef.current.resetForm();
          showSnackbar({
            message: `<strong>${decrypted.name}</strong> ${t(
              "manage_roles.mr_edit_succes_alert"
            )}`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
          onClose();
          handleDataChange();
          setSubmitLoading(false);
          setSelectedChip(null);
          setActiveAcc([]); // Reset activeAcc as needed
          setPermissionTabState(); // Reset tab state
        } else {
          console.error(result.error);
          setSubmitLoading(false);
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
              window.location.reload();
              getToken();
            }
            if (errValues.length > 0) {
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
        setSubmitLoading(false);
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="modal-container-role-section"
        id="modal-container-role-section"
      >
        <div className="modal-role" id="modal-role">
          <div className="modal-header" id="modal-header">
            <h2>{t("manage_roles.mr_er_header")}</h2>
            <Button
              id="roles-manage-edit-role-close-btn"
              className="close-btn"
              onClick={onClose}
            >
              <CloseIcon />
            </Button>
          </div>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
              id="loading-indicator"
            >
              <CircularProgress size={50} color="#000" />
            </div>
          ) : (
            <div className="modal-body-role" id="modal-body-role">
              <Formik
                innerRef={formikEditRoleRef}
                initialValues={{
                  role: roleDetails?.name || "",
                  roleType: roleDetails?.role_type?.id || "",
                  description: roleDetails?.description || "",
                }}
                validationSchema={editRoleSchema}
                onSubmit={(values) => handleEditRoleSubmit(values)}
              >
                {({ errors, touched, setFieldValue, values }) => (
                  <Form>
                    {/* name */}
                    <div className="form-group" id="form-group-role">
                      <label htmlFor="role">
                        {t("manage_roles.mr_er_lab")}
                        <span style={{ color: "#F00" }}>*</span>
                      </label>
                      <Field
                        id="roles-manage-edit-role-name"
                        type="text"
                        name="role"
                        placeholder="Enter Role name"
                        className={
                          touched.role && errors.role ? "input-error" : ""
                        }
                      />
                      <ErrorMessage
                        name="role"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    {/* description */}
                    <div className="form-group" id="form-group-description">
                      <label htmlFor="description">
                        {t("manage_roles.mr_cr_descr")}
                      </label>
                      <Field
                        id="roles-manage-edit-role-description"
                        type="text"
                        name="description"
                        placeholder="Enter Role description here.."
                        className={
                          touched.description && errors.description
                            ? "input-error"
                            : ""
                        }
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    {/* role type */}
                    <div className="form-group" id="form-group-role-type">
                      <FormControl fullWidth margin="none">
                        <label htmlFor="roleType">
                          {t("manage_roles.mr_editrole_select_type")}
                          <span style={{ color: "#F00" }}>*</span>
                        </label>
                        <Select
                          id="roles-manage-edit-role-roletype"
                          value={
                            roleTypeOptionsLoading ? "loading" : values.roleType
                          }
                          // value=""
                          onChange={(e) =>
                            setFieldValue("roleType", e.target.value)
                          }
                          IconComponent={ChevronDown}
                          fullWidth
                          displayEmpty
                          className={
                            touched.roleType && errors.roleType
                              ? "input-error"
                              : ""
                          }
                          style={{ height: "40px" }}
                        >
                          <MenuItem disabled value="">
                            <span style={{ color: "#aaa" }}>
                              {t("manage_roles.mr_editrole_select_type")}
                            </span>
                          </MenuItem>
                          {roleTypeOptionsLoading ? (
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
                          ) : roleTypeOptions.length === 0 ||
                            !roleTypeOptions ? (
                            <MenuItem disabled>
                              {t("manage_roles.mr_create_edit_roles")}
                            </MenuItem>
                          ) : (
                            roleTypeOptions.length > 0 &&
                            roleTypeOptions.map((roletype) => (
                              <MenuItem key={roletype.id} value={roletype.id}>
                                {roletype.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        <ErrorMessage
                          name="roleType"
                          component="div"
                          className="error-message"
                        />
                      </FormControl>
                    </div>
                    {/* permissions */}
                    <div
                      className="permissions-section"
                      id="permissions-section"
                    >
                      {error && (
                        <h2 style={{ color: "red" }}>
                          Role cannot be without permissions!!
                        </h2>
                      )}
                      <h3>{t("manage_roles.mr_er_set_perms")}</h3>
                      {permissions.length > 0 &&
                        permissions.map((perm) => {
                          return (
                            <Accordion
                              key={perm.id}
                              className="permission-row"
                              expanded={
                                finalPerm.includes(perm.id) &&
                                activeAcc.includes(perm.name)
                              }
                              onChange={() => {
                                if (finalPerm.includes(perm.id)) {
                                  handleActiveAcc(perm.name);
                                }
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMore />}
                                id={`accordion-summary-${perm.id}`}
                              >
                                <span className="toggle-section">
                                  {perm.name}
                                  <IOSSwitch
                                    checked={finalPerm.includes(perm.id)}
                                    onChange={() => {
                                      handlePermission(perm.id, perm.name);
                                      handleActiveAcc(perm.name);
                                    }}
                                    color="primary"
                                  />
                                </span>
                              </AccordionSummary>
                              <AccordionDetails>
                                <div
                                  className="vertical-tabs"
                                  id={`vertical-tabs-${perm.id}`}
                                >
                                  <Tabs
                                    orientation="vertical"
                                    value={selectedTab[perm.name]}
                                    onChange={(e, val) => {
                                      handleTabChange(perm.name, val);
                                      perm.child[val]?.child.length > 0 &&
                                      !selectedChip
                                        ? setSelectedChip(
                                            perm.child[val]?.child[0]?.id
                                          )
                                        : setSelectedChip(null);
                                    }}
                                    sx={{
                                      maxWidth: 235,
                                      minWidth: 230,
                                    }}
                                    TabIndicatorProps={{
                                      style: {
                                        backgroundColor: "#007143",
                                      },
                                    }}
                                  >
                                    {perm.child.map((role, index) => {
                                      return (
                                        <Tab
                                          className="tab"
                                          key={role.id}
                                          label={role?.name}
                                          id={`tab-${role.id}`}
                                          icon={
                                            selectedTab[perm.name] === index ? (
                                              <ChevronRight fontSize="small" />
                                            ) : (
                                              ""
                                            )
                                          }
                                          iconPosition={
                                            selectedTab[perm.name] === index
                                              ? "start"
                                              : ""
                                          }
                                        ></Tab>
                                      );
                                    })}
                                  </Tabs>

                                  {perm.child[selectedTab[perm.name]]?.child
                                    .length > 0 ? (
                                    <Box
                                      className="tab-container"
                                      id={`tab-container-${perm.id}`}
                                    >
                                      <div>
                                        <div
                                          className="chips"
                                          id={`chips-${perm.id}`}
                                        >
                                          {perm.child[
                                            selectedTab[perm.name]
                                          ].child.map((item, idx) => {
                                            if (item.details === "sub_module") {
                                              return (
                                                <div key={item.id}>
                                                  <div className="chip_container">
                                                    <Chip
                                                      key={item.id}
                                                      label={item?.name}
                                                      variant="filled"
                                                      color={
                                                        selectedChip ===
                                                          item.id ||
                                                        (selectedChip ===
                                                          null &&
                                                          idx === 0)
                                                          ? "success"
                                                          : ""
                                                      }
                                                      onClick={() =>
                                                        setSelectedChip(item.id)
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            }
                                          })}
                                        </div>
                                        {perm.child[
                                          selectedTab[perm.name]
                                        ].child.map((item, idx) => {
                                          if (item.details === "sub_module") {
                                            return (
                                              <div
                                                key={item.id}
                                                className="chip_tab_container"
                                                style={{
                                                  display:
                                                    selectedChip === item.id ||
                                                    (selectedChip === null &&
                                                      idx === 0)
                                                      ? "flex"
                                                      : "none",
                                                }}
                                              >
                                                {selectedChip === item.id ||
                                                (selectedChip === null &&
                                                  idx === 0) ? (
                                                  <>
                                                    {item.child.some(
                                                      (childItem) =>
                                                        childItem?.details ===
                                                          "single_action" ||
                                                        childItem?.details ===
                                                          "list_action"
                                                    ) && (
                                                      <div className="action-div">
                                                        <h5>
                                                          {t(
                                                            "manage_roles.mr_create_roles_actions"
                                                          )}
                                                          :
                                                        </h5>
                                                        {item.child.map(
                                                          (childItem) => (
                                                            <>
                                                              {(childItem?.details ===
                                                                "single_action" ||
                                                                childItem?.details ===
                                                                  "list_action") && (
                                                                <FormControlLabel
                                                                  key={
                                                                    childItem.id
                                                                  }
                                                                  label={
                                                                    childItem.name
                                                                  }
                                                                  control={
                                                                    <Checkbox
                                                                      key={
                                                                        childItem.id
                                                                      }
                                                                      checked={finalPerm.includes(
                                                                        childItem.id
                                                                      )}
                                                                      onChange={() => {
                                                                        handlePermissionWithParentGrandParent(
                                                                          childItem.parent_id,
                                                                          item.parent_id,
                                                                          childItem.id
                                                                        );
                                                                      }}
                                                                    />
                                                                  }
                                                                />
                                                              )}
                                                            </>
                                                          )
                                                        )}
                                                      </div>
                                                    )}

                                                    {item.child.some(
                                                      (childItem) =>
                                                        childItem?.details ===
                                                        "bulk_action"
                                                    ) && (
                                                      <div className="bulk-action-div">
                                                        <h5>
                                                          {t(
                                                            "manage_roles.mr_create_roles_bulk_actions"
                                                          )}
                                                          :
                                                        </h5>
                                                        {item.child.map(
                                                          (childItem) => (
                                                            <>
                                                              {childItem?.details ===
                                                                "bulk_action" && (
                                                                <FormControlLabel
                                                                  key={
                                                                    childItem.id
                                                                  }
                                                                  label={
                                                                    childItem.name
                                                                  }
                                                                  control={
                                                                    <Checkbox
                                                                      key={
                                                                        childItem.id
                                                                      }
                                                                      checked={finalPerm.includes(
                                                                        childItem.id
                                                                      )}
                                                                      onChange={() => {
                                                                        handlePermissionWithParentGrandParent(
                                                                          childItem.parent_id,
                                                                          item.parent_id,
                                                                          childItem.id
                                                                        );
                                                                      }}
                                                                    />
                                                                  }
                                                                />
                                                              )}
                                                            </>
                                                          )
                                                        )}
                                                      </div>
                                                    )}
                                                  </>
                                                ) : null}
                                              </div>
                                            );
                                          }
                                        })}
                                      </div>
                                      <>
                                        {perm.child[
                                          selectedTab[perm.name]
                                        ].child.some(
                                          (childItem) =>
                                            childItem?.details ===
                                              "single_action" ||
                                            childItem?.details === "list_action"
                                        ) && (
                                          <div className="action-div">
                                            <h5>
                                              {t(
                                                "manage_roles.mr_create_roles_actions"
                                              )}
                                              :
                                            </h5>
                                            {perm.child[
                                              selectedTab[perm.name]
                                            ].child.map((childItem) => (
                                              <div key={childItem.id}>
                                                {(childItem?.details ===
                                                  "single_action" ||
                                                  childItem?.details ===
                                                    "list_action") && (
                                                  <FormControlLabel
                                                    sx={{ display: "block" }}
                                                    key={childItem.id}
                                                    label={childItem.name}
                                                    control={
                                                      <Checkbox
                                                        key={childItem.id}
                                                        checked={finalPerm.includes(
                                                          childItem.id
                                                        )}
                                                        onChange={() => {
                                                          handlePermissionWithParent(
                                                            childItem.parent_id,
                                                            childItem.id
                                                          );
                                                        }}
                                                      />
                                                    }
                                                  />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {perm.child[
                                          selectedTab[perm.name]
                                        ].child.some(
                                          (childItem) =>
                                            childItem?.details === "bulk_action"
                                        ) && (
                                          <div className="bulk-action-div">
                                            <h5>
                                              {t(
                                                "manage_roles.mr_create_roles_bulk_actions"
                                              )}
                                              :
                                            </h5>
                                            {perm.child[
                                              selectedTab[perm.name]
                                            ].child.map((childItem) => (
                                              <div key={childItem.id}>
                                                {childItem?.details ===
                                                  "bulk_action" && (
                                                  <FormControlLabel
                                                    sx={{ display: "block" }}
                                                    key={childItem.id}
                                                    label={childItem.name}
                                                    control={
                                                      <Checkbox
                                                        key={childItem.id}
                                                        checked={finalPerm.includes(
                                                          childItem.id
                                                        )}
                                                        onChange={() => {
                                                          handlePermissionWithParent(
                                                            childItem.parent_id,
                                                            childItem.id
                                                          );
                                                        }}
                                                      />
                                                    }
                                                  />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    </Box>
                                  ) : (
                                    <Box
                                      className="tab-container"
                                      id={`no-items-${perm.id}`}
                                    >
                                      <p>
                                        {t(
                                          "manage_roles.mr_create_edit_roles_no_items"
                                        )}
                                      </p>
                                    </Box>
                                  )}
                                </div>
                              </AccordionDetails>
                            </Accordion>
                          );
                        })}
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          <div className="modal-footer" id="modal-footer">
            <Button
              id="roles-manage-edit-role-cancel-btn"
              variant="outlined"
              onClick={onClose}
              className="cancel-button"
            >
              {t("manage_roles.mr_er_cancel_btn")}
            </Button>
            <Button
              id="roles-manage-edit-role-submit-btn"
              variant="contained"
              color="primary"
              className="save-btn"
              onClick={() => formikEditRoleRef.current.submitForm()}
            >
              {submitLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                t("manage_roles.mr_er_save_btn")
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditRoleModal;
