"use client";
import React, { useState, useRef, useEffect } from "react";
import { useActiveComponent } from "@/app/(context)/ActiveComponentProvider";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Box,
  Typography,
  Dialog,
  DialogContent, // Import DialogContent here
  Grid2 as Grid,
  Slide,
  Chip,
  CircularProgress,
  Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Menu as MenuIcon } from "@mui/icons-material";
import SearchIcon from "@/images/search.svg";
import BellIcon from "@/images/bell.svg";
import HelpIcon from "@/images/help-square-contained.svg";
import LogoutIcon from "@/images/logout.svg";
import FullLogo from "@/images/headerLogoFull.svg";
import HalfLogo from "@/images/headerLogoHalf.svg";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { makeStyles } from "@mui/styles";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import "@/styles/Header.scss";
import "../../../src/styles/theme/commonTheme.scss";
import { useDispatch, useSelector } from "react-redux";
import { handleLogoutAction } from "@/app/actions/authActions";
import useLogout from "@/app/hooks/useLogout";
import NotificationModal from "../NotificationCards/NotificationModal";
import { headerMap } from "@/utils/iconsAndComponents";
import { IOSSwitch } from "../Utils";
import { useSnackbar } from "@/app/(context)/SnackbarProvider";
import {
  handleEditUserAction,
  handleUserStatusAction,
} from "@/app/actions/userActions";
import { getCsrfToken } from "@/app/actions/getCsrfToken";
import { decryptClient } from "@/utils/decryptClient";
import { setDetails } from "@/lib/slices/userSlice";
import { setSingleLeadDisplay } from "@/lib/slices/leadSlice";

const useStyles = makeStyles((theme) => ({
  logoSection: {
    // width: "280px",
    height: "80px",
    backgroundColor: "#2a3362",
  },
  compactMode: {
    width: "80px !important", // Width for compact mode
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "36px",
    "& a": {
      textDecoration: "none",
      fontFamily: "Inter",
      lineHeight: "25px",
      "&:hover": {
        color: "#000",
      },
    },
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
    flexDirection: "row-reverse",
    padding: "8px",
    width: "220px",
    height: "15px",
    borderRadius: "200px",
    border: "1px solid #D2D2D2",
    background: "#F3F3F3",
    "& input": {
      fontSize: "14px",
      outline: "none",
      border: "none",
      width: "200px",
      background: "none",
    },
  },

  iconButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  ToolbarWrapper: {
    margin: "0 !important",
    padding: "0 !important",
  },
  navIconset: {
    position: "fixed",
    top: "17px",
    right: "45px",
  },
}));

const HeaderNew = () => {
  const logout = useLogout();
  const { showSnackbar } = useSnackbar();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const { isCompact, handleMenuClick } = useActiveComponent();
  const theme = useTheme(); // Access theme
  const classes = useStyles();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Check if in mobile view
  const isWideScreen = useMediaQuery("(max-width: 1500px)");

  const { details } = useSelector((state) => state.user);

  const { setLogoutLoading } = useActiveComponent();

  const { permissions } = useSelector((state) => state.user);

  const [loading, setLoading] = useState({
    busy: false,
  });

  const [anchorElNotification, setAnchorElNotification] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const [openNotification, setOpenNotification] = useState(false);

  const handleOpenNotification = (event) => {
    setAnchorElNotification(event.currentTarget);
  };

  const handleCloseNotification = () => {
    setAnchorElNotification(null);
  };

  const searchInputRef = useRef(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await handleLogoutAction();
      if (res.success && res.status === 200) {
        await logout();
        console.log("logout success!");
      } else {
        await logout();
        console.error(res.error);
      }
    } catch (error) {
      await logout();
      console.error("logout error", error);
    }
    handleProfileMenuClose();
  };

  const handleNavigationClick = (href) => {
    console.log("added for test..");
    router.push(href);
    handleMobileMenuClose();
  };

  const handleSearchDialogOpen = () => {
    setIsSearchDialogOpen(true);
  };

  const handleSearchDialogClose = () => {
    setIsSearchDialogOpen(false);
  };

  useEffect(() => {
    if (isSearchDialogOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchDialogOpen]);

  const handleSidebar = (path) => {
    console.log("p", path);
    if (path.id === 2) {
      const firstComp = permissions?.settingsSideNav[0].id;
      handleMenuClick(headerMap[firstComp].component, 0);
    } else if (path.id === 3) {
      const firstComp = permissions?.leadSideNav[0].id;
      handleMenuClick(headerMap[firstComp].component, 0);
      console.log("hit");
      dispatch(setSingleLeadDisplay(false));
    } else if (path.id === 71) {
      const firstComp = permissions?.marketSideNav[0].id;
      handleMenuClick(headerMap[firstComp].component, 0);
    }
  };

  const handleBusyStatus = async () => {
    // console.log("Role disabled:", selectedRowDetails);
    setLoading((prev) => ({ ...prev, busy: true }));
    const csrfToken = await getCsrfToken();
    const reqbody = {
      uuid: details?.uuid,
      busy_status: details?.busy_status === 0 ? 1 : 0,
    };
    console.log("body", reqbody);

    //Logic to activate user
    try {
      const result = await handleUserStatusAction(csrfToken, reqbody);
      // console.log("activate user result:", result);

      if (result.success && result.status === 200) {
        const { iv, encryptedData } = result?.data;
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        const decrypted = decryptClient(iv, encryptedData, key);
        console.log("final", decrypted);

        setLoading((prev) => ({ ...prev, busy: false }));
        const token = details?.session_token;
        dispatch(setDetails({ session_token: token, ...decrypted }));
      } else {
        console.error(result.error);
        setLoading((prev) => ({ ...prev, busy: false }));
        if (result.error.status === 500) {
          await logout();
        } else if (typeof result.error.message === "string") {
          showSnackbar({
            message: `${result.error.message}`,
            severity: "error",
            anchorOrigin: { vertical: "top", horizontal: "center" },
          });
        } else if (
          typeof result.error.message === "object" &&
          result.error.message !== null
        ) {
          let errValues = Object.values(result.error.message);
          if (errValues.includes("Token expired")) {
            getToken();
            window.location.reload();
          } else if (errValues.length > 0) {
            errValues.map((errmsg) => {
              showSnackbar({
                message: `${errmsg}`,
                severity: "error",
                anchorOrigin: { vertical: "top", horizontal: "center" },
              });
            });
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading((prev) => ({ ...prev, busy: false }));
    }
  };

  return (
    <>
      <AppBar
        position="static"
        color="default"
        sx={{ backgroundColor: "#fff" }}
      >
        <Container maxWidth={false} style={{ padding: 0 }}>
          <Toolbar
            sx={{
              padding: "0px !important",
              display: "flex",
              justifyContent: "space-between",
              gap: { xs: "10px", md: "0px" }, // Adjusts gap for smaller screens
              "@media (max-width: 1130px)": {
                gap: "10px", // Reduces space between divs
              },
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Box
                className={`${classes.logoSection} ${
                  isCompact ? classes.compactMode : ""
                }`}
                sx={{ width: isMobile ? "80px" : "280px" }}
              >
                {isCompact || isMobile ? <HalfLogo /> : <FullLogo />}
              </Box>
              {!isMobile ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexGrow: 1,
                      flexWrap: "wrap",
                      alignItems: "center", // Keep items aligned
                      justifyContent: "flex-start", // Avoid large gaps
                      gap: { xs: 1, md: 1.5, lg: 3 },
                      marginX: { xs: 1, sm: 2, md: 2 },
                      overflowX: "auto", // Prevent overflow
                    }}
                  >
                    {permissions?.pages?.map((path) => (
                      <Link
                        id={`header-${path?.name}`}
                        key={path?.id}
                        // href={`/${path?.name?.toLowerCase()}`}
                        href={`/${
                          path?.name?.toLowerCase() === "api"
                            ? "apis"
                            : path?.name?.toLowerCase()
                        }`}
                        passHref
                        legacyBehavior
                      >
                        <Typography
                          variant="button"
                          sx={{
                            // marginRight: "36px",
                            cursor: "pointer",
                            textDecoration: "none",
                            color:
                              pathname ===
                              `/${
                                path?.name?.toLowerCase() === "api"
                                  ? "apis"
                                  : path?.name?.toLowerCase()
                              }`
                                ? "#007143"
                                : "#7D7D7D",
                            backgroundColor:
                              pathname ===
                              `/${
                                path?.name?.toLowerCase() === "api"
                                  ? "apis"
                                  : path?.name?.toLowerCase()
                              }`
                                ? "#CCF2E2"
                                : "transparent",
                            borderRadius: "6px",
                            textTransform: "capitalize",
                            fontSize: "16px",
                            fontFamily: "Inter",
                            padding:
                              pathname ===
                              `/${
                                path?.name?.toLowerCase() === "api"
                                  ? "apis"
                                  : path?.name?.toLowerCase()
                              }`
                                ? "0px 10px"
                                : "0",
                          }}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent the default behavior of the link
                            const targetPath = `/${
                              path?.name?.toLowerCase() === "api"
                                ? "apis"
                                : path?.name?.toLowerCase()
                            }`;

                            if (
                              pathname === targetPath &&
                              [2, 3, 71].includes(path.id)
                            ) {
                              // If already on the same path, call the custom function
                              handleSidebar(path);
                            } else {
                              // Navigate to the new path
                              router.push(targetPath);
                            }
                          }}
                        >
                          {path?.name}
                        </Typography>
                      </Link>
                    ))}
                  </Box>
                </>
              ) : (
                <>
                  <IconButton
                    id="header-links-menu"
                    edge="start"
                    color="inherit"
                    onClick={handleMobileMenuOpen}
                    sx={{ marginLeft: "0px" }}
                  >
                    <MenuIcon />
                  </IconButton>
                </>
              )}
            </div>

            <Box
              sx={{
                display: "flex",
                alignItems: isMobile ? "flex-start" : "center",
                marginRight: 5,
              }}
            >
              {!isMobile ? (
                <Chip
                  id="header-status-chip"
                  sx={{
                    width: details?.busy_status === 0 ? 125 : 141,
                    height: 33,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#000",
                  }}
                  label={
                    loading.busy ? (
                      <CircularProgress size={18} color="#000" />
                    ) : details?.busy_status === 0 ? (
                      "Available"
                    ) : (
                      "Not Available"
                    )
                  }
                  onDelete={() => handleBusyStatus()}
                  deleteIcon={
                    <IOSSwitch
                      checked={!details?.busy_status}
                      // onChange={() => handleBusyStatus()}
                      color="success"
                    />
                  }
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0px 5px",
                  }}
                >
                  <span style={{ fontSize: 10, color: "#000" }}>
                    {loading.busy ? (
                      <CircularProgress size={10} color="#000" />
                    ) : details?.busy_status === 0 ? (
                      "Available"
                    ) : (
                      "Not Available"
                    )}
                  </span>
                  <IOSSwitch
                    id="header-status-switch"
                    checked={!details?.busy_status}
                    onChange={() => handleBusyStatus()}
                    color="success"
                  />
                </div>
              )}

              <IconButton
                id="header-help"
                color="inherit"
                sx={{ margin: "0px 5px" }}
                onClick={() =>
                  window.open(
                    "https://docs.google.com/forms/d/e/1FAIpQLSfWFPlDi4XWHYPgOfrikpcJ74_rh0QQL1IQPiJkpst3bbqiFA/viewform",
                    "_blank"
                  )
                }
              >
                <HelpIcon />
              </IconButton>

              {/* <IconButton
                id="header-notification"
                color="inherit"
                sx={{ margin: "0px 5px" }}
                onClick={handleOpenNotification}
              >
                <BellIcon />
              </IconButton> */}

              <Stack direction="row" spacing={2} sx={{ margin: "0px 5px" }}>
                <Avatar
                  id="header-profile-menu"
                  sx={{
                    bgcolor: !details?.profile_img ? "#BFFA7D" : null,
                    color: !details?.profile_img ? "#6CB11F" : null,
                    border: !details?.profile_img
                      ? "0.8px solid #8AF611"
                      : null,
                  }}
                  style={{ fontSize: "14px" }}
                  onClick={handleProfileMenuOpen}
                  src={details?.profile_img}
                  alt={`${details?.first_name} ${details?.last_name}`}
                >
                  {!details?.profile_img &&
                  details?.first_name &&
                  details?.last_name
                    ? `${details?.first_name[0].toUpperCase()}${details?.last_name[0].toUpperCase()}`
                    : null}
                </Avatar>
              </Stack>
            </Box>
          </Toolbar>

          {isMobile && (
            <Menu
              id="header-links-list-menu"
              anchorEl={mobileMenuAnchorEl}
              open={Boolean(mobileMenuAnchorEl)}
              onClose={handleMobileMenuClose}
            >
              {permissions?.pages?.map((path, index) => (
                <MenuItem
                  id={`header-dd-${path?.name}`}
                  key={path.id}
                  onClick={() =>
                    handleNavigationClick(`/${path?.name?.toLowerCase()}`)
                  }
                >
                  {path?.name}
                  {/* {t(`header.nav_links.${path.slice(1)}`)} */}
                </MenuItem>
              ))}
            </Menu>
          )}

          <Menu
            id="header-profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            className="tooltip-logout-section"
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              sx={{
                width: "272px",
                "&:hover, &:focus": {
                  backgroundColor: "transparent", // Remove background on hover/focus
                },
              }}
            >
              <div className="logout-content">
                <Stack direction="row" spacing={2}>
                  <Avatar
                    // sx={{
                    //   bgcolor: "#BFFA7D",
                    //   color: "#6CB11F",
                    //   border: "0.8px solid #8AF611",
                    // }}
                    style={{ fontSize: "14px" }}
                    // onClick={handleProfileMenuOpen}
                    src={details?.profile_img}
                    alt={`${details?.first_name} ${details?.last_name}`}
                  >
                    {!details?.profile_img &&
                    details?.first_name &&
                    details?.last_name
                      ? `${details?.first_name[0].toUpperCase()}${details?.last_name[0].toUpperCase()}`
                      : null}
                  </Avatar>
                  <div className="tooltip-section-details">
                    <p className="logout-username" title={details?.first_name}>
                      {details?.first_name}
                    </p>
                    <p className="logout-useremail" title={details?.email}>
                      {details?.email}
                    </p>
                  </div>
                </Stack>
              </div>
            </MenuItem>
            <div className="logout-button-section">
              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="logout-button"
              >
                <LogoutIcon />
                {t("login.header_nav_links")}
              </button>
            </div>
          </Menu>
        </Container>
      </AppBar>

      <NotificationModal
        anchorElNotification={anchorElNotification}
        handleCloseNotification={handleCloseNotification}
      />
    </>
  );
};

export default HeaderNew;
