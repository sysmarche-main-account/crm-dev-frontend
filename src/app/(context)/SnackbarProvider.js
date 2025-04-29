"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertSuccess from "../../../public/images/alertSuccess.svg";
import AlertError from "../../../public/images/alertError.svg";
import AlertDelete from "../../../public/images/alertDelete.svg";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const iconMapping = {
    success: <AlertSuccess />,
    error: <AlertError />,
    delete: <AlertDelete />,
    disable: <AlertError />,
  };
  const [snackbars, setSnackbars] = useState([]);

  const showSnackbar = ({
    message,
    severity = "success",
    duration = 5000,
    anchorOrigin = { vertical: "top", horizontal: "right" },
  }) => {
    setSnackbars((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random()}`,
        message,
        severity,
        duration,
        anchorOrigin,
      },
    ]);
  };

  // const removeSnackbar = useCallback((key) => {
  //   setSnackbars((prev) => prev.filter((snackbar) => snackbar.key !== key));
  // }, []);

  const removeSnackbar = (keyToRemove) => {
    setSnackbars((prevSnackbars) =>
      prevSnackbars.filter((snackbar) => snackbar.key !== keyToRemove)
    );
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbars.map(
        ({ key, message, severity, duration, anchorOrigin }, idx) => (
          <Snackbar
            key={key}
            open
            autoHideDuration={duration}
            onClose={() => removeSnackbar(key)}
            anchorOrigin={anchorOrigin}
            style={{
              top:
                anchorOrigin.horizontal === "center"
                  ? `${120 + idx * 60}px`
                  : `${8 + idx * 60}px`,
            }}
          >
            <Alert
              className={`alert-${
                severity === "delete" || severity === "error"
                  ? "error"
                  : "success"
              } ${
                anchorOrigin?.horizontal === "center"
                  ? "full-width"
                  : "small-width"
              } `}
              onClose={() => removeSnackbar(key)}
              severity={severity}
              variant="outlined"
              icon={iconMapping[severity]}
            >
              {/* {message} */}
              <span dangerouslySetInnerHTML={{ __html: message }} />
            </Alert>
          </Snackbar>
        )
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
