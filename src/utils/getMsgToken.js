// import { getCsrfToken } from "./getCsrfTokenNotuse.js";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { getMessageTokenAction } from "@/app/actions/communicationAction";

export const getMsgToken = async () => {
  try {
    const csrfToken = await getCsrfToken();
    const result = await getMessageTokenAction(csrfToken);

    if (result.success && result.status === 200) {
      //   const { iv, encryptedData } = result?.data;
      //   const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

      //   if (!key) {
      //     throw new Error("Encryption key is not defined");
      //   }

      //   const decrypted = decryptClient(iv, encryptedData, key);
      console.log("msg token set");
      return { value: result?.data?.access_token };
    }

    return null;
  } catch (error) {
    console.error("Unable to get msg token", error);
    return null;
  }
};
