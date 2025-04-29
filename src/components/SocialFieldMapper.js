import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { masterDDAction } from "@/app/actions/commonActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { getAllLeadStatusAction } from "@/app/actions/leadActions";
import useLogout from "@/app/hooks/useLogout";
import {
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ChevronDown from "@/images/chevron-down.svg";
import { decryptClient } from "@/utils/decryptClient";

const SocialFieldMapper = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const [loading, setLoading] = useState({
    stages: false,
    subStage: false,
    uni: false,
    course: false,
    channel: false,
    medium: false,
    country: false,
    state: false,
    city: false,
  });

  const [stageOptions, setStageOptions] = useState(null);
  const [subStageOptions, setSubStageOptions] = useState(null);
  const [universities, setUniversities] = useState(null);
  const [courses, setCourses] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const [mediumList, setMediumList] = useState(null);
  const [countries, setCountries] = useState(null);
  const [states, setStates] = useState(null);
  const [cities, setCities] = useState(null);
  const [campaignList, setCampaignList] = useState(null);

  const [selStage, setSelStage] = useState("");
  const [selSubStage, setSelSubStage] = useState("");
  const [selUni, setSelUni] = useState("");
  const [selCourse, setSelCourse] = useState("");
  const [selChannel, setSelChannel] = useState("");
  const [selMedium, setSelMedium] = useState("");
  const [selCountry, setSelCountry] = useState("");
  const [selState, setSelState] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selCampaign, setSelCampaign] = useState("");

  const getStagesOptions = async () => {
    setLoading((prev) => ({ ...prev, stages: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {};
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("stages DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final stages", decrypted);

        setStageOptions(decrypted);
        setLoading((prev) => ({ ...prev, stages: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, stages: false }));
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
  };
  const getSubStageOptions = async () => {
    setLoading((prev) => ({ ...prev, subStage: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      id: selStage?.id,
    };
    // console.log("reqbody sub", reqbody);
    try {
      const result = await getAllLeadStatusAction(csrfToken, reqbody);
      // console.log("subStage DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final subStage", decrypted);

        setSubStageOptions(decrypted[0]?.children);
        setLoading((prev) => ({ ...prev, subStage: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, subStage: false }));
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
      setLoading((prev) => ({ ...prev, subStage: false }));
    }
  };
  const getChannelList = async () => {
    setLoading((prev) => ({ ...prev, channel: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["channel"], // mandatory input will be an array
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
        setChannelList(decrypted);
        setLoading((prev) => ({ ...prev, channel: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, channel: false }));
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
      setLoading((prev) => ({ ...prev, channel: false }));
    }
  };
  const getMediumList = async () => {
    setLoading((prev) => ({ ...prev, medium: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["medium"], // mandatory input will be an array
      parent_id: selChannel?.id, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setMediumList(decrypted);
        setLoading((prev) => ({ ...prev, medium: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, medium: false }));
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
      setLoading((prev) => ({ ...prev, medium: false }));
    }
  };
  const getCoursesList = async () => {
    setLoading((prev) => ({ ...prev, course: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // status: "1", // optional input will be integer
      identifier: ["course"], // mandatory input will be an array
      parent_id: selUni?.id, // if passed
      // parent_id: selectedPrgm, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setCourses(decrypted);
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
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, course: false }));
    }
  };
  const getUniversitiesList = async () => {
    setLoading((prev) => ({ ...prev, uni: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
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
        setUniversities(decrypted);
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
  const getCountriesList = async () => {
    setLoading((prev) => ({ ...prev, country: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["country"], // mandatory input will be an array
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
        setCountries(decrypted);
        setLoading((prev) => ({ ...prev, country: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, country: false }));
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
      setLoading((prev) => ({ ...prev, country: false }));
    }
  };
  const getStatesList = async () => {
    setLoading((prev) => ({ ...prev, state: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["state"], // mandatory input will be an array
      parent_id: selCountry?.id, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setStates(decrypted);
        setLoading((prev) => ({ ...prev, state: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, state: false }));
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
      setLoading((prev) => ({ ...prev, state: false }));
    }
  };
  const getCitiesList = async () => {
    setLoading((prev) => ({ ...prev, city: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["city"], // mandatory input will be an array
      parent_id: selState?.id, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setCities(decrypted);
        setLoading((prev) => ({ ...prev, city: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, city: false }));
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
      setLoading((prev) => ({ ...prev, city: false }));
    }
  };
  const getCampaignList = async () => {
    setLoading((prev) => ({ ...prev, campaign: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // status: "1", // optional input will be integer
      identifier: ["campaign_name"], // mandatory input will be an array
      // parent_id: selectedUni, // if passed
      // parent_id: selectedPrgm, // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("role list DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        // console.log("final", decrypted);
        setCampaignList(decrypted);
        setLoading((prev) => ({ ...prev, campaign: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, campaign: false }));
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
      setLoading((prev) => ({ ...prev, campaign: false }));
    }
  };

  useEffect(() => {
    getUniversitiesList();
    getStagesOptions();
    getChannelList();
    // getCountriesList();
    // getCampaignList();
  }, []);

  useEffect(() => {
    if (selStage) {
      getSubStageOptions();
    }
  }, [selStage]);

  useEffect(() => {
    if (selUni) {
      getCoursesList();
    }
  }, [selUni]);

  useEffect(() => {
    if (selChannel) {
      getMediumList();
    }
  }, [selChannel]);

  // useEffect(() => {
  //   if (selCountry) {
  //     getStatesList();
  //   }
  // }, [selCountry]);

  // useEffect(() => {
  //   if (selState) {
  //     getCitiesList();
  //   }
  // }, [selState]);

  return (
    <div className="profile">
      <div className="personal-details">
        <form
          className="leads_form_section"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "0px 16px", // Spacing between grid items
            alignItems: "start",
          }}
        >
          {/* University */}
          <div className="form-group">
            <label className="role-label" htmlFor="university">
              {t("leads.csl_univ_lab")}
            </label>
            <Select
              id="social-field-university"
              value={loading?.uni ? "loading" : selUni?.id || ""}
              onChange={(e) => {
                const selectedUni = universities.find(
                  (uni) => uni.id === e.target.value
                );
                setSelUni(selectedUni || null);
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.csl_univ_phldr")}
              </MenuItem>
              {loading?.uni ? (
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
              ) : universities?.length === 0 || !universities ? (
                <MenuItem disabled>{t("leads.cl_no_unives")}</MenuItem>
              ) : (
                universities?.length > 0 &&
                universities?.map((uni) => (
                  <MenuItem key={uni.id} value={uni.id}>
                    {uni?.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div>

          {/* Course  */}
          <div className="form-group">
            <label className="role-label" htmlFor="course">
              {t("leads.csl_course_intrested")}
            </label>
            <Select
              id="social-field-course"
              value={loading?.course ? "loading" : selCourse?.id || ""}
              disabled={!Boolean(selUni)}
              onChange={(e) => {
                const selectedCourse = courses?.find(
                  (cor) => cor.id === e.target.value
                );
                setSelCourse(selectedCourse || null);
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.csl_sel_course")}
              </MenuItem>
              {loading?.course ? (
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
                  <MenuItem key={course.id} value={course?.id}>
                    {course.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div>

          {/* Source  */}
          <div className="form-group">
            <label className="role-label" htmlFor="leadSource">
              {t("leads.csl_leadsource_lab")}
            </label>
            <Select
              id="social-field-source"
              value={loading?.channel ? "loading" : selChannel?.id || ""}
              onChange={(e) => {
                const selectedChannel = channelList?.find(
                  (ch) => ch.id === e.target.value
                );
                setSelChannel(selectedChannel || null);
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.csl_leadsource_phldr")}
              </MenuItem>
              {loading?.channel ? (
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
              ) : channelList?.length === 0 || !channelList ? (
                <MenuItem disabled>{t("leads.cl_no_lead_sources")}</MenuItem>
              ) : (
                channelList?.length > 0 &&
                channelList?.map((ch) => (
                  <MenuItem key={ch.id} value={ch?.id}>
                    {ch.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div>

          {/* Medium  */}
          <div className="form-group">
            <label className="role-label" htmlFor="sourceMedium">
              {t("leads.csl_sourcemedium_lab")}
            </label>
            <Select
              id="social-field-medium"
              value={loading?.medium ? "loading" : selMedium?.id || ""}
              disabled={!Boolean(selChannel)}
              onChange={(e) => {
                const selectedMedium = mediumList?.find(
                  (med) => med.id === e.target.value
                );
                setSelMedium(selectedMedium || null);
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.csl_sourcemedium_phldr")}
              </MenuItem>
              {loading?.medium ? (
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
              ) : mediumList?.length === 0 || !mediumList ? (
                <MenuItem disabled>{t("leads.cl_no_mediums")}</MenuItem>
              ) : (
                mediumList?.length > 0 &&
                mediumList?.map((md) => (
                  <MenuItem key={md.id} value={md?.id}>
                    {md.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div>

          {/* Stage  */}
          <div className="form-group">
            <label className="role-label" htmlFor="stage">
              {t("leads.esl_lead_stage")}
            </label>
            <Select
              id="social-field-stage"
              value={loading?.stages ? "loading" : selStage?.id || ""}
              onChange={(e) => {
                const selectedStage = stageOptions?.find(
                  (stage) => stage.id === e.target.value
                );
                setSelStage(selectedStage || null);
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.el_select_stage")}
              </MenuItem>
              {loading?.stages ? (
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
              ) : stageOptions?.length === 0 || !stageOptions ? (
                <MenuItem disabled>{t("leads.el_no_stages")}</MenuItem>
              ) : (
                stageOptions?.length > 0 &&
                stageOptions?.map((stage) => (
                  <MenuItem key={stage?.id} value={stage?.id}>
                    <Chip
                      label={stage?.name}
                      variant="filled"
                      size="small"
                      sx={{
                        color: stage?.txt_color,
                        backgroundColor: stage?.bg_color,
                        fontWeight: 400,
                      }}
                    />
                  </MenuItem>
                ))
              )}
            </Select>
          </div>

          {/* Sub-Stage  */}
          <div className="form-group">
            <label className="role-label" htmlFor="subStage">
              {t("leads.esl_lead_sub_stage")}
            </label>
            <Select
              id="social-field-sub-stage"
              value={loading?.subStage ? "loading" : selSubStage?.id || ""}
              onChange={(e) => {
                const selectedSubStage = subStageOptions?.find(
                  (substage) => substage.id === e.target.value
                );
                setSelSubStage(selectedSubStage || null);
              }}
              disabled={!Boolean(selStage)}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.el_select_sub_stage")}
              </MenuItem>
              {loading?.subStage ? (
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
              ) : subStageOptions?.length === 0 || !subStageOptions ? (
                <MenuItem disabled>{t("leads.el_no_sub_stages")}</MenuItem>
              ) : (
                subStageOptions?.length > 0 &&
                subStageOptions?.map((subStage) => (
                  <MenuItem key={subStage?.id} value={subStage?.id}>
                    <Chip
                      label={subStage?.name}
                      variant="filled"
                      size="small"
                      avatar={
                        <div
                          style={{
                            backgroundColor: subStage?.txt_color, // Color of the dot
                            width: 8, // Size of the dot
                            height: 8, // Size of the dot
                            borderRadius: "50%", // Circular shape
                          }}
                        />
                      }
                      sx={{
                        // color: subStage?.txt_color,
                        backgroundColor: subStage?.bg_color,
                        fontWeight: 400,
                      }}
                    />
                  </MenuItem>
                ))
              )}
            </Select>
          </div>

          {/* country */}
          {/* <div className="form-group-">
            <label className="role-label" htmlFor="country">
              {t("leads.csl_country_lab")}
            </label>
            <Select
              id="social-field-lead-country"
              value={loading?.country ? "loading" : selCountry?.id || ""}
              onChange={(e) => {
                const selectedCountry = countries?.find(
                  (country) => country.id === e.target.value
                );
                setSelCountry(selectedCountry || null);
                setSelState("");
                setSelCity("");
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.csl_country_phldr")}
              </MenuItem>
              {loading?.country ? (
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
              ) : countries?.length === 0 || !countries ? (
                <MenuItem disabled>{t("leads.cl_no_countries")}</MenuItem>
              ) : (
                countries?.length > 0 &&
                countries?.map((cty) => (
                  <MenuItem key={cty.id} value={cty.id}>
                    {cty.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div> */}

          {/* States */}
          {/* <div className="form-group">
            <label className="role-label" htmlFor="state">
              {t("leads.csl_state_lab")}
            </label>
            <Select
              id="leads-create-lead-state"
              value={loading?.state ? "loading" : selState?.id || ""}
              disabled={!Boolean(selCountry)}
              onChange={(e) => {
                const selectedState = states?.find(
                  (country) => country.id === e.target.value
                );
                setSelState(selectedState);
                setSelCity("");
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.csl_state_phldr")}
              </MenuItem>
              {loading?.state ? (
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
              ) : states?.length === 0 || !states ? (
                <MenuItem disabled>{t("leads.cl_no_states")}</MenuItem>
              ) : (
                states?.length > 0 &&
                states?.map((state) => (
                  <MenuItem key={state.id} value={state.id}>
                    {state.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div> */}

          {/* cities */}
          {/* <div className="form-group">
            <label className="role-label" htmlFor="city">
              {t("leads.csl_city_lab")}
            </label>
            <Select
              id="leads-create-lead-city"
              value={loading?.city ? "loading" : selCity?.id || ""}
              disabled={!Boolean(selState)}
              onChange={(e) => {
                const selectedCity = cities?.find(
                  (city) => city.id === e.target.value
                );
                setSelCity(selectedCity);
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                {t("leads.csl_city_phldr")}
              </MenuItem>
              {loading?.city ? (
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
              ) : cities?.length === 0 || !cities ? (
                <MenuItem disabled>{t("leads.cl_no_cities")}</MenuItem>
              ) : (
                cities?.length > 0 &&
                cities?.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div> */}

          {/* Campaign Name */}
          {/* <div className="form-group">
            <label className="role-label" htmlFor="campaignName">
              Campaign name
            </label>
            <Select
              id="leads-create-lead-campaign-name"
              value={loading?.campaign ? "loading" : selCampaign?.id || ""}
              onChange={(e) => {
                const selectedCampaign = campaignList?.find(
                  (camp) => camp.id === e.target.value
                );
                setSelCampaign(selectedCampaign);
              }}
              displayEmpty
              IconComponent={ChevronDown}
              fullWidth
              style={{ height: "40px" }}
            >
              <MenuItem disabled value="">
                Select a Campaign Name
              </MenuItem>
              {loading?.campaign ? (
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
              ) : campaignList?.length === 0 || !campaignList ? (
                <MenuItem disabled>No Campaign Names</MenuItem>
              ) : (
                campaignList?.length > 0 &&
                campaignList?.map((camp) => (
                  <MenuItem key={camp.id} value={camp.id}>
                    {camp.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </div> */}
        </form>
      </div>

      <div className="table-scroll-container">
        <TableContainer
          className="table-container"
          style={{ maxHeight: "330px", overflowY: "auto" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t("social.stg_social_label")}</TableCell>
                <TableCell>{t("social.stg_social_technical_name")}</TableCell>
                <TableCell>{t("marketing.mktg_criteria_value")}</TableCell>
                <TableCell>{t("social.stg_social_dd_value")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{t("leads.csl_univ_lab")}</TableCell>
                <TableCell>{t("rules.rule_university")}</TableCell>
                <TableCell>{selUni && selUni?.id}</TableCell>
                <TableCell>{selUni && selUni?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.csl_course_intrested")}</TableCell>
                <TableCell>{t("rules.rules_create_course")}</TableCell>
                <TableCell>{selCourse && selCourse?.id}</TableCell>
                <TableCell>{selCourse && selCourse?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.csl_leadsource_lab")}</TableCell>
                <TableCell>{t("social.stg_social_lead_source")}</TableCell>
                <TableCell>{selChannel && selChannel?.id}</TableCell>
                <TableCell>{selChannel && selChannel?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.csl_sourcemedium_lab")}</TableCell>
                <TableCell>{t("social.stg_social_source_medium")}</TableCell>
                <TableCell>{selMedium && selMedium?.id}</TableCell>
                <TableCell>{selMedium && selMedium?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.esl_lead_stage")}</TableCell>
                <TableCell>{t("leads.ldv_lead_stage_lab")}</TableCell>
                <TableCell>{selStage && selStage?.id}</TableCell>
                <TableCell>{selStage && selStage?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.esl_lead_sub_stage")}</TableCell>
                <TableCell>{t("social.stg_social_sub_stage")}</TableCell>
                <TableCell>{selSubStage && selSubStage?.id}</TableCell>
                <TableCell>{selSubStage && selSubStage?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell> {t("leads.csl_country_lab")}</TableCell>
                <TableCell>country</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selCountry && selCountry?.id}</TableCell>
                <TableCell>{selCountry && selCountry?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.csl_state_lab")}</TableCell>
                <TableCell>state</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selState && selState?.id}</TableCell>
                <TableCell>{selState && selState?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.csl_city_lab")}</TableCell>
                <TableCell>city</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selCity && selCity?.id}</TableCell>
                <TableCell>{selCity && selCity?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>Best time to call</TableCell>
                <TableCell>BestTimeToCall</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selCity && selCity?.id}</TableCell>
                <TableCell>{selCity && selCity?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>Campaign name</TableCell>
                <TableCell>CampaignName</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selCampaign && selCampaign?.id}</TableCell>
                <TableCell>{selCampaign && selCampaign?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>Company name</TableCell>
                <TableCell>CompanyName</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selCampaign && selCampaign?.id}</TableCell>
                <TableCell>{selCampaign && selCampaign?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>CTC / Annual package</TableCell>
                <TableCell>CtcAnnualPackage</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selCampaign && selCampaign?.id}</TableCell>
                <TableCell>{selCampaign && selCampaign?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>Experience</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                {/* <TableCell>{selCampaign && selCampaign?.id}</TableCell>
                <TableCell>{selCampaign && selCampaign?.name}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.esl_mn")}</TableCell>
                <TableCell>{t("social.stg_social_mobile_number")}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <span style={{ color: "red" }}>*</span>(
                  {t("social.stg_social_pass")}.)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.csl_fn_lab")}</TableCell>
                <TableCell>{t("social.stg_social_full_name")}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  {" "}
                  <span style={{ color: "red" }}>*</span>(
                  {t("social.stg_social_pass")}.)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("login.email_lab")}</TableCell>
                <TableCell>{t("login.email_lab")}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  {" "}
                  <span style={{ color: "red" }}>*</span>(
                  {t("social.stg_social_pass")}.)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("social.stg_social_remarks")}</TableCell>
                <TableCell>{t("social.stg_social_remarks")}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  {" "}
                  <span style={{ color: "red" }}>*</span>(
                  {t("social.stg_social_if_any")}.)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("social.stg_social_data")}</TableCell>
                <TableCell>{t("social.stg_social_data")}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  {" "}
                  <span style={{ color: "red" }}>*</span>(
                  {t("social.stg_social_all_data")}.)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("leads.esl_dob")}</TableCell>
                <TableCell>{t("social.stg_social_dob")}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <span style={{ color: "red" }}>*</span>(
                  {t("social.stg_social_if_any")}.)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default SocialFieldMapper;
