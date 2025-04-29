"use client";
import Profile from "@/components/Profile";
import { createContext, useContext, useState } from "react";

// Create the context
const ActiveComponentContext = createContext();

// Create a provider component
export const ActiveComponentProvider = ({ children }) => {
  const [settings, setSettings] = useState(false);
  const [activeComponent, setActiveComponent] = useState(<Profile />);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleMenuClick = (component, index) => {
    setActiveComponent(component);
    setActiveIndex(index);
  };

  const handleSetting = () => setSettings(!settings);

  const toggleCompactMode = () => {
    setIsCompact(!isCompact);
  };

  return (
    <ActiveComponentContext.Provider
      value={{
        activeComponent,
        activeIndex,
        handleMenuClick,
        settings,
        handleSetting,
        isCompact,
        toggleCompactMode,
        logoutLoading,
        setLogoutLoading,
      }}
    >
      {children}
    </ActiveComponentContext.Provider>
  );
};

// Create a hook for easier access to the context
export const useActiveComponent = () => useContext(ActiveComponentContext);
