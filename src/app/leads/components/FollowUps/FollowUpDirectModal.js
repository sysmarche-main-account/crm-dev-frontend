"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import CloseIcon from "@/images/close-icon.svg";
import ChevronDown from "@/images/chevron-down.svg";
import AddIcon from "@/images/add-square.svg";
import RemoveIcon from "@/images/remove-square.svg";
import Radio from "@mui/material/Radio";
import {
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Button,
  RadioGroup,
  CircularProgress,
  Box,
  TextareaAutosize,
  Chip,
  IconButton,
} from "@mui/material";
import * as Yup from "yup";
import { Form, Formik, Field, ErrorMessage } from "formik";
import useLogout from "@/app/hooks/useLogout";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import { getTemplateListDDAction } from "@/app/actions/templateActions";
import { useSelector } from "react-redux";
import { decryptClient } from "@/utils/decryptClient";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  handleEmailSendAction,
  handleSmsSendAction,
  handleWhatsappSendAction,
} from "@/app/actions/communicationAction";
import dynamic from "next/dynamic";
import { masterDDAction } from "@/app/actions/commonActions";

const SummerNoteEditor = dynamic(
  () => import("@/app/settings/components/Templates/SummerNoteEditor"),
  {
    loading: () => <CircularProgress color="#000" />,
    ssr: false,
  }
);

const FollowUpDirectModal = ({
  type,
  title = "Follow-up",
  onClose,
  radioOptions = [],
  lead,
  leadDetails,
  followupId,
}) => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  // console.log("lead", radioOptions);
  // console.log("lead", lead, followupId, radioOptions);

  const { details } = useSelector((state) => state.user);

  const formikRefFollowUpModal = useRef();
  const fileInputRef = useRef(null);

  const getValidationSchema = (type) => {
    if (type.toLowerCase() === "sms") {
      return Yup.object({
        template: Yup.string()
          .required(t("followup.400342"))
          .trim()
          .transform((value) => value?.trim()),
        route: Yup.string()
          .required("Route is required")
          .trim()
          .transform((value) => value?.trim()),
        sendId: Yup.string()
          .required("Sender Id is required")
          .trim()
          .transform((value) => value?.trim()),
        message: Yup.string().required(t("followup.400343")).trim(),
      });
    } else if (type.toLowerCase() === "email") {
      return Yup.object({
        template: Yup.string()
          .required(t("followup.400342"))
          .trim()
          .transform((value) => value?.trim()),
        subject: Yup.string()
          .required("Subject is required")
          .trim()
          .transform((value) => value?.trim()),
        message: Yup.string().required(t("followup.400343")).trim(),
      });
    }
    return Yup.object({
      template: Yup.string()
        .required(t("followup.400342"))
        .trim()
        .transform((value) => value?.trim()),
      message: Yup.string().required(t("followup.400343")).trim(),
    });
  };

  const getInitalValues = (type) => {
    if (type.toLowerCase() === "sms") {
      return { route: "", sendId: "", template: "", message: "" };
    } else if (type.toLowerCase() === "email") {
      return { template: "", subject: "", message: "" };
    }
    return { template: "", message: "" };
  };

  const [loading, setLoading] = useState({
    templates: false,
    submit: false,
    senderNames: false,
    senderEmails: false,
    smsRoute: false,
    smsIds: false,
  });

  const [selOption, setSelOption] = useState(radioOptions[0]?.value || "");

  const [selTemp, setSelTemp] = useState(null);

  const [templateList, setTemplateList] = useState(null);

  const [files, setFiles] = useState([]);

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [showFields, setShowFilelds] = useState(false);

  const [emailFields, setEmailFields] = useState({
    sender: false,
    cc: false,
    bcc: false,
  });

  const [senderNamesList, setSenderNamesList] = useState(null);
  const [senderEmailsList, setSenderEmailsList] = useState(null);

  const [smsRouteList, setSmsRouteList] = useState(null);
  const [smsSenderIdsList, setSmsSenderIdsList] = useState(null);

  const [selSendName, setSelSendName] = useState("");
  const [selSendEmail, setSelSendEmail] = useState("");
  const [replyEmail, setReplyEmail] = useState("");

  const [emailInputCC, setEmailInputCC] = useState("");
  const [emailInputBCC, setEmailInputBCC] = useState("");

  const [ccEmailList, setCcEmailsList] = useState([]);
  const [bccEmailList, setBccEmailsList] = useState([]);

  const getTemplateList = async () => {
    setLoading((prev) => ({ ...prev, templates: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      template_cat: type?.toLowerCase(),
      uuid: [details?.uuid],
      lead_id: lead,
      status: 1,
    };
    console.log("reqBody template list", reqbody);

    try {
      const result = await getTemplateListDDAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final template", decrypted);

        setTemplateList(decrypted);
        setLoading((prev) => ({ ...prev, templates: false }));
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, templates: false }));
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
          } else if (errValues?.length > 0) {
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
      setLoading((prev) => ({ ...prev, templates: false }));
    }
  };

  const getSenderNamesList = async () => {
    setLoading((prev) => ({ ...prev, senderNames: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["sender_name_crm"], // mandatory input will be an array
      // "parent_id": "0" // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("senderNames DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final senderNames", decrypted);

        setSenderNamesList(decrypted);
        setLoading((prev) => ({ ...prev, senderNames: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, senderNames: false }));
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
      setLoading((prev) => ({ ...prev, senderNames: false }));
    }
  };

  const getSenderEmailList = async () => {
    setLoading((prev) => ({ ...prev, senderEmails: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["from_email_crm"], // mandatory input will be an array
      // "parent_id": "0" // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("senderEmails DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final senderEmails", decrypted);

        setSenderEmailsList(decrypted);
        setLoading((prev) => ({ ...prev, senderEmails: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, senderEmails: false }));
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
      setLoading((prev) => ({ ...prev, senderEmails: false }));
    }
  };

  const getRouteList = async () => {
    setLoading((prev) => ({ ...prev, smsRoute: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["sms_route"], // mandatory input will be an array
      // "parent_id": "0" // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("smsRoute DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final smsRoute", decrypted);

        setSmsRouteList(decrypted);
        setLoading((prev) => ({ ...prev, smsRoute: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, smsRoute: false }));
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
      setLoading((prev) => ({ ...prev, smsRoute: false }));
    }
  };

  const getSenderIdsList = async () => {
    setLoading((prev) => ({ ...prev, smsIds: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      // "status": "1", // optional input will be integer
      identifier: ["sms_sender_id_crm"], // mandatory input will be an array
      // "parent_id": "0" // if passed
    };
    try {
      const result = await masterDDAction(csrfToken, reqbody);
      // console.log("smsIds DD result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final smsIds", decrypted);

        setSmsSenderIdsList(decrypted);
        setLoading((prev) => ({ ...prev, smsIds: false }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, smsIds: false }));
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
      setLoading((prev) => ({ ...prev, smsIds: false }));
    }
  };

  useEffect(() => {
    getTemplateList();
  }, []);

  useEffect(() => {
    if (type.toLowerCase() === "email") {
      getSenderNamesList();
      getSenderEmailList();
    } else if (type.toLowerCase() === "sms") {
      getRouteList();
      getSenderIdsList();
    }
  }, [type]);

  useEffect(() => {
    if (radioOptions.length > 0) {
      setSelOption(radioOptions[0]?.value);
    }
  }, [radioOptions]);

  const handleFileChange = (event) => {
    const filesUploaded = Array.from(event.target.files); // Get selected files
    console.log("files", filesUploaded);
    if (filesUploaded?.length > 0) {
      setUploadedFiles((prev) => {
        // Filter out files that already exist in the state
        const newFiles = filesUploaded?.filter(
          (file) =>
            !prev?.some(
              (existingFile) =>
                existingFile.name === file.name &&
                existingFile.size === file.size
            )
        );
        return [...prev, ...newFiles];
      });
    }
    event.target.value = ""; // Reset the input so the same file can be selected again if needed
  };

  const handleDownload = (file) => {
    if (file?.path && file?.display_name) {
      const a = document.createElement("a");
      a.href = file?.path;
      a.download = file?.display_name; // Set the filename
      document.body.appendChild(a); // Append the anchor to the DOM
      a.target = "_blank"; // Open the file in a new tab
      a.click(); // Programmatically click the anchor
      document.body.removeChild(a); // Clean up by removing the anchor
    } else {
      const url = URL.createObjectURL(file); // Create object URL for the file
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name; // Set the filename
      a.click();
      URL.revokeObjectURL(url); // Clean up
    }
  };

  const handleDeleteAttachemnt = (file) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file)); // Remove the file from the array
  };

  const handleDeleteFile = (file) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((f) => f !== file)); // Remove the file from the array
  };

  //Check total files attached is less than 25 Mb.
  const getTotalFileSize = (uploadedFiles = [], files = []) => {
    const Max_Size = 25 * 1024 * 1024;
    let totalSize = 0;

    for (const file of [...uploadedFiles, ...files]) {
      if (file?.size) {
        totalSize += file.size;
      }
    }

    if (totalSize <= Max_Size) {
      return true;
    } else return false;
  };

  const handleSendEmail = async (values) => {
    console.log(values);

    // const correctFileSizes = getTotalFileSize(uploadedFiles, files);

    // if (!correctFileSizes) {
    //   showSnackbar({
    //     message:
    //       "Attachments total size should be less than or equal to 25 MB.",
    //     severity: "error",
    //     anchorOrigin: { vertical: "top", horizontal: "right" },
    //   });
    //   return;
    // }

    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const formData = new FormData();
    formData.append("lead_id", lead);
    formData.append("followup_id", followupId);
    formData.append("template_id", values?.template);
    formData.append("from_email[name]", `${selSendName?.name}`);
    formData.append("from_email[email]", `${selSendEmail?.name}`);
    formData.append("to_emails[0][name]", `${leadDetails?.full_name}`);
    formData.append("to_emails[0][email]", `${selOption}`);
    formData.append(`reply_to[0][name]`, replyEmail);
    formData.append(`reply_to[0][email]`, replyEmail);
    formData.append("subject", values?.subject);
    formData.append("body", values?.message);

    ccEmailList?.forEach((email, index) => {
      formData.append(`cc_emails[${index}][name]`, email);
      formData.append(`cc_emails[${index}][email]`, email);
    });

    bccEmailList?.forEach((email, index) => {
      formData.append(`bcc_emails[${index}][name]`, email);
      formData.append(`bcc_emails[${index}][email]`, email);
    });

    files?.forEach((urls, index) => {
      formData.append(`attachment_urls[${index}]`, urls?.path);
    });

    uploadedFiles?.forEach((file, index) => {
      formData.append(`attachment_files[${index}]`, file); // Append the actual File object
    });

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const result = await handleEmailSendAction(csrfToken, formData);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("email send final", decrypted);

        // setTemplateList(decrypted);
        setLoading((prev) => ({ ...prev, submit: false }));
        if (decrypted.error) {
          showSnackbar({
            message: `${decrypted?.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (!decrypted.error && decrypted?.transaction_id) {
          onClose();
          showSnackbar({
            message: `Email sending initiated successfully!`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
      } else {
        console.error(result);
        setLoading((prev) => ({ ...prev, submit: false }));
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
          } else if (errValues?.length > 0) {
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
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleSendSms = async (values) => {
    console.log(values);
    setLoading((prev) => ({ ...prev, submit: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      phone_numbers: [selOption],
      // phone_numbers: ["9028435660"],
      message: values?.message,
      dlt_template_id: selTemp?.dlt_template_id,
      sender_id: values?.sendId,
      template_id: selTemp?.template_ref_id,
      lead_id: lead,
      follow_up_id: followupId, //optional
    };

    console.log("sms reqbody", reqbody);

    try {
      const result = await handleSmsSendAction(csrfToken, reqbody);
      // console.log("all user list result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("sms send final", decrypted);

        setLoading((prev) => ({ ...prev, submit: false }));
        if (decrypted.error) {
          showSnackbar({
            message: `${decrypted?.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (!decrypted.error && decrypted?.transaction_id) {
          onClose();
          showSnackbar({
            message: `SMS sending initiated successfully!`,
            severity: "success",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        }
      } else {
        console.error(result);
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
          } else if (errValues?.length > 0) {
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
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleSendWhatsapp = async (values) => {
    console.log(values);
    //   setLoading((prev) => ({ ...prev, submit: true }));
    //   const csrfToken = await getCsrfToken();
    //   const reqbody = {
    //     entity_id: process.env.NEXT_PUBLIC_ENTITY_ID,
    //     phone_numbers: [selOption],
    //     country_code: "+91",
    //     message: values?.message,
    //     template_id: "", // optional
    //     callback_data: "", //
    //     campaign_id: "",
    //   };
    //   try {
    //     const result = await handleWhatsappSendAction(csrfToken, reqbody);
    //     // console.log("all user list result:", result);
    //     if (result.success && result.status === 200) {
    //       const { iv, encryptedData } = result?.data;
    //       const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    //       const decrypted = decryptClient(iv, encryptedData, key);
    //       console.log("whatsapp send final", decrypted);
    //       setTemplateList(decrypted);
    //       setLoading((prev) => ({ ...prev, submit: false }));
    //     } else {
    //       console.error(result);
    //       setLoading((prev) => ({ ...prev, submit: false }));
    //       if (result.error.status === 500) {
    //         await logout();
    //       } else if (typeof result.error.message === "string") {
    //         showSnackbar({
    //           message: `${result.error.message}`,
    //           severity: "error",
    //           anchorOrigin: { vertical: "top", horizontal: "center" },
    //         });
    //       } else if (
    //         typeof result.error.message === "object" &&
    //         result.error.message !== null
    //       ) {
    //         let errValues = Object.values(result.error.message);
    //         if (errValues.includes("Token expired")) {
    //           window.location.reload();
    //           getToken();
    //         } else if (errValues?.length > 0) {
    //           errValues.map((errmsg) =>
    //             showSnackbar({
    //               message: `${errmsg}`,
    //               severity: "error",
    //               anchorOrigin: { vertical: "top", horizontal: "center" },
    //             })
    //           );
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Unexpected error:", error);
    //     setLoading((prev) => ({ ...prev, submit: false }));
    //   }
  };

  const handleEmailField = (field) => {
    if (emailFields[field]) {
      setEmailFields((prev) => ({ ...prev, [field]: false }));
    } else {
      setEmailFields((prev) => ({ ...prev, [field]: true }));
      if (!showFields) {
        setShowFilelds(true);
      }
    }
  };

  const isValidEmail = (email) => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReplytoEmail = (e) => {
    const replytoemail = e.target.value;
    setReplyEmail(replytoemail);
  };

  //******************CC && BCC Functions */
  const handleInputChangeCC = (e) => {
    setEmailInputCC(e.target.value);
  };
  const handleInputChangeBCC = (e) => {
    setEmailInputBCC(e.target.value);
  };

  const handleKeyDownCC = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      addEmailCC();
    }
  };
  const handleKeyDownBCC = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      addEmailBCC();
    }
  };

  const addEmailCC = () => {
    const newEmail = emailInputCC; // Get the last email entered

    if (!isValidEmail(newEmail)) {
      showSnackbar({
        message: t("manage_template.400374"),
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    // Check for duplicates
    const uniqueEmails = [...new Set(ccEmailList)];
    if (uniqueEmails.includes(newEmail)) {
      showSnackbar({
        message: "This email is already in the list.",
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    const updatedEmailList = [...uniqueEmails, newEmail];
    setCcEmailsList(updatedEmailList);
    setEmailInputCC("");
  };
  const addEmailBCC = () => {
    const newEmail = emailInputBCC; // Get the last email entered

    if (!isValidEmail(newEmail)) {
      showSnackbar({
        message: t("manage_template.400374"),
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    // Check for duplicates
    const uniqueEmails = [...new Set(bccEmailList)];
    if (uniqueEmails.includes(newEmail)) {
      showSnackbar({
        message: "This email is already in the list.",
        severity: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    const updatedEmailList = [...uniqueEmails, newEmail];
    setBccEmailsList(updatedEmailList);
    setEmailInputBCC("");
  };

  const handleDeleteEmailCC = (emailToDelete) => {
    setCcEmailsList(ccEmailList.filter((email) => email !== emailToDelete));
  };
  const handleDeleteEmailBCC = (emailToDelete) => {
    setBccEmailsList(bccEmailList.filter((email) => email !== emailToDelete));
  };

  //****************************** */

  return (
    <div className="map-roles-modal-user" id="map-roles-modal-user-container">
      <div className="modal-header-roles" id="modal-header-roles-container">
        <h2 id="modal-title">{title}</h2>
        <div
          id="followup-direct-comm-close-btn"
          className="close-button"
          onClick={onClose}
        >
          <CloseIcon />
        </div>
      </div>
      <div
        className="modal-body"
        style={{ overflowY: "scroll" }}
        id="modal-body-container"
      >
        <div
          className="modal-content-user-section"
          id="modal-content-user-section-container"
        >
          <p id="communication-type-prompt">
            {type?.toLowerCase() === "whatsapp"
              ? t("followup.fupdm_select_whatsapp_number")
              : type?.toLowerCase() === "email"
              ? t("followup.fupdm_select_email_id")
              : type?.toLowerCase() === "sms"
              ? t("followup.fupdm_select_sms_number")
              : null}
            <span style={{ color: "red" }}> *</span>
          </p>
          <div id="radio-group-container">
            <RadioGroup
              // value={selOption}
              value={
                radioOptions[1]?.value &&
                radioOptions[1]?.value === radioOptions[0]?.value
                  ? ""
                  : selOption
              }
              onChange={(e) => setSelOption(e.target.value)}
            >
              <div id="followup-direct-comm-radio">
                {radioOptions.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option?.value}
                    disabled={
                      !option?.value ||
                      (index === 1 && option?.value === radioOptions[0]?.value)
                    }
                    control={
                      <Radio
                        id={`followup-direct-comm-${option.value}`}
                        sx={{
                          color: "green",
                          "&.Mui-checked": {
                            color: "green",
                          },
                        }}
                        checked={
                          selOption === option?.value &&
                          !(
                            !option?.value ||
                            (index === 1 &&
                              option?.value === radioOptions[0]?.value)
                          )
                        }
                      />
                    }
                    label={option.label}
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        color: "#007143",
                      },
                    }}
                  />
                ))}
              </div>
            </RadioGroup>
          </div>

          {type.toLowerCase() === "email" && (
            <div className="senderDetailsDiv" id="sender-details-container">
              <div className="details" id="sender-details-fields">
                <p id="sender-details-label">
                  {t("followup.fup_comm_sender_details")}
                </p>
                <div id="sender-details-chips">
                  <span
                    id="followup-direct-comm-sender"
                    className={`chips ${emailFields?.sender && "active"}`}
                    onClick={() => handleEmailField("sender")}
                  >
                    {t("followup.fup_comm_sender")}
                  </span>
                  <span
                    id="followup-direct-comm-cc"
                    className={`chips ${emailFields?.cc && "active"}`}
                    onClick={() => handleEmailField("cc")}
                  >
                    {t("followup.fup_comm_cc")}
                  </span>
                  <span
                    id="followup-direct-comm-bcc"
                    className={`chips ${emailFields?.bcc && "active"}`}
                    onClick={() => handleEmailField("bcc")}
                  >
                    {t("followup.fup_comm_bcc")}
                  </span>
                </div>
              </div>
              <div className="fieldsBtn" id="fields-button-container">
                <p className="bracketText" id="configure-hint-text">
                  ({t("followup.fup_comm_click_configure")})
                </p>
                <div id="fields-toggle-button">
                  <IconButton
                    id="followup-direct-comm-show-fields"
                    onClick={() => {
                      if (showFields) {
                        setShowFilelds(false);
                      } else {
                        setShowFilelds(true);
                      }
                    }}
                  >
                    {showFields ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </div>
              </div>

              {showFields && (
                <div className="emailFieldsDivs" id="email-fields-container">
                  {/* Select Sender name */}
                  <div className="emailFields" id="sender-name-field">
                    <label htmlFor="fullName" className="role-label">
                      {t("followup.fup_comm_select_sender_id")}
                      <span style={{ color: "red" }}>*</span>:
                    </label>
                    <Select
                      id="followup-direct-comm-sender-name"
                      sx={{ width: "50%" }}
                      disabled={!emailFields.sender}
                      placeholder="Select sender name"
                      value={loading?.senderNames ? "loading" : selSendName?.id}
                      onChange={(e) => {
                        const selectedName = senderNamesList?.find(
                          (name) => name.id === e.target.value
                        );
                        setSelSendName(selectedName);
                      }}
                      displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      // className={
                      //   touched.course && errors.course ? "input-error" : ""
                      // }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("followup.fup_comm_select_sender_id")}
                      </MenuItem>
                      {loading?.senderNames ? (
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
                      ) : senderNamesList?.length === 0 || !senderNamesList ? (
                        <MenuItem disabled>
                          {t("followup.fup_comm_no_sender_names")}
                        </MenuItem>
                      ) : (
                        senderNamesList?.length > 0 &&
                        senderNamesList?.map((name) => (
                          <MenuItem key={name.id} value={name.id}>
                            {name.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                  {/* From email */}
                  <div className="emailFields" id="from-email-field">
                    <label htmlFor="fullName" className="role-label">
                      {t("followup.fup_comm_select_from_email")}
                      <span style={{ color: "red" }}>*</span>:
                    </label>
                    <Select
                      id="followup-direct-comm-from-email"
                      sx={{ width: "50%" }}
                      disabled={!emailFields.sender}
                      placeholder="Select a Reply to email ID"
                      value={
                        loading?.senderEmails ? "loading" : selSendEmail?.id
                      }
                      onChange={(e) => {
                        const selectedEmail = senderEmailsList?.find(
                          (mail) => mail.id === e.target.value
                        );
                        setSelSendEmail(selectedEmail);
                        setReplyEmail(selectedEmail?.name);
                      }}
                      // displayEmpty
                      IconComponent={ChevronDown}
                      fullWidth
                      // className={
                      //   touched.course && errors.course ? "input-error" : ""
                      // }
                      style={{ height: "40px" }}
                    >
                      <MenuItem disabled value="">
                        {t("followup.fup_comm_select_from_email_id")}
                      </MenuItem>
                      {loading?.senderEmails ? (
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
                      ) : senderEmailsList?.length === 0 ||
                        !senderEmailsList ? (
                        <MenuItem disabled>
                          {t("followup.fup_comm_no_from_email_found")}
                        </MenuItem>
                      ) : (
                        senderEmailsList?.length > 0 &&
                        senderEmailsList?.map((email) => (
                          <MenuItem key={email.id} value={email.id}>
                            {email.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                  {/* reply to email */}
                  <div className="emailFields" id="reply-email-field">
                    <label htmlFor="fullName" className="role-label">
                      {t("followup.fup_comm_enter_reply_email")}:
                    </label>
                    <input
                      id="followup-direct-comm-reply-to-email"
                      type="email"
                      placeholder="[reply to] email ID"
                      value={replyEmail}
                      onChange={handleReplytoEmail}
                    />
                  </div>
                  {/* Cc */}
                  <div className="emailFields" id="cc-email-field">
                    <label htmlFor="fullName" className="role-label">
                      {t("followup.fup_comm_cc")}:
                    </label>
                    {/* <input
                      placeholder="Enter email ID"
                      disabled={!emailFields.cc}
                    /> */}
                    <input
                      id="followup-direct-comm-cc-email"
                      type="email"
                      placeholder="Enter CC email ID"
                      disabled={!emailFields.cc}
                      value={emailInputCC}
                      onChange={handleInputChangeCC}
                      onKeyDown={handleKeyDownCC}
                    />
                  </div>
                  {ccEmailList?.length > 0 && (
                    <div
                      id="followup-direct-comm-cc-email-chip"
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 5,
                      }}
                    >
                      {ccEmailList?.map((email) => (
                        <Chip
                          id={`followup-direct-comm-cc-${email}`}
                          key={email}
                          label={email}
                          onDelete={() => handleDeleteEmailCC(email)}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </div>
                  )}
                  {/* Bcc */}
                  <div className="emailFields" id="bcc-email-field">
                    <label htmlFor="fullName" className="role-label">
                      {t("followup.fup_comm_bcc")}:
                    </label>
                    {/* <input
                      placeholder="Enter email ID"
                      disabled={!emailFields.bcc}
                    /> */}
                    <input
                      id="followup-direct-comm-bcc-email"
                      type="email"
                      placeholder="Enter BCC email ID"
                      disabled={!emailFields.bcc}
                      value={emailInputBCC}
                      onChange={handleInputChangeBCC}
                      onKeyDown={handleKeyDownBCC}
                    />
                  </div>
                  {bccEmailList?.length > 0 && (
                    <div
                      id="followup-direct-comm-bcc-email-chip"
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 5,
                      }}
                    >
                      {bccEmailList?.map((email) => (
                        <Chip
                          id={`followup-direct-comm-bcc-${email}`}
                          key={email}
                          label={email}
                          onDelete={() => handleDeleteEmailBCC(email)}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Formik
            innerRef={formikRefFollowUpModal}
            initialValues={getInitalValues(type)}
            validationSchema={getValidationSchema(type)}
            onSubmit={(values) => {
              const mode = type.toLowerCase();

              if (mode === "email") {
                const isEmpty = (obj) => Object.entries(obj).length === 0;
                if (isEmpty(selSendName) && isEmpty(selSendEmail)) {
                  showSnackbar({
                    message: `${t("followup.fup_comm_sender_email_required")}`,
                    severity: "error",
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                } else if (isEmpty(selSendName) && selSendEmail) {
                  showSnackbar({
                    message: `${t("followup.fup_comm_sender_name_required")}`,
                    severity: "error",
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                } else if (selSendName && isEmpty(selSendEmail)) {
                  showSnackbar({
                    message: `${t("followup.fup_comm_sender_email_needed")}`,
                    severity: "error",
                    anchorOrigin: { vertical: "top", horizontal: "right" },
                  });
                } else if (replyEmail && replyEmail?.length > 0) {
                  const valid = isValidEmail(replyEmail);
                  console.log("hit2", valid);
                  if (!valid) {
                    showSnackbar({
                      message: `${t("followup.fup_comm_reply_to")}`,
                      severity: "error",
                      anchorOrigin: { vertical: "top", horizontal: "right" },
                    });
                  } else {
                    handleSendEmail(values);
                  }
                } else {
                  handleSendEmail(values);
                }
              } else if (mode === "sms") {
                handleSendSms(values);
              } else if (mode === "whatsapp") {
                handleSendWhatsapp(values);
              } else {
                console.log("incorrect mode selected", values);
              }
            }}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form style={{ gridTemplateColumns: "1fr" }} id="followup-form">
                {/* template DD */}
                <FormControl fullWidth id="template-form-control">
                  <label htmlFor="template">
                    {t("followup.fupdm_select_template_lab")}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <Select
                    id="followup-direct-comm-template"
                    name="template"
                    value={loading?.templates ? "loading" : values?.template}
                    onChange={(e) => {
                      const selectedTemplate = templateList?.find(
                        (temp) => temp.template_ref_id === e.target.value
                      );

                      if (type.toLowerCase() === "email") {
                        setFieldValue("subject", selectedTemplate?.subject);
                        setFiles((prev) => {
                          // Filter out files that already exist in the state
                          const newFiles =
                            selectedTemplate?.attachments?.filter(
                              (file) =>
                                !prev?.some(
                                  (existingFile) =>
                                    existingFile.id === file.id &&
                                    existingFile.path === file.path
                                )
                            );
                          return [...prev, ...newFiles];
                        });
                      }
                      setSelTemp(selectedTemplate);
                      setFieldValue(
                        "template",
                        selectedTemplate?.template_ref_id
                      );
                      setFieldValue(
                        "message",
                        selectedTemplate?.body_content || ""
                      );
                    }}
                    displayEmpty
                    IconComponent={ChevronDown}
                    fullWidth
                    className={
                      touched.template && errors.template ? "input-error" : ""
                    }
                    style={{ height: "40px" }}
                  >
                    <MenuItem disabled value="">
                      {t("followup.fupdm_select_template_phldr")}
                    </MenuItem>
                    {loading?.templates ? (
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
                    ) : templateList?.length === 0 || !templateList ? (
                      <MenuItem disabled>{t("followup.fup_tem_dd")}</MenuItem>
                    ) : (
                      templateList?.length > 0 &&
                      templateList?.map((temp) => (
                        <MenuItem key={temp?.id} value={temp?.template_ref_id}>
                          {temp?.template_name}
                        </MenuItem>
                      ))
                    )}
                  </Select>

                  <ErrorMessage
                    name="template"
                    component="div"
                    className="error-message"
                  />
                </FormControl>

                {type?.toLowerCase() === "sms" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 15,
                    }}
                    id="sms-route-container"
                  >
                    {/* Select route */}
                    <FormControl fullWidth id="route-form-control">
                      <label htmlFor="route">
                        {t("followup.fup_comm_select_route")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="followup-direct-comm-route"
                        name="route"
                        value={loading?.smsRoute ? "loading" : values?.route}
                        onChange={(e) => {
                          setFieldValue("route", e.target.value);
                        }}
                        displayEmpty
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.route && errors.route ? "input-error" : ""
                        }
                        style={{ height: "40px" }}
                      >
                        <MenuItem disabled value="">
                          {t("followup.fup_comm_select_route")}
                        </MenuItem>
                        {loading?.smsRoute ? (
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
                        ) : smsRouteList?.length === 0 || !smsRouteList ? (
                          <MenuItem disabled>
                            {t("followup.fup_comm_no_routes_found")}
                          </MenuItem>
                        ) : (
                          smsRouteList?.length > 0 &&
                          smsRouteList?.map((route) => (
                            <MenuItem key={route?.id} value={route?.name}>
                              {route?.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>

                      <ErrorMessage
                        name="route"
                        component="div"
                        className="error-message"
                      />
                    </FormControl>

                    {/* Select Sender ID */}
                    <FormControl fullWidth id="sender-id-form-control">
                      <label htmlFor="template">
                        {t("followup.fup_comm_select_sender_id")}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="followup-direct-comm-sender-id"
                        name="template"
                        value={loading?.smsIds ? "loading" : values?.sendId}
                        onChange={(e) => {
                          setFieldValue("sendId", e.target.value);
                        }}
                        displayEmpty
                        IconComponent={ChevronDown}
                        fullWidth
                        className={
                          touched.sendId && errors.sendId ? "input-error" : ""
                        }
                        style={{ height: "40px" }}
                      >
                        <MenuItem disabled value="">
                          {t("followup.fup_comm_select_sender_id")}
                        </MenuItem>
                        {loading?.smsIds ? (
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
                        ) : smsSenderIdsList?.length === 0 ||
                          !smsSenderIdsList ? (
                          <MenuItem disabled>
                            {t("followup.fup_comm_no_sender_ids")}
                          </MenuItem>
                        ) : (
                          smsSenderIdsList?.length > 0 &&
                          smsSenderIdsList?.map((ids) => (
                            <MenuItem key={ids?.id} value={ids?.name}>
                              {ids?.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>

                      <ErrorMessage
                        name="sendId"
                        component="div"
                        className="error-message"
                      />
                    </FormControl>
                  </div>
                )}

                {type?.toLowerCase() === "email" && selTemp && (
                  <FormControl fullWidth id="subject-form-control">
                    <label htmlFor="template">
                      {t("manage_template.et_subject")}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Field
                      id="followup-direct-comm-subject"
                      style={{ maxWidth: "100%" }}
                      type="text"
                      name="subject"
                      placeholder={t("followup.fup_comm_enter_subject")}
                      className={
                        touched.fullName && errors.fullName ? "input-error" : ""
                      }
                    />

                    <ErrorMessage
                      name="subject"
                      component="div"
                      className="error-message"
                    />
                  </FormControl>
                )}

                {/* message */}
                <div id="message-container">
                  <label htmlFor="message">
                    {t("followup.fupdm_message_lab")}
                    <span style={{ color: "#F00" }}>*</span>
                  </label>

                  {type.toLowerCase() === "email" ? (
                    <>
                      <SummerNoteEditor
                        id="followup-direct-comm-email-summernote"
                        value={values?.message}
                        onChange={(newContent) => {
                          // console.log("content", newContent);
                          // setValue(newContent);
                          setFieldValue("message", newContent);
                        }}
                        height={200}
                        // selectedVar={selectedVar}
                        // setSelectedVar={setSelectedVar}
                      />
                    </>
                  ) : (
                    <Field name="message">
                      {({ field }) => (
                        <TextareaAutosize
                          {...field}
                          id="followup-direct-comm-body-textarea"
                          disabled={type?.toLowerCase() === "sms"}
                          minRows={17}
                          className={`followUp-message ${
                            touched.body && errors.body && "input-error"
                          }`}
                          style={{
                            width: "100%",
                            fontSize: "16px",
                            padding: "8px",
                            border:
                              touched.body && errors.body
                                ? "1px solid red"
                                : "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                    </Field>
                  )}

                  <ErrorMessage
                    name="message"
                    component="div"
                    className="error-message"
                  />
                </div>
              </Form>
            )}
          </Formik>

          {/* Attachment btn and file listing for email */}
          {type.toLowerCase() === "email" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
              id="attachment-container"
            >
              <Button
                id="followup-direct-comm-attach-file"
                variant="contained"
                className="attach_file_btn"
                onClick={() => fileInputRef.current.click()}
              >
                {loading.file ? (
                  <CircularProgress size={20} color="#000" />
                ) : (
                  "Attach file"
                )}
              </Button>
              <input
                id="followup-direct-comm-input-file"
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                multiple // Allow selecting multiple files
                onChange={handleFileChange}
              />
              <div
                id="followup-direct-comm-files-chip"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                  margin: "5px 0",
                }}
              >
                {files?.length > 0 &&
                  files?.map((file, index) => (
                    <Chip
                      id={`followup-direct-comm-${file?.display_name}`}
                      key={index}
                      label={file.display_name}
                      color="success"
                      onDelete={() => handleDeleteAttachemnt(file)}
                      onClick={() => handleDownload(file)}
                      deleteIcon={
                        <DeleteIcon
                          onClick={() => handleDeleteAttachemnt(file)}
                        />
                      }
                      style={{ margin: 1 }}
                    />
                  ))}
                {uploadedFiles?.length > 0 &&
                  uploadedFiles?.map((file, index) => (
                    <Chip
                      id={`followup-direct-comm-${file?.name}`}
                      key={index}
                      label={file.name}
                      color="success"
                      onDelete={() => handleDeleteFile(file)}
                      onClick={() => handleDownload(file)}
                      deleteIcon={
                        <DeleteIcon onClick={() => handleDeleteFile(file)} />
                      }
                      style={{ margin: 1 }}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer" id="modal-footer-container">
        <Button
          id="followup-direct-comm-cancel-btn"
          variant="outlined"
          onClick={onClose}
          className="cancel-button"
          style={{ marginLeft: "20px" }}
        >
          {t("followup.fuptc_follow_up_modal_actions_cancel")}
        </Button>

        <Button
          id="followup-direct-comm-submit-btn"
          variant="contained"
          color="success"
          onClick={() => formikRefFollowUpModal.current.submitForm()}
          className="map-role-button"
          style={{ marginRight: "20px" }}
        >
          {loading?.submit ? (
            <CircularProgress size={20} color="#000" />
          ) : (
            t("followup.fuptc_follow_up_modal_actions_save")
          )}
        </Button>
      </div>
    </div>
  );
};

export default FollowUpDirectModal;
