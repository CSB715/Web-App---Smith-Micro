// Notifications Page Component
// STUB

import { useEffect, useState } from "react";
import { GetDocs } from "../utils/firestore";

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
      {/* Notifications Page Content */}
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {notifications.map((notification, index) => (
          <li key={index}>
            <p>{notification.siteURL}</p>
            <p>{notification.dateTime.toDate().toDateString()}</p>
            <p>{notification.reason}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Notifications;
