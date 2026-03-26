import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAuthInstance, getDb } from "../utils/firestore";
import SiteModal from "../components/SiteModal";
import { Box, Typography } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { collection, Timestamp } from "firebase/firestore";
import { type Notification } from "../utils/models";
import { onSnapshot } from "firebase/firestore";

type FirestoreNotification = {
  id: string;
  data: {
    siteUrl?: string;
    deviceName?: string;
    reason?: string;
    dateTime?: Timestamp | Date;
  };
};

function normalizeNotification(d: FirestoreNotification): Notification | null {
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

    const notifsRef = collection(getDb(), "Users", userId, "Notifications");
    const unsubscribe = onSnapshot(notifsRef, (snapshot) => {
      const normalized = snapshot.docs
        .map((doc) => normalizeNotification({ id: doc.id, data: doc.data() }))
        .filter((n): n is Notification => n !== null)
        .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()); // sort newest first
      setNotifications(normalized);
    });
    return unsubscribe;
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
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUserId(user.uid);
        setAuthReady(true);
      } else {
        navigate("/login", { replace: true });
        setAuthReady(true);
      }
    });

    return unsubscribe;
  }, [navigate]);

  const notifications = useNotifications(userId || "");

  if (!authReady) return <p>Loading...</p>;

  return (
    <>
      <Box sx={{ paddingBottom: "72px" }}>
        <Typography 
          variant="h1" 
          id="notification-title" 
          sx={{ 
            fontSize: "2rem",
            mb: 2,
            fontWeight: "bold",
            color: "#01579b",
            alignSelf: "center",
            textAlign: "center",
          }}
        >
          Notification History
        </Typography>

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
                <SiteModal
                  url={notification.siteUrl}
                />
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
