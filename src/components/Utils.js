import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL;
export const LOGIN_ENDPOINT = "";
export const SIGNUP_ENDPOINT = "";

// Function to get an item from localStorage
export function getLocalStorageItem(key) {
  return JSON.parse(localStorage.getItem(key));
}

// Function to set an item in localStorage
export function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Function to remove an item from localStorage
export function removeLocalStorageItem(key) {
  localStorage.removeItem(key);
}

export const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme, color }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        background:
          color === "success"
            ? "linear-gradient(180deg, #00BC70 0%, #06C175 79.91%, #20D48B 100%)"
            : "#29339B",
        // backgroundColor: "#29339B",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          background:
            color === "success"
              ? "linear-gradient(180deg, #009C5D 0%, #007A4C 100%)"
              : "#2ECA45",
          // backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: color === "success" ? "#e74c3c;" : "#8E8B8B",
    // backgroundColor: "#8E8B8B",
    // backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));
