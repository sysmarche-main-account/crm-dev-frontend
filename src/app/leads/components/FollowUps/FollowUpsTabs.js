"use client";
import React, { useState } from "react";
import ListIcon from "@/images/list.svg";
import CalendarListIcon from "@/images/calendar-tabs.svg";
import CalendarListActiveIcon from "@/images/calendar-active.svg";
import ListActiveIcon from "@/images/list-active.svg";
import FollowUpCalendar from "./FollowUpCalendar";
import FollowUpsTableContent from "./FollowUpsTableContent";
import { useTranslations } from "next-intl";

function FollowUpsTabs() {
  const t = useTranslations();
  const [view, setView] = useState("list");
  const [showSelectOption, setShowSelectOption] = useState(false);

  return (
    <>
      {showSelectOption && (
        <div className="toggle-view">
          <button
            id="followup-select-view-list-btn"
            className={`toggle-view__button ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            <span>{view === "list" ? <ListIcon /> : <ListActiveIcon />}</span>
            {t("followup.fut_list_view")}
          </button>
          <button
            id="followup-select-view-calendar-btn"
            className={`toggle-view__button ${
              view === "calendar" ? "active" : ""
            }`}
            onClick={() => setView("calendar")}
          >
            <span>
              {view === "calendar" ? (
                <CalendarListActiveIcon />
              ) : (
                <CalendarListIcon />
              )}
            </span>
            {t("followup.fut_calendar_view")}
          </button>
        </div>
      )}

      {view === "list" ? (
        <FollowUpsTableContent setShowSelectOption={setShowSelectOption} />
      ) : (
        <FollowUpCalendar />
      )}
    </>
  );
}

export default FollowUpsTabs;
