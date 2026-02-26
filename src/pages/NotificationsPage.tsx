import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetNotifications, auth } from "../utils/firestore";
import SiteModal from "../components/SiteModal";
import { Box } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { type Notification } from "../utils/models";

type FirestoreNotification = {
  id: string;
  data: {
    siteUrl?: string;
    deviceName?: string;
    reason?: string;
    dateTime?: Timestamp | Date;
  };
};


function normalizeNotification(
  d: FirestoreNotification,
): Notification | null {
  if (
    !d.data.siteUrl ||
    !d.data.deviceName ||
    !d.data.reason ||
    !d.data.dateTime
  ) {
    return null;
  }

  return {
    id: d.id,
    siteUrl: d.data.siteUrl,
    deviceName: d.data.deviceName,
    reason: d.data.reason,
    dateTime:
      d.data.dateTime instanceof Date
        ? d.data.dateTime
        : d.data.dateTime.toDate(),
  };
}

function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    GetNotifications(userId).then((data) => {
      const normalized = data
        .map((n) => normalizeNotification(n))
        .filter((n): n is Notification => n !== null)
        .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()); // sort newest first

      setNotifications(normalized);
    });
  }, [userId]);

  return notifications;
}


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
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const notifications = useNotifications(user.uid);
        setNotifications(notifications);
        setAuthReady(true);
      } else {
        navigate("/login", { replace: true });
        setAuthReady(true);
      }
    });

    return unsubscribe;
  }, [navigate]);


  if (!authReady) return <p>Loading...</p>;
    
  return (
    <>
      <Box sx={{ paddingBottom: "72px" }}>
        <h1>Notification History</h1>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {notifications.map((notification) => (
            <Box
              sx={{
                borderBottom: "3px solid #000",
                borderTop: "3px solid #000",
              }}
              key={notification.id}
            >
              <li key={notification.id}>
                <SiteModal url={notification.siteUrl} userId={userId ? userId : ""} />
                <p>
                  {getTimeDifferenceString(notification.dateTime)} ago on{" "}
                  {notification.deviceName}
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
