"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";

export const getAllLeadsAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/all_lead_list`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const getLeadDetailsforLeadCount = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/user_lead_list`,
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
      message: "Fetch all leads on count data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const singleLeadDetailsAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/details`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const createSingleLeadAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/create`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const updateSingleLeadAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/update`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const getAllLeadStatusAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/lead_status_list_dd`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const singleLeadActivityDetailsAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/lead_activity`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const userLeadListDDAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/user_lead_list_dd`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const downloadSampleLeadAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/sample/lead_upload_template.csv`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const bulkLeadUploadAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/bulk_upload`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const singleLeadDeleteAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/delete`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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

export const singleFailedLeadDeleteAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/leads/failed_delete`,
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
      message: "Fetch all leads data unsuccessful",
    };
  } catch (error) {
    // console.log("log", error.response.data);
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
