import React, { useEffect, useState } from "react";

const AnalyticsIframeComponent = () => {
  return (
    <div
      style={{
        display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
        height: "100vh",
      }}
    >
      {/* <iframe
        width="100%"
        height="100%"
        src="https://lookerstudio.google.com/embed/reporting/a496226b-1e40-4cd7-8ad1-ba49be949e2a/page/p_jexzws7bod"
        frameborder="0"
        style={{ border: "none" }}
        allowfullscreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      ></iframe> */}
      <iframe
        width="100%"
        height="100%"
        src="https://lookerstudio.google.com/embed/reporting/e601b4d6-a2e4-4946-adc3-7ef54b8c8384/page/stCHF"
        frameborder="0"
        style={{ border: "none" }}
        allowfullscreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      ></iframe>
    </div>
  );
};

export default AnalyticsIframeComponent;
