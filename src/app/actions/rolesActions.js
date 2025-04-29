"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";

export const getTemplateDataAction = async (csrfToken, body) => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  // const bToken = cookieStore.get("token");

  const csrfProtection = new csrf();
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  // console.log("test", sessionToken?.value, newToken?.value, token?.value);

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
      `${process.env.BACKEND_URL_DEV}/common/fetch_role_template`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Template Data fetch unsuccessful",
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

export const getAllRolesListAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/all_role_list`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Roles List fetch unsuccessful",
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

export const getRoleListDDAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/role_list_dd`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Role DD fetch unsuccessful",
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

export const handleCreateRoleAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/create`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Role creation unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response);
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

export const handleSingleRoleDetailsAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/details`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Single User details fetch unsuccessful",
    };
  } catch (error) {
    console.log("log", error.response);
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

export const handleEditRoleAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/update`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Single User details fetch unsuccessful",
    };
  } catch (error) {
    console.log("log", error);
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

export const handleDisableRoleAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/disable`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Single User details fetch unsuccessful",
    };
  } catch (error) {
    console.log("log", error);
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

export const handleBulkDisableRoleAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/bulk_disable`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Single User details fetch unsuccessful",
    };
  } catch (error) {
    console.log("log", error);
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

export const handleDeleteRoleAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/delete`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Single User details fetch unsuccessful",
    };
  } catch (error) {
    console.log("log", error);
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

export const handleSingleCreateUserMappingAction = async (csrfToken, body) => {
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
      `${process.env.BACKEND_URL_DEV}/role/user_mapping`,
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
        // data: res.data,
        // headers: res.headers,
      };
    }
    return {
      success: false,
      status: res.status,
      message: "Single Role mapping unsuccessful",
    };
  } catch (error) {
    console.log("log", error);
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
