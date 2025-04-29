"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";

export const uploadMarketingCsvAction = async (csrfToken, formData) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/marketing/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);

    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const getAllUploadListAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/marketing/upload-index`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const downloadFailedUploadListActon = async (csrfToken, filename) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.get(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/marketing/${filename}`,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const downloadSampleAction = async (csrfToken) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.get(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/marketing/marketing_template.csv`,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const getAllCriteriaListAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.get(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/criteria`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const getAllConditionListAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.get(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/condition`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const getCountAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  // console.log("boy", body);

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/marketing/data/count`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const getAllDownloadListAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/marketing/download-index`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};

export const exportRecordsAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        status: 401,
      },
    };
  }

  // console.log(
  //   "boy",
  //   body,
  //   `${process.env.BACKEND_URL_DEV_MDM}/marketing/data/count`
  // );

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      // `${process.env.BACKEND_UAT_URL}/api/users`,
      `${process.env.BACKEND_URL_DEV_MDM}/marketing/data/export`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );
    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      return {
        success: true,
        status: res.status,
        data: encrypted,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Fetch all user data unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response.data);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.data?.error_code,
        data: error.response?.data,
      },
    };
  }
};
