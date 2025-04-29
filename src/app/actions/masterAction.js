"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";

export const getAllMasterDataAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

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
      `${process.env.BACKEND_URL_DEV}/common/get_master_dd`,
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
      };
    }

    return {
      success: false,
      status: res.status,
      message: "Master data fetch unsuccessful",
    };
  } catch (error) {
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

export const createMasterDataAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: { message: "Unauthorized", status: 401 },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      `${process.env.BACKEND_URL_DEV}/master/create`,
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
      return { success: true, status: res.status, data: encrypted };
    }
    return {
      success: false,
      status: res.status,
      message: "Master data creation unsuccessful",
    };
  } catch (error) {
    console.error("Backend Error (createMasterDataAction):", error.response);
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Unknown backend error",
        status: error.response?.status || 500,
        data: error.response?.data || null,
      },
    };
  }
};

export const updateMasterDataAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: { message: "Unauthorized", status: 401 },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      `${process.env.BACKEND_URL_DEV}/master/update`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );

    if (res.status === 200 || res.status === 201) {
      const encrypted = encrypt(res.data);
      return { success: true, status: res.status, data: encrypted };
    }
    return {
      success: false,
      status: res.status,
      message: "Master data update unsuccessful",
    };
  } catch (error) {
    console.error("Backend Error (updateMasterDataAction):", error.response);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    };
  }
};

export const deleteMasterDataAction = async (csrfToken, id) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

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
      `${process.env.BACKEND_URL_DEV}/master/delete`,
      { id },
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
      };
    }

    return {
      success: false,
      status: res.status,
      message: "Master data deletion unsuccessful",
    };
  } catch (error) {
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

export const updateMasterStatusAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return {
      success: false,
      error: { message: "Unauthorized", status: 401 },
    };
  }

  try {
    const bToken = await checkAndRefreshToken();
    const res = await axios.post(
      `${process.env.BACKEND_URL_DEV}/master/update_status`,
      body,
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
        },
      }
    );

    if (res.status === 200 || res.status === 201) {
      const encrypted = encrypt(res.data);
      return { success: true, status: res.status, data: encrypted };
    }
    return {
      success: false,
      status: res.status,
      message: "Master status update unsuccessful",
    };
  } catch (error) {
    console.error("Backend Error (updateMasterStatusAction):", error.response);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    };
  }
};

export const getMasterListAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

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
      `${process.env.BACKEND_URL_DEV}/master/get_master_list`,
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
      };
    }

    return {
      success: false,
      status: res.status,
      message: "Master list fetch unsuccessful",
    };
  } catch (error) {
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

export const fetchMasterData = async (identifier, token) => {
  const response = await fetch("/api/master-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ identifier }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master data");
  }

  return await response.json();
};

export const handleCreateMasterSubmit = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

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
      `${process.env.BACKEND_URL_DEV}/master/create`,
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
      };
    }

    return {
      success: false,
      status: res.status,
      error: {
        message: res.data?.message || "Master creation failed",
      },
    };
  } catch (error) {
    console.error("Error in handleCreateMasterSubmit:", error.response);
    return {
      success: false,
      error: {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    };
  }
};

export const getMasterDDAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");

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
      `${process.env.BACKEND_URL_DEV}/common/get_master_dd`,
      {
        ...body,
        pagination: {
          page: body.pagination?.page || 1, // Default to page 1
          per_page: body.pagination?.per_page || 10, // Default to 10 records per page
        },
      },
      {
        headers: {
          Authorization: `Bearer ${bToken?.value}`,
          "session-token": sessionToken?.value,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status === 200) {
      const encrypted = encrypt(res.data);
      const paginationInfo = res.data.pagination || {}; // Extract pagination info if provided
      return {
        success: true,
        status: res.status,
        data: encrypted,
        pagination: {
          currentPage: paginationInfo.current_page || 1,
          totalPages: paginationInfo.total_pages || 1,
          totalRecords: paginationInfo.total_records || 0,
          perPage: paginationInfo.per_page || 10,
        },
      };
    }

    return {
      success: false,
      status: res.status,
      message: "Master dropdown data fetch unsuccessful",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || "Unexpected error",
        status: error.response?.data?.error_code || 500,
        data: error.response?.data,
      },
    };
  }
};
