"use client";
import React, { useEffect, useState } from "react";
import CloseTabIcon from "@/images/close_tab.svg";
import SearchIcon from "@/images/search.svg";
import MenuIcon from "@/images/menu.svg";
import "@/styles/SideNavBar.scss";
import "@/styles/ManageRoles.scss";
import { useTranslations } from "next-intl";
import { useWindowSize } from "usehooks-ts";
import { useActiveComponent } from "@/app/(context)/ActiveComponentProvider";
import { useDispatch, useSelector } from "react-redux";
import { setSingleLeadDisplay } from "@/lib/slices/leadSlice";

const SideNavBar = ({ data, heading, onMenuClick, activeIndex }) => {
  const t = useTranslations();

  const { width = 0 } = useWindowSize();

  const { singleLeadDisplay } = useSelector((state) => state.lead);
  const dispatch = useDispatch();

  const { isCompact, toggleCompactMode } = useActiveComponent();

  const [menuItems, setMenuItems] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMenuItems = menuItems.filter((item) =>
    item?.label?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  useEffect(() => {
    if (!isCompact && width <= 768) {
      toggleCompactMode();
    }
  }, [width]);

  const handleItemClick = (index, component) => {
    onMenuClick(component, index); // Update the active component and index in Layout
  };

  return (
    <div className={`sidebar ${isCompact ? "compact" : ""}`}>
      {/* Sidebar header and search box should be hidden in compact mode */}
      {!isCompact && (
        <>
          <div className="sidebar-header">
            <h2>{heading}</h2>
            <button
              id="sidebar-close-btn"
              className="back-button"
              onClick={toggleCompactMode}
            >
              <CloseTabIcon />
            </button>
          </div>
          <div className="search-box">
            <input
              id="sidebar-main-search"
              type="text"
              name="search_sidebar_nav"
              placeholder={t("sidebar.search_phldr")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update the state on input change
              inputMode="search"
              autoComplete="new-password"
            />
            <button className="search-icon">
              <SearchIcon />
            </button>
          </div>
        </>
      )}
      {/* Hamburger Menu Icon in Compact Mode */}
      {isCompact && (
        <div
          id="sidebar-open-bar"
          className="menu-icon-wrapper"
          onClick={toggleCompactMode}
        >
          <MenuIcon />
        </div>
      )}

      <ul className="sidebar-menu">
        {filteredMenuItems.length > 0 ? (
          <>
            {filteredMenuItems.map((item, index) => (
              <li
                id={`sidebar-${index}`}
                key={index}
                className={index === activeIndex ? "active" : ""} // Add 'active' class if the item is selected
                onClick={() => {
                  if (index === 0) {
                    dispatch(setSingleLeadDisplay(false));
                    handleItemClick(index, item.component);
                  } else {
                    handleItemClick(index, item.component);
                  }
                }} // Handle item click and pass component
              >
                <span>
                  {index === activeIndex ? item.activeIcon : item.icon}
                </span>
                {/* Only show the label if not in compact mode */}
                {!isCompact && item.label}
              </li>
            ))}
          </>
        ) : (
          <li>{t("sidebar.no_items_found")}</li> // Show this if no items match the search
        )}
      </ul>
    </div>
  );
};

export default SideNavBar;
