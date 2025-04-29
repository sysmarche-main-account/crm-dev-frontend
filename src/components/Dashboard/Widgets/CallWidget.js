import React from "react";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import useLogout from "@/app/hooks/useLogout";
import { useTranslations } from "next-intl";
import OutPhoneIcon from "@/images/outPhone.svg";
import InPhoneIcon from "@/images/inPhone.svg";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";

const CallWidget = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();

  const { loadingCall, callData } = useSelector((state) => state.dashboard);
  // const [loading, setLoding] = useState({
  //   data: false,
  // });

  return (
    <div className="callWidgetContainer">
      <div className="outboundContainer">
        <div className="widgetInfo">
          <p>Total Outbound Calls</p>
          <div className="leadNumbers">
            {loadingCall ? (
              <CircularProgress size={30} sx={{ color: "#30327b" }} />
            ) : (
              <span className="leads">
                {callData?.outbound_call_attempts || 0}
              </span>
            )}
          </div>
        </div>
        <div className="outboundCallData">
          <div className="missed">
            <OutPhoneIcon />
            <div className="data">
              <p>Outbound missed</p>
              {loadingCall ? (
                <CircularProgress size={30} sx={{ color: "#30327b" }} />
              ) : (
                <span>{callData?.outbound_unsuccessful_calls || 0}</span>
              )}
            </div>
          </div>
          <div className="success">
            <OutPhoneIcon />
            <span className="data">
              <p>Outbound successful</p>
              {loadingCall ? (
                <CircularProgress size={30} sx={{ color: "#30327b" }} />
              ) : (
                <span>{callData?.outbound_successful_calls || 0}</span>
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="inboundContainer">
        <div className="widgetInfo">
          <p>Total Inbound Calls</p>
          <div className="leadNumbers">
            {loadingCall ? (
              <CircularProgress size={30} sx={{ color: "#30327b" }} />
            ) : (
              <span className="leads">
                {callData?.inbound_call_attempts || 0}
              </span>
            )}
          </div>
        </div>
        <div className="inboundCallData">
          <div className="missed">
            <InPhoneIcon />
            <div className="data">
              <p>Inbound unsuccessful</p>
              {loadingCall ? (
                <CircularProgress size={30} sx={{ color: "#30327b" }} />
              ) : (
                <span>{callData?.inbound_unsuccessful_calls || 0}</span>
              )}
            </div>
          </div>
          <div className="success">
            <InPhoneIcon />
            <span className="data">
              <p>Inbound successful</p>
              {loadingCall ? (
                <CircularProgress size={30} sx={{ color: "#30327b" }} />
              ) : (
                <span>{callData?.inbound_successful_calls || 0}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallWidget;
