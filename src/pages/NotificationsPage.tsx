// Notifications Page Component
// STUB

import { useEffect, useState } from "react";
import { GetDoc, GetDocs } from "../utils/firestore";
import SiteModal from "../components/SiteModal";

function getTimeDifferenceString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs > 1000 * 60 * 60 * 24) {
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }
  if (diffMs > 1000 * 60 * 60) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  }
  if (diffMs > 1000 * 60) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  }
  return `${Math.floor(diffMs / 1000)} second${Math.floor(diffMs / 1000) !== 1 ? "s" : ""}`;
}

function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    GetDocs("Users/7LpcmhJK1QCWn9ETqLN5/Notifications").then(
      (querySnapshot) => {
        const notificationsData = querySnapshot.map(
          (notification) => notification.data,
        );
        setNotifications(notificationsData);
      },
    );
  }, []);
  return (
    <>
      <h1>Notification History</h1>
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {notifications.map((notification, index) => (
          <li key={index}>
            <SiteModal
              url={notification.siteURL}
              user_id="7LpcmhJK1QCWn9ETqLN5"
            />
            <p>
              {getTimeDifferenceString(notification.dateTime.toDate())} ago on{" "}
              {notification.deviceName}
            </p>
            <p>{notification.reason}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Notifications;
