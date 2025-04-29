import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import {
  getMasterDDAction,
  updateMasterDataAction,
} from "@/app/actions/masterAction";
import useLogout from "@/app/hooks/useLogout";
import { decryptClient } from "@/utils/decryptClient";
import * as Yup from "yup";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import CloseIcon from "@/images/close-icon.svg";
import ChevronDown from "@/images/chevron-down.svg";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

const EditProgramLink = ({ data, onClose, handleDataChange }) => {
  const logout = useLogout();
  const t = useTranslations();
  const { showSnackbar } = useSnackbar();

  const formikRef = useRef();
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3)
      .max(100)
      .required("Brochure link is required.")
      .trim()
      .transform((value) => value?.trim()),
    shortName: Yup.string()
      .max(100)
      // .required(t("name_required"))
      .trim()
      .transform((value) => value?.trim()),
    description: Yup.string()
      .max(100)
      // .required("Description is required.")
      .trim()
      .transform((value) => value?.trim()),
    university: Yup.string(),
    course: Yup.number().required("Course is required."),
    order: Yup.number().min(0),
  });

  const [loading, setLoading] = useState({
    uni: true,
    course: true,
    submit: false,
  });
  const [universityOptions, setUniversityOptions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selCourse, setSelcourse] = useState(null);
  const [selUni, setSelUni] = useState(null);
  const [uniDetails, setUniDetails] = useState(null);

  const fetchUniversityOptions = async () => {
    setLoading((prev) => ({ ...prev, uni: true }));
    const csrfToken = await getCsrfToken();
    const reqBody = { identifier: ["university"] };

    try {
      const result = await getMasterDDAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        setUniversityOptions(decrypted); // Update state with fetched universities
        // setLoading((prev) => ({ ...prev, uni: false }));
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
          } else {
            showSnackbar({
              message: `Error response empty`,
              severity: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching university options:", error);
      setLoading((prev) => ({ ...prev, uni: false }));
    }
  };

  const fetchCourses = async () => {
    setLoading((prev) => ({ ...prev, uni: true }));
    const csrfToken = await getCsrfToken();
    const reqBody = {
      identifier: ["course"],
    };

    try {
      const result = await getMasterDDAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        // setCourses(decrypted); // Update state with fetched universities
        const course = decrypted?.find(
          (cors) => cors.id === data?.parent?.parent_id
        );
        console.log("got", course);
        setSelcourse(course);
        setSelUni(course?.parent_id);
        setLoading((prev) => ({ ...prev, uni: false }));
      } else {
        console.error(result.error);
        // setLoading((prev) => ({ ...prev, course: false }));
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
          } else {
            showSnackbar({
              message: `Error response empty`,
              severity: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching university options:", error);
      setLoading((prev) => ({ ...prev, uni: false }));
    }
  };

  const fetchCoursesWithParent = async () => {
    setLoading((prev) => ({ ...prev, course: true }));
    const csrfToken = await getCsrfToken();
    const reqBody = {
      parent_id: selUni,
      identifier: ["course"],
    };

    try {
      const result = await getMasterDDAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        setCourses(decrypted); // Update state with fetched universities
        setLoading((prev) => ({ ...prev, course: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, course: false }));
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
          } else {
            showSnackbar({
              message: `Error response empty`,
              severity: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching university options:", error);
      setLoading((prev) => ({ ...prev, course: false }));
    }
  };

  useEffect(() => {
    fetchUniversityOptions();
  }, []);

  useEffect(() => {
    if (data?.parent?.parent_id) {
      fetchCourses();
    }
  }, [data]);

  useEffect(() => {
    if (selUni) {
      fetchCoursesWithParent();
    }
  }, [selUni]);

  useEffect(() => {
    if (selUni && universityOptions) {
      setUniDetails(universityOptions.find((uni) => uni?.id === selUni) || "");
      setLoading((prev) => ({ ...prev, uni: false }));
    }
  }, [selUni, universityOptions]);

  const handleSave = async (values, { resetForm }) => {
    try {
      setLoading((prev) => ({ ...prev, submit: true }));
      const csrfToken = await getCsrfToken();
      if (!csrfToken) throw new Error("Failed to fetch CSRF token");

      const reqBody = {
        id: data?.id,
        identifier: data?.identifier,
        name: values.name,
        short_name: values.shortName,
        description: values.description,
        parent_id: values.course,
        sorting_order: values.order,
      };

      const result = await updateMasterDataAction(csrfToken, reqBody);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);

        showSnackbar({
          message: `<strong>${decrypted.name}</strong> added successfully.`,
          severity: "success",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        });

        onClose();
        handleDataChange();
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, submit: false }));
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
          } else {
            showSnackbar({
              message: `Error response empty`,
              severity: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
            });
          }
        }
      }
    } catch (error) {
      console.error("Unexpected Error:", error);
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="modal-container-master">
      <div className="modal-master">
        <div className="modal-header">
          <h2>Edit Program Link</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          <Formik
            innerRef={formikRef}
            initialValues={{
              name: data?.name || "",
              shortName: data?.short_name || "",
              description: data?.description || "",
              uni: "",
              course: data?.parent?.parent_id || "",
              order: data?.sorting_order || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ values, setFieldValue, errors, touched, isSubmitting }) => (
              <Form style={{ width: "100%" }}>
                {/* University List */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="uni">University</label>
                  <Field
                    name="uni"
                    type="text"
                    // placeholder="University name"
                    disabled
                    value={loading.uni ? "Loading..." : uniDetails?.name}
                    style={{ maxWidth: "100%" }}
                    className={touched.uni && errors.uni ? "input-error" : ""}
                  />
                  <ErrorMessage
                    name="uni"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Course List */}
                <div style={{ marginBottom: "24px" }}>
                  <FormControl fullWidth>
                    <label className="role-label" htmlFor="course">
                      Course
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      id="master-create-brochure-university"
                      value={loading.course ? "loading" : values.course}
                      onChange={(e) => {
                        setFieldValue("course", e.target.value);
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      className={
                        touched.course && errors.course ? "input-error" : ""
                      }
                      style={{ height: "40px" }}
                      sx={{
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <MenuItem disabled value="">
                        {t("leads.csl_sel_course")}
                      </MenuItem>
                      {loading.course ? (
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
                      ) : courses?.length === 0 || !courses ? (
                        <MenuItem disabled>{t("leads.cl_no_courses")}</MenuItem>
                      ) : (
                        courses?.length > 0 &&
                        courses?.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>

                    <ErrorMessage
                      name="course"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                </div>

                {/* Name Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="name">
                    Program Link <span style={{ color: "red" }}>*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Enter Course name"
                    style={{ maxWidth: "100%" }}
                    className={touched.name && errors.name ? "input-error" : ""}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Short Name Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="shortName">Short Name</label>
                  <Field
                    name="shortName"
                    type="text"
                    placeholder="Enter Short name "
                    style={{ maxWidth: "100%" }}
                    className={
                      touched.shortName && errors.shortName ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="shortName"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Description Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="description">Description</label>
                  <Field
                    as="input"
                    name="description"
                    placeholder="Enter description"
                    style={{ maxWidth: "100%" }}
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

                {/* Order Field */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="order">Sort Order</label>
                  <Field
                    name="order"
                    type="number"
                    placeholder="Enter sort order"
                    style={{ maxWidth: "100%" }}
                    className={
                      touched.order && errors.order ? "input-error" : ""
                    }
                  />
                  <ErrorMessage
                    name="order"
                    component="div"
                    className="error-message"
                  />
                </div>

                {/* Save and Cancel Buttons */}
                <div
                  className="modal-footer"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    className="cancel-button"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    className="save-button"
                    disabled={loading.submit}
                  >
                    {loading.submit ? (
                      <CircularProgress size={20} color="#000" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditProgramLink;
