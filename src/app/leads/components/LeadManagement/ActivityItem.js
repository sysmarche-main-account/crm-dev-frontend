import React from "react";
import AudioPlayer from "./AudioPlayer";

const ActivityItem = ({ activity }) => {
  return (
    <div
      className={`activity-item activity-item--${activity.type.toLowerCase()}`}
      id={`activity-item-${activity.id}`} // Unique id for the activity item
    >
      <div
        className="activity-item__header"
        id={`activity-header-${activity.id}`} // Unique id for the header section
      >
        <span className="activity-type">{activity.type}</span>
        <span className="activity-creator">{activity.creator}</span>
        <span className="activity-time">{activity.time}</span>
      </div>

      <div
        className="activity-item__content"
        id={`activity-content-${activity.id}`} // Unique id for the content section
      >
        {activity.type === "Follow-up" && (
          <>
            <h4>
              {activity.title}{" "}
              <span className="status-badge">{activity.status}</span>
            </h4>
            <p>{activity.description}</p>
          </>
        )}

        {activity.type === "Call" && (
          <>
            <AudioPlayer
              audioUrl={activity.audioUrl}
              callDuration={activity.callDuration}
            />
          </>
        )}

        {["Email", "Whatsapp"].includes(activity.type) && (
          <>
            <h4>{activity.templateTitle}</h4>
            <p>{activity.message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
