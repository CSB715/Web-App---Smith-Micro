import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { GetNotifications, auth, GetDevice } from "../utils/firestore";
import SiteModal from "../components/SiteModal";
import { Box } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";

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
  const hasMounted = useRef(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User signed in:", user.uid);
          setUserId(user.uid);
        } else {
          console.log("no user currently signed in");
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      GetNotifications(userId).then((notifsData) => {
        const notifs = notifsData.map((notification) => notification.data);
        Promise.all(
          notifs.map(async (notification) => {
            const device = await GetDevice(userId, notification.device);
            if (device) {
              return {
                ...notification,
                deviceName: device.data.name,
              };
            }
            return null;
          }),
        ).then((updatedNotifs) => {
          setNotifications(updatedNotifs.filter((n) => n !== null));
        });
      });
    }
  }, [userId]);

  return (
    <>
      <Box sx={{ paddingBottom: "72px" }}>
        <h1>Notification History</h1>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {notifications.map((notification, index) => (
            <Box
              sx={{
                borderBottom: "3px solid #000",
                borderTop: "3px solid #000",
              }}
              key={index}
            >
              <li key={index}>
                <SiteModal url={notification.siteURL} userId={userId} />
                <p>
                  {getTimeDifferenceString(notification.dateTime.toDate())} ago
                  on {notification.deviceName}
                </p>
                <p>{notification.reason}</p>
              </li>
            </Box>
          ))}
        </ul>
      </Box>
    </>
  );
}

export default Notifications;
