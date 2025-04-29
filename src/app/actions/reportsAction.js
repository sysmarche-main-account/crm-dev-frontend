"use server";
import { encrypt } from "@/utils/encryption";
import axios from "axios";
import csrf from "csrf";
import { cookies } from "next/headers";
import { checkAndRefreshToken } from "./checkAndRefreshTokenAction";



export const getIvrCallingReport = async (csrfToken, body) => {

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
        console.log(`${process.env.BACKEND_URL_DEV}/ivr/get_ivr_calling_report` , "url");
        
        const res = await axios.post(`${process.env.BACKEND_URL_DEV}/ivr/get_ivr_calling_report`,
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



export const counselorCallDurationReport = async (csrfToken, body) => {
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
            `${process.env.BACKEND_URL_DEV}/ivr/get_counselor_wise_call_duration`,
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


export const dumpReport = async (csrfToken, body) => {
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

        console.log("bToken", bToken);

        const res = await axios.post(
            `${process.env.BACKEND_URL_DEV}/ivr/get_ivr_dump_report`,
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


