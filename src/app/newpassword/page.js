"use client";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import NewPassword from "@/components/NewPassword/NewPassword";
import { useEffect } from "react";
import { getToken } from "@/utils/getToken";
import { routeIds } from "@/utils/routeIds";

const page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { details, permissions } = useSelector((state) => state.user);
  const token = searchParams.get("token");

  const getBToken = async () => {
    await getToken();
  };

  useEffect(() => {
    if (
      details?.session_token &&
      details?.session_token?.length > 0 &&
      details?.email &&
      details?.first_name &&
      permissions?.pages?.length > 0 &&
      token?.length === 0
    ) {
      let rids = permissions?.pages;
      if (rids.length > 0 && rids.some((item) => item.id === 1)) {
        router.push("/dashboard", { scroll: false });
      } else {
        let routeTosend = routeIds[rids[0]?.id];
        router.push(`${routeTosend}`, { scroll: false });
      }
    } else if (
      !details?.session_token &&
      !details?.email &&
      !permissions?.pages &&
      token?.length === 0
    ) {
      router.push("/", { scroll: false });
    } else if (
      !details?.session_token &&
      !details?.email &&
      token?.length > 0
    ) {
      getBToken();
    }
  }, [details, token, router]);

  return (
    <>
      <NewPassword />
    </>
  );
};

export default page;
