"use client";
import { useTranslations } from "next-intl";
import React from "react";

const Unauthorized = () => {
  const t = useTranslations();

  // const dispatch = useDispatch();

  // const logOutUser = async () => {
  //   try {
  //     const res = await handleLogoutAction();
  //     if (res.success && res.status === 200) {
  //       console.log("logout success!");
  //       dispatch(resetLead());
  //       dispatch(resetUser());
  //     } else {
  //       console.error(res.error);
  //     }
  //   } catch (error) {
  //     console.error("logout error", error);
  //   }
  // };

  // useEffect(() => {
  //   logOutUser();
  // }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{t("login.unauthorized_access")}</h1>
      <p>{t("login.unauthorized_page")}.</p>
    </div>
  );
};

export default Unauthorized;
