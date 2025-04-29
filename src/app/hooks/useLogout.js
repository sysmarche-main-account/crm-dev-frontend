// hooks/useLogout.js
// import { resetBearer } from "@/lib/slices/bearerSlice";
import { resetLead } from "@/lib/slices/leadSlice";
import { resetUser } from "@/lib/slices/userSlice";
// import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { getCsrfToken } from "../actions/getCsrfToken";

const useLogout = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const logout = async () => {
    const csrfToken = await getCsrfToken();
    try {
      // Delete the cookies via API
      const response = await fetch("/api/cookie", {
        method: "DELETE",
        headers: {
          "csrf-token": csrfToken,
        },
      });

      if (response.ok) {
        // Reset Redux state
        dispatch(resetLead());
        dispatch(resetUser());
        // dispatch(resetBearer());

        // Navigate to home
        router.push("/");
        console.log("Logout successful.");
      } else {
        console.error("Failed to delete cookies:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return logout;
};

export default useLogout;
